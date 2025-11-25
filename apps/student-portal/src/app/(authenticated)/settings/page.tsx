import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Switch } from "@/components/ui/switch";

import { getUser } from "@/queries/getUser";

import { Bell, Settings, Shield, User } from "lucide-react";

export default async function SettingsPage() {
	const session = await getUser();

	if (!session?.user) {
		redirect("/");
	}

	const supabase = await createClient();
	const { data: student } = await supabase
		.from("students")
		.select(
			"id, full_name, first_name, last_name, email, mobile_phone_number, city",
		)
		.eq("user_id", session.user.id)
		.single();

	const { data: user } = await supabase
		.from("user")
		.select("image")
		.eq("id", session.user.id)
		.single();

	const initials = student?.full_name
		? student.full_name
				.split(" ")
				.map((n: string) => n[0])
				.join("")
				.slice(0, 2)
				.toUpperCase()
		: "ST";

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
					<div className="flex items-center gap-4">
						<Avatar className="h-20 w-20">
							<AvatarImage src={user?.image || undefined} />
							<AvatarFallback className="bg-primary/10 text-primary text-xl">
								{initials}
							</AvatarFallback>
						</Avatar>
						<div>
							<Button variant="outline" size="sm">
								Change photo
							</Button>
							<p className="mt-1 text-muted-foreground text-xs">
								JPG, PNG or GIF. Max 2MB.
							</p>
						</div>
					</div>

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

			{/* Notifications Section */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
							<Bell className="h-5 w-5 text-secondary" />
						</div>
						<div>
							<CardTitle>Notifications</CardTitle>
							<CardDescription>
								Manage your notification preferences
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label>Email Notifications</Label>
							<p className="text-muted-foreground text-sm">
								Receive email updates about your classes
							</p>
						</div>
						<Switch defaultChecked />
					</div>
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label>Class Reminders</Label>
							<p className="text-muted-foreground text-sm">
								Get reminders before your classes start
							</p>
						</div>
						<Switch defaultChecked />
					</div>
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label>Announcement Alerts</Label>
							<p className="text-muted-foreground text-sm">
								Be notified when new announcements are posted
							</p>
						</div>
						<Switch defaultChecked />
					</div>
				</CardContent>
			</Card>

			{/* Security Section */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
							<Shield className="h-5 w-5 text-green-600" />
						</div>
						<div>
							<CardTitle>Security</CardTitle>
							<CardDescription>Manage your account security</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label>Passkey Authentication</Label>
							<p className="text-muted-foreground text-sm">
								Use biometric authentication for secure login
							</p>
						</div>
						<Button variant="outline" size="sm">
							Manage Passkeys
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
