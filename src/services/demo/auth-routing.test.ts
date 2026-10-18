import { describe, expect, it } from "vitest";

import type { User } from "@/domain/types";
import {
  destinationAfterAuth,
  safeReturnTo,
  workspaceForDestination,
} from "@/services/demo/auth-routing";

const buyer: User = {
  id: "buyer",
  displayName: "Buyer",
  email: "buyer@example.test",
  role: "buyer",
  activeWorkspace: "buying",
  isDemo: true,
};

describe("demo auth routing", () => {
  it("preserves a safe material return path", () => {
    expect(
      destinationAfterAuth(buyer, {
        returnTo: "/app/materials/sample-1?request=1",
      }),
    ).toBe("/app/materials/sample-1?request=1");
  });

  it("rejects external and malformed return paths", () => {
    expect(safeReturnTo("https://example.com/app")).toBeNull();
    expect(safeReturnTo("//example.com/app")).toBeNull();
    expect(safeReturnTo("/app\\example.com")).toBeNull();
    expect(safeReturnTo("/login")).toBeNull();
  });

  it("does not send a buyer into a supplier-only return path", () => {
    expect(destinationAfterAuth(buyer, { returnTo: "/app/listings/new" })).toBe(
      "/app/buyer",
    );
  });

  it("detects workspace from protected destinations", () => {
    expect(workspaceForDestination("/app/requests?view=incoming")).toBe(
      "supplying",
    );
    expect(workspaceForDestination("/app/requests?view=sent")).toBe("buying");
  });
});
