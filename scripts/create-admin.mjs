// Membuat admin pertama lewat Supabase Auth Admin API (bukan formulir publik).
// Pakai: node scripts/create-admin.mjs <email> <password-sementara>
import { readFileSync } from "node:fs";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";

const [email, password] = process.argv.slice(2);
if (!email || !password) throw new Error("Pakai: node scripts/create-admin.mjs <email> <password>");

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { full_name: "Admin Ibra Jaya" },
});
if (error) throw error;

const ref = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
const db = new pg.Client({ host: "aws-0-ap-southeast-1.pooler.supabase.com", port: 5432, user: `postgres.${ref}`, password: env.SUPABASE_DB_PASSWORD, database: "postgres", ssl: { rejectUnauthorized: false } });
await db.connect();
await db.query("update public.profiles set role='admin' where id=$1", [data.user.id]);
await db.end();
console.log("Admin dibuat:", email);
