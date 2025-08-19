// This file is for type definitions only
// Better Auth creates the actual user table
// We'll add the role field via a separate migration

import { userRoleEnum } from "./enums";

// Type definition for Better Auth user table with our custom role field
// This is for TypeScript type safety only - the actual table is created by Better Auth
export type UserRole = "admin" | "support" | "teacher" | "student";

export interface User {
	id: string;
	email: string;
	emailVerified?: boolean;
	name?: string;
	createdAt?: Date;
	updatedAt?: Date;
	image?: string;
	// Our custom field
	role?: UserRole;
}

// We'll reference the user table in our schemas using raw SQL references
// since we're not creating the table via Drizzle