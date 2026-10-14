/**
 * Shared retro Windows 95 styling constants and design tokens.
 */
export const WIN95 = {
  colors: {
    surface: "#c0c0c0",
    surfaceLight: "#dfdfdf",
    surfaceDark: "#808080",
    titlebarFrom: "#000080",
    titlebarTo: "#1084d0",
    text: "#000000",
    textWhite: "#ffffff",
    recessedBg: "#ffffff",
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
      background: "linear-gradient(90deg, #000080 0%, #1084d0 100%)",
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
      "h-6 px-1.5 flex items-center justify-between select-none bg-gradient-to-r from-[#000080] to-[#1084d0] text-white font-bold text-xs font-sans",
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
