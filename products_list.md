Generate a complete list view implementation for [ENTITY_NAME] following the existing 
 clients list view pattern

  **Required Implementation:**

  1. **Page Component** (`apps/web/src/app/dashboard/[entity-plural]/page.tsx`):
     - Server component with Suspense wrapper
     - QueryClient instantiation with prefetching
     - Default filters/sorting setup
     - HydrationBoundary with MainLayout
     - Header component integration
—-> point AI to existing blank page previously created

  2. **Content Component** 
  (`apps/web/src/features/[entity]/components/[entity].content.tsx`):
     - Client component wrapper
     - Renders the data table with spacing

  3. **Table Component** (`apps/web/src/features/[entity]/components/[entity].table.tsx`):
     - UniversalDataTableWrapper with URL state management
     - Table content component with useUniversalTable hook
     - Column definitions using createColumnHelper
     - Filter configuration with universalColumnHelper
     - Row actions (view, edit, delete) - just make placeholders
     - Delete modal integration
     - Error handling and loading states

  4. **Header Component** (`apps/web/src/features/[entity]/layout/[entity].header.tsx`):
     - Sticky header with SidebarTrigger
     - Entity title and "Add [Entity]" button - make it blank link currently

  5. **Query Hook** (in `apps/web/src/features/[entity]/queries/use[Entity].ts`):
     - Query keys object with structured hierarchy
     - Combined hook for table data with faceted filters
     - Prefetch helper functions
     - CRUD mutation hooks

  6. **Server Actions** (in `apps/web/src/features/[entity]/actions/get[Entity].ts`):
     - Server-side data fetching functions
     - Optimized combined query for table + faceted data
     - Proper Supabase joins for related data

  **Database Schema Context:**
  - Reference database schema types in the codebase
  **Column Requirements:**
  - display_name
  - format
  - location
  - Actions column (view/delete) -> make it only placeholder

  **Filter Requirements:**
  - All columns outlined in the column requirements
  - If filter is for field that is foreign key reference, we do not use search, but we fetch data from relevant referenced table

  **Follow these patterns exactly:**
  - Use universal-data-table components throughout
  - Implement server-side pagination/filtering
  - Use proper TypeScript types from database schema
  - Follow the query key structure from clients implementation
  - Include proper error handling and loading states
  - Use StatusBadge for status display
  - Implement optimistic updates for mutations
  - Use toast notifications for success/error feedback

  **Do NOT:**
  - Create new patterns - follow clients implementation exactly
  - Skip any of the required components
  - Use different column helper patterns
  - Implement client-side pagination

