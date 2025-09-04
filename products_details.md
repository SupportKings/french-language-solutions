# Products Details View

## Overview
The Products Details view provides a comprehensive interface for viewing and managing individual product configurations. Following the same design patterns as Cohort, Student, and Teacher detail views, it features inline editing capabilities for seamless updates.

## Features

### 1. Product Information Display
- **Basic Details**: Product name, format (Group/Private/Hybrid), and location (Online/In-Person/Hybrid)
- **Integration Settings**: PandaDoc template ID and self-checkout link configuration
- **System Information**: Creation and update timestamps

### 2. Inline Editing
- **EditableSection Component**: Wraps content sections with edit/save/cancel controls
- **InlineEditField Component**: Provides field-level editing with appropriate input types
- **Real-time Updates**: Changes are saved to the database immediately upon confirmation
- **Validation**: Input validation ensures data integrity

### 3. Related Cohorts
- **Associated Cohorts Tab**: Shows all cohorts using this product
- **Direct Navigation**: Click on any cohort to view its details
- **Usage Protection**: Products with associated cohorts cannot be deleted

## File Structure

```
/apps/web/src/
├── app/admin/cohorts/products/[id]/
│   ├── page.tsx              # Server component with data prefetching
│   └── page-client.tsx       # Client component with interactive features
├── app/api/products/[id]/
│   └── route.ts              # API endpoints (GET, PATCH, DELETE)
└── features/products/
    ├── queries/
    │   └── products.queries.ts  # React Query hooks for data fetching
    └── schemas/
        └── product.schema.ts     # Zod schemas for validation
```

## API Endpoints

### GET /api/products/[id]
Fetches a single product by ID.

### PATCH /api/products/[id]
Updates product fields with validation:
- `display_name`: Product name
- `format`: group | private | hybrid
- `location`: online | in_person | hybrid
- `pandadoc_contract_template_id`: Optional template ID
- `signup_link_for_self_checkout`: Optional checkout URL

### DELETE /api/products/[id]
Deletes a product (prevented if cohorts are using it).

## Key Components

### ProductDetailPageClient
Main client component handling:
- Product data fetching via React Query
- Inline editing state management
- Delete confirmation dialog
- Related cohorts display

### EditableSection
Wrapper component providing:
- Edit/Save/Cancel button controls
- Edit mode state management
- Save/cancel callbacks

### InlineEditField
Field-level editing component supporting:
- Text inputs
- Select dropdowns
- URL inputs
- Date pickers (if needed)

## Navigation Flow

1. **Products List** → Click product name or "View" action
2. **Product Details** → View/edit product information
3. **Related Cohorts** → Click to navigate to cohort details
4. **Breadcrumbs** → Navigate back to Classes or Products list

## Design Patterns

### Data Fetching
- Server-side prefetching with React Query
- Hydration boundary for SSR/CSR transition
- Optimistic updates with mutation hooks

### State Management
- Local state for edited values
- Separate state for pending changes
- Reset on cancel, persist on save

### Error Handling
- Loading skeletons during data fetch
- Error states with retry options
- Toast notifications for user feedback

### Security
- Validation with Zod schemas
- Protection against deleting products in use
- Proper error messages for failed operations

## User Experience

### Visual Hierarchy
- Clear section headers with uppercase labels
- Icon-based information display
- Badge components for status indicators
- Responsive grid layout

### Interaction Patterns
- Hover effects on clickable elements
- Smooth transitions between edit modes
- Confirmation dialogs for destructive actions
- Success/error toast notifications

### Accessibility
- Semantic HTML structure
- ARIA labels where appropriate
- Keyboard navigation support
- Focus management in modals

## Implementation Details

### Inline Editing Implementation
The inline editing follows the same pattern as Cohort Details:

1. **EditableSection** wraps the content and provides edit/save/cancel buttons
2. Local state (`editedProduct`) tracks changes during editing
3. **updateEditedField** updates the local state for each field
4. **saveAllChanges** compares edited vs original and sends only changed fields
5. Cancel action resets to original values

### Related Cohorts Display
- Fetches cohorts using the product via API
- Displays in a card-based layout
- Links to individual cohort detail pages
- Shows loading state while fetching

### Delete Protection
- Checks for associated cohorts before allowing deletion
- Shows informative message if deletion is blocked
- Confirms deletion with AlertDialog

## Future Enhancements

1. **Bulk Operations**: Select and update multiple products
2. **Product Templates**: Save and reuse product configurations
3. **Audit Trail**: Track all changes with user attribution
4. **Export/Import**: CSV or JSON data exchange
5. **Advanced Filters**: More sophisticated search capabilities
6. **Product Categories**: Group products by type or level
7. **Pricing Integration**: Connect with payment systems
8. **Analytics Dashboard**: Usage statistics and trends

## Testing Checklist

- [ ] Product details load correctly
- [ ] Inline editing saves changes
- [ ] Validation prevents invalid data
- [ ] Related cohorts display properly
- [ ] Navigation links work
- [ ] Delete protection functions
- [ ] Toast notifications appear
- [ ] Loading states show appropriately
- [ ] Error states handle failures gracefully
- [ ] Breadcrumb navigation works