"use client";

import { ProductsTable } from "./ProductsTable";

export function ProductsContent() {
	return (
		<div className="flex-1 space-y-6 p-6">
			<ProductsTable />
		</div>
	);
}
