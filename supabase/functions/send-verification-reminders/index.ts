// Supabase Edge Function: send-verification-reminders
// Runs daily via pg_cron or external scheduler
//
// Deploy: supabase functions deploy send-verification-reminders

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;

interface Contact {
  id: string;
  email: string;
  verification_token: string;
  reminder_type: string;
  created_at: string;
}

serve(async (req) => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const results = { reminders_sent: 0, deletions: 0, errors: [] as string[] };

  try {
    // STEP 1: Send reminders to pending contacts
    const { data: needingReminders, error: queryError } = await supabase
      .rpc('get_contacts_needing_reminders');

    if (queryError) {
      console.error('Failed to get contacts needing reminders:', queryError);
      results.errors.push(`Query error: ${queryError.message}`);
    } else if (needingReminders && needingReminders.length > 0) {
      for (const contact of needingReminders as Contact[]) {
        if (!contact.reminder_type) continue;
        
        try {
          const emailResult = await sendReminderEmail(
            contact.email,
            contact.verification_token,
            contact.reminder_type
          );

          if (emailResult.success) {
            await supabase
              .from('registry_contacts')
              .update({
                reminder_count: contact.reminder_type === '24h' ? 1 : 
                               contact.reminder_type === '72h' ? 2 : 3,
                last_reminder_sent_at: new Date().toISOString(),
              })
              .eq('id', contact.id);

            await supabase
              .from('verification_reminders_log')
              .insert({
                contact_id: contact.id,
                reminder_type: contact.reminder_type,
                email_provider_id: emailResult.messageId,
              });

            results.reminders_sent++;
          }
        } catch (error) {
          console.error(`Failed to send reminder to ${contact.id}:`, error);
          results.errors.push(`Reminder failed for ${contact.id}`);
        }
      }
    }

    // STEP 2: Delete expired unverified contacts
    const { data: forDeletion, error: deletionQueryError } = await supabase
      .rpc('get_contacts_for_deletion');

    if (deletionQueryError) {
      console.error('Failed to get contacts for deletion:', deletionQueryError);
      results.errors.push(`Deletion query error: ${deletionQueryError.message}`);
    } else if (forDeletion && forDeletion.length > 0) {
      for (const contact of forDeletion as Contact[]) {
        try {
          await supabase
            .from('registry_contacts')
            .update({
              deleted_at: new Date().toISOString(),
              deletion_reason: 'verification_expired',
            })
            .eq('id', contact.id);

          await supabase
            .from('verification_reminders_log')
            .insert({
              contact_id: contact.id,
              reminder_type: 'deletion',
            });

          results.deletions++;
        } catch (error) {
          console.error(`Failed to delete ${contact.id}:`, error);
          results.errors.push(`Deletion failed for ${contact.id}`);
        }
      }
    }

    console.log('Reminder job completed:', results);
    
    return new Response(
      JSON.stringify({ success: true, ...results }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Reminder job failed:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

interface EmailResult {
  success: boolean;
  messageId?: string;
}

async function sendReminderEmail(
  email: string, 
  token: string, 
  reminderType: string
): Promise<EmailResult> {
  
  const verifyUrl = `${SUPABASE_URL}/functions/v1/verify-email?token=${token}`;
  const { subject, html, text } = getEmailContent(reminderType, verifyUrl);

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
        subject,
        html,
        text,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Resend error:', data);
      return { success: false };
    }

    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false };
  }
}

function getEmailContent(reminderType: string, verifyUrl: string) {
  switch (reminderType) {
    case '24h':
      return {
        subject: 'Quick reminder to verify your email',
        html: `
          <p>Hi,</p>
          <p>You started joining the Henrietta registry yesterday but haven't verified your email yet.</p>
          <p>If you still want in, just click below:</p>
          <p><a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background: #1a1a1a; color: white; text-decoration: none; border-radius: 4px;">Verify my email</a></p>
          <p>If you've changed your mind, no action needed—we'll remove your information automatically in a few days.</p>
          <p>— The Henrietta team</p>
        `,
        text: `Hi,\n\nYou started joining the Henrietta registry yesterday but haven't verified your email yet.\n\nIf you still want in, click here: ${verifyUrl}\n\nIf you've changed your mind, no action needed—we'll remove your information automatically in a few days.\n\n— The Henrietta team`,
      };

    case '72h':
      return {
        subject: 'Still interested? Last reminder',
        html: `
          <p>Hi,</p>
          <p>This is our last reminder about verifying your Henrietta registration.</p>
          <p>We don't want to be annoying, so this is it. If you want to be part of what we're building—a patient-owned health data registry—verify here:</p>
          <p><a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background: #1a1a1a; color: white; text-decoration: none; border-radius: 4px;">Verify my email</a></p>
          <p>After this, your signup will expire in a few days and we'll delete your information.</p>
          <p>— The Henrietta team</p>
        `,
        text: `Hi,\n\nThis is our last reminder about verifying your Henrietta registration.\n\nWe don't want to be annoying, so this is it. If you want to be part of what we're building—a patient-owned health data registry—verify here:\n\n${verifyUrl}\n\nAfter this, your signup will expire in a few days and we'll delete your information.\n\n— The Henrietta team`,
      };

    case 'final':
      return {
        subject: 'Your signup expires tomorrow',
        html: `
          <p>Hi,</p>
          <p>Your Henrietta registration will be deleted tomorrow since we haven't received verification.</p>
          <p>If you still want to join:</p>
          <p><a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background: #1a1a1a; color: white; text-decoration: none; border-radius: 4px;">Verify before it expires</a></p>
          <p>If not, we'll delete your information and you won't hear from us again.</p>
          <p>— The Henrietta team</p>
        `,
        text: `Hi,\n\nYour Henrietta registration will be deleted tomorrow since we haven't received verification.\n\nIf you still want to join: ${verifyUrl}\n\nIf not, we'll delete your information and you won't hear from us again.\n\n— The Henrietta team`,
      };

    default:
      throw new Error(`Unknown reminder type: ${reminderType}`);
  }
}
