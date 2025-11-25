import { NextResponse } from "next/server";

import type { AnnouncementFilters } from "@/features/announcements/queries/getAnnouncements";
import { getAnnouncements } from "@/features/announcements/queries/getAnnouncements";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);

		// Parse filters from query params
		const filters: AnnouncementFilters = {};

		const scope = searchParams.get("scope");
		if (scope === "school_wide" || scope === "cohort") {
			filters.scope = scope;
		}

		const cohortId = searchParams.get("cohortId");
		if (cohortId) {
			filters.cohortId = cohortId;
		}

		const authorId = searchParams.get("authorId");
		if (authorId) {
			filters.authorId = authorId;
		}

		const isPinned = searchParams.get("isPinned");
		if (isPinned !== null) {
			filters.isPinned = isPinned === "true";
		}

		const announcements = await getAnnouncements(filters);

		return NextResponse.json(announcements);
	} catch (error) {
		console.error("Error fetching announcements:", error);
		return NextResponse.json(
			{ error: "Failed to fetch announcements" },
			{ status: 500 },
		);
	}
}
