import "server-only";

import { neon } from "@neondatabase/serverless";
import {
  plantCatalogSummary as staticSummary,
  plantOrigins as staticOrigins,
  plants as staticPlants,
  type PlantCatalogItem as StaticPlantCatalogItem,
} from "@/data/plants";
import { optionalEnv } from "@/lib/env";

export type PlantCatalogItem = Omit<StaticPlantCatalogItem, "origin"> & {
  origin: string;
};

export type PlantOriginOption = {
  name: string;
  rank: number;
  seedHue: string;
  tone: string;
  count: number;
  varieties: number;
};

export type PlantCatalogData = {
  plants: PlantCatalogItem[];
  origins: PlantOriginOption[];
  summary: {
    totalPlants: number;
    varieties: number;
    uniqueNames: number;
    uniqueOrigins: number;
  };
  source: "database" | "static";
};

type CatalogRow = {
  graphic_id: number;
  label: string;
  name: string;
  source_text: string;
  origin: string;
  origin_rank: number;
  origin_tone: string;
  seed_hue: string;
  special_hue: string | null;
  image_path: string | null;
  quantity: number;
  serials: string[] | null;
  containers: string[] | null;
};

const staticCatalog: PlantCatalogData = {
  plants: staticPlants as PlantCatalogItem[],
  origins: [...staticOrigins],
  summary: staticSummary,
  source: "static",
};

export async function getPlantCatalogData(): Promise<PlantCatalogData> {
  const databaseUrl = optionalEnv("DATABASE_URL");
  if (!databaseUrl) {
    return staticCatalog;
  }

  try {
    const sql = neon(databaseUrl);
    const rows = (await sql`
      with latest_snapshot as (
        select id
        from greenhouse.plant_inventory_snapshots
        order by captured_at desc, id desc
        limit 1
      )
      select
        entry.graphic_id,
        entry.label,
        variety.name,
        variety.source_text,
        variety.origin,
        variety.origin_rank,
        variety.origin_tone,
        variety.seed_hue,
        variety.special_hue,
        variety.image_path,
        sum(entry.quantity)::integer as quantity,
        array_remove(array_agg(entry.serial order by entry.serial), null) as serials,
        array_remove(array_agg(distinct entry.container_serial), null) as containers
      from greenhouse.plant_inventory_entries entry
      join latest_snapshot on latest_snapshot.id = entry.snapshot_id
      join greenhouse.plant_varieties variety
        on variety.graphic_id = entry.graphic_id
        and variety.label = entry.label
      group by
        entry.graphic_id,
        entry.label,
        variety.name,
        variety.source_text,
        variety.origin,
        variety.origin_rank,
        variety.origin_tone,
        variety.seed_hue,
        variety.special_hue,
        variety.image_path
      order by variety.origin_rank, variety.name, entry.graphic_id
    `) as CatalogRow[];

    if (rows.length === 0) {
      return staticCatalog;
    }

    const plants = rows.map((row) => ({
      id: row.graphic_id,
      label: row.label,
      name: row.name,
      sourceText: row.source_text,
      origin: row.origin,
      originRank: row.origin_rank,
      originTone: row.origin_tone,
      seedHue: row.seed_hue,
      specialHue: row.special_hue ?? "",
      quantity: row.quantity,
      serials: row.serials ?? [],
      containers: row.containers ?? [],
      image: row.image_path ?? "",
    }));

    return {
      plants,
      origins: buildOrigins(plants),
      summary: {
        totalPlants: plants.reduce((total, plant) => total + plant.quantity, 0),
        varieties: plants.length,
        uniqueNames: new Set(plants.map((plant) => plant.name)).size,
        uniqueOrigins: new Set(plants.map((plant) => plant.origin)).size,
      },
      source: "database",
    };
  } catch (error) {
    console.error("Failed to load Greenhouse catalog from database", error);
    return staticCatalog;
  }
}

function buildOrigins(plants: PlantCatalogItem[]) {
  const origins = new Map<string, PlantOriginOption>();

  for (const plant of plants) {
    const existing = origins.get(plant.origin);
    if (existing) {
      existing.count += plant.quantity;
      existing.varieties += 1;
      continue;
    }

    origins.set(plant.origin, {
      name: plant.origin,
      rank: plant.originRank,
      seedHue: plant.seedHue,
      tone: plant.originTone,
      count: plant.quantity,
      varieties: 1,
    });
  }

  return [...origins.values()].sort(
    (left, right) => left.rank - right.rank || left.name.localeCompare(right.name),
  );
}
