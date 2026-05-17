import "server-only";

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import DiscordProvider from "next-auth/providers/discord";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import {
  getAuthorizedDiscordDisplayLabel,
  getAuthorizedDiscordIds,
  isEnvFlagEnabled,
  isDiscordIdPreAuthorized,
  optionalEnv,
  requireEnv,
} from "@/lib/env";

function isMockAuthEnabled() {
  return isEnvFlagEnabled("MOCK_AUTH");
}

function resolveSecret() {
  return (
    optionalEnv("NEXTAUTH_SECRET") ??
    optionalEnv("AUTH_SECRET") ??
    (isMockAuthEnabled() ? "mock-dev-secret-do-not-use-in-production" : requireEnv("AUTH_SECRET"))
  );
}

function buildProviders() {
  if (isMockAuthEnabled()) {
    return [
      CredentialsProvider({
        name: "Mock Login",
        credentials: {
          userId: { label: "User ID", type: "text" },
          name: { label: "Name", type: "text" },
        },
        async authorize(credentials) {
          const fallbackUserId = getAuthorizedDiscordIds()[0] ?? "mock-owner";
          const userId =
            typeof credentials?.userId === "string" && credentials.userId.trim() !== ""
              ? credentials.userId.trim()
              : fallbackUserId;
          const requestedName =
            typeof credentials?.name === "string" && credentials.name.trim() !== ""
              ? credentials.name.trim()
              : "patodomau";
          const displayLabel = getAuthorizedDiscordDisplayLabel(userId);
          const name = displayLabel ?? requestedName;

          if (!isDiscordIdPreAuthorized(userId)) {
            return null;
          }

          return {
            id: userId,
            name,
            email: `${userId}@mock.local`,
          };
        },
      }),
    ];
  }

  return [
    DiscordProvider({
      clientId: requireEnv("DISCORD_CLIENT_ID"),
      clientSecret: requireEnv("DISCORD_CLIENT_SECRET"),
      authorization: {
        params: {
          scope: "identify email",
        },
      },
    }),
  ];
}

export const authOptions: NextAuthOptions = {
  secret: resolveSecret(),
  providers: buildProviders(),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "credentials" && isMockAuthEnabled()) {
        return true;
      }

      const discordId =
        account?.providerAccountId ?? (profile && "id" in profile ? String(profile.id) : null);

      if (!discordId) {
        return "/unauthorized";
      }

      if (!isDiscordIdPreAuthorized(discordId)) {
        return "/unauthorized";
      }

      return true;
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === "credentials") {
        token.discordId =
          typeof token.sub === "string" && token.sub.trim() !== ""
            ? token.sub
            : "mock-owner";
      } else if (account?.provider === "discord" && account.providerAccountId) {
        token.discordId = account.providerAccountId;
      } else if (!token.discordId && profile && "id" in profile) {
        token.discordId = String(profile.id);
      }

      if (typeof token.discordId === "string" && token.discordId.trim() !== "") {
        token.displayLabel = getAuthorizedDiscordDisplayLabel(token.discordId) ?? undefined;
        if (token.displayLabel) {
          token.name = token.displayLabel;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.discordId = token.discordId;
        session.user.displayLabel = token.displayLabel;

        if (token.displayLabel) {
          session.user.name = token.displayLabel;
        } else if (!session.user.name && typeof token.name === "string") {
          session.user.name = token.name;
        }
      }

      return session;
    },
  },
};

export async function getAuthSession() {
  return getServerSession(authOptions);
}

export async function requireAuthSession() {
  const session = await getAuthSession();
  if (!session?.user?.discordId) {
    redirect("/sign-in");
  }

  return session;
}

export { isMockAuthEnabled };
