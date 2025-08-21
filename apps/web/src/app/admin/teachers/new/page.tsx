"use client";

import { TeacherForm } from "@/features/teachers/components/TeacherForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewTeacherPage() {
	return (
		<div className="p-6">
			<div className="mb-6">
				<Link href="/admin/teachers">
					<Button variant="ghost" size="sm" className="mb-4">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Teachers
					</Button>
				</Link>
				<h1 className="text-2xl font-bold">Add New Teacher</h1>
				<p className="text-muted-foreground">Create a new teacher profile</p>
			</div>
			<TeacherForm mode="create" />
		</div>
	);
}