import React, { useState, useEffect } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, Compass, RefreshCw, Layers } from "lucide-react";
import { settings } from "../lib/settings";
import { AnimeRaw } from "../types";
import FilterChips from "../components/FilterChips";
import AnimeCard from "../components/AnimeCard";
import ShimmerSkeleton from "../components/ShimmerSkeleton";

interface ExploreProps {
  currentHash: string;
  onNavigate: (hash: string) => void;
}

export default function Explore({ currentHash, onNavigate }: ExploreProps) {
  const [activeTab, setActiveTab] = useState("Ongoing"); // Ongoing, Popular, Movies, Completed, Latest, Genres
  const [genres, setGenres] = useState<{ title: string; slug: string }[]>([]);
  const [selectedGenreSlug, setSelectedGenreSlug] = useState<string | null>(null);
  const [selectedGenreTitle, setSelectedGenreTitle] = useState<string | null>(null);
  
  const [page, setPage] = useState(1);
  const [animes, setAnimes] = useState<AnimeRaw[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination status
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const dataSource = settings.getDataSource();
  const accentColor = settings.getAccentColor();
  const gridLayout = settings.getGridLayout();

  // Parse initial state from hash
  useEffect(() => {
    const parseParams = () => {
      const matchGenre = currentHash.match(/genre=([^&]+)/);
      const matchTab = currentHash.match(/tab=([^&]+)/);
      
      let initialTab = "Ongoing";
      let initialGenreSlug: string | null = null;
      
      if (matchTab) {
        initialTab = decodeURIComponent(matchTab[1]);
      }
      
      if (matchGenre) {
        initialGenreSlug = decodeURIComponent(matchGenre[1]);
        initialTab = "Genres"; // Force tab to genres if genre slug is in url
      }

      setActiveTab(initialTab);
      setSelectedGenreSlug(initialGenreSlug);
      setPage(1);
      
      if (initialTab === "Genres") {
        fetchGenres(initialGenreSlug);
      } else {
        fetchCategoryData(initialTab, null, 1);
      }
    };
    
    parseParams();
  }, [currentHash, dataSource]);

  // Accent styles helper
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
      case "green": return "bg-[#4ade80] text-black";
      case "blue": return "bg-[#3b82f6] text-white";
      case "purple": return "bg-[#a855f7] text-white";
      case "orange": return "bg-[#f97316] text-white";
      default: return "bg-[#e84545] text-white"; // red
    }
  };

  const getAccentBorderClass = () => {
    switch (accentColor) {
      case "green": return "border-[#4ade80]/40 text-[#4ade80] bg-[#4ade80]/5";
      case "blue": return "border-[#3b82f6]/40 text-[#3b82f6] bg-[#3b82f6]/5";
      case "purple": return "border-[#a855f7]/40 text-[#a855f7] bg-[#a855f7]/5";
      case "orange": return "border-[#f97316]/40 text-[#f97316] bg-[#f97316]/5";
      default: return "border-[#e84545]/40 text-[#e84545] bg-[#e84545]/5"; // red
    }
  };

  const fetchGenres = async (genreSlugToLoad: string | null = null) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/proxy?route=genres&source=${dataSource}`);
      if (!res.ok) throw new Error("Gagal mengambil daftar genre anime.");
      const data = await res.json();
      const genreList = Array.isArray(data) ? data : [];
      setGenres(genreList);

      if (genreSlugToLoad) {
        const found = genreList.find(g => g.slug === genreSlugToLoad);
        if (found) {
          setSelectedGenreTitle(found.title);
          fetchCategoryData("Genres", genreSlugToLoad, 1);
          return;
        }
      }
      
      // If genre is not selected yet, don't load list, just show the genre selection
      setAnimes([]);
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat memuat daftar genre.");
      setLoading(false);
    }
  };

  const fetchCategoryData = async (tab: string, genreSlug: string | null, pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const gSlug = genreSlug || "";
      const res = await fetch(`/api/proxy?route=explore&tab=${tab}&genreSlug=${gSlug}&page=${pageNum}&source=${dataSource}`);
      if (!res.ok) throw new Error("Gagal mengambil data anime.");
      const data = await res.json();
      
      const animeList = Array.isArray(data.animes) ? data.animes : [];
      setAnimes(animeList);

      if (data.pagination) {
        setHasNext(!!data.pagination.hasNext);
        setHasPrev(!!data.pagination.hasPrev);
        setPage(Number(data.pagination.currentPage || pageNum));
      } else {
        setHasNext(animeList.length >= 10);
        setHasPrev(pageNum > 1);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat memuat daftar anime.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId: string) => {
    if (tabId === "Genres") {
      onNavigate("#/explore?tab=Genres");
    } else {
      onNavigate(`#/explore?tab=${tabId}`);
    }
  };

  const handleGenreClick = (genre: { title: string; slug: string }) => {
    setSelectedGenreTitle(genre.title);
    onNavigate(`#/explore?tab=Genres&genre=${genre.slug}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || loading) return;
    setPage(newPage);
    fetchCategoryData(activeTab, selectedGenreSlug, newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const chips = [
    { label: "Sedang Tayang", id: "Ongoing" },
    { label: "Populer", id: "Popular" },
    { label: "Film", id: "Movies" },
    { label: "Selesai", id: "Completed" },
    { label: "Terbaru", id: "Latest" },
    { label: "Genre", id: "Genres" },
  ];

  return (
    <div id="explore-page" className="flex flex-col gap-6 pb-24 md:pb-10">
      
      {/* Header */}
      <div id="explore-header" className="flex items-center gap-3">
        <Compass className={getAccentTextClass()} size={24} />
        <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">Explore Anime</h1>
      </div>

      {/* Categories select chips */}
      <div id="explore-chips">
        <FilterChips
          chips={chips}
          selectedId={activeTab}
          onSelect={handleTabChange}
        />
      </div>

      {/* Error state */}
      {error && (
        <div id="explore-error" className="flex flex-col items-center justify-center p-8 bg-[#1e1f2e] border border-[#2a2b3d]/50 rounded-2xl gap-3">
          <AlertCircle size={40} className={getAccentTextClass()} />
          <p className="text-sm text-white font-medium text-center">{error}</p>
          <button
            onClick={() => {
              if (activeTab === "Genres" && !selectedGenreSlug) {
                fetchGenres();
              } else {
                fetchCategoryData(activeTab, selectedGenreSlug, page);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#252637] border border-[#2a2b3d]/60 rounded-xl text-xs font-semibold text-white hover:bg-[#2e3046] cursor-pointer"
          >
            <RefreshCw size={14} />
            Coba Lagi
          </button>
        </div>
      )}

      {/* Category display details / Selected genre display header */}
      {activeTab === "Genres" && selectedGenreSlug && selectedGenreTitle && !error && (
        <div id="selected-genre-header" className="flex items-center justify-between bg-[#1e1f2e] border border-[#2a2b3d]/30 px-4 py-3.5 rounded-2xl">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#8b8c9e]">
            <Layers size={16} className={getAccentTextClass()} />
            Genre: <span className="text-white font-extrabold">{selectedGenreTitle}</span>
          </div>
          <button 
            onClick={() => onNavigate("#/explore?tab=Genres")}
            className={`text-xs font-bold ${getAccentTextClass()} hover:opacity-80`}
          >
            Pilih Genre Lain
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div id="explore-loading" className={`grid gap-4 ${
          gridLayout === "cols-3" 
            ? "grid-cols-3 md:grid-cols-4 lg:grid-cols-5" 
            : gridLayout === "list" 
              ? "grid-cols-1" 
              : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
        }`}>
          <ShimmerSkeleton count={6} layout={gridLayout === 'list' ? 'list' : gridLayout === 'cols-3' ? 'cols-3' : 'cols-2'} />
        </div>
      )}

      {/* Genre list selection (shown when tab is Genres and no slug is selected) */}
      {!loading && !error && activeTab === "Genres" && !selectedGenreSlug && (
        <div id="genre-selector-grid" className="flex flex-col gap-4">
          <h2 className="text-sm font-bold text-[#8b8c9e] uppercase tracking-wider">Pilih Kategori Genre</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {genres.map((g) => (
              <button
                key={g.slug}
                onClick={() => handleGenreClick(g)}
                className="px-4 py-3 bg-[#1e1f2e] border border-[#2a2b3d]/50 hover:border-[#2a2b3d] hover:bg-[#252637] transition-all duration-300 rounded-xl text-left cursor-pointer group flex items-center justify-between"
              >
                <span className="text-sm font-semibold text-white group-hover:text-white truncate pr-2">{g.title}</span>
                <span className="text-[10px] bg-[#252637] text-[#8b8c9e] px-1.5 py-0.5 rounded group-hover:bg-white/5">→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Anime results display */}
      {!loading && !error && (activeTab !== "Genres" || selectedGenreSlug) && (
        <div id="explore-results-section" className="flex flex-col gap-6">
          {animes.length === 0 ? (
            <div id="explore-empty" className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <Compass size={48} className="text-[#4a4b5e] mb-1" />
              <h3 className="text-base font-bold text-white">Tidak Ada Data</h3>
              <p className="text-xs text-[#8b8c9e] max-w-xs">
                Tidak ada anime ditemukan dalam kategori ini di server {dataSource}.
              </p>
            </div>
          ) : (
            <>
              {/* Anime grid */}
              <div className={`grid gap-4 ${
                gridLayout === "cols-3" 
                  ? "grid-cols-3 md:grid-cols-4 lg:grid-cols-5" 
                  : gridLayout === "list" 
                    ? "grid-cols-1" 
                    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
              }`}>
                {animes.map((anime, idx) => (
                  <AnimeCard
                    key={`${anime.slug}-${idx}`}
                    anime={anime}
                    onClick={(slug) => onNavigate(`#/detail/${slug}`)}
                    layout={gridLayout === 'list' ? 'list' : gridLayout === 'cols-3' ? 'cols-3' : 'cols-2'}
                  />
                ))}
              </div>

              {/* Pagination controls */}
              <div id="explore-pagination" className="flex items-center justify-center gap-4 pt-6 border-t border-[#2a2b3d]/30">
                <button
                  disabled={!hasPrev || loading}
                  onClick={() => handlePageChange(page - 1)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#1e1f2e] border border-[#2a2b3d]/60 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#252637] cursor-pointer transition-colors"
                >
                  <ChevronLeft size={14} />
                  Prev
                </button>
                <span className="text-xs font-bold text-[#8b8c9e]">
                  Halaman <span className="text-white">{page}</span>
                </span>
                <button
                  disabled={!hasNext || loading}
                  onClick={() => handlePageChange(page + 1)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#1e1f2e] border border-[#2a2b3d]/60 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#252637] cursor-pointer transition-colors"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

    </div>
  );
}
