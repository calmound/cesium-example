# AGENTS.md - Cesium Example Project

## Project Overview

React + TypeScript + Vite project with Cesium 3D globe. A code playground for learning Cesium.

## Build/Lint/Test Commands

```bash
# Development
npm run dev              # Start Vite dev server

# Production
npm run build            # TypeScript check + Vite build
npm run preview          # Preview production build

# Linting
npm run lint             # Run ESLint on all files
```

## Code Style Guidelines

### General
- **TypeScript strict mode** enabled but `noUnusedLocals: false` and `noUnusedParameters: false`
- **verbatimModuleSyntax: true** - use `import type` for type-only imports
- **ES2023 target** with **ESNext modules**
- **Path alias**: `@/*` resolves to `./src/*`

### File Structure
```
src/
├── components/     # React components
│   ├── ui/         # Reusable UI primitives (button, badge, tooltip, etc.)
│   └── example/   # Example-specific components
├── examples/       # Cesium code examples and metadata
├── lib/           # Utilities (utils.ts with cn helper)
├── pages/         # Route pages
├── router/        # React Router configuration
├── store/         # Zustand state stores
└── utils/         # Helper functions (monaco-setup, cesium helpers)
```

### Imports
- Use `import type` for type-only imports (required due to verbatimModuleSyntax)
- Use absolute path aliases: `import { Button } from '@/components/ui/button'`
- CSS imports after imports: `import './index.css'`
- Order: React → external libs → internal imports → CSS

### Component Conventions
- **Functional components only** with explicit `React.FC` type annotation for page components
- Use `React.forwardRef` for components that need refs (see button.tsx)
- Display name pattern: `ComponentName.displayName = 'ComponentName'`
- Destructure props with defaults: `({ className, variant = 'default', ...props })`

### Naming Conventions
- Components: PascalCase (`ExampleHeader`, `CodeEditor`)
- Functions/variables: camelCase (`useExampleStore`, `handleRun`)
- Interfaces: PascalCase with descriptive names (`ExampleMeta`, `CreateViewerOptions`)
- File names: kebab-case for non-component files (`create-viewer.ts`), PascalCase.tsx for components

### TypeScript Patterns
```typescript
// Interface for component props
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

// Zustand store
interface ExampleState {
  currentExample: ExampleMeta | null
  setCurrentExample: (example: ExampleMeta | null) => void
}

export const useExampleStore = create<ExampleState>()(
  persist(
    (set, get) => ({ ... }),
    { name: 'storage-key', partialize: (state) => ({ ... }) }
  )
)
```

### CSS/Tailwind
- Tailwind CSS v4 with CSS-first configuration
- Use `@/lib/utils` `cn()` function for class merging (clsx + tailwind-merge)
- Custom CSS in `index.css` with design tokens via CSS variables
- Tailwind arbitrary values allowed

### State Management
- **Zustand** for global state with persist middleware
- `create<StateInterface>()` generic typing
- Use `partialize` in persist config to whitelist persisted fields

### Error Handling
- Guard clauses with early returns: `if (!id) return null`
- Optional chaining for nested access: `currentExample?.id`
- Nullish coalescing for defaults: `Object.keys(example.files)[0] ?? 'main.ts'`

### React Patterns
- Use `useCallback` for callbacks passed as props
- Use `useRef` for DOM refs and debounce timers
- Prefer explicit dependency arrays; use `// eslint-disable-line react-hooks/exhaustive-deps` sparingly
- Conditional rendering for optional UI: `{condition && <Component />}`

### Linting
- ESLint flat config (eslint.config.js)
- TypeScript ESLint ruleset with recommended rules
- React Hooks plugin enabled
- React Refresh plugin for Vite HMR compatibility
- Ignores: `dist/` directory

### Common Tasks
```typescript
// Add a new Cesium example
1. Add ExampleMeta object in src/examples/catalog.ts
2. Define files: { 'main.ts': '...', 'style.css': '...' }
3. Set level: 'easy' | 'medium' | 'hard'
4. Add guide.features and guide.points arrays

// Add a UI component
1. Create in src/components/ui/ with PascalCase name
2. Use cn() for Tailwind classes
3. Extend Radix UI primitives when available
4. Export both component and variant/cva if applicable

// Add a store
1. Create in src/store/ with descriptive name
2. Use persist() for localStorage persistence
3. Define interfaces for state and actions
4. Export typed hook: useStoreName
```

### Build Notes
- `tsconfig.app.json` for app code, `tsconfig.node.json` for Vite config
- `noEmit: true` - Vite handles the build with esbuild
- Cesium is loaded via `vite-plugin-cesium`
- Monaco editor configured in `src/utils/monaco-setup.ts`
