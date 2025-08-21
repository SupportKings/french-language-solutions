import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { notFound, redirect } from "next/navigation";
import { getUser } from "@/queries/getUser";
import { ClassForm } from "@/features/classes/components/ClassForm";
import { classesQueries } from "@/features/classes/queries/classes.queries";
import { classesApi } from "@/features/classes/api/classes.api";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

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
						href={`/admin/classes/${id}`}
						className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						<ChevronLeft className="mr-1 h-4 w-4" />
						Back to Class Details
					</Link>
				</div>
				
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Edit Class</h1>
					<p className="text-muted-foreground">
						Update class information and schedule
					</p>
				</div>

				{/* Form */}
				<ClassForm initialData={classData} isEdit />
			</div>
		</HydrationBoundary>
	);
}