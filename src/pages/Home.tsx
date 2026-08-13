import React, { useState, useEffect } from "react";
import { Bell, Search, SlidersHorizontal, AlertCircle, RefreshCw, Star, Play, Zap, Flame, Award } from "lucide-react";
import { settings } from "../lib/settings";
import { AnimeRaw, FeaturedAnime } from "../types";
import HeroCarousel from "../components/HeroCarousel";
import AnimeCard from "../components/AnimeCard";
import FilterChips from "../components/FilterChips";
import ShimmerSkeleton from "../components/ShimmerSkeleton";

interface HomeProps {
  onNavigate: (hash: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [featured, setFeatured] = useState<any[]>([]);
  const [ongoing, setOngoing] = useState<AnimeRaw[]>([]);
  const [recent, setRecent] = useState<AnimeRaw[]>([]);
  const [popular, setPopular] = useState<AnimeRaw[]>([]);
  const [genres, setGenres] = useState<{ title: string; slug: string }[]>([]);
  
  const [selectedFilter, setSelectedFilter] = useState("all");
  const dataSource = settings.getDataSource();
  const accentColor = settings.getAccentColor();
  const gridLayout = settings.getGridLayout();

  // Load colors
  const getAccentTextClass = () => {
    switch (accentColor) {
      case "green": return "text-[#4ade80]";
      case "blue": return "text-[#3b82f6]";
      case "purple": return "text-[#a855f7]";
      case "orange": return "text-[#f97316]";
      default: return "text-[#e84545]"; // red
    }
  };

  const getAccentBgClass = () => {
    switch (accentColor) {
      case "green": return "bg-[#4ade80]";
      case "blue": return "bg-[#3b82f6]";
      case "purple": return "bg-[#a855f7]";
      case "orange": return "bg-[#f97316]";
      default: return "bg-[#e84545]"; // red
    }
  };

  const getAccentBorderClass = () => {
    switch (accentColor) {
      case "green": return "border-[#4ade80]/20 focus-within:border-[#4ade80]";
      case "blue": return "border-[#3b82f6]/20 focus-within:border-[#3b82f6]";
      case "purple": return "border-[#a855f7]/20 focus-within:border-[#a855f7]";
      case "orange": return "border-[#f97316]/20 focus-within:border-[#f97316]";
      default: return "border-[#e84545]/20 focus-within:border-[#e84545]"; // red
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Featured Anime (from Supabase via Proxy)
      let featuredList: any[] = [];
      try {
        const featuredRes = await fetch(`/api/proxy?route=featured_anime&source=${dataSource}`);
        if (featuredRes.ok) {
          const featuredData = await featuredRes.json();
          featuredList = Array.isArray(featuredData) ? featuredData : [];
        }
      } catch (e) {
        console.warn("Featured fetch failed, using fallback:", e);
      }

      // 2. Fetch Home Feed (ongoing + recent)
      const homeRes = await fetch(`/api/proxy?route=home&source=${dataSource}`);
      if (!homeRes.ok) throw new Error("Gagal mengambil data beranda anime.");
      const homeData = await homeRes.json();
      
      const rawOngoing = Array.isArray(homeData.ongoing) ? homeData.ongoing : [];
      const rawRecent = Array.isArray(homeData.recent) ? homeData.recent : [];

      setOngoing(rawOngoing);
      setRecent(rawRecent);

      // Map featured from Supabase or fallback to ongoing if empty
      if (featuredList.length > 0) {
        const mappedFeatured = featuredList.map((item: any) => ({
          slug: item.anime_slug,
          title: item.anime_title,
          poster: item.anime_poster,
          score: item.score || "8.5",
          genres: item.genres || ["Action", "Fantasy"]
        }));
        setFeatured(mappedFeatured);
      } else if (rawOngoing.length > 0) {
        // Fallback to top 4 ongoing as slides
        const fallbackFeatured = rawOngoing.slice(0, 5).map((anime) => ({
          slug: anime.slug,
          title: anime.title,
          poster: anime.poster,
          score: anime.score || "8.1",
          genres: anime.genres || []
        }));
        setFeatured(fallbackFeatured);
      }

      // 3. Fetch popular for grid section
      try {
        const popRes = await fetch(`/api/proxy?route=explore&tab=Popular&source=${dataSource}&page=1`);
        if (popRes.ok) {
          const popData = await popRes.json();
          setPopular(Array.isArray(popData.animes) ? popData.animes.slice(0, 6) : []);
        }
      } catch (e) {
        console.error("Popular fetch failed:", e);
      }

      // 4. Fetch genres for filter chips
      try {
        const genresRes = await fetch(`/api/proxy?route=genres&source=${dataSource}`);
        if (genresRes.ok) {
          const genresData = await genresRes.json();
          setGenres(Array.isArray(genresData) ? genresData.slice(0, 10) : []);
        }
      } catch (e) {
        console.error("Genres fetch failed:", e);
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Re-fetch if settings/source changes
    const handleSettingsChange = () => {
      fetchData();
    };
    window.addEventListener('settings_changed', handleSettingsChange);
    return () => {
      window.removeEventListener('settings_changed', handleSettingsChange);
    };
  }, [dataSource]);

  // Handle Search input enter redirection
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = new FormData(e.currentTarget).get("q") as string;
    if (query && query.trim()) {
      onNavigate(`#/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // Filter selection handler
  const handleSelectFilter = (id: string) => {
    setSelectedFilter(id);
    if (id === "all") return;
    if (id === "popular") {
      onNavigate("#/explore?tab=Popular");
    } else if (id === "user_ratings") {
      onNavigate("#/explore?tab=Popular"); // Use Popular as fallback or user rating
    } else {
      // It's a genre slug
      onNavigate(`#/explore?tab=Genres&genre=${id}`);
    }
  };

  // Build filter chips
  const staticChips = [
    { label: "Semua", id: "all", icon: Zap },
    { label: "Populer", id: "popular", icon: Flame },
    { label: "Rating Terbaik", id: "user_ratings", icon: Star },
  ];

  const genreChips = genres.map((g) => ({
    label: g.title,
    id: g.slug,
    icon: Award,
  }));

  const allChips = [...staticChips, ...genreChips];

  const handleCardClick = (slug: string) => {
    onNavigate(`#/detail/${slug}`);
  };

  const getLogoColorClass = () => {
    switch (accentColor) {
      case "green": return "bg-[#4ade80]";
      case "blue": return "bg-[#3b82f6]";
      case "purple": return "bg-[#a855f7]";
      case "orange": return "bg-[#f97316]";
      default: return "bg-[#e84545]";
    }
  };

  return (
    <div id="home-page-container" className="flex flex-col gap-6 pb-24 md:pb-10">
      
      {/* 1. Header (Mobile Only, Sidebar handles Desktop) */}
      <div id="home-header" className="flex items-center justify-between md:hidden pt-2">
        <div id="home-logo" className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg text-white ${getLogoColorClass()}`}>
            <Play size={14} fill="white" className="ml-0.5" />
          </div>
          <span className="text-lg font-extrabold tracking-wider text-white">
            Toon<span className="text-secondary text-sm font-normal">ora</span>
          </span>
        </div>
        <button 
          id="notif-bell" 
          className="p-2 bg-[#1e1f2e] border border-[#2a2b3d]/50 rounded-xl text-[#8b8c9e] hover:text-white transition-colors duration-200 cursor-pointer relative"
          onClick={() => alert("Tidak ada notifikasi baru.")}
        >
          <Bell size={18} />
          <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${getAccentBgClass()}`} />
        </button>
      </div>

      {/* 2. Search bar */}
      <form id="home-search-form" onSubmit={handleSearchSubmit} className="w-full">
        <div className={`flex items-center gap-3 bg-[#1e1f2e] border ${getAccentBorderClass()} px-4 py-3 rounded-xl shadow-inner transition-colors duration-300 group`}>
          <Search size={18} className="text-[#8b8c9e] group-focus-within:text-white transition-colors" />
          <input
            id="home-search-input"
            name="q"
            type="text"
            placeholder="Cari anime, film, genre..."
            className="bg-transparent text-sm text-white placeholder-[#8b8c9e] outline-none w-full"
          />
          <button type="button" onClick={() => onNavigate("#/explore")} className="text-[#8b8c9e] hover:text-white cursor-pointer">
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </form>

      {/* 3. Filter chips horizontal scroll */}
      <div id="home-filter-chips">
        <FilterChips
          chips={allChips}
          selectedId={selectedFilter}
          onSelect={handleSelectFilter}
        />
      </div>

      {error && (
        <div id="home-error" className="flex flex-col items-center justify-center p-8 bg-[#1e1f2e] border border-[#2a2b3d]/50 rounded-2xl gap-3">
          <AlertCircle size={40} className={getAccentTextClass()} />
          <p className="text-sm text-white font-medium text-center">{error}</p>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-[#252637] border border-[#2a2b3d]/60 rounded-xl text-xs font-semibold text-white hover:bg-[#2e3046] cursor-pointer"
          >
            <RefreshCw size={14} />
            Coba Lagi
          </button>
        </div>
      )}

      {!error && (
        <>
          {/* 4. Hero Carousel (Featured) */}
          <div id="home-hero-carousel">
            {loading ? (
              <div className="w-full h-[65vw] sm:h-[45vw] md:h-[40vw] max-h-[400px] min-h-[220px] rounded-2xl bg-[#1e1f2e] shimmer-animated animate-pulse" />
            ) : (
              <HeroCarousel 
                items={featured} 
                onPlayClick={handleCardClick} 
              />
            )}
          </div>

          {/* 5. Section "Sedang Tayang" (Ongoing) */}
          <div id="home-section-ongoing" className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Sedang Tayang
              </h2>
              <button 
                onClick={() => onNavigate("#/explore?tab=Ongoing")}
                className={`text-xs font-bold flex items-center gap-1 ${getAccentTextClass()} hover:opacity-85`}
              >
                Lihat Semua →
              </button>
            </div>

            {/* Horizontal scroll ongoing list */}
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
              {loading ? (
                <ShimmerSkeleton count={4} layout="cols-2" />
              ) : ongoing.length === 0 ? (
                <p className="text-xs text-[#8b8c9e] py-4">Tidak ada anime yang sedang tayang.</p>
              ) : (
                ongoing.map((anime, idx) => (
                  <div key={`${anime.slug}-ongoing-${idx}`} className="w-[140px] sm:w-[160px] shrink-0">
                    <AnimeCard anime={anime} onClick={handleCardClick} layout="cols-2" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 6. Section "Terbaru" (Recent Updates) */}
          <div id="home-section-recent" className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Terbaru
              </h2>
              <button 
                onClick={() => onNavigate("#/explore?tab=Latest")}
                className={`text-xs font-bold flex items-center gap-1 ${getAccentTextClass()} hover:opacity-85`}
              >
                Lihat Semua →
              </button>
            </div>

            {/* Horizontal scroll recent list */}
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
              {loading ? (
                <ShimmerSkeleton count={4} layout="cols-2" />
              ) : recent.length === 0 ? (
                <p className="text-xs text-[#8b8c9e] py-4">Tidak ada rilis terbaru.</p>
              ) : (
                recent.map((anime, idx) => (
                  <div key={`${anime.slug}-recent-${idx}`} className="w-[140px] sm:w-[160px] shrink-0">
                    <AnimeCard anime={anime} onClick={handleCardClick} layout="cols-2" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 7. Section "Populer" (Popular - Grid layout options) */}
          <div id="home-section-popular" className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Populer Pekan Ini
              </h2>
              <button 
                onClick={() => onNavigate("#/explore?tab=Popular")}
                className={`text-xs font-bold flex items-center gap-1 ${getAccentTextClass()} hover:opacity-85`}
              >
                Lihat Semua →
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <ShimmerSkeleton count={4} layout="cols-2" />
              </div>
            ) : popular.length === 0 ? (
              <p className="text-xs text-[#8b8c9e]">Tidak ada anime populer.</p>
            ) : (
              <div className={`grid gap-4 ${
                gridLayout === "cols-3" 
                  ? "grid-cols-3 md:grid-cols-4 lg:grid-cols-5" 
                  : gridLayout === "list" 
                    ? "grid-cols-1" 
                    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
              }`}>
                {popular.map((anime, idx) => (
                  <AnimeCard 
                    key={`${anime.slug}-popular-${idx}`} 
                    anime={anime} 
                    onClick={handleCardClick} 
                    layout={gridLayout === 'list' ? 'list' : gridLayout === 'cols-3' ? 'cols-3' : 'cols-2'} 
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
}
