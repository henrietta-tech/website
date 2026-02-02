// Supabase Edge Function: register
// Deploy: supabase functions deploy register

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const SITE_URL = Deno.env.get('SITE_URL') || 'https://henriettatech.com';

const RATE_LIMIT = 5;

const DISPOSABLE = new Set([
  'tempmail.com', 'throwaway.com', 'mailinator.com', '10minutemail.com',
  'guerrillamail.com', 'sharklasers.com', 'yopmail.com', 'maildrop.cc'
]);

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

    // Honeypot
    if (body.website) {
      return success();
    }

    // Validation
    const email = body.email?.toLowerCase().trim();
    const zip = body.zipCode?.trim();
    const firstName = body.firstName?.trim() || null;

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

    // Rate limit
    const { count } = await supabase
      .from('registry_rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

    if ((count || 0) >= RATE_LIMIT) {
      return error('Too many requests. Try again later.', 429);
    }

    await supabase.from('registry_rate_limits').insert({ ip_address: ip });

    // Check duplicate
    const emailHash = await hashEmail(email);
    
    const { data: existing } = await supabase
      .from('registry_contacts')
      .select('id, email_verified, first_name')
      .eq('email_hash', emailHash)
      .single();

    if (existing) {
      if (!existing.email_verified) {
        await sendVerificationEmail(supabase, existing.id, email, existing.first_name);
      }
      return success();
    }

    // Insert
    const wantsEmail = body.contactPreference?.toLowerCase() === 'yes';

    const { data: contact, error: insertError } = await supabase
      .from('registry_contacts')
      .insert({
        email,
        email_hash: emailHash,
        first_name: firstName,
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

    // Send verification email
    await sendVerificationEmail(supabase, contact.id, email, firstName, contact.verification_token);

    return success();

  } catch (e) {
    console.error('Error:', e);
    return error('Something went wrong', 500);
  }
});

// Helpers

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
  firstName: string | null,
  token?: string
) {
  if (!token) {
    const { data } = await supabase
      .from('registry_contacts')
      .select('verification_token')
      .eq('id', contactId)
      .single();
    token = data?.verification_token;
  }

  if (!token) return;

  await supabase
    .from('registry_contacts')
    .update({ verification_sent_at: new Date().toISOString() })
    .eq('id', contactId);

  const verifyUrl = `${SITE_URL}/verify?token=${token}`;
  const greeting = firstName ? `Hi ${firstName},` : 'Hi there,';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  
  <p style="font-size: 16px; margin-bottom: 24px;">${greeting}</p>
  
  <p style="font-size: 16px; margin-bottom: 24px;">Thanks for raising your hand.</p>
  
  <p style="font-size: 16px; margin-bottom: 24px;">Henrietta is building something different — healthcare infrastructure that belongs to patients, not platforms. We're moving slowly and carefully, connecting people who want to stand in the same corner for their health.</p>
  
  <p style="font-size: 16px; margin-bottom: 24px;">This isn't a mailing list. We won't sell your information or flood your inbox. We're asking for your consent to be part of this, because that's the whole point.</p>
  
  <p style="font-size: 16px; margin-bottom: 32px;">If this resonates, confirm you want to be part of it:</p>
  
  <a href="${verifyUrl}" style="display: inline-block; background-color: #6b5b95; color: white; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-size: 16px; font-weight: 500;">Yes, I'm in</a>
  
  <p style="font-size: 14px; color: #666; margin-top: 40px;">If you didn't sign up, or this doesn't feel right, simply ignore this email. We won't contact you again.</p>
  
  <p style="font-size: 14px; color: #666; margin-top: 40px;">— Henrietta</p>

</body>
</html>
  `.trim();

  const text = `
${greeting}

Thanks for raising your hand.

Henrietta is building something different — healthcare infrastructure that belongs to patients, not platforms. We're moving slowly and carefully, connecting people who want to stand in the same corner for their health.

This isn't a mailing list. We won't sell your information or flood your inbox. We're asking for your consent to be part of this, because that's the whole point.

If this resonates, confirm you want to be part of it:
${verifyUrl}

If you didn't sign up, or this doesn't feel right, simply ignore this email. We won't contact you again.

— Henrietta
  `.trim();

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Henrietta <hello@henriettatech.com>',
        reply_to: 'hello@henriettatech.com',
        to: email,
        subject: 'An invitation to something different',
        html,
        text
      })
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', err);
    }
  } catch (e) {
    console.error('Email send failed:', e);
  }
}
