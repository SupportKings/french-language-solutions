"use client";

import { useQuery } from "@tanstack/react-query";
import { getUser } from "./getUser";

//client side hook
export const useUser = () => {
	const { data, isLoading, error } = useQuery({
		queryKey: ["user"],
		queryFn: getUser,
	});
	return { data, isLoading, error };
};
