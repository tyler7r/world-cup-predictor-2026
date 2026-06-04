// app/page.tsx
import { auth, currentUser } from "@clerk/nextjs/server";
import { Box } from "@mui/material";
import { neon } from "@neondatabase/serverless";
import DashboardPage from "./dashboard/page";
import LandingPage from "./LandingPage";
// Import the new component

export default async function RootPage() {
  const authObject = await auth();
  const { userId } = authObject;
  const user = await currentUser();
  const sql = neon(process.env.DATABASE_URL!);

  // Case 1: User is logged in
  if (userId && user) {
    // Upsert logic
    await sql`
      INSERT INTO users (id, email, display_name)
      VALUES (${userId}, ${user.emailAddresses[0].emailAddress}, ${user.fullName})
      ON CONFLICT (id) DO UPDATE SET 
        email = EXCLUDED.email, 
        display_name = EXCLUDED.display_name
    `;

    return (
      <Box>
        <DashboardPage />
      </Box>
    );
  }

  // Case 2: User is NOT logged in
  return <LandingPage />;
}
