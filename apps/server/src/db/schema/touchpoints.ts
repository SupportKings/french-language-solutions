import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { automatedFollowUps } from "./automated-follow-ups";
import { students } from "./students";

// Enum for communication channels
export const touchpointChannelEnum = pgEnum("touchpoint_channel", [
	"sms",
	"call",
	"whatsapp",
	"email",
]);

// Enum for touchpoint type
export const touchpointTypeEnum = pgEnum("touchpoint_type", [
	"inbound",
	"outbound",
]);

// Enum for touchpoint source
export const touchpointSourceEnum = pgEnum("touchpoint_source", [
	"manual",
	"automated",
	"openphone",
	"gmail",
	"whatsapp_business",
	"webhook",
]);

export const touchpoints = pgTable("touchpoints", {
	id: uuid("id").primaryKey().defaultRandom(),
	studentId: uuid("student_id")
		.notNull()
		.references(() => students.id),
	channel: touchpointChannelEnum("channel").notNull(),
	type: touchpointTypeEnum("type").notNull(),
	message: text("message").notNull(),
	source: touchpointSourceEnum("source").notNull().default("manual"),
	// Optional link to automated follow-up if this touchpoint is part of an automated sequence
	automatedFollowUpId: uuid("automated_follow_up_id").references(
		() => automatedFollowUps.id,
	),
	// Metadata for external sources
	externalId: text("external_id"), // ID from external system (OpenPhone, Gmail, etc.)
	externalMetadata: text("external_metadata"), // JSON string for additional data from external sources
	// Timestamps
	occurredAt: timestamp("occurred_at").notNull().defaultNow(), // When the touchpoint actually happened
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
