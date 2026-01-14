# Henrietta Healthcare Platform

A React application for the Henrietta healthcare infrastructure project, built with modern best practices and proper separation of concerns.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Hero/           # Landing hero section
│   ├── Door/           # Collapsible content sections
│   ├── Footer/         # Site footer
│   ├── MobileCTA/      # Mobile sticky CTA
│   └── Registry/       # Multi-step registry form
│       ├── RegistryModal.jsx
│       ├── RegistryStep1.jsx
│       ├── RegistryStep2.jsx
│       └── RegistryStep3.jsx
├── pages/              # Top-level page components
│   └── LandingPage/    # Main landing page
├── hooks/              # Custom React hooks
│   ├── useDoorState.js      # Door expand/collapse logic
│   ├── useRegistry.js       # Registry form state
│   └── useScrollTracking.js # Scroll-based UI logic
├── constants/          # Content and configuration
│   └── doorContent.js  # All page content centralized
├── styles/             # Global styles and animations
│   └── animations.css  # CSS animations
├── services/           # API and external service integrations
│   └── (add your API services here)
├── App.jsx            # Main app component
├── main.jsx           # Application entry point
└── index.css          # Global CSS with Tailwind
```

## Key Features

### Separation of Concerns
- **Components**: Pure UI components that receive data via props
- **Hooks**: Reusable stateful logic extracted from components
- **Constants**: Centralized content management for easy updates
- **Pages**: Top-level components that orchestrate smaller components

### Custom Hooks

#### `useDoorState()`
Manages the expand/collapse state of content sections ("doors").

```javascript
const {
  expandedDoors,      // Object tracking which doors are open
  doorsHighlighted,   // Boolean for highlight animation
  toggleDoor,         // Function to toggle a specific door
  highlightAllDoors,  // Function to briefly highlight all doors
  getExpandedCount    // Function to count open doors
} = useDoorState();
```

#### `useRegistry()`
Manages the multi-step registration form state.

```javascript
const {
  showRegistry,      // Boolean to show/hide modal
  registryStep,      // Current step (1, 2, or 3)
  formData,          // Form field values
  openRegistry,      // Function to open modal
  closeRegistry,     // Function to close and reset
  updateFormData,    // Function to update field values
  goToStep2,         // Function to advance to step 2
  completeRegistry   // Function to complete registration
} = useRegistry();
```

#### `useScrollTracking(expandedDoors, door6Ref)`
Tracks scroll position and door engagement to show/hide mobile CTA.

```javascript
const showMobileCTA = useScrollTracking(expandedDoors, door6Ref);
```

### Component Architecture

All components follow these principles:
- Single Responsibility Principle
- Props for configuration and callbacks
- No direct state management (delegated to hooks)
- Fully documented with JSDoc comments

### Content Management

All page content is centralized in `src/constants/doorContent.js`. This includes:
- Door titles and summaries
- Full content for each section
- Registry form configuration
- Hero and footer text

This makes content updates easy without touching component code.

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens development server at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Creates optimized production build in `/dist`

### Preview Production Build

```bash
npm run preview
```

## Adding New Features

### Adding a New Service (API Integration)

Create a new service file in `src/services/`:

```javascript
// src/services/registryService.js
export const submitRegistry = async (formData) => {
  const response = await fetch('/api/registry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  return response.json();
};
```

Then use it in your hook:

```javascript
// In src/hooks/useRegistry.js
import { submitRegistry } from '../services/registryService';

const completeRegistry = async () => {
  try {
    await submitRegistry(formData);
    setRegistryStep(3);
  } catch (error) {
    console.error('Registration failed:', error);
  }
};
```

### Adding a New Page

1. Create a new directory in `src/pages/`
2. Add your page component
3. Export it from an index.js
4. Import and use in App.jsx

### Adding a New Component

1. Create a new directory in `src/components/`
2. Add your component file
3. Export from index.js
4. Add to barrel export in `src/components/index.js`

## Architecture Benefits

### Maintainability
- Easy to locate and update specific functionality
- Changes to one component don't affect others
- Clear responsibility boundaries

### Scalability
- Add new pages without restructuring
- Reuse components across different pages
- Share hooks between components

### Testability
- Hooks can be tested in isolation
- Components receive props (easy to mock)
- Pure functions in services

### Developer Experience
- Consistent file organization
- Predictable file locations
- Self-documenting structure

## Technologies

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Clean, consistent icons
- **ESLint**: Code quality and consistency

## Philosophy

This application embodies the Henrietta philosophy:
- **Agency**: Users control their engagement depth
- **Consent**: Progressive disclosure, no forced paths
- **Respect**: Calm interactions, no manipulation
- **Infrastructure**: Built to last, not to extract

The code structure mirrors these values through clean separation, clear contracts, and respectful user interactions.
# henrietta
