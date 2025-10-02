# RBAC Quick Reference Guide

Quick reference for implementing access control in new API routes and components.

---

## Import Statement

```typescript
import {
  requireAuth,
  requireAdmin,
  isAdmin,
  canAccessStudent,
  canAccessCohort,
  filterStudentsByAccess,
  applyCohortFilter
} from "@/lib/rbac-middleware";
```

---

## Common Patterns

### 1. List Endpoint (with filtering)

```typescript
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const supabase = await createClient();

    // Fetch data with relations
    const { data } = await supabase
      .from("students")
      .select("*, enrollments(*)");

    // Apply RBAC filtering
    const filtered = await filterStudentsByAccess(data, session);

    return NextResponse.json({ data: filtered });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

### 2. Single Resource (with access check)

```typescript
export async function GET(request: NextRequest, { params }) {
  try {
    const { id } = await params;
    await requireAuth();

    // Check access
    const hasAccess = await canAccessStudent(id);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch data
    const supabase = await createClient();
    const { data } = await supabase
      .from("students")
      .select("*")
      .eq("id", id)
      .single();

    return NextResponse.json(data);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

### 3. Create Resource (authenticated only)

```typescript
export async function POST(request: NextRequest) {
  try {
    await requireAuth(); // Both admins and teachers can create

    const body = await request.json();
    const supabase = await createClient();

    const { data } = await supabase
      .from("students")
      .insert(body)
      .select()
      .single();

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

### 4. Update Resource (with access check)

```typescript
export async function PATCH(request: NextRequest, { params }) {
  try {
    const { id } = await params;
    await requireAuth();

    // Check access
    const hasAccess = await canAccessStudent(id);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update
    const body = await request.json();
    const supabase = await createClient();

    const { data } = await supabase
      .from("students")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    return NextResponse.json(data);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

### 5. Delete Resource (admin only)

```typescript
export async function DELETE(request: NextRequest, { params }) {
  try {
    const { id } = await params;

    // Only admins can delete
    await requireAdmin();

    const supabase = await createClient();
    await supabase.from("students").delete().eq("id", id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "Only administrators can delete" },
        { status: 403 }
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

---

## Server Actions

```typescript
"use server";

import { requireAuth, canAccessStudent } from "@/lib/rbac-middleware";
import { actionClient } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  id: z.string(),
  name: z.string(),
});

export const updateStudent = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    // 1. Require auth
    await requireAuth();

    // 2. Check access
    const hasAccess = await canAccessStudent(parsedInput.id);
    if (!hasAccess) {
      throw new Error("You don't have permission to update this student");
    }

    // 3. Update
    const supabase = await createClient();
    const { data } = await supabase
      .from("students")
      .update({ name: parsedInput.name })
      .eq("id", parsedInput.id)
      .single();

    // 4. Revalidate
    revalidatePath("/admin/students");

    return { success: true, data };
  });
```

---

## Client Components

### Check Role

```typescript
"use client";
import { useSession } from "@/lib/auth-client";

export function AdminOnlyButton() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  if (!isAdmin) return null;

  return <button>Delete</button>;
}
```

### Conditional Rendering

```typescript
"use client";
import { useSession } from "@/lib/auth-client";

export function Navigation() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  return (
    <nav>
      <Link href="/students">Students</Link>
      <Link href="/cohorts">Cohorts</Link>
      <Link href="/assessments">Assessments</Link>

      {/* Admin only */}
      {role === "admin" && (
        <>
          <Link href="/team-members">Team Members</Link>
          <Link href="/configuration">Configuration</Link>
        </>
      )}
    </nav>
  );
}
```

---

## Helper Functions Reference

| Function | Purpose | Returns |
|----------|---------|---------|
| `requireAuth()` | Require user to be logged in | `Session` or throws `UNAUTHORIZED` |
| `requireAdmin()` | Require user to be admin | `Session` or throws `FORBIDDEN` |
| `isAdmin(session?)` | Check if user is admin | `boolean` |
| `isTeacher(session?)` | Check if user is teacher | `boolean` |
| `canAccessStudent(id)` | Check access to specific student | `boolean` |
| `canAccessCohort(id)` | Check access to specific cohort | `boolean` |
| `getTeacherIdFromSession()` | Get teacher record ID | `string \| null` |
| `getCurrentUserCohortIds()` | Get user's cohort IDs | `string[]` |
| `filterStudentsByAccess(data, session?)` | Filter student array | `Student[]` |
| `applyCohortFilter(query, session?)` | Apply cohort filter to query | `Query` |

---

## Error Handling Pattern

```typescript
try {
  // Your logic here
} catch (error: any) {
  if (error.message === "UNAUTHORIZED") {
    return NextResponse.json(
      { error: "You must be logged in" },
      { status: 401 }
    );
  }
  if (error.message === "FORBIDDEN") {
    return NextResponse.json(
      { error: "You don't have permission" },
      { status: 403 }
    );
  }

  console.error("Error:", error);
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}
```

---

## Common Use Cases

### "Anyone can create, but only assigned users can update/delete"
```typescript
// POST - no access check
export async function POST(request: NextRequest) {
  await requireAuth(); // Just authenticated
  // ... create logic
}

// PATCH - with access check
export async function PATCH(request: NextRequest, { params }) {
  await requireAuth();
  const hasAccess = await canAccessStudent(params.id);
  if (!hasAccess) return forbidden();
  // ... update logic
}
```

### "Admin only endpoint"
```typescript
export async function DELETE(request: NextRequest) {
  await requireAdmin(); // Throws if not admin
  // ... delete logic
}
```

### "Filter list based on role"
```typescript
export async function GET(request: NextRequest) {
  const session = await requireAuth();

  // Fetch all
  const { data } = await supabase.from("students").select("*");

  // Filter based on role (admins see all, teachers see filtered)
  const filtered = await filterStudentsByAccess(data, session);

  return NextResponse.json({ data: filtered });
}
```

---

## Testing Commands

```bash
# Check types
bun check-types

# Run formatter
bun check

# Start dev server
bun dev
```

---

## Quick Troubleshooting

**401 Unauthorized**: User not logged in → Check `requireAuth()`
**403 Forbidden**: User doesn't have permission → Check access control logic
**Empty results**: Teacher has no cohorts → Check `weekly_sessions` table
**Still seeing all data**: Not using filter → Check `filterStudentsByAccess()` call

---

## Reference Files

- Full examples: `/API_RBAC_EXAMPLES.md`
- Implementation guide: `/RBAC_IMPLEMENTATION.md`
- Complete summary: `/RBAC_IMPLEMENTATION_COMPLETE.md`
- Better Auth docs: https://www.better-auth.com/docs/plugins/admin
