import type { ActiveWorkspace, Role, User } from "@/domain/types";
import { getDemoDatabase } from "@/lib/demo-db";
import type { SessionService } from "@/services/repositories";
import { DEMO_PASSWORD, DEMO_USERS } from "@/services/demo/demo-identities";

export class DemoSessionError extends Error {
  constructor(
    message: string,
    readonly code:
      | "invalid_credentials"
      | "profile_exists"
      | "profile_not_found"
      | "no_session"
      | "workspace_not_allowed",
  ) {
    super(message);
    this.name = "DemoSessionError";
  }
}

class BrowserDemoSessionService implements SessionService {
  private async seedIdentities() {
    const database = getDemoDatabase();
    await database.transaction("rw", database.users, async () => {
      for (const user of DEMO_USERS) {
        const existing = await database.users.get(user.id);
        if (!existing) await database.users.add({ ...user });
      }
    });
  }

  async getCurrentUser() {
    await this.seedIdentities();
    const database = getDemoDatabase();
    const session = await database.sessions.get("current");
    if (!session) return null;
    const user = await database.users.get(session.userId);
    if (!user) {
      await database.sessions.delete("current");
      return null;
    }
    return user;
  }

  async getUserById(userId: string) {
    await this.seedIdentities();
    const database = getDemoDatabase();
    const user = await database.users.get(userId);
    return user ?? null;
  }

  async loginDemo(userId: string) {
    await this.seedIdentities();
    const database = getDemoDatabase();
    const user = await database.users.get(userId);
    if (!user) {
      throw new DemoSessionError(
        "That demo profile is unavailable.",
        "profile_not_found",
      );
    }
    await database.sessions.put({
      id: "current",
      userId: user.id,
      updatedAt: new Date().toISOString(),
    });
    return user;
  }

  async loginWithDemoCredentials(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const seedUser = DEMO_USERS.find((user) => user.email === normalizedEmail);
    if (!seedUser || password !== DEMO_PASSWORD) {
      throw new DemoSessionError(
        "Those details do not match a WoodLoop seed profile. Try a demo profile below.",
        "invalid_credentials",
      );
    }
    return this.loginDemo(seedUser.id);
  }

  async createLocalProfile(input: {
    displayName: string;
    email: string;
    role: Role;
    activeWorkspace: ActiveWorkspace;
  }) {
    await this.seedIdentities();
    const database = getDemoDatabase();
    const email = input.email.trim().toLowerCase();
    if (await database.users.where("email").equals(email).first()) {
      throw new DemoSessionError(
        "A local demo profile already uses this email on this device.",
        "profile_exists",
      );
    }
    const user: User = {
      id: `local-${crypto.randomUUID()}`,
      displayName: input.displayName.trim(),
      email,
      role: input.role,
      activeWorkspace: input.activeWorkspace,
      isDemo: true,
    };
    await database.transaction(
      "rw",
      database.users,
      database.sessions,
      async () => {
        await database.users.add(user);
        await database.sessions.put({
          id: "current",
          userId: user.id,
          updatedAt: new Date().toISOString(),
        });
      },
    );
    return user;
  }

  async logout() {
    await getDemoDatabase().sessions.delete("current");
  }

  async setWorkspace(workspace: ActiveWorkspace) {
    const database = getDemoDatabase();
    const session = await database.sessions.get("current");
    if (!session) {
      throw new DemoSessionError("No active demo session.", "no_session");
    }
    const user = await database.users.get(session.userId);
    if (!user) {
      throw new DemoSessionError(
        "The active demo profile was not found.",
        "profile_not_found",
      );
    }
    if (
      (workspace === "buying" && user.role === "supplier") ||
      (workspace === "supplying" && user.role === "buyer")
    ) {
      throw new DemoSessionError(
        "This profile does not have access to that workspace.",
        "workspace_not_allowed",
      );
    }
    await database.users.update(user.id, { activeWorkspace: workspace });
  }
}

export const demoSessionService = new BrowserDemoSessionService();
