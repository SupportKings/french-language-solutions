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

	// Prefetch the enrollment data
	await queryClient.prefetchQuery({
		queryKey: ["enrollments", "detail", id],
		queryFn: () => getEnrollment(id),
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<EnrollmentDetailView enrollmentId={id} />
		</HydrationBoundary>
	);
}