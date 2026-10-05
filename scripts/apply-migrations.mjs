// Menerapkan file di supabase/migrations ke database lewat pooler Supabase.
// Pakai: node scripts/apply-migrations.mjs   (butuh SUPABASE_DB_PASSWORD di .env.local; `npm i --no-save pg`)
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
const ref = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
const hosts = ["aws-1-ap-southeast-1.pooler.supabase.com", "aws-0-ap-southeast-1.pooler.supabase.com"];

let client;
for (const host of hosts) {
  const c = new pg.Client({ host, port: 5432, user: `postgres.${ref}`, password: env.SUPABASE_DB_PASSWORD, database: "postgres", ssl: { rejectUnauthorized: false } });
  try {
    await c.connect();
    client = c;
    break;
  } catch (e) {
    console.log(`Gagal ${host}: ${e.message}`);
  }
}
if (!client) process.exit(1);

await client.query("create table if not exists public._migrations (name text primary key, applied_at timestamptz default now())");
const dir = "supabase/migrations";
for (const f of readdirSync(dir).filter((x) => x.endsWith(".sql")).sort()) {
  const done = await client.query("select 1 from public._migrations where name=$1", [f]);
  if (done.rowCount) { console.log("lewati", f); continue; }
  await client.query("begin");
  try {
    await client.query(readFileSync(join(dir, f), "utf8"));
    await client.query("insert into public._migrations(name) values ($1)", [f]);
    await client.query("commit");
    console.log("diterapkan", f);
  } catch (e) {
    await client.query("rollback");
    console.error("GAGAL", f, e.message);
    process.exit(1);
  }
}
await client.end();
