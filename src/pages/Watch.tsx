import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Server, RefreshCw, AlertCircle, ArrowLeft, Play, Film, ExternalLink } from "lucide-react";
import { settings } from "../lib/settings";
import { EpisodePayload, SamehadakuQualityItem, SamehadakuServerItem } from "../types";

interface WatchProps {
  currentHash: string;
  onNavigate: (hash: string) => void;
}

export default function Watch({ currentHash, onNavigate }: WatchProps) {
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [serverLoading, setServerLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [episodeData, setEpisodeData] = useState<EpisodePayload | null>(null);
  
  // Streaming state
  const [streamUrl, setStreamUrl] = useState<string>("");
  const [selectedQuality, setSelectedQuality] = useState<string>("");
  const [selectedServerId, setSelectedServerId] = useState<string>("");

  const dataSource = settings.getDataSource();
  const accentColor = settings.getAccentColor();

  useEffect(() => {
    const parseSlug = () => {
      const match = currentHash.match(/#\/watch\/([^?&]+)/);
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
      case "green": return "bg-[#4ade80]/15 text-[#4ade80] border-[#4ade80]/20";
      case "blue": return "bg-[#3b82f6]/15 text-[#3b82f6] border-[#3b82f6]/20";
      case "purple": return "bg-[#a855f7]/15 text-[#a855f7] border-[#a855f7]/20";
      case "orange": return "bg-[#f97316]/15 text-[#f97316] border-[#f97316]/20";
      default: return "bg-[#e84545]/15 text-[#e84545] border-[#e84545]/20"; // red
    }
  };

  const fetchEpisodeData = async (epSlug: string) => {
    setLoading(true);
    setError(null);
    setStreamUrl("");
    try {
      const res = await fetch(`/api/proxy?route=episode&slug=${epSlug}&source=${dataSource}`);
      if (!res.ok) throw new Error("Gagal mengambil data pemutar video episode.");
      const data: EpisodePayload = await res.json();
      setEpisodeData(data);

      // Establish default stream url
      if (dataSource === "Dayynime-v2" && data.qualities && data.qualities.length > 0) {
        // Samehadaku: pick first quality, pick first server
        const firstQuality = data.qualities[0];
        setSelectedQuality(firstQuality.title);
        
        if (firstQuality.serverList && firstQuality.serverList.length > 0) {
          const firstServer = firstQuality.serverList[0];
          setSelectedServerId(firstServer.serverId);
          // Fetch server link
          await fetchServerLink(firstServer.serverId);
        } else if (data.defaultStreamingUrl) {
          setStreamUrl(data.defaultStreamingUrl);
        }
      } else if (data.streams && data.streams.length > 0) {
        // Animasu: pick first stream url
        setStreamUrl(data.streams[0].url);
      } else if (data.defaultStreamingUrl) {
        setStreamUrl(data.defaultStreamingUrl);
      } else {
        throw new Error("Tautan streaming video tidak ditemukan.");
      }

      // Add parent anime info to watch history
      const parentSlug = data.animeId || epSlug.match(/^(.+)-episode-(\d+(?:-\d+)?)$/)?.[1] || epSlug;
      settings.addToHistory({
        slug: parentSlug,
        title: data.title.split(" Episode ")[0] || "Unknown",
        poster: data.poster || "",
      }, data.title, epSlug);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat memuat streaming.");
    } finally {
      setLoading(false);
    }
  };

  const fetchServerLink = async (serverId: string) => {
    setServerLoading(true);
    try {
      const res = await fetch(`/api/proxy?route=server&serverId=${serverId}`);
      if (!res.ok) throw new Error("Gagal mengambil tautan server.");
      const data = await res.json();
      if (data.url) {
        setStreamUrl(data.url);
      } else {
        setError("Gagal mendapatkan link video dari server ini.");
      }
    } catch (e: any) {
      console.error("Error fetching server URL:", e);
      setError("Gagal memuat player server.");
    } finally {
      setServerLoading(false);
    }
  };

  const handleServerClick = async (srv: SamehadakuServerItem) => {
    setSelectedServerId(srv.serverId);
    await fetchServerLink(srv.serverId);
  };

  const handleQualityChange = (qTitle: string) => {
    if (!episodeData || !episodeData.qualities) return;
    setSelectedQuality(qTitle);
    
    const qualityItem = episodeData.qualities.find(q => q.title === qTitle);
    if (qualityItem && qualityItem.serverList && qualityItem.serverList.length > 0) {
      const firstServer = qualityItem.serverList[0];
      setSelectedServerId(firstServer.serverId);
      fetchServerLink(firstServer.serverId);
    }
  };

  const getParentSlug = () => {
    if (episodeData?.animeId) return episodeData.animeId;
    const match = slug.match(/^(.+)-episode-(\d+(?:-\d+)?)$/);
    return match ? match[1] : "";
  };

  return (
    <div id="watch-page" className="flex flex-col gap-6 pb-24 md:pb-10 -mx-4 md:-mx-0">
      
      {/* 1. Header Navigation */}
      <div id="watch-nav-header" className="px-4 md:px-0 flex items-center justify-between">
        <button
          onClick={() => onNavigate(`#/detail/${getParentSlug()}`)}
          className="flex items-center gap-2 text-xs font-bold text-[#8b8c9e] hover:text-white cursor-pointer"
        >
          <ArrowLeft size={16} />
          Detail Anime
        </button>
        <span className="text-[10px] uppercase font-bold text-[#4a4b5e] bg-[#1e1f2e] border border-[#2a2b3d]/50 px-2.5 py-1 rounded-full">
          Mode Nonton
        </span>
      </div>

      {error && (
        <div id="watch-error" className="px-4 md:px-0">
          <div className="flex flex-col items-center justify-center p-8 bg-[#1e1f2e] border border-[#2a2b3d]/50 rounded-2xl gap-3 text-center">
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
        </div>
      )}

      {/* Loading state */}
      {loading && !error && (
        <div id="watch-loading-container" className="flex flex-col gap-4 animate-pulse px-4 md:px-0">
          <div className="w-full aspect-[16/9] bg-[#1e1f2e] shimmer-animated rounded-2xl" />
          <div className="w-2/3 h-6 bg-[#1e1f2e] shimmer-animated rounded mt-2" />
          <div className="w-1/2 h-4 bg-[#1e1f2e] shimmer-animated rounded" />
        </div>
      )}

      {/* Streaming details & Player */}
      {!loading && !error && episodeData && (
        <div id="watch-core-container" className="flex flex-col gap-5">
          
          {/* 2. Responsive Video Player Container (16:9) */}
          <div id="video-stage" className="relative w-full aspect-[16/9] bg-black md:rounded-2xl overflow-hidden shadow-2xl border-y md:border border-[#2a2b3d]/50">
            {serverLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1e1f2e] text-white gap-3 z-30">
                <RefreshCw size={24} className="animate-spin text-[#8b8c9e]" />
                <p className="text-xs text-[#8b8c9e] font-semibold">Mengambil tautan stream server...</p>
              </div>
            ) : null}

            {streamUrl ? (
              <iframe
                id="streaming-player"
                src={streamUrl}
                allowFullScreen
                className="w-full h-full border-none z-10"
                title={episodeData.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 gap-3">
                <AlertCircle size={32} className={getAccentTextClass()} />
                <p className="text-xs text-white font-bold">Koneksi video terputus atau format server salah.</p>
              </div>
            )}
          </div>

          {/* Player details */}
          <div id="video-info-container" className="px-4 md:px-0 flex flex-col gap-4">
            
            {/* Title */}
            <div id="episode-info-text" className="flex flex-col gap-1.5">
              <h1 className="text-base sm:text-lg font-extrabold text-white leading-snug">
                {episodeData.title}
              </h1>
              <p className="text-xs text-[#8b8c9e]">
                Sumber Server: <span className="text-white font-semibold capitalize">{dataSource}</span>
              </p>
            </div>

            {/* 3. Navigation Controls (Prev / Next Ep) */}
            <div id="episode-nav-controls" className="flex items-center gap-3 py-2 border-y border-[#2a2b3d]/40">
              <button
                disabled={!episodeData.hasPrev || !episodeData.prevSlug}
                onClick={() => onNavigate(`#/watch/${episodeData.prevSlug}`)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-[#1e1f2e] border border-[#2a2b3d]/60 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#252637] cursor-pointer transition-colors"
                title={episodeData.prevTitle || "Episode Sebelumnya"}
              >
                <ChevronLeft size={16} />
                Prev Ep
              </button>

              {/* Back to detail button */}
              <button
                onClick={() => onNavigate(`#/detail/${getParentSlug()}`)}
                className="flex-none p-2.5 rounded-xl bg-[#1e1f2e] border border-[#2a2b3d]/60 text-[#8b8c9e] hover:text-white cursor-pointer"
                title="Kembali ke Detail"
              >
                <Film size={16} />
              </button>

              <button
                disabled={!episodeData.hasNext || !episodeData.nextSlug}
                onClick={() => onNavigate(`#/watch/${episodeData.nextSlug}`)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-[#1e1f2e] border border-[#2a2b3d]/60 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#252637] cursor-pointer transition-colors"
                title={episodeData.nextTitle || "Episode Selanjutnya"}
              >
                Next Ep
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Quality and Server selectors (Samehadaku specific layout) */}
            {dataSource === "Dayynime-v2" && episodeData.qualities && episodeData.qualities.length > 0 && (
              <div id="samehadaku-selector" className="flex flex-col gap-3 bg-[#1e1f2e]/40 p-4 border border-[#2a2b3d]/40 rounded-2xl">
                
                {/* Qualities select rows */}
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#8b8c9e]">Pilih Resolusi Video</p>
                  <div className="flex flex-wrap gap-2">
                    {episodeData.qualities.map((q) => {
                      const isActive = selectedQuality === q.title;
                      return (
                        <button
                          key={q.title}
                          onClick={() => handleQualityChange(q.title)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider cursor-pointer border transition-colors ${
                            isActive
                              ? getAccentBgPillClass()
                              : "bg-[#252637] text-[#8b8c9e] border-[#2a2b3d]/50 hover:text-white"
                          }`}
                        >
                          {q.title}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Servers select buttons */}
                <div className="flex flex-col gap-2 mt-1">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#8b8c9e]">Pilih Server Streaming</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {episodeData.qualities
                      .find((q) => q.title === selectedQuality)
                      ?.serverList?.map((srv) => {
                        const isActive = selectedServerId === srv.serverId;
                        return (
                          <button
                            key={srv.serverId}
                            disabled={serverLoading}
                            onClick={() => handleServerClick(srv)}
                            className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold cursor-pointer border transition-all duration-200 ${
                              isActive
                                ? getAccentBgClass() + " border-transparent shadow"
                                : "bg-[#252637] border-[#2a2b3d]/50 text-[#8b8c9e] hover:bg-[#2e3046] hover:text-white"
                            }`}
                          >
                            <Server size={12} />
                            <span className="truncate">{srv.title}</span>
                          </button>
                        );
                      })}
                  </div>
                </div>

              </div>
            )}

            {/* Flat Server selectors for Animasu */}
            {dataSource === "Dayynime-v1" && episodeData.streams && episodeData.streams.length > 0 && (
              <div id="animasu-selector" className="flex flex-col gap-2 bg-[#1e1f2e]/40 p-4 border border-[#2a2b3d]/40 rounded-2xl">
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#8b8c9e]">Pilih Server Streaming</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {episodeData.streams.map((stream) => {
                    const isActive = streamUrl === stream.url;
                    return (
                      <button
                        key={stream.name}
                        onClick={() => setStreamUrl(stream.url)}
                        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer border transition-all duration-200 ${
                          isActive
                            ? getAccentBgClass() + " border-transparent shadow"
                            : "bg-[#252637] border-[#2a2b3d]/50 text-[#8b8c9e] hover:bg-[#2e3046] hover:text-white"
                        }`}
                      >
                        <Play size={10} fill="currentColor" />
                        <span className="truncate">{stream.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action button: open original stream in new tab */}
            <div id="watch-action-buttons" className="flex items-center gap-3 pt-2">
              <a
                href={streamUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#1e1f2e] border border-[#2a2b3d]/50 hover:bg-[#252637] hover:border-[#2a2b3d] text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-sm"
              >
                <ExternalLink size={14} />
                Buka di Tab Baru
              </a>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
