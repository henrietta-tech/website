// Supabase Edge Function: register
// Deploy: supabase functions deploy register
//
// What this does:
// 1. Validates input
// 2. Rate limits by IP
// 3. Catches honeypot bots
// 4. Inserts contact
// 5. Sends verification email
//
// What this doesn't do:
// - Fingerprinting (add if you see abuse)
// - Event sourcing (overkill for now)
// - Encrypted storage (add at 1k+ contacts)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Rate limit: 5 submissions per IP per hour
const RATE_LIMIT = 5;

// Disposable email domains (expand as needed)
const DISPOSABLE = new Set([
  'tempmail.com', 'throwaway.com', 'mailinator.com', '10minutemail.com',
  'guerrillamail.com', 'sharklasers.com', 'yopmail.com', 'maildrop.cc'
]);

// Hash prefix must match schema: 'henrietta:' + email
const HASH_PREFIX = 'henrietta:';

async function hashEmail(email: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(HASH_PREFIX + email.toLowerCase().trim());
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  
  try {
    const body = await req.json();
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // ===== HONEYPOT =====
    // If bot filled the hidden field, pretend success
    if (body.website) {
      return success();
    }

    // ===== VALIDATION =====
    const email = body.email?.toLowerCase().trim();
    const zip = body.zipCode?.trim();

    if (!email || !zip) {
      return error('Email and ZIP code are required', 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return error('Invalid email format', 400);
    }

    if (!/^\d{5}$/.test(zip)) {
      return error('ZIP code must be 5 digits', 400);
    }

    const domain = email.split('@')[1];
    if (DISPOSABLE.has(domain)) {
      return error('Please use a permanent email address', 400);
    }

    // ===== RATE LIMIT =====
    const { count } = await supabase
      .from('registry_rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

    if ((count || 0) >= RATE_LIMIT) {
      return error('Too many requests. Try again later.', 429);
    }

    // Log this attempt
    await supabase.from('registry_rate_limits').insert({ ip_address: ip });

    // ===== CHECK DUPLICATE (using hash, not raw email) =====
    const emailHash = await hashEmail(email);
    
    const { data: existing } = await supabase
      .from('registry_contacts')
      .select('id, email_verified')
      .eq('email_hash', emailHash)
      .single();

    if (existing) {
      // Already exists - resend verification if unverified
      if (!existing.email_verified) {
        await sendVerificationEmail(supabase, existing.id, email);
      }
      return success(); // Don't reveal duplicate
    }

    // ===== INSERT =====
    const wantsEmail = body.contactPreference?.toLowerCase() === 'yes';

    const { data: contact, error: insertError } = await supabase
      .from('registry_contacts')
      .insert({
        email,
        zip_code: zip,
        dpc_status: normalize(body.dpcStatus, ['yes', 'no'], 'unsure'),
        contact_preference: normalize(body.contactPreference, ['yes', 'no'], 'later'),
        email_consent: wantsEmail,
        email_consent_at: wantsEmail ? new Date().toISOString() : null,
        referral_source: body.referralSource || null,
        utm_source: body.utmSource || null,
        utm_medium: body.utmMedium || null,
        utm_campaign: body.utmCampaign || null,
      })
      .select('id, verification_token')
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return error('Registration failed. Please try again.', 500);
    }

    // ===== SEND VERIFICATION EMAIL =====
    await sendVerificationEmail(supabase, contact.id, email, contact.verification_token);

    return success();

  } catch (e) {
    console.error('Error:', e);
    return error('Something went wrong', 500);
  }
});

// ===== HELPERS =====

function success() {
  return new Response(
    JSON.stringify({ success: true }),
    { 
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }
  );
}

function error(message: string, status: number) {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    { 
      status,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }
  );
}

function normalize(value: string | undefined, allowed: string[], fallback: string): string {
  if (!value) return fallback;
  const lower = value.toLowerCase();
  if (allowed.includes(lower)) return lower;
  if (lower.includes('not sure') || lower.includes('unsure')) return 'unsure';
  if (lower.includes('later') || lower.includes('maybe')) return 'later';
  return fallback;
}

async function sendVerificationEmail(
  supabase: ReturnType<typeof createClient>,
  contactId: string,
  email: string,
  token?: string
) {
  // Get token if not provided
  if (!token) {
    const { data } = await supabase
      .from('registry_contacts')
      .select('verification_token')
      .eq('id', contactId)
      .single();
    token = data?.verification_token;
  }

  if (!token) return;

  // Update sent timestamp
  await supabase
    .from('registry_contacts')
    .update({ verification_sent_at: new Date().toISOString() })
    .eq('id', contactId);

  // TODO: Replace with your email service (Resend, SendGrid, etc.)
  // For now, just log it
  const verifyUrl = `${Deno.env.get('SITE_URL') || 'https://henrietta.health'}/verify?token=${token}`;
  
  console.log(`[EMAIL] To: ${email}`);
  console.log(`[EMAIL] Subject: Verify your Henrietta registration`);
  console.log(`[EMAIL] Link: ${verifyUrl}`);

  // Example with Resend (uncomment when ready):
  // const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  // await fetch('https://api.resend.com/emails', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${RESEND_API_KEY}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({
  //     from: 'Henrietta <hello@henrietta.health>',
  //     to: email,
  //     subject: 'Verify your Henrietta registration',
  //     html: `
  //       <p>Thanks for joining the Henrietta registry.</p>
  //       <p>Please verify your email by clicking the link below:</p>
  //       <p><a href="${verifyUrl}">Verify my email</a></p>
  //       <p>If you didn't sign up, you can ignore this email.</p>
  //     `
  //   })
  // });
}
