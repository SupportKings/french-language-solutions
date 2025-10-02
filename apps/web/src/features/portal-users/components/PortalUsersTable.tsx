"use client";

import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { useDebounce } from "@uidotdev/usehooks";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { usePortalUsers } from "../queries/portal-users.queries";

export function PortalUsersTable() {
	const [searchInput, setSearchInput] = useState("");
	const debouncedSearch = useDebounce(searchInput, 300);

	const { data: users, isLoading, error } = usePortalUsers(debouncedSearch);

	if (error) {
		return (
			<Card>
				<CardContent className="py-10">
					<p className="text-center text-muted-foreground">
						Failed to load portal users
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Table with integrated search */}
			<div className="rounded-md border">
				{/* Header with search */}
				<div className="space-y-2 border-b bg-muted/30 px-4 py-2">
					<div className="flex items-center gap-3">
						<div className="relative max-w-sm flex-1">
							<Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search by name or email..."
								value={searchInput}
								onChange={(e) => setSearchInput(e.target.value)}
								className="h-9 bg-muted/50 pl-9"
							/>
						</div>
					</div>
				</div>

				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>User</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Role</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Created</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							Array.from({ length: 5 }).map((_, i) => (
								<TableRow key={i} className="h-12">
									<TableCell>
										<Skeleton className="h-5 w-32" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-40" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-20" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-20" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-24" />
									</TableCell>
								</TableRow>
							))
						) : !users || users.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className="text-center text-muted-foreground"
								>
									No portal users found
								</TableCell>
							</TableRow>
						) : (
							users.map((user: any) => (
								<TableRow key={user.id} className="h-12">
									<TableCell>
										<div className="flex items-center gap-3">
											<Avatar className="size-7">
												<AvatarImage
													src={user.image || undefined}
													alt={user.name}
												/>
												<AvatarFallback className="text-xs">
													{user.name
														.split(" ")
														.map((n: string) => n[0])
														.join("")
														.toUpperCase()}
												</AvatarFallback>
											</Avatar>
											<span className="font-medium text-sm">{user.name}</span>
										</div>
									</TableCell>
									<TableCell>
										<span className="text-muted-foreground text-sm">
											{user.email}
										</span>
									</TableCell>
									<TableCell>
										{user.role ? (
											<Badge variant="outline" className="text-xs">
												{user.role}
											</Badge>
										) : (
											<span className="text-muted-foreground text-sm">
												User
											</span>
										)}
									</TableCell>
									<TableCell>
										{user.emailVerified ? (
											<Badge variant="success" className="text-xs">
												Verified
											</Badge>
										) : (
											<Badge variant="secondary" className="text-xs">
												Unverified
											</Badge>
										)}
									</TableCell>
									<TableCell>
										<span className="text-muted-foreground text-sm">
											{format(new Date(user.createdAt), "MMM d, yyyy")}
										</span>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
