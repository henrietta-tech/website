-- ============================================
-- HENRIETTA REGISTRY - COMPLETE SCHEMA
-- ============================================
-- Last updated: 2026-02-12
-- 
-- This file contains the CURRENT production schema for Henrietta's
-- patient registry system. It's designed for a healthcare infrastructure
-- startup focused on patient-owned health data and Direct Primary Care.
--
-- ============================================
-- HOW TO USE THIS FILE
-- ============================================
-- 
-- Store in: supabase/migrations/20250201000000_create_registry.sql
--
-- To recreate from scratch:
--   1. Run teardown (bottom of file) if needed
--   2. Run this entire file
--   3. Set up cron jobs (separate section at bottom)
--
-- ============================================
-- ARCHITECTURE OVERVIEW
-- ============================================
--
-- Tables:
--   registry_contacts           Main signups table (holds all registrations)
--   updates_opt_in              Verified contacts who want bulletins
--   registry_rate_limits        IP-based rate limiting for abuse prevention
--   verification_reminders_log  Audit trail of all reminder emails sent
--
-- Views (for analytics):
--   v_mailable_contacts         PII view - RESTRICTED to service_role only
--   v_daily_signups             Aggregated signup counts by day
--   v_coverage                  Geographic coverage by state
--   v_verification_funnel       Conversion metrics for verification flow
--   v_reminder_stats            Effectiveness of reminder emails
--
-- Functions:
--   get_contacts_needing_reminders()  Find who needs reminder emails
--   get_contacts_for_deletion()       Find expired unverified signups
--   cleanup_rate_limits()             Purge old rate limit records
--   update_updated_at()               Auto-update timestamp trigger
--
-- ============================================
-- SECURITY MODEL
-- ============================================
--
-- Supabase provides three main access levels via API keys:
--
-- 1. anon (public key - visible in client JavaScript)
--    - Used by: Browser/frontend code
--    - Access: BLOCKED from all tables via RLS policies
--    - Why: Anyone can see this key in your JS, so it must have zero access
--
-- 2. authenticated (after user login)
--    - Used by: Logged-in users (if you add auth later)
--    - Access: Currently blocked, no user accounts in registry
--    - Why: Registry is anonymous, no user authentication needed yet
--
-- 3. service_role (secret key - server-side only)
--    - Used by: Edge Functions, backend code, cron jobs
--    - Access: FULL access to everything, bypasses RLS
--    - Why: Your server-side code needs to read/write all data
--    - CRITICAL: Never expose this key in client code!
--
-- The RLS (Row Level Security) policies below implement this model.
-- Every table has RLS enabled with explicit "deny all" for anon.
--
-- ============================================
-- DESIGN PRINCIPLE: Registry LISTENS, Bulletin SPEAKS
-- ============================================
--
-- The registry is passive - it collects interest signals from patients.
-- The bulletin system (separate) actively sends communications.
-- This separation keeps the data model clean and consent explicit.
--
-- ============================================

BEGIN;

-- ============================================
-- EXTENSIONS
-- ============================================
-- These must be enabled in Supabase Dashboard BEFORE running this file:
--   Database → Extensions → Search & Enable
--
-- pg_cron: Scheduled jobs (reminders, cleanup)
--   - Allows running SQL on a schedule (like Unix cron)
--   - Used for: daily reminder emails, hourly rate limit cleanup
--
-- pg_net: HTTP requests from database
--   - Allows calling external URLs from SQL
--   - Used for: triggering Edge Functions from cron jobs
--
-- You cannot enable these via SQL - must use Dashboard or CLI.


-- ============================================
-- TABLE: registry_contacts
-- ============================================
-- The main table storing everyone who signs up for the registry.
-- This is your core dataset for understanding patient interest.
--
-- Key concepts:
--   - Double opt-in: Users must verify email before we can contact them
--   - Soft delete: We mark deleted_at instead of removing rows (audit trail)
--   - Geographic enrichment: zip_code gets expanded to state/county/CBSA
--   - Hash-based dedup: email_hash prevents duplicate signups
--
-- Workflow:
--   1. User submits form → row created with email_verified=false
--   2. Verification email sent → verification_sent_at set
--   3. User clicks link → email_verified=true, verified_at set
--   4. If no verification after 7 days → deleted_at set (soft delete)

CREATE TABLE IF NOT EXISTS registry_contacts (
  -- ========== Primary Key ==========
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- UUID v4: globally unique, no sequential guessing, safe to expose in URLs
  
  -- ========== Identity Fields ==========
  first_name TEXT,
  -- Optional: for personalized emails ("Hi Sarah" vs "Hi there")
  -- Not required because some users prefer anonymity
  
  email TEXT NOT NULL,
  -- Raw email as entered by user
  -- We keep this for sending actual emails
  
  email_normalized TEXT GENERATED ALWAYS AS (LOWER(TRIM(email))) STORED,
  -- Computed column: lowercase + trimmed version
  -- GENERATED ALWAYS AS: PostgreSQL auto-computes this, you can't set it manually
  -- STORED: Physically saved (vs VIRTUAL which computes on read)
  -- Used for: consistent comparisons, case-insensitive matching
  
  email_hash CHAR(64) GENERATED ALWAYS AS (
    encode(sha256(('henrietta:' || LOWER(TRIM(email)))::bytea), 'hex')
  ) STORED,
  -- SHA-256 hash of normalized email with salt prefix
  -- Why hash? 
  --   1. Uniqueness check without exposing raw email in indexes
  --   2. Can share hash externally for dedup without revealing email
  --   3. Salt ('henrietta:') prevents rainbow table attacks
  -- CHAR(64): SHA-256 always produces 64 hex characters
  
  zip_code CHAR(5) NOT NULL,
  -- US 5-digit ZIP code, required for geographic analysis
  -- CHAR(5): Fixed length, enforces exactly 5 characters
  -- Validated by constraint below to ensure all digits
  
  -- ========== Verification (Double Opt-In) ==========
  -- These fields track the email verification workflow.
  -- Double opt-in is required for GDPR/CAN-SPAM compliance and deliverability.
  
  email_verified BOOLEAN DEFAULT FALSE,
  -- Has user clicked the verification link?
  -- FALSE until they verify, then TRUE forever
  
  verification_token UUID DEFAULT gen_random_uuid(),
  -- Secret token embedded in verification link
  -- Auto-generated, unique per signup
  -- URL looks like: henrietta.health/verify?token=abc123...
  
  verification_sent_at TIMESTAMPTZ,
  -- When we sent the verification email
  -- NULL if not yet sent (edge case: immediate failure)
  -- Used for: debugging delivery issues, timing analysis
  
  verified_at TIMESTAMPTZ,
  -- When user clicked verification link
  -- NULL until verified
  -- Used for: measuring time-to-verify, cohort analysis
  
  reminder_count INTEGER DEFAULT 0,
  -- How many reminder emails we've sent (0, 1, 2, or 3)
  -- Incremented each time send-verification-reminders runs
  -- Used for: determining which reminder type to send next
  
  last_reminder_sent_at TIMESTAMPTZ,
  -- When we last sent a reminder
  -- Used for: preventing duplicate sends, debugging
  
  -- ========== Intent Signals ==========
  -- These help understand what the user wants from Henrietta.
  -- Drives product development and market segmentation.
  
  dpc_status TEXT,
  -- User's current relationship with Direct Primary Care
  -- Values: 'yes' (has DPC), 'no' (doesn't), 'curious' (interested)
  -- 'no' = highest value prospects (potential patients)
  
  contact_preference TEXT,
  -- How user prefers to be contacted
  -- Values: 'email', 'text', 'both', 'none'
  -- Informs future communication channel decisions
  
  wants_updates BOOLEAN DEFAULT FALSE,
  -- Does user want to receive bulletin emails?
  -- TRUE = opted into marketing/updates
  -- FALSE = only transactional emails (verification)
  -- IMPORTANT: This does NOT affect verification reminders!
  --   Verification reminders go to ALL unverified users.
  --   This only affects post-verification bulletins.
  
  -- ========== Consent ==========
  -- Explicit consent tracking for legal compliance.
  
  email_consent BOOLEAN DEFAULT FALSE,
  -- Has user explicitly consented to email communication?
  -- Set TRUE when they check the consent checkbox
  -- Required for GDPR: must have affirmative consent
  
  email_consent_at TIMESTAMPTZ,
  -- Timestamp of consent for audit trail
  -- Legal requirement: prove WHEN consent was given
  
  -- ========== Attribution ==========
  -- Track where signups come from for marketing analysis.
  
  referral_source TEXT,
  -- Free-form referral source
  -- Values: 'friend', 'doctor', 'social_media', 'search', etc.
  -- Collected via form field "How did you hear about us?"
  
  utm_source TEXT,
  -- Standard UTM parameter: traffic source
  -- Examples: 'google', 'facebook', 'newsletter'
  
  utm_medium TEXT,
  -- Standard UTM parameter: marketing medium
  -- Examples: 'cpc', 'email', 'social', 'organic'
  
  utm_campaign TEXT,
  -- Standard UTM parameter: campaign name
  -- Examples: 'launch_2025', 'dpc_awareness', 'waitlist'
  
  -- ========== Geography (Enriched) ==========
  -- These fields are populated AFTER signup by a separate enrichment pipeline.
  -- The pipeline looks up zip_code in Census Bureau data to get these codes.
  
  state_fips CHAR(2),
  -- Federal state code (01=Alabama, 02=Alaska, ... 56=Wyoming)
  -- Why FIPS? Standard code for joining with Census data
  -- NULL until enrichment runs
  
  county_fips CHAR(5),
  -- State + county code (e.g., '06075' = San Francisco, CA)
  -- First 2 digits = state, last 3 = county
  -- NULL until enrichment runs
  
  cbsa_code CHAR(5),
  -- Core-Based Statistical Area (metro/micro area)
  -- Example: '41860' = San Francisco-Oakland-Berkeley
  -- Useful for: market analysis, urban vs rural segmentation
  -- NULL until enrichment runs
  
  -- ========== Lifecycle ==========
  -- Track record creation, updates, and soft deletion.
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- When this row was inserted
  -- TIMESTAMPTZ: timestamp with timezone (always stored as UTC)
  -- DEFAULT NOW(): auto-set on insert
  
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- When this row was last modified
  -- Auto-updated by trigger (see update_updated_at function below)
  
  deleted_at TIMESTAMPTZ,
  -- Soft delete timestamp
  -- NULL = active record
  -- NOT NULL = "deleted" (we keep the row for audit)
  -- Set when: user unsubscribes, verification expires, manual removal
  
  deletion_reason TEXT,
  -- Why was this record soft-deleted?
  -- Values: 'unsubscribed', 'verification_expired', 'bounce', 'complaint', 'manual'
  -- Important for: compliance, understanding churn
  
  -- ========== Constraints ==========
  -- Database-level validation rules. These run on INSERT and UPDATE.
  -- Constraints are your last line of defense against bad data.
  
  CONSTRAINT unique_email_hash UNIQUE (email_hash),
  -- Prevent duplicate signups (same email can't register twice)
  -- Uses hash so the unique index doesn't expose raw emails
  -- If user tries to re-register, they get an error
  -- Edge Function should catch this and show friendly message
  
  CONSTRAINT chk_zip_format CHECK (zip_code ~ '^\d{5}$'),
  -- Regex check: exactly 5 digits
  -- ~ is PostgreSQL regex match operator
  -- ^ = start, \d = digit, {5} = exactly 5, $ = end
  -- Rejects: '1234', '123456', 'ABCDE', '12 34'
  
  CONSTRAINT chk_email_format CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
  -- Basic email format validation
  -- ~* is case-insensitive regex match
  -- Pattern: something@something.something (no spaces)
  -- This is intentionally loose - real validation happens on verification
  -- Rejects: 'notanemail', '@missing.com', 'spaces in@email.com'
);


-- ============================================
-- TABLE: updates_opt_in
-- ============================================
-- Stores contacts who completed verification AND want bulletin updates.
-- This is the "clean list" for marketing emails.
--
-- Why separate from registry_contacts?
--   1. Clear separation of concerns (registry vs bulletin)
--   2. Simpler queries for sending bulletins
--   3. Can have different retention policies
--   4. Easier to hand off to email marketing tools
--
-- Populated by: verification Edge Function (when wants_updates=true)

CREATE TABLE IF NOT EXISTS updates_opt_in (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  email TEXT NOT NULL,
  -- Raw email for sending
  
  email_normalized TEXT NOT NULL,
  -- Lowercase/trimmed version for dedup
  -- Unlike registry_contacts, this is NOT auto-generated
  -- (copied from registry_contacts on insert)
  
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  -- When they completed verification
  -- Inherited from registry_contacts.verified_at
  
  consent_version TEXT DEFAULT 'v1.0',
  -- Which version of consent language they agreed to
  -- Important for: legal compliance if consent text changes
  -- Update this when you change your privacy policy
  
  is_active BOOLEAN DEFAULT TRUE,
  -- Are they currently subscribed?
  -- FALSE after unsubscribe (but we keep the row)
  
  unsubscribed_at TIMESTAMPTZ,
  -- When they unsubscribed
  -- NULL if still active
  
  unsubscribe_reason TEXT,
  -- Why they left
  -- Values: 'too_many_emails', 'not_relevant', 'other', etc.
  -- Useful for: improving email strategy
  
  source TEXT DEFAULT 'registration_flow',
  -- How they got on this list
  -- Default: came through normal registration
  -- Other values: 'manual_import', 'beta_tester', etc.
  
  ip_address INET,
  -- IP address at time of verification
  -- INET: PostgreSQL type for IP addresses (v4 or v6)
  -- Useful for: fraud detection, geographic analysis
  
  user_agent TEXT,
  -- Browser/device info at verification
  -- Useful for: debugging, analytics
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_updates_email UNIQUE (email_normalized)
  -- One entry per email address
  -- If they unsubscribe and resubscribe, we update the existing row
);


-- ============================================
-- TABLE: registry_rate_limits
-- ============================================
-- Tracks signup attempts per IP address to prevent abuse.
-- Simple append-only log that gets cleaned up hourly.
--
-- How it works:
--   1. On each signup attempt, Edge Function inserts a row
--   2. Edge Function counts recent rows for that IP
--   3. If count > threshold, reject the signup
--   4. Hourly cron job deletes rows older than 24h
--
-- Why this design?
--   - Simple: just count rows, no complex state
--   - Distributed: works across multiple Edge Function instances
--   - Self-cleaning: cron job prevents unbounded growth
--   - Debuggable: can query to see abuse patterns

CREATE TABLE IF NOT EXISTS registry_rate_limits (
  id BIGSERIAL PRIMARY KEY,
  -- BIGSERIAL: auto-incrementing 64-bit integer
  -- Using integer PK here (vs UUID) because:
  --   1. These are internal records, never exposed
  --   2. Smaller = faster for high-volume inserts
  --   3. Sequential IDs are fine for append-only logs
  
  ip_address TEXT NOT NULL,
  -- The IP that made the request
  -- TEXT vs INET: simpler, Edge Functions send as string anyway
  -- Could be IPv4 ('192.168.1.1') or IPv6 ('2001:db8::1')
  
  created_at TIMESTAMPTZ DEFAULT NOW()
  -- When this attempt occurred
  -- Used for: counting attempts in time window, cleanup
);


-- ============================================
-- TABLE: verification_reminders_log
-- ============================================
-- Audit trail of all reminder emails sent.
-- Used for: debugging, analytics, preventing duplicate sends.
--
-- Every time the send-verification-reminders Edge Function runs,
-- it logs each email sent here.

CREATE TABLE IF NOT EXISTS verification_reminders_log (
  id BIGSERIAL PRIMARY KEY,
  -- Auto-incrementing ID (same reasoning as rate_limits)
  
  contact_id UUID REFERENCES registry_contacts(id) ON DELETE CASCADE,
  -- Which contact received this reminder
  -- REFERENCES: foreign key constraint (must exist in registry_contacts)
  -- ON DELETE CASCADE: if contact is deleted, delete their reminder logs too
  
  reminder_type TEXT NOT NULL,
  -- Which reminder in the sequence
  -- 'initial' = first verification email (immediate after signup)
  -- '24h' = 24-hour reminder
  -- '72h' = 72-hour reminder  
  -- 'final' = last chance before deletion
  -- 'deletion' = notification that we're deleting (courtesy)
  
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  -- When the email was sent
  
  email_provider_id TEXT,
  -- ID from email provider (e.g., Resend message ID)
  -- Useful for: debugging delivery issues, correlating with provider logs
  
  CONSTRAINT valid_reminder_type CHECK (
    reminder_type IN ('initial', '24h', '72h', 'final', 'deletion')
  )
  -- Enforce valid reminder types
  -- Prevents typos and invalid data
);


-- ============================================
-- INDEXES
-- ============================================
-- Indexes speed up queries by creating sorted lookup structures.
-- Without indexes, PostgreSQL must scan entire tables (slow).
--
-- Rule of thumb: index columns you frequently:
--   - Filter by (WHERE)
--   - Join on (JOIN ... ON)
--   - Sort by (ORDER BY)
--
-- Trade-off: indexes speed reads but slow writes (must update index too).
-- Only add indexes you actually need.

-- Fast lookup by email hash (used for duplicate checking)
CREATE INDEX IF NOT EXISTS idx_contacts_email_hash 
  ON registry_contacts(email_hash);

-- Find all verified contacts quickly
-- PARTIAL INDEX (WHERE clause): only indexes rows matching condition
-- Much smaller than full index, faster for this specific query pattern
CREATE INDEX IF NOT EXISTS idx_contacts_verified 
  ON registry_contacts(email_verified) 
  WHERE email_verified = TRUE;

-- Find all consented contacts quickly
CREATE INDEX IF NOT EXISTS idx_contacts_consent 
  ON registry_contacts(email_consent) 
  WHERE email_consent = TRUE;

-- Find contacts needing geographic enrichment
-- (state_fips is NULL until enrichment pipeline runs)
CREATE INDEX IF NOT EXISTS idx_contacts_unenriched 
  ON registry_contacts(created_at) 
  WHERE state_fips IS NULL;

-- Find contacts needing verification reminders
-- Composite index on (created_at, reminder_count) for the reminder query
-- Only includes unverified, non-deleted contacts
CREATE INDEX IF NOT EXISTS idx_contacts_unverified_reminders 
  ON registry_contacts(created_at, reminder_count) 
  WHERE email_verified = FALSE AND deleted_at IS NULL;

-- Find active bulletin subscribers
CREATE INDEX IF NOT EXISTS idx_updates_active 
  ON updates_opt_in(is_active) 
  WHERE is_active = TRUE;

-- Rate limit lookups by IP (most recent first)
-- Composite index: first filters by IP, then sorts by time
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip 
  ON registry_rate_limits(ip_address, created_at);

-- Find all reminders for a specific contact
CREATE INDEX IF NOT EXISTS idx_reminders_contact 
  ON verification_reminders_log(contact_id);


-- ============================================
-- TRIGGER: Auto-update timestamp
-- ============================================
-- Automatically sets updated_at = NOW() whenever a row is modified.
-- This is a common pattern - you never manually set updated_at.
--
-- How triggers work:
--   1. Define a function that returns TRIGGER
--   2. Create a trigger that calls the function on specific events
--   3. PostgreSQL automatically runs the function

-- The trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
-- $$ is PostgreSQL's way of quoting multi-line strings
BEGIN
  -- NEW is the row being inserted/updated
  -- We modify it before it's written to disk
  NEW.updated_at = NOW();
  RETURN NEW;  -- Must return the (possibly modified) row
END;
$$ LANGUAGE plpgsql;
-- plpgsql = PostgreSQL's procedural language (like stored procedure)

-- Attach the trigger to registry_contacts
DROP TRIGGER IF EXISTS registry_contacts_updated ON registry_contacts;
CREATE TRIGGER registry_contacts_updated
  BEFORE UPDATE ON registry_contacts  -- Run BEFORE the update is written
  FOR EACH ROW                        -- Run once per row (not per statement)
  EXECUTE FUNCTION update_updated_at();


-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- RLS lets you control which rows each user can see/modify.
-- Essential for multi-tenant apps or when using Supabase's auto-generated API.
--
-- How it works:
--   1. Enable RLS on a table
--   2. By default, NO ONE can access anything (implicit deny)
--   3. Create policies that grant specific access
--
-- Policy anatomy:
--   - FOR: which operations (SELECT, INSERT, UPDATE, DELETE, ALL)
--   - TO: which role (anon, authenticated, service_role)
--   - USING: condition for reading (SELECT, UPDATE, DELETE)
--   - WITH CHECK: condition for writing (INSERT, UPDATE)
--
-- Remember: service_role BYPASSES RLS entirely, so these policies
-- only affect anon and authenticated roles.

-- Enable RLS on all tables (required before policies work)
ALTER TABLE registry_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE registry_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE updates_opt_in ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_reminders_log ENABLE ROW LEVEL SECURITY;

-- ========== Block anon access ==========
-- The anon key is public (visible in browser JS).
-- We block ALL access to prevent data scraping.
-- USING (false) = condition never matches = no rows accessible

DROP POLICY IF EXISTS "No anon access" ON registry_contacts;
CREATE POLICY "No anon access" ON registry_contacts 
  FOR ALL                    -- All operations
  TO anon                    -- Apply to anon role
  USING (false);             -- Always false = deny all reads
  -- Note: no WITH CHECK needed because USING(false) blocks everything

DROP POLICY IF EXISTS "No anon access" ON registry_rate_limits;
CREATE POLICY "No anon access" ON registry_rate_limits 
  FOR ALL TO anon USING (false);

DROP POLICY IF EXISTS "No anon access" ON updates_opt_in;
CREATE POLICY "No anon access" ON updates_opt_in 
  FOR ALL TO anon USING (false);

DROP POLICY IF EXISTS "No anon access" ON verification_reminders_log;
CREATE POLICY "No anon access" ON verification_reminders_log 
  FOR ALL TO anon USING (false);

-- ========== Service role full access ==========
-- Edge Functions use service_role key, which bypasses RLS.
-- But we add explicit policies anyway for clarity and future-proofing.
-- USING (true) WITH CHECK (true) = allow everything

DROP POLICY IF EXISTS "Service role access" ON registry_contacts;
CREATE POLICY "Service role access" ON registry_contacts 
  FOR ALL 
  TO service_role 
  USING (true)               -- Can read all rows
  WITH CHECK (true);         -- Can write all rows

DROP POLICY IF EXISTS "Service role access" ON registry_rate_limits;
CREATE POLICY "Service role access" ON registry_rate_limits 
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role access" ON updates_opt_in;
CREATE POLICY "Service role access" ON updates_opt_in 
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role access" ON verification_reminders_log;
CREATE POLICY "Service role access" ON verification_reminders_log 
  FOR ALL TO service_role USING (true) WITH CHECK (true);


-- ============================================
-- FUNCTION: get_contacts_needing_reminders
-- ============================================
-- Returns unverified contacts who need a reminder email.
-- Called by the send-verification-reminders Edge Function.
--
-- Reminder schedule:
--   - 24h reminder: contact is 24-72h old, 0 reminders sent
--   - 72h reminder: contact is 72-144h old, 1 reminder sent
--   - final reminder: contact is 6-7 days old, 2 reminders sent
--
-- IMPORTANT: Does NOT filter by wants_updates!
-- Verification reminders go to ALL unverified signups.
-- wants_updates only affects post-verification bulletins.
--
-- SECURITY DEFINER: function runs with creator's permissions,
-- not caller's. Needed because the function accesses data
-- that the caller (Edge Function) couldn't access directly
-- without service_role.

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
    -- Determine which reminder type based on age and reminder_count
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
      
      ELSE NULL  -- Doesn't qualify for any reminder
    END AS reminder_type,
    rc.created_at
  FROM registry_contacts rc
  WHERE rc.email_verified = FALSE     -- Only unverified
    AND rc.deleted_at IS NULL         -- Not deleted
    AND rc.created_at > NOW() - INTERVAL '7 days';  -- Within 7-day window
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- FUNCTION: get_contacts_for_deletion
-- ============================================
-- Returns unverified contacts past the 7-day verification window.
-- These should be soft-deleted (set deleted_at, not actually removed).
--
-- Called by: cleanup Edge Function or manual maintenance
--
-- Why 7 days?
--   - Gives users reasonable time to verify
--   - Keeps database clean of abandoned signups
--   - GDPR principle: don't retain data longer than necessary

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
  WHERE rc.email_verified = FALSE     -- Never verified
    AND rc.deleted_at IS NULL         -- Not already deleted
    AND rc.created_at < NOW() - INTERVAL '7 days';  -- Older than 7 days
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- FUNCTION: cleanup_rate_limits
-- ============================================
-- Deletes rate limit entries older than 24 hours.
-- Called hourly by pg_cron to prevent table bloat.
--
-- Why 24 hours?
--   - Rate limits typically count requests per hour or day
--   - 24h gives enough window for any reasonable rate limit policy
--   - Keeps table small (only recent data)
--
-- This function doesn't need SECURITY DEFINER because it's called
-- by pg_cron which runs as postgres superuser.

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
-- Views are saved queries that act like virtual tables.
-- Benefits:
--   - Simplify complex queries
--   - Encapsulate business logic in one place
--   - Control what data is exposed
--
-- IMPORTANT: Views do NOT inherit RLS from underlying tables!
-- By default, anyone with SELECT on the view can query it.
-- We restrict sensitive views below.

-- ========== v_mailable_contacts ==========
-- SENSITIVE: Contains PII (emails, locations)
-- Use case: Finding contacts to send bulletins to
-- Access: RESTRICTED to service_role only (see REVOKE below)

CREATE OR REPLACE VIEW v_mailable_contacts AS
SELECT 
  id,
  email,
  email_hash,
  zip_code,
  state_fips,
  cbsa_code,
  dpc_status,
  created_at
FROM registry_contacts
WHERE email_verified = TRUE    -- Must have verified email
  AND email_consent = TRUE     -- Must have consented to email
  AND deleted_at IS NULL;      -- Must not be deleted


-- ========== v_daily_signups ==========
-- SAFE: Aggregated counts only, no PII
-- Use case: Dashboard showing signup trends

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
-- FILTER (WHERE ...): PostgreSQL syntax for conditional counting
-- Much cleaner than CASE WHEN inside COUNT


-- ========== v_coverage ==========
-- SAFE: Aggregated by state, no individual records
-- Use case: Geographic heatmap of interest

CREATE OR REPLACE VIEW v_coverage AS
SELECT 
  state_fips,
  COUNT(*) as signups,
  COUNT(*) FILTER (WHERE email_consent) as with_consent,
  COUNT(*) FILTER (WHERE dpc_status = 'no') as potential_patients
FROM registry_contacts
WHERE state_fips IS NOT NULL   -- Only enriched records
  AND deleted_at IS NULL
GROUP BY state_fips
ORDER BY signups DESC;


-- ========== v_verification_funnel ==========
-- SAFE: Aggregated conversion metrics
-- Use case: Understanding verification flow effectiveness
-- Note: Uses wants_updates filter for accurate funnel analysis

CREATE OR REPLACE VIEW v_verification_funnel AS
SELECT 
  COUNT(*) FILTER (WHERE wants_updates = TRUE) as requested_updates,
  COUNT(*) FILTER (WHERE email_verified = TRUE AND wants_updates = TRUE) as verified,
  COUNT(*) FILTER (WHERE email_verified = FALSE AND wants_updates = TRUE AND deleted_at IS NULL) as pending,
  COUNT(*) FILTER (WHERE deleted_at IS NOT NULL AND wants_updates = TRUE) as expired,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE email_verified = TRUE AND wants_updates = TRUE) / 
    NULLIF(COUNT(*) FILTER (WHERE wants_updates = TRUE), 0),  -- Avoid division by zero
    1  -- Round to 1 decimal place
  ) as verification_rate_pct
FROM registry_contacts
WHERE created_at > NOW() - INTERVAL '30 days';  -- Rolling 30-day window


-- ========== v_reminder_stats ==========
-- SAFE: Aggregated reminder effectiveness
-- Use case: Optimizing reminder email strategy

CREATE OR REPLACE VIEW v_reminder_stats AS
SELECT 
  reminder_type,
  COUNT(*) as sent,
  COUNT(*) FILTER (
    WHERE EXISTS (
      -- Check if this contact eventually verified
      SELECT 1 FROM registry_contacts rc 
      WHERE rc.id = verification_reminders_log.contact_id 
      AND rc.email_verified = TRUE
    )
  ) as led_to_verification
FROM verification_reminders_log
WHERE sent_at > NOW() - INTERVAL '30 days'
GROUP BY reminder_type;


-- ============================================
-- VIEW PERMISSIONS
-- ============================================
-- v_mailable_contacts contains PII - restrict to service_role only.
-- Other views are aggregated stats, safe for default access.
--
-- REVOKE removes previously granted permissions.
-- After this, anon and authenticated cannot query this view.
-- service_role and postgres retain access.

REVOKE ALL ON "public"."v_mailable_contacts" FROM anon;
REVOKE ALL ON "public"."v_mailable_contacts" FROM authenticated;


COMMIT;
-- COMMIT: End the transaction, make all changes permanent
-- If any statement above failed, everything would be rolled back


-- ============================================
-- CRON JOBS (Run SEPARATELY after schema)
-- ============================================
-- These must be run AFTER enabling pg_cron and pg_net extensions.
-- Run these commands one at a time in SQL Editor.
--
-- Why separate? 
--   - cron.schedule() can't be in a transaction
--   - Extensions must be enabled first via Dashboard
--
-- To verify jobs are scheduled: SELECT * FROM cron.job;
-- To see job history: SELECT * FROM cron.job_run_details ORDER BY start_time DESC;

-- ========== 1. Daily verification reminders ==========
-- Runs at 2 PM UTC (9 AM EST, 6 AM PST)
-- Calls Edge Function that sends reminder emails
--
-- SELECT cron.schedule(
--   'daily-verification-reminders',     -- Job name (for reference)
--   '0 14 * * *',                        -- Cron expression: minute hour day month weekday
--                                        -- 0 14 * * * = "at 14:00 (2 PM) every day"
--   $$
--   SELECT net.http_post(
--     url := 'https://qnusztpfauhmqozwuswd.supabase.co/functions/v1/send-verification-reminders',
--     headers := '{"Content-Type": "application/json"}'::jsonb,
--     body := '{}'::jsonb
--   );
--   $$
-- );

-- ========== 2. Hourly rate limit cleanup ==========
-- Runs at the top of every hour
-- Deletes rate limit records older than 24h
--
-- SELECT cron.schedule(
--   'cleanup-rate-limits',
--   '0 * * * *',                         -- 0 * * * * = "at minute 0 of every hour"
--   'SELECT cleanup_rate_limits()'
-- );

-- ========== Cron expression cheat sheet ==========
--   ┌───────────── minute (0 - 59)
--   │ ┌───────────── hour (0 - 23)
--   │ │ ┌───────────── day of month (1 - 31)
--   │ │ │ ┌───────────── month (1 - 12)
--   │ │ │ │ ┌───────────── day of week (0 - 6) (Sunday = 0)
--   │ │ │ │ │
--   * * * * *
--
-- Examples:
--   '0 14 * * *'   = 2:00 PM every day
--   '0 * * * *'    = Every hour on the hour
--   '*/15 * * * *' = Every 15 minutes
--   '0 9 * * 1'    = 9:00 AM every Monday


-- ============================================
-- TEARDOWN (DANGEROUS - DESTROYS ALL DATA)
-- ============================================
-- Uncomment and run ONLY to completely reset the schema.
-- This deletes ALL data and is NOT reversible.
-- 
-- Use case: Starting fresh in development, NOT in production.
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
-- Run this after setup to confirm tables exist and check row counts.
-- All counts should be 0 for a fresh install.

SELECT 
  'registry_contacts' as table_name, COUNT(*) as rows FROM registry_contacts
UNION ALL SELECT 'updates_opt_in', COUNT(*) FROM updates_opt_in
UNION ALL SELECT 'registry_rate_limits', COUNT(*) FROM registry_rate_limits
UNION ALL SELECT 'verification_reminders_log', COUNT(*) FROM verification_reminders_log;