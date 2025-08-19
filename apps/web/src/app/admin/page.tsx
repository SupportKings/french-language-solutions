import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, Calendar, TrendingUp, DollarSign, Clock, Award, Target } from "lucide-react";

export default function AdminDashboard() {
	return (
		<div className="p-6 space-y-6">
			{/* Page Header */}
			<div>
				<h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
				<p className="text-muted-foreground">
					Welcome to your admin dashboard. Here's an overview of your school.
				</p>
			</div>

			{/* Stats Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Students</CardTitle>
						<GraduationCap className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">245</div>
						<p className="text-xs text-muted-foreground">
							+12% from last month
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Classes</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">18</div>
						<p className="text-xs text-muted-foreground">
							4 starting this week
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Teachers</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">12</div>
						<p className="text-xs text-muted-foreground">
							2 in training
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Revenue</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">$42,500</div>
						<p className="text-xs text-muted-foreground">
							+18% from last month
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Recent Activity & Quick Actions */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
				<Card className="col-span-4">
					<CardHeader>
						<CardTitle>Recent Enrollments</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{[1, 2, 3, 4].map((i) => (
								<div key={i} className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="h-9 w-9 rounded-full bg-accent" />
										<div>
											<p className="text-sm font-medium">Student {i}</p>
											<p className="text-xs text-muted-foreground">
												Enrolled in B1 Group Class
											</p>
										</div>
									</div>
									<p className="text-xs text-muted-foreground">2 hours ago</p>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				<Card className="col-span-3">
					<CardHeader>
						<CardTitle>Pending Tasks</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<Clock className="h-4 w-4 text-yellow-500" />
								<div className="flex-1">
									<p className="text-sm font-medium">5 assessments to review</p>
									<p className="text-xs text-muted-foreground">Due today</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<Target className="h-4 w-4 text-blue-500" />
								<div className="flex-1">
									<p className="text-sm font-medium">3 teacher evaluations</p>
									<p className="text-xs text-muted-foreground">This week</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<Award className="h-4 w-4 text-green-500" />
								<div className="flex-1">
									<p className="text-sm font-medium">2 certificates to issue</p>
									<p className="text-xs text-muted-foreground">Pending</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}