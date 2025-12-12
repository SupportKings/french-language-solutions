"use client";

import { useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { uploadProfilePictureAction } from "@/features/profile/actions/uploadProfilePic";

import { useAction } from "next-safe-action/hooks";

interface ProfilePictureProps {
	src?: string | null;
	alt: string;
	size?: number;
	onImageChange?: (imageUrl: string) => void;
	className?: string;
	userName?: string;
}

export function ProfilePicture({
	src,
	alt,
	size = 32,
	onImageChange,
	className = "",
	userName = "",
}: ProfilePictureProps) {
	const [isHovered, setIsHovered] = useState(false);
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

	// Show loading state or fallback if no image
	if (!src) {
		return (
			<div
				className={`relative flex cursor-pointer flex-row items-center justify-center overflow-hidden rounded-[50%] border border-[#dadbda] border-solid bg-gray-100 p-0 align-baseline focus-within:shadow-[lch(47.918_59.303_288.421)_0_0_0_1px] focus-within:shadow-[lch(47.918_59.303_288.421)_0_0_0_1px] dark:border-[#2d3036] dark:bg-gray-800 ${className}`}
				style={{ width: size, height: size }}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				onClick={handleClick}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						handleClick();
					}
				}}
			>
				<input
					id="profile-picture-input"
					className="hidden"
					type="file"
					multiple={false}
					accept="image/*,.png,.jpeg,.jpg"
					aria-label="Profile picture"
					onChange={handleFileChange}
				/>
				<div className="relative m-0 flex aspect-[1/1] h-full w-full shrink-0 items-center justify-center border-0 p-0 align-baseline leading-[0]">
					{isUploading ? (
						<div className="flex items-center justify-center">
							<div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
						</div>
					) : (
						<Avatar className="h-full w-full">
							<AvatarFallback className="flex h-full w-full items-center justify-center font-medium text-xs">
								{getInitials(userName)}
							</AvatarFallback>
						</Avatar>
					)}
				</div>
				<div
					className={`pointer-events-none absolute inset-0 m-0 flex flex-row items-center justify-center border-0 p-0 align-baseline transition-opacity duration-200 [background:rgba(0,0,0,.45)] ${
						isHovered ? "opacity-100" : "opacity-0"
					}`}
				>
					<div className="m-0 flex flex-row border-0 p-0 align-baseline">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							role="img"
							fill="lch(100% 5 288.421 / 1)"
							viewBox="0 0 16 16"
							height="16"
							width="16"
							className=""
							aria-label="Change avatar"
						>
							<path d="M10.1805 3.34195L4.14166 9.416C5.32948 9.77021 6.29238 10.6629 6.74008 11.8184L12.6877 5.8425C11.6642 5.22123 10.8043 4.36352 10.1805 3.34195Z" />
							<path d="M13.7391 4.71631C14.1575 4.02948 14.0727 3.11738 13.4846 2.5219C12.8908 1.92072 11.9784 1.83892 11.298 2.27649C11.8547 3.31132 12.7037 4.15999 13.7391 4.71631Z" />
							<path d="M3.03104 10.7502C4.30296 10.7658 5.36645 11.7423 5.49783 13.0114C4.83268 13.426 3.40197 13.7922 2.53114 13.9886C2.2001 14.0632 1.92026 13.7602 2.02075 13.4373C2.25326 12.6902 2.64592 11.5136 3.03104 10.7502Z" />
						</svg>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div
			className={`relative flex cursor-pointer flex-row items-center justify-center overflow-hidden rounded-[50%] border border-[#dadbda] border-solid p-0 align-baseline focus-within:shadow-[lch(47.918_59.303_288.421)_0_0_0_1px] focus-within:shadow-[lch(47.918_59.303_288.421)_0_0_0_1px] dark:border-[#2d3036] ${className}`}
			style={{ width: size, height: size }}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onClick={handleClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					handleClick();
				}
			}}
		>
			<input
				id="profile-picture-input"
				className="hidden"
				type="file"
				multiple={false}
				accept="image/*,.png,.jpeg,.jpg"
				aria-label="Profile picture"
				onChange={handleFileChange}
			/>
			<div className="relative m-0 flex aspect-[1/1] h-full w-full shrink-0 items-center justify-center border-0 p-0 align-baseline leading-[0]">
				{isUploading ? (
					<div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50">
						<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
					</div>
				) : null}
				<Image
					className="pointer-events-none m-0 h-full w-full shrink-0 rounded-[50%] border-0 object-cover p-0 align-baseline"
					aria-label={alt}
					alt={alt}
					height={size}
					width={size}
					src={src}
				/>
			</div>
			<div
				className={`pointer-events-none absolute inset-0 m-0 flex flex-row items-center justify-center border-0 p-0 align-baseline transition-opacity duration-200 [background:rgba(0,0,0,.45)] ${
					isHovered ? "opacity-100" : "opacity-0"
				}`}
			>
				<div className="m-0 flex flex-row border-0 p-0 align-baseline">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						role="img"
						fill="lch(100% 5 288.421 / 1)"
						viewBox="0 0 16 16"
						height="16"
						width="16"
						className=""
						aria-label="Change avatar"
					>
						<path d="M10.1805 3.34195L4.14166 9.416C5.32948 9.77021 6.29238 10.6629 6.74008 11.8184L12.6877 5.8425C11.6642 5.22123 10.8043 4.36352 10.1805 3.34195Z" />
						<path d="M13.7391 4.71631C14.1575 4.02948 14.0727 3.11738 13.4846 2.5219C12.8908 1.92072 11.9784 1.83892 11.298 2.27649C11.8547 3.31132 12.7037 4.15999 13.7391 4.71631Z" />
						<path d="M3.03104 10.7502C4.30296 10.7658 5.36645 11.7423 5.49783 13.0114C4.83268 13.426 3.40197 13.7922 2.53114 13.9886C2.2001 14.0632 1.92026 13.7602 2.02075 13.4373C2.25326 12.6902 2.64592 11.5136 3.03104 10.7502Z" />
					</svg>
				</div>
			</div>
		</div>
	);
}
