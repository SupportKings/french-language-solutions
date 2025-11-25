import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../index.css";

import Providers from "@/components/providers";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Student Portal - French Language Solutions",
	description: "Student Portal for French Language Solutions",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<Providers>
					<div className="root">{children}</div>
				</Providers>
			</body>
		</html>
	);
}
