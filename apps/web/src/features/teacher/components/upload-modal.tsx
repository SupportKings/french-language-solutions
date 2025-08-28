"use client";

import { useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { AnimatePresence, motion as m } from "framer-motion";
import {
	AlertCircle,
	Check,
	File,
	FileSpreadsheet,
	FileText,
	FileVideo,
	Image,
	Upload,
	X,
} from "lucide-react";
import { toast } from "sonner";

interface UploadModalProps {
	isOpen: boolean;
	onClose: () => void;
	classId?: string | null;
	type?: "homework" | "materials";
}

const classLevels = [
	"A1.1",
	"A1.2",
	"A1.3",
	"A1.4",
	"A1.5",
	"A2.1",
	"A2.2",
	"A2.3",
	"A2.4",
	"B1.1",
	"B1.2",
	"B1.3",
	"B1.4",
	"B2.1",
	"B2.2",
	"B2.3",
	"C1.1",
	"C1.2",
	"C2.1",
];

export function UploadModal({
	isOpen,
	onClose,
	classId,
	type = "homework",
}: UploadModalProps) {
	const [selectedLevel, setSelectedLevel] = useState("");
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const [attendanceMarked, setAttendanceMarked] = useState(true); // Mock state
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const files = Array.from(e.target.files);
			setSelectedFiles((prev) => [...prev, ...files]);
		}
	};

	const removeFile = (index: number) => {
		setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
	};

	const handleUpload = async () => {
		if (!selectedLevel) {
			toast.error("Please select a class level");
			return;
		}

		if (selectedFiles.length === 0) {
			toast.error("Please select at least one file");
			return;
		}

		if (!attendanceMarked && type === "homework") {
			toast.error("Please mark attendance before uploading homework");
			return;
		}

		setIsUploading(true);

		// Simulate upload
		await new Promise((resolve) => setTimeout(resolve, 2000));

		toast.success(
			`${type === "homework" ? "Homework" : "Materials"} uploaded successfully!`,
		);
		setIsUploading(false);
		onClose();
		setSelectedFiles([]);
		setSelectedLevel("");
	};

	const getFileIcon = (file: File) => {
		const type = file.type;
		if (type.includes("image")) return <Image className="h-4 w-4" />;
		if (type.includes("pdf")) return <FileText className="h-4 w-4" />;
		if (type.includes("spreadsheet") || type.includes("excel"))
			return <FileSpreadsheet className="h-4 w-4" />;
		if (type.includes("video")) return <FileVideo className="h-4 w-4" />;
		return <File className="h-4 w-4" />;
	};

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round((bytes / k ** i) * 100) / 100 + " " + sizes[i];
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<m.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
						onClick={onClose}
					/>

					{/* Modal */}
					<m.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						className="fixed inset-0 z-50 flex items-center justify-center p-4"
					>
						<Card className="w-full max-w-2xl border-border/50 bg-card/95 shadow-2xl backdrop-blur-sm">
							<div className="p-6">
								{/* Header */}
								<div className="mb-6 flex items-center justify-between">
									<div>
										<h2 className="font-bold text-2xl">
											Upload {type === "homework" ? "Homework" : "Materials"}
										</h2>
										<p className="mt-1 text-muted-foreground text-sm">
											Select files and class level to upload
										</p>
									</div>
									<Button
										variant="ghost"
										size="icon"
										onClick={onClose}
										className="rounded-full"
									>
										<X className="h-4 w-4" />
									</Button>
								</div>

								{/* Attendance Warning */}
								{!attendanceMarked && type === "homework" && (
									<m.div
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										className="mb-4 flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20"
									>
										<AlertCircle className="h-4 w-4 text-yellow-600" />
										<p className="text-sm text-yellow-800 dark:text-yellow-200">
											Attendance must be marked before uploading homework
										</p>
									</m.div>
								)}

								{/* Class Level Selection */}
								<div className="mb-6">
									<Label className="mb-3 block font-medium text-sm">
										Select Class Level
									</Label>
									<div className="grid grid-cols-5 gap-2">
										{classLevels.map((level) => (
											<m.button
												key={level}
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
												onClick={() => setSelectedLevel(level)}
												className={`rounded-lg border p-2 text-sm transition-all ${
													selectedLevel === level
														? "border-primary bg-primary text-primary-foreground"
														: "border-input bg-background hover:bg-muted"
												}`}
											>
												{level}
											</m.button>
										))}
									</div>
								</div>

								{/* File Upload Area */}
								<div className="mb-6">
									<Label className="mb-3 block font-medium text-sm">
										Upload Files
									</Label>
									<div
										onClick={() => fileInputRef.current?.click()}
										className="cursor-pointer rounded-xl border-2 border-input border-dashed p-8 text-center transition-all hover:border-primary/50 hover:bg-muted/50"
									>
										<Upload className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
										<p className="font-medium text-sm">
											Click to upload or drag and drop
										</p>
										<p className="mt-1 text-muted-foreground text-xs">
											PDF, DOC, XLS, PPT, Images (max 10MB each)
										</p>
										<input
											ref={fileInputRef}
											type="file"
											multiple
											onChange={handleFileSelect}
											className="hidden"
											accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
										/>
									</div>
								</div>

								{/* Selected Files */}
								{selectedFiles.length > 0 && (
									<div className="mb-6">
										<Label className="mb-3 block font-medium text-sm">
											Selected Files ({selectedFiles.length})
										</Label>
										<div className="max-h-48 space-y-2 overflow-y-auto">
											{selectedFiles.map((file, index) => (
												<m.div
													key={index}
													initial={{ opacity: 0, x: -10 }}
													animate={{ opacity: 1, x: 0 }}
													className="flex items-center justify-between rounded-lg border bg-background p-3"
												>
													<div className="flex items-center gap-3">
														{getFileIcon(file)}
														<div>
															<p className="max-w-[300px] truncate font-medium text-sm">
																{file.name}
															</p>
															<p className="text-muted-foreground text-xs">
																{formatFileSize(file.size)}
															</p>
														</div>
													</div>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => removeFile(index)}
													>
														<X className="h-3 w-3" />
													</Button>
												</m.div>
											))}
										</div>
									</div>
								)}

								{/* Actions */}
								<div className="flex justify-end gap-3">
									<Button
										variant="outline"
										onClick={onClose}
										disabled={isUploading}
									>
										Cancel
									</Button>
									<Button
										onClick={handleUpload}
										disabled={
											isUploading || (!attendanceMarked && type === "homework")
										}
										className="min-w-[100px]"
									>
										{isUploading ? (
											<m.div
												animate={{ rotate: 360 }}
												transition={{
													duration: 1,
													repeat: Number.POSITIVE_INFINITY,
													ease: "linear",
												}}
											>
												<Upload className="h-4 w-4" />
											</m.div>
										) : (
											<>
												<Upload className="mr-2 h-4 w-4" />
												Upload
											</>
										)}
									</Button>
								</div>
							</div>
						</Card>
					</m.div>
				</>
			)}
		</AnimatePresence>
	);
}
