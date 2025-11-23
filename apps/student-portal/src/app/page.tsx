import { SignInForm } from "@/features/auth/components/sign-in-form";

interface PageProps {
	searchParams: Promise<{
		redirectTo?: string;
		error?: string;
	}>;
}

export default async function SignInPage(props: PageProps) {
	const searchParams = await props.searchParams;
	const redirectTo = searchParams.redirectTo || "/dashboard";
	const error = searchParams.error;

	return <SignInForm redirectTo={redirectTo} error={error} />;
}
