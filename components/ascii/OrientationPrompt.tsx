"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

export default function OrientationPrompt() {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const checkOrientationAndDevice = useCallback((): boolean => {
    if (typeof window === "undefined") return false;

    // Strict capability detection without user-agent sniffing:
    // Requires touch capability and either coarse pointer or mobile viewport
    const hasTouch =
      "ontouchstart" in window ||
      (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0);

    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const isPortrait =
      window.innerHeight > window.innerWidth ||
      window.matchMedia("(orientation: portrait)").matches;

    // Desktop computers with fine mouse pointers won't qualify.
    // Tablets and touchscreen phones in portrait orientation will qualify.
    return hasTouch && isCoarsePointer && isPortrait;
  }, []);

  const dismiss = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsVisible(false);
  }, []);

  useEffect(() => {
    const handleOrientationOrResize = () => {
      const shouldShow = checkOrientationAndDevice();
      if (shouldShow) {
        setIsVisible(true);
        // Start 3-second auto-dismiss timer
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setIsVisible(false);
          timerRef.current = null;
        }, 3000);
      } else {
        // Landscape orientation or non-qualifying device: dismiss immediately
        dismiss();
      }
    };

    handleOrientationOrResize();

    window.addEventListener("resize", handleOrientationOrResize);
    window.addEventListener("orientationchange", handleOrientationOrResize);
    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener("change", handleOrientationOrResize);
    }
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleOrientationOrResize);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener("resize", handleOrientationOrResize);
      window.removeEventListener("orientationchange", handleOrientationOrResize);
      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener("change", handleOrientationOrResize);
      }
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleOrientationOrResize);
      }
    };
  }, [checkOrientationAndDevice, dismiss]);

  // Non-swallowing touch dismissal:
  // When prompt is visible, any touch anywhere on the screen dismisses it,
  // but passively without preventDefault so the user's tap proceeds normally to the underlying UI.
  useEffect(() => {
    if (!isVisible) return;

    const handleGlobalTouch = () => {
      dismiss();
    };

    window.addEventListener("touchstart", handleGlobalTouch, { passive: true });
    window.addEventListener("pointerdown", handleGlobalTouch, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleGlobalTouch);
      window.removeEventListener("pointerdown", handleGlobalTouch);
    };
  }, [isVisible, dismiss]);

  if (!isVisible) {
    return null;
  }

  return (
    <aside
      aria-label="Screen Orientation Recommendation"
      className="fixed inset-x-0 z-40 flex flex-col items-center pointer-events-none select-none font-sans"
      style={{
        top: "max(16vh, calc(env(safe-area-inset-top, 0px) + 2rem))",
      }}
    >
      <div className="flex flex-col items-center text-center px-6 max-w-[320px] transition-opacity duration-300">
        {/* Simple Minimal White Rotating Phone Icon with Rotation Arrow */}
        <div className="relative w-14 h-14 flex items-center justify-center mb-3">
          {/* Curved Rotation Arrow */}
          <svg
            className="absolute inset-0 w-full h-full text-white/80"
            viewBox="0 0 56 56"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.7))",
            }}
          >
            {/* Curved dashed arc indicating rotation to landscape */}
            <path d="M 42 16 A 20 20 0 0 1 14 42" strokeDasharray="3 3" />
            {/* Arrowhead */}
            <path d="M 10 35 L 14 42 L 21 40" fill="none" strokeWidth="2" />
          </svg>

          {/* Clean White Phone Silhouette */}
          <div
            className="phone-sideways-anim w-7 h-11 border-2 border-white rounded-[5px] flex flex-col justify-between items-center py-1 bg-white/10"
            style={{
              filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.7))",
            }}
          >
            {/* Speaker bar */}
            <div className="w-2 h-0.5 bg-white rounded-full" />
            {/* Screen guide */}
            <div className="w-4 h-5 border border-white/40 rounded-[1px]" />
            {/* Home indicator dot */}
            <div className="w-1 h-1 rounded-full bg-white/70" />
          </div>
        </div>

        {/* Heading */}
        <h2
          className="text-xs sm:text-sm font-bold text-white tracking-wider uppercase leading-snug"
          style={{
            textShadow: "0 1px 3px rgba(0, 0, 0, 0.9), 0 2px 6px rgba(0, 0, 0, 0.6)",
          }}
        >
          A HOUSE BEST EXPLORED SIDEWAYS
        </h2>

        {/* Supporting Copy */}
        <p
          className="text-[11px] sm:text-xs text-white/90 leading-relaxed mt-1"
          style={{
            textShadow: "0 1px 3px rgba(0, 0, 0, 0.9), 0 2px 6px rgba(0, 0, 0, 0.6)",
          }}
        >
          Rotate your phone to landscape for the best experience.
        </p>

        {/* Discreet Text Action Button */}
        <button
          type="button"
          data-touch-bypass="true"
          onClick={(e) => {
            e.stopPropagation();
            dismiss();
          }}
          className="mt-3 text-[11px] text-white/75 hover:text-white underline underline-offset-4 pointer-events-auto cursor-pointer transition-colors py-1 px-2"
          style={{
            textShadow: "0 1px 3px rgba(0, 0, 0, 0.9)",
          }}
        >
          Continue in portrait
        </button>
      </div>

      <style jsx>{`
        @keyframes rotateToLandscape {
          0%, 20% {
            transform: rotate(0deg);
          }
          45%, 75% {
            transform: rotate(-90deg);
          }
          90%, 100% {
            transform: rotate(0deg);
          }
        }

        .phone-sideways-anim {
          animation: rotateToLandscape 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transform-origin: center center;
        }

        @media (prefers-reduced-motion: reduce) {
          .phone-sideways-anim {
            animation: none !important;
            transform: rotate(-45deg);
          }
        }
      `}</style>
    </aside>
  );
}
