import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { screenings, screeningAttendees, profiles, wouldGoAgain } from "@/lib/db/schema";
import { eq, and, ne, count } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { WouldGoAgain } from "@/components/screenings/would-go-again";
import { ArrowLeftIcon, CheckCircle2Icon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  // Fetch screening -- must be completed
  const [screening] = await db
    .select({
      id: screenings.id,
      status: screenings.status,
      filmTitle: screenings.filmTitle,
    })
    .from(screenings)
    .where(eq(screenings.id, id));

  if (!screening) notFound();
  if (screening.status !== "completed") redirect(`/screenings/${id}`);

  // Check if user already submitted feedback
  const [feedbackCount] = await db
    .select({ value: count() })
    .from(wouldGoAgain)
    .where(
      and(
        eq(wouldGoAgain.screeningId, id),
        eq(wouldGoAgain.fromUserId, userId),
      ),
    );

  const alreadySubmitted = (feedbackCount?.value ?? 0) > 0;

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
  const attendeesRaw = await db
    .select({
      profileId: screeningAttendees.profileId,
      status: screeningAttendees.status,
      profile: {
        id: profiles.id,
        name: profiles.name,
        photo_url: profiles.photoUrl,
      },
    })
    .from(screeningAttendees)
    .leftJoin(profiles, eq(screeningAttendees.profileId, profiles.id))
    .where(
      and(
        eq(screeningAttendees.screeningId, id),
        eq(screeningAttendees.status, "confirmed"),
        ne(screeningAttendees.profileId, userId),
      ),
    );

  const attendeeProfiles = attendeesRaw.map((a) => ({
    id: a.profile?.id ?? a.profileId,
    name: a.profile?.name ?? "",
    photo_url: a.profile?.photo_url ?? null,
  }));

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
