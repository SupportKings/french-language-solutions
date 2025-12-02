import { requireAuth } from "@/lib/rbac-middleware";
import { createClient } from "@/lib/supabase/server";

export interface UserForConversation {
	id: string;
	name: string | null;
	email: string;
	role: string;
}

export async function getAllUsers(): Promise<UserForConversation[]> {
	const session = await requireAuth();
	const supabase = await createClient();

	// Fetch all users except current user
	const { data: users, error } = await supabase
		.from("user")
		.select("id, name, email, role")
		.neq("id", session.user.id)
		.order("name", { ascending: true, nullsFirst: false });

	if (error) {
		console.error("Supabase error fetching users:", error);
		throw new Error(`Failed to fetch users: ${error.message}`);
	}

	return users || [];
}
