"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useEnrollment } from "@/features/enrollments/queries/useEnrollments";
import { deleteEnrollment } from "@/features/enrollments/actions/deleteEnrollment";
import * as Dialog from "@radix-ui/react-dialog";
import { Trash2Icon, X } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

interface EnrollmentDetailHeaderProps {
	enrollmentId: string;
}

export default function EnrollmentDetailHeader({
	enrollmentId,
}: EnrollmentDetailHeaderProps) {
	const { data: enrollment } = useEnrollment(enrollmentId);
	const router = useRouter();
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	
	const { execute: executeDeleteEnrollment, isExecuting } = useAction(deleteEnrollment, {
		onSuccess: () => {
			setIsDeleteDialogOpen(false);
			toast.success(`Enrollment has been deleted successfully`);
			router.push('/admin/enrollments');
		},
		onError: (error) => {
			console.error('Failed to delete enrollment:', error);
			toast.error('Failed to delete enrollment. Please try again.');
		},
	});

	const handleDeleteEnrollment = () => {
		executeDeleteEnrollment({ id: enrollmentId });
	};

	const studentName = enrollment?.student?.full_name || 'Unknown Student';
	const productName = enrollment?.cohort?.product?.display_name || 'Unknown Product';

	return (
		<div className="sticky top-0 z-10 flex h-[45px] flex-shrink-0 items-center justify-between border-border border-b px-4 py-2 lg:px-6">
			<div className="flex items-center gap-2">
				<SidebarTrigger />
				<BackButton />
				<h1 className="font-medium text-[13px]">
					{studentName} - {productName} Enrollment
				</h1>
			</div>
			<Dialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<Dialog.Trigger asChild>
					<Button variant="destructive" className="flex items-center gap-2">
						<Trash2Icon className="mr-[6px] h-4 w-4" />
						Delete Enrollment
					</Button>
				</Dialog.Trigger>
				<Dialog.Portal>
					<Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
					<Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-md z-50">
						<Dialog.Title className="text-lg font-semibold mb-4">
							Delete Enrollment
						</Dialog.Title>
						<Dialog.Description className="text-gray-600 mb-6">
							Are you sure you want to delete this enrollment for {studentName}? This action cannot be undone.
						</Dialog.Description>
						<div className="flex justify-end gap-3">
							<Dialog.Close asChild>
								<Button variant="outline">Cancel</Button>
							</Dialog.Close>
							<Button
								variant="destructive"
								onClick={handleDeleteEnrollment}
								disabled={isExecuting}
							>
								{isExecuting ? 'Deleting...' : 'Delete'}
							</Button>
						</div>
						<Dialog.Close asChild>
							<Button variant="ghost" size="sm" className="absolute top-3 right-3 p-1">
								<X className="h-4 w-4" />
							</Button>
						</Dialog.Close>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>
		</div>
	);
}