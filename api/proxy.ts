import type { VercelRequest, VercelResponse } from "@vercel/node";

const ANIME_BASE_URL = "https://www.sankavollerei.com/anime/";
const ANIME_API_KEY = process.env.ANIME_API_KEY || "planaai";
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";

// Durasi cache (detik) — dipakai sebagai header Cache-Control s-maxage
// supaya di-cache oleh Vercel Edge/CDN (pengganti in-memory TTL cache,
// yang tidak reliable di lingkungan serverless karena tiap cold start = instance baru).
const CACHE_ONEDAY = 60 * 60 * 24;
const CACHE_ONEHOUR = 60 * 60;
const CACHE_TENMINUTES = 60 * 10;

function setCache(res: VercelResponse, seconds: number) {
  res.setHeader("Cache-Control", `public, s-maxage=${seconds}, stale-while-revalidate=${seconds}`);
}

function supabaseHeaders() {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  };
}

async function getBlacklistedSlugs(): Promise<Set<string>> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/blacklisted_anime?select=anime_slug`, { headers: supabaseHeaders() });
    const data = (await res.json()) as { anime_slug: string }[];
    return new Set(data.map((i) => (i.anime_slug || "").toLowerCase().trim()));
  } catch (err) {
    console.error("Error fetching blacklist:", err);
    return new Set();
  }
}

function normalizeAnimasu(item: any) {
  if (!item) return null;
  return {
    title: item.title || "Unknown",
    slug: (item.slug || "").trim(),
    poster: item.poster || item.image || "",
    episode: item.episode || null,
    type: item.type || null,
    score: item.score || item.rating || null,
    status: item.status || null,
    release: item.release || null,
    genres: item.genres ? item.genres.map((g: any) => typeof g === "string" ? g : g.name || g.title) : [],
    estimation: item.estimation || null,
  };
}

function normalizeSamehadaku(item: any) {
  if (!item) return null;
  return {
    title: item.title || "Unknown",
    slug: (item.animeId || item.slug || "").trim(),
    poster: item.poster || item.image || "",
    episode: item.episodes || item.episode || null,
    type: item.type || null,
    score: typeof item.score === "object" ? item.score?.value : item.score || null,
    status: item.status || null,
    release: item.releaseDate || item.releasedOn || null,
    genres: item.genreList ? item.genreList.map((g: any) => g.title || g.name) : [],
    estimation: item.estimation || null,
  };
}

function filterBlacklist(list: any[], blacklist: Set<string>) {
  return list.filter((item) => item && !blacklist.has((item.slug || "").toLowerCase()));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const { route, source = "Dayynime-v1", ...params } = req.query as Record<string, string>;
  const isV2 = source === "Dayynime-v2";

  try {
    if (route === "health") {
      return res.json({ status: "ok" });
    }

    if (route === "featured_anime") {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/featured_anime?select=*&order=order_index.asc`, { headers: supabaseHeaders() });
      const data = await r.json();
      const blacklist = await getBlacklistedSlugs();
      setCache(res, CACHE_ONEHOUR);
      return res.json(data.filter((i: any) => !blacklist.has((i.anime_slug || "").toLowerCase())));
    }

    if (route === "announcements") {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/announcements?is_active=eq.true`, { headers: supabaseHeaders() });
      setCache(res, CACHE_TENMINUTES);
      return res.json(await r.json());
    }

    if (route === "home") {
      const blacklist = await getBlacklistedSlugs();
      if (isV2) {
        const [rR, rO] = await Promise.all([
          fetch(`${ANIME_BASE_URL}samehadaku/recent?page=1`),
          fetch(`${ANIME_BASE_URL}samehadaku/ongoing?page=1`)
        ]);
        const dR = await rR.json();
        const dO = await rO.json();
        setCache(res, CACHE_ONEHOUR);
        return res.json({
          recent: filterBlacklist((dR.data?.animeList || []).map(normalizeSamehadaku), blacklist),
          ongoing: filterBlacklist((dO.data?.animeList || []).map(normalizeSamehadaku), blacklist)
        });
      } else {
        const r = await fetch(`${ANIME_BASE_URL}animasu/home?apikey=${ANIME_API_KEY}`);
        const d = await r.json();
        setCache(res, CACHE_ONEHOUR);
        return res.json({
          ongoing: filterBlacklist((d.ongoing || []).map(normalizeAnimasu), blacklist),
          recent: filterBlacklist((d.recent || []).map(normalizeAnimasu), blacklist)
        });
      }
    }

    if (route === "search") {
      const keyword = encodeURIComponent(params.keyword || "");
      const page = params.page || "1";
      if (!keyword) return res.json({ animes: [] });
      const blacklist = await getBlacklistedSlugs();
      if (isV2) {
        const r = await fetch(`${ANIME_BASE_URL}samehadaku/search?q=${keyword}&page=${page}`);
        const d = await r.json();
        setCache(res, CACHE_ONEHOUR);
        return res.json({
          animes: filterBlacklist((d.data?.animeList || []).map(normalizeSamehadaku), blacklist),
          pagination: {
            hasNext: !!d.pagination?.hasNextPage,
            hasPrev: !!d.pagination?.hasPrevPage,
            currentPage: Number(d.pagination?.currentPage || page)
          }
        });
      } else {
        const r = await fetch(`${ANIME_BASE_URL}animasu/search/${keyword}?apikey=${ANIME_API_KEY}`);
        const d = await r.json();
        setCache(res, CACHE_ONEHOUR);
        return res.json({
          animes: filterBlacklist((d.animes || []).map(normalizeAnimasu), blacklist),
          pagination: { hasNext: false, hasPrev: false, currentPage: 1 }
        });
      }
    }

    if (route === "explore") {
      const tab = params.tab || "Ongoing";
      const genreSlug = params.genreSlug || "";
      const page = params.page || "1";
      const blacklist = await getBlacklistedSlugs();
      if (isV2) {
        const epMap: Record<string, string> = { Popular: "popular", Movies: "movies", Completed: "completed", Latest: "recent", Genres: `genres/${genreSlug}` };
        const r = await fetch(`${ANIME_BASE_URL}samehadaku/${epMap[tab] || "ongoing"}?page=${page}`);
        const d = await r.json();
        setCache(res, CACHE_ONEHOUR);
        return res.json({
          animes: filterBlacklist((d.data?.animeList || []).map(normalizeSamehadaku), blacklist),
          pagination: {
            hasNext: !!d.pagination?.hasNextPage,
            hasPrev: !!d.pagination?.hasPrevPage,
            currentPage: Number(d.pagination?.currentPage || page)
          }
        });
      } else {
        const epMap: Record<string, string> = { Popular: "popular", Movies: "movies", Completed: "completed", Latest: "latest", All: "animelist", Genres: `genre/${genreSlug}` };
        const r = await fetch(`${ANIME_BASE_URL}animasu/${epMap[tab] || "ongoing"}?apikey=${ANIME_API_KEY}&page=${page}`);
        const d = await r.json();
        setCache(res, CACHE_ONEHOUR);
        return res.json({
          animes: filterBlacklist((d.animes || []).map(normalizeAnimasu), blacklist),
          pagination: {
            hasNext: !!d.pagination?.hasNext,
            hasPrev: !!d.pagination?.hasPrev,
            currentPage: Number(d.pagination?.currentPage || page)
          }
        });
      }
    }

    if (route === "genres") {
      if (isV2) {
        const r = await fetch(`${ANIME_BASE_URL}samehadaku/genres`);
        const d = await r.json();
        setCache(res, CACHE_ONEDAY);
        return res.json((d.data?.genreList || []).map((g: any) => ({ title: g.title, slug: g.genreId })).sort((a: any, b: any) => a.title.localeCompare(b.title)));
      } else {
        const r = await fetch(`${ANIME_BASE_URL}animasu/genres?apikey=${ANIME_API_KEY}`);
        const d = await r.json();
        setCache(res, CACHE_ONEDAY);
        return res.json((d.genres || []).map((g: any) => ({ title: g.name, slug: g.slug })).sort((a: any, b: any) => a.title.localeCompare(b.title)));
      }
    }

    if (route === "schedule") {
      const blacklist = await getBlacklistedSlugs();
      if (isV2) {
        const r = await fetch(`${ANIME_BASE_URL}samehadaku/schedule`);
        const d = await r.json();
        const result: Record<string, any[]> = {};
        for (const day of d.data?.days || []) result[day.day.toLowerCase()] = filterBlacklist((day.animeList || []).map(normalizeSamehadaku), blacklist);
        setCache(res, CACHE_ONEHOUR);
        return res.json(result);
      } else {
        const r = await fetch(`${ANIME_BASE_URL}animasu/schedule?apikey=${ANIME_API_KEY}`);
        const d = await r.json();
        const sched = d.schedule || {};
        const result: Record<string, any[]> = {};
        for (const day of ["minggu", "senin", "selasa", "rabu", "kamis", "jum'at", "sabtu"]) result[day] = filterBlacklist((sched[day] || []).map(normalizeAnimasu), blacklist);
        setCache(res, CACHE_ONEHOUR);
        return res.json(result);
      }
    }

    if (route === "detail") {
      const slug = params.slug || "";
      if (!slug) return res.status(400).json({ error: "slug diperlukan" });
      const blacklist = await getBlacklistedSlugs();
      if (blacklist.has(slug.toLowerCase())) return res.status(403).json({ error: "Anime ini telah diblokir di web. Silakan dapatkan fitur lengkap di aplikasi Android.", blacklisted: true });
      if (isV2) {
        const r = await fetch(`${ANIME_BASE_URL}samehadaku/anime/${slug}`);
        const d = (await r.json()).data || {};
        setCache(res, CACHE_ONEHOUR);
        return res.json({
          title: d.title || "Unknown",
          poster: d.poster || "",
          score: d.score?.value || d.score || "N/A",
          synopsis: d.synopsis?.paragraphs?.join("\n") || d.synopsis || "",
          trailer: d.trailer || null,
          type: d.type || "N/A",
          status: d.status || "N/A",
          aired: d.aired || "N/A",
          duration: d.duration || "N/A",
          studios: d.studios || "N/A",
          season: d.season || "N/A",
          genres: (d.genreList || []).map((g: any) => ({ name: g.title, slug: g.genreId })),
          episodes: (d.episodeList || []).map((ep: any) => ({ name: ep.title, slug: ep.episodeId })),
          recommended: (d.recommendedAnimeList || []).slice(0, 6).map(normalizeSamehadaku)
        });
      } else {
        const r = await fetch(`${ANIME_BASE_URL}animasu/detail/${slug}?apikey=${ANIME_API_KEY}`);
        const a = (await r.json()).detail || {};
        setCache(res, CACHE_ONEHOUR);
        return res.json({
          title: a.title || "Unknown",
          poster: a.poster || "",
          score: a.rating || "N/A",
          synopsis: a.synopsis || "",
          trailer: a.trailer || null,
          type: a.type || "N/A",
          status: a.status || "N/A",
          aired: a.aired || "N/A",
          duration: a.duration || "N/A",
          studios: a.studio || "N/A",
          season: a.season || "N/A",
          genres: (a.genres || []).map((g: any) => ({ name: g.name, slug: g.slug })),
          episodes: (a.episodes || []).map((ep: any) => ({ name: ep.name, slug: ep.slug })),
          recommended: []
        });
      }
    }

    if (route === "episode") {
      const slug = params.slug || "";
      if (!slug) return res.status(400).json({ error: "slug diperlukan" });
      if (isV2) {
        const r = await fetch(`${ANIME_BASE_URL}samehadaku/episode/${slug}`);
        const s = (await r.json()).data || {};
        setCache(res, CACHE_ONEHOUR);
        return res.json({
          title: s.title || "Nonton Anime",
          animeId: s.animeId || "",
          poster: s.poster || "",
          defaultStreamingUrl: s.defaultStreamingUrl || "",
          hasPrev: !!s.hasPrevEpisode,
          prevSlug: s.prevEpisode?.episodeId || null,
          prevTitle: s.prevEpisode?.title || "",
          hasNext: !!s.hasNextEpisode,
          nextSlug: s.nextEpisode?.episodeId || null,
          nextTitle: s.nextEpisode?.title || "",
          qualities: s.server?.qualities || []
        });
      } else {
        const r = await fetch(`${ANIME_BASE_URL}animasu/episode/${slug}?apikey=${ANIME_API_KEY}`);
        const d = await r.json();
        let hasPrev = false, hasNext = false, prevSlug: string | null = null, nextSlug: string | null = null, prevTitle = "", nextTitle = "";
        try {
          const epMatch = slug.match(/^(.+)-episode-(\d+(?:-\d+)?)$/);
          if (epMatch) {
            const detailRes = await fetch(`${ANIME_BASE_URL}animasu/detail/${epMatch[1]}?apikey=${ANIME_API_KEY}`);
            if (detailRes.ok) {
              const episodes: { name: string, slug: string }[] = (await detailRes.json()).detail?.episodes || [];
              const idx = episodes.findIndex(ep => ep.slug === slug);
              if (idx !== -1) {
                if (idx > 0) { hasNext = true; nextSlug = episodes[idx - 1].slug; nextTitle = episodes[idx - 1].name; }
                if (idx < episodes.length - 1) { hasPrev = true; prevSlug = episodes[idx + 1].slug; prevTitle = episodes[idx + 1].name; }
              }
            }
          }
        } catch {}
        setCache(res, CACHE_ONEHOUR);
        return res.json({
          title: d.title || "Nonton Anime",
          streams: d.streams || [],
          hasPrev,
          prevSlug,
          prevTitle,
          hasNext,
          nextSlug,
          nextTitle
        });
      }
    }

    if (route === "server") {
      const serverId = params.serverId || "";
      if (!serverId) return res.status(400).json({ error: "serverId diperlukan" });
      const r = await fetch(`${ANIME_BASE_URL}samehadaku/server/${serverId}`);
      const d = await r.json();
      setCache(res, CACHE_ONEHOUR);
      return res.json(d.data || { url: "" });
    }

    return res.status(404).json({ error: "Route tidak ditemukan" });
  } catch (err: any) {
    console.error("API error for route", route, ":", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
