#!/usr/bin/env bun

import { writeFileSync } from "node:fs";
import { join } from "node:path";

// Airtable configuration
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || "";
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || "";

console.log("🔍 Environment check:");
console.log(
	`AIRTABLE_API_KEY: ${AIRTABLE_API_KEY ? `${AIRTABLE_API_KEY.substring(0, 20)}... (${AIRTABLE_API_KEY.length} chars)` : "NOT SET"}`,
);
console.log(`AIRTABLE_BASE_ID: ${AIRTABLE_BASE_ID || "NOT SET"}`);

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
	console.error("❌ Missing environment variables!");
	console.error(
		"Please set AIRTABLE_API_KEY and AIRTABLE_BASE_ID in your .env file",
	);
	process.exit(1);
}

interface AirtableField {
	id: string;
	name: string;
	type: string;
	options?: any;
	description?: string;
}

interface AirtableTable {
	id: string;
	name: string;
	description?: string;
	fields: AirtableField[];
}

interface AirtableSchema {
	tables: AirtableTable[];
}

// Fetch base schema from Airtable
async function fetchBaseSchema(): Promise<AirtableSchema> {
	const url = `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`;

	console.log(`📡 Fetching from: ${url}`);
	console.log(`🔑 Using API Key: ${AIRTABLE_API_KEY.substring(0, 20)}...`);

	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${AIRTABLE_API_KEY}`,
		},
	});

	if (!response.ok) {
		const errorText = await response.text();
		console.error(`❌ API Response: ${response.status} ${response.statusText}`);
		console.error(`❌ Error details: ${errorText}`);
		throw new Error(
			`Failed to fetch schema: ${response.status} ${response.statusText}\nDetails: ${errorText}`,
		);
	}

	const data = await response.json();
	return data;
}

// Fetch sample records to infer data types better
async function fetchSampleRecords(
	tableName: string,
	limit = 3,
): Promise<any[]> {
	const encodedTableName = encodeURIComponent(tableName);
	const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodedTableName}?maxRecords=${limit}`;

	try {
		const response = await fetch(url, {
			headers: {
				Authorization: `Bearer ${AIRTABLE_API_KEY}`,
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			console.warn(`⚠️  Could not fetch sample records for ${tableName}`);
			return [];
		}

		const data = await response.json();
		return data.records || [];
	} catch (error) {
		console.warn(`⚠️  Error fetching sample records for ${tableName}:`, error);
		return [];
	}
}

// Generate TypeScript interface for a table
function generateTypeScriptInterface(table: AirtableTable): string {
	let output = `// ${table.name}\n`;
	output += `export interface Airtable${table.name.replace(/[^a-zA-Z0-9]/g, "")} {\n`;
	output += "  id: string; // Airtable record ID\n";
	output += "  createdTime: string; // ISO 8601 formatted date\n";

	// Add fields from schema
	for (const field of table.fields) {
		const fieldType = mapAirtableTypeToTypeScript(field.type, field.options);
		const optional = field.type !== "autonumber" ? "?" : "";
		const comment = generateFieldComment(field);
		output += `  "${field.name}"${optional}: ${fieldType}; ${comment}\n`;
	}

	output += "}\n";
	return output;
}

// Map Airtable field types to TypeScript types
function mapAirtableTypeToTypeScript(
	airtableType: string,
	options?: any,
): string {
	const typeMap: Record<string, string> = {
		singleLineText: "string",
		email: "string",
		url: "string",
		multilineText: "string",
		richText: "string",
		phoneNumber: "string",
		number: "number",
		percent: "number",
		currency: "number",
		rating: "number",
		duration: "number",
		checkbox: "boolean",
		date: "string", // ISO 8601
		dateTime: "string", // ISO 8601
		createdTime: "string",
		lastModifiedTime: "string",
		createdBy: "{ id: string; email: string; name: string }",
		lastModifiedBy: "{ id: string; email: string; name: string }",
		barcode: "{ text: string; type: string }",
		button: "{ label: string; url: string }",
		autoNumber: "number",
	};

	// Handle special field types
	switch (airtableType) {
		case "singleSelect":
			if (options?.choices) {
				const choices = options.choices
					.map((c: any) => `"${c.name}"`)
					.join(" | ");
				return choices || "string";
			}
			return "string";

		case "multipleSelects":
			if (options?.choices) {
				const choices = options.choices
					.map((c: any) => `"${c.name}"`)
					.join(" | ");
				return `(${choices})[]` || "string[]";
			}
			return "string[]";

		case "multipleRecordLinks":
			return "string[]"; // Array of record IDs

		case "singleRecordLink":
			return "string"; // Single record ID

		case "multipleAttachments":
			return "{ id: string; url: string; filename: string; size: number; type: string }[]";

		case "singleAttachment":
			return "{ id: string; url: string; filename: string; size: number; type: string }";

		case "multipleLookupValues":
			return "any[]"; // Depends on the looked-up field

		case "formula":
		case "rollup":
		case "count":
			// These depend on the formula/rollup configuration
			return "any";

		case "multipleCollaborators":
			return "{ id: string; email: string; name: string }[]";

		case "singleCollaborator":
			return "{ id: string; email: string; name: string }";

		default:
			return typeMap[airtableType] || "any";
	}
}

// Generate comment for field
function generateFieldComment(field: AirtableField): string {
	let comment = `// ${field.type}`;

	if (field.options?.linkedTableId) {
		comment += ` - Links to table ID: ${field.options.linkedTableId}`;
	}

	if (field.options?.formula) {
		comment += ` - Formula: ${field.options.formula}`;
	}

	if (field.description) {
		comment += ` - ${field.description}`;
	}

	return comment;
}

// Main function
async function main() {
	console.log("🔄 Fetching Airtable schema...");

	try {
		// Fetch the base schema
		const schema = await fetchBaseSchema();
		console.log(`✅ Found ${schema.tables.length} tables in Airtable base`);

		// Generate output
		let typeScriptOutput = "// Airtable Schema Types\n";
		typeScriptOutput += "// Generated on: " + new Date().toISOString() + "\n\n";

		let schemaDocOutput = "AIRTABLE SCHEMA DOCUMENTATION\n";
		schemaDocOutput += "=".repeat(80) + "\n";
		schemaDocOutput += `Generated on: ${new Date().toISOString()}\n`;
		schemaDocOutput += `Base ID: ${AIRTABLE_BASE_ID}\n`;
		schemaDocOutput += "=".repeat(80) + "\n\n";

		// Process each table
		for (const table of schema.tables) {
			console.log(`📊 Processing table: ${table.name}`);

			// Fetch sample records
			const sampleRecords = await fetchSampleRecords(table.name);

			// Generate TypeScript interface
			typeScriptOutput += generateTypeScriptInterface(table) + "\n";

			// Generate documentation
			schemaDocOutput += `TABLE: ${table.name}\n`;
			schemaDocOutput += "-".repeat(40) + "\n";
			if (table.description) {
				schemaDocOutput += `Description: ${table.description}\n`;
			}
			schemaDocOutput += `Table ID: ${table.id}\n`;
			schemaDocOutput += `Number of fields: ${table.fields.length}\n\n`;
			schemaDocOutput += "Fields:\n";

			for (const field of table.fields) {
				schemaDocOutput += `  - ${field.name}\n`;
				schemaDocOutput += `    Type: ${field.type}\n`;
				schemaDocOutput += `    Field ID: ${field.id}\n`;

				if (field.description) {
					schemaDocOutput += `    Description: ${field.description}\n`;
				}

				if (field.options) {
					if (field.options.linkedTableId) {
						schemaDocOutput += `    Links to: Table ID ${field.options.linkedTableId}\n`;
					}
					if (field.options.choices) {
						schemaDocOutput += `    Options: ${field.options.choices.map((c: any) => c.name).join(", ")}\n`;
					}
					if (field.options.formula) {
						schemaDocOutput += `    Formula: ${field.options.formula}\n`;
					}
				}
				schemaDocOutput += "\n";
			}

			schemaDocOutput += "\n";
		}

		// Save TypeScript types
		const typesPath = join(process.cwd(), "airtable-schema.types.ts");
		writeFileSync(typesPath, typeScriptOutput, "utf-8");
		console.log(`✅ TypeScript types saved to: ${typesPath}`);

		// Save documentation
		const docPath = join(process.cwd(), "airtable-schema.txt");
		writeFileSync(docPath, schemaDocOutput, "utf-8");
		console.log(`✅ Schema documentation saved to: ${docPath}`);

		// Save JSON schema for programmatic use
		const jsonPath = join(process.cwd(), "airtable-schema.json");
		writeFileSync(jsonPath, JSON.stringify(schema, null, 2), "utf-8");
		console.log(`✅ JSON schema saved to: ${jsonPath}`);

		console.log("\n🎉 Schema extraction complete!");
		console.log("\n📋 Next steps:");
		console.log("1. Review the generated files:");
		console.log("   - airtable-schema.types.ts (TypeScript interfaces)");
		console.log("   - airtable-schema.txt (Human-readable documentation)");
		console.log("   - airtable-schema.json (Raw schema data)");
		console.log("2. Run the mapping script to map Airtable fields to Supabase");
	} catch (error) {
		console.error("❌ Error fetching schema:", error);
		process.exit(1);
	}
}

// Run the script
main();
