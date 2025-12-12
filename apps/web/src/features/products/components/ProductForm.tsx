"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import {
	FormActions,
	FormContent,
	FormField,
	FormHeader,
	FormLayout,
	FormRow,
	FormSection,
	InfoBanner,
	InputField,
	SelectField,
} from "@/components/form-layout/FormLayout";

import { zodResolver } from "@hookform/resolvers/zod";
// Icons are now passed as strings to FormSection
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useCreateProduct, useUpdateProduct } from "../queries/useProducts";
import {
	type Product,
	type ProductFormData,
	productFormSchema,
} from "../schemas/product.schema";

interface ProductFormProps {
	product?: Product;
}

export function ProductForm({ product }: ProductFormProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const createProduct = useCreateProduct();
	const updateProduct = useUpdateProduct();
	const isEditMode = !!product;

	const form = useForm<ProductFormData>({
		resolver: zodResolver(productFormSchema),
		defaultValues: {
			display_name: product?.display_name || "",
			format: product?.format || "group",
			location: product?.location || "online",
			pandadoc_contract_template_id:
				product?.pandadoc_contract_template_id || "",
			signup_link_for_self_checkout:
				product?.signup_link_for_self_checkout || "",
		},
	});

	const onSubmit = async (data: ProductFormData) => {
		setIsSubmitting(true);
		try {
			if (isEditMode) {
				await updateProduct.mutateAsync({ id: product.id, data });
				toast.success("Product updated successfully");
			} else {
				await createProduct.mutateAsync(data);
				toast.success("Product created successfully");
			}
			router.push("/admin/configuration/products");
			router.refresh();
		} catch (error) {
			toast.error(
				isEditMode ? "Failed to update product" : "Failed to create product",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		router.push("/admin/configuration/products");
	};

	const formatOptions = [
		{ label: "Group", value: "group" },
		{ label: "Private", value: "private" },
		{ label: "Hybrid", value: "hybrid" },
	];

	const locationOptions = [
		{ label: "Online", value: "online" },
		{ label: "In-Person", value: "in_person" },
		{ label: "Hybrid", value: "hybrid" },
	];

	return (
		<FormLayout>
			<FormHeader
				backUrl="/admin/configuration/products"
				backLabel="Products"
				title={isEditMode ? "Edit Product" : "New Product"}
				subtitle={
					isEditMode
						? `Update ${product.display_name} details`
						: "Create a new product offering"
				}
				badge={
					isEditMode ? { label: "Editing", variant: "warning" } : undefined
				}
			/>

			<form onSubmit={form.handleSubmit(onSubmit)}>
				<FormContent>
					<div className="space-y-4">
						{!isEditMode && (
							<InfoBanner
								variant="info"
								title="Quick Setup"
								message="Define your product offering. You can always update these details later."
							/>
						)}

						{/* Basic Information */}
						<FormSection
							title="Product Information"
							description="Define the product name and type"
							icon="Package"
							required
						>
							<FormField
								label="Product Name"
								required
								error={form.formState.errors.display_name?.message}
							>
								<InputField
									placeholder="e.g., Beginner French Course"
									error={!!form.formState.errors.display_name}
									{...form.register("display_name")}
								/>
							</FormField>

							<FormRow>
								<FormField
									label="Format"
									required
									hint="Class structure type"
									error={form.formState.errors.format?.message}
								>
									<SelectField
										placeholder="Select format"
										value={form.watch("format")}
										onValueChange={(value) =>
											form.setValue("format", value as any)
										}
										options={formatOptions}
									/>
								</FormField>
								<FormField
									label="Location"
									required
									hint="Where classes are conducted"
									error={form.formState.errors.location?.message}
								>
									<SelectField
										placeholder="Select location"
										value={form.watch("location")}
										onValueChange={(value) =>
											form.setValue("location", value as any)
										}
										options={locationOptions}
									/>
								</FormField>
							</FormRow>
						</FormSection>

						{/* Integration Settings */}
						<FormSection
							title="Integration Settings"
							description="Configure external service integrations"
							icon="Link"
						>
							<FormRow>
								<FormField
									label="PandaDoc Template ID"
									hint="Contract template identifier"
									error={
										form.formState.errors.pandadoc_contract_template_id?.message
									}
								>
									<InputField
										placeholder="e.g., tmpl_abc123xyz"
										error={
											!!form.formState.errors.pandadoc_contract_template_id
										}
										{...form.register("pandadoc_contract_template_id")}
									/>
								</FormField>
								<FormField
									label="Self-Checkout Link"
									hint="URL for customer self-service signup"
									error={
										form.formState.errors.signup_link_for_self_checkout?.message
									}
								>
									<InputField
										type="url"
										placeholder="https://checkout.example.com/product"
										error={
											!!form.formState.errors.signup_link_for_self_checkout
										}
										{...form.register("signup_link_for_self_checkout")}
									/>
								</FormField>
							</FormRow>
						</FormSection>
					</div>
				</FormContent>

				<FormActions
					primaryLabel={isEditMode ? "Update Product" : "Create Product"}
					primaryLoading={isSubmitting}
					primaryDisabled={
						!form.formState.isValid && form.formState.isSubmitted
					}
					primaryType="submit"
					secondaryLabel="Cancel"
					onSecondaryClick={handleCancel}
				/>
			</form>
		</FormLayout>
	);
}
