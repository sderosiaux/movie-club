import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import type { Cinema, Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  if (profile.onboarding_completed) {
    redirect("/screenings");
  }

  const { data: cinemas } = await supabase
    .from("cinemas")
    .select("*")
    .order("name");

  return (
    <div className="flex flex-1 items-center justify-center py-8">
      <OnboardingWizard
        profile={profile as Profile}
        cinemas={(cinemas ?? []) as Cinema[]}
      />
    </div>
  );
}
