# Henrietta Architecture

## Design Philosophy

This application embodies enterprise-grade React architecture with proper separation of concerns, following industry best practices for maintainability, scalability, and testability.

## Core Principles

### 1. Separation of Concerns
Each directory has a single, well-defined purpose:
- **Components**: Pure presentation logic
- **Hooks**: Stateful logic extraction  
- **Pages**: Component orchestration
- **Services**: External integrations
- **Constants**: Configuration and content

### 2. Composition Over Inheritance
Components are composed of smaller, reusable pieces rather than using complex inheritance hierarchies.

### 3. Single Responsibility
Each file/function/component has one clear purpose.

### 4. Dependency Direction
- Pages depend on Components and Hooks
- Components depend on Constants
- Hooks may depend on Services
- Services are standalone (no internal dependencies)

## Directory Structure Explained

### `/src/components`
**Purpose**: Reusable UI building blocks

**Guidelines**:
- Each component in its own directory
- Include index.js for clean imports
- Props-based configuration (no internal state when possible)
- JSDoc comments for all props

**Example**:
```
components/
  Hero/
    Hero.jsx        # Component implementation
    index.js        # Export
```

### `/src/pages`
**Purpose**: Top-level views that compose components

**Guidelines**:
- Represent full application views
- Orchestrate multiple components
- Connect components to hooks
- Handle routing (when added)

**Current pages**:
- `LandingPage`: Main entry point

### `/src/hooks`
**Purpose**: Reusable stateful logic

**Guidelines**:
- Start with `use` prefix
- Return objects with descriptive names
- Document inputs and outputs
- Keep focused on single concern

**Current hooks**:
- `useDoorState`: Door expand/collapse management
- `useRegistry`: Form state and progression
- `useScrollTracking`: Scroll-based UI behavior

### `/src/constants`
**Purpose**: Configuration and content

**Guidelines**:
- Centralize all text content
- Use structured data (not JSX)
- Makes content updates easy
- Enables future i18n

**Current**:
- `doorContent.js`: All page content

### `/src/services`
**Purpose**: External API and service integrations

**Guidelines**:
- One service file per external system
- Async functions only
- Handle errors gracefully
- Return consistent data shapes

**Example**:
- `registryService.js`: Registry API calls

### `/src/styles`
**Purpose**: Global styles and CSS

**Guidelines**:
- Use for global animations
- Tailwind utilities in components
- Keep CSS minimal

## Data Flow

```
User Interaction
      ↓
Event Handler (in Page)
      ↓
Hook Updates State
      ↓
State Change
      ↓
Props to Components
      ↓
UI Re-renders
```

## State Management Strategy

### Local State (useState)
Used for:
- UI-only state (modals, dropdowns)
- Temporary form input
- Component-specific toggles

### Custom Hooks
Used for:
- Shared stateful logic
- Complex state transitions
- Side effects (useEffect)

### Future: Context/Redux
Consider when:
- State shared across many components
- Deep prop drilling becomes painful
- Complex global state requirements

## Component Patterns

### Container/Presentational Pattern

**Container** (LandingPage):
```javascript
// Handles logic, state, and side effects
const LandingPage = () => {
  const { state, actions } = useCustomHook();
  
  return <PresentationalComponent data={state} onAction={actions.doThing} />;
};
```

**Presentational** (Hero, Door):
```javascript
// Pure UI, receives data via props
const Hero = ({ onJoinRegistry, onUnderstandWhy }) => {
  return <div>...</div>;
};
```

### Compound Components Pattern

Used in Registry:
```javascript
<RegistryModal>
  <RegistryStep1 />
  <RegistryStep2 />
  <RegistryStep3 />
</RegistryModal>
```

Each step is isolated but composed into a larger flow.

## Scaling Strategies

### Adding Features

**New Page**:
1. Create in `/pages/NewPage/`
2. Compose existing components
3. Create new components if needed
4. Extract shared logic to hooks

**New API Integration**:
1. Create service in `/services/`
2. Call from hook or component
3. Handle loading/error states

**New Content Section**:
1. Add to `/constants/doorContent.js`
2. Component automatically renders it

### Code Organization as You Grow

**When you need**:
- **Routing**: Add `react-router-dom`, create `/routes`
- **Global State**: Add context or Redux, create `/store` or `/context`
- **Utils**: Create `/utils` for helper functions
- **Types**: Add TypeScript, create `/types`
- **Tests**: Mirror structure in `/tests` or `__tests__`

## Performance Considerations

### Current Optimizations
- Lazy state updates (batched by React)
- Minimal re-renders (props stability)
- CSS animations over JS

### Future Optimizations
- `React.memo` for expensive components
- `useMemo`/`useCallback` for expensive computations
- Code splitting with `React.lazy`
- Image optimization

## Testing Strategy (Future)

### Unit Tests
- Test hooks in isolation
- Test service functions
- Test utility functions

### Component Tests
- Render with different props
- Test user interactions
- Verify callback execution

### Integration Tests
- Test page-level flows
- Test form submissions
- Test navigation

### E2E Tests
- Critical user journeys
- Registry completion
- Mobile responsiveness

## Migration Path from Old Structure

**Before** (monolithic):
```
HenriettaFinal.jsx (500+ lines)
```

**After** (modular):
```
pages/LandingPage/          # 50 lines
hooks/useDoorState.js       # 30 lines
hooks/useRegistry.js        # 50 lines
hooks/useScrollTracking.js  # 30 lines
components/Hero/            # 50 lines
components/Door/            # 100 lines
components/Registry/...     # 150 lines total
constants/doorContent.js    # 200 lines
```

### Benefits Achieved
- **Findability**: File names match feature names
- **Testability**: Each file has clear inputs/outputs
- **Maintainability**: Changes isolated to specific files
- **Onboarding**: New developers understand structure quickly

## Best Practices Checklist

### When Creating Components
- [ ] Does it have a single clear purpose?
- [ ] Are props documented?
- [ ] Is it in the right directory?
- [ ] Does it need to be its own component?

### When Creating Hooks
- [ ] Does it start with `use`?
- [ ] Is the logic reusable?
- [ ] Are inputs/outputs clear?
- [ ] Is it focused on one concern?

### When Adding Content
- [ ] Is it in constants, not hardcoded?
- [ ] Is it structured for easy updates?
- [ ] Will it support future i18n?

### When Integrating APIs
- [ ] Is it in a service file?
- [ ] Does it handle errors?
- [ ] Is loading state managed?
- [ ] Are responses typed/validated?

## References

This architecture follows patterns from:
- [React Documentation](https://react.dev)
- [Kent C. Dodds - Application State Management](https://kentcdodds.com/blog/application-state-management-with-react)
- [Bulletproof React](https://github.com/alan2207/bulletproof-react)
- [React Folder Structure Best Practices](https://www.robinwieruch.de/react-folder-structure/)
