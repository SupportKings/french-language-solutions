# API Route Access Control - Practical Examples

This guide shows you exactly how to implement RBAC in different types of API routes.

## Table of Contents
1. [Basic Pattern](#basic-pattern)
2. [GET List Endpoints (with filtering)](#get-list-endpoints)
3. [GET Single Resource](#get-single-resource)
4. [POST Create Resource](#post-create-resource)
5. [PATCH/PUT Update Resource](#patch-update-resource)
6. [DELETE Resource](#delete-resource)
7. [Server Actions](#server-actions)
8. [Client Components](#client-components)

---

## Basic Pattern

Every protected API route follows this pattern:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAdmin } from "@/lib/rbac-middleware";

export async function GET(request: NextRequest) {
    try {
        // 1. Check authentication
        const session = await requireAuth();

        // 2. Check authorization (role or permission)
        const userIsAdmin = await isAdmin(session);

        // 3. Apply data filtering if not admin
        if (!userIsAdmin) {
            // Filter data based on user's access
        }

        // 4. Return response
        return NextResponse.json({ data });

    } catch (error) {
        // 5. Handle errors
        if (error.message === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (error.message === "FORBIDDEN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
```

---

## GET List Endpoints

### Example 1: Students List (Filter by Teacher's Cohorts)

```typescript
// apps/web/src/app/api/students/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
    requireAuth,
    isAdmin,
    getCurrentUserCohortIds,
    filterStudentsByAccess
} from "@/lib/rbac-middleware";

export async function GET(request: NextRequest) {
    try {
        // 1. Require authentication
        const session = await requireAuth();
        const userIsAdmin = await isAdmin(session);

        const supabase = await createClient();
        const searchParams = request.nextUrl.searchParams;

        // Parse pagination params
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const offset = (page - 1) * limit;

        // 2. Build base query with enrollments
        let query = supabase
            .from("students")
            .select(`
                *,
                enrollments (
                    id,
                    status,
                    cohort_id,
                    created_at,
                    updated_at
                )
            `)
            .is("deleted_at", null);

        // 3. If NOT admin, apply teacher filtering
        if (!userIsAdmin) {
            const teacherCohortIds = await getCurrentUserCohortIds(session);

            if (teacherCohortIds.length === 0) {
                // Teacher has no cohorts - return empty
                return NextResponse.json({
                    data: [],
                    meta: { total: 0, page, limit, totalPages: 0 }
                });
            }

            // Note: Since we need to filter by enrollments.cohort_id,
            // and Supabase doesn't support filtering nested relations directly,
            // we'll fetch all and filter in-memory
        }

        // 4. Execute query
        const { data, error } = await query;

        if (error) {
            console.error("Error fetching students:", error);
            return NextResponse.json(
                { error: "Failed to fetch students" },
                { status: 500 }
            );
        }

        // 5. Filter data based on access (for teachers)
        const filteredData = await filterStudentsByAccess(data || [], session);

        // 6. Apply pagination to filtered results
        const paginatedData = filteredData.slice(offset, offset + limit);

        return NextResponse.json({
            data: paginatedData,
            meta: {
                total: filteredData.length,
                page,
                limit,
                totalPages: Math.ceil(filteredData.length / limit),
            },
        });

    } catch (error: any) {
        if (error.message === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (error.message === "FORBIDDEN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        console.error("Error in GET /api/students:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
```

### Example 2: Cohorts List (Direct DB Filtering)

```typescript
// apps/web/src/app/api/cohorts/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
    requireAuth,
    applyCohortFilter
} from "@/lib/rbac-middleware";

export async function GET(request: NextRequest) {
    try {
        // 1. Require authentication
        const session = await requireAuth();

        const supabase = await createClient();
        const searchParams = request.nextUrl.searchParams;

        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const offset = (page - 1) * limit;

        // 2. Build base query
        let query = supabase
            .from("cohorts")
            .select(`
                *,
                product:products(id, name),
                starting_level:language_levels!starting_level_id(id, code, display_name)
            `, { count: "exact" });

        // 3. Apply RBAC filtering (handles admin vs teacher automatically)
        query = await applyCohortFilter(query, session);

        // 4. Apply pagination
        query = query
            .range(offset, offset + limit - 1)
            .order("created_at", { ascending: false });

        // 5. Execute query
        const { data, error, count } = await query;

        if (error) {
            console.error("Error fetching cohorts:", error);
            return NextResponse.json(
                { error: "Failed to fetch cohorts" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            data: data || [],
            meta: {
                total: count || 0,
                page,
                limit,
                totalPages: Math.ceil((count || 0) / limit),
            },
        });

    } catch (error: any) {
        if (error.message === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.error("Error in GET /api/cohorts:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
```

---

## GET Single Resource

### Example: Get Single Student

```typescript
// apps/web/src/app/api/students/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth, canAccessStudent } from "@/lib/rbac-middleware";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // 1. Require authentication
        await requireAuth();

        // 2. Check if user can access this specific student
        const hasAccess = await canAccessStudent(params.id);

        if (!hasAccess) {
            return NextResponse.json(
                { error: "You don't have permission to access this student" },
                { status: 403 }
            );
        }

        // 3. Fetch student data
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("students")
            .select(`
                *,
                enrollments (*),
                assessments (*)
            `)
            .eq("id", params.id)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return NextResponse.json(
                    { error: "Student not found" },
                    { status: 404 }
                );
            }
            throw error;
        }

        return NextResponse.json(data);

    } catch (error: any) {
        if (error.message === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.error("Error in GET /api/students/[id]:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
```

---

## POST Create Resource

### Example: Create Student

```typescript
// apps/web/src/app/api/students/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth, hasPermission } from "@/lib/rbac-middleware";

export async function POST(request: NextRequest) {
    try {
        // 1. Require authentication
        await requireAuth();

        // 2. Check permission to write students
        const canWrite = await hasPermission("students", ["write"]);

        if (!canWrite) {
            return NextResponse.json(
                { error: "You don't have permission to create students" },
                { status: 403 }
            );
        }

        // 3. Get request body
        const body = await request.json();

        // 4. Create student
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("students")
            .insert(body)
            .select()
            .single();

        if (error) {
            console.error("Error creating student:", error);
            return NextResponse.json(
                { error: "Failed to create student" },
                { status: 500 }
            );
        }

        return NextResponse.json(data, { status: 201 });

    } catch (error: any) {
        if (error.message === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (error.message === "FORBIDDEN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        console.error("Error in POST /api/students:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
```

---

## PATCH/PUT Update Resource

### Example: Update Student

```typescript
// apps/web/src/app/api/students/[id]/route.ts

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // 1. Require authentication
        await requireAuth();

        // 2. Check access to this specific student
        const hasAccess = await canAccessStudent(params.id);

        if (!hasAccess) {
            return NextResponse.json(
                { error: "You don't have permission to update this student" },
                { status: 403 }
            );
        }

        // 3. Check write permission
        const canWrite = await hasPermission("students", ["write"]);

        if (!canWrite) {
            return NextResponse.json(
                { error: "You don't have permission to update students" },
                { status: 403 }
            );
        }

        // 4. Get request body
        const body = await request.json();

        // 5. Update student
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("students")
            .update(body)
            .eq("id", params.id)
            .select()
            .single();

        if (error) {
            console.error("Error updating student:", error);
            return NextResponse.json(
                { error: "Failed to update student" },
                { status: 500 }
            );
        }

        return NextResponse.json(data);

    } catch (error: any) {
        if (error.message === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.error("Error in PATCH /api/students/[id]:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
```

---

## DELETE Resource

### Example: Delete Cohort (Admin Only)

```typescript
// apps/web/src/app/api/cohorts/[id]/route.ts

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // 1. Require admin role (teachers can't delete cohorts)
        await requireAdmin();

        // 2. Delete cohort
        const supabase = await createClient();
        const { error } = await supabase
            .from("cohorts")
            .delete()
            .eq("id", params.id);

        if (error) {
            console.error("Error deleting cohort:", error);
            return NextResponse.json(
                { error: "Failed to delete cohort" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        if (error.message === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (error.message === "FORBIDDEN") {
            return NextResponse.json(
                { error: "Only administrators can delete cohorts" },
                { status: 403 }
            );
        }

        console.error("Error in DELETE /api/cohorts/[id]:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
```

---

## Server Actions

### Example: Create Teacher Server Action

```typescript
// apps/web/src/features/teachers/actions/createTeacher.ts

"use server";

import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/rbac-middleware";
import { teacherSchema } from "../schemas/teacher.schema";
import { revalidatePath } from "next/cache";

export const createTeacher = actionClient
    .schema(teacherSchema)
    .action(async ({ parsedInput }) => {
        // 1. Require admin role
        await requireAdmin();

        // 2. Create teacher
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("teachers")
            .insert(parsedInput)
            .select()
            .single();

        if (error) {
            throw new Error("Failed to create teacher");
        }

        // 3. Revalidate
        revalidatePath("/admin/team-members");

        return { success: true, data };
    });
```

### Example: Update Student (with access check)

```typescript
// apps/web/src/features/students/actions/updateStudent.ts

"use server";

import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/lib/supabase/server";
import { requireAuth, canAccessStudent } from "@/lib/rbac-middleware";
import { studentUpdateSchema } from "../schemas/student.schema";
import { revalidatePath } from "next/cache";

export const updateStudent = actionClient
    .schema(studentUpdateSchema)
    .action(async ({ parsedInput: { id, ...data } }) => {
        // 1. Require authentication
        await requireAuth();

        // 2. Check access to this student
        const hasAccess = await canAccessStudent(id);
        if (!hasAccess) {
            throw new Error("You don't have permission to update this student");
        }

        // 3. Update student
        const supabase = await createClient();
        const { data: updated, error } = await supabase
            .from("students")
            .update(data)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            throw new Error("Failed to update student");
        }

        // 4. Revalidate
        revalidatePath("/admin/students");
        revalidatePath(`/admin/students/${id}`);

        return { success: true, data: updated };
    });
```

---

## Client Components

### Example: Conditional Rendering Based on Permissions

```typescript
"use client";

import { useSession } from "@/lib/auth-client";

export function StudentActions({ studentId }: { studentId: string }) {
    const { data: session } = useSession();

    // Check if user is admin
    const isAdmin = session?.user?.role === "admin";

    // Teachers can edit, but only admins can delete
    return (
        <div className="flex gap-2">
            <EditStudentButton studentId={studentId} />

            {isAdmin && (
                <DeleteStudentButton studentId={studentId} />
            )}
        </div>
    );
}
```

### Example: Using Better Auth Permission Check

```typescript
"use client";

import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";

export function ConfigurationPanel() {
    const { data: session } = authClient.useSession();

    // Check permission using Better Auth
    const { data: canConfigure } = useQuery({
        queryKey: ["permission", "system:configure"],
        queryFn: async () => {
            if (!session) return false;

            const result = await authClient.admin.hasPermission({
                permissions: {
                    system: ["configure"],
                },
            });

            return result?.hasPermission || false;
        },
        enabled: !!session,
    });

    if (!canConfigure) {
        return (
            <div className="p-4 border rounded-lg">
                <p className="text-muted-foreground">
                    You don't have permission to access system configuration.
                </p>
            </div>
        );
    }

    return <ConfigurationForm />;
}
```

---

## Error Handling Pattern

Use consistent error responses across all API routes:

```typescript
// Create a helper function for error responses
function handleApiError(error: any) {
    if (error.message === "UNAUTHORIZED") {
        return NextResponse.json(
            { error: "You must be logged in to access this resource" },
            { status: 401 }
        );
    }

    if (error.message === "FORBIDDEN") {
        return NextResponse.json(
            { error: "You don't have permission to access this resource" },
            { status: 403 }
        );
    }

    console.error("API Error:", error);
    return NextResponse.json(
        { error: "An unexpected error occurred" },
        { status: 500 }
    );
}

// Use in your routes
export async function GET(request: NextRequest) {
    try {
        // ... your logic
    } catch (error) {
        return handleApiError(error);
    }
}
```

---

## Summary

### Key Principles

1. **Always authenticate first** - Use `requireAuth()` at the start of every protected route
2. **Check authorization** - Use role checks (`isAdmin()`) or permission checks (`hasPermission()`)
3. **Filter data** - Apply data filtering for teachers to only show their assigned resources
4. **Handle errors consistently** - Use the same error response pattern everywhere
5. **Revalidate paths** - After mutations, revalidate affected paths for fresh data

### When to Use What

- **`requireAuth()`** - Every protected route (throws if not logged in)
- **`requireAdmin()`** - Admin-only operations (throws if not admin)
- **`isAdmin()`** - Check admin status (returns boolean)
- **`hasPermission()`** - Check specific permission using Better Auth (returns boolean)
- **`canAccessStudent/Cohort()`** - Check access to specific resource (returns boolean)
- **`applyCohortFilter()`** - Filter Supabase query for cohorts
- **`filterStudentsByAccess()`** - Filter student array in-memory

### Testing Checklist

- [ ] Unauthenticated users get 401
- [ ] Teachers can't access admin-only endpoints (403)
- [ ] Teachers only see their assigned cohorts
- [ ] Teachers only see students in their cohorts
- [ ] Admins see everything
- [ ] Teachers can access all assessments
- [ ] Removing teacher from cohort removes access immediately
