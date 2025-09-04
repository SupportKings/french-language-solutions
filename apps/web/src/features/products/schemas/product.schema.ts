import { z } from "zod";

export const createProductSchema = z.object({
	display_name: z.string().min(1, "Product name is required"),
	format: z.enum(["group", "private", "hybrid"]),
	location: z.enum(["online", "in_person", "hybrid"]),
	pandadoc_contract_template_id: z.string().optional().nullable(),
	signup_link_for_self_checkout: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export type Product = {
	id: string;
	display_name: string;
	format: "group" | "private" | "hybrid";
	location: "online" | "in_person" | "hybrid";
	pandadoc_contract_template_id: string | null;
	signup_link_for_self_checkout: string | null;
	created_at: string;
	updated_at: string;
};

export type ProductFormData = CreateProductInput;

export const productFormSchema = createProductSchema;