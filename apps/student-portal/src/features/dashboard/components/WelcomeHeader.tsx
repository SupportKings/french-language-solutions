import { format } from "date-fns";

interface WelcomeHeaderProps {
	studentName: string;
}

export function WelcomeHeader({ studentName }: WelcomeHeaderProps) {
	const currentHour = new Date().getHours();
	const greeting =
		currentHour < 12
			? "Good morning"
			: currentHour < 18
				? "Good afternoon"
				: "Good evening";

	const today = new Date();
	const formattedDate = format(today, "EEEE, MMMM d, yyyy");

	return (
		<div className="space-y-2">
			<p className="text-muted-foreground text-sm">{formattedDate}</p>
			<h1 className="font-bold text-2xl tracking-tight sm:text-3xl">
				{greeting}, {studentName}
			</h1>
			<p className="text-muted-foreground">
				Here's what's happening with your French learning journey
			</p>
		</div>
	);
}
