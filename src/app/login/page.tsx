import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthFormFallback, AuthFrame } from "@/components/auth/auth-frame";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Log in" };

async function LoginQuery({
  searchParams,
}: Pick<PageProps<"/login">, "searchParams">) {
  const query = await searchParams;
  const returnTo = typeof query.returnTo === "string" ? query.returnTo : null;
  const intent = typeof query.intent === "string" ? query.intent : null;
  return <LoginForm returnTo={returnTo} intent={intent} />;
}

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <AuthFrame>
      <Suspense fallback={<AuthFormFallback />}>
        <LoginQuery searchParams={searchParams} />
      </Suspense>
    </AuthFrame>
  );
}
