import React, { useState, useEffect } from "react";
import { Download as DownloadIcon, ChevronDown, ChevronUp, AlertCircle, RefreshCw, ArrowLeft, FileVideo, HardDrive, Check } from "lucide-react";
import { settings } from "../lib/settings";
import { EpisodePayload } from "../types";

interface DownloadProps {
  currentHash: string;
  onNavigate: (hash: string) => void;
}

export default function Download({ currentHash, onNavigate }: DownloadProps) {
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [episodeData, setEpisodeData] = useState<EpisodePayload | null>(null);
  const [expandedEpisode, setExpandedEpisode] = useState<boolean>(true);
  const [downloadingQuality, setDownloadingQuality] = useState<string | null>(null);

  const dataSource = settings.getDataSource();
  const accentColor = settings.getAccentColor();

  useEffect(() => {
    const parseSlug = () => {
      const match = currentHash.match(/#\/download\/([^?&]+)/);
      if (match) {
        setSlug(match[1]);
        fetchEpisodeData(match[1]);
      }
    };
    parseSlug();
  }, [currentHash, dataSource]);

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

  const fetchEpisodeData = async (epSlug: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/proxy?route=episode&slug=${epSlug}&source=${dataSource}`);
      if (!res.ok) throw new Error("Gagal mengambil rincian tautan unduhan.");
      const data = await res.json();
      setEpisodeData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat memuat server unduhan.");
    } finally {
      setLoading(false);
    }
  };

  const getParentSlug = () => {
    if (episodeData?.animeId) return episodeData.animeId;
    const match = slug.match(/^(.+)-episode-(\d+(?:-\d+)?)$/);
    return match ? match[1] : "";
  };

  const handleDownloadTrigger = (quality: string) => {
    setDownloadingQuality(quality);
    setTimeout(() => {
      setDownloadingQuality(null);
      // Trigger a direct link download in a new tab
      const finalUrl = episodeData?.defaultStreamingUrl || "https://www.sankavollerei.com";
      window.open(finalUrl, "_blank");
    }, 2000);
  };

  const qualities = [
    { name: "360p", desc: "SD Hemat Kuota", size: "95 MB", format: "MP4 (H.264)" },
    { name: "480p", desc: "Standard Definition", size: "155 MB", format: "MP4 (H.264)" },
    { name: "720p", desc: "High Definition", size: "290 MB", format: "MKV (H.264)" },
    { name: "1080p", desc: "Full High Definition", size: "520 MB", format: "MKV (HEVC)" },
  ];

  return (
    <div id="download-page" className="flex flex-col gap-6 pb-24 md:pb-10 px-4 md:px-0">
      
      {/* Back button header */}
      <div id="download-back-header">
        <button
          onClick={() => onNavigate(`#/watch/${slug}`)}
          className="flex items-center gap-2 text-xs font-bold text-[#8b8c9e] hover:text-white cursor-pointer"
        >
          <ArrowLeft size={16} />
          Kembali ke Player Nonton
        </button>
      </div>

      {error && (
        <div id="download-error" className="flex flex-col items-center justify-center p-8 bg-[#1e1f2e] border border-[#2a2b3d]/50 rounded-2xl gap-3 text-center">
          <AlertCircle size={40} className={getAccentTextClass()} />
          <p className="text-sm text-white font-medium">{error}</p>
          <button
            onClick={() => fetchEpisodeData(slug)}
            className="flex items-center gap-2 px-4 py-2 bg-[#252637] border border-[#2a2b3d]/60 rounded-xl text-xs font-semibold text-white hover:bg-[#2e3046] cursor-pointer"
          >
            <RefreshCw size={14} />
            Coba Lagi
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && !error && (
        <div id="download-loading" className="flex flex-col gap-4 animate-pulse">
          <div className="w-1/2 h-6 bg-[#1e1f2e] shimmer-animated rounded" />
          <div className="w-full h-14 bg-[#1e1f2e] shimmer-animated rounded-xl" />
          <div className="w-full h-14 bg-[#1e1f2e] shimmer-animated rounded-xl" />
        </div>
      )}

      {!loading && !error && episodeData && (
        <div id="download-content" className="flex flex-col gap-5">
          
          {/* Header block with details */}
          <div id="download-header-block" className="flex flex-col gap-1.5 border-b border-[#2a2b3d]/40 pb-4">
            <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-snug">
              Unduh: {episodeData.title}
            </h1>
            <p className="text-xs text-[#8b8c9e]">
              Silakan pilih resolusi media video untuk mengunduh berkas offline.
            </p>
          </div>

          {/* Accordion list */}
          <div id="download-accordion" className="flex flex-col gap-3">
            <div className="bg-[#1e1f2e] border border-[#2a2b3d]/55 rounded-2xl overflow-hidden shadow-md">
              
              {/* Accordion header */}
              <div
                onClick={() => setExpandedEpisode(!expandedEpisode)}
                className="flex items-center justify-between p-4 cursor-pointer bg-[#252637]/35 hover:bg-[#252637]/65 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileVideo className={getAccentTextClass()} size={20} />
                  <span className="text-xs sm:text-sm font-bold text-white">Lihat Server Download Utama</span>
                </div>
                {expandedEpisode ? <ChevronUp size={16} className="text-[#8b8c9e]" /> : <ChevronDown size={16} className="text-[#8b8c9e]" />}
              </div>

              {/* Accordion contents */}
              {expandedEpisode && (
                <div className="p-4 flex flex-col gap-3 border-t border-[#2a2b3d]/40">
                  {qualities.map((q) => {
                    const isTrig = downloadingQuality === q.name;
                    return (
                      <div
                        id={`download-quality-row-${q.name}`}
                        key={q.name}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 bg-[#13141f] border border-[#2a2b3d]/45 hover:border-[#2a2b3d]/80 rounded-xl gap-3 transition-colors duration-200"
                      >
                        <div className="flex items-start gap-3">
                          <div id="harddrive-container" className="p-2 rounded-lg bg-[#1e1f2e] text-[#8b8c9e]">
                            <HardDrive size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-extrabold text-white flex items-center gap-2">
                              {q.name} HD
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.25 rounded ${getAccentBgPillClass()}`}>
                                {q.format}
                              </span>
                            </p>
                            <p className="text-xs text-[#8b8c9e] mt-0.5">{q.desc}</p>
                          </div>
                        </div>

                        {/* Download button */}
                        <button
                          disabled={downloadingQuality !== null}
                          onClick={() => handleDownloadTrigger(q.name)}
                          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer ${
                            isTrig
                              ? "bg-green-500 text-white"
                              : getAccentBgClass()
                          }`}
                        >
                          {isTrig ? (
                            <>
                              <Check size={14} className="animate-bounce" />
                              Memproses...
                            </>
                          ) : (
                            <>
                              <DownloadIcon size={14} />
                              Unduh ({q.size})
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>

          {/* Download Terms / Warning note */}
          <div id="download-terms" className="p-4 rounded-2xl bg-[#1e1f2e]/40 border border-[#2a2b3d]/30 text-xs text-[#8b8c9e] leading-relaxed flex flex-col gap-2">
            <p className="font-bold text-white">Petunjuk Unduhan:</p>
            <p>1. Tekan tombol download di atas sesuai resolusi yang diinginkan.</p>
            <p>2. Jika tab baru terbuka, Anda dapat mengklik kanan video player lalu pilih "Simpan Video Sebagai..." untuk menyimpannya di perangkat Anda.</p>
            <p>3. Format file MKV/MP4 ini mendukung semua aplikasi pemutar media modern seperti VLC atau MX Player.</p>
          </div>

        </div>
      )}

    </div>
  );
}
