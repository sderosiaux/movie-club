import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cinemas } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { ScreeningForm } from "@/components/screenings/screening-form";

export const dynamic = "force-dynamic";

export default async function NewScreeningPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const allCinemas = await db
    .select()
    .from(cinemas)
    .orderBy(asc(cinemas.borough), asc(cinemas.name));

  return (
    <div className="w-full max-w-lg mx-auto">
      <ScreeningForm cinemas={allCinemas} />
    </div>
  );
}
