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
      const stats = await axios.get(
        `https://${process.env.FOOTBALL_API_HOST}/fixtures/statistics`,
        {
          params: {
            fixture: match.fixture.id,
          },
          headers: {
            "x-apisports-key": process.env.FOOTBALL_API_KEY,
          },
        },
      );

      const statData = stats.data.response;

      const team1Yellows = statData[0].statistics[10].value ?? 0;
      const team2Yellows = statData[1].statistics[10].value ?? 0;
      const team1Reds = statData[0].statistics[11].value ?? 0;
      const team2Reds = statData[0].statistics[11].value ?? 0;

      const yellowCards = team1Yellows + team2Yellows;
      const redCards = team1Reds + team2Reds;

      await sql`
        INSERT INTO matches (api_fixture_id, home_team_id, away_team_id, kickoff_time, stage, winner_team_id, loser_team_id, yellow_cards, red_cards)
        VALUES (
          ${match.fixture.id}, 
          ${match.teams.home.id}, 
          ${match.teams.away.id}, 
          ${match.fixture.date}, 
          ${match.league.round},
          ${match.teams.home.winner === true ? match.teams.home.id : match.teams.home.winner === null ? null : match.teams.away.id},
          ${match.teams.home.winner === false ? match.teams.home.id : match.teams.home.winner === null ? null : match.teams.away.id},
          ${yellowCards},
          ${redCards}
        )
        ON CONFLICT (api_fixture_id) 
        DO UPDATE SET 
          home_goals_actual = ${match.goals.home}, 
          away_goals_actual = ${match.goals.away},
          winner_team_id = ${match.teams.home.winner === true ? match.teams.home.id : match.teams.home.winner === null ? null : match.teams.away.id},
          loser_team_id = ${match.teams.home.winner === false ? match.teams.home.id : match.teams.home.winner === null ? null : match.teams.away.id},
          yellow_cards = ${yellowCards},
          red_cards = ${redCards},
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
