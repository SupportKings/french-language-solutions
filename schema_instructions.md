  I have an entities.md file that describes all the database entities for my project. Please generate complete Drizzle ORM schemas for PostgreSQL based on these entity definitions.

  ## Project Setup Requirements:
  - Framework: Drizzle ORM with PostgreSQL
  - Location: Generate files in server/src/db/schema/
  - Database: PostgreSQL (Supabase compatible)
  - Primary Keys: Use UUID for all tables
  - Naming: snake_case for database, camelCase for TypeScript
  - Timestamps: All tables need created_at and updated_at
  - Soft Deletes: Add deleted_at where specified

  ## Generation Rules:

  ### 1. File Structure:
  - Create one file per major entity: server/src/db/schema/[entity-name].ts
  - Create server/src/db/schema/index.ts that exports all schemas
  - Group related entities in the same file when they're tightly coupled

  ### 2. For Each Entity, Generate:
  ```typescript
  // Import statements
  import { pgTable, uuid, varchar, timestamp, integer, boolean, text, jsonb, decimal, pgEnum } from "drizzle-orm/pg-core";
  import { relations } from "drizzle-orm";
  import { companies } from "./companies";
  import { users } from "./users";

  // Enums (if specified in the entity)
  export const clientStatusEnum = pgEnum("client_status", [
    "prospect",
    "active",
    "inactive",
    "suspended"
  ]);

  export const clientTierEnum = pgEnum("client_tier", [
    "bronze",
    "silver",
    "gold",
    "platinum"
  ]);

  // Table definition
  export const clients = pgTable("clients", {
    // Primary key - always UUID
    id: uuid("id").primaryKey().defaultRandom(),

    // Regular fields based on entity definition
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    phoneNumber: varchar("phone_number", { length: 50 }),
    dateOfBirth: timestamp("date_of_birth"),

    // Enum fields
    status: clientStatusEnum("status").notNull().default("prospect"),
    tier: clientTierEnum("tier").default("bronze"),

    // JSON fields for flexible data
    preferences: jsonb("preferences").$type<{
      notifications: boolean;
      newsletter: boolean;
      language: string;
    }>(),

    // Numeric fields
    creditLimit: decimal("credit_limit", { precision: 10, scale: 2 }).default("0"),
    totalSpent: decimal("total_spent", { precision: 12, scale: 2 }).default("0"),
    loyaltyPoints: integer("loyalty_points").default(0),

    // Boolean fields
    isActive: boolean("is_active").notNull().default(true),
    isVerified: boolean("is_verified").notNull().default(false),

    // Foreign keys - reference other tables
    companyId: uuid("company_id").references(() => companies.id, { onDelete: "cascade" }),
    assignedUserId: uuid("assigned_user_id").references(() => users.id, { onDelete: "set null" }),

    // Metadata
    notes: text("notes"),
    tags: text("tags").array(), // Array of strings in PostgreSQL

    // Timestamps - always include these
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at"), // for soft delete
    lastContactedAt: timestamp("last_contacted_at"),
  });

  // Relations - define relationships with other tables
  export const clientsRelations = relations(clients, ({ one, many }) => ({
    // Many-to-one: Client belongs to a company
    company: one(companies, {
      fields: [clients.companyId],
      references: [companies.id],
    }),

    // Many-to-one: Client is assigned to a user
    assignedUser: one(users, {
      fields: [clients.assignedUserId],
      references: [users.id],
    }),

    // One-to-many: Client has many orders
    orders: many(orders),

    // One-to-many: Client has many addresses
    addresses: many(clientAddresses),

    // One-to-many: Client has many documents
    documents: many(clientDocuments),
  }));

  // Type exports for TypeScript
  export type Client = typeof clients.$inferSelect;
  export type NewClient = typeof clients.$inferInsert;

  3. Field Type Mappings (with examples):

  - string/text → varchar(255) or text() for long text
  Example: firstName: varchar("first_name", { length: 100 })
  - email → varchar(255) with unique constraint
  Example: email: varchar("email", { length: 255 }).notNull().unique()
  - number/integer → integer()
  Example: age: integer("age") or loyaltyPoints: integer("loyalty_points").default(0)
  - decimal/money → decimal({ precision: 10, scale: 2 })
  Example: price: decimal("price", { precision: 10, scale: 2 })
  - boolean → boolean()
  Example: isActive: boolean("is_active").notNull().default(true)
  - date/datetime → timestamp()
  Example: birthDate: timestamp("birth_date") or createdAt: timestamp("created_at").notNull().defaultNow()
  - json/object → jsonb()
  Example: settings: jsonb("settings").$type<{ theme: string; notifications: boolean }>()
  - enum → pgEnum() then use in field
  Example: status: clientStatusEnum("status").notNull().default("active")
  - uuid/id → uuid()
  Example: userId: uuid("user_id").references(() => users.id)
  - array → text().array() or jsonb()
  Example: tags: text("tags").array() or permissions: jsonb("permissions").$type<string[]>()

  4. Relationship Patterns:

  - One-to-Many: Foreign key in child table
  Example: One client has many orders → orders table has client_id
  - Many-to-Many: Create junction table
  Example: Clients and Products → create client_products table with client_id and product_id
  - One-to-One: Foreign key with unique constraint
  Example: Client has one profile → profiles table has client_id with unique constraint
  - Polymorphic: Use type + id pattern
  Example: Comments on various entities → commentable_type and commentable_id fields

  5. Index Generation:

  Add indexes for:
  - All foreign keys
  - Commonly queried fields (email, phone, status)
  - Composite indexes for combined queries
  - Unique constraints where needed