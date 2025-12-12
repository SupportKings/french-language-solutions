import { createClient } from "@/lib/supabase/client";

import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import type { LanguageLevel } from "../types/language-level.types";
import { sortLanguageLevels } from "../utils/sorting";

export const languageLevelQueries = {
	all: () => ["language-levels"] as const,
	list: () =>
		queryOptions({
			queryKey: [...languageLevelQueries.all(), "list"] as const,
			queryFn: async () => {
				const supabase = createClient();
				const { data, error } = await supabase
					.from("language_levels")
					.select("*");

				if (error) throw error;
				// Apply natural sorting to handle A1.2 vs A1.11 correctly
				return sortLanguageLevels(data as LanguageLevel[]);
			},
			staleTime: 1000 * 60 * 5, // 5 minutes
		}),

	byId: (id: string) =>
		queryOptions({
			queryKey: [...languageLevelQueries.all(), id] as const,
			queryFn: async () => {
				const supabase = createClient();
				const { data, error } = await supabase
					.from("language_levels")
					.select("*")
					.eq("id", id)
					.single();

				if (error) throw error;
				return data as LanguageLevel;
			},
		}),
};

export const useUpdateLanguageLevel = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: Partial<LanguageLevel>;
		}) => {
			const supabase = createClient();
			const { data: updated, error } = await supabase
				.from("language_levels")
				.update({
					code: data.code,
					display_name: data.display_name,
					level_group: data.level_group,
					hours: data.hours,
					updated_at: new Date().toISOString(),
				})
				.eq("id", id)
				.select()
				.single();

			if (error) throw error;
			return updated;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: languageLevelQueries.all() });
		},
	});
};

export const useCreateLanguageLevel = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: Partial<LanguageLevel>) => {
			const supabase = createClient();
			const { data: created, error } = await supabase
				.from("language_levels")
				.insert({
					code: data.code,
					display_name: data.display_name,
					level_group: data.level_group,
					hours: data.hours || 2,
				})
				.select()
				.single();

			if (error) throw error;
			return created;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: languageLevelQueries.all() });
		},
	});
};

export const useDeleteLanguageLevel = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const supabase = createClient();
			const { error } = await supabase
				.from("language_levels")
				.delete()
				.eq("id", id);

			if (error) throw error;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: languageLevelQueries.all() });
		},
	});
};
