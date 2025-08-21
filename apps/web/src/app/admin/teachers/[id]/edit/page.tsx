"use client";

import { useParams } from "next/navigation";
import { TeacherForm } from "@/features/teachers/components/TeacherForm";
import { useTeacher } from "@/features/teachers/queries/teachers.queries";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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

	return (
		<div className="p-6">
			<div className="mb-6">
				<Link href="/admin/teachers">
					<Button variant="ghost" size="sm" className="mb-4">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Teachers
					</Button>
				</Link>
				<h1 className="text-2xl font-bold">Edit Teacher</h1>
				<p className="text-muted-foreground">
					Update {teacher.first_name} {teacher.last_name}'s profile
				</p>
			</div>
			<TeacherForm mode="edit" teacher={teacher} />
		</div>
	);
}