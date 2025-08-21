import { SequenceDetails } from "@/features/sequences/components/SequenceDetails";

interface SequenceDetailPageProps {
	params: Promise<{ id: string }>;
}

export default async function SequenceDetailPage({ params }: SequenceDetailPageProps) {
	const { id } = await params;
	return <SequenceDetails sequenceId={id} />;
}