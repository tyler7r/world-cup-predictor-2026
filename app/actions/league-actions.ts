"use server";

import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { revalidatePath } from "next/cache";

export async function createLeague(formData: FormData) {
  const authObject = await auth();
  const { userId } = authObject;
  if (!userId) return { success: false, error: "Unauthorized" };

  const name = formData.get("leagueName") as string;
  const inviteCode = formData.get("leaguePwd") as string;
  const sql = neon(process.env.DATABASE_URL!);

  try {
    // 1. Create the league
    const [newLeague] = await sql`
      INSERT INTO leagues (name, invite_code, creator_id)
      VALUES (${name}, ${inviteCode}, ${userId})
      RETURNING id
    `;

    // 2. Add the creator as the first member
    await sql`
      INSERT INTO league_members (league_id, user_id)
      VALUES (${newLeague.id}, ${userId})
    `;

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Failed to create league. Please try again.",
    };
  }
}

export async function joinLeague(formData: FormData) {
  const authObject = await auth();
  const { userId } = authObject;
  if (!userId) return { success: false, error: "Unauthorized" };

  const inviteCode = (formData.get("inviteCode") as string).toUpperCase();
  const sql = neon(process.env.DATABASE_URL!);

  try {
    // 1. Find the league by code
    const leagues =
      await sql`SELECT id FROM leagues WHERE invite_code = ${inviteCode}`;

    // Graceful exit instead of throwing an error
    if (leagues.length === 0) {
      return {
        success: false,
        error: "Invalid Invite Code. Please check the code and try again.",
      };
    }

    // 2. Insert member
    await sql`
      INSERT INTO league_members (league_id, user_id)
      VALUES (${leagues[0].id}, ${userId})
      ON CONFLICT (league_id, user_id) DO NOTHING
    `;

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Failed to join a league with this invite code. Please try again.",
    };
  }
}
