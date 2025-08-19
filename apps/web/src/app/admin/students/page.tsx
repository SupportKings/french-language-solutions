"use client";

import { useState } from "react";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
import { 
	Search, 
	Filter, 
	Plus, 
	MoreHorizontal,
	Mail,
	Phone,
	Calendar,
	Download,
	ChevronLeft,
	ChevronRight
} from "lucide-react";

// Temporary mock data - will be replaced with real data
const mockStudents = [
	{
		id: "1",
		fullName: "Marie Dubois",
		email: "marie.dubois@email.com",
		phone: "+33 6 12 34 56 78",
		level: "B1",
		status: "active",
		enrolledClasses: ["B1 Evening Group", "Conversation Club"],
		lastContact: "2024-01-15",
		city: "Paris",
	},
	{
		id: "2",
		fullName: "Jean Martin",
		email: "jean.martin@email.com",
		phone: "+33 6 98 76 54 32",
		level: "A2",
		status: "active",
		enrolledClasses: ["A2 Morning Intensive"],
		lastContact: "2024-01-14",
		city: "Lyon",
	},
	{
		id: "3",
		fullName: "Sophie Laurent",
		email: "sophie.laurent@email.com",
		phone: "+33 6 11 22 33 44",
		level: "B2",
		status: "paused",
		enrolledClasses: [],
		lastContact: "2024-01-10",
		city: "Marseille",
	},
	{
		id: "4",
		fullName: "Pierre Moreau",
		email: "pierre.moreau@email.com",
		phone: "+33 6 55 44 33 22",
		level: "A1",
		status: "inquiry",
		enrolledClasses: [],
		lastContact: "2024-01-16",
		city: "Toulouse",
	},
	{
		id: "5",
		fullName: "Claire Bernard",
		email: "claire.bernard@email.com",
		phone: "+33 6 77 88 99 00",
		level: "C1",
		status: "active",
		enrolledClasses: ["C1 Business French", "DALF Preparation"],
		lastContact: "2024-01-16",
		city: "Nice",
	},
];

const statusColors = {
	active: "bg-green-500/10 text-green-700 border-green-200",
	paused: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
	inquiry: "bg-blue-500/10 text-blue-700 border-blue-200",
	dropped: "bg-red-500/10 text-red-700 border-red-200",
};

export default function AllStudentsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [levelFilter, setLevelFilter] = useState("all");
	const [selectedStudent, setSelectedStudent] = useState<typeof mockStudents[0] | null>(null);
	const [sheetOpen, setSheetOpen] = useState(false);

	const openStudentDetails = (student: typeof mockStudents[0]) => {
		setSelectedStudent(student);
		setSheetOpen(true);
	};

	return (
		<div className="p-6 space-y-6">
			{/* Page Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-3xl font-bold tracking-tight">All Students</h2>
					<p className="text-muted-foreground">
						Manage and track all your students in one place
					</p>
				</div>
				<Button className="gap-2">
					<Plus className="h-4 w-4" />
					Add Student
				</Button>
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
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Filter by status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Status</SelectItem>
						<SelectItem value="active">Active</SelectItem>
						<SelectItem value="paused">Paused</SelectItem>
						<SelectItem value="inquiry">Inquiry</SelectItem>
						<SelectItem value="dropped">Dropped</SelectItem>
					</SelectContent>
				</Select>
				<Select value={levelFilter} onValueChange={setLevelFilter}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Filter by level" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Levels</SelectItem>
						<SelectItem value="a1">A1</SelectItem>
						<SelectItem value="a2">A2</SelectItem>
						<SelectItem value="b1">B1</SelectItem>
						<SelectItem value="b2">B2</SelectItem>
						<SelectItem value="c1">C1</SelectItem>
						<SelectItem value="c2">C2</SelectItem>
					</SelectContent>
				</Select>
				<Button variant="outline" className="gap-2">
					<Download className="h-4 w-4" />
					Export
				</Button>
			</div>

			{/* Students Table */}
			<div className="rounded-lg border bg-card">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Student</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Level</TableHead>
							<TableHead>Enrolled Classes</TableHead>
							<TableHead>Contact</TableHead>
							<TableHead>Last Activity</TableHead>
							<TableHead className="w-[50px]"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{mockStudents.map((student) => (
							<TableRow 
								key={student.id}
								className="cursor-pointer hover:bg-muted/50"
								onClick={() => openStudentDetails(student)}
							>
								<TableCell>
									<div className="flex items-center gap-3">
										<Avatar className="h-9 w-9">
											<AvatarFallback>
												{student.fullName
													.split(" ")
													.map((n) => n[0])
													.join("")}
											</AvatarFallback>
										</Avatar>
										<div>
											<p className="font-medium">{student.fullName}</p>
											<p className="text-sm text-muted-foreground">
												{student.city}
											</p>
										</div>
									</div>
								</TableCell>
								<TableCell>
									<Badge
										variant="outline"
										className={statusColors[student.status as keyof typeof statusColors]}
									>
										{student.status}
									</Badge>
								</TableCell>
								<TableCell>
									<Badge variant="secondary">{student.level}</Badge>
								</TableCell>
								<TableCell>
									<div className="flex flex-col gap-1">
										{student.enrolledClasses.length > 0 ? (
											student.enrolledClasses.map((cls, i) => (
												<span key={i} className="text-sm">
													{cls}
												</span>
											))
										) : (
											<span className="text-sm text-muted-foreground">
												No active enrollment
											</span>
										)}
									</div>
								</TableCell>
								<TableCell>
									<div className="flex flex-col gap-1">
										<div className="flex items-center gap-1 text-sm">
											<Mail className="h-3 w-3" />
											<span className="truncate max-w-[150px]">
												{student.email}
											</span>
										</div>
										<div className="flex items-center gap-1 text-sm">
											<Phone className="h-3 w-3" />
											<span>{student.phone}</span>
										</div>
									</div>
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-1 text-sm text-muted-foreground">
										<Calendar className="h-3 w-3" />
										<span>{student.lastContact}</span>
									</div>
								</TableCell>
								<TableCell>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button 
												variant="ghost" 
												size="icon"
												onClick={(e) => e.stopPropagation()}
											>
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuLabel>Actions</DropdownMenuLabel>
											<DropdownMenuSeparator />
											<DropdownMenuItem onClick={() => openStudentDetails(student)}>
												View Details
											</DropdownMenuItem>
											<DropdownMenuItem>Edit Student</DropdownMenuItem>
											<DropdownMenuItem>Send Message</DropdownMenuItem>
											<DropdownMenuItem>View Enrollments</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem className="text-red-600">
												Archive Student
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					Showing 1 to 5 of 245 students
				</p>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" disabled>
						<ChevronLeft className="h-4 w-4" />
						Previous
					</Button>
					<Button variant="outline" size="sm">
						Next
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Student Details Sheet */}
			<Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
				<SheetContent className="w-[600px] sm:max-w-[600px]">
					{selectedStudent && (
						<>
							<SheetHeader>
								<SheetTitle className="flex items-center gap-3">
									<Avatar className="h-12 w-12">
										<AvatarFallback>
											{selectedStudent.fullName
												.split(" ")
												.map((n) => n[0])
												.join("")}
										</AvatarFallback>
									</Avatar>
									<div>
										<p className="text-xl">{selectedStudent.fullName}</p>
										<p className="text-sm text-muted-foreground">
											{selectedStudent.city} • {selectedStudent.level}
										</p>
									</div>
								</SheetTitle>
								<SheetDescription>
									Student ID: {selectedStudent.id}
								</SheetDescription>
							</SheetHeader>

							<div className="mt-6">
								{/* Quick Actions */}
								<div className="flex gap-2 mb-6">
									<Button size="sm" className="gap-2">
										<Mail className="h-4 w-4" />
										Send Message
									</Button>
									<Button size="sm" variant="outline" className="gap-2">
										<Phone className="h-4 w-4" />
										Schedule Call
									</Button>
									<Button size="sm" variant="outline" className="gap-2">
										<Plus className="h-4 w-4" />
										Add Note
									</Button>
								</div>

								<Tabs defaultValue="profile" className="w-full">
									<TabsList className="grid w-full grid-cols-4">
										<TabsTrigger value="profile">Profile</TabsTrigger>
										<TabsTrigger value="enrollments">Enrollments</TabsTrigger>
										<TabsTrigger value="communications">Communications</TabsTrigger>
										<TabsTrigger value="documents">Documents</TabsTrigger>
									</TabsList>
									
									<ScrollArea className="h-[calc(100vh-300px)] mt-4">
										<TabsContent value="profile" className="space-y-4">
											<div className="space-y-4">
												<div className="grid grid-cols-2 gap-4">
													<div>
														<p className="text-sm font-medium text-muted-foreground">Email</p>
														<p className="text-sm">{selectedStudent.email}</p>
													</div>
													<div>
														<p className="text-sm font-medium text-muted-foreground">Phone</p>
														<p className="text-sm">{selectedStudent.phone}</p>
													</div>
													<div>
														<p className="text-sm font-medium text-muted-foreground">Status</p>
														<Badge
															variant="outline"
															className={statusColors[selectedStudent.status as keyof typeof statusColors]}
														>
															{selectedStudent.status}
														</Badge>
													</div>
													<div>
														<p className="text-sm font-medium text-muted-foreground">Level</p>
														<Badge variant="secondary">{selectedStudent.level}</Badge>
													</div>
													<div>
														<p className="text-sm font-medium text-muted-foreground">City</p>
														<p className="text-sm">{selectedStudent.city}</p>
													</div>
													<div>
														<p className="text-sm font-medium text-muted-foreground">Last Contact</p>
														<p className="text-sm">{selectedStudent.lastContact}</p>
													</div>
												</div>
												
												<Separator />
												
												<div>
													<p className="text-sm font-medium text-muted-foreground mb-2">
														Enrolled Classes
													</p>
													{selectedStudent.enrolledClasses.length > 0 ? (
														<div className="space-y-2">
															{selectedStudent.enrolledClasses.map((cls, i) => (
																<div
																	key={i}
																	className="p-3 rounded-lg border bg-muted/20"
																>
																	<p className="text-sm font-medium">{cls}</p>
																	<p className="text-xs text-muted-foreground">
																		Active since Jan 2024
																	</p>
																</div>
															))}
														</div>
													) : (
														<p className="text-sm text-muted-foreground">
															No active enrollments
														</p>
													)}
												</div>
											</div>
										</TabsContent>
										
										<TabsContent value="enrollments" className="space-y-4">
											<div className="space-y-4">
												<div className="p-4 rounded-lg border">
													<h4 className="font-medium mb-2">Current Enrollments</h4>
													{selectedStudent.enrolledClasses.length > 0 ? (
														selectedStudent.enrolledClasses.map((cls, i) => (
															<div key={i} className="py-2">
																<p className="text-sm">{cls}</p>
																<p className="text-xs text-muted-foreground">
																	Started: January 1, 2024
																</p>
															</div>
														))
													) : (
														<p className="text-sm text-muted-foreground">
															No current enrollments
														</p>
													)}
												</div>
												
												<div className="p-4 rounded-lg border">
													<h4 className="font-medium mb-2">Past Enrollments</h4>
													<p className="text-sm text-muted-foreground">
														No past enrollments
													</p>
												</div>
											</div>
										</TabsContent>
										
										<TabsContent value="communications" className="space-y-4">
											<div className="space-y-4">
												<div className="p-4 rounded-lg border">
													<div className="flex items-center justify-between mb-2">
														<h4 className="font-medium">Recent Communications</h4>
														<Button size="sm" variant="outline">
															View All
														</Button>
													</div>
													<div className="space-y-3">
														<div className="flex items-start gap-3">
															<Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
															<div className="flex-1">
																<p className="text-sm">Welcome email sent</p>
																<p className="text-xs text-muted-foreground">
																	2 days ago
																</p>
															</div>
														</div>
														<div className="flex items-start gap-3">
															<Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
															<div className="flex-1">
																<p className="text-sm">Initial consultation call</p>
																<p className="text-xs text-muted-foreground">
																	5 days ago
																</p>
															</div>
														</div>
													</div>
												</div>
												
												<div className="p-4 rounded-lg border">
													<h4 className="font-medium mb-2">Notes</h4>
													<p className="text-sm text-muted-foreground">
														No notes added yet
													</p>
												</div>
											</div>
										</TabsContent>
										
										<TabsContent value="documents" className="space-y-4">
											<div className="p-4 rounded-lg border">
												<h4 className="font-medium mb-2">Documents</h4>
												<p className="text-sm text-muted-foreground">
													No documents uploaded yet
												</p>
											</div>
										</TabsContent>
									</ScrollArea>
								</Tabs>
							</div>
						</>
					)}
				</SheetContent>
			</Sheet>
		</div>
	);
}