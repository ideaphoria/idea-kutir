"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

export interface DialogueLine {
  speaker: string;
  text: string;
}

export const OPENING_DIALOGUE: DialogueLine[] = [
  {
    speaker: "Idea Kutir",
    text: "Hi. Welcome to Idea Kutir.\nI've kept all my favourite things inside.",
  },
  {
    speaker: "Idea Kutir",
    text: "Walk around. Open doors. Look closely.\nYou'll find pieces of someone who used to live here.",
  },
  {
    speaker: "Idea Kutir",
    text: "Take whatever speaks to you.\nJust don't take too long.",
  },
  {
    speaker: "Idea Kutir",
    text: "The house gets restless when people start remembering things.\nTry to remember where you came in.",
  },
];

export const UNPREDICTABLE_POSITIONS: string[] = [
  // 1. Top-Left (below top bar, clear of center reticle)
  "top-14 sm:top-16 left-4 sm:left-10",
  // 2. Top-Right (below top bar, clear of center reticle)
  "top-14 sm:top-16 right-4 sm:right-10",
  // 3. Middle-Right
  "top-1/3 right-4 sm:right-10",
  // 4. Middle-Left
  "top-1/3 left-4 sm:left-10",
  // 5. Top-Center offset
  "top-14 sm:top-16 left-1/2 -translate-x-1/2",
  // 6. Bottom-Left (above controls legend)
  "bottom-24 left-4 sm:left-10",
  // 7. Bottom-Right (clear of telemetry)
  "bottom-20 right-4 sm:right-10",
];

export interface DialogueBoxProps {
  isOpen: boolean;
  title?: string;
  lines?: DialogueLine[];
  onComplete: () => void;
  avatarSrc?: string;
  hasNameInput?: boolean;
  onNameSubmit?: (name: string) => void;
  onNameRefuse?: () => void;
  appearanceCount?: number;
  confirmButtonText?: string;
  showCancelButton?: boolean;
  hideCloseButton?: boolean;
  disableKeyboardAdvance?: boolean;
  instantText?: boolean;
  allowBackdropDismiss?: boolean;
  onBackdropClick?: () => void;
}

export default function DialogueBox({
  isOpen,
  title,
  lines = OPENING_DIALOGUE,
  onComplete,
  avatarSrc = "/cat.jpg",
  hasNameInput = false,
  onNameSubmit,
  onNameRefuse,
  appearanceCount = 1,
  confirmButtonText,
  showCancelButton = true,
  hideCloseButton = false,
  disableKeyboardAdvance = false,
  instantText = false,
  allowBackdropDismiss = false,
  onBackdropClick,
}: DialogueBoxProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedLength, setDisplayedLength] = useState(() => instantText && lines[0] ? lines[0].text.length : 0);
  const [isRevealed, setIsRevealed] = useState(() => instantText);
  const [nameInputValue, setNameInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const activeLines = lines.length > 0 ? lines : OPENING_DIALOGUE;
  const currentLine = activeLines[currentIndex] || activeLines[0];
  const isLastNamePromptLine = hasNameInput && currentIndex === activeLines.length - 1;

  // Reset dialogue progression only when lines array content actually changes
  const prevLinesRef = useRef<DialogueLine[]>(lines);
  useEffect(() => {
    const isDifferent =
      lines.length !== prevLinesRef.current.length ||
      lines.some(
        (l, i) =>
          l.text !== prevLinesRef.current[i]?.text ||
          l.speaker !== prevLinesRef.current[i]?.speaker
      );

    if (isDifferent) {
      prevLinesRef.current = lines;
      setCurrentIndex(0);
      setDisplayedLength(instantText ? (lines[0]?.text.length || 0) : 0);
      setIsRevealed(instantText);
      setNameInputValue("");
    }
  }, [lines, instantText]);

  const isTextRevealed = instantText || isRevealed;

  // Focus input when name prompt reveals
  useEffect(() => {
    if (isLastNamePromptLine && isTextRevealed) {
      inputRef.current?.focus();
    }
  }, [isLastNamePromptLine, isTextRevealed]);

  // Typewriter effect (skipped if instantText is true)
  useEffect(() => {
    if (!isOpen || !currentLine) return;

    if (instantText) {
      setDisplayedLength(currentLine.text.length);
      setIsRevealed(true);
      return;
    }

    setDisplayedLength(0);
    setIsRevealed(false);

    const interval = setInterval(() => {
      setDisplayedLength((prev) => {
        const next = prev + 2;
        if (next >= currentLine.text.length) {
          clearInterval(interval);
          setIsRevealed(true);
          return currentLine.text.length;
        }
        return next;
      });
    }, 22);

    return () => clearInterval(interval);
  }, [isOpen, currentIndex, currentLine, instantText]);

  // Advance to next line or complete dialogue when action button is clicked
  const handleButtonClick = useCallback(() => {
    if (!isOpen || !currentLine) return;

    if (confirmButtonText) {
      onComplete();
      return;
    }

    if (isLastNamePromptLine) {
      return;
    }

    // Always advance to next line on button click
    if (currentIndex + 1 < activeLines.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onComplete();
    }
  }, [isOpen, currentLine, confirmButtonText, isLastNamePromptLine, currentIndex, activeLines.length, onComplete]);

  const handleAdvance = useCallback(() => {
    if (!isOpen || !currentLine) return;

    if (!isTextRevealed) {
      // First click: reveal full line instantly
      setDisplayedLength(currentLine.text.length);
      setIsRevealed(true);
    } else {
      // If we are at the name prompt line, require input or refusal to proceed
      if (isLastNamePromptLine) {
        return;
      }

      // Next line or complete
      if (currentIndex + 1 < activeLines.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        onComplete();
      }
    }
  }, [isOpen, currentLine, isTextRevealed, isLastNamePromptLine, currentIndex, activeLines.length, onComplete]);

  // Global key listener for dialogue advance
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (disableKeyboardAdvance) {
        return;
      }

      // Do not intercept if user is typing in the name input field
      if (document.activeElement === inputRef.current) {
        return;
      }

      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleButtonClick();
      } else if (e.key === "Escape") {
        e.preventDefault();
        if (isLastNamePromptLine && onNameRefuse) {
          onNameRefuse();
        } else {
          onComplete();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleButtonClick, isLastNamePromptLine, onNameRefuse, onComplete, disableKeyboardAdvance]);

  if (!isOpen || !currentLine) return null;

  const isHostSpeaker =
    currentLine.speaker === "Master of the House" ||
    currentLine.speaker === "Ideaphoria of the future past" ||
    currentLine.speaker.toUpperCase().includes("HOST") ||
    currentLine.speaker.toUpperCase().includes("MASTER") ||
    currentLine.speaker.toUpperCase().includes("IDEAPHORIA");

  const windowTitle =
    title ||
    (isHostSpeaker ? "Master of the House" : "Idea Kutir");

  // Positioning: Appearances 1-5 remain bottom-centered; 6+ chooses from UNPREDICTABLE_POSITIONS
  const positionClass =
    !appearanceCount || appearanceCount <= 5
      ? "bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2"
      : UNPREDICTABLE_POSITIONS[(appearanceCount - 6) % UNPREDICTABLE_POSITIONS.length];

  return (
    <>
      {allowBackdropDismiss && (
        <div
          className="fixed inset-0 z-40 bg-transparent pointer-events-auto cursor-default"
          onClick={(e) => {
            e.stopPropagation();
            if (onBackdropClick) {
              onBackdropClick();
            } else {
              onComplete();
            }
          }}
        />
      )}
      <div
        role="dialog"
        aria-label={windowTitle}
        onClick={(e) => {
          e.stopPropagation();
          if (isLastNamePromptLine) return;
          if (!disableKeyboardAdvance) {
            handleAdvance();
          }
        }}
        className={`fixed z-50 ${positionClass} w-[min(380px,92vw)] select-none font-sans pointer-events-auto cursor-pointer`}
        style={{
          backgroundColor: "#c0c0c0",
          boxShadow: "2px 2px 0px rgba(0,0,0,0.7)",
          border: "2px solid",
          borderColor: "#ffffff #000000 #000000 #ffffff",
          outline: "1px solid #dfdfdf",
        }}
      >
      {/* Classic Windows 95/98 Navy Title Bar */}
      <div
        className="h-6 px-1.5 flex items-center justify-between select-none"
        style={{
          background: "linear-gradient(90deg, #000080 0%, #1084d0 100%)",
        }}
      >
        <div className="flex items-center gap-1.5 min-w-0 pr-1">
          <span className="text-white font-bold text-[11px] sm:text-xs truncate tracking-wide font-sans">
            {windowTitle}
          </span>
        </div>
        {!hideCloseButton && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isLastNamePromptLine && onNameRefuse) {
                onNameRefuse();
              } else {
                onComplete();
              }
            }}
            title="Close"
            className="w-4 h-4 shrink-0 flex items-center justify-center text-black font-bold text-[10px] leading-none cursor-pointer"
            style={{
              backgroundColor: "#c0c0c0",
              border: "1px solid",
              borderColor: "#ffffff #000000 #000000 #ffffff",
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Classic Windows 95 Dialog Body */}
      <div className="p-3 sm:p-4 text-black flex flex-col gap-3">
        <div className="flex gap-3.5 items-start">
          {/* Left Icon Thumbnail */}
          <div className="shrink-0 w-11 h-11 flex items-center justify-center">
            {isHostSpeaker || title === "Welcome" || title === "Master of the House" ? (
              <img
                src="/ideaphoria_logo.png"
                alt={windowTitle}
                className="w-11 h-11 object-contain select-none"
              />
            ) : (
              <img
                src={avatarSrc || "/cat.jpg"}
                alt={windowTitle}
                className="w-11 h-11 object-cover border border-black/40 select-none"
              />
            )}
          </div>

          {/* Right Dialogue Text with Typewriter */}
          <div className="flex-1 min-w-0">
            <div className="text-[12px] sm:text-[13px] leading-relaxed whitespace-pre-line text-black font-sans select-text">
              {instantText ? currentLine.text : currentLine.text.substring(0, displayedLength)}
            </div>

            {/* Recessed Name Input Field */}
            {isLastNamePromptLine && isTextRevealed && (
              <div
                className="mt-2.5 flex flex-col gap-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="State your name..."
                  value={nameInputValue}
                  onChange={(e) => setNameInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Enter" && nameInputValue.trim()) {
                      onNameSubmit?.(nameInputValue.trim());
                    } else if (e.key === "Escape") {
                      onNameRefuse?.();
                    }
                  }}
                  className="w-full bg-white text-black text-[12px] px-2 py-1 font-mono outline-none"
                  style={{
                    border: "2px solid",
                    borderColor: "#808080 #ffffff #ffffff #808080",
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Classic Raised 3D Buttons */}
        <div
          className="flex justify-end gap-2 pt-1.5 border-t border-[#808080]/30"
          onClick={(e) => e.stopPropagation()}
        >
          {isLastNamePromptLine ? (
            <>
              <button
                type="button"
                disabled={!nameInputValue.trim()}
                onClick={(e) => {
                  e.stopPropagation();
                  if (nameInputValue.trim()) {
                    onNameSubmit?.(nameInputValue.trim());
                  }
                }}
                className="px-4 py-1 text-[11px] font-sans font-bold text-black min-w-[65px] text-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "#c0c0c0",
                  border: "2px solid",
                  borderColor: "#ffffff #000000 #000000 #ffffff",
                }}
              >
                OK
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNameRefuse?.();
                }}
                className="px-4 py-1 text-[11px] font-sans font-bold text-black min-w-[65px] text-center cursor-pointer"
                style={{
                  backgroundColor: "#c0c0c0",
                  border: "2px solid",
                  borderColor: "#ffffff #000000 #000000 #ffffff",
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleButtonClick();
                }}
                className="px-4 py-1 text-[11px] font-sans font-bold text-black min-w-[65px] text-center cursor-pointer"
                style={{
                  backgroundColor: "#c0c0c0",
                  border: "2px solid",
                  borderColor: "#ffffff #000000 #000000 #ffffff",
                }}
              >
                {confirmButtonText || "OK"}
              </button>
              {showCancelButton && !hasNameInput && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onComplete();
                  }}
                  className="px-4 py-1 text-[11px] font-sans font-bold text-black min-w-[65px] text-center cursor-pointer"
                  style={{
                    backgroundColor: "#c0c0c0",
                    border: "2px solid",
                    borderColor: "#ffffff #000000 #000000 #ffffff",
                  }}
                >
                  Cancel
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
