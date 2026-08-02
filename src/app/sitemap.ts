import type { MetadataRoute } from "next";
import { getRooms } from "@/lib/data";

const baseUrl = "https://thekingshotel.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths: { path: string; priority: number }[] = [
    { path: "", priority: 1 },
    { path: "about", priority: 0.8 },
    { path: "rooms", priority: 0.9 },
    { path: "book", priority: 0.9 },
    { path: "experience", priority: 0.8 },
    { path: "experience/amenities", priority: 0.7 },
    { path: "experience/dining", priority: 0.7 },
    { path: "experience/recreation", priority: 0.7 },
    { path: "experience/services", priority: 0.7 },
    { path: "services", priority: 0.8 },
    { path: "testimonials", priority: 0.6 },
    { path: "contact", priority: 0.6 },
  ];

  const staticRoutes: MetadataRoute.Sitemap = staticPaths.map(({ path, priority }) => ({
    url: `${baseUrl}/${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority,
  }));

  const roomRoutes: MetadataRoute.Sitemap = getRooms().map((room) => ({
    url: `${baseUrl}/rooms/${room.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...roomRoutes];
}
