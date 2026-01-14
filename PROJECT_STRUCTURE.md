# Henrietta Project Structure

```
henrietta-refactored/
│
├── public/                     # Static assets (if needed)
│
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── Hero/
│   │   │   ├── Hero.jsx      # Hero section component
│   │   │   └── index.js      # Barrel export
│   │   │
│   │   ├── Door/
│   │   │   ├── Door.jsx      # Collapsible content section
│   │   │   └── index.js
│   │   │
│   │   ├── Footer/
│   │   │   ├── Footer.jsx    # Site footer
│   │   │   └── index.js
│   │   │
│   │   ├── MobileCTA/
│   │   │   ├── MobileCTA.jsx # Sticky mobile CTA
│   │   │   └── index.js
│   │   │
│   │   ├── Registry/
│   │   │   ├── RegistryModal.jsx  # Modal wrapper
│   │   │   ├── RegistryStep1.jsx  # Email + ZIP step
│   │   │   ├── RegistryStep2.jsx  # Optional questions
│   │   │   ├── RegistryStep3.jsx  # Confirmation
│   │   │   └── index.js
│   │   │
│   │   └── index.js          # Component barrel exports
│   │
│   ├── pages/                # Top-level page components
│   │   └── LandingPage/
│   │       ├── LandingPage.jsx    # Main landing page
│   │       └── index.js
│   │
│   ├── hooks/                # Custom React hooks
│   │   ├── useDoorState.js       # Door expand/collapse logic
│   │   ├── useRegistry.js        # Registry form management
│   │   ├── useScrollTracking.js  # Scroll behavior tracking
│   │   └── index.js              # Hooks barrel exports
│   │
│   ├── services/             # API and external services
│   │   ├── registryService.js    # Registry API calls
│   │   └── index.js
│   │
│   ├── constants/            # Configuration and content
│   │   └── doorContent.js        # All page content
│   │
│   ├── styles/               # Global styles
│   │   └── animations.css        # CSS animations
│   │
│   ├── App.jsx               # Root component
│   ├── main.jsx              # Application entry point
│   └── index.css             # Global CSS + Tailwind
│
├── .env.example              # Environment variables template
├── .gitignore               # Git ignore rules
├── ARCHITECTURE.md          # Architecture documentation
├── README.md                # Getting started guide
├── PROJECT_STRUCTURE.md     # This file
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── postcss.config.js        # PostCSS configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── vite.config.js           # Vite build configuration
```

## File Count by Category

- **Components**: 5 main components, 17 files total
- **Pages**: 1 page
- **Hooks**: 3 custom hooks
- **Services**: 1 service (with room to grow)
- **Configuration**: 8 config files
- **Documentation**: 3 markdown files

## Import Patterns

### Component Imports (using barrel exports)
```javascript
import { Hero, Door, RegistryModal } from '../components';
```

### Hook Imports
```javascript
import { useDoorState, useRegistry } from '../hooks';
```

### Service Imports
```javascript
import { submitRegistry } from '../services';
```

### Constants
```javascript
import { doorContent, heroContent } from '../constants/doorContent';
```

## Growth Patterns

### As the project scales, you might add:

```
src/
├── assets/              # Images, fonts, icons
├── context/             # React Context providers
├── utils/               # Helper functions
├── types/               # TypeScript type definitions
├── routes/              # Routing configuration
├── __tests__/           # Test files
└── config/              # App configuration
```

## Key Design Decisions

1. **Barrel Exports** (`index.js` files)
   - Clean imports: `from '../components'` vs `from '../components/Hero/Hero'`
   - Easy to reorganize files without breaking imports

2. **Hook Extraction**
   - Keeps components clean and focused on UI
   - Makes logic reusable across components
   - Easier to test stateful logic

3. **Content in Constants**
   - Separates content from code
   - Makes updates easier
   - Prepares for future i18n

4. **Component Directories**
   - Each component in its own folder
   - Room for component-specific files (styles, tests, etc.)
   - Scales well as components grow

5. **Services Directory**
   - Centralizes external integrations
   - Makes API changes easier
   - Enables mock services for testing
