import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { Plus } from "lucide-react";

export function ProductsHeader() {
	return (
		<div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background/95 px-4 shadow-sm backdrop-blur-sm sm:gap-x-6 sm:px-6 lg:px-8">
			<SidebarTrigger className="-ml-2.5" />
			<div className="flex flex-1 items-center justify-between">
				<div>
					<h1 className="font-semibold text-lg">Products</h1>
				</div>
				<div>
					<Link href="#" passHref>
						<Button size="sm">
							<Plus className="mr-2 h-4 w-4" />
							Add Product
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
