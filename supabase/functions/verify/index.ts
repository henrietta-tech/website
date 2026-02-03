// Supabase Edge Function: verify
// Deploy: supabase functions deploy verify

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  const url = new URL(req.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return json({ status: 'invalid', message: 'Missing token' }, 400);
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(token)) {
    return json({ status: 'invalid', message: 'Invalid token format' }, 400);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Find contact by token
  const { data: contact, error: findError } = await supabase
    .from('registry_contacts')
    .select('id, email, first_name, email_verified, verification_sent_at')
    .eq('verification_token', token)
    .single();

  if (findError || !contact) {
    return json({ status: 'not_found', message: 'Link expired or already used' }, 404);
  }

  // Already verified?
  if (contact.email_verified) {
    return json({ 
      status: 'already_verified', 
      message: 'Already verified',
      firstName: contact.first_name 
    }, 200);
  }

  // Check if link is expired (24 hours)
  if (contact.verification_sent_at) {
    const sent = new Date(contact.verification_sent_at);
    const now = new Date();
    const hoursSinceSent = (now.getTime() - sent.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceSent > 24) {
      return json({ status: 'expired', message: 'Link expired' }, 410);
    }
  }

  // Verify the email
  const { error: updateError } = await supabase
    .from('registry_contacts')
    .update({
      email_verified: true,
      verified_at: new Date().toISOString(),
      verification_token: crypto.randomUUID()
    })
    .eq('id', contact.id);

  if (updateError) {
    console.error('Update error:', updateError);
    return json({ status: 'error', message: 'Something went wrong' }, 500);
  }

  return json({ 
    status: 'success', 
    message: 'Email verified',
    firstName: contact.first_name 
  }, 200);
});

function json(data: object, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
