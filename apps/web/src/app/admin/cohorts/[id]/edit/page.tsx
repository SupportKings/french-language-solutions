import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { classesApi } from "@/features/classes/api/classes.api";
import { ClassForm } from "@/features/classes/components/ClassForm";
import { classesQueries } from "@/features/classes/queries/classes.queries";

import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";

export default async function EditClassPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const session = await getUser();
	if (!session) {
		redirect("/signin");
	}

	const queryClient = new QueryClient();

	// Prefetch class data
	try {
		await queryClient.prefetchQuery(classesQueries.detail(id));
	} catch (error) {
		notFound();
	}

	// Get the class data to pass to the form
	const classData = await classesApi.getClass(id);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<div className="space-y-6">
				{/* Page Header */}
				<div className="flex items-center gap-4">
					<Link
						href={`/admin/cohorts/${id}`}
						className="inline-flex items-center text-muted-foreground text-sm transition-colors hover:text-foreground"
					>
						<ChevronLeft className="mr-1 h-4 w-4" />
						Back to Cohort Details
					</Link>
				</div>

				<div>
					<h1 className="font-bold text-2xl tracking-tight">Edit Cohort</h1>
					<p className="text-muted-foreground">
						Update cohort information and schedule
					</p>
				</div>

				{/* Form */}
				<ClassForm initialData={classData} isEdit />
			</div>
		</HydrationBoundary>
	);
}
