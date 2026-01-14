# Henrietta Quick Start Guide

## What Changed

Your monolithic `HenriettaFinal.jsx` (573 lines) has been refactored into a professional React application with proper separation of concerns.

### Before
```
src/
├── HenriettaFinal.jsx  (573 lines - everything in one file)
├── App.jsx
└── main.jsx
```

### After
```
src/
├── components/     (5 component groups, 17 files)
├── pages/          (1 page)
├── hooks/          (3 custom hooks)
├── services/       (1 service, ready to expand)
├── constants/      (centralized content)
└── styles/         (animations)
```

## Installation & Running

### 1. Extract the Archive
```bash
cd ~/Desktop
tar -xzf henrietta-refactored.tar.gz
cd henrietta-refactored
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

Open http://localhost:5173

### 4. Build for Production
```bash
npm run build
```

Output goes to `/dist` directory

## Key Improvements

### ✅ Fixed Issues
- **Apostrophe bug**: All fixed (proper straight quotes)
- **Code organization**: Enterprise-grade structure
- **Maintainability**: Easy to find and update code
- **Scalability**: Ready to grow

### 🎯 Architectural Benefits

**1. Separation of Concerns**
- UI components don't manage complex state
- Business logic in hooks
- Content in constants
- API calls in services

**2. Reusability**
```javascript
// Use the same hook in different components
const { openRegistry } = useRegistry();
```

**3. Testability**
```javascript
// Test hooks in isolation
import { renderHook } from '@testing-library/react-hooks';
import { useDoorState } from './useDoorState';

test('toggles door', () => {
  const { result } = renderHook(() => useDoorState());
  // ... test logic
});
```

**4. Team Collaboration**
- Clear file ownership
- Reduced merge conflicts
- Easy code review

## Making Changes

### Update Content
Edit `src/constants/doorContent.js`

### Add New Component
```bash
mkdir src/components/NewComponent
touch src/components/NewComponent/NewComponent.jsx
touch src/components/NewComponent/index.js
```

### Add API Integration
```bash
touch src/services/newService.js
```

Then use in your hook:
```javascript
import { callNewAPI } from '../services';
```

### Add New Hook
```bash
touch src/hooks/useNewFeature.js
```

Export from `src/hooks/index.js`

## File Guide

### Most Frequently Edited

**Content Updates**:
- `src/constants/doorContent.js` - All text content

**Component Changes**:
- `src/components/Door/Door.jsx` - Door rendering logic
- `src/components/Registry/RegistryStep*.jsx` - Form steps

**Logic Changes**:
- `src/hooks/useRegistry.js` - Form behavior
- `src/hooks/useDoorState.js` - Door behavior

**API Integration**:
- `src/services/registryService.js` - Add your API endpoints here

### Configuration Files

**Environment**:
- `.env` - Create this from `.env.example`
- Add your API URL: `VITE_API_URL=https://api.henrietta.com`

**Build**:
- `vite.config.js` - Vite configuration
- `tailwind.config.js` - Tailwind settings
- `package.json` - Dependencies

## Next Steps

### 1. Connect Real API
Update `src/hooks/useRegistry.js`:

```javascript
import { submitRegistry } from '../services';

const completeRegistry = async () => {
  try {
    const result = await submitRegistry(formData);
    if (result.success) {
      setRegistryStep(3);
    } else {
      // Handle error
      console.error(result.error);
    }
  } catch (error) {
    console.error('Registration failed:', error);
  }
};
```

### 2. Add Analytics
```bash
npm install @vercel/analytics
```

In `src/main.jsx`:
```javascript
import { Analytics } from '@vercel/analytics/react';

// In render:
<StrictMode>
  <App />
  <Analytics />
</StrictMode>
```

### 3. Add Routing
```bash
npm install react-router-dom
```

Create `src/routes.jsx`:
```javascript
import { createBrowserRouter } from 'react-router-dom';
import LandingPage from './pages/LandingPage';

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  // Add more routes
]);
```

### 4. Add Testing
```bash
npm install -D vitest @testing-library/react @testing-library/react-hooks
```

## Documentation

- **README.md** - Getting started, features, technologies
- **ARCHITECTURE.md** - Design decisions, patterns, best practices
- **PROJECT_STRUCTURE.md** - File organization, import patterns
- **QUICKSTART.md** - This file

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Upload /dist folder
```

### Any Static Host
```bash
npm run build
# Upload /dist folder to your host
```

## Troubleshooting

### Port Already in Use
```bash
npm run dev -- --port 3000
```

### Build Fails
```bash
rm -rf node_modules
rm package-lock.json
npm install
npm run build
```

### Styles Not Loading
Check that `src/main.jsx` imports:
```javascript
import './index.css';
import './styles/animations.css';
```

## Support

- Check README.md for detailed information
- Review ARCHITECTURE.md for design patterns
- Look at existing components for examples
- All components have JSDoc comments

## Philosophy Preserved

This refactoring maintains Henrietta's core philosophy:
- **Agency**: User-controlled interactions
- **Consent**: Progressive disclosure
- **Respect**: Calm, non-manipulative UX
- **Infrastructure**: Built to last

The code structure now mirrors these values through clean architecture and clear boundaries.
