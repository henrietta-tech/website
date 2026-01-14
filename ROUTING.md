# Routing Update - Two Page Architecture

## What Changed

The application now uses React Router to create two distinct pages:

### Before
- Single scrolling page
- Hero at top, doors below
- No clear separation

### After
- **`/`** - Home page (Hero standalone)
- **`/explore`** - Explore page (Doors with header)
- Clean separation between consideration and exploration

## Page Structure

### Home Page (`/`)
**Content:**
- Hero section (centered)
- Two CTAs:
  - "Join the Registry" → Opens modal
  - "Understand Why This Matters" → Navigates to `/explore`
- Footer with links

**Purpose:**
- First impression
- Decision point
- No distractions

### Explore Page (`/explore`)
**Content:**
- Header with title and introduction
- Back link to home
- All 6 door sections
- Mobile sticky CTA (appears after engagement)
- Footer

**Header text:**
> **Henrietta**
>
> Explore how and why we're creating infrastructure for patient-owned health data. Choose what interests you.

## User Flows

### Flow 1: Join Directly
1. Land on `/`
2. Click "Join the Registry"
3. Complete form
4. Done

### Flow 2: Explore First
1. Land on `/`
2. Click "Understand Why This Matters"
3. Navigate to `/explore`
4. Open doors to explore
5. Click "Ready to participate" in Door 6 OR mobile CTA
6. Complete form

### Flow 3: Share Doors
- Someone can share `/explore` directly
- New visitors see the header immediately
- Can explore without seeing hero first

## Implementation Details

### New Dependencies
```json
"react-router-dom": "^6.28.0"
```

### New Files
```
src/pages/
├── HomePage/
│   ├── HomePage.jsx     # Hero standalone
│   └── index.js
├── ExplorePage/
│   ├── ExplorePage.jsx  # Doors with header
│   └── index.js
└── LandingPage/          # (kept for reference, unused)
```

### Updated Files
- `src/App.jsx` - Now uses BrowserRouter with Routes
- `package.json` - Added react-router-dom

### Navigation Components
- **Hero**: Triggers callback (HomePage converts to navigation)
- **ExplorePage**: Includes "← Back" link to return home
- **Mobile CTA**: Only appears on `/explore` page

## Technical Benefits

1. **Shareable URLs**: Can send people directly to doors
2. **Browser Navigation**: Back button works naturally
3. **Analytics Ready**: Can track page views separately
4. **SEO Friendly**: Two distinct pages for search engines
5. **Future Scaling**: Easy to add more routes

## Philosophy Alignment

This structure embodies Henrietta's values:

**Agency:**
- Clear choice between two paths
- No forced progression
- Can enter at either point

**Consent:**
- Doors page only shown if requested
- Back link provides exit
- No scroll traps

**Respect:**
- Hero gets full attention
- Exploration is optional
- Each page has singular purpose

**Infrastructure:**
- Proper routing foundation
- Scalable architecture
- Professional patterns

## Installation

If you're pulling this update:

```bash
# Install new dependency
npm install

# Run dev server
npm run dev
```

## Testing Checklist

- [ ] Navigate from `/` to `/explore` using button
- [ ] Navigate back using "← Back" link
- [ ] Direct navigation to `/explore` works
- [ ] Browser back button works
- [ ] Registry modal works from both pages
- [ ] Mobile CTA only shows on `/explore`
- [ ] Footer links work on both pages

## Future Routes

Easy to add:
- `/about` - About page
- `/statement` - Statement of Use detail
- `/practices` - DPC practice directory
- `/updates` - Blog/updates feed

## Notes

- The old `LandingPage` component is kept but unused
- Can be removed in future cleanup
- All functionality preserved from original design
- Mobile CTA logic unchanged (only displays on explore page now)
