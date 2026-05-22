import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const sql = neon(process.env.DATABASE_URL!);

  try {
    const { userId, picks } = await request.json();
    // picks is an object: { r16: number[], qf: number[], sf: number[], final: number[], champion: number, runnerUp: number, thirdPlaceMatch: number[] }

    await sql.transaction([
      // 1. Clear old knockout picks for this user
      sql`DELETE FROM prediction_knockouts WHERE user_id = ${userId}`,

      // 2. Insert R16 (16 teams)
      ...picks.r16.map(
        (id: number) =>
          sql`INSERT INTO prediction_knockouts (user_id, team_id, stage) VALUES (${userId}, ${id}, 'Round of 16')`,
      ),

      // 3. Insert QF (8 teams)
      ...picks.qf.map(
        (id: number) =>
          sql`INSERT INTO prediction_knockouts (user_id, team_id, stage) VALUES (${userId}, ${id}, 'Quarter-finals')`,
      ),

      // 4. Insert SF (4 teams)
      ...picks.sf.map(
        (id: number) =>
          sql`INSERT INTO prediction_knockouts (user_id, team_id, stage) VALUES (${userId}, ${id}, 'Semi-finals')`,
      ),

      // 5. Insert Finalists (2 teams)
      ...picks.final.map(
        (id: number) =>
          sql`INSERT INTO prediction_knockouts (user_id, team_id, stage) VALUES (${userId}, ${id}, 'Final')`,
      ),

      // 6. Insert Champion & Runner Up
      sql`INSERT INTO prediction_knockouts (user_id, team_id, stage) VALUES (${userId}, ${picks.champion}, 'Winner')`,
      sql`INSERT INTO prediction_knockouts (user_id, team_id, stage) VALUES (${userId}, ${picks.runnerUp}, 'Runner-up')`,

      // 7. Insert 3rd Place Match participants (the losers of SF)
      ...picks.thirdPlaceMatch.map(
        (id: number) =>
          sql`INSERT INTO prediction_knockouts (user_id, team_id, stage) VALUES (${userId}, ${id}, '3rd Place Final')`,
      ),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to save knockout picks" },
      { status: 500 },
    );
  }
}
