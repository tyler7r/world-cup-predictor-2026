import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

export async function POST(req: Request) {
  const authObject = await auth();
  const { userId } = authObject;
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { goals, yellowCards, redCards } = await req.json();
  const sql = neon(process.env.DATABASE_URL!);

  // Upsert the prediction: if it exists, update it; if not, insert it.
  await sql`
    UPDATE users
    SET predicted_total_goals = ${goals}, predicted_yellow_cards = ${yellowCards}, predicted_red_cards = ${redCards}
    WHERE id = ${userId}
  `;

  return Response.json({ success: true });
}
