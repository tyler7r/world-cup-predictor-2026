// app/api/groups/route.ts
import { neon } from "@neondatabase/serverless";
import axios from "axios";

export async function GET() {
  const sql = neon(process.env.DATABASE_URL!);

  try {
    const response = await axios.get(
      `https://${process.env.FOOTBALL_API_HOST}/standings`,
      {
        params: { league: "1", season: "2026" },
        headers: { "x-apisports-key": process.env.FOOTBALL_API_KEY },
      },
    );

    // The data is nested: response -> league -> standings (Array of Arrays)
    const standingsData = response.data.response[0].league.standings;

    let updatedCount = 0;

    // Iterate through each group array
    for (const group of standingsData) {
      // Iterate through each team in that group
      for (const entry of group) {
        const teamId = entry.team.id;
        const groupFullName = entry.group; // e.g., "Group A"

        await sql`
          UPDATE teams 
          SET group_name = ${groupFullName} 
          WHERE id = ${teamId}
        `;

        updatedCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Updated groups for ${updatedCount} teams.`,
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
