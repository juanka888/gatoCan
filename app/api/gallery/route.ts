import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

export async function GET() {
  // Ruta absoluta hacia public/img/gallery
  const galleryDir = path.join(process.cwd(), "public", "img", "gallery");

  try {
    const files = await fs.readdir(galleryDir);

    const images = files
      .filter(file => /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(file))
      .map((fileName, index) => {
        const nameLower = fileName.toLowerCase();
        let category = "general";
        
        // Clasificación automática por nombre
        if (nameLower.includes("colonia")) category = "colonias";
        else if (nameLower.includes("rescat")) category = "rescates";
        else if (nameLower.includes("actua")) category = "actuaciones";
        else if (nameLower.includes("captur")) category = "capturas";
        else if (nameLower.includes("esteril")) category = "esterilizaciones";

        return {
          id: `img-${index}`,
          src: `/img/gallery/${fileName}`, // Ruta que usará el navegador
          category: category,
          tag: category.charAt(0).toUpperCase() + category.slice(1),
          caption: fileName.split('.')[0].replace(/-/g, ' ')
        };
      });

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Error leyendo public/img/gallery:", error);
    return NextResponse.json({ images: [] });
  }
}