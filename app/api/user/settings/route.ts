import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const userObject = await auth();
    const { userId } = userObject;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { showGuide } = await request.json();

    if (typeof showGuide !== "boolean") {
      return new NextResponse("Invalid request body", { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Update the database record matching the Clerk User ID
    await sql`
      UPDATE users 
      SET show_guide = ${showGuide} 
      WHERE id = ${userId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user settings:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
