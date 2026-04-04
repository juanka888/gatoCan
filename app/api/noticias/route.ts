// app/api/noticias/route.ts

import { NextResponse } from "next/server";

const RSS_URLS = [
  "https://www.europapress.es/rss/rss.aspx?ch=00647",
  "https://www.lavozdegalicia.es/galicia/index.xml",
];

const fetchFeed = async (url: string) => {
  try {
    const res = await fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`,
      {
        next: { revalidate: 600 }, // 🔥 cache 10 min
      }
    );

    if (!res.ok) return [];

    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
};

export async function GET() {
  try {
    const results = await Promise.allSettled(
      RSS_URLS.map(fetchFeed)
    );

    let allItems: any[] = [];

    results.forEach((r) => {
      if (r.status === "fulfilled") {
        allItems.push(...r.value);
      }
    });

    // 🔥 quitar duplicados
    const unique = Array.from(
      new Map(allItems.map((item) => [item.link, item])).values()
    );

    // 🔥 ordenar por fecha
    unique.sort((a, b) => {
      return (
        new Date(b.pubDate || 0).getTime() -
        new Date(a.pubDate || 0).getTime()
      );
    });

    return NextResponse.json(unique.slice(0, 30));
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
