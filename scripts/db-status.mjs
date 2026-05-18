import { neon } from "@neondatabase/serverless";

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const sql = neon(requireEnv("DATABASE_URL"));

const [counts] = await sql`
  select
    (select count(*)::integer from greenhouse.plant_varieties) as varieties,
    (select count(*)::integer from greenhouse.plant_inventory_snapshots) as snapshots,
    (select count(*)::integer from greenhouse.plant_inventory_entries) as inventory_entries,
    (select count(*)::integer from greenhouse.plant_collection_current) as current_varieties,
    (select coalesce(sum(quantity), 0)::integer from greenhouse.plant_collection_current) as current_plants,
    (select count(*)::integer from greenhouse.plant_discovery_queue where status = 'new') as new_discoveries
`;

console.log(JSON.stringify(counts, null, 2));
