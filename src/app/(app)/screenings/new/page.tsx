import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ScreeningForm } from "@/components/screenings/screening-form";
import type { Cinema } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NewScreeningPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: cinemas } = await supabase
    .from("cinemas")
    .select("*")
    .order("borough")
    .order("name");

  return (
    <div className="w-full max-w-lg mx-auto">
      <ScreeningForm cinemas={(cinemas ?? []) as Cinema[]} />
    </div>
  );
}
