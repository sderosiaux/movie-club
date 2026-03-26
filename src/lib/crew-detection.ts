import { createClient } from "@/lib/supabase/server";

export type CrewCandidate = {
  profile_id: string;
  name: string;
  photo_url: string | null;
  shared_screenings: number;
  mutual_would_go_again: boolean;
};

export async function detectCrewCandidates(
  userId: string
): Promise<CrewCandidate[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("detect_crew_candidates", {
    target_user_id: userId,
    min_shared_screenings: 2,
  });
  if (error) return [];
  return (data ?? []) as CrewCandidate[];
}
