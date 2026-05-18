import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { neon } from "@neondatabase/serverless";

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const schemaPath = resolve(appDir, "db", "greenhouse-schema.sql");

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function splitSqlStatements(sqlText) {
  return sqlText
    .split(";")
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0)
    .map((statement) => `${statement};`);
}

const sql = neon(requireEnv("DATABASE_URL"));
const schema = await readFile(schemaPath, "utf8");
const statements = splitSqlStatements(schema);

for (const statement of statements) {
  await sql.query(statement);
}

console.log(`Applied ${statements.length} Greenhouse schema statements.`);
