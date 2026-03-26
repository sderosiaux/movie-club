export type LetterboxdEntry = {
  title: string;
  year: string;
  rating: number | null;
  watchedDate: string;
  link: string;
};

export async function fetchLetterboxdDiary(username: string): Promise<LetterboxdEntry[]> {
  const res = await fetch(`https://letterboxd.com/${username}/rss/`, {
    next: { revalidate: 3600 }, // cache 1h
  });
  if (!res.ok) return [];

  const xml = await res.text();
  const entries: LetterboxdEntry[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];
    const title = item.match(/<letterboxd:filmTitle>(.*?)<\/letterboxd:filmTitle>/)?.[1] ?? "";
    const year = item.match(/<letterboxd:filmYear>(.*?)<\/letterboxd:filmYear>/)?.[1] ?? "";
    const rating = item.match(/<letterboxd:memberRating>(.*?)<\/letterboxd:memberRating>/)?.[1];
    const watchedDate = item.match(/<letterboxd:watchedDate>(.*?)<\/letterboxd:watchedDate>/)?.[1] ?? "";
    const link = item.match(/<link>(.*?)<\/link>/)?.[1] ?? "";

    if (title) {
      entries.push({
        title,
        year,
        rating: rating ? parseFloat(rating) : null,
        watchedDate,
        link,
      });
    }
  }
  return entries;
}
