import { SignInForm } from "@/features/auth/components/sign-in-form";

interface PageProps {
  searchParams: Promise<{
    redirectTo?: string;
  }>;
}

export default async function SignInPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const redirectTo = searchParams.redirectTo || "/teacher";
  return <SignInForm redirectTo={redirectTo} />;
}
