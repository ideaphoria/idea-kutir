/**
 * Centralized blue color palette anchored by signature blue #769EFD
 */
export const BLUE_PALETTE = {
  primary: "#769EFD",
  primaryHex: 0x769efd,
  lightTint: "#EBF1FF",
  midTint: "#C3D6FE",
  accentTint: "#9CBDFE",
  accentTintHex: 0x9cbdfe,
  midShade: "#436ECC",
  deepShade: "#224294",
  deepShadeHex: 0x224294,
  darkNavy: "#13265C",
  darkNavyHex: 0x13265c,
  titlebarGradient: "linear-gradient(90deg, #13265C 0%, #436ECC 50%, #769EFD 100%)",
  titlebarClass: "bg-gradient-to-r from-[#13265C] via-[#436ECC] to-[#769EFD]",
};

/**
 * Shared retro Windows 95 styling constants and design tokens.
 */
export const WIN95 = {
  colors: {
    surface: "#c0c0c0",
    surfaceLight: "#dfdfdf",
    surfaceDark: "#808080",
    titlebarFrom: BLUE_PALETTE.darkNavy,
    titlebarMid: BLUE_PALETTE.midShade,
    titlebarTo: BLUE_PALETTE.primary,
    text: "#000000",
    textWhite: "#ffffff",
    recessedBg: "#ffffff",
    accent: BLUE_PALETTE.primary,
    accentHex: BLUE_PALETTE.primaryHex,
  },

  styles: {
    raisedWindow: {
      backgroundColor: "#c0c0c0",
      boxShadow: "2px 2px 0px rgba(0,0,0,0.6)",
      border: "2px solid",
      borderColor: "#ffffff #000000 #000000 #ffffff",
      outline: "1px solid #dfdfdf",
    },
    titleBar: {
      background: BLUE_PALETTE.titlebarGradient,
    },
    raisedButton: {
      backgroundColor: "#c0c0c0",
      border: "2px solid",
      borderColor: "#ffffff #000000 #000000 #ffffff",
    },
    recessedPanel: {
      backgroundColor: "#ffffff",
      border: "2px solid",
      borderColor: "#808080 #ffffff #ffffff #808080",
    },
    recessedDarkPanel: {
      backgroundColor: "#0d0e12",
      border: "2px solid",
      borderColor: "#808080 #ffffff #ffffff #808080",
    },
    statusPane: {
      backgroundColor: "#c0c0c0",
      border: "1px solid",
      borderColor: "#808080 #ffffff #ffffff #808080",
    },
    closeButton: {
      backgroundColor: "#c0c0c0",
      border: "1px solid",
      borderColor: "#ffffff #000000 #000000 #ffffff",
    },
  },

  classes: {
    window:
      "bg-[#c0c0c0] font-sans text-black select-none shadow-[2px_2px_0px_rgba(0,0,0,0.7)] border-2 border-t-white border-l-white border-b-black border-r-black outline outline-1 outline-[#dfdfdf]",
    titlebar:
      "h-6 px-1.5 flex items-center justify-between select-none bg-gradient-to-r from-[#13265C] via-[#436ECC] to-[#769EFD] text-white font-bold text-xs font-sans",
    closeBtn:
      "w-6 h-6 sm:w-4 sm:h-4 shrink-0 flex items-center justify-center text-black font-bold text-xs sm:text-[10px] leading-none cursor-pointer bg-[#c0c0c0] border border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white",
    btn: "bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white px-3 py-2 sm:py-1 min-h-[44px] sm:min-h-[28px] inline-flex items-center justify-center text-xs text-black font-sans font-bold shadow-sm text-center cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#d4d4d4]",
    btnActive:
      "bg-[#dcdcdc] border-2 border-t-black border-l-black border-b-white border-r-white px-3 py-2 sm:py-1 min-h-[44px] sm:min-h-[28px] inline-flex items-center justify-center text-xs text-black font-sans font-bold shadow-inner text-center cursor-pointer select-none",
    recessed:
      "bg-white text-black border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white font-sans",
    statusPane:
      "bg-[#c0c0c0] text-black border border-t-[#808080] border-l-[#808080] border-b-white border-r-white px-2 py-0.5 text-xs font-sans",
  },
};
