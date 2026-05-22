// app/api/groups/route.ts
import { neon } from "@neondatabase/serverless";
import axios from "axios";

export interface APIFootballStanding {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  group: string;
  points: number;
  goalsDiff: number;
  // ... add other fields like 'all', 'form' if you need them later
}

export interface APIFootballResponse {
  response: Array<{
    league: {
      id: number;
      name: string;
      standings: APIFootballStanding[][]; // Notice the double array
    };
  }>;
}

export async function GET() {
  const sql = neon(process.env.DATABASE_URL!);

  try {
    const response = await axios.get(
      `https://${process.env.FOOTBALL_API_HOST}/standings`,
      {
        params: { league: "1", season: "2022" },
        headers: { "x-apisports-key": process.env.FOOTBALL_API_KEY },
      },
    );

    // Force the type here
    const data = response.data as APIFootballResponse;

    // Now 'data' is fully typed
    const allGroups = data.response[0].league.standings;

    for (const groupTeams of allGroups) {
      const groupName = groupTeams[0].group;
      const groupLetter = groupName.charAt(groupName.length - 1);

      // .find() now knows that 't' has 'rank' and 'team'
      const winnerId = groupTeams.find((t) => t.rank === 1)?.team.id;
      const runnerUpId = groupTeams.find((t) => t.rank === 2)?.team.id;
      const thirdId = groupTeams.find((t) => t.rank === 3)?.team.id;

      if (winnerId && runnerUpId && thirdId) {
        await sql`
      INSERT INTO standings (group_name, winner_team_id, runner_up_team_id, third_place_team_id)
      VALUES (${groupLetter}, ${winnerId}, ${runnerUpId}, ${thirdId})
      ON CONFLICT (group_name)
      DO UPDATE SET 
        winner_team_id = EXCLUDED.winner_team_id,
        runner_up_team_id = EXCLUDED.runner_up_team_id,
        third_place_team_id = EXCLUDED.third_place_team_id,
        last_updated = NOW()
    `;
      }
    }
    return new Response(
      JSON.stringify({
        success: true,
        message: `Updated standings`,
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to update groups" }), {
      status: 500,
    });
  }
}
