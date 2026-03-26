import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { profiles, cinemas } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import type { Cinema, Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId));

  if (!profile) {
    // Create profile if missing
    await db.insert(profiles).values({
      id: userId,
      name: session.user.name ?? session.user.email?.split("@")[0] ?? "User",
    });
    const [newProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId));
    if (!newProfile) redirect("/login");

    const allCinemas = await db.select().from(cinemas).orderBy(asc(cinemas.name));
    return (
      <div className="flex flex-1 items-center justify-center py-8">
        <OnboardingWizard
          profile={newProfile as unknown as Profile}
          cinemas={allCinemas as unknown as Cinema[]}
        />
      </div>
    );
  }

  if (profile.onboardingCompleted) {
    redirect("/screenings");
  }

  const allCinemas = await db.select().from(cinemas).orderBy(asc(cinemas.name));

  return (
    <div className="flex flex-1 items-center justify-center py-8">
      <OnboardingWizard
        profile={profile as unknown as Profile}
        cinemas={allCinemas as unknown as Cinema[]}
      />
    </div>
  );
}
