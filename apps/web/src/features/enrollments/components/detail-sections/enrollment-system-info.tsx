import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Clock } from "lucide-react";

const formatDate = (dateString: string | null) => {
	if (!dateString) return "Not set";
	try {
		return format(new Date(dateString), "MMM dd, yyyy 'at' h:mm a");
	} catch {
		return "Invalid date";
	}
};

interface EnrollmentSystemInfoProps {
	enrollment: {
		created_at: string;
		updated_at: string;
	};
}

export function EnrollmentSystemInfo({ enrollment }: EnrollmentSystemInfoProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Clock className="h-5 w-5" />
					System Information
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Created At
					</label>
					<p className="text-sm">{formatDate(enrollment.created_at)}</p>
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Last Updated
					</label>
					<p className="text-sm">{formatDate(enrollment.updated_at)}</p>
				</div>
			</CardContent>
		</Card>
	);
}