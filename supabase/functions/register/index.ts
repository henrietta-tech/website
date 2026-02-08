// Supabase Edge Function: register
// Deploy: supabase functions deploy register

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getVerificationEmailHtml, getVerificationEmailText } from '../_shared/email-templates.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const body = await req.json();

    const { 
      email, 
      firstName,
      zipCode, 
      dpcStatus, 
      contactPreference,
      referralSource,
      utmSource,
      utmMedium,
      utmCampaign,
      honeypot
    } = body;

    if (honeypot) {
      console.log('Honeypot triggered');
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!email || !zipCode) {
      return new Response(
        JSON.stringify({ error: 'Email and ZIP code are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const zipRegex = /^\d{5}$/;
    if (!zipRegex.test(zipCode)) {
      return new Response(
        JSON.stringify({ error: 'ZIP code must be 5 digits' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    await supabase.from('registry_rate_limits').insert({ ip_address: clientIP });

    const emailNormalized = email.toLowerCase().trim();
    
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

    if (existing && existing.email_verified && !existing.deleted_at) {
      await supabase
        .from('updates_opt_in')
        .update({ 
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('email_normalized', emailNormalized);
        
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (existing && (!existing.email_verified || existing.deleted_at)) {
      const { error: updateError } = await supabase
        .from('registry_contacts')
        .update({
          first_name: firstName || null,
          zip_code: zipCode,
          dpc_status: dpcStatus || null,
          contact_preference: contactPreference || null,
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
          email_verified: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      const { data: updated } = await supabase
        .from('registry_contacts')
        .select('id, verification_token')
        .eq('id', existing.id)
        .single();

      await sendVerificationEmail(updated.id, email, updated.verification_token, firstName, supabase);

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: newContact, error: insertError } = await supabase
      .from('registry_contacts')
      .insert({
        email: email.trim(),
        first_name: firstName || null,
        zip_code: zipCode,
        dpc_status: dpcStatus || null,
        contact_preference: contactPreference || null,
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
      if (insertError.code === '23505') {
        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.error('Insert error:', insertError);
      throw insertError;
    }

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

async function sendVerificationEmail(
  contactId: string,
  email: string,
  token: string,
  firstName: string | null,
  supabase: ReturnType<typeof createClient>
) {
  await supabase
    .from('registry_contacts')
    .update({ verification_sent_at: new Date().toISOString() })
    .eq('id', contactId);

  const verifyUrl = `${SUPABASE_URL}/functions/v1/verify-email?token=${token}`;
  const unsubscribeToken = btoa(email);
  const unsubscribeUrl = `${SUPABASE_URL}/functions/v1/unsubscribe?token=${unsubscribeToken}`;

  const html = getVerificationEmailHtml(firstName, verifyUrl, unsubscribeUrl);
  const text = getVerificationEmailText(firstName, verifyUrl, unsubscribeUrl);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Henrietta <hello@mail.henriettatech.com>',
        to: email,
        subject: 'An invitation to something different',
        headers: {
          'List-Unsubscribe': `<${unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
        },
        html,
        text,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Resend error:', errorData);
    }
  } catch (error) {
    console.error('Email send error:', error);
  }
}
