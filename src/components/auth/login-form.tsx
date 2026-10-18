"use client";

import * as React from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuthNavigation } from "@/components/auth/use-auth-navigation";
import { useSession } from "@/components/auth/session-provider";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { demoLoginSchema } from "@/domain/validators";
import { DEMO_PASSWORD } from "@/services/demo/demo-identities";

type LoginValues = z.infer<typeof demoLoginSchema>;

function queryHref(
  pathname: string,
  returnTo?: string | null,
  intent?: string | null,
) {
  const query = new URLSearchParams();
  if (returnTo) query.set("returnTo", returnTo);
  if (intent) query.set("intent", intent);
  const value = query.toString();
  return value ? `${pathname}?${value}` : pathname;
}

function InlineError({ id, message }: { id: string; message?: string }) {
  return (
    <p
      id={id}
      role={message ? "alert" : undefined}
      className="text-danger min-h-5 text-sm font-medium"
    >
      {message}
    </p>
  );
}

function LoginForm({
  returnTo,
  intent,
}: {
  returnTo?: string | null;
  intent?: string | null;
}) {
  const session = useSession();
  const navigateAfterAuth = useAuthNavigation({ returnTo, intent });
  const [showPassword, setShowPassword] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [pendingProfile, setPendingProfile] = React.useState<string | null>(
    null,
  );
  const form = useForm<LoginValues>({
    resolver: zodResolver(demoLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function submit(values: LoginValues) {
    setSubmitError(null);
    try {
      const user = await session.loginWithDemoCredentials(
        values.email,
        values.password,
      );
      await navigateAfterAuth(user);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "The demo profile could not be opened.",
      );
    }
  }

  async function chooseDemo(userId: string) {
    setSubmitError(null);
    setPendingProfile(userId);
    try {
      const user = await session.loginDemo(userId);
      await navigateAfterAuth(user);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "The demo profile could not be opened.",
      );
      setPendingProfile(null);
    }
  }

  return (
    <div className="w-full">
      <p className="text-timber-600 text-sm font-semibold">Local demo access</p>
      <h1 className="font-heading mt-2 text-[1.8rem] leading-tight font-semibold tracking-[-0.035em] sm:text-3xl">
        Welcome to WoodLoop
      </h1>
      <p className="text-ink-600 mt-3 leading-7">
        Open a saved demo workspace or choose a ready-made profile.
      </p>

      <Alert className="mt-6">
        <strong>Demo mode</strong> — data is saved on this device only. This is
        not secure production authentication.
      </Alert>
      {session.status === "error" ? (
        <Alert variant="error" className="mt-4">
          {session.error}
        </Alert>
      ) : null}
      {submitError ? (
        <Alert variant="error" className="mt-4">
          {submitError}
        </Alert>
      ) : null}

      <form
        className="mt-6 grid gap-4"
        onSubmit={form.handleSubmit(submit)}
        noValidate
      >
        <Field>
          <FieldLabel htmlFor="email" required>
            Email
          </FieldLabel>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            spellCheck={false}
            aria-invalid={Boolean(form.formState.errors.email)}
            aria-describedby="email-error"
            {...form.register("email")}
          />
          <InlineError
            id="email-error"
            message={form.formState.errors.email?.message}
          />
        </Field>
        <Field>
          <div className="flex items-center justify-between gap-3">
            <FieldLabel htmlFor="password" required>
              Password
            </FieldLabel>
            <Link
              className="text-brand-900 min-h-11 py-2 text-sm font-semibold underline underline-offset-4"
              href={queryHref("/forgot-password", returnTo, intent)}
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="pr-14"
              aria-invalid={Boolean(form.formState.errors.password)}
              aria-describedby="password-error demo-credentials"
              {...form.register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="text-ink-600 hover:text-brand-900 absolute top-1/2 right-1 grid size-11 -translate-y-1/2 place-items-center rounded-sm"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" className="size-5" />
              ) : (
                <Eye aria-hidden="true" className="size-5" />
              )}
            </button>
          </div>
          <InlineError
            id="password-error"
            message={form.formState.errors.password?.message}
          />
        </Field>
        <p
          id="demo-credentials"
          className="text-ink-600 -mt-1 text-xs leading-5"
        >
          Optional seed login:{" "}
          <span className="font-medium">buyer@demo.woodloop.app</span> /{" "}
          <span className="font-medium">{DEMO_PASSWORD}</span>
        </p>
        <Button
          type="submit"
          size="large"
          fullWidth
          loading={form.formState.isSubmitting}
          loadingLabel="Opening workspace..."
          disabled={session.status !== "ready"}
        >
          <LogIn aria-hidden="true" /> Log in
        </Button>
      </form>

      <div className="my-7 flex items-center gap-3" aria-hidden="true">
        <span className="border-line flex-1 border-t" />
        <span className="text-ink-600 text-xs font-semibold">
          Or try the demo
        </span>
        <span className="border-line flex-1 border-t" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          variant="secondary"
          fullWidth
          loading={pendingProfile === "demo-buyer"}
          loadingLabel="Opening..."
          disabled={Boolean(pendingProfile) || session.status !== "ready"}
          onClick={() => void chooseDemo("demo-buyer")}
        >
          Continue as Demo Buyer
        </Button>
        <Button
          variant="secondary"
          fullWidth
          loading={pendingProfile === "demo-supplier"}
          loadingLabel="Opening..."
          disabled={Boolean(pendingProfile) || session.status !== "ready"}
          onClick={() => void chooseDemo("demo-supplier")}
        >
          Continue as Demo Supplier
        </Button>
      </div>
      <p className="text-ink-600 mt-7 text-center text-sm">
        Need a local profile?{" "}
        <Link
          className="text-brand-900 font-semibold underline underline-offset-4"
          href={queryHref("/register", returnTo, intent)}
        >
          Create account
        </Link>
      </p>
    </div>
  );
}

export { LoginForm };
