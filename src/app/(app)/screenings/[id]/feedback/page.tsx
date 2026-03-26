import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { WouldGoAgain } from "@/components/screenings/would-go-again";
import { ArrowLeftIcon, CheckCircle2Icon } from "lucide-react";

export const dynamic = "force-dynamic";

type Attendee = {
  profile_id: string;
  status: "confirmed" | "waitlisted";
  profile: {
    id: string;
    name: string;
    photo_url: string | null;
  };
};

export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch screening — must be completed
  const { data: screening } = await supabase
    .from("screenings")
    .select("id, status, film_title")
    .eq("id", id)
    .single();

  if (!screening) notFound();
  if (screening.status !== "completed") redirect(`/screenings/${id}`);

  // Check if user already submitted feedback
  const { count } = await supabase
    .from("would_go_again")
    .select("*", { count: "exact", head: true })
    .eq("screening_id", id)
    .eq("from_user_id", user.id);

  const alreadySubmitted = (count ?? 0) > 0;

  if (alreadySubmitted) {
    return (
      <div className="space-y-6">
        <Link
          href={`/screenings/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" />
          Back to screening
        </Link>

        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <CheckCircle2Icon className="size-10 text-primary" />
          <h2 className="text-xl font-bold tracking-tight">
            Thanks for your feedback!
          </h2>
          <p className="text-sm text-muted-foreground">
            Your feedback helps form crews.
          </p>
        </div>
      </div>
    );
  }

  // Fetch attendees (excluding current user)
  const { data: attendeesRaw } = await supabase
    .from("screening_attendees")
    .select("profile_id, status, profile:profiles(id, name, photo_url)")
    .eq("screening_id", id)
    .eq("status", "confirmed")
    .neq("profile_id", user.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const attendees = (attendeesRaw ?? []) as any as Attendee[];
  const attendeeProfiles = attendees.map((a) => a.profile);

  return (
    <div className="space-y-6">
      <Link
        href={`/screenings/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-3.5" />
        Back to screening
      </Link>

      <WouldGoAgain screeningId={id} attendees={attendeeProfiles} />
    </div>
  );
}
