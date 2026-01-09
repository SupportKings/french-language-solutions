import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import {
	createLanguageLevel,
	deleteLanguageLevel,
	fetchLanguageLevelById,
	fetchLanguageLevels,
	updateLanguageLevel,
} from "../actions/languageLevelActions";
import type { LanguageLevel } from "../types/language-level.types";
import { sortLanguageLevels } from "../utils/sorting";

export const languageLevelQueries = {
	all: () => ["language-levels"] as const,
	list: () =>
		queryOptions({
			queryKey: [...languageLevelQueries.all(), "list"] as const,
			queryFn: async () => {
				const result = await fetchLanguageLevels();
				if (!result?.data) {
					throw new Error("Failed to fetch language levels");
				}
				return sortLanguageLevels(result.data as LanguageLevel[]);
			},
			staleTime: 1000 * 60 * 5, // 5 minutes
		}),

	byId: (id: string) =>
		queryOptions({
			queryKey: [...languageLevelQueries.all(), id] as const,
			queryFn: async () => {
				const result = await fetchLanguageLevelById({ id });
				if (!result?.data) {
					throw new Error("Failed to fetch language level");
				}
				return result.data as LanguageLevel;
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
			const result = await updateLanguageLevel({
				id,
				code: data.code,
				display_name: data.display_name,
				level_group: data.level_group,
				hours: data.hours,
			});
			if (!result?.data) {
				throw new Error(
					result?.serverError || "Failed to update language level",
				);
			}
			return result.data;
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
			const result = await createLanguageLevel({
				code: data.code!,
				display_name: data.display_name!,
				level_group: data.level_group!,
				hours: data.hours || 2,
			});
			if (!result?.data) {
				throw new Error(
					result?.serverError || "Failed to create language level",
				);
			}
			return result.data;
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
			const result = await deleteLanguageLevel({ id });
			if (!result?.data) {
				throw new Error(
					result?.serverError || "Failed to delete language level",
				);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: languageLevelQueries.all() });
		},
	});
};
