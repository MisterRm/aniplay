import React from "react";
import { Star, PlayCircle } from "lucide-react";
import { settings } from "../lib/settings";
import { AnimeRaw } from "../types";

interface AnimeCardProps {
  key?: React.Key | null;
  anime: AnimeRaw;
  onClick: (slug: string) => void;
  layout?: 'cols-2' | 'cols-3' | 'list';
}

export default function AnimeCard({ anime, onClick, layout = 'cols-2' }: AnimeCardProps) {
  const accentColor = settings.getAccentColor();

  const getAccentBgClass = () => {
    switch (accentColor) {
      case "green": return "bg-[#4ade80]";
      case "blue": return "bg-[#3b82f6]";
      case "purple": return "bg-[#a855f7]";
      case "orange": return "bg-[#f97316]";
      default: return "bg-[#e84545]"; // red
    }
  };

  const getAccentTextClass = () => {
    switch (accentColor) {
      case "green": return "text-[#4ade80]";
      case "blue": return "text-[#3b82f6]";
      case "purple": return "text-[#a855f7]";
      case "orange": return "text-[#f97316]";
      default: return "text-[#e84545]"; // red
    }
  };

  // Safe fallback score / rating
  const rawScore = anime.score || "N/A";
  const formattedScore = typeof rawScore === "number" ? Number(rawScore).toFixed(1) : rawScore;

  // Safe genres (take first 1 or 2)
  const genres = anime.genres && Array.isArray(anime.genres) ? anime.genres.slice(0, 2) : [];

  if (layout === 'list') {
    return (
      <div 
        id={`anime-list-card-${anime.slug}`}
        onClick={() => onClick(anime.slug)}
        className="flex items-center gap-4 bg-[#1e1f2e] border border-[#2a2b3d]/50 p-3 rounded-2xl cursor-pointer transition-all duration-300 hover:border-[#2a2b3d] hover:bg-[#252637] group w-full"
      >
        {/* Left Poster */}
        <div id="list-card-poster-container" className="relative w-20 h-28 rounded-xl overflow-hidden shrink-0 shadow-md">
          <img 
            src={anime.poster || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300"} 
            alt={anime.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {anime.type && (
            <div id="list-card-type-badge" className="absolute bottom-1 left-1 bg-black/75 px-1.5 py-0.5 rounded text-[9px] font-bold text-white uppercase tracking-wider">
              {anime.type}
            </div>
          )}
        </div>

        {/* Right Info */}
        <div id="list-card-info" className="flex flex-col flex-grow min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span id="list-card-rating" className="flex items-center gap-1 text-xs text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded-full">
              <Star size={12} fill="currentColor" />
              {formattedScore}
            </span>
            {anime.episode && (
              <span id="list-card-ep" className="text-[11px] font-medium text-[#8b8c9e] bg-[#252637] px-2 py-0.5 rounded-full">
                EP {anime.episode}
              </span>
            )}
          </div>

          <h3 id="list-card-title" className="text-white font-bold text-sm sm:text-base line-clamp-1 group-hover:text-[#e84545] transition-colors duration-200">
            {anime.title}
          </h3>

          {/* Genres */}
          {genres.length > 0 && (
            <div id="list-card-genres" className="flex flex-wrap gap-1 mt-1.5">
              {genres.map((g, idx) => (
                <span 
                  key={idx} 
                  className="text-[10px] font-medium text-[#8b8c9e] bg-[#252637] px-1.5 py-0.5 rounded"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Status or release */}
          <div id="list-card-meta" className="flex items-center justify-between mt-auto pt-1 text-[11px] text-[#8b8c9e]">
            <span>{anime.status || anime.release || "Selesai"}</span>
            {anime.estimation && (
              <span className={`font-semibold ${getAccentTextClass()}`}>{anime.estimation}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid sizes: cols-3 is smaller (110px width approx), cols-2 is standard (160px approx)
  const isCols3 = layout === 'cols-3';

  return (
    <div 
      id={`anime-grid-card-${anime.slug}`}
      onClick={() => onClick(anime.slug)}
      className="relative flex flex-col bg-[#1e1f2e] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group border border-[#2a2b3d]/30 aspect-[2/3] w-full"
    >
      {/* Poster image full-bleed */}
      <img 
        src={anime.poster || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400"} 
        alt={anime.title}
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
      />

      {/* Dark overlay bottom to top */}
      <div id="grid-card-overlay" className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

      {/* Rating badge - top right */}
      <div 
        id="grid-card-rating-badge"
        className="absolute top-2 right-2 bg-[#1e1f2e]/85 backdrop-blur-md flex items-center gap-1 rounded-full px-2 py-0.5 shadow-md border border-white/5 text-[10px] sm:text-xs text-amber-400 font-bold"
      >
        <Star size={11} fill="currentColor" />
        <span>{formattedScore}</span>
      </div>

      {/* Type badge - top left */}
      {anime.type && (
        <div id="grid-card-type-badge" className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-bold text-white uppercase tracking-wider">
          {anime.type}
        </div>
      )}

      {/* Bottom context container */}
      <div id="grid-card-content" className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3.5 flex flex-col justify-end">
        {/* Genre badge inside card (if present) */}
        {genres.length > 0 && !isCols3 && (
          <div id="grid-card-genres" className="flex gap-1 mb-1.5 flex-wrap">
            <span className={`text-[9px] font-bold text-white uppercase tracking-wider px-1.5 py-0.5 rounded ${getAccentBgClass()}`}>
              {genres[0]}
            </span>
          </div>
        )}

        {/* Title */}
        <h3 id="grid-card-title" className={`text-white font-bold tracking-tight line-clamp-2 leading-snug group-hover:${getAccentTextClass()} transition-colors duration-200 ${
          isCols3 ? "text-xs" : "text-sm sm:text-base"
        }`}>
          {anime.title}
        </h3>

        {/* Episode info */}
        <div id="grid-card-footer" className="flex items-center justify-between mt-1 text-[10px] sm:text-xs text-[#8b8c9e]">
          <span>{anime.episode ? `Episode ${anime.episode}` : anime.status || "Completed"}</span>
          {anime.estimation && (
            <span className={`font-semibold shrink-0 ${getAccentTextClass()}`}>{anime.estimation}</span>
          )}
        </div>
      </div>
    </div>
  );
}
