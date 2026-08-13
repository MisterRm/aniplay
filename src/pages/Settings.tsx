import React, { useState, useEffect } from "react";
import { Settings as SettingsIcon, Palette, Database, Info, LayoutGrid, Type, Trash2, Heart, History, Trash, Check, Clock } from "lucide-react";
import { settings, SavedAnime, HistoryItem } from "../lib/settings";
import { AccentColor, TextSize, GridLayout, DataSource } from "../types";

interface SettingsProps {
  onNavigate: (hash: string) => void;
}

export default function Settings({ onNavigate }: SettingsProps) {
  // Config states
  const [accent, setAccent] = useState<AccentColor>("red");
  const [textSize, setTextSize] = useState<TextSize>("sedang");
  const [layout, setLayout] = useState<GridLayout>("cols-2");
  const [source, setSource] = useState<DataSource>("Dayynime-v1");
  
  // User data lists
  const [favorites, setFavorites] = useState<SavedAnime[]>([]);
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);

  // Toast confirmation
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadSettings = () => {
    setAccent(settings.getAccentColor());
    setTextSize(settings.getTextSize());
    setLayout(settings.getGridLayout());
    setSource(settings.getDataSource());
    setFavorites(settings.getFavorites());
    setHistoryList(settings.getHistory());
  };

  useEffect(() => {
    loadSettings();

    // Listeners for data updates
    const handleFavs = () => setFavorites(settings.getFavorites());
    const handleHist = () => setHistoryList(settings.getHistory());
    
    window.addEventListener("favorites_changed", handleFavs);
    window.addEventListener("history_changed", handleHist);
    
    return () => {
      window.removeEventListener("favorites_changed", handleFavs);
      window.removeEventListener("history_changed", handleHist);
    };
  }, []);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleAccentChange = (color: AccentColor) => {
    settings.setAccentColor(color);
    setAccent(color);
    triggerToast("Warna aksen berhasil diperbarui!");
  };

  const handleTextSizeChange = (size: TextSize) => {
    settings.setTextSize(size);
    setTextSize(size);
    triggerToast(`Ukuran teks diubah menjadi ${size}!`);
  };

  const handleLayoutChange = (lay: GridLayout) => {
    settings.setGridLayout(lay);
    setLayout(lay);
    triggerToast("Tata letak grid berhasil diubah!");
  };

  const handleSourceChange = (src: DataSource) => {
    settings.setDataSource(src);
    setSource(src);
    triggerToast(`Sumber data berhasil diganti ke ${src}!`);
  };

  const handleClearHistory = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus seluruh riwayat tontonan?")) {
      settings.clearHistory();
      triggerToast("Seluruh riwayat tontonan dihapus.");
    }
  };

  const handleRemoveFavorite = (anime: SavedAnime, e: React.MouseEvent) => {
    e.stopPropagation();
    settings.toggleFavorite(anime);
    triggerToast(`Menghapus ${anime.title} dari favorit.`);
  };

  // Color mappings
  const colors: { name: AccentColor; hex: string; bg: string }[] = [
    { name: "red", hex: "#e84545", bg: "bg-[#e84545]" },
    { name: "green", hex: "#4ade80", bg: "bg-[#4ade80]" },
    { name: "blue", hex: "#3b82f6", bg: "bg-[#3b82f6]" },
    { name: "purple", hex: "#a855f7", bg: "bg-[#a855f7]" },
    { name: "orange", hex: "#f97316", bg: "bg-[#f97316]" },
  ];

  const getAccentTextClass = () => {
    switch (accent) {
      case "green": return "text-[#4ade80]";
      case "blue": return "text-[#3b82f6]";
      case "purple": return "text-[#a855f7]";
      case "orange": return "text-[#f97316]";
      default: return "text-[#e84545]"; // red
    }
  };

  const getAccentBgClass = () => {
    switch (accent) {
      case "green": return "bg-[#4ade80]/15 text-[#4ade80] border-[#4ade80]/20";
      case "blue": return "bg-[#3b82f6]/15 text-[#3b82f6] border-[#3b82f6]/20";
      case "purple": return "bg-[#a855f7]/15 text-[#a855f7] border-[#a855f7]/20";
      case "orange": return "bg-[#f97316]/15 text-[#f97316] border-[#f97316]/20";
      default: return "bg-[#e84545]/15 text-[#e84545] border-[#e84545]/20"; // red
    }
  };

  const getAccentActiveBgClass = () => {
    switch (accent) {
      case "green": return "bg-[#4ade80] text-black";
      case "blue": return "bg-[#3b82f6] text-white";
      case "purple": return "bg-[#a855f7] text-white";
      case "orange": return "bg-[#f97316] text-white";
      default: return "bg-[#e84545] text-white"; // red
    }
  };

  return (
    <div id="settings-page" className="flex flex-col gap-6 pb-24 md:pb-10 px-4 md:px-0">
      
      {/* Header */}
      <div id="settings-header" className="flex items-center gap-3">
        <SettingsIcon className={getAccentTextClass()} size={24} />
        <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">Pengaturan Aplikasi</h1>
      </div>

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#1e1f2e] border border-[#2a2b3d] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Check size={14} className={getAccentTextClass()} />
          {toastMsg}
        </div>
      )}

      {/* SECTION 1: TAMPILAN */}
      <div id="settings-section-appearance" className="bg-[#1e1f2e] border border-[#2a2b3d]/45 p-4 rounded-2xl flex flex-col gap-5 shadow-sm">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2.5 border-b border-[#2a2b3d]/40">
          <Palette size={14} className={getAccentTextClass()} />
          Tampilan Visual
        </h2>

        {/* 1. Accent Color picker */}
        <div className="flex flex-col gap-2.5">
          <p className="text-xs text-[#8b8c9e] font-semibold">Pilih Warna Aksen</p>
          <div className="flex items-center gap-3.5">
            {colors.map((col) => {
              const isAct = accent === col.name;
              return (
                <button
                  key={col.name}
                  onClick={() => handleAccentChange(col.name)}
                  className={`w-8 h-8 rounded-full cursor-pointer transition-transform duration-200 flex items-center justify-center relative shadow-inner ${col.bg} hover:scale-110`}
                >
                  {isAct && (
                    <div className="w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center shadow-lg">
                      <div className={`w-2 h-2 rounded-full ${col.bg}`} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Text Sizing */}
        <div className="flex flex-col gap-2.5">
          <p className="text-xs text-[#8b8c9e] font-semibold flex items-center gap-1.5">
            <Type size={14} />
            Ukuran Teks
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(["kecil", "sedang", "besar"] as TextSize[]).map((sz) => {
              const isAct = textSize === sz;
              return (
                <button
                  key={sz}
                  onClick={() => handleTextSizeChange(sz)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold cursor-pointer border transition-colors capitalize ${
                    isAct ? getAccentActiveBgClass() : "bg-[#252637] text-[#8b8c9e] border-[#2a2b3d]/40 hover:text-white"
                  }`}
                >
                  {sz}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Grid layout modes */}
        <div className="flex flex-col gap-2.5">
          <p className="text-xs text-[#8b8c9e] font-semibold flex items-center gap-1.5">
            <LayoutGrid size={14} />
            Tata Letak Poster
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "cols-2", label: "2 Kolom" },
              { id: "cols-3", label: "3 Kolom" },
              { id: "list", label: "List Mode" },
            ].map((lay) => {
              const isAct = layout === lay.id;
              return (
                <button
                  key={lay.id}
                  onClick={() => handleLayoutChange(lay.id as GridLayout)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold cursor-pointer border transition-colors ${
                    isAct ? getAccentActiveBgClass() : "bg-[#252637] text-[#8b8c9e] border-[#2a2b3d]/40 hover:text-white"
                  }`}
                >
                  {lay.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 2: DATA & SUMBER API */}
      <div id="settings-section-data" className="bg-[#1e1f2e] border border-[#2a2b3d]/45 p-4 rounded-2xl flex flex-col gap-4 shadow-sm">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2.5 border-b border-[#2a2b3d]/40">
          <Database size={14} className={getAccentTextClass()} />
          Sumber Data (API)
        </h2>

        {/* Sources switch buttons */}
        <div className="flex flex-col gap-2.5">
          <p className="text-xs text-[#8b8c9e] font-semibold">Ubah Server Anime Utama</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "Dayynime-v1", label: "Dayynime v1 (Animasu)" },
              { id: "Dayynime-v2", label: "Dayynime v2 (Samehadaku)" },
            ].map((src) => {
              const isAct = source === src.id;
              return (
                <button
                  key={src.id}
                  onClick={() => handleSourceChange(src.id as DataSource)}
                  className={`py-3 px-3 rounded-xl text-xs font-bold cursor-pointer border transition-all text-center leading-snug ${
                    isAct ? getAccentActiveBgClass() : "bg-[#252637] text-[#8b8c9e] border-[#2a2b3d]/40 hover:text-white"
                  }`}
                >
                  {src.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 3: FAVORIT SAYA (Saved Bookmarks) */}
      <div id="settings-section-favorites" className="bg-[#1e1f2e] border border-[#2a2b3d]/45 p-4 rounded-2xl flex flex-col gap-4 shadow-sm">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2.5 border-b border-[#2a2b3d]/40">
          <Heart size={14} className={getAccentTextClass()} fill="currentColor" />
          Anime Terfavorit ({favorites.length})
        </h2>

        {favorites.length === 0 ? (
          <p className="text-xs text-[#8b8c9e] py-4 text-center">Belum ada anime favorit disimpan.</p>
        ) : (
          <div id="settings-favorites-list" className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
            {favorites.map((anime) => (
              <div
                key={anime.slug}
                onClick={() => onNavigate(`#/detail/${anime.slug}`)}
                className="flex items-center justify-between bg-[#13141f] border border-[#2a2b3d]/45 p-2 rounded-xl cursor-pointer hover:bg-[#252637]/40 group"
              >
                <div className="flex items-center gap-3">
                  <img src={anime.poster} alt={anime.title} referrerPolicy="no-referrer" className="w-9 h-12 object-cover rounded-lg" />
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-[#e84545] transition-colors">{anime.title}</p>
                    <p className="text-[10px] text-[#8b8c9e] mt-0.5">{anime.type || "TV Series"}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => handleRemoveFavorite(anime, e)}
                  className="p-1.5 text-[#8b8c9e] hover:text-red-400 cursor-pointer"
                  title="Hapus"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 4: RIWAYAT TONTON (Watch logs) */}
      <div id="settings-section-history" className="bg-[#1e1f2e] border border-[#2a2b3d]/45 p-4 rounded-2xl flex flex-col gap-4 shadow-sm">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#2a2b3d]/40">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <History size={14} className={getAccentTextClass()} />
            Riwayat Nonton ({historyList.length})
          </h2>
          {historyList.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-[10px] font-extrabold text-[#8b8c9e] hover:text-red-400 flex items-center gap-1 cursor-pointer"
            >
              <Trash size={12} />
              Hapus Semua
            </button>
          )}
        </div>

        {historyList.length === 0 ? (
          <p className="text-xs text-[#8b8c9e] py-4 text-center">Belum ada riwayat tontonan disimpan.</p>
        ) : (
          <div id="settings-history-list" className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
            {historyList.map((item, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate(item.lastEpisodeSlug ? `#/watch/${item.lastEpisodeSlug}` : `#/detail/${item.slug}`)}
                className="flex items-center justify-between bg-[#13141f] border border-[#2a2b3d]/45 p-2 rounded-xl cursor-pointer hover:bg-[#252637]/40 group animate-fadeIn"
              >
                <div className="flex items-center gap-3">
                  <img src={item.poster} alt={item.title} referrerPolicy="no-referrer" className="w-9 h-12 object-cover rounded-lg opacity-85" />
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-[#e84545] transition-colors line-clamp-1">{item.title}</p>
                    <p className="text-[10px] text-[#8b8c9e] mt-0.5 flex items-center gap-1 truncate">
                      <Clock size={10} />
                      {item.lastEpisode ? `Menonton ${item.lastEpisode}` : "Dilihat"}
                    </p>
                  </div>
                </div>
                <span className="text-[9px] text-[#4a4b5e] bg-[#252637] px-1.5 py-0.5 rounded shrink-0">
                  {new Date(item.watchedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 5: TENTANG KAMI */}
      <div id="settings-section-about" className="bg-[#1e1f2e] border border-[#2a2b3d]/45 p-4 rounded-2xl flex flex-col gap-3 shadow-sm text-xs text-[#8b8c9e] leading-relaxed">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2.5 border-b border-[#2a2b3d]/40">
          <Info size={14} className={getAccentTextClass()} />
          Tentang Toonora
        </h2>
        <p className="font-bold text-white">Toonora Streaming Premium v2.0</p>
        <p>Aplikasi streaming anime modern, responsive, dan premium yang dirancang khusus untuk pengalaman menonton terbaik. Didukung oleh proxy serverless berkecepatan tinggi.</p>
        <p className="border-t border-[#2a2b3d]/30 pt-2 text-[10px] text-[#4a4b5e] mt-1 font-mono">
          Made with Love in React + Tailwind CSS by AI Assistant.
        </p>
      </div>

    </div>
  );
}
