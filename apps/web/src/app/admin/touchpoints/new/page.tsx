import { TouchpointFormNew } from "@/features/touchpoints/components/TouchpointFormNew";

export default async function NewTouchpointPage({
	searchParams,
}: {
	searchParams: Promise<{
		studentId?: string;
		studentName?: string;
		redirectTo?: string;
	}>;
}) {
	const params = await searchParams;
	return (
		<TouchpointFormNew
			studentId={params.studentId}
			studentName={params.studentName}
			redirectTo={params.redirectTo}
		/>
	);
}
