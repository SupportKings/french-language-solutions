import { LanguageLevelsTable } from "@/features/language-levels/components/LanguageLevelsTable";

export default function LanguageLevelsPage() {
	return (
		<div className="container mx-auto max-w-7xl space-y-6 py-6">
			<div>
				<h1 className="font-bold text-2xl tracking-tight">Language Levels</h1>
				<p className="text-muted-foreground">
					Manage the available language levels and their configurations
				</p>
			</div>
			<LanguageLevelsTable />
		</div>
	);
}
