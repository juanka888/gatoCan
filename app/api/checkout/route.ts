import { NextResponse } from "next/server";
import Parser from "rss-parser";

const parser = new Parser();
const RSS_URLS = [
  "https://www.europapress.es/rss/rss.aspx?ch=00647",
  "https://www.lavozgalicia.es/galicia/index.xml",
  "https://www.elprogreso.es/rss"
];

export async function GET() {
  try {
    const feedPromises = RSS_URLS.map(async (url) => {
      try {
        // Ponemos un timeout de 5 segundos para que Vercel no se cuelgue
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const feed = await parser.parseURL(url);
        clearTimeout(timeoutId);

        return feed.items.map(item => ({
          title: item.title || "Sin título",
          link: item.link,
          pubDate: item.pubDate,
          // Intentamos sacar la imagen si el periódico la envía
          thumbnail: item.enclosure?.url || (item as any).content?.match(/src="([^"]+)"/)?.[1] || null,
        }));
      } catch (err) {
        console.error(`Error en ${url}:`, err);
        return [];
      }
    });

    const results = await Promise.all(feedPromises);
    const combined = results.flat().sort((a, b) => 
      new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime()
    );

    return NextResponse.json(combined.slice(0, 30));
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}