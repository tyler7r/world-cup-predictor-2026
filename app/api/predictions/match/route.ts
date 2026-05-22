import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

export async function POST(req: Request) {
  const authObject = await auth();
  const { userId } = authObject;
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { matchId, homeGoals, awayGoals } = await req.json();
  const sql = neon(process.env.DATABASE_URL!);

  // Upsert the prediction: if it exists, update it; if not, insert it.
  await sql`
    INSERT INTO prediction_group_matches (user_id, match_id, home_goals_predicted, away_goals_predicted)
    VALUES (${userId}, ${matchId}, ${homeGoals}, ${awayGoals})
    ON CONFLICT (user_id, match_id) 
    DO UPDATE SET 
      home_goals_predicted = EXCLUDED.home_goals_predicted, 
      away_goals_predicted = EXCLUDED.away_goals_predicted
  `;

  return Response.json({ success: true });
}
