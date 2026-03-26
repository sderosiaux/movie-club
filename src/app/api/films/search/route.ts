import { searchFilms } from "@/lib/tmdb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }
  const films = await searchFilms(query);
  return NextResponse.json(films);
}
