import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

export async function GET() {
  // Buscamos en la carpeta public/gallery
  const galleryDir = path.join(process.cwd(), "public", "gallery");
  
  try {
    const files = await fs.readdir(galleryDir);
    // Filtramos para que solo coja imágenes
    const images = files
      .filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file))
      .map((fileName, index) => ({
        id: `img-${index}`,
        src: `/gallery/${fileName}`, // La URL pública
        category: fileName.toLowerCase().includes("colonia") ? "colonias" : "general",
        tag: "Gatocan",
        caption: fileName
      }));
      
    return NextResponse.json({ images });
  } catch (error) {
    return NextResponse.json({ images: [] });
  }
}
