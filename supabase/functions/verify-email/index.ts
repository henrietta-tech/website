// Supabase Edge Function: verify-email
// Deploy: supabase functions deploy verify-email --no-verify-jwt

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getWelcomeEmailHtml, getWelcomeEmailText } from '../_shared/email-templates.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SITE_URL = Deno.env.get('SITE_URL') || 'https://henriettatech.com';
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

// Token expiry window (48 hours)
const TOKEN_EXPIRY_HOURS = 48;

serve(async (req) => {
  const requestId = crypto.randomUUID().slice(0, 8);
  
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      console.log(`[${requestId}] Missing token`);
      return Response.redirect(`${SITE_URL}/verify?status=invalid`, 302);
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      console.log(`[${requestId}] Invalid token format`);
      return Response.redirect(`${SITE_URL}/verify?status=invalid`, 302);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Calculate expiry threshold (48 hours ago)
    const expiryThreshold = new Date(Date.now() - TOKEN_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();

    const { data: contact, error: findError } = await supabase
      .from('registry_contacts')
      .select('id, email, first_name, email_verified, deleted_at, verification_sent_at')
      .eq('verification_token', token)
      .single();

    if (findError || !contact) {
      console.log(`[${requestId}] Token not found`);
      return Response.redirect(`${SITE_URL}/verify?status=invalid`, 302);
    }

    if (contact.email_verified) {
      console.log(`[${requestId}] Already verified: ${contact.id}`);
      return Response.redirect(`${SITE_URL}/verify?status=already-verified`, 302);
    }

    if (contact.deleted_at) {
      console.log(`[${requestId}] Contact deleted: ${contact.id}`);
      return Response.redirect(`${SITE_URL}/verify?status=expired`, 302);
    }

    // Check if token is expired (48h window)
    if (contact.verification_sent_at && contact.verification_sent_at < expiryThreshold) {
      console.log(`[${requestId}] Token expired: ${contact.id}, sent at ${contact.verification_sent_at}`);
      return Response.redirect(`${SITE_URL}/verify?status=expired`, 302);
    }

    const { error: updateError } = await supabase
      .from('registry_contacts')
      .update({
        email_verified: true,
        verified_at: new Date().toISOString(),
        verification_token: null,
      })
      .eq('id', contact.id);

    if (updateError) {
      console.error(`[${requestId}] Failed to update verification status:`, updateError);
      return Response.redirect(`${SITE_URL}/verify?status=error`, 302);
    }

    const emailNormalized = contact.email.toLowerCase().trim();
    
    await supabase
      .from('updates_opt_in')
      .upsert({
        email: contact.email,
        email_normalized: emailNormalized,
        verified_at: new Date().toISOString(),
        source: 'registration_flow',
        ip_address: req.headers.get('x-forwarded-for')?.split(',')[0] || null,
        user_agent: req.headers.get('user-agent'),
      }, {
        onConflict: 'email_normalized',
        ignoreDuplicates: true,
      });

    if (RESEND_API_KEY) {
      await sendWelcomeEmail(contact.email, contact.first_name, requestId);
    }

    console.log(`[${requestId}] Verified successfully: ${contact.id}`);
    const nameParam = contact.first_name ? `&name=${encodeURIComponent(contact.first_name)}` : '';
    return Response.redirect(`${SITE_URL}/verify?status=success${nameParam}`, 302);

  } catch (error) {
    console.error(`[${requestId}] Verification error:`, error);
    return Response.redirect(`${SITE_URL}/verify?status=error`, 302);
  }
});

async function sendWelcomeEmail(email: string, firstName: string | null, requestId: string) {
  const unsubscribeToken = btoa(email);
  const unsubscribeUrl = `${SUPABASE_URL}/functions/v1/unsubscribe?token=${unsubscribeToken}`;
  
  const html = getWelcomeEmailHtml(firstName, unsubscribeUrl);
  const text = getWelcomeEmailText(firstName, unsubscribeUrl);
  
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
        subject: 'You are in',
        headers: {
          'List-Unsubscribe': `<${unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
        },
        html,
        text,
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`[${requestId}] Welcome email sent: ${data.id}`);
    } else {
      const error = await response.json();
      console.error(`[${requestId}] Welcome email failed:`, error);
    }
  } catch (error) {
    console.error(`[${requestId}] Failed to send welcome email:`, error);
  }
}
