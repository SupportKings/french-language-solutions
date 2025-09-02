import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getEnrollment } from "@/features/enrollments/actions/getEnrollment";
import EnrollmentDetailSkeleton from "@/features/enrollments/components/enrollment.detail.skeleton";
import EnrollmentDetailView from "@/features/enrollments/components/enrollment.detail.view";
import { getUser } from "@/queries/getUser";
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

interface EnrollmentDetailPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function EnrollmentDetailPage({ params }: EnrollmentDetailPageProps) {
	return (
		<Suspense fallback={<EnrollmentDetailSkeleton enrollmentId="" />}>
			<EnrollmentDetailPageAsync params={params} />
		</Suspense>
	);
}

async function EnrollmentDetailPageAsync({ params }: EnrollmentDetailPageProps) {
	const { id } = await params;

	// Validate that id is provided
	if (!id) {
		notFound();
	}

	const queryClient = new QueryClient();
	const session = await getUser();

	if (!session) {
		redirect("/");
	}

	// Prefetch the enrollment data with error handling
	await Promise.all([
		queryClient.prefetchQuery({
			queryKey: ["enrollments", "detail", id],
			queryFn: () => getEnrollment(id),
		}),
	]).catch((error) => {
		// Convert not-found responses into 404 error (fail-fast)
		if (error?.message?.includes("not found") || error?.status === 404) {
			notFound();
		}
		// Propagate other errors
		throw error;
	});

	// Verify the QueryClient cache contains the expected data
	const cachedData = queryClient.getQueryData(["enrollments", "detail", id]);
	if (!cachedData) {
		// Throw error to prevent rendering a broken hydration boundary
		throw new Error(`Failed to prefetch enrollment data for id: ${id}`);
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<EnrollmentDetailView enrollmentId={id} />
		</HydrationBoundary>
	);
}