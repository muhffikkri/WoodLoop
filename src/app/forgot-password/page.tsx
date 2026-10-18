import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { Suspense } from "react";

import { AuthFormFallback, AuthFrame } from "@/components/auth/auth-frame";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Password recovery" };

async function RecoveryQuery({
  searchParams,
}: Pick<PageProps<"/forgot-password">, "searchParams">) {
  const query = await searchParams;
  const loginQuery = new URLSearchParams();
  if (typeof query.returnTo === "string")
    loginQuery.set("returnTo", query.returnTo);
  if (typeof query.intent === "string") loginQuery.set("intent", query.intent);
  const loginHref = loginQuery.size ? `/login?${loginQuery}` : "/login";

  return (
    <div className="w-full">
      <KeyRound aria-hidden="true" className="text-timber-600 size-8" />
      <h1 className="font-heading mt-5 text-[1.8rem] leading-tight font-semibold tracking-[-0.035em] sm:text-3xl">
        Password recovery is unavailable in demo mode
      </h1>
      <p className="text-ink-600 mt-4 leading-7">
        WoodLoop is not connected to an account or email service, so no recovery
        message can be sent.
      </p>
      <Alert className="mt-6">
        Use one of the explicit demo profiles instead. Local profiles do not
        have passwords and remain only on this device.
      </Alert>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="large">
          <Link href={loginHref}>Try a demo profile</Link>
        </Button>
        <Button asChild variant="secondary" size="large">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage({
  searchParams,
}: PageProps<"/forgot-password">) {
  return (
    <AuthFrame>
      <Suspense fallback={<AuthFormFallback />}>
        <RecoveryQuery searchParams={searchParams} />
      </Suspense>
    </AuthFrame>
  );
}
