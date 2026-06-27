import React, { useRef } from "react";
import { Star, Flame, Zap, Award, Film, Library, ListFilter } from "lucide-react";
import { settings } from "../lib/settings";

interface ChipItem {
  label: string;
  id: string;
  icon?: React.ComponentType<{ size: number; className?: string }>;
}

interface FilterChipsProps {
  chips: ChipItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function FilterChips({ chips, selectedId, onSelect }: FilterChipsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const accentColor = settings.getAccentColor();

  const getAccentBgClass = () => {
    switch (accentColor) {
      case "green": return "bg-[#4ade80] text-black";
      case "blue": return "bg-[#3b82f6] text-white";
      case "purple": return "bg-[#a855f7] text-white";
      case "orange": return "bg-[#f97316] text-white";
      default: return "bg-[#e84545] text-white"; // red
    }
  };

  return (
    <div id="filter-chips-container" className="w-full relative py-1">
      {/* Scrollable track with hidden scrollbars */}
      <div
        id="filter-chips-scroll"
        ref={containerRef}
        className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 px-1 -mx-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* CSS injection to hide chrome/safari scrollbars */}
        <style dangerouslySetInnerHTML={{__html: `
          #filter-chips-scroll::-webkit-scrollbar {
            display: none;
          }
        `}} />

        {chips.map((chip) => {
          const isActive = selectedId === chip.id;
          const IconComponent = chip.icon;

          return (
            <button
              id={`chip-${chip.id.replace(/\s+/g, '-').toLowerCase()}`}
              key={chip.id}
              onClick={() => onSelect(chip.id)}
              className={`flex items-center gap-1.5 shrink-0 px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 shadow-sm cursor-pointer border ${
                isActive
                  ? `${getAccentBgClass()} border-transparent`
                  : "bg-[#1e1f2e] text-[#8b8c9e] border-transparent hover:text-white hover:bg-[#252637]"
              }`}
            >
              {IconComponent && (
                <IconComponent 
                  size={14} 
                  className={isActive ? "" : "text-[#8b8c9e]/80"} 
                />
              )}
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
