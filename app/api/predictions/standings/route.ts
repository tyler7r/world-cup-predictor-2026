import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { groupName, winnerId, runnerUpId, thirdPlaceId } = await req.json();
  const sql = neon(process.env.DATABASE_URL!);
  await sql.transaction([
    sql`
    INSERT INTO prediction_group_standings (user_id, group_name, winner_team_id, runner_up_team_id, third_place_team_id)
    VALUES (${userId}, ${groupName}, ${winnerId}, ${runnerUpId}, ${thirdPlaceId})
    ON CONFLICT (user_id, group_name) 
    DO UPDATE SET 
      winner_team_id = EXCLUDED.winner_team_id, 
      runner_up_team_id = EXCLUDED.runner_up_team_id,
      third_place_team_id = EXCLUDED.third_place_team_id`,
  ]);

  return Response.json({ success: true });
}
