"use client";

import * as React from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftRight, Hammer, Search } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { useSession } from "@/components/auth/session-provider";
import { useAuthNavigation } from "@/components/auth/use-auth-navigation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { Role } from "@/domain/types";
import { localDemoProfileSchema } from "@/domain/validators";
import { cn } from "@/lib/utils";

type RegisterValues = z.input<typeof localDemoProfileSchema>;

const roleOptions = [
  {
    value: "supplier",
    label: "I supply offcuts",
    description: "List reusable production offcuts.",
    icon: Hammer,
  },
  {
    value: "buyer",
    label: "I source materials",
    description: "Find batches for upcoming work.",
    icon: Search,
  },
  {
    value: "both",
    label: "Both",
    description: "Switch between buying and supplying.",
    icon: ArrowLeftRight,
  },
] as const;

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

function loginHref(returnTo?: string | null, intent?: string | null) {
  const query = new URLSearchParams();
  if (returnTo) query.set("returnTo", returnTo);
  if (intent) query.set("intent", intent);
  return query.size ? `/login?${query}` : "/login";
}

function RegisterForm({
  returnTo,
  intent,
}: {
  returnTo?: string | null;
  intent?: string | null;
}) {
  const session = useSession();
  const navigateAfterAuth = useAuthNavigation({ returnTo, intent });
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [demoPending, setDemoPending] = React.useState(false);
  const defaultRole: Role = intent === "supplier" ? "supplier" : "buyer";
  const form = useForm<RegisterValues>({
    resolver: zodResolver(localDemoProfileSchema),
    defaultValues: { displayName: "", email: "", role: defaultRole },
  });
  const selectedRole = useWatch({ control: form.control, name: "role" });

  async function submit(values: RegisterValues) {
    setSubmitError(null);
    try {
      const parsed = localDemoProfileSchema.parse(values);
      const activeWorkspace =
        parsed.role === "supplier" ||
        (parsed.role === "both" && intent === "supplier")
          ? "supplying"
          : "buying";
      const user = await session.createLocalProfile({
        ...parsed,
        activeWorkspace,
      });
      await navigateAfterAuth(user);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "The local demo profile could not be created.",
      );
    }
  }

  async function chooseBothDemo() {
    setSubmitError(null);
    setDemoPending(true);
    try {
      const user = await session.loginDemo("demo-both");
      await navigateAfterAuth(user);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "The demo profile could not be opened.",
      );
      setDemoPending(false);
    }
  }

  return (
    <div className="w-full">
      <p className="text-timber-600 text-sm font-semibold">
        Browser-local profile
      </p>
      <h1 className="font-heading mt-2 text-[1.8rem] leading-tight font-semibold tracking-[-0.035em] sm:text-3xl">
        Create a local demo profile
      </h1>
      <p className="text-ink-600 mt-3 leading-7">
        Choose how you will explore WoodLoop. You can change workspace later.
      </p>
      <Alert className="mt-6">
        <strong>No real account is created.</strong> Your profile is stored only
        in this browser, and WoodLoop does not collect or store a password.
      </Alert>
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
          <FieldLabel htmlFor="displayName" required>
            Display name
          </FieldLabel>
          <Input
            id="displayName"
            autoComplete="name"
            aria-invalid={Boolean(form.formState.errors.displayName)}
            aria-describedby="display-name-error"
            {...form.register("displayName")}
          />
          <InlineError
            id="display-name-error"
            message={form.formState.errors.displayName?.message}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="registerEmail" required>
            Work email
          </FieldLabel>
          <Input
            id="registerEmail"
            type="email"
            inputMode="email"
            autoComplete="email"
            spellCheck={false}
            aria-invalid={Boolean(form.formState.errors.email)}
            aria-describedby="register-email-help register-email-error"
            {...form.register("email")}
          />
          <p id="register-email-help" className="text-ink-600 text-xs">
            Used only to identify this profile on this device.
          </p>
          <InlineError
            id="register-email-error"
            message={form.formState.errors.email?.message}
          />
        </Field>
        <fieldset className="grid gap-3" aria-describedby="role-error">
          <legend className="text-ink-900 text-sm font-semibold">
            How will you use WoodLoop?{" "}
            <span className="text-danger" aria-hidden="true">
              *
            </span>
          </legend>
          <div className="grid gap-3">
            {roleOptions.map(({ value, label, description, icon: Icon }) => (
              <label
                key={value}
                className={cn(
                  "border-line bg-surface hover:border-sage-500 flex min-h-18 cursor-pointer items-start gap-3 rounded-md border p-4",
                  selectedRole === value &&
                    "border-brand-900 bg-info-bg ring-1 ring-brand-900",
                )}
              >
                <input
                  type="radio"
                  value={value}
                  className="mt-1 size-4 accent-[var(--brand-900)]"
                  {...form.register("role")}
                />
                <Icon
                  aria-hidden="true"
                  className="text-brand-900 mt-0.5 size-5 shrink-0"
                />
                <span>
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className="text-ink-600 mt-1 block text-xs leading-5">
                    {description}
                  </span>
                </span>
              </label>
            ))}
          </div>
          <InlineError
            id="role-error"
            message={form.formState.errors.role?.message}
          />
        </fieldset>
        <Button
          type="submit"
          size="large"
          fullWidth
          loading={form.formState.isSubmitting}
          loadingLabel="Creating local profile..."
          disabled={session.status !== "ready"}
        >
          Create local demo profile
        </Button>
      </form>

      <div className="border-line mt-6 border-t pt-6">
        <Button
          variant="secondary"
          fullWidth
          loading={demoPending}
          loadingLabel="Opening..."
          disabled={session.status !== "ready"}
          onClick={() => void chooseBothDemo()}
        >
          Continue as Demo Buyer & Supplier
        </Button>
      </div>
      <p className="text-ink-600 mt-7 text-center text-sm">
        Already chose a profile?{" "}
        <Link
          className="text-brand-900 font-semibold underline underline-offset-4"
          href={loginHref(returnTo, intent)}
        >
          Log in
        </Link>
      </p>
    </div>
  );
}

export { RegisterForm };
