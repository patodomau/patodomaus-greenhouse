import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-6 py-12">
      <section className="w-full rounded-lg border border-rose-400/20 bg-[#111722]/88 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-300">
          Acesso negado
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-stone-100">
          Sua conta do Discord nao esta na allowlist.
        </h1>
        <p className="mt-4 text-lg leading-8 text-stone-400">
          Adicione o ID do usuario do Discord na allowlist primeiro e tente novamente.
        </p>
        <Link
          className="mt-8 inline-flex rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-stone-200 transition hover:border-amber-500 hover:text-amber-300"
          href="/sign-in"
        >
          Voltar para o login
        </Link>
      </section>
    </main>
  );
}
