import "server-only";

import { neon } from "@neondatabase/serverless";
import { optionalEnv } from "@/lib/env";

export type AuthorizedUser = {
  discordUserId: string;
  displayLabel: string;
  role: "owner" | "admin" | "viewer";
  active: boolean;
};

type AuthorizedUserRow = {
  discord_user_id: string;
  display_label: string;
  role: "owner" | "admin" | "viewer";
  active: boolean;
};

export async function getDatabaseAuthorizedUser(discordUserId: string) {
  const databaseUrl = optionalEnv("DATABASE_URL");
  if (!databaseUrl) {
    return { status: "unavailable" as const, user: null };
  }

  try {
    const sql = neon(databaseUrl);
    const rows = (await sql`
      select discord_user_id, display_label, role, active
      from greenhouse.authorized_users
      where discord_user_id = ${discordUserId}
      limit 1
    `) as AuthorizedUserRow[];

    const row = rows[0];
    if (!row) {
      return { status: "ready" as const, user: null };
    }

    return {
      status: "ready" as const,
      user: {
        discordUserId: row.discord_user_id,
        displayLabel: row.display_label,
        role: row.role,
        active: row.active,
      },
    };
  } catch (error) {
    console.error("Failed to load Greenhouse authorized user", error);
    return { status: "error" as const, user: null };
  }
}

export async function touchDatabaseAuthorizedUser(discordUserId: string) {
  const databaseUrl = optionalEnv("DATABASE_URL");
  if (!databaseUrl) {
    return;
  }

  try {
    const sql = neon(databaseUrl);
    await sql`
      update greenhouse.authorized_users
      set last_login_at = now(),
          updated_at = now()
      where discord_user_id = ${discordUserId}
        and active = true
    `;
  } catch (error) {
    console.error("Failed to touch Greenhouse authorized user", error);
  }
}
