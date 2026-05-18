"use client";

import { useMemo, useState } from "react";
import type { PlantCatalogItem, PlantOriginOption } from "@/lib/catalog";

type Props = {
  plants: PlantCatalogItem[];
  origins: readonly PlantOriginOption[];
};

const toneClasses: Record<string, string> = {
  common: "border-stone-400/35 bg-stone-400/10 text-stone-100",
  uncommon: "border-emerald-400/35 bg-emerald-400/10 text-emerald-100",
  veryRare: "border-sky-400/35 bg-sky-400/10 text-sky-100",
  extremelyRare: "border-amber-300/40 bg-amber-400/10 text-amber-100",
  dungeon: "border-violet-400/40 bg-violet-400/10 text-violet-100",
  event: "border-rose-400/40 bg-rose-400/10 text-rose-100",
  unknown: "border-stone-500/35 bg-stone-500/10 text-stone-200",
};

export function PlantCatalog({ plants, origins }: Props) {
  const [query, setQuery] = useState("");
  const [origin, setOrigin] = useState("all");

  const filteredPlants = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return plants.filter((plant) => {
      const matchesOrigin = origin === "all" || plant.origin === origin;
      const matchesQuery =
        normalizedQuery === "" ||
        plant.name.toLowerCase().includes(normalizedQuery) ||
        plant.label.toLowerCase().includes(normalizedQuery) ||
        String(plant.id).includes(normalizedQuery);

      return matchesOrigin && matchesQuery;
    });
  }, [origin, plants, query]);

  const totalQuantity = filteredPlants.reduce((total, plant) => total + plant.quantity, 0);

  return (
    <section className="space-y-5">
      <div className="grid gap-3 border-y border-white/10 bg-[#0f1722]/80 px-4 py-4 md:grid-cols-[1fr_260px_auto] md:items-end">
        <label className="grid gap-2 text-sm font-medium text-stone-300">
          Buscar
          <input
            className="h-11 rounded-lg border border-white/12 bg-white/5 px-3 text-sm text-stone-100 outline-none focus:border-amber-400"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nome ou ID"
            type="search"
            value={query}
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-stone-300">
          Origem
          <select
            className="h-11 rounded-lg border border-white/12 bg-white/5 px-3 text-sm text-stone-100 outline-none focus:border-amber-400"
            onChange={(event) => setOrigin(event.target.value)}
            value={origin}
          >
            <option value="all">Todas as origens</option>
            {origins.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="text-xs tracking-[0.2em] text-stone-500 uppercase">Resultado</p>
          <p className="mt-1 text-sm font-semibold text-stone-100">
            {filteredPlants.length} sprites, {totalQuantity} plantas
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 px-1">
        <button
          className={`rounded-lg border px-3 py-2 text-xs font-semibold tracking-[0.16em] uppercase ${
            origin === "all"
              ? "border-amber-300/50 bg-amber-400/15 text-amber-100"
              : "border-white/10 bg-white/[0.03] text-stone-400 hover:border-amber-300/40 hover:text-stone-100"
          }`}
          onClick={() => setOrigin("all")}
          type="button"
        >
          Todos
        </button>
        {origins.map((item) => (
          <button
            className={`rounded-lg border px-3 py-2 text-xs font-semibold tracking-[0.16em] uppercase ${
              origin === item.name
                ? "border-amber-300/50 bg-amber-400/15 text-amber-100"
                : "border-white/10 bg-white/[0.03] text-stone-400 hover:border-amber-300/40 hover:text-stone-100"
            }`}
            key={item.name}
            onClick={() => setOrigin(item.name)}
            type="button"
          >
            <span
              className="mr-2 inline-block h-2.5 w-2.5 rounded-sm align-middle"
              style={{ backgroundColor: item.seedHue }}
            />
            {item.name} · {item.count}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filteredPlants.map((plant) => (
          <article
            className="grid min-h-[210px] grid-cols-[88px_1fr] gap-4 rounded-lg border border-white/10 bg-[linear-gradient(180deg,rgba(18,26,38,0.94),rgba(12,17,24,0.96))] p-4 shadow-[0_16px_36px_rgba(0,0,0,0.22)]"
            key={`${plant.id}-${plant.label}`}
          >
            <div className="flex h-28 w-20 items-center justify-center rounded-lg border border-white/10 bg-[#080d12]">
              {plant.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt=""
                  className="max-h-[104px] max-w-[72px] object-contain [image-rendering:pixelated]"
                  src={plant.image}
                />
              ) : (
                <span className="text-xs text-stone-600">sem sprite</span>
              )}
            </div>

            <div className="min-w-0 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-base leading-6 font-semibold break-words text-stone-100">
                    {plant.name}
                  </h2>
                  <p className="mt-1 font-mono text-xs text-stone-500">ID {plant.id}</p>
                </div>
                <p className="rounded-lg border border-amber-300/30 bg-amber-400/10 px-2.5 py-1 text-sm font-semibold text-amber-100">
                  x{plant.quantity}
                </p>
              </div>

              <div
                className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                  toneClasses[plant.originTone] ?? toneClasses.unknown
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: plant.seedHue }}
                />
                {plant.origin}
              </div>

              <div className="space-y-1 text-xs leading-5 text-stone-400">
                <p>{plant.sourceText}</p>
                {plant.specialHue ? <p className="text-amber-200">{plant.specialHue}</p> : null}
                <p>{plant.containers.length} container(s)</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
