// Supabase Edge Function: verify-email
// Deploy: supabase functions deploy verify-email --no-verify-jwt

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getWelcomeEmailHtml, getWelcomeEmailText } from '../_shared/email-templates.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SITE_URL = Deno.env.get('SITE_URL') || 'https://henriettatech.com';
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return Response.redirect(`${SITE_URL}/verify?status=invalid`, 302);
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      return Response.redirect(`${SITE_URL}/verify?status=invalid`, 302);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const { data: contact, error: findError } = await supabase
      .from('registry_contacts')
      .select('id, email, first_name, email_verified, deleted_at')
      .eq('verification_token', token)
      .single();

    if (findError || !contact) {
      return Response.redirect(`${SITE_URL}/verify?status=invalid`, 302);
    }

    if (contact.email_verified) {
      return Response.redirect(`${SITE_URL}/verify?status=already-verified`, 302);
    }

    if (contact.deleted_at) {
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
      console.error('Failed to update verification status:', updateError);
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
      await sendWelcomeEmail(contact.email, contact.first_name);
    }

    const nameParam = contact.first_name ? `&name=${encodeURIComponent(contact.first_name)}` : '';
    return Response.redirect(`${SITE_URL}/verify?status=success${nameParam}`, 302);

  } catch (error) {
    console.error('Verification error:', error);
    return Response.redirect(`${SITE_URL}/verify?status=error`, 302);
  }
});

async function sendWelcomeEmail(email: string, firstName: string | null) {
  const unsubscribeToken = btoa(email);
  const unsubscribeUrl = `${SUPABASE_URL}/functions/v1/unsubscribe?token=${unsubscribeToken}`;
  
  const html = getWelcomeEmailHtml(firstName, unsubscribeUrl);
  const text = getWelcomeEmailText(firstName, unsubscribeUrl);
  
  try {
    await fetch('https://api.resend.com/emails', {
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
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}
