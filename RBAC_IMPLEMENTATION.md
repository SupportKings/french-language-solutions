# RBAC Implementation Guide

## Overview
This document outlines the Role-Based Access Control (RBAC) implementation for the French Language Solutions platform.

## Roles

### Admin
- **Access**: Full access to all sections and data
- **Permissions**: Can see everything regardless of their role as a teacher
- **Use Case**: VAs (Virtual Assistants) and administrators

### Teacher
- **Access**: Restricted to assigned data only
- **Permissions**:
  - Students: Only students in their assigned cohorts
  - Cohorts: Only cohorts where they teach (via weekly_sessions)
  - Assessments: All assessments (read and write)
  - NO access to: Team Members, Enrollments, Configuration, Automation

## Data Model Relationships

```
Teachers ←→ WeeklySessions ←→ Cohorts
Students ←→ Enrollments ←→ Cohorts
Teachers ←→ StudentAssessments ←→ Students
Teachers.user_id ←→ User.id (Better Auth)
```

## Implementation Checklist

### ✅ Completed
1. Updated `permissions.ts` with new permission categories:
   - `students`: ["read", "write", "read_all", "read_assigned"]
   - `cohorts`: ["read", "write", "read_all", "read_assigned"]
   - `assessments`: ["read", "write", "read_all"]
   - `teachers`: ["read", "write", "read_all"]
   - `enrollments`: ["read", "write", "read_all"]
   - `automation`: ["read", "write"]

2. Updated sidebar navigation (`app-sidebar.tsx`) to show/hide sections based on permissions

3. Created `auth-utils.ts` helper utility for permission checks

### 🚧 In Progress
4. Update API routes with access control:
   - `/api/students/route.ts` - Filter students by teacher's cohorts
   - `/api/students/[id]/route.ts` - Check student access
   - `/api/cohorts/route.ts` - Filter cohorts by teacher assignment
   - `/api/cohorts/[id]/route.ts` - Check cohort access
   - `/api/assessments/*` - Allow all teachers to access

### ⏳ Pending
5. Update `auth-utils.ts` to query teacher ID from user session

6. Add access control middleware for protected routes

7. Update server actions with permission checks

8. Add client-side permission checks using Better Auth's AC

## API Route Access Control Pattern

### Students API
```typescript
// GET /api/students
if (!userIsAdmin) {
  // 1. Get teacher ID from user session
  // 2. Get cohort IDs from weekly_sessions where teacher_id = teacherId
  // 3. Filter students where enrollments.cohort_id IN (cohortIds)
}
```

### Cohorts API
```typescript
// GET /api/cohorts
if (!userIsAdmin) {
  // 1. Get teacher ID from user session
  // 2. Join with weekly_sessions to get only cohorts where teacher_id = teacherId
}
```

### Assessments API
```typescript
// GET /api/assessments
// All teachers can access all assessments (no filtering needed)
```

## Better Auth Access Control Usage

### Server-side (Server Actions)
```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function someAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const hasAccess = await auth.api.hasPermission({
    headers: await headers(),
    permissions: ["students:read_all"]
  });

  if (!hasAccess && session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
}
```

### Client-side (React Components)
```typescript
"use client";
import { authClient } from "@/lib/auth-client";

export function SomeComponent() {
  const { data: session } = authClient.useSession();

  const canAccessStudents = session?.user.role === "admin" ||
    authClient.hasPermission(session, "students:read_assigned");

  if (!canAccessStudents) {
    return <AccessDenied />;
  }

  return <StudentList />;
}
```

## Testing Plan

1. **Admin User**:
   - ✓ Can see all navigation sections
   - ✓ Can access all students
   - ✓ Can access all cohorts
   - ✓ Can access configuration/automation

2. **Teacher User** (without admin role):
   - ✓ Can only see Students Hub, Classes Hub, Assessments
   - ✓ Cannot see Team Members, Enrollments, Configuration, Automation
   - ✓ Can only see students in their assigned cohorts
   - ✓ Can only see their assigned cohorts
   - ✓ Can access all assessments

3. **Teacher with Admin Role** (dual role):
   - ✓ Can see all sections
   - ✓ Can access all data (admin overrides teacher restrictions)

## Database Queries Needed

### Get Teacher's Cohort IDs
```sql
SELECT cohort_id
FROM weekly_sessions
WHERE teacher_id = $teacherId
```

### Get Students in Teacher's Cohorts
```sql
SELECT DISTINCT s.*
FROM students s
INNER JOIN enrollments e ON e.student_id = s.id
INNER JOIN weekly_sessions ws ON ws.cohort_id = e.cohort_id
WHERE ws.teacher_id = $teacherId
AND s.deleted_at IS NULL
```

### Get Teacher ID from User ID
```sql
SELECT id
FROM teachers
WHERE user_id = $userId
```

## Important Notes

1. **Real-time Sync**: When a teacher is removed from a cohort (weekly_sessions record deleted), they instantly lose access to that cohort's students.

2. **Dual Roles**: If a user has role="admin", they bypass all teacher restrictions, even if they're also listed as a teacher in the teachers table.

3. **Assessments**: All teachers can view and edit all assessments (no restriction).

4. **Performance**: Consider adding database indexes on:
   - `teachers.user_id`
   - `weekly_sessions.teacher_id`
   - `enrollments.cohort_id`

## Next Steps

1. Complete the student API route filtering logic
2. Implement cohort API route filtering
3. Update auth-utils to get teacher ID
4. Add middleware for route protection
5. Test all scenarios thoroughly
6. Add proper error messages for unauthorized access
