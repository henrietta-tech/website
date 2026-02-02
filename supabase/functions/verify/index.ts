// Supabase Edge Function: verify
// Deploy: supabase functions deploy verify
//
// Handles email verification (double opt-in)
// URL: /functions/v1/verify?token={uuid}

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SITE_URL = Deno.env.get('SITE_URL') || 'https://henrietta.health';

serve(async (req) => {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return html('Invalid Link', 'This verification link is invalid.', 400);
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(token)) {
    return html('Invalid Link', 'This verification link is malformed.', 400);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Find contact by token
  const { data: contact, error: findError } = await supabase
    .from('registry_contacts')
    .select('id, email, email_verified, verification_sent_at')
    .eq('verification_token', token)
    .single();

  if (findError || !contact) {
    return html('Not Found', 'This verification link has expired or was already used.', 404);
  }

  // Already verified?
  if (contact.email_verified) {
    return html(
      'Already Verified', 
      `Your email (${maskEmail(contact.email)}) is already verified. You're all set.`,
      200
    );
  }

  // Check if link is expired (24 hours)
  if (contact.verification_sent_at) {
    const sent = new Date(contact.verification_sent_at);
    const now = new Date();
    const hoursSinceSent = (now.getTime() - sent.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceSent > 24) {
      return html(
        'Link Expired',
        'This verification link has expired. Please sign up again.',
        410
      );
    }
  }

  // Verify the email
  const { error: updateError } = await supabase
    .from('registry_contacts')
    .update({
      email_verified: true,
      verified_at: new Date().toISOString(),
      // Rotate token so it can't be reused
      verification_token: crypto.randomUUID()
    })
    .eq('id', contact.id);

  if (updateError) {
    console.error('Update error:', updateError);
    return html('Error', 'Something went wrong. Please try again.', 500);
  }

  return html(
    'Email Verified',
    `Thanks for verifying your email. You're now part of the Henrietta registry.<br><br>
     We'll reach out when there's something meaningful to share.`,
    200,
    true
  );
});

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `**@${domain}`;
  return `${local.slice(0, 2)}***@${domain}`;
}

function html(title: string, message: string, status: number, showHome = false): Response {
  const homeLink = showHome 
    ? `<p style="margin-top: 2rem;"><a href="${Deno.env.get('SITE_URL') || 'https://henrietta.health'}">← Back to Henrietta</a></p>`
    : '';

  return new Response(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Henrietta</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #fafafa;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .card {
      background: white;
      border: 1px solid #e5e5e5;
      padding: 3rem;
      max-width: 480px;
      text-align: center;
    }
    .logo {
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 2rem;
    }
    h1 { font-size: 1.5rem; margin-bottom: 1rem; }
    p { color: #555; line-height: 1.6; }
    a { color: #000; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">Henrietta</div>
    <h1>${title}</h1>
    <p>${message}</p>
    ${homeLink}
  </div>
</body>
</html>
  `, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}
