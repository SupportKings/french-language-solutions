import {
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import {
	productFormatEnum,
	productLocationEnum,
} from "./enums";

export const products = pgTable("products", {
	id: uuid("id").primaryKey().defaultRandom(),
	displayName: text("display_name").notNull(),
	location: productLocationEnum("location").notNull(),
	format: productFormatEnum("format").notNull(),
	signupLinkForSelfCheckout: text("signup_link_for_self_checkout"),
	pandadocContractTemplateId: text("pandadoc_contract_template_id"),
	airtableRecordId: text("airtable_record_id"), // For migration tracking
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});