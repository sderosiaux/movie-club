const TMDB_BASE = "https://api.themoviedb.org/3";

export type TMDBFilm = {
  id: number;
  title: string;
  poster_path: string | null;
  genre_ids: number[];
  vote_average: number;
  overview: string;
  release_date: string;
};

type TMDBSearchResult = {
  results: TMDBFilm[];
  total_results: number;
};

export async function searchFilms(query: string): Promise<TMDBFilm[]> {
  const res = await fetch(
    `${TMDB_BASE}/search/movie?query=${encodeURIComponent(query)}&language=en-US&page=1`,
    { headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` } }
  );
  if (!res.ok) return [];
  const data: TMDBSearchResult = await res.json();
  return data.results.slice(0, 10);
}

export async function getFilm(tmdbId: number): Promise<TMDBFilm | null> {
  const res = await fetch(
    `${TMDB_BASE}/movie/${tmdbId}?language=en-US`,
    { headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` } }
  );
  if (!res.ok) return null;
  return res.json();
}

export function posterUrl(path: string | null, size = "w342"): string {
  if (!path) return "/placeholder-poster.svg";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
