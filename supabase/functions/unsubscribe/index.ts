// Supabase Edge Function: unsubscribe
// Deploy: supabase functions deploy unsubscribe --no-verify-jwt

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SITE_URL = Deno.env.get('SITE_URL') || 'https://henriettatech.com';

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return Response.redirect(`${SITE_URL}/unsubscribe?status=invalid`, 302);
    }

    let email: string;
    try {
      email = atob(token);
    } catch {
      return Response.redirect(`${SITE_URL}/unsubscribe?status=invalid`, 302);
    }

    const emailNormalized = email.toLowerCase().trim();

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const { error } = await supabase
      .from('updates_opt_in')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('email_normalized', emailNormalized);

    if (error) {
      console.error('Unsubscribe error:', error);
      return Response.redirect(`${SITE_URL}/unsubscribe?status=error`, 302);
    }

    return Response.redirect(`${SITE_URL}/unsubscribe?status=success`, 302);

  } catch (error) {
    console.error('Unsubscribe error:', error);
    return Response.redirect(`${SITE_URL}/unsubscribe?status=error`, 302);
  }
});