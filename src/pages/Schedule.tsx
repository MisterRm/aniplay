import React, { useState, useEffect } from "react";
import { Calendar, AlertCircle, RefreshCw, Clock } from "lucide-react";
import { settings } from "../lib/settings";
import { AnimeRaw } from "../types";
import AnimeCard from "../components/AnimeCard";
import ShimmerSkeleton from "../components/ShimmerSkeleton";

interface ScheduleProps {
  onNavigate: (hash: string) => void;
}

export default function Schedule({ onNavigate }: ScheduleProps) {
  const days = [
    { label: "Senin", keyEng: "monday", keyInd: "senin" },
    { label: "Selasa", keyEng: "tuesday", keyInd: "selasa" },
    { label: "Rabu", keyEng: "wednesday", keyInd: "rabu" },
    { label: "Kamis", keyEng: "thursday", keyInd: "kamis" },
    { label: "Jumat", keyEng: "friday", keyInd: "jum'at" },
    { label: "Sabtu", keyEng: "saturday", keyInd: "sabtu" },
    { label: "Minggu", keyEng: "sunday", keyInd: "minggu" },
  ];

  // Detect current day
  const getCurrentDayIndex = () => {
    const todayNum = new Date().getDay(); // 0 is Sunday, 1 is Monday...
    // Re-align to index where 0 is Monday, 6 is Sunday
    return todayNum === 0 ? 6 : todayNum - 1;
  };

  const [activeDayIdx, setActiveDayIdx] = useState<number>(getCurrentDayIndex());
  const [scheduleData, setScheduleData] = useState<Record<string, AnimeRaw[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dataSource = settings.getDataSource();
  const accentColor = settings.getAccentColor();

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
      case "green": return "border-[#4ade80]";
      case "blue": return "border-[#3b82f6]";
      case "purple": return "border-[#a855f7]";
      case "orange": return "border-[#f97316]";
      default: return "border-[#e84545]"; // red
    }
  };

  const fetchSchedule = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/proxy?route=schedule&source=${dataSource}`);
      if (!res.ok) throw new Error("Gagal mengambil jadwal rilis anime.");
      const data = await res.json();
      setScheduleData(data || {});
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat memuat jadwal.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [dataSource]);

  // Extract anime for selected day
  const getSelectedDayAnime = (): AnimeRaw[] => {
    const activeDay = days[activeDayIdx];
    if (!scheduleData) return [];

    // Search keys robustly (by lower cased English or Indonesian name)
    const listEng = scheduleData[activeDay.keyEng.toLowerCase()] || [];
    const listInd = scheduleData[activeDay.keyInd.toLowerCase()] || [];
    
    // Fallbacks
    if (listEng.length > 0) return listEng;
    if (listInd.length > 0) return listInd;

    // Check key contains
    for (const rawKey in scheduleData) {
      const kLower = rawKey.toLowerCase();
      if (kLower === activeDay.keyEng || kLower === activeDay.keyInd || kLower.includes(activeDay.keyInd)) {
        return scheduleData[rawKey] || [];
      }
    }

    return [];
  };

  const activeAnimeList = getSelectedDayAnime();

  return (
    <div id="schedule-page" className="flex flex-col gap-6 pb-24 md:pb-10">
      
      {/* Header */}
      <div id="schedule-header" className="flex items-center gap-3">
        <Calendar className={getAccentTextClass()} size={24} />
        <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">Jadwal Rilis Anime</h1>
      </div>

      {/* Weekdays Tab Selector */}
      <div id="weekday-tabs-container" className="w-full overflow-x-auto scrollbar-hide py-1">
        <div id="weekday-tabs" className="flex gap-2 min-w-max">
          {days.map((day, idx) => {
            const isActive = activeDayIdx === idx;
            const isToday = getCurrentDayIndex() === idx;

            return (
              <button
                id={`day-tab-${day.keyEng}`}
                key={day.keyEng}
                onClick={() => setActiveDayIdx(idx)}
                className={`flex flex-col items-center justify-center min-w-16 px-4 py-3.5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  isActive
                    ? `${getAccentBgClass()} ${getAccentBorderClass()} shadow-lg scale-105`
                    : "bg-[#1e1f2e] border-[#2a2b3d]/50 text-[#8b8c9e] hover:text-white hover:border-[#2a2b3d]"
                }`}
              >
                <span className="text-sm font-extrabold tracking-wide">{day.label}</span>
                {isToday && (
                  <span className={`text-[9px] mt-1 font-bold uppercase tracking-widest px-1.5 py-0.25 rounded-md ${
                    isActive ? "bg-black/20 text-white" : "bg-[#252637] text-white"
                  }`}>
                    Hari Ini
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div id="schedule-error" className="flex flex-col items-center justify-center p-8 bg-[#1e1f2e] border border-[#2a2b3d]/50 rounded-2xl gap-3">
          <AlertCircle size={40} className={getAccentTextClass()} />
          <p className="text-sm text-white font-medium text-center">{error}</p>
          <button
            onClick={fetchSchedule}
            className="flex items-center gap-2 px-4 py-2 bg-[#252637] border border-[#2a2b3d]/60 rounded-xl text-xs font-semibold text-white hover:bg-[#2e3046] cursor-pointer"
          >
            <RefreshCw size={14} />
            Coba Lagi
          </button>
        </div>
      )}

      {/* List content */}
      {!error && (
        <div id="schedule-content" className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#8b8c9e] uppercase tracking-wider">
            <Clock size={14} className={getAccentTextClass()} />
            <span>Rilis Hari {days[activeDayIdx].label} ({activeAnimeList.length} Anime)</span>
          </div>

          {loading ? (
            <div className="flex flex-col gap-4">
              <ShimmerSkeleton count={3} layout="list" />
            </div>
          ) : activeAnimeList.length === 0 ? (
            <div id="schedule-empty" className="flex flex-col items-center justify-center py-16 bg-[#1e1f2e] border border-[#2a2b3d]/20 rounded-2xl text-center gap-3">
              <Calendar size={40} className="text-[#4a4b5e] mb-1" />
              <h3 className="text-sm font-bold text-white">Tidak Ada Jadwal Rilis</h3>
              <p className="text-xs text-[#8b8c9e] max-w-xs">
                Tidak ada anime yang dijadwalkan rilis pada hari {days[activeDayIdx].label} di server {dataSource}.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {activeAnimeList.map((anime, idx) => (
                <AnimeCard
                  key={`${anime.slug}-${idx}`}
                  anime={anime}
                  onClick={(slug) => onNavigate(`#/detail/${slug}`)}
                  layout="list"
                />
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
