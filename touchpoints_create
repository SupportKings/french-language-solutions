## Implementation Prompt Template


```
Implement a complete "Add [Entity]" feature with the following components:


### 1. Server Action (`/features/[entity]/actions/create[Entity].ts`)
- Use `actionClient` from `@/lib/safe-action`
- Import schema from feature types: `[entity]CreateSchema`
- Include authentication check with `getUser()`
- Validate unique constraints (e.g., email uniqueness)
- Handle database insertion with error handling
- Revalidate relevant paths after successful creation
- Return structured response with success data and validation errors
- Use `returnValidationErrors()` for consistent error handling


### 2. Form Component (`/features/[entity]/components/[entity]-form.tsx`)
- Support both "create" and "edit" modes via props
- Use TanStack Form (`useForm`) with proper field validation
- Include comprehensive field sections grouped logically:
- Dropdowns should always be comboboxes that are searchable
 - Basic Information (required fields)
 - Status/Options (dropdowns, selects)
 - Boolean flags (switches)
 - Dates (date pickers)
 - Notes/Text areas
 - Related entity forms (sub-components)
- Implement real-time validation with `validators.onBlur` and `validators.onChange`
- Use validation utilities from types file
- Handle form submission with loading states
- Show validation errors inline per field
- Include related entity management (assignments, goals, etc.)
- Save relations after main entity creation using Promise.all
- Invalidate React Query caches on success
- Provide toast notifications for user feedback
- Support navigation back or custom onSuccess callback
- Select component can’t have empty values


### 3. Type Definitions (`/features/[entity]/types/[entity].ts`)
- Import database types: `import type { Tables } from "@/utils/supabase/database.types"`
- Define main entity type: `export type [Entity] = Tables<"[entities]">`
- Define entity with relations type including joined tables
- Create comprehensive validation utilities object with Zod schemas:
 - String fields with length limits and regex patterns
 - Email validation with formatting
 - Phone validation with pattern matching
 - Date validation for YYYY-MM-DD format
 - UUID validation for IDs
 - Enum validations matching database constraints
 - Optional/nullable field handling
- Export multiple schemas:
 - `[entity]CreateSchema` - strict validation for server
 - `[entity]UpdateSchema` - with optional fields and ID required
 - `[entity]FormSchema` - form-friendly with defaults
 - `[entity]EditFormSchema` - extending form schema with ID
- Export TypeScript types for each schema
- Include status/option constants arrays for dropdowns
- Provide validation helper functions:
 - `validateSingleField()` for real-time validation
 - `getAllValidationErrors()` for toast messages
 - Type guards and validation utilities


### 4. Header Component (`/features/[entity]/layout/[entity].add.header.tsx`)
- Import UI components: `BackButton`, `SidebarTrigger`
- Implement sticky header with proper styling
- Include navigation elements and descriptive title
- Use consistent height and spacing: `h-[45px]`


### 5. Skeleton Component (`/features/[entity]/components/[entity].add.skeleton.tsx`)
- Import `MainLayout` and header component
- Create animated skeleton matching form structure
- Include sections for all form areas:
 - Basic information fields (grid layout)
 - Status dropdowns
 - Switch/boolean fields
 - Text areas
 - Action buttons
- Use `animate-pulse` and `bg-muted` for loading states
- Mirror actual form layout structure


### 6. App Router Page (`/app/dashboard/[entities]/add/page.tsx`)
- This already exists in the codebase, search for it and find the page
- Use Suspense with skeleton fallback
- Implement authentication check with redirect
- Create QueryClient for data prefetching
- Prefetch related data (coaches, categories, etc.) using Promise.all
- Use HydrationBoundary pattern for SSR
- Render MainLayout with header and form components
- Apply consistent padding: `p-6`


### 7. Required Features
- **Validation**: Comprehensive client and server-side validation
- **Error Handling**: Detailed error messages with field-specific feedback
- **Loading States**: Button loading indicators and skeleton screens
- **Data Prefetching**: Related entity data loaded before form render
- **Relationships**: Handle related entities (assignments, goals, etc.)
- **Toast Notifications**: Success and error feedback
- **Navigation**: Back button and programmatic routing
- **Responsive Design**: Mobile-friendly grid layouts
- **Accessibility**: Proper labels, IDs, and form structure
- **Linking**: in list view for relevant entity, find header with add button and link it to newly created form


### 8. Implementation Checklist
- [ ] Read database types from `database.types.ts` to understand nullable fields
- [ ] Check existing similar forms for UI/validation patterns
- [ ] Verify database schema allows nullable values for optional fields
- [ ] Identify if any enum types need to be handled
- [ ] Server action with authentication and validation
- [ ] Comprehensive type definitions with Zod schemas
- [ ] Form component with TanStack Form integration
- [ ] Header component with navigation
- [ ] Loading skeleton component
- [ ] App router page with prefetching
- [ ] Error handling and user feedback
- [ ] Related entity management
- [ ] Responsive design implementation
- [ ] Field validation and real-time feedback
- [ ] Form accepts string inputs and transforms to correct types
- [ ] Server action receives properly typed data (not strings for numbers)
- [ ] All validation errors display correctly with proper field targeting
- [ ] Button spacing renders correctly
- [ ] No TypeScript errors or unused import warnings
- [ ] Toast notifications show for success/error cases




### 9. Key Patterns to Follow
- **File Organization**: All code in `/features/[entity]/` structure
- **Naming Conventions**: Consistent camelCase/PascalCase usage
- **Import Structure**: React → Next.js → Node → External → Internal
- **Error Messages**: User-friendly, specific, and actionable
- **Form Sections**: Logical grouping with clear headings
- **Database Operations**: Proper error handling and type safety
- **State Management**: React Query for server state, form state for UI
- **UI Components**: Use shadcn/ui components consistently
- **Validation**: Both client-side (UX) and server-side (security)


### 10. Related Entity Sub-Forms Pattern
If the entity has related entities (like client assignments, goals, etc.):
- Create separate form components for each relation
- Pass data and onChange handlers as props
- Handle array state management in parent form
- Save relations after main entity creation
- Display related data in organized sections


``
