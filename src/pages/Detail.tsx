import React, { useState, useEffect } from "react";
import { ChevronLeft, Share2, Tv, Heart, Play, PlayCircle, Eye, Calendar, Award, Info, AlertCircle, RefreshCw, Star, Sparkles, Copy, Check } from "lucide-react";
import { settings } from "../lib/settings";
import { DetailPayload, EpisodeItem } from "../types";
import AnimeCard from "../components/AnimeCard";

interface DetailProps {
  currentHash: string;
  onNavigate: (hash: string) => void;
}

export default function Detail({ currentHash, onNavigate }: DetailProps) {
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<DetailPayload | null>(null);
  const [readMore, setReadMore] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFav, setIsFav] = useState(false);

  const dataSource = settings.getDataSource();
  const accentColor = settings.getAccentColor();

  // Parse slug from hash
  useEffect(() => {
    const parseSlug = () => {
      const match = currentHash.match(/#\/detail\/([^?&]+)/);
      if (match) {
        const parsedSlug = match[1];
        setSlug(parsedSlug);
        fetchDetail(parsedSlug);
      }
    };
    parseSlug();
  }, [currentHash, dataSource]);

  // Load favorite status
  useEffect(() => {
    if (slug) {
      setIsFav(settings.isFavorite(slug));
    }
  }, [slug]);

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
      case "green": return "bg-[#4ade80] text-black hover:bg-[#4ade80]/90";
      case "blue": return "bg-[#3b82f6] text-white hover:bg-[#3b82f6]/90";
      case "purple": return "bg-[#a855f7] text-white hover:bg-[#a855f7]/90";
      case "orange": return "bg-[#f97316] text-white hover:bg-[#f97316]/90";
      default: return "bg-[#e84545] text-white hover:bg-[#e84545]/90"; // red
    }
  };

  const getAccentBgPillClass = () => {
    switch (accentColor) {
      case "green": return "bg-[#4ade80]/15 text-[#4ade80]";
      case "blue": return "bg-[#3b82f6]/15 text-[#3b82f6]";
      case "purple": return "bg-[#a855f7]/15 text-[#a855f7]";
      case "orange": return "bg-[#f97316]/15 text-[#f97316]";
      default: return "bg-[#e84545]/15 text-[#e84545]"; // red
    }
  };

  const fetchDetail = async (animeSlug: string) => {
    if (!animeSlug) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/proxy?route=detail&slug=${animeSlug}&source=${dataSource}`);
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("Anime ini diblokir karena kebijakan konten.");
        }
        throw new Error("Gagal mengambil rincian anime.");
      }
      const data = await res.json();
      setDetail(data);

      // Save to recent watch history (as entered view)
      settings.addToHistory({
        slug: animeSlug,
        title: data.title || "Unknown",
        poster: data.poster || "",
        score: data.score || "N/A",
        type: data.type || "N/A"
      });

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat memuat rincian anime.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = () => {
    if (!detail) return;
    const item = {
      slug,
      title: detail.title,
      poster: detail.poster,
      score: detail.score,
      type: detail.type,
    };
    const favState = settings.toggleFavorite(item);
    setIsFav(favState);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/#detail/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePlayFirstEpisode = () => {
    if (!detail || !detail.episodes || detail.episodes.length === 0) return;
    // Usually episodes are sorted descending or ascending. Play the first episode
    // Typically the first episode created is at the end of the array, or the beginning depending on site.
    // Let's find the episode with lowest number or just play index 0 or index length-1.
    // Animasu/Samehadaku lists episodes usually descending (Newest first, meaning Episode 1 is at index length-1).
    // Let's inspect the names. If episodes[length - 1] contains "01" or "1", play that, else default to episodes[0].
    const epCount = detail.episodes.length;
    let targetEpisode = detail.episodes[epCount - 1]; // Oldest / Ep 1 usually
    
    // Fallback search
    for (let i = epCount - 1; i >= 0; i--) {
      const name = detail.episodes[i].name.toLowerCase();
      if (name.includes("episode 01") || name.includes("episode 1") || name.includes("ep 01") || name.includes("ep 1")) {
        targetEpisode = detail.episodes[i];
        break;
      }
    }

    onNavigate(`#/watch/${targetEpisode.slug}`);
  };

  const handleBack = () => {
    // Check if we can history back
    if (window.history.length > 1) {
      window.history.back();
    } else {
      onNavigate("#/");
    }
  };

  if (loading) {
    return (
      <div id="detail-loading-container" className="flex flex-col gap-6 pb-24 animate-pulse">
        {/* Full bleed poster shimmer */}
        <div className="w-full h-[60vw] max-h-[320px] bg-[#1e1f2e] shimmer-animated" />
        <div className="px-4 flex flex-col gap-4">
          <div className="w-2/3 h-8 bg-[#1e1f2e] shimmer-animated rounded" />
          <div className="flex gap-2">
            <div className="w-16 h-5 bg-[#1e1f2e] shimmer-animated rounded-full" />
            <div className="w-16 h-5 bg-[#1e1f2e] shimmer-animated rounded-full" />
          </div>
          <div className="w-full h-24 bg-[#1e1f2e] shimmer-animated rounded-xl" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-10 bg-[#1e1f2e] shimmer-animated rounded" />
            <div className="h-10 bg-[#1e1f2e] shimmer-animated rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div id="detail-error" className="flex flex-col items-center justify-center p-8 bg-[#1e1f2e] border border-[#2a2b3d]/50 rounded-2xl gap-3 my-12">
        <AlertCircle size={40} className={getAccentTextClass()} />
        <p className="text-sm text-white font-medium text-center">{error || "Data anime tidak ditemukan."}</p>
        <div className="flex gap-3">
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-[#252637] border border-[#2a2b3d]/60 rounded-xl text-xs font-semibold text-white hover:bg-[#2e3046] cursor-pointer"
          >
            Kembali
          </button>
          <button
            onClick={() => fetchDetail(slug)}
            className="flex items-center gap-2 px-4 py-2 bg-[#252637] border border-[#2a2b3d]/60 rounded-xl text-xs font-semibold text-white hover:bg-[#2e3046] cursor-pointer"
          >
            <RefreshCw size={14} />
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="detail-page" className="flex flex-col pb-24 md:pb-10 -mx-4 md:-mx-0">
      
      {/* 1. Full bleed poster hero */}
      <div id="detail-hero-poster" className="relative w-full h-[65vw] max-h-[350px] min-h-[220px] bg-black">
        <img
          src={detail.poster}
          alt={detail.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-top blur-[0.5px]"
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#13141f] via-[#13141f]/30 to-black/40" />

        {/* Floating header buttons overlay */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
          <button
            onClick={handleBack}
            className="p-2.5 rounded-xl bg-[#1e1f2e]/80 border border-white/5 text-white backdrop-blur-md cursor-pointer transition-transform hover:scale-105"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl bg-[#1e1f2e]/80 border border-white/5 text-white backdrop-blur-md cursor-pointer transition-transform hover:scale-105 relative"
            >
              {copied ? <Check size={18} className="text-green-400 animate-bounce" /> : <Share2 size={18} />}
              {copied && (
                <span className="absolute -bottom-10 right-0 bg-[#252637] text-[10px] text-white px-2 py-1 rounded-md shadow-md whitespace-nowrap z-50">
                  Tautan disalin!
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Rating/Duration badge inside poster */}
        <div className="absolute bottom-4 left-4 flex gap-2 z-10">
          <span className="flex items-center gap-1 bg-[#1e1f2e]/90 text-amber-400 font-extrabold px-2.5 py-1 rounded-full text-xs shadow-md border border-white/5">
            <Star size={12} fill="currentColor" />
            {detail.score || "N/A"}
          </span>
          {detail.duration && detail.duration !== "N/A" && (
            <span className="bg-[#1e1f2e]/90 text-white font-semibold px-2.5 py-1 rounded-full text-xs shadow-md border border-white/5">
              {detail.duration}
            </span>
          )}
          {detail.type && (
            <span className="bg-[#1e1f2e]/90 text-[#8b8c9e] font-semibold px-2.5 py-1 rounded-full text-xs shadow-md border border-white/5 uppercase">
              {detail.type}
            </span>
          )}
        </div>
      </div>

      {/* Main details body */}
      <div id="detail-body" className="px-4 md:px-0 mt-4 flex flex-col gap-6">
        
        {/* Title & Metadata */}
        <div id="detail-header-text" className="flex flex-col gap-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
            {detail.title}
          </h1>

          {/* Genres row */}
          {detail.genres && detail.genres.length > 0 && (
            <div id="detail-genres" className="flex flex-wrap gap-1.5 items-center">
              {detail.season && detail.season !== "N/A" && (
                <span className="text-xs text-[#8b8c9e] mr-1.5 font-bold uppercase tracking-wider">{detail.season}</span>
              )}
              {detail.genres.map((g) => (
                <button
                  key={g.slug}
                  onClick={() => onNavigate(`#/explore?tab=Genres&genre=${g.slug}`)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${getAccentBgPillClass()} border border-transparent hover:border-current/10 cursor-pointer`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Play all Episodes & Favorite Controls */}
        <div id="detail-action-bar" className="flex items-center gap-3">
          <button
            disabled={!detail.episodes || detail.episodes.length === 0}
            onClick={handlePlayFirstEpisode}
            className={`flex-grow flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm shadow-lg transform transition-transform duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${getAccentBgClass()}`}
          >
            <Play size={18} fill="currentColor" />
            Tonton Episode Pertama
          </button>
          
          {/* Bookmark Heart Button */}
          <button
            onClick={handleToggleFavorite}
            className={`p-3.5 rounded-xl border transition-all duration-300 cursor-pointer shadow-md ${
              isFav 
                ? `${getAccentBgPillClass()} border-current/25 scale-105` 
                : "bg-[#1e1f2e] border-[#2a2b3d]/50 text-[#8b8c9e] hover:text-white"
            }`}
          >
            <Heart size={20} fill={isFav ? "currentColor" : "none"} className={isFav ? "animate-pulse" : ""} />
          </button>
        </div>

        {/* Synopsis "Tentang" */}
        {detail.synopsis && (
          <div id="detail-about" className="flex flex-col gap-2 bg-[#1e1f2e]/40 p-4 border border-[#2a2b3d]/30 rounded-2xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={14} className={getAccentTextClass()} />
              Sinopsis
            </h2>
            <p className={`text-xs sm:text-sm text-[#8b8c9e] leading-relaxed transition-all duration-300 ${
              readMore ? "" : "line-clamp-3"
            }`}>
              {detail.synopsis}
            </p>
            <button
              onClick={() => setReadMore(!readMore)}
              className={`text-xs font-bold text-left ${getAccentTextClass()} hover:underline mt-1 cursor-pointer`}
            >
              {readMore ? "Sembunyikan" : "Baca Selengkapnya"}
            </button>
          </div>
        )}

        {/* Detailed Metadata Grid */}
        <div id="detail-meta-grid" className="bg-[#1e1f2e] border border-[#2a2b3d]/40 rounded-2xl p-4 flex flex-col gap-3">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#2a2b3d]/40">
            <Info size={14} className={getAccentTextClass()} />
            Informasi Anime
          </h2>
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs sm:text-sm">
            <div>
              <p className="text-[#4a4b5e] font-bold uppercase tracking-wider text-[10px]">Status</p>
              <p className="text-white font-medium mt-0.5">{detail.status || "N/A"}</p>
            </div>
            <div>
              <p className="text-[#4a4b5e] font-bold uppercase tracking-wider text-[10px]">Tipe</p>
              <p className="text-white font-medium mt-0.5">{detail.type || "N/A"}</p>
            </div>
            <div>
              <p className="text-[#4a4b5e] font-bold uppercase tracking-wider text-[10px]">Tanggal Rilis</p>
              <p className="text-white font-medium mt-0.5">{detail.aired || "N/A"}</p>
            </div>
            <div>
              <p className="text-[#4a4b5e] font-bold uppercase tracking-wider text-[10px]">Studio</p>
              <p className="text-white font-medium mt-0.5">{detail.studios || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Episodes Section */}
        <div id="detail-episodes" className="flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Tv size={18} className={getAccentTextClass()} />
              Daftar Episode ({detail.episodes?.length || 0})
            </h2>
            <span className="text-xs font-medium text-[#8b8c9e] bg-[#1e1f2e] border border-[#2a2b3d]/50 px-2.5 py-1 rounded-full">
              Season 1
            </span>
          </div>

          {!detail.episodes || detail.episodes.length === 0 ? (
            <p className="text-xs text-[#8b8c9e] py-6 text-center bg-[#1e1f2e] rounded-2xl border border-[#2a2b3d]/20">
              Episode belum tersedia untuk anime ini.
            </p>
          ) : (
            <div id="episodes-list" className="flex flex-col gap-2.5">
              {detail.episodes.map((ep, idx) => {
                // Map a mock episode thumb that looks clean
                return (
                  <div
                    id={`episode-row-${ep.slug}`}
                    key={ep.slug}
                    onClick={() => onNavigate(`#/watch/${ep.slug}`)}
                    className="flex items-center justify-between bg-[#1e1f2e] border border-[#2a2b3d]/55 hover:border-[#2a2b3d] p-2 rounded-xl cursor-pointer hover:bg-[#252637] transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Play Button Icon wrapper */}
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-[#252637] flex items-center justify-center">
                        <img 
                          src={detail.poster} 
                          referrerPolicy="no-referrer"
                          alt={ep.name}
                          className="absolute inset-0 w-full h-full object-cover opacity-35 blur-[0.2px]"
                        />
                        <PlayCircle size={20} className="relative text-white/80 group-hover:text-[#e84545] transition-colors duration-200" />
                      </div>
                      
                      <div className="flex flex-col min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-white line-clamp-1 group-hover:text-[#e84545] transition-colors duration-200">
                          {ep.name}
                        </p>
                        <p className="text-[10px] text-[#8b8c9e] mt-0.5">
                          Tonton gratis sekarang
                        </p>
                      </div>
                    </div>

                    <button className="p-2 text-[#8b8c9e] group-hover:text-white transition-colors">
                      <Play size={14} fill="currentColor" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recommended list */}
        {detail.recommended && detail.recommended.length > 0 && (
          <div id="detail-recommendations" className="flex flex-col gap-3 pt-4">
            <h2 className="text-base font-bold text-white tracking-tight">Rekomendasi Serupa</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
              {detail.recommended.map((anime, idx) => (
                <div key={`${anime.slug}-${idx}`} className="w-[140px] sm:w-[160px] shrink-0">
                  <AnimeCard
                    anime={anime}
                    onClick={(recSlug) => onNavigate(`#/detail/${recSlug}`)}
                    layout="cols-2"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
