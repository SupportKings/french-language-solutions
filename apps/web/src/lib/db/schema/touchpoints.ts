import {
	pgTable,
	text,
	timestamp,
	uuid,
	pgEnum,
} from "drizzle-orm/pg-core";

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
	studentId: uuid("student_id").notNull(),
	channel: touchpointChannelEnum("channel").notNull(),
	type: touchpointTypeEnum("type").notNull(),
	message: text("message").notNull(),
	source: touchpointSourceEnum("source").notNull().default("manual"),
	automatedFollowUpId: uuid("automated_follow_up_id"),
	externalId: text("external_id"),
	externalMetadata: text("external_metadata"),
	occurredAt: timestamp("occurred_at").notNull().defaultNow(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});