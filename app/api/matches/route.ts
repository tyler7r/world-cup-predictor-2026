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
          season: "2022",
        },
        headers: {
          "x-apisports-key": process.env.FOOTBALL_API_KEY,
        },
      },
    );

    const matches = response.data.response;

    for (const match of matches) {
      if (match.league.round === "Final") console.log(match);
      await sql`
        INSERT INTO matches (api_fixture_id, home_team_id, away_team_id, kickoff_time, stage, winner_team_id, loser_team_id)
        VALUES (
          ${match.fixture.id}, 
          ${match.teams.home.id}, 
          ${match.teams.away.id}, 
          ${match.fixture.date}, 
          ${match.league.round},
          ${match.teams.home.winner === true ? match.teams.home.id : match.teams.home.winner === null ? null : match.teams.away.id},
          ${match.teams.home.winner === false ? match.teams.home.id : match.teams.home.winner === null ? null : match.teams.away.id}
        )
        ON CONFLICT (api_fixture_id) 
        DO UPDATE SET 
          home_goals_actual = ${match.goals.home}, 
          away_goals_actual = ${match.goals.away},
          winner_team_id = ${match.teams.home.winner === true ? match.teams.home.id : match.teams.home.winner === null ? null : match.teams.away.id},
          loser_team_id = ${match.teams.home.winner === false ? match.teams.home.id : match.teams.home.winner === null ? null : match.teams.away.id},
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
