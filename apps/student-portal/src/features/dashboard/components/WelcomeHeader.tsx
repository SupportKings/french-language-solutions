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
		<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-blue-700 p-6 text-white sm:p-8">
			{/* Decorative elements with red accent */}
			<div className="-mt-8 -mr-8 absolute top-0 right-0 h-32 w-32 rounded-full bg-secondary/20 blur-2xl" />
			<div className="-mb-8 -ml-8 absolute bottom-0 left-0 h-24 w-24 rounded-full bg-white/10 blur-xl" />
			<div className="absolute top-1/2 right-1/4 h-16 w-16 rounded-full bg-secondary/15 blur-xl" />

			<div className="relative space-y-2">
				<div className="flex items-center gap-2">
					<p className="text-blue-100 text-sm">{formattedDate}</p>
				</div>
				<h1 className="font-bold text-2xl tracking-tight sm:text-3xl">
					{greeting}, {studentName}
				</h1>
				<p className="text-blue-100">
					Here's what's happening with your French learning journey
				</p>
			</div>
		</div>
	);
}
