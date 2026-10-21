"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { InteractiveObject3D } from "@/data/house3d";
import { FirstPersonNavigator } from "./FirstPersonControls";

interface TouchControlsProps {
  navigator: FirstPersonNavigator | null;
  hoveredObject: InteractiveObject3D | null;
  onInteract: () => void;
  disabled?: boolean;
}

export default function TouchControls({
  navigator,
  hoveredObject,
  onInteract,
  disabled = false,
}: TouchControlsProps) {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState(false);

  const joystickBaseRef = useRef<HTMLDivElement | null>(null);
  const lookAreaRef = useRef<HTMLDivElement | null>(null);

  // Active touch identifiers to handle concurrent multi-touch
  const joystickTouchIdRef = useRef<number | null>(null);
  const lookTouchIdRef = useRef<number | null>(null);
  const lastLookPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const JOYSTICK_RADIUS = 46; // max px offset from center

  // Detect touch capability
  useEffect(() => {
    const checkTouch = () => {
      const hasTouch =
        "ontouchstart" in window ||
        (typeof window !== "undefined" && window.navigator && window.navigator.maxTouchPoints > 0) ||
        window.innerWidth <= 1024;
      setIsTouchDevice(hasTouch);
    };
    checkTouch();
    window.addEventListener("resize", checkTouch);
    return () => window.removeEventListener("resize", checkTouch);
  }, []);

  // Reset movement if disabled or unmounted
  useEffect(() => {
    if (disabled && navigator) {
      navigator.resetMovement();
      setKnobPos({ x: 0, y: 0 });
      setIsJoystickActive(false);
      joystickTouchIdRef.current = null;
      lookTouchIdRef.current = null;
    }
  }, [disabled, navigator]);

  // Window blur or visibility change resets controls
  useEffect(() => {
    const handleBlur = () => {
      if (navigator) {
        navigator.resetMovement();
      }
      setKnobPos({ x: 0, y: 0 });
      setIsJoystickActive(false);
      joystickTouchIdRef.current = null;
      lookTouchIdRef.current = null;
    };

    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleBlur);
    return () => {
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleBlur);
    };
  }, [navigator]);

  // ─────────────────────────────────────────────────────────────
  // JOYSTICK TOUCH HANDLERS (Left Thumb)
  // ─────────────────────────────────────────────────────────────
  const updateJoystick = useCallback(
    (clientX: number, clientY: number) => {
      if (!joystickBaseRef.current || !navigator) return;
      const rect = joystickBaseRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dynamicRadius = Math.max(36, rect.width / 2 - 14);

      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const distance = Math.hypot(dx, dy);

      const clampedDist = Math.min(dynamicRadius, distance);
      const normX = distance > 0 ? (dx / distance) * (clampedDist / dynamicRadius) : 0;
      const normY = distance > 0 ? (dy / distance) * (clampedDist / dynamicRadius) : 0;

      setKnobPos({
        x: normX * dynamicRadius,
        y: normY * dynamicRadius,
      });

      // Forward in 3D world is -Y in screen coordinates (swiping up)
      navigator.setJoystickInput(normX, -normY);
    },
    [navigator]
  );

  const handleJoystickTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled || joystickTouchIdRef.current !== null) return;
      const touch = e.changedTouches[0];
      if (!touch) return;

      joystickTouchIdRef.current = touch.identifier;
      setIsJoystickActive(true);
      updateJoystick(touch.clientX, touch.clientY);
      e.preventDefault();
    },
    [disabled, updateJoystick]
  );

  const handleJoystickTouchMove = useCallback(
    (e: TouchEvent) => {
      if (disabled || joystickTouchIdRef.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === joystickTouchIdRef.current) {
          updateJoystick(touch.clientX, touch.clientY);
          e.preventDefault();
          break;
        }
      }
    },
    [disabled, updateJoystick]
  );

  const handleJoystickTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (joystickTouchIdRef.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === joystickTouchIdRef.current) {
          joystickTouchIdRef.current = null;
          setIsJoystickActive(false);
          setKnobPos({ x: 0, y: 0 });
          navigator?.setJoystickInput(0, 0);
          e.preventDefault();
          break;
        }
      }
    },
    [navigator]
  );

  // Attach non-passive listeners for joystick to prevent iOS scroll gesture interference
  useEffect(() => {
    const el = joystickBaseRef.current;
    if (!el) return;

    el.addEventListener("touchstart", handleJoystickTouchStart, { passive: false });
    window.addEventListener("touchmove", handleJoystickTouchMove, { passive: false });
    window.addEventListener("touchend", handleJoystickTouchEnd, { passive: false });
    window.addEventListener("touchcancel", handleJoystickTouchEnd, { passive: false });

    return () => {
      el.removeEventListener("touchstart", handleJoystickTouchStart);
      window.removeEventListener("touchmove", handleJoystickTouchMove);
      window.removeEventListener("touchend", handleJoystickTouchEnd);
      window.removeEventListener("touchcancel", handleJoystickTouchEnd);
    };
  }, [handleJoystickTouchStart, handleJoystickTouchMove, handleJoystickTouchEnd]);

  // ─────────────────────────────────────────────────────────────
  // TOUCH LOOK HANDLERS (Right Thumb)
  // ─────────────────────────────────────────────────────────────
  const handleLookTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled || lookTouchIdRef.current !== null) return;
      // Ignore touch if targeting an active button (like Interact button or HUD)
      const target = e.target as HTMLElement | null;
      if (target?.closest("button") || target?.closest("[data-touch-bypass]")) {
        return;
      }

      const touch = e.changedTouches[0];
      if (!touch) return;

      lookTouchIdRef.current = touch.identifier;
      lastLookPosRef.current = { x: touch.clientX, y: touch.clientY };
      e.preventDefault();
    },
    [disabled]
  );

  const handleLookTouchMove = useCallback(
    (e: TouchEvent) => {
      if (disabled || lookTouchIdRef.current === null || !navigator) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === lookTouchIdRef.current) {
          const deltaX = touch.clientX - lastLookPosRef.current.x;
          const deltaY = touch.clientY - lastLookPosRef.current.y;
          lastLookPosRef.current = { x: touch.clientX, y: touch.clientY };

          navigator.handleTouchLook(deltaX, deltaY);
          e.preventDefault();
          break;
        }
      }
    },
    [disabled, navigator]
  );

  const handleLookTouchEnd = useCallback((e: TouchEvent) => {
    if (lookTouchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === lookTouchIdRef.current) {
        lookTouchIdRef.current = null;
        e.preventDefault();
        break;
      }
    }
  }, []);

  // Attach non-passive listeners for look area
  useEffect(() => {
    const el = lookAreaRef.current;
    if (!el) return;

    el.addEventListener("touchstart", handleLookTouchStart, { passive: false });
    window.addEventListener("touchmove", handleLookTouchMove, { passive: false });
    window.addEventListener("touchend", handleLookTouchEnd, { passive: false });
    window.addEventListener("touchcancel", handleLookTouchEnd, { passive: false });

    return () => {
      el.removeEventListener("touchstart", handleLookTouchStart);
      window.removeEventListener("touchmove", handleLookTouchMove);
      window.removeEventListener("touchend", handleLookTouchEnd);
      window.removeEventListener("touchcancel", handleLookTouchEnd);
    };
  }, [handleLookTouchStart, handleLookTouchMove, handleLookTouchEnd]);

  if (!isTouchDevice || disabled) {
    return null;
  }

  // Label for contextual interaction button
  const getInteractLabel = () => {
    if (!hoveredObject) return "INTERACT";
    if (hoveredObject.id.startsWith("gallery-frame-")) return "VIEW ARTWORK ↗";
    if (hoveredObject.id === "obj-study-computer") return "OPEN COMPUTER";
    if (hoveredObject.id === "obj-hallway-portrait") return "INSPECT PORTRAIT";
    if (hoveredObject.id === "obj-hallway-map") return "VIEW MAP";
    return `INSPECT: ${hoveredObject.name.toUpperCase()}`;
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-30 overflow-hidden font-sans">
      {/* ─────────────────────────────────────────────────────────
          TOUCH LOOK DRAGGABLE ZONE (Right 50% of viewport)
          ───────────────────────────────────────────────────────── */}
      <div
        ref={lookAreaRef}
        aria-label="Touch Look Navigation Area"
        className="absolute right-0 top-14 bottom-0 w-[55vw] pointer-events-auto touch-none"
      />

      {/* ─────────────────────────────────────────────────────────
          VIRTUAL JOYSTICK (Bottom-Left Thumb Zone)
          ───────────────────────────────────────────────────────── */}
      <div
        className="absolute pointer-events-auto touch-none w-[106px] h-[106px] sm:w-[124px] sm:h-[124px]"
        style={{
          bottom: "max(1rem, calc(env(safe-area-inset-bottom, 0px) + 0.35rem))",
          left: "max(1rem, calc(env(safe-area-inset-left, 0px) + 0.35rem))",
        }}
      >
        {/* Joystick Base Pad: Translucent White with 40% Opacity Accents */}
        <div
          ref={joystickBaseRef}
          className="relative w-full h-full rounded-full flex items-center justify-center transition-opacity"
          style={{
            backgroundColor: isJoystickActive ? "rgba(255, 255, 255, 0.16)" : "rgba(255, 255, 255, 0.10)",
            border: "2px solid rgba(255, 255, 255, 0.40)",
            backdropFilter: "blur(4px)",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5), inset 0 0 14px rgba(255, 255, 255, 0.12)",
            opacity: isJoystickActive ? 0.95 : 0.85,
          }}
        >
          {/* Subtle Directional Notches with Text Shadow for Contrast */}
          <span
            className="absolute top-1.5 text-[9px] font-mono font-bold select-none"
            style={{
              color: "rgba(255, 255, 255, 0.75)",
              textShadow: "0 1px 3px rgba(0, 0, 0, 0.9)",
            }}
          >
            ▲
          </span>
          <span
            className="absolute bottom-1.5 text-[9px] font-mono font-bold select-none"
            style={{
              color: "rgba(255, 255, 255, 0.75)",
              textShadow: "0 1px 3px rgba(0, 0, 0, 0.9)",
            }}
          >
            ▼
          </span>
          <span
            className="absolute left-1.5 text-[9px] font-mono font-bold select-none"
            style={{
              color: "rgba(255, 255, 255, 0.75)",
              textShadow: "0 1px 3px rgba(0, 0, 0, 0.9)",
            }}
          >
            ◀
          </span>
          <span
            className="absolute right-1.5 text-[9px] font-mono font-bold select-none"
            style={{
              color: "rgba(255, 255, 255, 0.75)",
              textShadow: "0 1px 3px rgba(0, 0, 0, 0.9)",
            }}
          >
            ▶
          </span>

          {/* Draggable Knob: White 40% Opacity */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center pointer-events-none select-none shadow-md"
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
              backgroundColor: isJoystickActive ? "rgba(255, 255, 255, 0.60)" : "rgba(255, 255, 255, 0.40)",
              border: "2px solid rgba(255, 255, 255, 0.85)",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.7)",
              transition: isJoystickActive ? "none" : "transform 0.15s ease-out",
            }}
          >
            {/* Center Indent */}
            <div className="w-3.5 h-3.5 rounded-full bg-white/30 border border-white/50" />
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────
          MOBILE INTERACTION BUTTON (Visible when near clickable object)
          ───────────────────────────────────────────────────────── */}
      {hoveredObject && (
        <div
          className="absolute pointer-events-auto"
          style={{
            bottom: "max(1.25rem, calc(env(safe-area-inset-bottom, 0px) + 0.35rem))",
            right: "max(1.25rem, calc(env(safe-area-inset-right, 0px) + 0.35rem))",
          }}
        >
          <button
            type="button"
            data-touch-bypass="true"
            onClick={(e) => {
              e.stopPropagation();
              onInteract();
            }}
            className="min-h-[44px] sm:min-h-[50px] px-3 sm:px-4 py-2 sm:py-2.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white text-black font-sans font-bold text-xs shadow-[3px_3px_0px_rgba(0,0,0,0.8)] cursor-pointer flex items-center gap-2 sm:gap-2.5 select-none"
            style={{
              outline: "1px solid #769EFD",
            }}
          >
            {/* Glowing Signature Blue Pill Indicator */}
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse shrink-0"
              style={{ backgroundColor: "#769EFD" }}
            />
            <span className="tracking-wide uppercase text-[11px] sm:text-xs text-[#13265C]">
              {getInteractLabel()}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
