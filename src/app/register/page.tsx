import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthFormFallback, AuthFrame } from "@/components/auth/auth-frame";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Create local demo profile" };

async function RegisterQuery({
  searchParams,
}: Pick<PageProps<"/register">, "searchParams">) {
  const query = await searchParams;
  const returnTo = typeof query.returnTo === "string" ? query.returnTo : null;
  const intent = typeof query.intent === "string" ? query.intent : null;
  return <RegisterForm returnTo={returnTo} intent={intent} />;
}

export default function RegisterPage({ searchParams }: PageProps<"/register">) {
  return (
    <AuthFrame>
      <Suspense fallback={<AuthFormFallback />}>
        <RegisterQuery searchParams={searchParams} />
      </Suspense>
    </AuthFrame>
  );
}
