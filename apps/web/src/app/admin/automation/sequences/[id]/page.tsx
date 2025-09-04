import { SequenceDetailPageClient } from "./page-client";

export default async function SequenceDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	return <SequenceDetailPageClient sequenceId={id} />;
}
