import React, { useState, useEffect, useRef } from "react";
import { Play, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { settings } from "../lib/settings";
import { motion, AnimatePresence } from "motion/react";

interface HeroItem {
  slug: string;
  title: string;
  poster: string;
  genres?: string[] | null;
  score?: string | null;
}

interface HeroCarouselProps {
  items: HeroItem[];
  onPlayClick: (slug: string) => void;
}

export default function HeroCarousel({ items, onPlayClick }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const accentColor = settings.getAccentColor();

  const getAccentBgClass = () => {
    switch (accentColor) {
      case "green": return "bg-[#4ade80] hover:bg-[#4ade80]/90 text-black";
      case "blue": return "bg-[#3b82f6] hover:bg-[#3b82f6]/90 text-white";
      case "purple": return "bg-[#a855f7] hover:bg-[#a855f7]/90 text-white";
      case "orange": return "bg-[#f97316] hover:bg-[#f97316]/90 text-white";
      default: return "bg-[#e84545] hover:bg-[#e84545]/90 text-white"; // red
    }
  };

  const getDotActiveBgClass = () => {
    switch (accentColor) {
      case "green": return "bg-[#4ade80]";
      case "blue": return "bg-[#3b82f6]";
      case "purple": return "bg-[#a855f7]";
      case "orange": return "bg-[#f97316]";
      default: return "bg-[#e84545]"; // red
    }
  };

  // Auto sliding
  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [items.length]);

  if (!items || items.length === 0) return null;

  const currentItem = items[activeIndex];

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const threshold = 50; // minimum distance to swipe
    if (diffX > threshold) {
      handleNext();
    } else if (diffX < -threshold) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  return (
    <div 
      id="hero-carousel"
      className="relative w-full h-[65vw] sm:h-[45vw] md:h-[40vw] max-h-[400px] min-h-[220px] rounded-2xl overflow-hidden shadow-2xl group cursor-pointer border border-[#2a2b3d]/30"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={() => onPlayClick(currentItem.slug)}
    >
      {/* Slides with AnimatePresence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Main Hero Background Poster */}
          <img
            src={currentItem.poster}
            alt={currentItem.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top"
          />

          {/* Vignette Overlay (kiri + bawah kuat) */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#13141f] via-black/40 to-transparent md:bg-gradient-to-r md:from-[#13141f]/95 md:via-black/20 md:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#13141f] via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Hero Left Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8 md:p-10 z-10 max-w-xl">
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          {currentItem.score && (
            <span className="flex items-center gap-1 bg-[#1e1f2e]/90 text-amber-400 font-bold px-2 py-0.5 rounded-full text-xs border border-white/5 shadow-sm">
              <Star size={12} fill="currentColor" />
              {currentItem.score}
            </span>
          )}
          <span className="bg-[#1e1f2e]/90 text-white font-bold px-2 py-0.5 rounded-full text-[10px] tracking-wider uppercase border border-white/5">
            REKOMENDASI
          </span>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight line-clamp-2 drop-shadow-md mb-2">
          {currentItem.title}
        </h1>

        {/* Genres */}
        {currentItem.genres && currentItem.genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4 sm:mb-5">
            {currentItem.genres.map((genre, idx) => (
              <span 
                key={idx} 
                className="text-[10px] sm:text-xs text-[#8b8c9e] bg-[#1e1f2e]/80 border border-[#2a2b3d]/50 px-2.5 py-0.5 rounded-full shadow-sm"
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlayClick(currentItem.slug);
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-lg transform transition-transform duration-200 active:scale-95 w-fit ${getAccentBgClass()}`}
        >
          <Play size={16} fill="currentColor" />
          Tonton Sekarang
        </button>
      </div>

      {/* Chevron Navigation Arrows */}
      {items.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 border border-white/5 backdrop-blur-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 border border-white/5 backdrop-blur-sm"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Slide Dots Indicator */}
      {items.length > 1 && (
        <div className="absolute bottom-4 right-6 flex gap-1.5 z-20">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeIndex === idx 
                  ? `w-5 ${getDotActiveBgClass()}` 
                  : "w-1.5 bg-[#4a4b5e] hover:bg-white"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
