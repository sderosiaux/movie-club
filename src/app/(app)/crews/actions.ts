"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createCrew(name: string, memberIds: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const allMembers = [user.id, ...memberIds.filter((id) => id !== user.id)];

  const { data: crewId, error } = await supabase.rpc(
    "create_crew_with_members",
    {
      crew_name: name || null,
      member_ids: allMembers,
    }
  );

  if (error || !crewId) throw new Error("Failed to create crew");

  revalidatePath("/crews");
  redirect(`/crews/${crewId}`);
}
