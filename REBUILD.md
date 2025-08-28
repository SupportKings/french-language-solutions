# French Language Solutions - Database Rebuild Guide

## Project Overview
Complete rebuild of French Language Solutions' education platform, migrating from Airtable to a custom Next.js application with Supabase database. The system manages teachers, students, and administrative operations for a French language school.

## Architecture Decisions

### Database Strategy
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: Supabase (PostgreSQL)
- **Migration Strategy**: Code-first approach with all schema defined in Drizzle for easy redeployment
- **Multi-tenancy**: Not required - single instance with potential for full codebase deployment per client

### Authentication Architecture
```
Better Auth User → Profiles Table → Role-specific Tables
                    (role: admin/support/teacher/student)
```

**Key Design Decisions:**
- Separate `profiles` table references Better Auth users as a bridge
- Four primary roles: admin, support, teacher, student
- Teachers/Students can exist without auth accounts initially
- Optional `profile_id` field in Teacher/Student tables for auth linking
- Maintains separation between auth concerns and business logic
- Admin role can grant permissions to Support role dynamically

## Database Schema

### Core Tables Structure

#### 1. Profiles Table
```
Fields:
- id (primary key)
- user_id (references better_auth.users)
- role (enum: admin | support | teacher | student)
- first_name (text)
- last_name (text)
- avatar_url (text)
- created_at (timestamp)
- updated_at (timestamp)
```
- Single source of truth for authenticated users
- Bridge between Better Auth and business logic

#### 2. Teachers Table
```
Fields:
- id (primary key)
- profile_id (optional - links to profiles when auth needed)
- first_name (text)
- last_name (text)
- group_class_bonus_terms (enum: per_student_per_hour | per_hour)
- onboarding_status (enum: new | training_in_progress | onboarded | offboarded)
- google_calendar_id (text)
- maximum_hours_per_week (integer)
- maximum_hours_per_day (integer)
- qualified_for_under_16 (boolean)
- available_for_booking (boolean)
- contract_type (enum: full_time | freelancer)
- available_for_online_classes (boolean)
- available_for_in_person_classes (boolean)
- mobile_phone_number (varchar(20) - E.164 format)
- admin_notes (text)
- airtable_record_id (text - for migration tracking)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 3. Students Table
```
Fields:
- id (primary key)
- profile_id (optional - links to profiles when auth needed)
- full_name (text)
- first_name (generated from full_name - database level)
- last_name (generated from full_name - database level)
- email (text - separate from auth email)
- desired_starting_language_level (TBD - enum or reference table)
- mobile_phone_number (varchar(20) - E.164 format)
- city (text)
- website_quiz_submission_date (date)
- added_to_email_newsletter (boolean)
- initial_channel (enum: form | quiz | call | message | email | assessment)
- convertkit_id (text)
- openphone_contact_id (text)
- tally_form_submission_id (text)
- respondent_id (text)
- stripe_customer_id (text)
- is_under_16 (boolean)
- communication_channel (enum: sms_email | email | sms) - default: sms_email
- is_full_beginner (boolean)
- subjective_deadline_for_student (date)
- purpose_to_learn (text)
- airtable_record_id (text - for migration tracking)
- created_at (timestamp)
- updated_at (timestamp)
```

### Technical Implementation Details

#### Database Configuration
- **Location**: `server/src/db/index.ts`
- **Connection**: Use connection pooling for performance
- **Migrations**: Drizzle migration system for schema version control
- **Schema Definition**: Single schema for simplicity

#### Name Auto-calculation (Students)
- Implemented at database level using PostgreSQL generated columns
- Logic: Split `full_name` on first space
- Can be overridden if needed for complex names

#### External Service IDs
- Stored as text fields (not foreign keys)
- Includes: stripe_customer_id, convertkit_id, openphone_contact_id, etc.
- Allows flexible integration without hard dependencies

## Implementation Roadmap

### Phase 1: Database Foundation ✅ (Current)
1. Set up Drizzle configuration in `server/src/db/`
2. Define schema for profiles, teachers, and students tables
3. Create migration files
4. Set up connection pooling
5. Test database connections

### Phase 2: Auth Integration
1. Extend Better Auth with profiles table
2. Create auth middleware for role-based access
3. Implement user registration flow
4. Add login/logout functionality

### Phase 3: Admin Dashboard Interface
1. Implement workflow-focused navigation structure
2. Build Students Hub with enrollments tracking
3. Build Classes Hub with cohort management
4. Build Team Hub for teacher/staff management
5. Implement Automation center for follow-ups
6. Add Control Center for user management

### Phase 4: Teacher Features
1. Teacher dashboard
2. Schedule management
3. Student roster views
4. Hours tracking

### Phase 5: Student Features
1. Student portal
2. Class enrollment
3. Progress tracking
4. Communication preferences

### Phase 6: Data Migration
1. Export Airtable data
2. Create migration scripts
3. Map Airtable fields to new schema
4. Validate data integrity
5. Run production migration

## Development Guidelines

### File Organization
```
/server/src/db/
├── index.ts           # Drizzle client and connection
├── schema/
│   ├── auth.ts       # Profiles and auth-related
│   ├── teachers.ts   # Teachers table schema
│   ├── students.ts   # Students table schema
│   └── enums.ts      # Shared enums
└── migrations/        # Auto-generated migration files
```

### Code Patterns
- Use Drizzle relations for type-safe joins
- Generate Zod schemas from Drizzle for validation
- All database operations through repository pattern
- Transaction support for complex operations

### Testing Strategy
- Unit tests for schema validations
- Integration tests for database operations
- Migration rollback tests
- Data integrity checks

## Next Steps

1. **Immediate Actions**:
   - Complete Drizzle setup in `server/src/db/index.ts`
   - Create schema files for all tables
   - Generate and run initial migration
   - Create seed data for development

2. **Questions to Resolve**:
   - Finalize language level structure (enum vs. table)
   - Define additional fields needed for phase 2-5
   - Determine audit trail requirements
   - Plan for soft deletes implementation

## Migration Considerations

### From Airtable
- Preserve all Airtable record IDs for reference
- Map Airtable field types to PostgreSQL types
- Handle empty/null values appropriately
- Validate phone numbers to E.164 format
- Clean and normalize text fields

### Data Integrity
- Add database constraints for business rules
- Implement check constraints for enums
- Add indexes for frequently queried fields
- Set up foreign key relationships where applicable

## Environment Variables Required
```env
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://... (for migrations)
BETTER_AUTH_DATABASE_URL=postgresql://... (for Better Auth)

# Auth
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=...

# Email Provider
RESEND_API_KEY=...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# External Services (Phase 2+)
STRIPE_SECRET_KEY=...
CONVERTKIT_API_KEY=...
OPENPHONE_API_KEY=...
```
## Admin Interface Architecture

### Navigation Structure (Workflow-Focused)
```
Dashboard (CRM Stats & Overview)
├── Students Hub
│   ├── All Students
│   ├── Enrollments (Pipeline view)
│   ├── Assessments
│   └── Progress Tracking
├── Classes Hub
│   ├── Active Classes/Cohorts
│   ├── Products & Pricing
│   ├── Schedule Management
│   └── Class Assignments
├── Team Hub
│   ├── Teachers
│   ├── Support Staff
│   ├── Availability Management
│   └── Performance Metrics
├── Automation
│   ├── Touchpoints (Inbound/Outbound)
│   ├── Follow-up Sequences
│   ├── Active Campaigns
│   └── Communication Logs
└── Control Center
    ├── User Management
    ├── Permissions & Roles
    └── System Settings
```

### UI Implementation Strategy

#### Core Layout Components
- **Sidebar Navigation**: Collapsible with icons, workflow-focused grouping
- **Command Palette**: Global search (⌘K) for quick navigation
- **Breadcrumbs**: Consistent navigation context
- **Tab Navigation**: For sub-sections within each hub

#### View Patterns

##### 1. Dashboard View
- **Stats Cards Row**: Active students, classes, revenue, conversion rates
- **Tabbed Content**: Overview | Recent Activity | Pending Tasks
- **Data Visualizations**: Enrollment trends, revenue charts (using Recharts)
- **Quick Actions**: Floating action buttons for common tasks

##### 2. Students Hub
- **Main List View**: 
  - DataTable with avatar, name, status badges, level, enrolled classes
  - Advanced filters (status, level, enrollment date)
  - Bulk actions toolbar
- **Student Detail**: 
  - Right-side sheet with tabs (Profile, Enrollments, Communications, Documents)
  - Quick actions: Send message, schedule call, add note
- **Enrollment Pipeline**: 
  - Kanban board view with drag-drop between statuses
  - Status flow: Inquiry → Form Filled → Assessment → Payment → Enrolled

##### 3. Classes Hub
- **Grid/List Toggle View**:
  - Class cards showing title, teacher, capacity (12/20), schedule
  - Visual indicators for class status (active, full, upcoming)
- **Class Detail Page**:
  - Full page with tabs (Overview, Students, Schedule, Materials, Settings)
  - Inline editing for class details
  - Student roster with attendance tracking
- **Creation Flow**:
  - Multi-step dialog for new class creation
  - Command palette style for adding students

##### 4. Team Hub
- **Team Member Cards**: 
  - Profile photo, role, availability status
  - Quick stats (hours, classes, rating)
- **Availability Calendar**: 
  - Week/month view toggle
  - Drag to create availability blocks
- **Performance Dashboard**: 
  - Individual teacher metrics
  - Comparative analytics

##### 5. Automation Center
- **Sequence Builder**:
  - Visual timeline editor
  - Drag-drop steps (Email, SMS, Wait, Condition)
  - Template library
- **Active Campaigns View**:
  - DataTable with student, sequence, current step, next action
  - Inline controls (pause, skip, complete)
- **Touchpoint Log**:
  - Chronological list with filters
  - Quick entry form for manual touchpoints

##### 6. Control Center
- **User Management Table**:
  - Inline role editing with dropdown
  - Status toggle switches
  - Permission assignment via sheet panel
- **Permission Matrix**:
  - Tree view of all permissions
  - Role templates for quick assignment
  - Audit log of permission changes

### Component Library (shadcn/ui)

#### Data Display
- **DataTable**: Sorting, filtering, pagination, column visibility
- **Cards**: Info cards, stat cards, entity cards
- **Badge**: Status indicators, role labels
- **Avatar**: User/student profile images

#### Input & Forms
- **Form**: React Hook Form integration
- **Select**: Role selection, status updates
- **DatePicker**: Date range filters, scheduling
- **Command**: Search and command palette
- **Switch**: Boolean toggles for settings

#### Feedback & Overlays
- **Toast**: Action confirmations
- **Alert**: Important notices
- **Dialog**: Multi-step forms, confirmations
- **Sheet**: Quick view/edit panels
- **Popover**: Contextual information

#### Navigation
- **Tabs**: Section navigation
- **Breadcrumb**: Location context
- **Navigation Menu**: Dropdown menus

### Interaction Patterns
1. **Inline Editing**: Click to edit for simple fields
2. **Bulk Operations**: Checkbox selection with action toolbar
3. **Drag & Drop**: For status changes, reordering
4. **Context Menus**: Right-click for quick actions
5. **Keyboard Shortcuts**: ⌘K for search, ⌘S for save
6. **Progressive Disclosure**: Accordions for complex forms
7. **Optimistic Updates**: Immediate UI feedback with rollback

### State Management Strategy
- **URL State** (nuqs): Filters, search queries, pagination
- **Server State** (React Query): Data fetching and caching
- **Local State**: UI interactions, form state
- **Global State**: User session, permissions

### Performance Considerations
- Virtualized lists for large datasets
- Lazy loading for tab content
- Prefetching for predictable navigation
- Debounced search inputs
- Optimistic UI updates

## Success Metrics
- Zero data loss during migration
- Sub-100ms query performance for common operations
- Type-safe database operations throughout codebase
- Easy schema modifications without breaking changes
- Clear audit trail for all data changes
- Intuitive admin interface with <3 clicks to any feature
- Mobile-responsive admin views for on-the-go management

---

*This document serves as the single source of truth for the project rebuild. Update it as decisions are made and implementation progresses.*