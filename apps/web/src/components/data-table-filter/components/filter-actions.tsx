import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import { FilterXIcon } from "lucide-react";
import type { DataTableFilterActions } from "../core/types";
import { type Locale, t } from "../lib/i18n";

interface FilterActionsProps {
	hasFilters: boolean;
	actions?: DataTableFilterActions;
	locale?: Locale;
}

export function FilterActions({
	hasFilters,
	actions,
	locale = "en",
}: FilterActionsProps) {
	return (
		<Button
			variant="outline"
			className={cn("h-7", !hasFilters && "hidden")}
			onClick={actions?.removeAllFilters}
		>
			<FilterXIcon className="mr-[6px] size-3.5" />
			<span className="hidden md:block">{t("clear", locale)}</span>
		</Button>
	);
}
