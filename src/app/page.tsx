import { AuthButtons } from "@/components/auth-buttons";
import { PlantCatalog } from "@/components/plant-catalog";
import { requireAuthSession } from "@/lib/auth";
import { getPlantCatalogData } from "@/lib/catalog";

export default async function Home() {
  const session = await requireAuthSession();
  const catalog = await getPlantCatalogData();
  const displayName =
    session.user.displayLabel ?? session.user.name ?? session.user.email ?? session.user.discordId;

  return (
    <main className="mx-auto flex w-full max-w-[1480px] flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="grid gap-5 border border-white/10 bg-[#101723]/88 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.38)] backdrop-blur lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <p className="text-xs font-semibold tracking-[0.32em] text-amber-300 uppercase">
            Patodomau&apos;s Greenhouse
          </p>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-stone-100 sm:text-4xl">
              Colecao viva de plantas do Outlands
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-stone-400 sm:text-base">
              Catalogo privado por sprite ID, com origem, quantidade e imagem extraida do cliente.
              Plantas com o mesmo nome ficam separadas quando usam artes diferentes.
            </p>
          </div>
        </div>

        <aside className="flex flex-col justify-between gap-4 border border-amber-400/20 bg-[linear-gradient(135deg,rgba(38,30,16,0.9),rgba(18,24,34,0.92))] p-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.25em] text-amber-300 uppercase">
              Sessao
            </p>
            <p className="text-sm leading-6 text-stone-300">Conectado como {displayName}</p>
            {session.user.discordId ? (
              <p className="font-mono text-xs text-stone-500">
                Discord ID {session.user.discordId}
              </p>
            ) : null}
          </div>
          <AuthButtons authenticated />
        </aside>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Plantas" value={catalog.summary.totalPlants.toLocaleString("pt-BR")} />
        <MetricCard label="Sprites" value={catalog.summary.varieties.toLocaleString("pt-BR")} />
        <MetricCard label="Nomes" value={catalog.summary.uniqueNames.toLocaleString("pt-BR")} />
        <MetricCard label="Origens" value={catalog.summary.uniqueOrigins.toLocaleString("pt-BR")} />
      </section>

      <PlantCatalog origins={catalog.origins} plants={catalog.plants} />
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border border-white/10 bg-[#121a26]/88 p-4 shadow-[0_18px_42px_rgba(0,0,0,0.26)]">
      <p className="text-xs font-semibold tracking-[0.24em] text-amber-300 uppercase">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-stone-100">{value}</p>
    </article>
  );
}
