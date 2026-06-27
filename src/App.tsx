import React, { useState, useEffect } from "react";
import { settings } from "./lib/settings";
import BottomNav from "./components/BottomNav";
import DesktopSidebar from "./components/DesktopSidebar";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Explore from "./pages/Explore";
import Schedule from "./pages/Schedule";
import Detail from "./pages/Detail";
import Watch from "./pages/Watch";
import Download from "./pages/Download";
import Settings from "./pages/Settings";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [currentHash, setCurrentHash] = useState(window.location.hash || "#/");
  const [textSize, setTextSize] = useState(settings.getTextSize());
  const [accent, setAccent] = useState(settings.getAccentColor());

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || "#/");
      // Scroll page back to top when navigating
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // Listen for global setting adjustments
  useEffect(() => {
    const handleSettingsChange = () => {
      setTextSize(settings.getTextSize());
      setAccent(settings.getAccentColor());
    };
    window.addEventListener("settings_changed", handleSettingsChange);
    return () => {
      window.removeEventListener("settings_changed", handleSettingsChange);
    };
  }, []);

  const handleNavigate = (hash: string) => {
    window.location.hash = hash;
  };

  // Font sizing style wrapper
  const getTextSizeClass = () => {
    switch (textSize) {
      case "kecil": return "text-xs";
      case "besar": return "text-base";
      default: return "text-sm"; // sedang (standard)
    }
  };

  // Page Routing resolver based on Hash
  const renderActivePage = () => {
    const hash = currentHash;

    if (hash.startsWith("#/search")) {
      return <Search currentHash={hash} onNavigate={handleNavigate} />;
    }
    if (hash.startsWith("#/explore")) {
      return <Explore currentHash={hash} onNavigate={handleNavigate} />;
    }
    if (hash.startsWith("#/schedule")) {
      return <Schedule onNavigate={handleNavigate} />;
    }
    if (hash.startsWith("#/settings")) {
      return <Settings onNavigate={handleNavigate} />;
    }
    if (hash.startsWith("#/detail")) {
      return <Detail currentHash={hash} onNavigate={handleNavigate} />;
    }
    if (hash.startsWith("#/watch")) {
      return <Watch currentHash={hash} onNavigate={handleNavigate} />;
    }
    if (hash.startsWith("#/download")) {
      return <Download currentHash={hash} onNavigate={handleNavigate} />;
    }

    // Default to Home
    return <Home onNavigate={handleNavigate} />;
  };

  // Get active page component wrapped in a smooth motion transitions
  const pageKey = currentHash.split("?")[0]; // ignore query params for transition key trigger

  return (
    <div 
      id="aniplay-root-app"
      className={`min-h-screen bg-[#13141f] text-white flex flex-col md:flex-row antialiased font-sans ${getTextSizeClass()}`}
    >
      {/* 1. Left Sidebar (Fixed on Desktop view) */}
      <DesktopSidebar currentHash={currentHash} onNavigate={handleNavigate} />

      {/* 2. Main content viewport section */}
      <div 
        id="viewport-container" 
        className="flex-grow flex flex-col min-w-0 md:ml-[240px] px-4 py-5 md:px-8 md:py-8"
      >
        <div id="content-limit" className="max-w-6xl w-full mx-auto flex-grow">
          <AnimatePresence mode="wait">
            <motion.div
              key={pageKey}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-full h-full flex flex-col"
            >
              {renderActivePage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 3. Floating pill bottom bar (Floating on Mobile view) */}
      <BottomNav currentHash={currentHash} onNavigate={handleNavigate} />
    </div>
  );
}
