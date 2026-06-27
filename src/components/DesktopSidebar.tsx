import React from "react";
import { Play, Home, Search, Compass, Calendar, Settings } from "lucide-react";
import { settings } from "../lib/settings";

interface DesktopSidebarProps {
  currentHash: string;
  onNavigate: (hash: string) => void;
}

export default function DesktopSidebar({ currentHash, onNavigate }: DesktopSidebarProps) {
  const accentColor = settings.getAccentColor();

  // Get accent styles for text & background highlight
  const getAccentStyles = (isActive: boolean) => {
    if (!isActive) return "text-[#8b8c9e] hover:text-white hover:bg-[#1e1f2e]";
    switch (accentColor) {
      case "green":
        return "bg-[#4ade80]/10 text-[#4ade80]";
      case "blue":
        return "bg-[#3b82f6]/10 text-[#3b82f6]";
      case "purple":
        return "bg-[#a855f7]/10 text-[#a855f7]";
      case "orange":
        return "bg-[#f97316]/10 text-[#f97316]";
      default: // red
        return "bg-[#e84545]/10 text-[#e84545]";
    }
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

  const menuItems = [
    { label: "Home", hash: "#/", icon: Home },
    { label: "Search", hash: "#/search", icon: Search },
    { label: "Explore", hash: "#/explore", icon: Compass },
    { label: "Jadwal Tayang", hash: "#/schedule", icon: Calendar },
    { label: "Pengaturan", hash: "#/settings", icon: Settings },
  ];

  const getIsActive = (hash: string) => {
    if (hash === "#/") {
      return currentHash === "#/" || currentHash === "" || currentHash === "#";
    }
    return currentHash.startsWith(hash);
  };

  return (
    <div 
      id="desktop-sidebar" 
      className="hidden md:flex flex-col w-[240px] h-screen fixed left-0 top-0 bg-[#13141f] border-r border-[#2a2b3d] px-5 py-6 z-40 shrink-0"
    >
      {/* Brand Logo */}
      <div 
        id="sidebar-logo" 
        className="flex items-center gap-3 mb-10 cursor-pointer"
        onClick={() => onNavigate("#/")}
      >
        <div className={`p-2 rounded-xl flex items-center justify-center text-white shadow-lg ${getLogoColorClass()}`}>
          <Play size={18} fill="white" className="ml-0.5" />
        </div>
        <span className="text-xl font-bold text-white tracking-wider font-sans">
          Ani<span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">play</span>
        </span>
      </div>

      {/* Navigation Items */}
      <div id="sidebar-nav-list" className="flex flex-col gap-2 flex-grow">
        {menuItems.map((item) => {
          const isActive = getIsActive(item.hash);
          const Icon = item.icon;
          
          return (
            <button
              id={`sidebar-item-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              key={item.hash}
              onClick={() => onNavigate(item.hash)}
              className={`flex items-center gap-4.5 px-4 py-3.5 rounded-xl font-medium text-sm transition-all duration-200 text-left ${getAccentStyles(isActive)}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div id="sidebar-footer" className="text-xs text-[#4a4b5e] mt-auto border-t border-[#2a2b3d]/50 pt-4">
        <p className="font-semibold text-[#8b8c9e] mb-1">Aniplay v2.0</p>
        <p>© 2026 Aniplay</p>
      </div>
    </div>
  );
}
