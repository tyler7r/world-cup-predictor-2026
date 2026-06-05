import { neon } from "@neondatabase/serverless";
import PoolEntryPage from "./PoolComponent";

// Server-side fetch
export default async function PoolContainer() {
  const sql = neon(process.env.DATABASE_URL!);
  const result =
    (await sql`SELECT COUNT(DISTINCT id) as count FROM users WHERE entered_pool = true`) as {
      count: number;
    }[];

  return <PoolEntryPage poolEntries={result[0]} />;
}
