import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import PredictorPage from "./predictor/page";

export default async function Dashboard() {
  const authObject = await auth();
  const { userId } = authObject;
  const user = await currentUser();
  const sql = neon(process.env.DATABASE_URL!);

  if (userId) {
    // This "upserts" the user: if they don't exist, it creates them.
    // If they do, it just ensures their name/email is up to date.
    await sql`
      INSERT INTO users (id, email, display_name)
      VALUES (${userId}, ${user?.emailAddresses[0].emailAddress}, ${user?.fullName})
      ON CONFLICT (id) DO UPDATE SET 
        email = EXCLUDED.email, 
        display_name = EXCLUDED.display_name
    `;
  }

  return (
    <div>
      <h1>Welcome to the Predictor, {user?.firstName}!</h1>
      <PredictorPage />
      {/* Rest of your dashboard */}
    </div>
  );
}
