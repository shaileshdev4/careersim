import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "A Day In",
    short_name: "A Day In",
    description: "Career day simulator - live a day in someone else's job.",
    start_url: "/",
    display: "standalone",
    background_color: "#08080b",
    theme_color: "#0c0e14",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-touch-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
  };
}
