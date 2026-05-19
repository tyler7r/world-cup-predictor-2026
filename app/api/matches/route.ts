// app/api/sync/route.ts
import { neon } from "@neondatabase/serverless";
import axios from "axios";

export async function GET() {
  const sql = neon(process.env.DATABASE_URL!);

  try {
    const response = await axios.get(
      `https://${process.env.FOOTBALL_API_HOST}/fixtures`,
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

    const matches = response.data.response;

    console.log(matches[0]);

    for (const match of matches) {
      await sql`
        INSERT INTO matches (api_fixture_id, home_team_id, away_team_id, kickoff_time, stage)
        VALUES (
          ${match.fixture.id}, 
          ${match.teams.home.id}, 
          ${match.teams.away.id}, 
          ${match.fixture.date}, 
          ${match.league.round}
        )
        ON CONFLICT (api_fixture_id) 
        DO UPDATE SET 
          home_goals = ${match.goals.home}, 
          away_goals = ${match.goals.away},
          status = ${match.fixture.status.long};
      `;
    }

    return new Response(
      JSON.stringify({ success: true, count: matches.length }),
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
