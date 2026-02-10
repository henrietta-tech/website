-- ============================================
-- HENRIETTA REGISTRY - COMPLETE SCHEMA
-- ============================================
-- Last updated: 2026-02-10
-- 
-- This file contains the CURRENT production schema.
-- Store in: supabase/migrations/20250201000000_create_registry.sql
--
-- To recreate from scratch:
--   1. Run teardown (bottom of file) if needed
--   2. Run this entire file
--   3. Set up cron jobs (separate section)
--
-- Architecture:
--   registry_contacts      = Main signups table (analytics + verification)
--   updates_opt_in         = Verified contacts for bulletins
--   registry_rate_limits   = IP-based rate limiting
--   verification_reminders_log = Audit trail
--
-- Principle: Registry LISTENS, Bulletin SPEAKS
-- ============================================

BEGIN;

-- ============================================
-- EXTENSIONS (enable in Supabase Dashboard first)
-- ============================================
-- Required: pg_cron, pg_net
-- Enable via: Database → Extensions → Search & Enable

-- ============================================
-- TABLE: registry_contacts
-- ============================================

CREATE TABLE IF NOT EXISTS registry_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Identity
  first_name TEXT,
  email TEXT NOT NULL,
  email_normalized TEXT GENERATED ALWAYS AS (LOWER(TRIM(email))) STORED,
  email_hash CHAR(64) GENERATED ALWAYS AS (
    encode(sha256(('henrietta:' || LOWER(TRIM(email)))::bytea), 'hex')
  ) STORED,
  zip_code CHAR(5) NOT NULL,
  
  -- Verification (Double Opt-In)
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token UUID DEFAULT gen_random_uuid(),
  verification_sent_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  reminder_count INTEGER DEFAULT 0,
  last_reminder_sent_at TIMESTAMPTZ,
  
  -- Intent Signals
  dpc_status TEXT,
  contact_preference TEXT,
  wants_updates BOOLEAN DEFAULT FALSE,
  
  -- Consent
  email_consent BOOLEAN DEFAULT FALSE,
  email_consent_at TIMESTAMPTZ,
  
  -- Attribution
  referral_source TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Geography (enriched by pipeline)
  state_fips CHAR(2),
  county_fips CHAR(5),
  cbsa_code CHAR(5),
  
  -- Lifecycle
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deletion_reason TEXT,
  
  -- Constraints
  CONSTRAINT unique_email_hash UNIQUE (email_hash),
  CONSTRAINT chk_zip_format CHECK (zip_code ~ '^\d{5}$'),
  CONSTRAINT chk_email_format CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

-- ============================================
-- TABLE: updates_opt_in
-- ============================================

CREATE TABLE IF NOT EXISTS updates_opt_in (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  email_normalized TEXT NOT NULL,
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  consent_version TEXT DEFAULT 'v1.0',
  is_active BOOLEAN DEFAULT TRUE,
  unsubscribed_at TIMESTAMPTZ,
  unsubscribe_reason TEXT,
  source TEXT DEFAULT 'registration_flow',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_updates_email UNIQUE (email_normalized)
);

-- ============================================
-- TABLE: registry_rate_limits
-- ============================================

CREATE TABLE IF NOT EXISTS registry_rate_limits (
  id BIGSERIAL PRIMARY KEY,
  ip_address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: verification_reminders_log
-- ============================================

CREATE TABLE IF NOT EXISTS verification_reminders_log (
  id BIGSERIAL PRIMARY KEY,
  contact_id UUID REFERENCES registry_contacts(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  email_provider_id TEXT,
  
  CONSTRAINT valid_reminder_type CHECK (
    reminder_type IN ('initial', '24h', '72h', 'final', 'deletion')
  )
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_contacts_email_hash ON registry_contacts(email_hash);
CREATE INDEX IF NOT EXISTS idx_contacts_verified ON registry_contacts(email_verified) WHERE email_verified = TRUE;
CREATE INDEX IF NOT EXISTS idx_contacts_consent ON registry_contacts(email_consent) WHERE email_consent = TRUE;
CREATE INDEX IF NOT EXISTS idx_contacts_unenriched ON registry_contacts(created_at) WHERE state_fips IS NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_unverified_reminders ON registry_contacts(created_at, reminder_count) 
  WHERE email_verified = FALSE AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_updates_active ON updates_opt_in(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip ON registry_rate_limits(ip_address, created_at);
CREATE INDEX IF NOT EXISTS idx_reminders_contact ON verification_reminders_log(contact_id);

-- ============================================
-- TRIGGER: Auto-update timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS registry_contacts_updated ON registry_contacts;
CREATE TRIGGER registry_contacts_updated
  BEFORE UPDATE ON registry_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE registry_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE registry_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE updates_opt_in ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_reminders_log ENABLE ROW LEVEL SECURITY;

-- Block anon access
DROP POLICY IF EXISTS "No anon access" ON registry_contacts;
CREATE POLICY "No anon access" ON registry_contacts FOR ALL TO anon USING (false);

DROP POLICY IF EXISTS "No anon access" ON registry_rate_limits;
CREATE POLICY "No anon access" ON registry_rate_limits FOR ALL TO anon USING (false);

DROP POLICY IF EXISTS "No anon access" ON updates_opt_in;
CREATE POLICY "No anon access" ON updates_opt_in FOR ALL TO anon USING (false);

DROP POLICY IF EXISTS "No anon access" ON verification_reminders_log;
CREATE POLICY "No anon access" ON verification_reminders_log FOR ALL TO anon USING (false);

-- Service role full access
DROP POLICY IF EXISTS "Service role access" ON registry_contacts;
CREATE POLICY "Service role access" ON registry_contacts FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role access" ON registry_rate_limits;
CREATE POLICY "Service role access" ON registry_rate_limits FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role access" ON updates_opt_in;
CREATE POLICY "Service role access" ON updates_opt_in FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role access" ON verification_reminders_log;
CREATE POLICY "Service role access" ON verification_reminders_log FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- FUNCTION: get_contacts_needing_reminders
-- ============================================
-- Returns unverified contacts eligible for reminder emails.
-- 
-- IMPORTANT: Does NOT filter by wants_updates.
-- Verification reminders go to ALL unverified signups.
-- Only bulletin emails respect wants_updates.

CREATE OR REPLACE FUNCTION get_contacts_needing_reminders()
RETURNS TABLE (
  id UUID,
  email TEXT,
  verification_token UUID,
  reminder_type TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rc.id,
    rc.email,
    rc.verification_token,
    CASE 
      -- 24h reminder: 24-72h old, 0 reminders sent
      WHEN rc.created_at < NOW() - INTERVAL '24 hours' 
           AND rc.created_at >= NOW() - INTERVAL '72 hours'
           AND rc.reminder_count = 0 
      THEN '24h'
      
      -- 72h reminder: 72-144h old, 1 reminder sent
      WHEN rc.created_at < NOW() - INTERVAL '72 hours' 
           AND rc.created_at >= NOW() - INTERVAL '144 hours'
           AND rc.reminder_count = 1 
      THEN '72h'
      
      -- Final reminder: 6-7 days old, 2 reminders sent
      WHEN rc.created_at < NOW() - INTERVAL '6 days' 
           AND rc.created_at >= NOW() - INTERVAL '7 days'
           AND rc.reminder_count = 2 
      THEN 'final'
      
      ELSE NULL
    END AS reminder_type,
    rc.created_at
  FROM registry_contacts rc
  WHERE rc.email_verified = FALSE
    AND rc.deleted_at IS NULL
    AND rc.created_at > NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: get_contacts_for_deletion
-- ============================================
-- Returns unverified contacts past the 7-day window.

CREATE OR REPLACE FUNCTION get_contacts_for_deletion()
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rc.id,
    rc.email,
    rc.created_at
  FROM registry_contacts rc
  WHERE rc.email_verified = FALSE
    AND rc.deleted_at IS NULL
    AND rc.created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: cleanup_rate_limits
-- ============================================
-- Deletes rate limit entries older than 24 hours.
-- Called hourly by pg_cron.

CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM registry_rate_limits 
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEWS
-- ============================================

CREATE OR REPLACE VIEW v_mailable_contacts AS
SELECT id, email, email_hash, zip_code, state_fips, cbsa_code, dpc_status, created_at
FROM registry_contacts
WHERE email_verified = TRUE
  AND email_consent = TRUE
  AND deleted_at IS NULL;

CREATE OR REPLACE VIEW v_daily_signups AS
SELECT 
  DATE(created_at) as signup_date,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE email_verified) as verified,
  COUNT(*) FILTER (WHERE email_consent) as consented,
  COUNT(*) FILTER (WHERE wants_updates) as wants_updates
FROM registry_contacts
WHERE deleted_at IS NULL
GROUP BY DATE(created_at)
ORDER BY signup_date DESC;

CREATE OR REPLACE VIEW v_coverage AS
SELECT 
  state_fips,
  COUNT(*) as signups,
  COUNT(*) FILTER (WHERE email_consent) as with_consent,
  COUNT(*) FILTER (WHERE dpc_status = 'no') as potential_patients
FROM registry_contacts
WHERE state_fips IS NOT NULL
  AND deleted_at IS NULL
GROUP BY state_fips
ORDER BY signups DESC;

CREATE OR REPLACE VIEW v_verification_funnel AS
SELECT 
  COUNT(*) as total_signups,
  COUNT(*) FILTER (WHERE email_verified = TRUE) as verified,
  COUNT(*) FILTER (WHERE email_verified = FALSE AND deleted_at IS NULL) as pending,
  COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as expired,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE email_verified = TRUE) / 
    NULLIF(COUNT(*), 0), 
    1
  ) as verification_rate_pct
FROM registry_contacts
WHERE created_at > NOW() - INTERVAL '30 days';

CREATE OR REPLACE VIEW v_reminder_stats AS
SELECT 
  reminder_type,
  COUNT(*) as sent,
  COUNT(*) FILTER (
    WHERE EXISTS (
      SELECT 1 FROM registry_contacts rc 
      WHERE rc.id = verification_reminders_log.contact_id 
      AND rc.email_verified = TRUE
    )
  ) as led_to_verification
FROM verification_reminders_log
WHERE sent_at > NOW() - INTERVAL '30 days'
GROUP BY reminder_type;

COMMIT;

-- ============================================
-- CRON JOBS (Run separately after schema)
-- ============================================
-- 
-- These must be run AFTER enabling pg_cron and pg_net extensions.
-- 
-- 1. Daily verification reminders (2 PM UTC):
--
-- SELECT cron.schedule(
--   'daily-verification-reminders',
--   '0 14 * * *',
--   $$
--   SELECT net.http_post(
--     url := 'https://qnusztpfauhmqozwuswd.supabase.co/functions/v1/send-verification-reminders',
--     headers := '{"Content-Type": "application/json"}'::jsonb,
--     body := '{}'::jsonb
--   );
--   $$
-- );
--
-- 2. Hourly rate limit cleanup:
--
-- SELECT cron.schedule(
--   'cleanup-rate-limits',
--   '0 * * * *',
--   'SELECT cleanup_rate_limits()'
-- );
--
-- Verify with: SELECT * FROM cron.job;

-- ============================================
-- TEARDOWN (DANGEROUS - DO NOT RUN IN PRODUCTION)
-- ============================================
-- Uncomment and run ONLY to completely reset:
--
-- DROP TABLE IF EXISTS verification_reminders_log CASCADE;
-- DROP TABLE IF EXISTS updates_opt_in CASCADE;
-- DROP TABLE IF EXISTS registry_rate_limits CASCADE;
-- DROP TABLE IF EXISTS registry_contacts CASCADE;
-- DROP VIEW IF EXISTS v_mailable_contacts;
-- DROP VIEW IF EXISTS v_daily_signups;
-- DROP VIEW IF EXISTS v_coverage;
-- DROP VIEW IF EXISTS v_verification_funnel;
-- DROP VIEW IF EXISTS v_reminder_stats;
-- DROP FUNCTION IF EXISTS get_contacts_needing_reminders();
-- DROP FUNCTION IF EXISTS get_contacts_for_deletion();
-- DROP FUNCTION IF EXISTS cleanup_rate_limits();
-- DROP FUNCTION IF EXISTS update_updated_at();
-- SELECT cron.unschedule('daily-verification-reminders');
-- SELECT cron.unschedule('cleanup-rate-limits');

-- ============================================
-- VERIFICATION QUERY
-- ============================================

SELECT 
  'registry_contacts' as table_name, COUNT(*) as rows FROM registry_contacts
UNION ALL SELECT 'updates_opt_in', COUNT(*) FROM updates_opt_in
UNION ALL SELECT 'registry_rate_limits', COUNT(*) FROM registry_rate_limits
UNION ALL SELECT 'verification_reminders_log', COUNT(*) FROM verification_reminders_log;
