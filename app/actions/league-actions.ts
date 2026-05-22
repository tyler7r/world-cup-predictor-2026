"use server";

import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

export async function createLeague(formData: FormData) {
  const authObject = await auth();
  const { userId } = authObject;
  if (!userId) throw new Error("Unauthorized");

  const name = formData.get("leagueName") as string;
  const inviteCode = nanoid(6).toUpperCase();
  const sql = neon(process.env.DATABASE_URL!);

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

  revalidatePath("/dashboard"); // Refreshes the dashboard data
  return { success: true };
}

export async function joinLeague(formData: FormData) {
  const authObject = await auth();
  const { userId } = authObject;
  if (!userId) throw new Error("Unauthorized");

  const inviteCode = (formData.get("inviteCode") as string).toUpperCase();
  const sql = neon(process.env.DATABASE_URL!);

  // 1. Find the league by code
  const leagues =
    await sql`SELECT id FROM leagues WHERE invite_code = ${inviteCode}`;
  if (leagues.length === 0) throw new Error("Invalid Invite Code");

  // 2. Insert member (ON CONFLICT DO NOTHING prevents errors if they already joined)
  await sql`
    INSERT INTO league_members (league_id, user_id)
    VALUES (${leagues[0].id}, ${userId})
    ON CONFLICT (league_id, user_id) DO NOTHING
  `;

  revalidatePath("/dashboard");
  return { success: true };
}
