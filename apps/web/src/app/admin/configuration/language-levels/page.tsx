import { LanguageLevelsTable } from "@/features/language-levels/components/LanguageLevelsTable";

export default function LanguageLevelsPage() {
	return (
		<div className="container max-w-7xl mx-auto py-6 space-y-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">Language Levels</h1>
				<p className="text-muted-foreground">
					Manage the available language levels and their configurations
				</p>
			</div>
			<LanguageLevelsTable />
		</div>
	);
}