"use client";

interface ModeSwitcherProps {
  mode: "work" | "wander";
  onToggle: (mode: "work" | "wander") => void;
}

export default function ModeSwitcher({ mode, onToggle }: ModeSwitcherProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        role="radiogroup"
        aria-label="Portfolio Mode Switcher"
        className={`inline-flex items-center p-1 rounded-full border transition-all duration-300 ${
          mode === "work"
            ? "bg-[#EAE5D9] border-[#1A1918]/30 shadow-inner"
            : "bg-[#1F1E1B] border-white/20 shadow-inner"
        }`}
      >
        <button
          type="button"
          role="radio"
          aria-checked={mode === "work"}
          onClick={() => onToggle("work")}
          className={`px-3.5 py-1 text-xs font-mono tracking-wider rounded-full transition-all duration-300 ${
            mode === "work"
              ? "bg-[#1A1918] text-[#F4F1EA] shadow-sm font-semibold"
              : "text-[#F4F1EA]/60 hover:text-[#F4F1EA]"
          }`}
        >
          Work
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={mode === "wander"}
          onClick={() => onToggle("wander")}
          className={`px-3.5 py-1 text-xs font-mono tracking-wider rounded-full transition-all duration-300 ${
            mode === "wander"
              ? "bg-[#F4F1EA] text-[#1A1918] shadow-sm font-semibold"
              : "text-[#1A1918]/60 hover:text-[#1A1918]"
          }`}
        >
          Wander
        </button>
      </div>
    </div>
  );
}
