// Supabase Edge Function: register
// Deploy: supabase functions deploy register
//
// Handles new signups:
//   1. Validates input
//   2. Rate limits by IP
//   3. Inserts into registry_contacts
//   4. Sends verification email via Resend

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const SITE_URL = Deno.env.get('SITE_URL') || 'https://henrietta.health';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================
// MAIN HANDLER
// ============================================

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const body = await req.json();

    // ==========================================
    // 1. VALIDATE INPUT
    // ==========================================
    
    const { 
      email, 
      firstName,
      zipCode, 
      dpcStatus, 
      contactPreference,
      wantsUpdates,  // ← New field
      referralSource,
      utmSource,
      utmMedium,
      utmCampaign,
      honeypot  // Bot trap
    } = body;

    // Honeypot check (silent fail)
    if (honeypot) {
      console.log('Honeypot triggered');
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Required fields
    if (!email || !zipCode) {
      return new Response(
        JSON.stringify({ error: 'Email and ZIP code are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ZIP format
    const zipRegex = /^\d{5}$/;
    if (!zipRegex.test(zipCode)) {
      return new Response(
        JSON.stringify({ error: 'ZIP code must be 5 digits' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ==========================================
    // 2. RATE LIMIT (5 per hour per IP)
    // ==========================================
    
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    
    const { count: recentAttempts } = await supabase
      .from('registry_rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', clientIP)
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

    if (recentAttempts && recentAttempts >= 5) {
      return new Response(
        JSON.stringify({ error: 'Too many attempts. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log this attempt
    await supabase.from('registry_rate_limits').insert({ ip_address: clientIP });

    // ==========================================
    // 3. CHECK FOR EXISTING EMAIL
    // ==========================================
    
    const emailNormalized = email.toLowerCase().trim();
    
    // Compute hash the same way Postgres does
    const encoder = new TextEncoder();
    const data = encoder.encode('henrietta:' + emailNormalized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const emailHash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const { data: existing } = await supabase
      .from('registry_contacts')
      .select('id, email_verified, deleted_at')
      .eq('email_hash', emailHash)
      .single();

    // If exists and verified, silent success (don't reveal account exists)
    if (existing && existing.email_verified && !existing.deleted_at) {
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If exists but unverified, update instead of insert (allow re-registration)
    if (existing && !existing.email_verified) {
      const { error: updateError } = await supabase
        .from('registry_contacts')
        .update({
          first_name: firstName || null,
          zip_code: zipCode,
          dpc_status: dpcStatus || null,
          contact_preference: contactPreference || null,
          wants_updates: wantsUpdates || false,
          email_consent: contactPreference === 'yes',
          email_consent_at: contactPreference === 'yes' ? new Date().toISOString() : null,
          referral_source: referralSource || null,
          utm_source: utmSource || null,
          utm_medium: utmMedium || null,
          utm_campaign: utmCampaign || null,
          verification_token: crypto.randomUUID(),
          verification_sent_at: null,
          reminder_count: 0,
          deleted_at: null,
          deletion_reason: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      // Get the new token
      const { data: updated } = await supabase
        .from('registry_contacts')
        .select('id, verification_token')
        .eq('id', existing.id)
        .single();

      // Send verification email
      await sendVerificationEmail(updated.id, email, updated.verification_token, firstName, supabase);

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ==========================================
    // 4. INSERT NEW CONTACT
    // ==========================================
    
    const { data: newContact, error: insertError } = await supabase
      .from('registry_contacts')
      .insert({
        email: email.trim(),
        first_name: firstName || null,
        zip_code: zipCode,
        dpc_status: dpcStatus || null,
        contact_preference: contactPreference || null,
        wants_updates: wantsUpdates || false,
        email_consent: contactPreference === 'yes',
        email_consent_at: contactPreference === 'yes' ? new Date().toISOString() : null,
        referral_source: referralSource || null,
        utm_source: utmSource || null,
        utm_medium: utmMedium || null,
        utm_campaign: utmCampaign || null,
      })
      .select('id, verification_token')
      .single();

    if (insertError) {
      // Duplicate (race condition) - silent success
      if (insertError.code === '23505') {
        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.error('Insert error:', insertError);
      throw insertError;
    }

    // ==========================================
    // 5. SEND VERIFICATION EMAIL
    // ==========================================
    
    await sendVerificationEmail(newContact.id, email, newContact.verification_token, firstName, supabase);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return new Response(
      JSON.stringify({ error: 'Registration failed. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ============================================
// SEND VERIFICATION EMAIL
// ============================================

async function sendVerificationEmail(
  contactId: string,
  email: string,
  token: string,
  firstName: string | null,
  supabase: ReturnType<typeof createClient>
) {
  // Update sent timestamp
  await supabase
    .from('registry_contacts')
    .update({ verification_sent_at: new Date().toISOString() })
    .eq('id', contactId);

  const verifyUrl = `${SITE_URL}/api/verify?token=${token}`;
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Henrietta <hello@henrietta.health>',
        to: email,
        subject: "You're invited to help build something different",
        html: `
          <p>${greeting}</p>
          
          <p>You just signed up for the Henrietta registry — a patient-owned 
          health data system that puts you in control.</p>
          
          <p>To confirm you want in, click below:</p>
          
          <p style="margin: 30px 0;">
            <a href="${verifyUrl}" style="display: inline-block; padding: 14px 28px; 
              background: #1a1a1a; color: white; text-decoration: none; 
              border-radius: 4px; font-weight: 500;">
              Verify my email
            </a>
          </p>
          
          <p>If you didn't sign up, just ignore this — we won't email you again.</p>
          
          <p>— The Henrietta team</p>
        `,
        text: `
${greeting}

You just signed up for the Henrietta registry — a patient-owned health data system that puts you in control.

To confirm you want in, click here:
${verifyUrl}

If you didn't sign up, just ignore this — we won't email you again.

— The Henrietta team
        `,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Resend error:', errorData);
    }
  } catch (error) {
    console.error('Email send error:', error);
    // Don't fail the registration if email fails
  }
}