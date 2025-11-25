import { NextResponse } from "next/server";

import { getReadStatsList } from "@/features/announcements/queries/getReadStatsList";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const stats = await getReadStatsList(id);

		return NextResponse.json(stats);
	} catch (error) {
		console.error("Error fetching read stats:", error);
		return NextResponse.json(
			{ error: "Failed to fetch read stats" },
			{ status: 500 },
		);
	}
}
