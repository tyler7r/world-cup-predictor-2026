import { neon } from "@neondatabase/serverless";
import PoolEntryPage from "./PoolComponent";

export const dynamic = "force-dynamic";

// Server-side fetch
export default async function PoolContainer() {
  const sql = neon(process.env.DATABASE_URL!);
  const result =
    (await sql`SELECT COUNT(DISTINCT id) as count, sum(additional_support) as additional_support FROM users WHERE entered_pool = true`) as {
      count: number;
      additional_support: number;
    }[];

  return <PoolEntryPage poolEntries={result[0]} />;
}
