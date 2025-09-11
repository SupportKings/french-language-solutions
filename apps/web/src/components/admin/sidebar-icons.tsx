"use client";

import { Bot, Calendar, GraduationCap, Settings, Users } from "lucide-react";
import React from "react";

// Memoize icons to prevent hydration issues
const GraduationCapIcon = React.memo(() => <GraduationCap className="h-4 w-4" />);
GraduationCapIcon.displayName = "GraduationCapIcon";

const CalendarIcon = React.memo(() => <Calendar className="h-4 w-4" />);
CalendarIcon.displayName = "CalendarIcon";

const UsersIcon = React.memo(() => <Users className="h-4 w-4" />);
UsersIcon.displayName = "UsersIcon";

const BotIcon = React.memo(() => <Bot className="h-4 w-4" />);
BotIcon.displayName = "BotIcon";

const SettingsIcon = React.memo(() => <Settings className="h-4 w-4" />);
SettingsIcon.displayName = "SettingsIcon";

// Export icons as components to ensure consistent rendering
export const Icons = {
	GraduationCap: GraduationCapIcon,
	Calendar: CalendarIcon,
	Users: UsersIcon,
	Bot: BotIcon,
	Settings: SettingsIcon,
} as const;

export type IconName = keyof typeof Icons;