# Henrietta Database Schema & Infrastructure

Last updated: 2026-02-10

## Tables

### `registry_contacts`
Primary table for signup registry.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | TEXT | User email (encrypted at rest) |
| email_hash | TEXT | SHA-256 hash for deduplication |
| first_name | TEXT | Optional |
| zip_code | TEXT | 5-digit ZIP |
| dpc_status | TEXT | DPC membership status |
| contact_preference | TEXT | yes/no/maybe |
| email_consent | BOOLEAN | Opted into updates |
| email_consent_at | TIMESTAMPTZ | When consent given |
| wants_updates | BOOLEAN | Legacy, not used for reminders |
| referral_source | TEXT | How they found us |
| utm_source | TEXT | UTM tracking |
| utm_medium | TEXT | UTM tracking |
| utm_campaign | TEXT | UTM tracking |
| verification_token | UUID | Email verification token (nulled after use) |
| verification_sent_at | TIMESTAMPTZ | When verification email sent |
| email_verified | BOOLEAN | Verification complete |
| verified_at | TIMESTAMPTZ | When verified |
| reminder_count | INTEGER | 0, 1, 2, or 3 |
| last_reminder_sent_at | TIMESTAMPTZ | Last reminder timestamp |
| deleted_at | TIMESTAMPTZ | Soft delete timestamp |
| deletion_reason | TEXT | e.g., 'verification_expired', 'user_requested' |
| created_at | TIMESTAMPTZ | Row creation |
| updated_at | TIMESTAMPTZ | Last update |

### `updates_opt_in`
Verified contacts who can receive future updates.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | TEXT | User email |
| email_normalized | TEXT | Lowercase, trimmed (unique) |
| verified_at | TIMESTAMPTZ | When email verified |
| source | TEXT | e.g., 'registration_flow' |
| is_active | BOOLEAN | Can receive emails |
| ip_address | TEXT | IP at verification |
| user_agent | TEXT | Browser at verification |
| created_at | TIMESTAMPTZ | Row creation |
| updated_at | TIMESTAMPTZ | Last update |

### `registry_rate_limits`
Rate limiting for registration attempts.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| ip_address | TEXT | Client IP |
| created_at | TIMESTAMPTZ | Attempt timestamp |

### `verification_reminders_log`
Audit trail for reminder emails.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| contact_id | UUID | FK to registry_contacts |
| reminder_type | TEXT | '24h', '72h', 'final', 'deletion' |
| email_provider_id | TEXT | Resend message ID |
| created_at | TIMESTAMPTZ | When sent |

---

## Functions

### `get_contacts_needing_reminders()`
Returns unverified contacts eligible for reminder emails.

**Logic:**
- 24h reminder: created 24-72h ago, reminder_count = 0
- 72h reminder: created 72-144h ago, reminder_count = 1
- Final reminder: created 6-7 days ago, reminder_count = 2
- Excludes: verified, deleted, older than 7 days

```sql
SELECT * FROM get_contacts_needing_reminders();
```

### `get_contacts_for_deletion()`
Returns unverified contacts past 7-day window.

**Logic:**
- Created > 7 days ago
- Not verified
- Not already deleted
- reminder_count = 3

```sql
SELECT * FROM get_contacts_for_deletion();
```

### `cleanup_rate_limits()`
Deletes rate limit entries older than 24 hours.

```sql
SELECT cleanup_rate_limits();
```

---

## Cron Jobs

| Job Name | Schedule | Command |
|----------|----------|---------|
| daily-verification-reminders | `0 14 * * *` (2 PM UTC daily) | Calls send-verification-reminders edge function |
| cleanup-rate-limits | `0 * * * *` (hourly) | `SELECT cleanup_rate_limits()` |

**View jobs:**
```sql
SELECT jobid, schedule, command FROM cron.job;
```

**View run history:**
```sql
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;
```

---

## Edge Functions

### `register`
Handles new signups.

- Validates email, ZIP
- Rate limits by IP (5/hour)
- Creates/updates registry_contacts
- Sends verification email via Resend
- Deploy: `supabase functions deploy register`

### `verify-email`
Handles verification link clicks.

- Validates token (48h expiry, single-use)
- Marks contact verified
- Adds to updates_opt_in
- Sends welcome email
- Deploy: `supabase functions deploy verify-email --no-verify-jwt`

### `send-verification-reminders`
Cron-triggered reminder and deletion processor.

- Queries `get_contacts_needing_reminders()`
- Sends appropriate reminder email (24h/72h/final)
- Updates reminder_count
- Queries `get_contacts_for_deletion()`
- Soft-deletes expired contacts
- Deploy: `supabase functions deploy send-verification-reminders --no-verify-jwt`

### `unsubscribe`
Handles unsubscribe link clicks.

- Validates token
- Sets is_active = false in updates_opt_in
- Optional: full deletion on request
- Deploy: `supabase functions deploy unsubscribe --no-verify-jwt`

---

## Email Flow

```
User signs up
    ↓
[register] → Verification email ("An invitation to something different")
    ↓
User clicks link
    ↓
[verify-email] → Welcome email ("You are in")
    ↓
Done (added to updates_opt_in)

--- If user doesn't verify ---

24h later → [cron] → 24h reminder ("Quick reminder")
72h later → [cron] → 72h reminder ("Still interested?")  
6 days   → [cron] → Final reminder ("Your signup expires tomorrow")
7 days   → [cron] → Soft delete (deletion_reason: verification_expired)
```

---

## Email Templates

Located in: `supabase/functions/_shared/email-templates.ts`

| Email | Subject | Tagline |
|-------|---------|---------|
| Verification | An invitation to something different | Yours. Actually. |
| Welcome | You are in | Asking first, this time. |
| 24h Reminder | Quick reminder | Built to leave with you. |
| 72h Reminder | Still interested? | Built to leave with you. |
| Final Reminder | Your signup expires tomorrow | Yours. Actually. |

---

## Security

### Row Level Security (RLS)
All tables have RLS enabled. Only service_role can access.

### Rate Limiting
- 5 registration attempts per IP per hour
- Cleaned up hourly by cron

### Token Security
- Verification tokens expire after 48 hours
- Single-use (nulled after verification)

### Headers (Netlify)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()

### DNS
- SPF: Configured
- DKIM: Configured
- DMARC: v=DMARC1; p=quarantine

---

## Useful Queries

### Check unverified contacts
```sql
SELECT id, email, email_verified, verification_sent_at, reminder_count, deleted_at
FROM registry_contacts
WHERE email_verified = false AND deleted_at IS NULL;
```

### Check cron job status
```sql
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

### Manual reminder trigger (testing)
```bash
curl -X POST https://qnusztpfauhmqozwuswd.supabase.co/functions/v1/send-verification-reminders
```

### Count contacts by status
```sql
SELECT 
  COUNT(*) FILTER (WHERE email_verified = true AND deleted_at IS NULL) as verified,
  COUNT(*) FILTER (WHERE email_verified = false AND deleted_at IS NULL) as pending,
  COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as deleted
FROM registry_contacts;
```

---

## Deployment Commands

```bash
# Deploy all edge functions
supabase functions deploy register
supabase functions deploy verify-email --no-verify-jwt
supabase functions deploy send-verification-reminders --no-verify-jwt
supabase functions deploy unsubscribe --no-verify-jwt

# Push to production
git add .
git commit -m "Update message"
git push
```
