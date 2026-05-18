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

const dungeonSeedMeta: Record<string, { color: string; hue?: number; rank: number }> = {
  "Aegis Keep Seed": { color: "#AC2929", hue: 1779, rank: 10 },
  "Cavernam Seed": { color: "#FFFFFF", hue: 2338, rank: 20 },
  "Darkmire Temple Seed": { color: "#629431", hue: 2099, rank: 30 },
  "Inferno Seed": { color: "#F6BD00", hue: 1909, rank: 40 },
  "Kraul Hive Seed": { color: "#F6EEE6", hue: 2841, rank: 50 },
  "Mausoleum Seed": { color: "#6A6AA4", hue: 2092, rank: 60 },
  "Mount Petram Seed": { color: "#9C9C9C", hue: 2089, rank: 70 },
  "Netherzone Seed": { color: "#FFFFEE", hue: 1500, rank: 80 },
  "Nusero Seed": { color: "#FFEECD", hue: 2796, rank: 90 },
  "Ocean Seed": { color: "#418B94", hue: 1183, rank: 100 },
  "Ossuary Seed": { color: "#FFF6AC", hue: 2091, rank: 110 },
  "Pulma Seed": { color: "#20BDFF", hue: 2085, rank: 120 },
  "Shadowspire Cathedral Seed": { color: "#200000", hue: 2093, rank: 130 },
  "Tidal Tomb Seed": { color: "#E6B4AC", hue: 1688, rank: 140 },
  "Time Seed": { color: "#FFF6FF", hue: 2659, rank: 150 },
  "Wilderness Seed": { color: "#4AA44A", hue: 1182, rank: 160 },
  "Unknown Dungeon Seed": { color: "#9B9286", rank: 999 },
};

const dungeonSeedByPlantName: Record<string, string> = {
  amaranthus: "Aegis Keep Seed",
  "amethyst plant": "Mount Petram Seed",
  "barrel cactus": "Ossuary Seed",
  "bramble vine": "Wilderness Seed",
  "bumble pod": "Kraul Hive Seed",
  bromeliad: "Aegis Keep Seed",
  "cage fungus": "Aegis Keep Seed",
  "chandelier tulip": "Mount Petram Seed",
  "crystal of the valley": "Time Seed",
  deathbloom: "Mausoleum Seed",
  "dragon flower": "Nusero Seed",
  "dragon tree": "Nusero Seed",
  "dragon's breath": "Time Seed",
  "dragonfruit plant": "Nusero Seed",
  "ember blossom": "Inferno Seed",
  firegrass: "Inferno Seed",
  flamelick: "Inferno Seed",
  "frost blossom": "Cavernam Seed",
  "ghost cactus": "Ossuary Seed",
  "giant cattail": "Wilderness Seed",
  "giant lilypad": "Pulma Seed",
  "golden poppies": "Ossuary Seed",
  "grave urchin": "Tidal Tomb Seed",
  grasper: "Mausoleum Seed",
  "hanging bulb": "Darkmire Temple Seed",
  "heart blossom": "Time Seed",
  "hornet flower": "Kraul Hive Seed",
  horrorvine: "Kraul Hive Seed",
  "ice flower": "Cavernam Seed",
  mandragora: "Netherzone Seed",
  netherblossom: "Netherzone Seed",
  netherbramble: "Netherzone Seed",
  "nightshade plant": "Shadowspire Cathedral Seed",
  "ocean kelp": "Ocean Seed",
  "octopus plant": "Pulma Seed",
  oleander: "Shadowspire Cathedral Seed",
  "pearl orchid": "Tidal Tomb Seed",
  "pitcher plant": "Darkmire Temple Seed",
  rafflesia: "Mausoleum Seed",
  "red pearl fern": "Kraul Hive Seed",
  "redvein pothos": "Ocean Seed",
  "sea grapes": "Ocean Seed",
  "serpent fern": "Tidal Tomb Seed",
  "shrinking violet": "Mount Petram Seed",
  "tentacle plant": "Pulma Seed",
  "toad shade": "Darkmire Temple Seed",
  tundradrops: "Cavernam Seed",
  "void bloom": "Time Seed",
  "wild crocus": "Wilderness Seed",
  "witch iris": "Shadowspire Cathedral Seed",
};

export function PlantCatalog({ plants, origins }: Props) {
  const [query, setQuery] = useState("");
  const [origin, setOrigin] = useState("all");
  const [dungeonSeed, setDungeonSeed] = useState("all");
  const [dungeonMenuOpen, setDungeonMenuOpen] = useState(false);

  const dungeonOptions = useMemo(() => {
    const groups = new Map<string, number>();

    for (const plant of plants) {
      if (plant.origin !== "Dungeon Seed") {
        continue;
      }

      const seed = getDungeonSeedName(plant);
      groups.set(seed, (groups.get(seed) ?? 0) + 1);
    }

    return [...groups.entries()]
      .map(([name, varieties]) => ({ name, varieties }))
      .sort((left, right) => getDungeonSeedRank(left.name) - getDungeonSeedRank(right.name));
  }, [plants]);

  const filteredPlants = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return plants.filter((plant) => {
      const matchesOrigin = origin === "all" || plant.origin === origin;
      const matchesDungeonSeed =
        origin !== "Dungeon Seed" ||
        dungeonSeed === "all" ||
        getDungeonSeedName(plant) === dungeonSeed;
      const matchesQuery =
        normalizedQuery === "" ||
        plant.name.toLowerCase().includes(normalizedQuery) ||
        plant.label.toLowerCase().includes(normalizedQuery) ||
        String(plant.id).includes(normalizedQuery);

      return matchesOrigin && matchesDungeonSeed && matchesQuery;
    });
  }, [dungeonSeed, origin, plants, query]);

  const totalQuantity = filteredPlants.reduce((total, plant) => total + plant.quantity, 0);
  const dungeonOrigin = origins.find((item) => item.name === "Dungeon Seed");

  return (
    <section className="space-y-5">
      <div className="grid gap-3 rounded-lg border border-white/10 bg-[#0f1722]/80 px-4 py-4 shadow-[0_16px_36px_rgba(0,0,0,0.18)] md:grid-cols-[1fr_260px_260px]">
        <label className="grid gap-2 text-sm font-medium text-stone-300">
          Search
          <input
            className="h-11 rounded-lg border border-white/12 bg-white/5 px-3 text-sm text-stone-100 outline-none focus:border-amber-400"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name or ID"
            type="search"
            value={query}
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-stone-300">
          Origin
          <select
            className="h-11 rounded-lg border border-white/12 bg-[#111925] px-3 text-sm text-stone-100 outline-none focus:border-amber-400"
            onChange={(event) => {
              const nextOrigin = event.target.value;
              setOrigin(nextOrigin);
              if (nextOrigin !== "Dungeon Seed") {
                setDungeonSeed("all");
                setDungeonMenuOpen(false);
              }
            }}
            value={origin}
          >
            <option value="all">All origins</option>
            {origins.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-2 text-sm font-medium text-stone-300">
          Result
          <p className="flex h-11 items-center rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm font-semibold text-stone-100">
            {filteredPlants.length} sprites, {totalQuantity} plants
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
          onClick={() => {
            setOrigin("all");
            setDungeonSeed("all");
            setDungeonMenuOpen(false);
          }}
          type="button"
        >
          All - {plants.length}
        </button>

        {origins.map((item) =>
          item.name === "Dungeon Seed" ? (
            <div className="relative" key={item.name}>
              <button
                className={`rounded-lg border px-3 py-2 text-xs font-semibold tracking-[0.16em] uppercase ${
                  origin === item.name
                    ? "border-amber-300/50 bg-amber-400/15 text-amber-100"
                    : "border-white/10 bg-white/[0.03] text-stone-400 hover:border-amber-300/40 hover:text-stone-100"
                }`}
                onClick={() => {
                  setOrigin("Dungeon Seed");
                  setDungeonMenuOpen((current) => !current);
                }}
                type="button"
              >
                <span
                  className="mr-2 inline-block h-2.5 w-2.5 rounded-sm align-middle"
                  style={{ backgroundColor: item.seedHue }}
                />
                Dungeon Seed - {item.varieties}
              </button>

              {dungeonMenuOpen ? (
                <div className="absolute left-0 z-20 mt-2 grid min-w-64 gap-1 rounded-lg border border-white/10 bg-[#101723] p-2 shadow-[0_18px_44px_rgba(0,0,0,0.38)]">
                  <button
                    className={`rounded-md px-3 py-2 text-left text-xs font-semibold tracking-[0.12em] uppercase ${
                      dungeonSeed === "all"
                        ? "bg-amber-400/15 text-amber-100"
                        : "text-stone-300 hover:bg-white/5"
                    }`}
                    onClick={() => {
                      setOrigin("Dungeon Seed");
                      setDungeonSeed("all");
                      setDungeonMenuOpen(false);
                    }}
                    type="button"
                  >
                    All Dungeon Seeds - {dungeonOrigin?.varieties ?? 0}
                  </button>
                  {dungeonOptions.map((option) => (
                    <button
                      className={`rounded-md px-3 py-2 text-left text-xs font-semibold tracking-[0.12em] uppercase ${
                        dungeonSeed === option.name
                          ? "bg-amber-400/15 text-amber-100"
                          : "text-stone-300 hover:bg-white/5"
                      }`}
                      key={option.name}
                      onClick={() => {
                        setOrigin("Dungeon Seed");
                        setDungeonSeed(option.name);
                        setDungeonMenuOpen(false);
                      }}
                      type="button"
                    >
                      {option.name} - {option.varieties}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <button
              className={`rounded-lg border px-3 py-2 text-xs font-semibold tracking-[0.16em] uppercase ${
                origin === item.name
                  ? "border-amber-300/50 bg-amber-400/15 text-amber-100"
                  : "border-white/10 bg-white/[0.03] text-stone-400 hover:border-amber-300/40 hover:text-stone-100"
              }`}
              key={item.name}
              onClick={() => {
                setOrigin(item.name);
                setDungeonSeed("all");
                setDungeonMenuOpen(false);
              }}
              type="button"
            >
              <span
                className="mr-2 inline-block h-2.5 w-2.5 rounded-sm align-middle"
                style={{ backgroundColor: item.seedHue }}
              />
              {item.name} - {item.varieties}
            </button>
          ),
        )}
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
                <span className="text-xs text-stone-600">no sprite</span>
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

              <div className="flex flex-wrap gap-2">
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

                {plant.origin === "Dungeon Seed" ? (
                  <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-semibold text-stone-200">
                    <span
                      className="h-2.5 w-2.5 rounded-sm"
                      style={{ backgroundColor: getDungeonSeedColor(plant) }}
                      title={getDungeonSeedHueLabel(plant)}
                    />
                    {getDungeonSeedName(plant)}
                  </div>
                ) : null}
              </div>

              <div className="space-y-1 text-xs leading-5 text-stone-400">
                <p>{formatSourceText(plant.sourceText)}</p>
                {plant.specialHue ? <p className="text-amber-200">{plant.specialHue}</p> : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function getDungeonSeedName(plant: PlantCatalogItem) {
  return dungeonSeedByPlantName[normalizePlantName(plant.name)] ?? "Unknown Dungeon Seed";
}

function getDungeonSeedColor(plant: PlantCatalogItem) {
  return (
    dungeonSeedMeta[getDungeonSeedName(plant)]?.color ??
    dungeonSeedMeta["Unknown Dungeon Seed"].color
  );
}

function getDungeonSeedHueLabel(plant: PlantCatalogItem) {
  const hue = dungeonSeedMeta[getDungeonSeedName(plant)]?.hue;
  return hue ? `Hue ${hue}` : "Unknown hue";
}

function getDungeonSeedRank(seedName: string) {
  return dungeonSeedMeta[seedName]?.rank ?? dungeonSeedMeta["Unknown Dungeon Seed"].rank;
}

function normalizePlantName(name: string) {
  return name
    .toLowerCase()
    .replace(/^(a|an|the)\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatSourceText(sourceText: string) {
  if (sourceText === "unknown") {
    return "Unknown";
  }

  return sourceText.replace(/\b\w/g, (character) => character.toUpperCase());
}
