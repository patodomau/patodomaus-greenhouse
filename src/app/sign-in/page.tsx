import { redirect } from "next/navigation";
import { AuthButtons } from "@/components/auth-buttons";
import { getAuthSession, isMockAuthEnabled } from "@/lib/auth";
import { getAuthorizedDiscordDisplayLabel, getAuthorizedDiscordIds } from "@/lib/env";

export default async function SignInPage() {
  const session = await getAuthSession();
  if (session?.user?.discordId) {
    redirect("/");
  }

  const mockMode = isMockAuthEnabled();
  const mockUserId = getAuthorizedDiscordIds()[0] ?? "mock-owner";
  const mockDisplayLabel = getAuthorizedDiscordDisplayLabel(mockUserId) ?? "patodomau";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-12">
      <section className="grid w-full max-w-4xl gap-8 rounded-lg border border-white/10 bg-[#0f1722]/88 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur sm:p-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-300">
            Patodomau&apos;s Greenhouse
          </p>
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-stone-100 sm:text-5xl">
            Catalogo privado das plantas coletadas no Outlands.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-stone-400">
            O acesso usa a mesma allowlist por Discord ID da Padaria. Depois do login,
            o painel abre a colecao por sprite, origem e quantidade.
          </p>
          {mockMode ? (
            <p className="inline-flex w-fit rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
              Auth mock habilitado
            </p>
          ) : null}
        </div>

        <div className="rounded-lg border border-amber-400/20 bg-[linear-gradient(180deg,rgba(35,27,14,0.9),rgba(21,24,31,0.92))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">
              Acesso
            </p>
            <h2 className="text-2xl font-semibold text-stone-100">Greenhouse somente leitura</h2>
            <p className="text-sm leading-7 text-stone-400">
              {mockMode
                ? "Este ambiente usa login mock local para validar o fluxo sem depender de um app real no Discord."
                : "A aplicacao so permite contas de Discord pre-autorizadas na allowlist."}
            </p>
            <AuthButtons
              authenticated={false}
              mockUserId={mockUserId}
              mockDisplayLabel={mockDisplayLabel}
              provider={mockMode ? "mock" : "discord"}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
