import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const search = searchParams.get("search");

		const supabase = await createClient();

		let query = supabase
			.from("user")
			.select("id, name, email, image, role, emailVerified, createdAt");

		// Add search filter if provided
		if (search) {
			query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
		}

		const { data: users, error } = await query.order("name", { ascending: true });

		if (error) {
			console.error("Error fetching users:", error);
			return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
		}

		return NextResponse.json(users || []);
	} catch (error) {
		console.error("Error in users API:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
