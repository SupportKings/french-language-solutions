# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack monorepo application built with modern TypeScript tooling. It's a coaching/client management platform with authentication, team management, ticketing system, and financial tracking.

## Prerequisites

- **Bun** is required (npm/yarn/pnpm are blocked by .npmrc)
- PostgreSQL database via Supabase

## Essential Commands

### Development
```bash
bun install          # Install dependencies
bun dev             # Start all apps (web on :3001, server on :3000)
bun dev:web         # Start only web app
bun dev:server      # Start only server
```

### Code Quality
```bash
bun check           # Run Biome formatter and linter
bun check-types     # Check TypeScript types across all apps
```

### Build
```bash
bun build           # Build all applications for production
```

## Architecture

### Tech Stack
- **Runtime**: Bun
- **Monorepo**: Turborepo
- **Frontend**: Next.js 15 (App Router), React 19, TailwindCSS v4, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Auth**: Better Auth with email OTP and passkeys
- **Server Actions**: next-safe-action with Zod validation
- **Data Fetching**: TanStack Query with prefetching pattern
- **URL State**: nuqs for sharable state
- **Hooks**: @uidotdev/usehooks for common utilities
- **Styling**: TailwindCSS with custom design system

### Key Directories
- `apps/web/` - Next.js frontend application
  - `src/app/` - App Router pages
  - `src/components/` - Shared UI components
  - `src/features/` - Feature modules (ALL feature code goes here)
  - `src/lib/` - Core utilities and configs
  - `src/queries/` - Shared server queries
- `apps/server/` - Hono API server
- `packages/emails/` - React Email templates

### Feature Folder Structure
All feature-related code MUST be organized in `/features/[feature-name]/`:
```
/features/[feature-name]/
├── actions/        # Server actions using next-safe-action
├── components/     # Feature-specific React components
├── queries/        # Data fetching (server queries & client hooks)
├── layout/         # Layout components (headers, etc.)
├── types/          # TypeScript types
└── data/           # Static data/mocks
```

## Development Patterns

### Page Pattern (React Query with Prefetching)
Follow this pattern from `apps/web/src/app/dashboard/coaches/page.tsx`:
```typescript
export default async function Page() {
  const queryClient = new QueryClient();
  
  // Get session once at page level
  const session = await getUser();
  
  // Prefetch all queries with Promise.all for parallel fetching
  await Promise.all([
    queryClient.prefetchQuery(featureQueries.query1()),
    queryClient.prefetchQuery(featureQueries.query2()),
    // ... more queries
  ]);
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainLayout>
        <ClientComponent />
      </MainLayout>
    </HydrationBoundary>
  );
}
```

### Server Actions Pattern
Use next-safe-action for all mutations:
```typescript
// In /features/[feature]/actions/createItem.ts
import { actionClient } from "@/lib/safe-action";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
});

export const createItem = actionClient
  .inputSchema(schema)
  .action(async ({ input }) => {
    // Action logic
  });
```

### Client Hooks Pattern
Use @uidotdev/usehooks for common utilities:
```typescript
import { useDebounce } from "@uidotdev/usehooks";
```

### URL State Management
Use nuqs for state that needs to be shareable via URL:
```typescript
import { useQueryState } from "nuqs";

// In component
const [filter, setFilter] = useQueryState("filter", {
  parse: (value) => JSON.parse(value),
  serialize: (value) => JSON.stringify(value),
});
```

### Important Files
- `apps/web/src/lib/safe-action.ts` - Server action client
- `apps/web/src/lib/auth-client.ts` - Auth client configuration
- `apps/web/src/lib/supabase/client.ts` - Supabase client
- `apps/web/src/utils/queryClient.ts` - React Query configuration
- `biome.json` - Code formatting/linting rules

## Design System & Style Guidelines

### Design Philosophy
**Sexy yet Minimalist** - Clean, modern interfaces with subtle depth and sophisticated interactions that feel premium without being overwhelming.

### Color Palette
Based on French Language Solutions branding, adapted for modern web:
```css
/* Primary Blue - Professional and trustworthy */
--primary: oklch(0.267 0.063 253.7)        /* #004990 inspired */

/* Secondary Red - Energy and passion */  
--secondary: oklch(0.534 0.222 24.4)       /* #f80003 inspired */

/* Accent Blue - Soft and inviting */
--accent: oklch(0.748 0.082 253.7)         /* Light blue touches */

/* Neutrals - Clean canvas */
--background: white
--foreground: Deep blue-tinted gray
--muted: Soft blue-gray tones
```

### Visual Hierarchy

#### Depth & Layering
- **Cards**: `bg-card/95 backdrop-blur-sm border-border/50` - Subtle glass morphism
- **Shadows**: Progressive shadow system `shadow-sm → shadow-md → shadow-lg → shadow-xl`
- **Borders**: Soft borders with transparency `border-border/50`

#### Spacing System
- **Tight**: 2-4 units for related elements
- **Default**: 6-8 units for sections
- **Generous**: 10-12 units for major separations
- **Containers**: `px-10 py-8` for card content, `px-6 py-4` for compact areas

### Component Patterns

#### Buttons
```tsx
// Primary - Bold call-to-action
className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg"

// Secondary - Supporting actions
className="bg-background hover:bg-muted border border-input"

// Transitions - Smooth and responsive
className="transition-all duration-200"
```

#### Inputs
```tsx
// Focus states with ring effect
className="focus:ring-2 focus:ring-primary/20 focus:border-primary"

// Hover for better interaction feedback
className="hover:border-muted-foreground/50"

// Consistent height and padding
className="h-11 px-4 py-2 rounded-lg"
```

#### Cards
```tsx
// Glassmorphism effect
className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl shadow-xl"

// Hover interactions
className="hover:shadow-md transition-shadow duration-200"
```

### Typography
- **Headings**: Bold, tight tracking `font-bold tracking-tight`
- **Body**: Regular weight with relaxed leading `leading-relaxed`
- **Muted**: Reduced opacity `text-muted-foreground` or `text-foreground/90`
- **Sizes**: 
  - Display: 32px
  - Title: 26-28px
  - Body: 14-17px
  - Small: 12-13px

### Micro-interactions

#### Hover Effects
- Buttons lift with shadow
- Cards gain depth
- Links underline or change color
- Borders become more prominent

#### Focus States
- Ring effect with brand color at 20% opacity
- Border color changes to primary
- Subtle scale on interactive elements

#### Loading States
- Spinner with `animate-spin`
- Maintain button/element size during loading
- Disable interactions with reduced opacity

### Layout Principles

#### Backgrounds
- Gradient overlays for depth: `bg-gradient-to-br from-background via-background to-accent/5`
- Section separation with borders and background changes

#### Headers & Navigation
- Sticky headers with backdrop blur
- Semi-transparent backgrounds `bg-background/80 backdrop-blur-sm`
- Clear visual separation with borders

#### Content Areas
- Maximum readability with appropriate line heights
- Clear visual grouping with cards
- Progressive disclosure with accordions/tabs

### Decorative Elements

#### Subtle Accents
```tsx
// Gradient lines
<div className="h-px w-8 bg-gradient-to-r from-transparent to-primary/30" />

// Dot patterns
<div className="flex gap-1">
  <div className="h-1 w-1 rounded-full bg-primary/40" />
  <div className="h-1 w-1 rounded-full bg-primary/60" />
  <div className="h-1 w-1 rounded-full bg-primary/40" />
</div>
```

#### Section Dividers
- Gradient borders for elegant separation
- Centered text with line-through effect
- Subtle opacity changes

### Animation Guidelines
- **Duration**: 150-200ms for micro-interactions, 300-500ms for page transitions
- **Easing**: `ease-in-out` for most, `ease-out` for entrances
- **Properties**: Transform and opacity preferred over layout properties
- **Motion**: Subtle and purposeful, never distracting

### Accessibility Considerations
- Maintain WCAG AA contrast ratios
- Clear focus indicators
- Keyboard navigation support
- Reduced motion respects user preferences

### Dark Mode
- Slightly increase component backgrounds in dark mode
- Reduce opacity of decorative elements
- Maintain brand colors but adjust brightness
- Increase shadow opacity for depth

## Development Guidelines

### Code Style
- Tab indentation (enforced by Biome)
- Double quotes for strings
- Use `cn()` utility for className composition
- Follow existing component patterns in `src/components/`

### Type Safety
- All server actions use Zod schemas for validation
- Database types generated from Supabase
- Strict TypeScript configuration enabled

### Data Fetching
- Server components: Use server queries for prefetching
- Client components: Use React Query hooks
- Always prefetch data at page level using the HydrationBoundary pattern
- No need to get session in each page - do it once at the top level

### Environment Variables
- Copy `.env.example` to `.env.local` in both apps
- Required: `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`, Supabase keys
- Auth secrets: `BETTER_AUTH_SECRET`, email provider credentials

### Authentication
- Better Auth handles user sessions
- Session is fetched once at page level
- Permissions are passed down to components as needed

### Database
- Use Supabase client for all database operations
- Types are generated in `database.types.ts`
- Always use type-safe queries with proper joins