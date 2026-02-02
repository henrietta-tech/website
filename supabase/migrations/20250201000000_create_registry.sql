-- Henrietta Registry: Honest Minimum Schema
-- Run in Supabase SQL Editor
--
-- Philosophy: Ship this week, harden later
-- What's here: Everything you need, nothing you don't

BEGIN;

-- ============================================
-- ONE TABLE (not four)
-- ============================================

CREATE TABLE IF NOT EXISTS registry_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Core identity
  email TEXT NOT NULL,
  email_normalized TEXT GENERATED ALWAYS AS (LOWER(TRIM(email))) STORED,
  email_hash CHAR(64) GENERATED ALWAYS AS (
    encode(sha256(('henrietta:' || LOWER(TRIM(email)))::bytea), 'hex')
  ) STORED,  -- for lookups without exposing raw email
  zip_code CHAR(5) NOT NULL,
  
  -- Double opt-in (critical for deliverability)
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token UUID DEFAULT gen_random_uuid(),
  verification_sent_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  
  -- Intent signals (feed your DPC pipeline)
  dpc_status TEXT,  -- 'yes', 'no', 'unsure'
  contact_preference TEXT,  -- 'yes', 'no', 'later'
  
  -- Consent (the one thing you can't bolt on later)
  email_consent BOOLEAN DEFAULT FALSE,
  email_consent_at TIMESTAMPTZ,
  
  -- Attribution (inline, not separate table)
  referral_source TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Geography (enriched by your Airflow pipeline)
  state_fips CHAR(2),
  county_fips CHAR(5),
  cbsa_code CHAR(5),
  
  -- Lifecycle
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique on hashed email (not raw)
  CONSTRAINT unique_email_hash UNIQUE (email_hash)
);

-- ============================================
-- RATE LIMITING TABLE (minimal)
-- ============================================

CREATE TABLE IF NOT EXISTS registry_rate_limits (
  id BIGSERIAL PRIMARY KEY,
  ip_address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-cleanup: delete records older than 1 hour
-- Run this as a cron job or pg_cron if available
-- DELETE FROM registry_rate_limits WHERE created_at < NOW() - INTERVAL '1 hour';

-- ============================================
-- INDEXES (only what you'll query)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_contacts_email_hash ON registry_contacts(email_hash);
CREATE INDEX IF NOT EXISTS idx_contacts_verified ON registry_contacts(email_verified) WHERE email_verified = TRUE;
CREATE INDEX IF NOT EXISTS idx_contacts_consent ON registry_contacts(email_consent) WHERE email_consent = TRUE;
CREATE INDEX IF NOT EXISTS idx_contacts_unenriched ON registry_contacts(created_at) WHERE state_fips IS NULL;
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip ON registry_rate_limits(ip_address, created_at);

-- ============================================
-- CONSTRAINTS (catch garbage at the DB level)
-- ============================================

ALTER TABLE registry_contacts DROP CONSTRAINT IF EXISTS chk_zip_format;
ALTER TABLE registry_contacts ADD CONSTRAINT chk_zip_format CHECK (zip_code ~ '^\d{5}$');

ALTER TABLE registry_contacts DROP CONSTRAINT IF EXISTS chk_email_format;
ALTER TABLE registry_contacts ADD CONSTRAINT chk_email_format CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

-- ============================================
-- AUTO-UPDATE TIMESTAMP
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
-- ROW LEVEL SECURITY (essential)
-- ============================================

ALTER TABLE registry_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE registry_rate_limits ENABLE ROW LEVEL SECURITY;

-- No direct access from frontend
DROP POLICY IF EXISTS "No anon access" ON registry_contacts;
CREATE POLICY "No anon access" ON registry_contacts FOR ALL TO anon USING (false);

DROP POLICY IF EXISTS "No anon access" ON registry_rate_limits;
CREATE POLICY "No anon access" ON registry_rate_limits FOR ALL TO anon USING (false);

-- Service role (edge functions) gets full access
DROP POLICY IF EXISTS "Service role access" ON registry_contacts;
CREATE POLICY "Service role access" ON registry_contacts FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role access" ON registry_rate_limits;
CREATE POLICY "Service role access" ON registry_rate_limits FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- MIGRATE EXISTING DATA (if applicable)
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'landing_page_leads') THEN
    INSERT INTO registry_contacts (
      email, zip_code, dpc_status, contact_preference, referral_source,
      utm_source, utm_medium, utm_campaign,
      email_consent, email_consent_at, email_verified, created_at
    )
    SELECT 
      email,
      LEFT(COALESCE(zip_code, '00000'), 5),
      CASE LOWER(dpc_status)
        WHEN 'yes' THEN 'yes'
        WHEN 'no' THEN 'no'
        ELSE 'unsure'
      END,
      CASE LOWER(contact_preference)
        WHEN 'yes' THEN 'yes'
        WHEN 'no' THEN 'no'
        ELSE 'later'
      END,
      referral_source,
      utm_source,
      utm_medium,
      utm_campaign,
      LOWER(contact_preference) = 'yes',
      CASE WHEN LOWER(contact_preference) = 'yes' THEN timestamp ELSE NULL END,
      FALSE,  -- require re-verification
      COALESCE(timestamp, NOW())
    FROM landing_page_leads
    WHERE email IS NOT NULL AND email ~ '@'
    ON CONFLICT (email_normalized) DO NOTHING;
    
    RAISE NOTICE 'Migrated existing leads';
  END IF;
END $$;

-- ============================================
-- HELPER VIEWS (for your sanity)
-- ============================================

-- Who can you actually email?
-- Note: email is here for sending. For analytics, use email_hash.
CREATE OR REPLACE VIEW v_mailable_contacts AS
SELECT id, email, email_hash, zip_code, state_fips, cbsa_code, dpc_status, created_at
FROM registry_contacts
WHERE email_verified = TRUE
  AND email_consent = TRUE;

-- Daily stats
CREATE OR REPLACE VIEW v_daily_signups AS
SELECT 
  DATE(created_at) as signup_date,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE email_verified) as verified,
  COUNT(*) FILTER (WHERE email_consent) as consented
FROM registry_contacts
GROUP BY DATE(created_at)
ORDER BY signup_date DESC;

-- Geographic coverage
CREATE OR REPLACE VIEW v_coverage AS
SELECT 
  state_fips,
  COUNT(*) as signups,
  COUNT(*) FILTER (WHERE email_consent) as with_consent,
  COUNT(*) FILTER (WHERE dpc_status = 'no') as potential_patients
FROM registry_contacts
WHERE state_fips IS NOT NULL
GROUP BY state_fips
ORDER BY signups DESC;

COMMIT;

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'registry_contacts' as tbl, COUNT(*) as rows FROM registry_contacts
UNION ALL
SELECT 'registry_rate_limits', COUNT(*) FROM registry_rate_limits;
