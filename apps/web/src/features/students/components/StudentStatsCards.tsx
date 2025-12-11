"use client";

import { Card, CardContent } from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

import { useQuery } from "@tanstack/react-query";
import { BookOpenCheck, Calendar } from "lucide-react";
import * as RechartsPrimitive from "recharts";

interface StudentStatsCardsProps {
	studentId: string;
}

interface AttendanceRecord {
	id: string;
	status: string;
	homeworkCompleted: boolean;
	classStartTime: string | null;
}

interface AttendanceResponse {
	records: AttendanceRecord[];
	stats: {
		totalClasses: number;
		present: { count: number; percentage: number };
		absent: { count: number; percentage: number };
		unset: { count: number; percentage: number };
	};
}

interface StatCardData {
	name: string;
	percentage: number;
	count: number;
	total: number;
	fill: string;
}

// Export query keys so they can be used for cache invalidation
export const studentStatsKeys = {
	attendance: (studentId: string) => ["student-attendance", studentId] as const,
};

const chartConfig = {
	percentage: {
		label: "Percentage",
		color: "hsl(var(--primary))",
	},
} satisfies ChartConfig;

function getColorByPercentage(percentage: number): string {
	if (percentage >= 80) return "hsl(142, 76%, 36%)"; // Green
	if (percentage >= 60) return "hsl(48, 96%, 53%)"; // Yellow
	return "hsl(0, 84%, 60%)"; // Red
}

function StatCard({
	data,
	icon: Icon,
	label,
}: { data: StatCardData; icon: typeof Calendar; label: string }) {
	return (
		<Card className="border-border/50 bg-card/95 p-4 backdrop-blur-sm">
			<CardContent className="flex items-center space-x-4 p-0">
				<div className="relative flex items-center justify-center">
					<ChartContainer config={chartConfig} className="h-[80px] w-[80px]">
						<RechartsPrimitive.RadialBarChart
							data={[data]}
							innerRadius={30}
							outerRadius={40}
							barSize={6}
							startAngle={90}
							endAngle={-270}
						>
							<RechartsPrimitive.PolarAngleAxis
								type="number"
								domain={[0, 100]}
								angleAxisId={0}
								tick={false}
								axisLine={false}
							/>
							<RechartsPrimitive.RadialBar
								dataKey="percentage"
								background
								cornerRadius={10}
								fill={data.fill}
								angleAxisId={0}
							/>
						</RechartsPrimitive.RadialBarChart>
					</ChartContainer>
					<div className="absolute inset-0 flex items-center justify-center">
						<span className="font-medium text-base text-foreground">
							{data.percentage}%
						</span>
					</div>
				</div>
				<div>
					<div className="flex items-center gap-2">
						<Icon className="h-4 w-4 text-muted-foreground" />
						<dt className="font-medium text-foreground text-sm">{label}</dt>
					</div>
					<dd className="mt-1 text-muted-foreground text-sm">
						{data.count} of {data.total}{" "}
						{label === "Attendance" ? "classes" : "completed"}
					</dd>
				</div>
			</CardContent>
		</Card>
	);
}

async function fetchStudentAttendance(
	studentId: string,
): Promise<AttendanceResponse> {
	const response = await fetch(`/api/students/${studentId}/attendance`);
	if (!response.ok) throw new Error("Failed to fetch attendance");
	return response.json();
}

export function StudentStatsCards({ studentId }: StudentStatsCardsProps) {
	const { data, isLoading } = useQuery({
		queryKey: studentStatsKeys.attendance(studentId),
		queryFn: () => fetchStudentAttendance(studentId),
	});

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<Skeleton className="h-24 rounded-xl" />
				<Skeleton className="h-24 rounded-xl" />
			</div>
		);
	}

	if (!data || data.records.length === 0) {
		return null;
	}

	// Filter out future classes - only count past classes
	const now = new Date();
	const pastRecords = data.records.filter((r) => {
		if (!r.classStartTime) return true; // Include records without a class time
		return new Date(r.classStartTime) <= now;
	});

	if (pastRecords.length === 0) {
		return null;
	}

	// Calculate attendance stats (include both 'attended' and 'attended_late')
	const totalRecords = pastRecords.length;
	const attendedCount = pastRecords.filter(
		(r) => r.status === "attended" || r.status === "attended_late",
	).length;
	const attendancePercentage =
		totalRecords > 0 ? Math.round((attendedCount / totalRecords) * 100) : 0;

	const attendanceData: StatCardData = {
		name: "Attendance",
		percentage: attendancePercentage,
		count: attendedCount,
		total: totalRecords,
		fill: getColorByPercentage(attendancePercentage),
	};

	// Calculate homework stats from past records only
	const homeworkCompletedCount = pastRecords.filter(
		(r) => r.homeworkCompleted,
	).length;
	const homeworkPercentage =
		totalRecords > 0
			? Math.round((homeworkCompletedCount / totalRecords) * 100)
			: 0;

	const homeworkData: StatCardData = {
		name: "Homework",
		percentage: homeworkPercentage,
		count: homeworkCompletedCount,
		total: totalRecords,
		fill: getColorByPercentage(homeworkPercentage),
	};

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<StatCard data={attendanceData} icon={Calendar} label="Attendance" />
			<StatCard data={homeworkData} icon={BookOpenCheck} label="Homework" />
		</div>
	);
}
