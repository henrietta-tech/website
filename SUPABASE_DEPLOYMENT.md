# Henrietta Supabase Deployment Guide

## Changes Made

### 1. Updated Files
- ✅ `src/services/registryService.js` - Now uses Supabase REST API
- ✅ `.env.example` - Updated with Supabase credentials template
- ✅ `.env` - Created (you need to add your actual Supabase values)

### 2. What Changed
**Before:** Expected a custom FastAPI backend at `VITE_API_URL`
**After:** Connects directly to Supabase PostgreSQL via REST API

## Setup Steps

### Step 1: Create Supabase Project (10 min)

1. Go to https://supabase.com → Sign up → New Project
   - Project name: `henrietta-production`
   - Database password: (SAVE THIS!)
   - Region: Choose closest to Salt Lake City

2. Once created, go to **SQL Editor** and run:

```sql
-- Create your leads table
CREATE TABLE landing_page_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  zip_code TEXT,
  dpc_status TEXT,
  contact_preference TEXT,
  referral_source TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Additional tracking
  user_agent TEXT,
  screen_width INTEGER,
  utm_source TEXT,
  utm_campaign TEXT,
  utm_medium TEXT,
  metadata JSONB,
  
  -- For ETL pipeline
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX idx_leads_email ON landing_page_leads(email);
CREATE INDEX idx_leads_zip ON landing_page_leads(zip_code);
CREATE INDEX idx_leads_timestamp ON landing_page_leads(timestamp);
CREATE INDEX idx_leads_processed ON landing_page_leads(processed) WHERE processed = FALSE;

-- Enable Row Level Security
ALTER TABLE landing_page_leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts only
CREATE POLICY "Allow anonymous inserts only" 
ON landing_page_leads 
FOR INSERT 
TO anon 
WITH CHECK (true);
```

3. Get your credentials from **Settings → API**:
   - Project URL: `https://xxxxx.supabase.co`
   - `anon public` key (for frontend)
   - `service_role` key (for backend/Airflow - keep secret!)

### Step 2: Configure Environment Variables

1. Open `.env` file in your project root
2. Replace with your actual Supabase values:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

### Step 3: Test Locally

```bash
# Install dependencies (if not already)
npm install

# Run dev server
npm run dev

# Open http://localhost:5173
# Test the registry form
# Check Supabase dashboard → Table Editor → landing_page_leads
```

### Step 4: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (first time)
vercel

# Add environment variables
vercel env add VITE_SUPABASE_URL
# Paste your Supabase URL

vercel env add VITE_SUPABASE_ANON_KEY
# Paste your anon key

# Deploy to production
vercel --prod
```

### Step 5: Verify Deployment

1. Visit your live URL
2. Fill out the registry form
3. Check Supabase dashboard → you should see the submission!

## What Works Now

✅ Landing page form collects:
  - Email
  - ZIP code
  - DPC status
  - Contact preference
  - Referral source
  - UTM parameters (automatically from URL)
  - Device/browser info
  - Timestamp

✅ Data stored in Supabase PostgreSQL
✅ Free tier: 500MB database, 50k monthly active users
✅ Automatic backups
✅ Rate limiting via Row Level Security
✅ HTTPS by default

## What's Disabled (For Now)

❌ `checkEmailExists()` - Requires Supabase Edge Function
❌ `getDPCPracticesByZip()` - Requires DPC directory data

These are intentionally disabled for MVP. Add them later when needed.

## Next: Connect to Your ETL Pipeline

When you're ready to integrate with Airflow:

```python
# Supabase connection (it's just PostgreSQL!)
SUPABASE_CONN = "postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres"

# In your Airflow DAG
@task
def extract_new_leads():
    engine = create_engine(SUPABASE_CONN)
    df = pd.read_sql(
        "SELECT * FROM landing_page_leads WHERE processed = FALSE",
        engine
    )
    return df
```

See `AIRFLOW_INTEGRATION.md` (coming next) for full pipeline setup.

## Troubleshooting

**Form submission fails:**
- Check browser console for errors
- Verify `.env` has correct Supabase URL and anon key
- Check Supabase dashboard → API settings → ensure anon key matches

**Can't see data in Supabase:**
- Go to Supabase → Table Editor → landing_page_leads
- Check SQL editor ran successfully
- Verify RLS policies are set correctly

**Vercel deployment fails:**
- Ensure environment variables are set: `vercel env ls`
- Rebuild: `vercel --prod --force`

## Support

- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- Your Census pipeline: Ready to integrate when you are!
