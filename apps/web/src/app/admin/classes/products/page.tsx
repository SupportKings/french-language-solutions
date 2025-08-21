import { getUser } from "@/queries/getUser";
import { redirect } from "next/navigation";

export default async function ProductsPage() {
	const session = await getUser();
	if (!session) {
		redirect("/signin");
	}

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div>
				<h1 className="text-2xl font-bold tracking-tight">Products & Pricing</h1>
				<p className="text-muted-foreground">
					Manage your course products and pricing structure
				</p>
			</div>

			{/* Placeholder Content */}
			<div className="rounded-xl border bg-card/95 backdrop-blur-sm p-12">
				<div className="text-center">
					<h3 className="mt-4 text-lg font-semibold">Coming Soon</h3>
					<p className="mt-2 text-sm text-muted-foreground">
						Products & Pricing management will be available soon.
					</p>
				</div>
			</div>
		</div>
	);
}