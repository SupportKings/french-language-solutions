# Complete Airtable to Supabase Data Migration Mapping

Generated: 2025-09-15
Updated: 2025-09-18 - Aligned with import-airtable-data.ts script

## Table of Contents
1. [Import Strategy](#import-strategy)
2. [Tables to Import](#tables-to-import)
3. [Enum Value Mappings](#enum-value-mappings)
4. [Detailed Table Mappings](#detailed-table-mappings)
5. [Data Validation Rules](#data-validation-rules)

---

## Import Strategy

### Three-Pass Approach

**Pre-Import: Language Levels Matching**
- Scan existing language_levels table in Supabase
- Create mapping from Airtable levels (e.g., "B1") to Supabase levels (e.g., "B1.1")
- Cache this mapping for use during import

**Pass 1: Direct Data Import**
- Import all records with their `airtable_record_id`
- Convert enum values using EXACT mapping tables (no guessing)
- Convert dates to ISO 8601 format
- Leave foreign key fields NULL initially
- Use language level mapping for any level references

**Pass 2: Link Resolution**
- Resolve all foreign key relationships using `airtable_record_id`
- Update linked records with Supabase UUIDs
- Validate referential integrity

---

## Tables to Import

### Primary Import Tables (Airtable → Supabase)

| Airtable Table | Supabase Table | Priority | Dependencies |
|----------------|----------------|----------|--------------|
| Teachers/Team | teachers | 1 | None |
| Students/Leads | students | 1 | None |
| Products | products | 1 | None |
| Language Levels | language_levels | 1 | None |
| Follow Up Sequences - Templates | template_follow_up_sequences | 2 | None |
| Follow Up Sequence - Template Messages | template_follow_up_messages | 3 | template_follow_up_sequences |
| French Programs/Cohorts | cohorts | 4 | products, language_levels |
| Student Enrollments | enrollments | 5 | students, cohorts |
| Student Assessments | student_assessments | 5 | students, teachers, language_levels |
| Automated Follow Ups | automated_follow_ups | 6 | students, template_follow_up_sequences |
| CRM Touchpoints/Follow Ups | touchpoints | 7 | students, automated_follow_ups |
| Cohort Weekly Session | weekly_sessions | 8 | cohorts, teachers |
| Events/Classes | classes | 9 | cohorts, teachers |

### Airtable Tables NOT Imported

| Airtable Table | Reason |
|----------------|--------|
| Attendance Records | No actual data in Airtable table |
| Sales Cohort | Marketing/sales data - not part of core system |
| Calendar Events | Will be synced from Google Calendar |
| Event Attendees | Redundant with attendance_records |
| Days of Week | Reference table - hardcoded as enum |
| Teacher Certifications | Not in current Supabase schema |
| Teacher Payouts | Financial data - separate system |
| Payments from Student | Financial data - handled by Stripe |
| 1-1 Class Requests | Will be implemented as new feature |
| Time Off Requests | HR feature - not in current scope |

### Supabase Tables NOT Populated from Airtable

| Supabase Table | Reason |
|----------------|--------|
| account | Authentication system - created on user signup |
| user | Authentication system - created on user signup |
| session | Authentication sessions - system managed |
| passkey | Authentication method - user created |
| verification | Email verification - system managed |

---

## Enum Value Mappings

**EXACT mappings based on Airtable schema - NO guessing**

### onboarding_status (Teachers/Team → Team Onboarding Status)
| Airtable Value (EXACT) | Supabase Value |
|------------------------|----------------|
| `-1 - No Longer with FLS` | `offboarded` |
| `0 - New` | `new` |
| `10 - Training in Progress` | `training_in_progress` |
| `100 - Onboarded` | `onboarded` |

### contract_type (Teachers/Team → Contract Type)
| Airtable Value (EXACT) | Supabase Value |
|------------------------|----------------|
| `Freelancer` | `freelancer` |
| `Full-Time` | `full_time` |

### group_class_bonus_terms (Teachers/Team → Group Class Bonus Terms)
| Airtable Value (EXACT) | Supabase Value |
|------------------------|----------------|
| `Per Student Per Hour up to $50/hr` | `per_student_per_hour` |
| `Per Hour` | `per_hour` |

### communication_channel (Students/Leads → Default Communication Channel)
| Airtable Value (EXACT) | Supabase Value |
|------------------------|----------------|
| `SMS & Email` | `sms_email` |
| `Email` | `email` |
| `SMS` | `sms` |

### initial_channel (Students/Leads → Initial Channel)
| Airtable Value (EXACT) | Supabase Value |
|------------------------|----------------|
| `Form` | `form` |
| `Quiz` | `quiz` |
| `Call` | `call` |
| `Message` | `message` |
| `Email` | `email` |
| `Paid Assessment` | `assessment` |

### enrollment_status (Student Enrollments → Enrollment Status)
| Airtable Value (EXACT) | Supabase Value |
|------------------------|----------------|
| `-2 - Declined Contract` | `declined_contract` |
| `-1 - Dropped Out` | `dropped_out` |
| `0 - Interested` | `interested` |
| `10 - Enrollment Form for Beginners Filled` | `beginner_form_filled` |
| `19 - Contract Abandoned` | `contract_abandoned` |
| `20 - Contract Signed` | `contract_signed` |
| `49 - Payment Abandoned` | `payment_abandoned` |
| `100 - Paid` | `paid` |
| `200 - Welcome Package Sent` | `welcome_package_sent` |

### product_format (Products → Format)
| Airtable Value (EXACT) | Supabase Value |
|------------------------|----------------|
| `Group` | `group` |
| `Private` | `private` |
**Note:** No `hybrid` option in Airtable Products table

### product_location (Products → Location)
| Airtable Value (EXACT) | Supabase Value |
|------------------------|----------------|
| `Online` | `online` |
| `In-Person` | `in_person` |
**Note:** No `hybrid` option in Airtable Products table

### assessment_result (Student Assessments → Result)
| Airtable Value (EXACT) | Supabase Value |
|------------------------|----------------|
| `0 - Scheduled/Requested` | `requested` |
| `50 - Session Held` | `session_held` |
| `100 - Level Determined` | `level_determined` |
**Note:** No separate `scheduled` value in Airtable

### touchpoint_type (CRM Touchpoints/Follow Ups → Event Type)
| Airtable Value (EXACT) | Supabase Value |
|------------------------|----------------|
| `Inbound` | `inbound` |
| `Outbound` | `outbound` |

### touchpoint_channel (CRM Touchpoints/Follow Ups → Channel)
| Airtable Value (EXACT) | Supabase Value |
|------------------------|----------------|
| `SMS` | `sms` |
| `Call` | `call` |
| `WhatsApp` | `whatsapp` |
| `Email` | `email` |

### touchpoint_source
**Note:** No source field in Airtable CRM Touchpoints - will default to `manual`

### automated_follow_up_status (Automated Follow Ups → Status)
| Airtable Value (EXACT) | Supabase Value |
|------------------------|----------------|
| `00 - Activated` | `activated` |
| `50 - Follow Up Ongoing` | `ongoing` |
| `-2 - Answer Received` | `answer_received` |
| `-1 - Disabled Manually` | `disabled` |
| `100 - Completed` | `completed` |

### follow_up_message_status (Follow Up Sequence - Template Messages → Status)
| Airtable Value (EXACT) | Supabase Value |
|------------------------|----------------|
| `Active` | `active` |
| `Disabled` | `disabled` |

### cohort_status (French Programs/Cohorts → Cohort Status)
| Airtable Value (EXACT) | Supabase Value |
|------------------------|----------------|
| `0 - Open for Enrollment` | `enrollment_open` |
| `50 - Closed for Enrollment` | `enrollment_closed` |
| `100 - Class Ended` | `class_ended` |

### room_type (French Programs/Cohorts → Max Students - Restricted by Room (Manual))
| Airtable Value (EXACT) | Supabase Value |
|------------------------|----------------|
| `1 (1:1 Class)` | `for_one_to_one` |
| `5 (Medium Room)` | `medium` |
| `6 (Medium +)` | `medium_plus` |
| `10 (Large Room)` | `large` |

### class_status
**Note:** No status field in Events/Classes table - will default to `scheduled`

### team_roles (Teachers/Team → Roles)
| Airtable Value (EXACT) | Supabase Value |
|------------------------|----------------|
| `Teacher` | `Teacher` |
| `Evaluator` | `Evaluator` |
| `Marketing/Admin` | `Marketing/Admin` |
| `Exec` | `Exec` |

### day_of_week (Multiple tables → Days Available fields)
| Airtable Value (EXACT) | Supabase Value |
|------------------------|----------------|
| `Monday` | `monday` |
| `Tuesday` | `tuesday` |
| `Wednesday` | `wednesday` |
| `Thursday` | `thursday` |
| `Friday` | `friday` |
| `Saturday` | `saturday` |
| `Sunday` | `sunday` |

### Boolean Conversions (Yes/No → true/false)
| Airtable Value | Supabase Value |
|----------------|----------------|
| Yes | `true` |
| No | `false` |
| (empty/null) | `null` |

---

## Detailed Table Mappings

### 1. Teachers/Team → teachers

| Airtable Field | Supabase Field | Type | Transformation | Notes |
|----------------|----------------|------|----------------|-------|
| First Name | first_name | string | Direct | Required |
| Last Name | last_name | string | Direct | Required |
| Roles | role | enum[]? | Map via team_roles table | Multi-select field |
| Team Onboarding Status | onboarding_status | enum | Map via onboarding_status table | Required, default: 'new' |
| Contract Type | contract_type | enum? | Map via contract_type table | |
| Group Class Bonus Terms | group_class_bonus_terms | enum? | Map via group_class_bonus_terms table | |
| Maximum Students Per In-Person Class | max_students_in_person | number? | Direct | |
| Maximum Students for Online Group Class | max_students_online | number? | Direct | |
| Available for Teach Online Classes | available_for_online_classes | boolean? | Yes→true, No→false | |
| Available for In-Person Classes | available_for_in_person_classes | boolean? | Yes→true, No→false | |
| Mobile Phone Number | mobile_phone_number | string? | Direct | |
| Teacher Notes | admin_notes | string? | Direct | |
| Days Available for In-Person Classes | days_available_in_person | enum[]? | Map each day via day_of_week | |
| Days Available for Online Classes | days_available_online | enum[]? | Map each day via day_of_week | |
| Available for Booking? | available_for_booking | boolean? | "Available"→true, else→false | |
| Qualified for Under 16 | qualified_for_under_16 | boolean? | Yes→true, No→false | |
| Maximum Working Hours Per Day | maximum_hours_per_day | number? | Direct | |
| Maximum Working Hours Per Week | maximum_hours_per_week | number? | Direct | |
| Google Calendar ID | google_calendar_id | string? | Direct | |
| _record_id | airtable_record_id | string? | Direct | For linking |

**Unmapped Supabase Fields:**
- `id` - Auto-generated UUID
- `created_at` - Auto-generated timestamp
- `updated_at` - Auto-generated timestamp
- `user_id` - Will be linked after user accounts created

### 2. Students/Leads → students

| Airtable Field | Supabase Field | Type | Transformation | Notes |
|----------------|----------------|------|----------------|-------|
| Name | full_name | string | Direct | Required |
| First Name | first_name | string? | Computed from full_name | |
| Last Name | last_name | string? | Computed from full_name | |
| Email | email | string? | Direct | |
| Mobile Phone Number | mobile_phone_number | string? | Direct | |
| City | city | string? | Direct | |
| Default Communication Channel | communication_channel | enum | Map via communication_channel table | Default: 'email' |
| Initial Channel | initial_channel | enum? | Map via initial_channel table | |
| Student's Beginning Level (from Enrollment Form) | is_full_beginner | boolean? | "Complete Beginner (A0)"→true, else→false | |
| Age Group | is_under_16 | boolean? | "Under 16"→true, else→false | |
| Why do you want to learn french? | purpose_to_learn | string? | Direct | |
| Student's Subjective Deadline | subjective_deadline_for_student | string? | Direct | |
| Added to Email Newsletter | added_to_email_newsletter | boolean? | Checkbox→boolean | |
| Website Quiz Completed Date | website_quiz_submission_date | string? | Convert to ISO 8601 | |
| Lead Created Date | airtable_lead_created_at | string? | Convert to ISO 8601 | |
| Desired Starting Language Level | desired_starting_language_level_id | string? | Link to language_levels via airtable_record_id | Foreign key |
| ConvertKit Subscriber ID | convertkit_id | string? | Direct | |
| OpenPhone Contact ID | openphone_contact_id | string? | Direct | |
| Respondent ID | respondent_id | string? | Direct | |
| Stripe Customer ID | stripe_customer_id | string? | Direct | |
| Submission ID | tally_form_submission_id | string? | Direct | |
| _record_id | airtable_record_id | string? | Direct | For linking |

**Unmapped Supabase Fields:**
- `id` - Auto-generated UUID
- `created_at` - Auto-generated timestamp
- `updated_at` - Auto-generated timestamp
- `deleted_at` - Soft delete field
- `user_id` - Will be linked after user accounts created

### 3. Products → products

| Airtable Field | Supabase Field | Type | Transformation | Notes |
|----------------|----------------|------|----------------|-------|
| Internal Nickname | display_name | string | Direct | Required |
| Format | format | enum | Map via product_format table | Required |
| Location | location | enum | Map via product_location table | Required |
| Contract Template ID (PandaDoc) | pandadoc_contract_template_id | string? | Direct | |
| Signup Link (for Self-Checkout) | signup_link_for_self_checkout | string? | Direct | |
| _record_id | airtable_record_id | string? | Direct | For linking |

**Unmapped Supabase Fields:**
- `id` - Auto-generated UUID
- `created_at` - Auto-generated timestamp
- `updated_at` - Auto-generated timestamp

### 4. Language Levels → language_levels

| Airtable Field | Supabase Field | Type | Transformation | Notes |
|----------------|----------------|------|----------------|-------|
| Level Code | code | string | Direct | Required |
| Display Name | display_name | string | Direct | Required |
| Level Group | level_group | string | Direct | Required |
| Level Number | level_number | number? | Direct | |
| _record_id | airtable_record_id | string? | Direct | For linking |

**Note:** This is a reference table that should be imported early as many other tables depend on it.

### 5. French Programs/Cohorts → cohorts

| Airtable Field | Supabase Field | Type | Transformation | Notes |
|----------------|----------------|------|----------------|-------|
| Product | product_id | string? | Link via airtable_record_id | Foreign key to products |
| Starting Level | starting_level_id | string? | Link via airtable_record_id | Foreign key to language_levels |
| Current Level | current_level_id | string? | Match by display name (single select field) | Foreign key to language_levels |
| Cohort Status | cohort_status | enum | Map via cohort_status table | Default: 'enrollment_open' |
| Max Students | max_students | number? | Direct | |
| Room Type | room_type | enum? | Map via room_type table | |
| Start Date | start_date | string? | Convert to ISO 8601 | |
| Setup Finalized | setup_finalized | boolean? | Checkbox→boolean | |
| Google Drive Folder ID | google_drive_folder_id | string? | Direct | |
| _record_id | airtable_record_id | string? | Direct | For linking |

**Unmapped Supabase Fields:**
- `id` - Auto-generated UUID
- `created_at` - Auto-generated timestamp
- `updated_at` - Auto-generated timestamp

### 6. Student Enrollments → enrollments

| Airtable Field | Supabase Field | Type | Transformation | Notes |
|----------------|----------------|------|----------------|-------|
| Student | student_id | string | Link via airtable_record_id | Foreign key to students |
| French Program/Cohort | cohort_id | string | Link via airtable_record_id | Foreign key to cohorts |
| Enrollment Status | status | enum | Map via enrollment_status table | Default: 'interested' |
| Created | airtable_enrollment_created_at | string? | Convert to ISO 8601 | |
| _record_id | airtable_record_id | string? | Direct | For linking |

**Unmapped Supabase Fields:**
- `id` - Auto-generated UUID
- `created_at` - Auto-generated timestamp
- `updated_at` - Auto-generated timestamp

### 7. Student Assessments → student_assessments

| Airtable Field | Supabase Field | Type | Transformation | Notes |
|----------------|----------------|------|----------------|-------|
| Student | student_id | string | Link via airtable_record_id | Foreign key to students |
| Result | result | enum | Map via assessment_result table | Default: 'requested' |
| Assessment Level | level_id | string? | Link via airtable_record_id | Foreign key to language_levels |
| Interview Held By | interview_held_by | string? | Link via airtable_record_id | Foreign key to teachers |
| Level Checked By | level_checked_by | string? | Link via airtable_record_id | Foreign key to teachers |
| Assessment Call Scheduled For | scheduled_for | string? | Convert to ISO 8601 | |
| Is paid? | is_paid | boolean | Always set to true | Default: true |
| Assessment Notes | notes | string? | Direct | |
| Meeting Recording URL | meeting_recording_url | string? | Direct | |
| Calendar Event URL | calendar_event_url | string? | Direct | |
| _record_id | airtable_record_id | string? | Direct | For linking |

**Unmapped Supabase Fields:**
- `id` - Auto-generated UUID
- `created_at` - Auto-generated timestamp
- `updated_at` - Auto-generated timestamp

### 8. Follow Up Sequences - Templates → template_follow_up_sequences

| Airtable Field | Supabase Field | Type | Transformation | Notes |
|----------------|----------------|------|----------------|-------|
| Name | display_name | string | Direct | Required |
| Subject | subject | string | Direct | Required |
| _record_id | airtable_record_id | string? | Direct | For linking |

**Unmapped Supabase Fields:**
- `id` - Auto-generated UUID
- `created_at` - Auto-generated timestamp
- `updated_at` - Auto-generated timestamp

### 9. Follow Up Sequence - Template Messages → template_follow_up_messages

| Airtable Field | Supabase Field | Type | Transformation | Notes |
|----------------|----------------|------|----------------|-------|
| Follow Up Sequence | sequence_id | string | Link via airtable_record_id | Foreign key to template_follow_up_sequences |
| Step Index | step_index | number | Direct | Required |
| Message | message_content | string | Direct | Required |
| Time Delay (Hours) | time_delay_hours | number | Direct | Required |
| Status | status | enum | Map via follow_up_message_status table | Default: 'active' |
| _record_id | airtable_record_id | string? | Direct | For linking |

**Unmapped Supabase Fields:**
- `id` - Auto-generated UUID
- `created_at` - Auto-generated timestamp
- `updated_at` - Auto-generated timestamp

### 10. Automated Follow Ups → automated_follow_ups

| Airtable Field | Supabase Field | Type | Transformation | Notes |
|----------------|----------------|------|----------------|-------|
| Student | student_id | string | Link via airtable_record_id | Foreign key to students |
| Follow Up Sequence | sequence_id | string | Link via airtable_record_id | Foreign key to template_follow_up_sequences |
| Status | status | enum | Map via automated_follow_up_status table | Default: 'activated' |
| Activated Time | started_at | string | Convert to ISO 8601 | Required |
| Last Follow Up Time | last_message_sent_at | string? | Convert to ISO 8601 | |
| Completed At | completed_at | string? | Convert to ISO 8601 | |
| _record_id | airtable_record_id | string? | Direct | For linking |

**Unmapped Supabase Fields:**
- `id` - Auto-generated UUID
- `created_at` - Auto-generated timestamp
- `updated_at` - Auto-generated timestamp

### 11. CRM Touchpoints/Follow Ups → touchpoints

| Airtable Field | Supabase Field | Type | Transformation | Notes |
|----------------|----------------|------|----------------|-------|
| Leads | student_id | string | Link via airtable_record_id | Foreign key to students |
| Message from Lead / Message to Lead | message | string | Direct | Required |
| Channel | channel | enum | Map via touchpoint_channel table | Required |
| Type | type | enum | Map via touchpoint_type table | Required |
| Source | source | enum | Always 'manual' | Default: 'manual' |
| Automated Follow Up | automated_follow_up_id | string? | Link via airtable_record_id | Foreign key to automated_follow_ups |
| Date | occurred_at | string | Convert to ISO 8601 | Required |
| External ID | external_id | string? | Direct | |
| External Metadata | external_metadata | string? | Direct | |
| _record_id | airtable_record_id | string? | Direct | For linking |

**Unmapped Supabase Fields:**
- `id` - Auto-generated UUID
- `created_at` - Auto-generated timestamp
- `updated_at` - Auto-generated timestamp

### 12. Cohort Weekly Session → weekly_sessions

| Airtable Field | Supabase Field | Type | Transformation | Notes |
|----------------|----------------|------|----------------|-------|
| Cohort | cohort_id | string | Link via airtable_record_id | Foreign key to cohorts |
| Teacher | teacher_id | string | Link via airtable_record_id | Foreign key to teachers |
| Day of Week | day_of_week | enum | Map via day_of_week table | Required |
| Start Time (hh:mm) | start_time | string | Convert from duration (seconds) to HH:MM:SS | Required |
| End Time | end_time | string | Parse formula field and convert to HH:MM:SS | Required |
| Google Calendar Event ID | google_calendar_event_id | string? | Direct | |
| _record_id | airtable_record_id | string? | Direct | For linking |

**Unmapped Supabase Fields:**
- `id` - Auto-generated UUID
- `created_at` - Auto-generated timestamp
- `updated_at` - Auto-generated timestamp

### 13. Events/Classes → classes

| Airtable Field | Supabase Field | Type | Transformation | Notes |
|----------------|----------------|------|----------------|-------|
| French Program/Cohort | cohort_id | string | Link via airtable_record_id | Foreign key to cohorts |
| Teacher | teacher_id | string? | Link via airtable_record_id | Foreign key to teachers |
| Start Date Time | start_time | string | Convert to ISO 8601 | Required |
| End Date | end_time | string | Convert to ISO 8601 | Required |
| Status | status | enum | Always 'scheduled' (no field in Airtable) | Default: 'scheduled' |
| Online Access Link | meeting_link | string? | Direct | |
| Notes | notes | string? | Direct | |
| Google Calendar Event ID | google_calendar_event_id | string? | Direct | |
| Google Drive Folder ID | google_drive_folder_id | string? | Direct | |
| _record_id | airtable_record_id | string? | Direct | For linking |

**Unmapped Supabase Fields:**
- `id` - Auto-generated UUID
- `created_at` - Auto-generated timestamp
- `updated_at` - Auto-generated timestamp
- `deleted_at` - Soft delete field

---

## Data Validation Rules

### Pre-Import Validation

1. **Required Fields Check**
   - Verify all non-nullable fields have values
   - Log records with missing required fields

2. **Enum Value Validation**
   ```javascript
   // For each enum field, validate value exists in mapping
   if (!enumMappings[enumType][airtableValue]) {
     console.warn(`Unknown ${enumType} value: ${airtableValue}`);
     // Use fallback or skip record
   }
   ```

3. **Date Format Validation**
   ```javascript
   // Convert all dates to ISO 8601
   const isoDate = new Date(airtableDate).toISOString();
   ```

4. **Phone Number Formatting**
   ```javascript
   // Standardize phone numbers
   const cleaned = phoneNumber.replace(/\D/g, '');
   const formatted = `+1${cleaned}`;
   ```

5. **Email Validation**
   ```javascript
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   if (!emailRegex.test(email)) {
     console.warn(`Invalid email: ${email}`);
   }
   ```

### Post-Import Verification

```sql
-- Check record counts
SELECT 
  'teachers' as table_name, 
  COUNT(*) as total,
  COUNT(airtable_record_id) as with_airtable_id
FROM teachers
UNION ALL
SELECT 'students', COUNT(*), COUNT(airtable_record_id) FROM students
UNION ALL
SELECT 'cohorts', COUNT(*), COUNT(airtable_record_id) FROM cohorts;

-- Check for duplicate Airtable IDs
SELECT airtable_record_id, COUNT(*) 
FROM teachers 
WHERE airtable_record_id IS NOT NULL
GROUP BY airtable_record_id 
HAVING COUNT(*) > 1;

-- Verify foreign key integrity
SELECT e.id, e.student_id, e.cohort_id
FROM enrollments e
LEFT JOIN students s ON e.student_id = s.id
LEFT JOIN cohorts c ON e.cohort_id = c.id
WHERE s.id IS NULL OR c.id IS NULL;

-- Check enum value distribution
SELECT 
  onboarding_status, 
  COUNT(*) as count,
  ROUND(COUNT(*)::numeric / SUM(COUNT(*)) OVER() * 100, 2) as percentage
FROM teachers
GROUP BY onboarding_status
ORDER BY count DESC;
```

---

## Import Script Structure

```typescript
// Pre-Import: Match language levels
await matchLanguageLevels();

// PASS 1: Import all data
// Import reference data first
await importProducts();
// Note: importLanguageLevels() is skipped - we use existing ones with matching
await importTeachers();

// Import dependent data (storing for Pass 2)
const students = await importStudents();
await importTemplateFollowUpSequences();
const templateMessages = await importTemplateFollowUpMessages();
const cohorts = await importCohorts();
const enrollments = await importEnrollments();
const assessments = await importStudentAssessments();
const automatedFollowUps = await importAutomatedFollowUps();
const touchpoints = await importTouchpoints();
const weeklySessions = await importWeeklySessions();
const classes = await importClasses();

// PASS 2: Update foreign keys
await updateForeignKeys(
	students,
	templateMessages,
	cohorts,
	enrollments,
	assessments,
	automatedFollowUps,
	touchpoints,
	weeklySessions,
	classes
);
```

---

## Notes and Considerations

1. **Language Levels**: Always use foreign key references, never enum values
2. **Airtable Record IDs**: Store in every table for reference and debugging
3. **Soft Deletes**: Handle `deleted_at` fields appropriately
4. **User Accounts**: Will be created separately, then linked via email matching
5. **Timezone Handling**: All timestamps should be UTC
6. **Data Privacy**: Sanitize any PII before import if needed
7. **Rollback Strategy**: Keep backup before import, use transactions where possible