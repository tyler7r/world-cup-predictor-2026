// app/api/sync/route.ts
import { neon } from "@neondatabase/serverless";
import axios from "axios";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized request" }, { status: 401 });
  }
  const sql = neon(process.env.DATABASE_URL!);

  try {
    const response = await axios.get(
      `https://${process.env.FOOTBALL_API_HOST}/teams`,
      {
        params: {
          league: "1", // FIFA World Cup
          season: "2026",
        },
        headers: {
          "x-apisports-key": process.env.FOOTBALL_API_KEY,
        },
      },
    );

    const teams = response.data.response;

    for (const team of teams) {
      await sql`
        UPSERT INTO teams (id, name, name_code, flag_url)
        VALUES (
          ${team.team.id}, 
          ${team.team.name},
          ${team.team.code}, 
          ${team.team.logo}
        )
      `;
    }

    return new Response(
      JSON.stringify({ success: true, count: teams.length }),
      { status: 200 },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to sync", message: error }),
      {
        status: 500,
      },
    );
  }
}
