import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WoodLoop AI",
    short_name: "WoodLoop",
    description: "Discover and list reusable production wood offcuts.",
    start_url: "/app?source=pwa",
    scope: "/",
    display: "standalone",
    background_color: "#F7F5EF",
    theme_color: "#244C3A",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
