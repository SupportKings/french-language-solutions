// Format time duration from start and end time
export function formatDuration(startTime: string, endTime: string): { duration: string; durationString: string } {
	const [startHour, startMin] = startTime.split(':').map(Number);
	const [endHour, endMin] = endTime.split(':').map(Number);
	
	const totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	
	let durationString = "";
	if (hours > 0 && minutes > 0) {
		durationString = `${hours}h ${minutes}min`;
	} else if (hours > 0) {
		durationString = hours === 1 ? "1 hour" : `${hours} hours`;
	} else {
		durationString = `${minutes}min`;
	}
	
	const duration = `${hours}:${minutes.toString().padStart(2, '0')}`;
	
	return { duration, durationString };
}

// Capitalize first letter of a string
export function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Generate cohort UI label based on location and sessions
export function generateCohortUILabel(location: string, sessions: Array<{ day_of_week: string }>): string {
	const locationStr = location === "online" ? "Online" : "In-Person";
	const days = sessions.map(s => capitalize(s.day_of_week));
	return `${locationStr}: ${days.join(", ")}`;
}

// Format cohort data for Make.com integration
export function formatCohortForMake(cohort: any): any {
	const formattedSessions = cohort.weekly_sessions.map((session: any) => {
		const { duration, durationString } = formatDuration(session.start_time, session.end_time);
		return {
			"Duration (h:mm)": duration,
			"Duration String": durationString,
			"Day of Week (String)": capitalize(session.day_of_week),
			"Start Time (Parsed to Date)": session.start_time
		};
	});

	const location = cohort.product?.location || "online";
	const format = cohort.product?.format || "group";

	return {
		array: formattedSessions,
		Format: [capitalize(format)],
		Location: [capitalize(location)],
		"Record ID": cohort.id,
		"Start Date": cohort.start_date,
		"Open Places": cohort.available_spots,
		"Cohort UI Label": generateCohortUILabel(location, cohort.weekly_sessions)
	};
}