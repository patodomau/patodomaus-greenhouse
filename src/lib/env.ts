import bootstrapAuthorizedUsers from "@/data/bootstrap-authorized-users.json";

function readEnv(name: string) {
  const value = process.env[name];
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function requireEnv(name: string) {
  const value = readEnv(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function optionalEnv(name: string) {
  return readEnv(name);
}

export function isEnvFlagEnabled(name: string) {
  const value = readEnv(name);
  if (!value) {
    return false;
  }

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

type AuthorizedDiscordUser = {
  id: string;
  displayLabel: string;
  role: "owner" | "admin" | "viewer";
};

const AUTHORIZED_USER_ROLES = new Set(["owner", "admin", "viewer"]);

const HARDCODED_AUTHORIZED_DISCORD_USERS: AuthorizedDiscordUser[] = bootstrapAuthorizedUsers.map(
  (user) => ({
    id: user.id,
    displayLabel: user.displayLabel,
    role: AUTHORIZED_USER_ROLES.has(user.role)
      ? (user.role as AuthorizedDiscordUser["role"])
      : "viewer",
  }),
);

function normalizeDiscordId(value: string) {
  return value.trim();
}

export function getHardcodedAuthorizedDiscordUsers() {
  return HARDCODED_AUTHORIZED_DISCORD_USERS;
}

export function getAuthorizedDiscordIds() {
  const ids: string[] = [];
  const seen = new Set<string>();

  for (const user of HARDCODED_AUTHORIZED_DISCORD_USERS) {
    const normalized = normalizeDiscordId(user.id);
    if (normalized === "" || seen.has(normalized)) {
      continue;
    }

    ids.push(normalized);
    seen.add(normalized);
  }

  const raw = optionalEnv("AUTHORIZED_DISCORD_IDS");
  if (!raw) {
    return ids;
  }

  for (const value of raw.split(",")) {
    const normalized = normalizeDiscordId(value);
    if (normalized === "" || seen.has(normalized)) {
      continue;
    }

    ids.push(normalized);
    seen.add(normalized);
  }

  return ids;
}

export function getAuthorizedDiscordDisplayLabel(discordUserId: string) {
  const normalized = normalizeDiscordId(discordUserId);
  if (normalized === "") {
    return null;
  }

  const hardcodedUser = HARDCODED_AUTHORIZED_DISCORD_USERS.find((user) => user.id === normalized);
  return hardcodedUser?.displayLabel ?? null;
}

export function isDiscordIdPreAuthorized(discordUserId: string) {
  const normalized = normalizeDiscordId(discordUserId);
  if (normalized === "") {
    return false;
  }

  return getAuthorizedDiscordIds().includes(normalized);
}
