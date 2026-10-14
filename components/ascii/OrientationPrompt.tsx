"use client";

import React, { useState, useEffect, useCallback } from "react";

export default function OrientationPrompt() {
  const [isMobilePortrait, setIsMobilePortrait] = useState<boolean>(false);
  const [hasDismissedInSession, setHasDismissedInSession] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        return sessionStorage.getItem("house_continue_portrait") === "true";
      } catch {
        return false;
      }
    }
    return false;
  });

  const checkOrientation = useCallback(() => {
    if (typeof window === "undefined") return;
    const isMobile = window.innerWidth <= 768;
    const isPortrait = window.innerHeight > window.innerWidth;
    setIsMobilePortrait(isMobile && isPortrait);
  }, []);

  useEffect(() => {
    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener("change", checkOrientation);
    }

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener("change", checkOrientation);
      }
    };
  }, [checkOrientation]);

  const handleContinuePortrait = () => {
    try {
      sessionStorage.setItem("house_continue_portrait", "true");
    } catch {}
    setHasDismissedInSession(true);
  };

  // Only display if device is mobile size in portrait orientation and visitor hasn't dismissed for this session
  if (!isMobilePortrait || hasDismissedInSession) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Screen Orientation Recommendation"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-[2px] select-none font-sans pointer-events-auto"
    >
      <div
        className="w-full max-w-[340px] bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black shadow-[3px_3px_0px_rgba(0,0,0,0.8)] text-black flex flex-col overflow-hidden"
      >
        {/* Windows 95 Navy Title Bar */}
        <header
          className="h-7 px-2 flex items-center justify-between select-none"
          style={{
            background: "linear-gradient(90deg, #000080 0%, #1084d0 100%)",
          }}
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-white tracking-wide">
            <span>📱</span>
            <span>IDEA KUTIR — ORIENTATION.SYS</span>
          </div>
        </header>

        {/* Dialog Content Area */}
        <div className="p-4 flex flex-col gap-3.5">
          {/* Recessed Display Pane */}
          <div className="border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white p-5 flex flex-col items-center text-center gap-3">
            {/* Phone Rotation Icon with Curved Arrow */}
            <div className="relative w-20 h-20 flex items-center justify-center my-1 text-[#0047BB]">
              {/* Rotating Phone */}
              <div className="phone-rotate-anim w-10 h-16 border-2 border-[#0047BB] rounded-[6px] bg-[#0047BB]/10 flex flex-col justify-between items-center py-1.5 shadow-sm">
                {/* Speaker slit */}
                <div className="w-3 h-0.5 bg-[#0047BB] rounded-full" />
                {/* Screen display lines */}
                <div className="w-6 h-8 border border-[#0047BB]/40 bg-[#0047BB]/5 rounded-[2px] flex items-center justify-center">
                  <span className="text-[10px] font-mono font-bold text-[#0047BB]">🏛</span>
                </div>
                {/* Home dot */}
                <div className="w-1.5 h-1.5 rounded-full border border-[#0047BB]" />
              </div>

              {/* Curved Rotation Arrow Overlay */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none text-[#0047BB] opacity-80"
                viewBox="0 0 80 80"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Curved arc from top right to bottom left */}
                <path d="M 62 26 A 30 30 0 0 1 20 60" strokeDasharray="3 3" />
                {/* Arrowhead */}
                <path d="M 16 52 L 20 60 L 28 58" fill="none" strokeWidth="2.5" />
              </svg>
            </div>

            {/* Heading */}
            <h2 className="text-sm font-bold text-[#000080] tracking-wider uppercase">
              A HOUSE BEST EXPLORED SIDEWAYS
            </h2>

            {/* Supporting Copy */}
            <p className="text-xs text-[#333333] leading-relaxed">
              Rotate your phone to landscape for the best experience.
            </p>
          </div>

          {/* Continue in Portrait Action Button */}
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={handleContinuePortrait}
              className="w-full min-h-[44px] py-2 px-4 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white text-xs font-bold text-black cursor-pointer shadow-sm hover:bg-[#d0d0d0] transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Continue in portrait</span>
              <span className="text-[11px] text-[#555]">&rarr;</span>
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes rotatePhoneSideways {
          0%, 15% {
            transform: rotate(0deg);
          }
          40%, 75% {
            transform: rotate(-90deg);
          }
          90%, 100% {
            transform: rotate(0deg);
          }
        }

        .phone-rotate-anim {
          animation: rotatePhoneSideways 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transform-origin: center center;
        }

        @media (prefers-reduced-motion: reduce) {
          .phone-rotate-anim {
            animation: none !important;
            transform: rotate(-45deg);
          }
        }
      `}</style>
    </div>
  );
}
