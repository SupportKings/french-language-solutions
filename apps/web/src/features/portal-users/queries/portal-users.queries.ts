import { useQuery } from "@tanstack/react-query";

interface User {
	id: string;
	name: string;
	email: string;
	image: string | null;
	role: string | null;
	emailVerified: boolean;
	createdAt: string;
}

async function fetchPortalUsers(search?: string): Promise<User[]> {
	const params = new URLSearchParams();
	if (search) {
		params.append("search", search);
	}

	const response = await fetch(`/api/users?${params.toString()}`);
	if (!response.ok) {
		throw new Error("Failed to fetch portal users");
	}
	return response.json();
}

export function usePortalUsers(search?: string) {
	return useQuery({
		queryKey: ["portal-users", search],
		queryFn: () => fetchPortalUsers(search),
	});
}
