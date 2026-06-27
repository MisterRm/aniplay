import React, { useState, useEffect, useRef } from "react";
import { Search as SearchIcon, SlidersHorizontal, AlertCircle, ChevronLeft, ChevronRight, Inbox, RefreshCw } from "lucide-react";
import { settings } from "../lib/settings";
import { AnimeRaw } from "../types";
import AnimeCard from "../components/AnimeCard";
import ShimmerSkeleton from "../components/ShimmerSkeleton";

interface SearchProps {
  currentHash: string;
  onNavigate: (hash: string) => void;
}

export default function Search({ currentHash, onNavigate }: SearchProps) {
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animes, setAnimes] = useState<AnimeRaw[]>([]);
  
  // Pagination
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dataSource = settings.getDataSource();
  const accentColor = settings.getAccentColor();
  const gridLayout = settings.getGridLayout();

  // Parsing search query from hash if present (e.g. #/search?q=naruto)
  useEffect(() => {
    const parseQuery = () => {
      const match = currentHash.match(/\?q=([^&]+)/);
      if (match) {
        const queryVal = decodeURIComponent(match[1]);
        setKeyword(queryVal);
        setPage(1);
        searchAnime(queryVal, 1);
      } else {
        // Focus search bar if entering page empty
        setTimeout(() => {
          inputRef.current?.focus();
        }, 300);
      }
    };
    parseQuery();
  }, [currentHash, dataSource]);

  // Accent styling helpers
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
      case "green": return "border-[#4ade80]/20 focus-within:border-[#4ade80]";
      case "blue": return "border-[#3b82f6]/20 focus-within:border-[#3b82f6]";
      case "purple": return "border-[#a855f7]/20 focus-within:border-[#a855f7]";
      case "orange": return "border-[#f97316]/20 focus-within:border-[#f97316]";
      default: return "border-[#e84545]/20 focus-within:border-[#e84545]"; // red
    }
  };

  const searchAnime = async (searchWord: string, searchPage: number) => {
    if (!searchWord.trim()) {
      setAnimes([]);
      setHasNext(false);
      setHasPrev(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/proxy?route=search&keyword=${encodeURIComponent(searchWord)}&page=${searchPage}&source=${dataSource}`);
      if (!res.ok) throw new Error("Gagal melakukan pencarian anime.");
      const data = await res.json();
      
      const animeList = Array.isArray(data.animes) ? data.animes : [];
      setAnimes(animeList);
      
      // Pagination status
      if (data.pagination) {
        setHasNext(!!data.pagination.hasNext);
        setHasPrev(!!data.pagination.hasPrev);
        setPage(Number(data.pagination.currentPage || searchPage));
      } else {
        // If API doesn't provide pagination, simple fallback
        setHasNext(animeList.length >= 10);
        setHasPrev(searchPage > 1);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat mencari anime.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = (fd.get("keyword") as string) || "";
    if (q.trim()) {
      onNavigate(`#/search?q=${encodeURIComponent(q.trim())}`);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || loading) return;
    setPage(newPage);
    searchAnime(keyword, newPage);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSuggestionClick = (term: string) => {
    onNavigate(`#/search?q=${encodeURIComponent(term)}`);
  };

  const quickSuggestions = [
    "One Piece", "Naruto", "Demon Slayer", "Jujutsu Kaisen", "Attack on Titan", "Boruto"
  ];

  return (
    <div id="search-page" className="flex flex-col gap-6 pb-24 md:pb-10">
      
      {/* Search form */}
      <form id="search-form" onSubmit={handleSubmit} className="w-full">
        <div className={`flex items-center gap-3 bg-[#1e1f2e] border ${getAccentBorderClass()} px-4 py-3.5 rounded-xl shadow-inner transition-colors duration-300 group`}>
          <SearchIcon size={20} className="text-[#8b8c9e] group-focus-within:text-white transition-colors" />
          <input
            id="search-input"
            ref={inputRef}
            name="keyword"
            type="text"
            defaultValue={keyword}
            placeholder="Cari anime favoritmu..."
            className="bg-transparent text-sm text-white placeholder-[#8b8c9e] outline-none w-full"
          />
          <button type="button" onClick={() => onNavigate("#/explore")} className="text-[#8b8c9e] hover:text-white cursor-pointer">
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </form>

      {/* Suggested tags (if keyword is empty) */}
      {!keyword && (
        <div id="quick-suggestions-container" className="flex flex-col gap-3">
          <h3 className="text-xs font-bold text-[#8b8c9e] uppercase tracking-wider">
            Rekomendasi Pencarian
          </h3>
          <div id="quick-tags" className="flex flex-wrap gap-2">
            {quickSuggestions.map((term) => (
              <button
                key={term}
                onClick={() => handleSuggestionClick(term)}
                className="px-3 py-1.5 bg-[#1e1f2e] border border-[#2a2b3d]/60 rounded-xl text-xs text-[#8b8c9e] hover:text-white hover:border-[#2a2b3d] cursor-pointer transition-all duration-200"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div id="search-error" className="flex flex-col items-center justify-center p-8 bg-[#1e1f2e] border border-[#2a2b3d]/50 rounded-2xl gap-3">
          <AlertCircle size={40} className={getAccentTextClass()} />
          <p className="text-sm text-white font-medium text-center">{error}</p>
          <button
            onClick={() => searchAnime(keyword, page)}
            className="flex items-center gap-2 px-4 py-2 bg-[#252637] border border-[#2a2b3d]/60 rounded-xl text-xs font-semibold text-white hover:bg-[#2e3046] cursor-pointer"
          >
            <RefreshCw size={14} />
            Coba Lagi
          </button>
        </div>
      )}

      {/* Empty default state */}
      {!loading && !error && !keyword && (
        <div id="search-empty-state" className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <div className="w-16 h-16 rounded-full bg-[#1e1f2e] flex items-center justify-center text-[#4a4b5e] mb-2">
            <SearchIcon size={32} />
          </div>
          <h2 className="text-base font-bold text-white">Cari Anime Favoritmu</h2>
          <p className="text-xs text-[#8b8c9e] max-w-xs leading-relaxed">
            Ketik kata kunci judul anime, studio, karakter, atau genre di kolom atas untuk memulai pencarian.
          </p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div id="search-loading" className={`grid gap-4 ${
          gridLayout === "cols-3" 
            ? "grid-cols-3 md:grid-cols-4 lg:grid-cols-5" 
            : gridLayout === "list" 
              ? "grid-cols-1" 
              : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
        }`}>
          <ShimmerSkeleton count={6} layout={gridLayout === 'list' ? 'list' : gridLayout === 'cols-3' ? 'cols-3' : 'cols-2'} />
        </div>
      )}

      {/* Results view */}
      {!loading && !error && keyword && (
        <div id="search-results-section" className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#8b8c9e] uppercase tracking-wider">
              Hasil Pencarian: <span className="text-white normal-case">"{keyword}"</span>
            </h2>
            <span className="text-xs text-[#8b8c9e]">{animes.length} ditemukan</span>
          </div>

          {animes.length === 0 ? (
            <div id="search-no-results" className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <Inbox size={48} className="text-[#4a4b5e] mb-1" />
              <h3 className="text-base font-bold text-white">Tidak Ada Hasil</h3>
              <p className="text-xs text-[#8b8c9e] max-w-xs">
                Maaf, anime "{keyword}" tidak dapat ditemukan di server {dataSource}. Coba gunakan kata kunci lain atau ubah data source di pengaturan.
              </p>
            </div>
          ) : (
            <>
              {/* Cards Grid */}
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

              {/* Pagination buttons */}
              <div id="search-pagination" className="flex items-center justify-center gap-4 pt-6 border-t border-[#2a2b3d]/30">
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
