"use client";

import { useState } from "react";
import { Target } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { updateGoalLevelAction } from "../actions/updateGoalLevel";

interface LanguageLevel {
	id: string;
	code: string;
	display_name: string;
	level_number: number | null;
}

interface GoalLevelSelectorProps {
	languageLevels: LanguageLevel[];
	currentGoalLevelId: string | null;
}

export function GoalLevelSelector({
	languageLevels,
	currentGoalLevelId,
}: GoalLevelSelectorProps) {
	const [selectedGoalLevelId, setSelectedGoalLevelId] = useState<
		string | null
	>(currentGoalLevelId);

	const { execute, isExecuting } = useAction(updateGoalLevelAction, {
		onSuccess: () => {
			toast.success("Goal level updated successfully");
		},
		onError: () => {
			toast.error("Failed to update goal level");
		},
	});

	const handleSave = () => {
		if (selectedGoalLevelId) {
			execute({ goalLevelId: selectedGoalLevelId });
		}
	};

	const hasChanged = selectedGoalLevelId !== currentGoalLevelId;

	return (
		<div className="space-y-2">
			<Label htmlFor="goalLevel" className="flex items-center gap-2">
				<Target className="h-4 w-4" />
				Goal Level
			</Label>
			<Select
				value={selectedGoalLevelId || undefined}
				onValueChange={setSelectedGoalLevelId}
			>
				<SelectTrigger id="goalLevel">
					<SelectValue placeholder="Select your goal level" />
				</SelectTrigger>
				<SelectContent className="max-h-[300px]">
					{languageLevels.map((level) => (
						<SelectItem key={level.id} value={level.id}>
							{level.display_name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<p className="text-muted-foreground text-xs">
				Set your target French proficiency level to track your progress
			</p>
			{hasChanged && (
				<Button
					onClick={handleSave}
					disabled={isExecuting || !selectedGoalLevelId}
					size="sm"
					className="mt-2"
				>
					{isExecuting ? "Saving..." : "Save Goal Level"}
				</Button>
			)}
		</div>
	);
}
