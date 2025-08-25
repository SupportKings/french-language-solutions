"use client";

import { useParams } from "next/navigation";
import { TeacherFormNew } from "@/features/teachers/components/TeacherFormNew";
import { useTeacher } from "@/features/teachers/queries/teachers.queries";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function EditTeacherPage() {
	const params = useParams();
	const teacherId = params.id as string;
	const { data: teacher, isLoading, error } = useTeacher(teacherId);

	if (isLoading) {
		return (
			<div className="p-6">
				<Skeleton className="mb-4 h-10 w-32" />
				<Skeleton className="mb-2 h-8 w-48" />
				<Skeleton className="mb-6 h-4 w-64" />
				<div className="space-y-4">
					<Skeleton className="h-64 w-full" />
					<Skeleton className="h-64 w-full" />
				</div>
			</div>
		);
	}

	if (error || !teacher) {
		return (
			<div className="p-6">
				<Card>
					<CardContent className="py-10">
						<p className="text-center text-muted-foreground">
							Failed to load teacher details
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return <TeacherFormNew teacher={teacher} />;
}