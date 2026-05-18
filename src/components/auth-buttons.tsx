"use client";

import { signIn, signOut } from "next-auth/react";

type Props = {
  authenticated: boolean;
  provider?: "discord" | "mock";
  mockUserId?: string;
  mockDisplayLabel?: string;
};

export function AuthButtons({
  authenticated,
  provider = "discord",
  mockUserId = "mock-owner",
  mockDisplayLabel = "patodomau",
}: Props) {
  if (authenticated) {
    return (
      <button
        className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-stone-200 transition hover:border-amber-500 hover:text-amber-300"
        onClick={() => signOut({ callbackUrl: "/sign-in" })}
        type="button"
      >
        Sign out
      </button>
    );
  }

  return (
    <button
      className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-amber-400"
      onClick={() => {
        if (provider === "mock") {
          void signIn("credentials", {
            userId: mockUserId,
            name: mockDisplayLabel,
            callbackUrl: "/",
          });
          return;
        }

        void signIn("discord", { callbackUrl: "/" });
      }}
      type="button"
    >
      {provider === "mock" ? "Enter mock dashboard" : "Sign in with Discord"}
    </button>
  );
}
