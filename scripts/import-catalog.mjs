import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { neon } from "@neondatabase/serverless";

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workspaceDir = resolve(appDir, "..");
const importPath = resolve(workspaceDir, "WIP", "greenhouse-catalog-import.json");

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const payload = JSON.parse(await readFile(importPath, "utf8"));
const sql = neon(requireEnv("DATABASE_URL"));

const snapshotRows = await sql`
  insert into greenhouse.plant_inventory_snapshots (
    source_csv,
    note
  )
  values (
    ${payload.snapshot.sourceCsv},
    ${payload.snapshot.note}
  )
  returning id
`;

const snapshotId = snapshotRows[0].id;

for (const variety of payload.plantVarieties) {
  await sql`
    insert into greenhouse.plant_varieties (
      graphic_id,
      label,
      name,
      source_text,
      origin,
      origin_rank,
      origin_tone,
      seed_hue,
      special_hue,
      image_path,
      first_seen_at,
      last_seen_at
    )
    values (
      ${variety.graphicId},
      ${variety.label},
      ${variety.name},
      ${variety.sourceText},
      ${variety.origin},
      ${variety.originRank},
      ${variety.originTone},
      ${variety.seedHue},
      ${variety.specialHue || null},
      ${variety.imagePath || null},
      now(),
      now()
    )
    on conflict (graphic_id, label) do update
    set name = excluded.name,
        source_text = excluded.source_text,
        origin = excluded.origin,
        origin_rank = excluded.origin_rank,
        origin_tone = excluded.origin_tone,
        seed_hue = excluded.seed_hue,
        special_hue = excluded.special_hue,
        image_path = excluded.image_path,
        last_seen_at = now()
  `;
}

for (const entry of payload.inventoryEntries) {
  await sql`
    insert into greenhouse.plant_inventory_entries (
      snapshot_id,
      serial,
      container_serial,
      run_number,
      graphic_id,
      label,
      quantity
    )
    values (
      ${snapshotId},
      ${entry.serial},
      ${entry.containerSerial},
      ${entry.run},
      ${entry.graphicId},
      ${entry.label},
      ${entry.quantity}
    )
    on conflict (snapshot_id, serial) do nothing
  `;
}

for (const variety of payload.unknownVarieties) {
  await sql`
    insert into greenhouse.plant_discovery_queue (
      graphic_id,
      label,
      source,
      status,
      note
    )
    values (
      ${variety.graphicId},
      ${variety.label ?? null},
      'catalog-import',
      'new',
      'Imported from Greenhouse catalog payload'
    )
    on conflict do nothing
  `;
}

console.log(`Snapshot: ${snapshotId}`);
console.log(`Varieties upserted: ${payload.plantVarieties.length}`);
console.log(`Inventory entries inserted: ${payload.inventoryEntries.length}`);
console.log(`Discovery queue candidates: ${payload.unknownVarieties.length}`);
