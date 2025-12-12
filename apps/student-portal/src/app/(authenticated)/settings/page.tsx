import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { getUser } from "@/queries/getUser";

import { ProfilePicture, GoalLevelSelector } from "@/features/profile/components";
import { getLanguageLevels } from "@/features/profile/queries/getLanguageLevels";

import { User, Target } from "lucide-react";

export default async function SettingsPage() {
	const session = await getUser();

	if (!session?.user) {
		redirect("/");
	}

	const supabase = await createClient();
	const { data: student } = await supabase
		.from("students")
		.select(
			"id, full_name, first_name, last_name, email, mobile_phone_number, city, goal_language_level_id",
		)
		.eq("user_id", session.user.id)
		.single();

	const { data: user } = await supabase
		.from("user")
		.select("image")
		.eq("id", session.user.id)
		.single();

	const languageLevels = await getLanguageLevels();

	return (
		<div className="space-y-6">
			{/* Profile Section */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
							<User className="h-5 w-5 text-primary" />
						</div>
						<div>
							<CardTitle>Profile Information</CardTitle>
							<CardDescription>Update your personal details</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Avatar */}
					<ProfilePicture
						src={user?.image}
						alt={student?.full_name || "Student"}
						userName={student?.full_name || "ST"}
						size={80}
						showUploadButton={true}
					/>

					{/* Form Fields */}
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="firstName">First Name</Label>
							<Input
								id="firstName"
								defaultValue={student?.first_name || ""}
								placeholder="Your first name"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="lastName">Last Name</Label>
							<Input
								id="lastName"
								defaultValue={student?.last_name || ""}
								placeholder="Your last name"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								defaultValue={student?.email || ""}
								disabled
								className="bg-muted"
							/>
							<p className="text-muted-foreground text-xs">
								Contact support to change your email
							</p>
						</div>
						<div className="space-y-2">
							<Label htmlFor="phone">Phone Number</Label>
							<Input
								id="phone"
								type="tel"
								defaultValue={student?.mobile_phone_number || ""}
								placeholder="+1 (555) 000-0000"
							/>
						</div>
						<div className="space-y-2 sm:col-span-2">
							<Label htmlFor="city">City</Label>
							<Input
								id="city"
								defaultValue={student?.city || ""}
								placeholder="Your city"
							/>
						</div>
					</div>

					<div className="flex justify-end">
						<Button>Save Changes</Button>
					</div>
				</CardContent>
			</Card>

			{/* Learning Goals Section */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
							<Target className="h-5 w-5 text-primary" />
						</div>
						<div>
							<CardTitle>Learning Goals</CardTitle>
							<CardDescription>
								Set your target French proficiency level
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<GoalLevelSelector
						languageLevels={languageLevels}
						currentGoalLevelId={student?.goal_language_level_id || null}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
