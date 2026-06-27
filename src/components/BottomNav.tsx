import React from "react";
import { Home, Search, Compass, Calendar, Settings } from "lucide-react";
import { motion } from "motion/react";
import { settings } from "../lib/settings";

interface BottomNavProps {
  currentHash: string;
  onNavigate: (hash: string) => void;
}

export default function BottomNav({ currentHash, onNavigate }: BottomNavProps) {
  const accentColor = settings.getAccentColor();
  
  // Map accent colors to tailwind color classes
  const getAccentClass = () => {
    switch (accentColor) {
      case "green": return "text-[#4ade80]";
      case "blue": return "text-[#3b82f6]";
      case "purple": return "text-[#a855f7]";
      case "orange": return "text-[#f97316]";
      default: return "text-[#e84545]"; // red
    }
  };

  const navItems = [
    { label: "Home", hash: "#/", icon: Home },
    { label: "Cari", hash: "#/search", icon: Search },
    { label: "Explore", hash: "#/explore", icon: Compass },
    { label: "Jadwal", hash: "#/schedule", icon: Calendar },
    { label: "Settings", hash: "#/settings", icon: Settings },
  ];

  const getIsActive = (hash: string) => {
    if (hash === "#/") {
      return currentHash === "#/" || currentHash === "" || currentHash === "#";
    }
    return currentHash.startsWith(hash);
  };

  return (
    <div id="bottom-nav-container" className="fixed bottom-5 left-0 right-0 z-50 flex justify-center px-4 md:hidden">
      <div 
        id="bottom-nav" 
        className="flex items-center gap-1 bg-[#1e1f2e]/95 border border-[#2a2b3d]/80 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] max-w-md w-full justify-around"
      >
        {navItems.map((item) => {
          const isActive = getIsActive(item.hash);
          const Icon = item.icon;
          
          return (
            <button
              id={`nav-item-${item.label.toLowerCase()}`}
              key={item.hash}
              onClick={() => onNavigate(item.hash)}
              className="relative flex items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-300 overflow-hidden group"
            >
              <div className="flex items-center gap-2">
                <Icon 
                  size={20} 
                  className={`transition-colors duration-200 ${
                    isActive ? getAccentClass() : "text-[#8b8c9e] group-hover:text-white"
                  }`} 
                />
                
                {isActive && (
                  <motion.span 
                    layoutId="bottom-nav-text"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="text-xs font-semibold text-white tracking-wide"
                  >
                    {item.label}
                  </motion.span>
                )}
              </div>
              
              {isActive && (
                <motion.div 
                  layoutId="bottom-nav-bg"
                  className="absolute inset-0 bg-white/5 -z-10 rounded-xl"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
