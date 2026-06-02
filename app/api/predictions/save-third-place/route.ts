import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Initialize your Neon connection
  const sql = neon(process.env.DATABASE_URL!);

  try {
    const body = await request.json();
    const { userId, thirdPlaceIds, r32Picks } = body;

    if (!userId || !thirdPlaceIds || thirdPlaceIds.length !== 8) {
      return NextResponse.json(
        { error: "Invalid data payload." },
        { status: 400 },
      );
    }

    // Execute within a transaction to ensure all inserts succeed or fail together
    await sql.transaction([
      // 1. Wipe previous 3rd place predictions for this user to allow clean overwrites
      sql`DELETE FROM prediction_third_place_advancement WHERE user_id = ${userId}`,

      sql`DELETE FROM prediction_knockouts WHERE user_id = ${userId} AND stage = 'Round of 32'`,

      // 2. Insert the 8 new selections
      ...thirdPlaceIds.map(
        (teamId: number) =>
          sql`INSERT INTO prediction_third_place_advancement (user_id, team_id, points_earned) VALUES (${userId}, ${teamId}, 0)`,
      ),

      ...r32Picks.map(
        (id: number) =>
          sql`INSERT INTO prediction_knockouts (user_id, team_id, stage) VALUES (${userId}, ${id}, 'Round of 32')`,
      ),
    ]);

    return NextResponse.json({
      success: true,
      message: "Third place picks saved!",
    });
  } catch (error) {
    console.error("Failed to save third place predictions:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
