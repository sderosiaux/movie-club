import { createClient } from "@/lib/supabase/server";
import { fetchLetterboxdDiary } from "@/lib/letterboxd";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username } = await request.json();
  if (!username || typeof username !== "string") {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  const diary = await fetchLetterboxdDiary(username);

  // Store in profile's letterboxd_data
  await supabase.from("profiles").update({
    letterboxd_username: username,
    letterboxd_data: {
      diary: diary.slice(0, 50), // last 50 entries
      imported_at: new Date().toISOString(),
    },
  }).eq("id", user.id);

  return NextResponse.json({
    imported: diary.length,
    username,
  });
}
