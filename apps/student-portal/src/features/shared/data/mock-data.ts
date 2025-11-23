import type {
	Announcement,
	ClassSession,
	StudentStats,
	WorkplanItem,
} from "../types";

// Helper to create dates relative to now
const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

function addHours(date: Date, hours: number): Date {
	return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function addDays(date: Date, days: number): Date {
	return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

// Mock Classes
export const mockClasses: ClassSession[] = [
	{
		id: "class-1",
		cohortId: "cohort-1",
		cohortName: "A2 Morning French",
		courseName: "Conversational French",
		startTime: addHours(today, 10).toISOString(), // Today at 10am
		endTime: addHours(today, 11.5).toISOString(),
		teacher: {
			id: "teacher-1",
			name: "Marie Dupont",
		},
		meetingLink: "https://meet.google.com/abc-defg-hij",
		status: "scheduled",
		location: "online",
		notes: "Focus on verb conjugations - passé composé",
	},
	{
		id: "class-2",
		cohortId: "cohort-2",
		cohortName: "B1 Conversation Club",
		courseName: "Advanced Conversation",
		startTime: addHours(today, 14).toISOString(), // Today at 2pm
		endTime: addHours(today, 15.5).toISOString(),
		teacher: {
			id: "teacher-2",
			name: "Jean-Pierre Martin",
		},
		meetingLink: "https://meet.google.com/xyz-uvwx-rst",
		status: "scheduled",
		location: "online",
	},
	{
		id: "class-3",
		cohortId: "cohort-1",
		cohortName: "A2 Morning French",
		courseName: "Conversational French",
		startTime: addHours(addDays(today, 1), 10).toISOString(), // Tomorrow 10am
		endTime: addHours(addDays(today, 1), 11.5).toISOString(),
		teacher: {
			id: "teacher-1",
			name: "Marie Dupont",
		},
		meetingLink: "https://meet.google.com/abc-defg-hij",
		status: "scheduled",
		location: "online",
	},
	{
		id: "class-4",
		cohortId: "cohort-2",
		cohortName: "B1 Conversation Club",
		courseName: "Advanced Conversation",
		startTime: addHours(addDays(today, 2), 14).toISOString(), // Day after tomorrow
		endTime: addHours(addDays(today, 2), 15.5).toISOString(),
		teacher: {
			id: "teacher-2",
			name: "Jean-Pierre Martin",
		},
		meetingLink: "https://meet.google.com/xyz-uvwx-rst",
		status: "scheduled",
		location: "online",
	},
	{
		id: "class-5",
		cohortId: "cohort-1",
		cohortName: "A2 Morning French",
		courseName: "Conversational French",
		startTime: addHours(addDays(today, 3), 10).toISOString(),
		endTime: addHours(addDays(today, 3), 11.5).toISOString(),
		teacher: {
			id: "teacher-1",
			name: "Marie Dupont",
		},
		meetingLink: "https://meet.google.com/abc-defg-hij",
		status: "scheduled",
		location: "online",
	},
	{
		id: "class-6",
		cohortId: "cohort-1",
		cohortName: "A2 Morning French",
		courseName: "Conversational French",
		startTime: addHours(addDays(today, -2), 10).toISOString(), // 2 days ago
		endTime: addHours(addDays(today, -2), 11.5).toISOString(),
		teacher: {
			id: "teacher-1",
			name: "Marie Dupont",
		},
		status: "completed",
		location: "online",
	},
];

// Mock Announcements
export const mockAnnouncements: Announcement[] = [
	{
		id: "ann-1",
		title: "Welcome to the New Student Portal!",
		content:
			"We're thrilled to share some exciting updates with you! Our team has been hard at work, and we are delighted to introduce the latest features that will enhance your learning experience. You can now track your progress, view your schedule, and stay connected with your teachers all in one place.\n\nKey features:\n- View your upcoming classes\n- Track attendance and progress\n- Receive important announcements\n- Access learning materials",
		author: {
			id: "admin-1",
			name: "FLS Admin Team",
			role: "admin",
		},
		scope: "school_wide",
		isPinned: true,
		isRead: false,
		createdAt: addDays(now, -2).toISOString(),
	},
	{
		id: "ann-2",
		title: "Homework Reminder: Chapter 5 Exercises",
		content:
			"Please complete the exercises from Chapter 5 before our next class. Focus on the verb conjugations and practice the dialogue patterns we covered. This will help you prepare for the upcoming assessment.\n\nDon't forget to review:\n- Passé composé with être\n- Reflexive verbs\n- Time expressions",
		author: {
			id: "teacher-1",
			name: "Marie Dupont",
			role: "teacher",
		},
		scope: "cohort",
		cohortId: "cohort-1",
		cohortName: "A2 Morning French",
		isPinned: false,
		isRead: false,
		createdAt: addDays(now, -1).toISOString(),
	},
	{
		id: "ann-3",
		title: "Holiday Schedule Update",
		content:
			"Please note that classes will be paused from December 23rd to January 2nd for the holiday break. Regular schedule resumes January 3rd. We wish you all a wonderful holiday season!",
		author: {
			id: "admin-1",
			name: "FLS Admin Team",
			role: "admin",
		},
		scope: "school_wide",
		isPinned: true,
		isRead: true,
		createdAt: addDays(now, -5).toISOString(),
	},
	{
		id: "ann-4",
		title: "New Learning Resources Available",
		content:
			"We've added new audio materials and practice exercises to help you improve your listening comprehension. Check out the resources section in your learning portal.",
		author: {
			id: "admin-1",
			name: "FLS Admin Team",
			role: "admin",
		},
		scope: "school_wide",
		isPinned: false,
		isRead: true,
		createdAt: addDays(now, -7).toISOString(),
	},
	{
		id: "ann-5",
		title: "Great Progress This Week!",
		content:
			"I wanted to congratulate everyone on the excellent participation in this week's conversation practice. Your pronunciation has improved significantly! Keep up the great work.",
		author: {
			id: "teacher-2",
			name: "Jean-Pierre Martin",
			role: "teacher",
		},
		scope: "cohort",
		cohortId: "cohort-2",
		cohortName: "B1 Conversation Club",
		isPinned: false,
		isRead: false,
		createdAt: addDays(now, -3).toISOString(),
	},
];

// Mock Student Stats
export const mockStudentStats: StudentStats = {
	attendanceRate: 92,
	completionRate: 78,
	currentLevel: "A2",
	totalClasses: 24,
	completedClasses: 18,
	upcomingClasses: 6,
};

// Mock Workplan Items
export const mockWorkplanItems: WorkplanItem[] = [
	{
		id: "wp-1",
		type: "class",
		title: "A2 Morning French",
		subtitle: "Conversational French",
		dueDate: addHours(today, 10).toISOString(),
		cohortName: "A2 Morning French",
		isCompleted: false,
	},
	{
		id: "wp-2",
		type: "assignment",
		title: "Chapter 5 Exercises",
		subtitle: "Due Today at 11:00 PM",
		dueDate: addHours(today, 23).toISOString(),
		cohortName: "A2 Morning French",
		isCompleted: false,
	},
	{
		id: "wp-3",
		type: "class",
		title: "B1 Conversation Club",
		subtitle: "Advanced Conversation",
		dueDate: addHours(today, 14).toISOString(),
		cohortName: "B1 Conversation Club",
		isCompleted: false,
	},
	{
		id: "wp-4",
		type: "evaluation",
		title: "Speaking Assessment",
		subtitle: "Scheduled for Friday",
		dueDate: addDays(today, 4).toISOString(),
		cohortName: "A2 Morning French",
		isCompleted: false,
	},
];

// Categories for announcements
export const announcementCategories = [
	{ id: "all", label: "All Announcements", count: mockAnnouncements.length },
	{
		id: "school_wide",
		label: "School-wide",
		count: mockAnnouncements.filter((a) => a.scope === "school_wide").length,
	},
	{
		id: "cohort",
		label: "Class Updates",
		count: mockAnnouncements.filter((a) => a.scope === "cohort").length,
	},
];
