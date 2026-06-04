// app/api/sync/route.ts
import { neon } from "@neondatabase/serverless";
import axios from "axios";

// --- API Response Interfaces ---
interface ApiStatistic {
  type: "Yellow Cards" | "Red Cards" | string;
  value: number | string | null;
}

interface ApiTeamStats {
  team: { id: number; name: string };
  statistics: ApiStatistic[];
}

interface ApiFixtureResponse {
  fixture: {
    id: number;
    date: string;
    venue: { name: string };
    status: { long: string; short: string };
  };
  league: { round: string };
  teams: {
    home: { id: number; winner: boolean | null };
    away: { id: number; winner: boolean | null };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

export async function GET() {
  const sql = neon(process.env.DATABASE_URL!);

  try {
    const response = await axios.get<{ response: ApiFixtureResponse[] }>(
      `https://${process.env.FOOTBALL_API_HOST}/fixtures`,
      {
        params: { league: "1", season: "2026" },
        headers: { "x-apisports-key": process.env.FOOTBALL_API_KEY },
      },
    );

    const matches = response.data.response;

    for (const match of matches) {
      let yellowCards = 0;
      let redCards = 0;

      // Type-safe Stat Extraction
      if (match.fixture.status.short !== "NS") {
        try {
          const statsRes = await axios.get<{ response: ApiTeamStats[] }>(
            `https://${process.env.FOOTBALL_API_HOST}/fixtures/statistics`,
            {
              params: { fixture: match.fixture.id },
              headers: { "x-apisports-key": process.env.FOOTBALL_API_KEY },
            },
          );

          const teamStats = statsRes.data.response;

          if (teamStats && teamStats.length === 2) {
            teamStats.forEach((team) => {
              const yellow = team.statistics.find(
                (s) => s.type === "Yellow Cards",
              )?.value;
              const red = team.statistics.find(
                (s) => s.type === "Red Cards",
              )?.value;

              yellowCards += Number(yellow || 0);
              redCards += Number(red || 0);
            });
          }
        } catch (error) {
          console.error(
            `Stats failed for fixture ${match.fixture.id}, ${error}`,
          );
        }
      }

      // Outcome Logic
      const winnerId: number | null =
        match.teams.home.winner === true
          ? match.teams.home.id
          : match.teams.away.winner === true
            ? match.teams.away.id
            : null;

      const loserId: number | null =
        match.teams.home.winner === false
          ? match.teams.home.id
          : match.teams.away.winner === false
            ? match.teams.away.id
            : null;

      // Database Execution
      await sql`
        INSERT INTO matches (
          api_fixture_id, home_team_id, away_team_id, kickoff_time, 
          stage, status, yellow_cards, red_cards, venue,
          home_goals_actual, away_goals_actual, winner_team_id, loser_team_id
        )
        VALUES (
          ${match.fixture.id}, ${match.teams.home.id}, ${match.teams.away.id}, ${match.fixture.date}, 
          ${match.league.round}, ${match.fixture.status.long}, ${yellowCards}, ${redCards}, ${match.fixture.venue.name},
          ${match.goals.home ?? 0}, ${match.goals.away ?? 0}, ${winnerId}, ${loserId}
        )
        ON CONFLICT (api_fixture_id) 
        DO UPDATE SET 
          home_goals_actual = EXCLUDED.home_goals_actual, 
          away_goals_actual = EXCLUDED.away_goals_actual,
          winner_team_id = EXCLUDED.winner_team_id,
          loser_team_id = EXCLUDED.loser_team_id,
          yellow_cards = EXCLUDED.yellow_cards,
          red_cards = EXCLUDED.red_cards,
          status = EXCLUDED.status,
          venue = EXCLUDED.venue;
      `;
    }

    return Response.json({ success: true, count: matches.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: "Failed to sync", message }, { status: 500 });
  }
}
