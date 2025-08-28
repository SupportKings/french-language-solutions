import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import {
	Calendar,
	CheckCircle2,
	FileCheck,
	GraduationCap,
	TrendingUp,
	Users,
} from "lucide-react";

// Mock data - in real app this would come from API
const mockStats = {
	totalStudents: 247,
	activeEnrollments: 189,
	completedAssessments: 156,
	avgProgressRate: 78,
	enrollmentsByStatus: [
		{ status: "Paid", count: 89, color: "bg-green-500" },
		{ status: "Contract Signed", count: 45, color: "bg-blue-500" },
		{ status: "Interested", count: 32, color: "bg-yellow-500" },
		{ status: "Form Filled", count: 23, color: "bg-orange-500" },
	],
	levelDistribution: [
		{ level: "A1", count: 67, percentage: 27 },
		{ level: "A2", count: 54, percentage: 22 },
		{ level: "B1", count: 48, percentage: 19 },
		{ level: "B2", count: 38, percentage: 15 },
		{ level: "C1", count: 28, percentage: 11 },
		{ level: "C2", count: 12, percentage: 5 },
	],
	recentActivity: [
		{
			student: "Marie Dubois",
			action: "Completed A1 assessment",
			time: "2 hours ago",
		},
		{
			student: "Jean Martin",
			action: "Enrolled in Group B2 cohort",
			time: "4 hours ago",
		},
		{
			student: "Sophie Laurent",
			action: "Assessment scheduled",
			time: "6 hours ago",
		},
		{
			student: "Pierre Durand",
			action: "Payment completed",
			time: "8 hours ago",
		},
		{ student: "Anne Moreau", action: "Contract signed", time: "1 day ago" },
	],
};

export default function ProgressTrackingPage() {
	return (
		<div className="p-6">
			<div className="mb-6">
				<h1 className="font-bold text-2xl">Progress Tracking</h1>
				<p className="text-muted-foreground">
					Monitor student progress and engagement metrics
				</p>
			</div>

			<div className="grid gap-6">
				{/* Overview Cards */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center">
								<div className="rounded-full bg-blue-100 p-2">
									<Users className="h-6 w-6 text-blue-600" />
								</div>
								<div className="ml-4">
									<p className="font-medium text-muted-foreground text-sm">
										Total Students
									</p>
									<p className="font-bold text-2xl">
										{mockStats.totalStudents}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center">
								<div className="rounded-full bg-green-100 p-2">
									<GraduationCap className="h-6 w-6 text-green-600" />
								</div>
								<div className="ml-4">
									<p className="font-medium text-muted-foreground text-sm">
										Active Enrollments
									</p>
									<p className="font-bold text-2xl">
										{mockStats.activeEnrollments}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center">
								<div className="rounded-full bg-purple-100 p-2">
									<FileCheck className="h-6 w-6 text-purple-600" />
								</div>
								<div className="ml-4">
									<p className="font-medium text-muted-foreground text-sm">
										Completed Assessments
									</p>
									<p className="font-bold text-2xl">
										{mockStats.completedAssessments}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center">
								<div className="rounded-full bg-orange-100 p-2">
									<TrendingUp className="h-6 w-6 text-orange-600" />
								</div>
								<div className="ml-4">
									<p className="font-medium text-muted-foreground text-sm">
										Avg Progress Rate
									</p>
									<p className="font-bold text-2xl">
										{mockStats.avgProgressRate}%
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="grid gap-6 md:grid-cols-2">
					{/* Enrollment Status Distribution */}
					<Card>
						<CardHeader>
							<CardTitle>Enrollment Status</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{mockStats.enrollmentsByStatus.map((item, index) => (
									<div
										key={index}
										className="flex items-center justify-between"
									>
										<div className="flex items-center gap-3">
											<div className={`h-3 w-3 rounded-full ${item.color}`} />
											<span className="font-medium text-sm">{item.status}</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="text-muted-foreground text-sm">
												{item.count}
											</span>
											<Badge variant="secondary">
												{Math.round(
													(item.count / mockStats.activeEnrollments) * 100,
												)}
												%
											</Badge>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Language Level Distribution */}
					<Card>
						<CardHeader>
							<CardTitle>Language Level Distribution</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{mockStats.levelDistribution.map((item, index) => (
									<div key={index} className="space-y-2">
										<div className="flex items-center justify-between">
											<span className="font-medium text-sm">{item.level}</span>
											<span className="text-muted-foreground text-sm">
												{item.count} students ({item.percentage}%)
											</span>
										</div>
										<Progress value={item.percentage} className="h-2" />
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Recent Activity */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Calendar className="h-5 w-5" />
							Recent Activity
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{mockStats.recentActivity.map((activity, index) => (
								<div
									key={index}
									className="flex items-center gap-4 rounded-lg border p-3"
								>
									<div className="rounded-full bg-green-100 p-1">
										<CheckCircle2 className="h-4 w-4 text-green-600" />
									</div>
									<div className="flex-1">
										<p className="font-medium text-sm">{activity.student}</p>
										<p className="text-muted-foreground text-sm">
											{activity.action}
										</p>
									</div>
									<p className="text-muted-foreground text-xs">
										{activity.time}
									</p>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Quick Actions */}
				<Card>
					<CardHeader>
						<CardTitle>Quick Insights</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4 md:grid-cols-3">
							<div className="rounded-lg bg-blue-50 p-4">
								<h4 className="font-semibold text-blue-900">
									Most Popular Level
								</h4>
								<p className="font-bold text-2xl text-blue-600">A1</p>
								<p className="text-blue-600 text-sm">67 students enrolled</p>
							</div>
							<div className="rounded-lg bg-green-50 p-4">
								<h4 className="font-semibold text-green-900">
									Completion Rate
								</h4>
								<p className="font-bold text-2xl text-green-600">89%</p>
								<p className="text-green-600 text-sm">Assessment completion</p>
							</div>
							<div className="rounded-lg bg-orange-50 p-4">
								<h4 className="font-semibold text-orange-900">
									Monthly Growth
								</h4>
								<p className="font-bold text-2xl text-orange-600">+12%</p>
								<p className="text-orange-600 text-sm">
									New student enrollments
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
