import React from "react";

interface ShimmerSkeletonProps {
  count?: number;
  layout?: 'cols-2' | 'cols-3' | 'list';
}

export default function ShimmerSkeleton({ count = 4, layout = 'cols-2' }: ShimmerSkeletonProps) {
  const items = Array.from({ length: count });

  const isList = layout === 'list';
  const isCols3 = layout === 'cols-3';

  return (
    <>
      {/* Scoped keyframes for absolute shiny modern skeleton */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes custom-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .shimmer-animated {
          background: linear-gradient(90deg, #1e1f2e 25%, #2a2b3d 50%, #1e1f2e 75%);
          background-size: 200% 100%;
          animation: custom-shimmer 1.5s infinite linear;
        }
      `}} />

      {items.map((_, idx) => (
        <div 
          key={idx}
          className={`rounded-2xl border border-[#2a2b3d]/30 ${
            isList 
              ? "flex gap-4 p-3 bg-[#1e1f2e] w-full items-center h-34" 
              : "aspect-[2/3] relative overflow-hidden bg-[#1e1f2e] w-full"
          }`}
        >
          {isList ? (
            <>
              {/* Left poster shimmer */}
              <div className="w-20 h-28 rounded-xl shimmer-animated shrink-0" />
              
              {/* Right info shimmer */}
              <div className="flex flex-col flex-grow gap-2.5">
                <div className="w-16 h-5 rounded-full shimmer-animated" />
                <div className="w-4/5 h-5 rounded shimmer-animated" />
                <div className="w-1/2 h-4 rounded shimmer-animated" />
                <div className="flex justify-between mt-auto">
                  <div className="w-20 h-3.5 rounded shimmer-animated" />
                  <div className="w-12 h-3.5 rounded shimmer-animated" />
                </div>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col justify-end p-3">
              {/* absolute background shimmer */}
              <div className="absolute inset-0 shimmer-animated" />
              
              {/* overlay mask */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

              {/* simulated rating */}
              <div className="absolute top-2 right-2 w-12 h-5 rounded-full bg-[#13141f]/80" />

              {/* simulated text */}
              <div className="relative z-10 w-2/3 h-4 rounded bg-gray-700/60 mb-2" />
              <div className="relative z-10 w-1/2 h-3 rounded bg-gray-800/60" />
            </div>
          )}
        </div>
      ))}
    </>
  );
}
