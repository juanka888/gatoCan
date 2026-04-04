import { NextResponse } from "next/server";
import Parser from "rss-parser";

const parser = new Parser();

// Fusionamos todas tus fuentes aquí
const RSS_URLS = [
  "https://www.europapress.es/rss/rss.aspx?ch=00647", // Europa Press (General)
  "https://www.europapress.es/rss/rss.aspx?ch=00066", // Europa Press (Animales)
  "https://www.lavozdegalicia.es/galicia/index.xml",
  "https://www.lavozdegalicia.es/sociedad/index.xml",
  "https://www.elprogreso.es/rss",
  "https://www.laregion.es/rss",
  "https://www.20minutos.es/rss/animales/",
  "https://www.abc.es/rss/2.0/natural/biodiversidad/",
  "https://www.efeverde.com/feed/", // Corregida la URL
  "https://www.farodevigo.es/rss/section/13214"
];

export async function GET() {
  try {
    const feedPromises = RSS_URLS.map(async (url) => {
      try {
        // Timeout de 5 segundos por feed para que uno lento no bloquee todo
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const feed = await parser.parseURL(url);
        clearTimeout(timeoutId);

        return feed.items.map(item => ({
          title: item.title || "Sin título",
          link: item.link,
          pubDate: item.pubDate,
          // Guardamos la descripción para que el filtro del banner funcione mejor
          description: item.contentSnippet || item.content || "",
          // Intentamos capturar la imagen de varias etiquetas comunes
          thumbnail: item.enclosure?.url || (item as any).content?.match(/src="([^"]+)"/)?.[1] || null,
          source: feed.title || "Noticias"
        }));
      } catch (err) {
        // Si un periódico falla, simplemente devolvemos lista vacía y seguimos con los demás
        console.error(`Fallo en fuente: ${url}`);
        return [];
      }
    });

    const results = await Promise.all(feedPromises);
    
    // Aplanamos resultados y eliminamos duplicados por enlace (link)
    const allItems = results.flat();
    const uniqueItems = Array.from(
      new Map(allItems.map((item) => [item.link, item])).values()
    );

    // Ordenamos por fecha (de más reciente a más antigua)
    uniqueItems.sort((a: any, b: any) => 
      new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime()
    );

    // Devolvemos las 50 primeras noticias para que el frontend tenga de dónde filtrar
    return NextResponse.json(uniqueItems.slice(0, 50));
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}