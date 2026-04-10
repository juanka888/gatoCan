import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

const SUPPORTED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const FALLBACK_RANDOM_CATEGORIES = ["rescates", "colonias", "actuaciones"] as const;

type GalleryCategory = "colonias" | "capturas" | "esterilizaciones" | "actuaciones" | "rescates";

function inferCategory(fileName: string): GalleryCategory | null {
  const normalized = fileName.toLowerCase();
  if (normalized.includes("esteril")) return "esterilizaciones";
  if (normalized.includes("captur")) return "capturas";
  if (normalized.includes("rescat")) return "rescates";
  if (normalized.includes("coloni")) return "colonias";
  if (normalized.includes("actua")) return "actuaciones";
  return null;
}

function stableRandomCategory(fileName: string): (typeof FALLBACK_RANDOM_CATEGORIES)[number] {
  const hash = [...fileName].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return FALLBACK_RANDOM_CATEGORIES[hash % FALLBACK_RANDOM_CATEGORIES.length];
}

function prettifyTag(category: GalleryCategory): string {
  if (category === "rescates") return "Rescates";
  if (category === "colonias") return "Colonias";
  if (category === "actuaciones") return "Actuaciones";
  if (category === "capturas") return "Capturas";
  return "Esterilizaciones";
}

export async function GET() {
  const preferredDir = path.join(process.cwd(), "public", "gallery");
  const legacyDir = path.join(process.cwd(), "public", "img");

  let files: string[] = [];
  let basePath = "/gallery";

  try {
    files = await fs.readdir(preferredDir);
  } catch {
    const legacyFiles = await fs.readdir(legacyDir);
    files = legacyFiles.filter((name) => name.startsWith("foto-"));
    basePath = "/img";
  }

  const images = files
    .filter((name) => SUPPORTED_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, "es"))
    .map((fileName, index) => {
      const category = inferCategory(fileName) ?? stableRandomCategory(fileName);
      const tag = prettifyTag(category);

      return {
        id: `${fileName}-${index}`,
        src: `${basePath}/${encodeURIComponent(fileName)}`,
        alt: `Imagen de ${tag.toLowerCase()} (${fileName})`,
        category,
        tag,
        caption: tag,
        fileName,
      };
    });

  return NextResponse.json({ images });
}
