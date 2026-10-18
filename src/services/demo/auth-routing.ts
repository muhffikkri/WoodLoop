import type { ActiveWorkspace, Role, User } from "@/domain/types";

export function safeReturnTo(value?: string | null) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return null;
  }
  try {
    const url = new URL(value, "https://woodloop.local");
    if (
      url.origin !== "https://woodloop.local" ||
      !url.pathname.startsWith("/app")
    ) {
      return null;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function workspaceForDestination(
  destination: string,
): ActiveWorkspace | null {
  const url = new URL(destination, "https://woodloop.local");
  if (
    url.pathname.startsWith("/app/supplier") ||
    url.pathname.startsWith("/app/listings") ||
    (url.pathname.startsWith("/app/requests") &&
      url.searchParams.get("view") === "incoming")
  ) {
    return "supplying";
  }
  if (
    url.pathname.startsWith("/app/buyer") ||
    (url.pathname.startsWith("/app/requests") &&
      url.searchParams.get("view") === "sent")
  ) {
    return "buying";
  }
  return null;
}

export function roleAllowsWorkspace(role: Role, workspace: ActiveWorkspace) {
  return (
    role === "both" ||
    (role === "buyer" && workspace === "buying") ||
    (role === "supplier" && workspace === "supplying")
  );
}

export function destinationAfterAuth(
  user: User,
  options: { returnTo?: string | null; intent?: string | null } = {},
) {
  const requested = safeReturnTo(options.returnTo);
  if (requested) {
    const workspace = workspaceForDestination(requested);
    if (!workspace || roleAllowsWorkspace(user.role, workspace))
      return requested;
  }
  if (
    options.intent === "supplier" &&
    roleAllowsWorkspace(user.role, "supplying")
  ) {
    return "/app/supplier";
  }
  if (options.intent === "buyer" && roleAllowsWorkspace(user.role, "buying")) {
    return "/app/buyer";
  }
  return user.activeWorkspace === "supplying" ? "/app/supplier" : "/app/buyer";
}
