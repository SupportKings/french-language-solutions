import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const supabase = await createClient();

		const { data: cohort, error } = await supabase
			.from("cohorts")
			.select(`
				*,
				products(
					id,
					display_name,
					location,
					format,
					signup_link_for_self_checkout,
					pandadoc_contract_template_id
				)
			`)
			.eq("id", id)
			.single();

		if (error) {
			console.error("Error fetching cohort:", error);
			return NextResponse.json(
				{ error: "Failed to fetch cohort" },
				{ status: 500 }
			);
		}

		if (!cohort) {
			return NextResponse.json(
				{ error: "Cohort not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json(cohort);
	} catch (error) {
		console.error("Error in cohort GET:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const body = await request.json();
		const supabase = await createClient();

		const { data, error } = await supabase
			.from("cohorts")
			.update(body)
			.eq("id", id)
			.select(`
				*,
				products(
					id,
					display_name,
					location,
					format,
					signup_link_for_self_checkout,
					pandadoc_contract_template_id
				)
			`)
			.single();

		if (error) {
			console.error("Error updating cohort:", error);
			return NextResponse.json(
				{ error: "Failed to update cohort" },
				{ status: 500 }
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error in cohort PATCH:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const supabase = await createClient();

		const { error } = await supabase
			.from("cohorts")
			.delete()
			.eq("id", id);

		if (error) {
			console.error("Error deleting cohort:", error);
			return NextResponse.json(
				{ error: "Failed to delete cohort" },
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error in cohort DELETE:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}