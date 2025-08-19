"use client";

import { useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
	Search, 
	Plus, 
	MoreHorizontal,
	Mail,
	Phone,
	Calendar,
	Clock,
	Users,
	Award,
	TrendingUp,
	AlertCircle
} from "lucide-react";

// Temporary mock data - will be replaced with real data
const mockTeachers = [
	{
		id: "1",
		firstName: "Amélie",
		lastName: "Rousseau",
		email: "amelie.rousseau@fls.com",
		phone: "+33 6 12 34 56 78",
		onboardingStatus: "onboarded",
		contractType: "full_time",
		availableForBooking: true,
		qualifiedForUnder16: true,
		availableForOnline: true,
		availableForInPerson: true,
		maxHoursPerWeek: 35,
		currentHoursPerWeek: 28,
		activeClasses: 4,
		totalStudents: 32,
		rating: 4.8,
	},
	{
		id: "2",
		firstName: "François",
		lastName: "Lefevre",
		email: "francois.lefevre@fls.com",
		phone: "+33 6 98 76 54 32",
		onboardingStatus: "onboarded",
		contractType: "freelancer",
		availableForBooking: true,
		qualifiedForUnder16: false,
		availableForOnline: true,
		availableForInPerson: false,
		maxHoursPerWeek: 20,
		currentHoursPerWeek: 18,
		activeClasses: 3,
		totalStudents: 24,
		rating: 4.6,
	},
	{
		id: "3",
		firstName: "Charlotte",
		lastName: "Moreau",
		email: "charlotte.moreau@fls.com",
		phone: "+33 6 11 22 33 44",
		onboardingStatus: "training_in_progress",
		contractType: "full_time",
		availableForBooking: false,
		qualifiedForUnder16: true,
		availableForOnline: true,
		availableForInPerson: true,
		maxHoursPerWeek: 35,
		currentHoursPerWeek: 0,
		activeClasses: 0,
		totalStudents: 0,
		rating: null,
	},
	{
		id: "4",
		firstName: "Nicolas",
		lastName: "Dupont",
		email: "nicolas.dupont@fls.com",
		phone: "+33 6 55 44 33 22",
		onboardingStatus: "onboarded",
		contractType: "full_time",
		availableForBooking: true,
		qualifiedForUnder16: true,
		availableForOnline: true,
		availableForInPerson: true,
		maxHoursPerWeek: 35,
		currentHoursPerWeek: 35,
		activeClasses: 5,
		totalStudents: 45,
		rating: 4.9,
	},
	{
		id: "5",
		firstName: "Marie",
		lastName: "Lambert",
		email: "marie.lambert@fls.com",
		phone: "+33 6 77 88 99 00",
		onboardingStatus: "offboarded",
		contractType: "freelancer",
		availableForBooking: false,
		qualifiedForUnder16: false,
		availableForOnline: true,
		availableForInPerson: false,
		maxHoursPerWeek: 15,
		currentHoursPerWeek: 0,
		activeClasses: 0,
		totalStudents: 0,
		rating: 4.3,
	},
];

const onboardingStatusColors = {
	new: "bg-gray-500/10 text-gray-700 border-gray-200",
	training_in_progress: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
	onboarded: "bg-green-500/10 text-green-700 border-green-200",
	offboarded: "bg-red-500/10 text-red-700 border-red-200",
};

const contractTypeColors = {
	full_time: "bg-blue-500/10 text-blue-700 border-blue-200",
	freelancer: "bg-purple-500/10 text-purple-700 border-purple-200",
};

export default function TeachersPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [contractFilter, setContractFilter] = useState("all");

	return (
		<div className="p-6 space-y-6">
			{/* Page Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-3xl font-bold tracking-tight">Teachers</h2>
					<p className="text-muted-foreground">
						Manage your teaching staff and track their performance
					</p>
				</div>
				<Button className="gap-2">
					<Plus className="h-4 w-4" />
					Add Teacher
				</Button>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<div className="rounded-lg border bg-card p-4">
					<div className="flex items-center gap-2">
						<Users className="h-4 w-4 text-muted-foreground" />
						<span className="text-sm font-medium">Total Teachers</span>
					</div>
					<p className="mt-2 text-2xl font-bold">12</p>
					<p className="text-xs text-muted-foreground">10 active, 2 in training</p>
				</div>
				<div className="rounded-lg border bg-card p-4">
					<div className="flex items-center gap-2">
						<Clock className="h-4 w-4 text-muted-foreground" />
						<span className="text-sm font-medium">Total Hours/Week</span>
					</div>
					<p className="mt-2 text-2xl font-bold">264</p>
					<p className="text-xs text-muted-foreground">85% capacity</p>
				</div>
				<div className="rounded-lg border bg-card p-4">
					<div className="flex items-center gap-2">
						<Award className="h-4 w-4 text-muted-foreground" />
						<span className="text-sm font-medium">Avg Rating</span>
					</div>
					<p className="mt-2 text-2xl font-bold">4.7</p>
					<p className="text-xs text-muted-foreground">Based on student feedback</p>
				</div>
				<div className="rounded-lg border bg-card p-4">
					<div className="flex items-center gap-2">
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
						<span className="text-sm font-medium">Availability</span>
					</div>
					<p className="mt-2 text-2xl font-bold">8/12</p>
					<p className="text-xs text-muted-foreground">Available for booking</p>
				</div>
			</div>

			{/* Filters Bar */}
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search by name, email, or phone..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>
				<Select value={statusFilter} onValueChange={setStatusFilter}>
					<SelectTrigger className="w-[200px]">
						<SelectValue placeholder="Filter by status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Status</SelectItem>
						<SelectItem value="new">New</SelectItem>
						<SelectItem value="training_in_progress">In Training</SelectItem>
						<SelectItem value="onboarded">Onboarded</SelectItem>
						<SelectItem value="offboarded">Offboarded</SelectItem>
					</SelectContent>
				</Select>
				<Select value={contractFilter} onValueChange={setContractFilter}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Contract type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Types</SelectItem>
						<SelectItem value="full_time">Full Time</SelectItem>
						<SelectItem value="freelancer">Freelancer</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Teachers Table */}
			<div className="rounded-lg border bg-card">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Teacher</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Contract</TableHead>
							<TableHead>Availability</TableHead>
							<TableHead>Workload</TableHead>
							<TableHead>Performance</TableHead>
							<TableHead className="w-[50px]"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{mockTeachers.map((teacher) => (
							<TableRow key={teacher.id}>
								<TableCell>
									<div className="flex items-center gap-3">
										<Avatar className="h-9 w-9">
											<AvatarFallback>
												{teacher.firstName[0]}{teacher.lastName[0]}
											</AvatarFallback>
										</Avatar>
										<div>
											<p className="font-medium">
												{teacher.firstName} {teacher.lastName}
											</p>
											<div className="flex items-center gap-2 text-sm text-muted-foreground">
												<Mail className="h-3 w-3" />
												<span>{teacher.email}</span>
											</div>
										</div>
									</div>
								</TableCell>
								<TableCell>
									<Badge
										variant="outline"
										className={onboardingStatusColors[teacher.onboardingStatus as keyof typeof onboardingStatusColors]}
									>
										{teacher.onboardingStatus.replace(/_/g, " ")}
									</Badge>
								</TableCell>
								<TableCell>
									<Badge
										variant="outline"
										className={contractTypeColors[teacher.contractType as keyof typeof contractTypeColors]}
									>
										{teacher.contractType.replace(/_/g, " ")}
									</Badge>
								</TableCell>
								<TableCell>
									<div className="space-y-1">
										<div className="flex items-center gap-2">
											{teacher.availableForBooking ? (
												<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
													Available
												</Badge>
											) : (
												<Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
													Unavailable
												</Badge>
											)}
										</div>
										<div className="flex gap-1">
											{teacher.availableForOnline && (
												<Badge variant="secondary" className="text-xs">Online</Badge>
											)}
											{teacher.availableForInPerson && (
												<Badge variant="secondary" className="text-xs">In-Person</Badge>
											)}
											{teacher.qualifiedForUnder16 && (
												<Badge variant="secondary" className="text-xs">U16</Badge>
											)}
										</div>
									</div>
								</TableCell>
								<TableCell>
									<div className="space-y-2">
										<div className="flex items-center justify-between text-sm">
											<span>{teacher.currentHoursPerWeek}h / {teacher.maxHoursPerWeek}h</span>
											{teacher.currentHoursPerWeek === teacher.maxHoursPerWeek && (
												<AlertCircle className="h-3 w-3 text-yellow-500" />
											)}
										</div>
										<Progress 
											value={(teacher.currentHoursPerWeek / teacher.maxHoursPerWeek) * 100} 
											className="h-2"
										/>
										<div className="flex gap-4 text-xs text-muted-foreground">
											<span>{teacher.activeClasses} classes</span>
											<span>{teacher.totalStudents} students</span>
										</div>
									</div>
								</TableCell>
								<TableCell>
									{teacher.rating ? (
										<div className="flex items-center gap-2">
											<Award className="h-4 w-4 text-yellow-500" />
											<span className="font-medium">{teacher.rating}</span>
										</div>
									) : (
										<span className="text-sm text-muted-foreground">N/A</span>
									)}
								</TableCell>
								<TableCell>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon">
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuLabel>Actions</DropdownMenuLabel>
											<DropdownMenuSeparator />
											<DropdownMenuItem>View Profile</DropdownMenuItem>
											<DropdownMenuItem>Edit Details</DropdownMenuItem>
											<DropdownMenuItem>View Schedule</DropdownMenuItem>
											<DropdownMenuItem>Performance Report</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem>Manage Availability</DropdownMenuItem>
											<DropdownMenuItem className="text-red-600">
												Offboard Teacher
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}