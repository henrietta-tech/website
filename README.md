# Henrietta

Infrastructure for patient-controlled health data.

Henrietta is a design principle.

Her name serves as a constant reminder that our actions have consequences. Every architectural decision touches someone's life. Every shortcut has a cost. Behind every dataset is a person.

## Quick Start

```bash
npm install
cp .env.example .env
# Add your Supabase credentials to .env
npm run dev
```

The app runs at `http://localhost:5173`.

## Project Structure

```
├── src/
│   ├── components/     # UI components (Hero, Door, Footer, Registry)
│   ├── hooks/          # Custom hooks (useDoorState, useRegistry, useScrollTracking)
│   ├── pages/          # Route pages (HomePage, ExplorePage)
│   ├── services/       # API layer (registryService)
│   ├── constants/      # Content and configuration
│   ├── lib/            # Utilities
│   └── styles/         # CSS
├── emails/             # React Email templates
├── supabase/
│   ├── functions/      # Edge functions
│   └── migrations/     # Database schema
└── public/             # Static assets
```

## Architecture

React 18 application with Vite, deployed to Netlify with a Supabase backend.

### Two-Page Structure

| Route | Purpose |
|-------|---------|
| `/` | Hero — first impression, decision point |
| `/explore` | Doors — progressive disclosure of information |

### Component Pattern

```
Component (presentation)
    ↓
Hook (state + logic)
    ↓
Service (API calls)
    ↓
Constants (content)
```

**Components** render UI. **Hooks** manage state and behavior. **Services** handle external communication. **Constants** store all copy and configuration — no hardcoded strings in components.

### Key Components

| Component | Purpose |
|-----------|---------|
| `Hero` | Landing section with dual CTAs |
| `Door` | Expandable content panels (6 total) |
| `Registry` | Multi-step signup modal |
| `MobileCTA` | Sticky button on `/explore` after scroll engagement |
| `Footer` | Links and legal |

### Custom Hooks

| Hook | Purpose |
|------|---------|
| `useDoorState` | Manages which doors are open/closed |
| `useRegistry` | Form state and submission logic |
| `useScrollTracking` | Tracks scroll depth for mobile CTA trigger |

## Database

### `landing_page_leads` table

```sql
create table landing_page_leads (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  zip_code text,
  dpc_status text,
  contact_preference text,
  referral_source text,
  created_at timestamp with time zone default now(),
  user_agent text,
  screen_width integer,
  utm_source text,
  utm_campaign text,
  utm_medium text,
  metadata jsonb,
  processed boolean default false
);
```

### Row Level Security

Anonymous users can insert only. No read, update, or delete access.

```sql
-- Enable RLS
alter table landing_page_leads enable row level security;

-- Insert-only policy for anon
create policy "Allow anonymous inserts only"
  on landing_page_leads
  for insert
  to anon
  with check (true);
```

## Email Templates

React Email templates in `/emails`:

| Template | Trigger |
|----------|---------|
| `VerificationEmail` | Immediately after signup |
| `WelcomeEmail` | After email verification |
| `Reminder24hEmail` | 24h if unverified |
| `Reminder72hEmail` | 72h if unverified |
| `ReminderFinalEmail` | Final reminder before expiry |

Preview templates:
```bash
npm run email
```

## Environment Variables

Required in `.env`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Get these from [Supabase Dashboard → Settings → API](https://app.supabase.com/project/_/settings/api).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run email` | Email template preview |

## Deployment

### Netlify

The included `netlify.toml` handles:
- Build command and publish directory
- Security headers (X-Frame-Options, CSP, etc.)
- Asset caching (1 year for `/assets/*`)
- SPA routing (all routes → `index.html`)

### Environment Variables

Set in Netlify dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Tech Stack

- **Frontend**: React 18, React Router, Tailwind CSS
- **Build**: Vite
- **Backend**: Supabase (PostgreSQL, Edge Functions)
- **Email**: React Email
- **Hosting**: Netlify
- **Monitoring**: Sentry

