import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { neon } from "@neondatabase/serverless";

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const usersPath = resolve(appDir, "src", "data", "bootstrap-authorized-users.json");

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const users = JSON.parse(await readFile(usersPath, "utf8"));
const sql = neon(requireEnv("DATABASE_URL"));

for (const user of users) {
  await sql`
    insert into greenhouse.authorized_users (
      discord_user_id,
      display_label,
      role,
      active,
      created_at,
      updated_at
    )
    values (
      ${user.id},
      ${user.displayLabel},
      ${user.role},
      true,
      now(),
      now()
    )
    on conflict (discord_user_id) do update
    set display_label = excluded.display_label,
        role = excluded.role,
        active = true,
        updated_at = now()
  `;
}

console.log(`Seeded ${users.length} Greenhouse authorized users.`);
