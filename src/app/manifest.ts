import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Movie Club",
    short_name: "Movie Club",
    description: "Find your movie crew in NYC",
    start_url: "/screenings",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#09090b",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
