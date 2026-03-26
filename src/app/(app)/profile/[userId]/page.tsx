import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Profile } from "@/lib/types";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!profile) notFound();

  const p = profile as Profile;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{p.name}</h1>
      {p.neighborhood && (
        <p className="mt-1 text-muted-foreground">{p.neighborhood}</p>
      )}
      {p.genres.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {p.genres.map((g) => (
            <span
              key={g}
              className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
            >
              {g}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
