import Link from "next/link";
import { redirect } from "next/navigation";

import { ClassForm } from "@/features/classes/components/ClassForm";

import { getUser } from "@/queries/getUser";

import { ChevronLeft } from "lucide-react";

export default async function NewClassPage() {
	const session = await getUser();
	if (!session) {
		redirect("/signin");
	}

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div className="flex items-center gap-4">
				<Link
					href="/admin/classes"
					className="inline-flex items-center text-muted-foreground text-sm transition-colors hover:text-foreground"
				>
					<ChevronLeft className="mr-1 h-4 w-4" />
					Back to Classes
				</Link>
			</div>

			<div>
				<h1 className="font-bold text-2xl tracking-tight">Create New Class</h1>
				<p className="text-muted-foreground">
					Add a new class to your schedule
				</p>
			</div>

			{/* Form */}
			<ClassForm />
		</div>
	);
}
