import { redirect } from "next/navigation";

import { getUser } from "@/queries/getUser";

export default async function ProductsPage() {
	const session = await getUser();
	if (!session) {
		redirect("/signin");
	}

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div>
				<h1 className="font-bold text-2xl tracking-tight">
					Products & Pricing
				</h1>
				<p className="text-muted-foreground">
					Manage your course products and pricing structure
				</p>
			</div>

			{/* Placeholder Content */}
			<div className="rounded-xl border bg-card/95 p-12 backdrop-blur-sm">
				<div className="text-center">
					<h3 className="mt-4 font-semibold text-lg">Coming Soon</h3>
					<p className="mt-2 text-muted-foreground text-sm">
						Products & Pricing management will be available soon.
					</p>
				</div>
			</div>
		</div>
	);
}
