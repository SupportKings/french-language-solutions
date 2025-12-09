export default async function StudentsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// Permission checks are handled at the page/API level
	// Teachers can access student detail pages (for students in their cohorts)
	// but the sidebar still hides the students hub from teachers

	return <>{children}</>;
}
