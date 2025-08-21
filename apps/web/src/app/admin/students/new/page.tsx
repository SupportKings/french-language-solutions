import { Card, CardContent } from "@/components/ui/card";
import { StudentForm } from "@/features/students/components/StudentForm";

export default function NewStudentPage() {
	return (
		<div className="p-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">Create Student</h1>
				<p className="text-muted-foreground">Add a new student to your database</p>
			</div>
			
			<Card>
				<CardContent className="pt-6">
					<StudentForm />
				</CardContent>
			</Card>
		</div>
	);
}