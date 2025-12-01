import { format } from "date-fns";

import type { StudentStats } from "@/features/shared/types";

interface WelcomeHeaderProps {
	studentName: string;
	stats: StudentStats;
}

export function WelcomeHeader({ studentName, stats }: WelcomeHeaderProps) {
	const currentHour = new Date().getHours();
	const greeting =
		currentHour < 12
			? "Good morning"
			: currentHour < 18
				? "Good afternoon"
				: "Good evening";

	const today = new Date();
	const formattedDate = format(today, "EEEE, MMMM d");

	// Determine motivation message based on attendance
	const motivationMessage =
		stats.attendanceRate >= 90
			? "You're progressing excellently — keep up your French journey!"
			: stats.attendanceRate >= 70
				? "You're doing great — keep up your French journey!"
				: "Stay consistent with your classes to make the most progress!";

	return (
		<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-blue-700 px-6 py-4 text-white">
			{/* Decorative elements - more subtle */}
			<div className="-mt-8 -mr-8 absolute top-0 right-0 h-32 w-32 rounded-full bg-secondary/15 blur-3xl" />
			<div className="-mb-8 -ml-8 absolute bottom-0 left-0 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

			<div className="relative">
				<p className="mb-1 text-blue-100 text-xs">{formattedDate}</p>
				<h1 className="mb-1 font-bold text-2xl tracking-tight">
					{greeting}, {studentName} 👋
				</h1>
				<p className="text-blue-100 text-sm">{motivationMessage}</p>
			</div>
		</div>
	);
}
