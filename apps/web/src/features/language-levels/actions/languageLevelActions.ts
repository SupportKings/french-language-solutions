"use server";

import { requireAuth } from "@/lib/rbac-middleware";
import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export const fetchLanguageLevels = actionClient.action(async () => {
	await requireAuth();
	const supabase = await createClient();

	const { data, error } = await supabase.from("language_levels").select("*");

	if (error) {
		throw new Error("Failed to fetch language levels");
	}

	return data || [];
});

const byIdSchema = z.object({
	id: z.string().uuid(),
});

export const fetchLanguageLevelById = actionClient
	.inputSchema(byIdSchema)
	.action(async ({ parsedInput: { id } }) => {
		await requireAuth();
		const supabase = await createClient();

		const { data, error } = await supabase
			.from("language_levels")
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			throw new Error("Failed to fetch language level");
		}

		return data;
	});

const createSchema = z.object({
	code: z.string().min(1),
	display_name: z.string().min(1),
	level_group: z.string().min(1),
	hours: z.number().positive().optional().default(2),
});

export const createLanguageLevel = actionClient
	.inputSchema(createSchema)
	.action(async ({ parsedInput: input }) => {
		await requireAuth();
		const supabase = await createClient();

		const { data, error } = await supabase
			.from("language_levels")
			.insert({
				code: input.code,
				display_name: input.display_name,
				level_group: input.level_group,
				hours: input.hours,
			})
			.select()
			.single();

		if (error) {
			throw new Error("Failed to create language level");
		}

		return data;
	});

const updateSchema = z.object({
	id: z.string().uuid(),
	code: z.string().min(1).optional(),
	display_name: z.string().min(1).optional(),
	level_group: z.string().min(1).optional(),
	hours: z.number().positive().optional(),
});

export const updateLanguageLevel = actionClient
	.inputSchema(updateSchema)
	.action(async ({ parsedInput: { id, ...input } }) => {
		await requireAuth();
		const supabase = await createClient();

		const { data, error } = await supabase
			.from("language_levels")
			.update({
				...input,
				updated_at: new Date().toISOString(),
			})
			.eq("id", id)
			.select()
			.single();

		if (error) {
			throw new Error("Failed to update language level");
		}

		return data;
	});

const deleteSchema = z.object({
	id: z.string().uuid(),
});

export const deleteLanguageLevel = actionClient
	.inputSchema(deleteSchema)
	.action(async ({ parsedInput: { id } }) => {
		await requireAuth();
		const supabase = await createClient();

		const { error } = await supabase
			.from("language_levels")
			.delete()
			.eq("id", id);

		if (error) {
			throw new Error("Failed to delete language level");
		}

		return { success: true };
	});
