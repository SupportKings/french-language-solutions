"use client";

import { useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { uploadProfilePictureAction } from "@/features/profile/actions/uploadProfilePic";

import { useAction } from "next-safe-action/hooks";
import { Upload } from "lucide-react";

interface ProfilePictureProps {
	src?: string | null;
	alt: string;
	size?: number;
	onImageChange?: (imageUrl: string) => void;
	className?: string;
	userName?: string;
	showUploadButton?: boolean;
}

export function ProfilePicture({
	src,
	alt,
	size = 80,
	onImageChange,
	className = "",
	userName = "",
	showUploadButton = true,
}: ProfilePictureProps) {
	const [isUploading, setIsUploading] = useState(false);
	const router = useRouter();

	// Get initials from user name
	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	const { execute } = useAction(uploadProfilePictureAction, {
		onSuccess: async (result) => {
			if (result.data?.ok && result.data?.imageUrl) {
				try {
					// Update user profile with new image URL via auth client
					await authClient.updateUser({
						image: result.data.imageUrl,
					});

					// Call the onImageChange callback if provided
					if (onImageChange) {
						onImageChange(result.data.imageUrl);
					}

					// Refresh the page to show the new image
					router.refresh();
				} catch (error) {
					console.error("Error updating profile image:", error);
				}
			}
			setIsUploading(false);
		},
		onError: (error) => {
			console.error("Upload failed:", error);
			setIsUploading(false);
		},
	});

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			// Validate file size (max 2MB)
			if (file.size > 2 * 1024 * 1024) {
				alert("File size must be less than 2MB");
				return;
			}

			// Validate file type
			if (!file.type.startsWith("image/")) {
				alert("Please upload an image file");
				return;
			}

			setIsUploading(true);

			// Create FormData and execute the action
			const formData = new FormData();
			formData.append("image", file);
			execute(formData);
		}
	};

	const handleClick = () => {
		// Trigger the file input click
		const fileInput = document.getElementById(
			"profile-picture-input",
		) as HTMLInputElement;
		if (fileInput) {
			fileInput.click();
		}
	};

	return (
		<div className="flex items-center gap-4">
			<Avatar className={`h-20 w-20 ${className}`} style={{ width: size, height: size }}>
				{src ? (
					<>
						<Image
							className="h-full w-full rounded-full object-cover"
							aria-label={alt}
							alt={alt}
							height={size}
							width={size}
							src={src}
						/>
						{isUploading && (
							<div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50">
								<div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
							</div>
						)}
					</>
				) : (
					<AvatarFallback className="bg-primary/10 text-primary text-xl">
						{isUploading ? (
							<div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
						) : (
							getInitials(userName)
						)}
					</AvatarFallback>
				)}
			</Avatar>
			{showUploadButton && (
				<div>
					<input
						id="profile-picture-input"
						className="hidden"
						type="file"
						multiple={false}
						accept="image/*,.png,.jpeg,.jpg"
						aria-label="Profile picture"
						onChange={handleFileChange}
						disabled={isUploading}
					/>
					<Button
						variant="outline"
						size="sm"
						onClick={handleClick}
						disabled={isUploading}
						type="button"
					>
						<Upload className="mr-2 h-4 w-4" />
						{isUploading ? "Uploading..." : "Change photo"}
					</Button>
					<p className="mt-1 text-muted-foreground text-xs">
						JPG, PNG or GIF. Max 2MB.
					</p>
				</div>
			)}
		</div>
	);
}
