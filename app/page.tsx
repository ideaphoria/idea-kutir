"use client";

import dynamic from "next/dynamic";

// Dynamic import with ssr: false ensures Three.js WebGL and DOM operations only run in the browser
const AsciiHouse = dynamic(() => import("@/components/ascii/AsciiHouse"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-[#060605] text-[#d6d2c4] font-mono flex flex-col items-center justify-center p-6 select-none">
      <div className="text-sm tracking-widest text-[#3b82f6] animate-pulse">
        [ ENTERING THE HOUSE ... ]
      </div>
      <div className="text-xs text-[#736f65] mt-2">
        INITIALIZING 3D ASCII ENVIRONMENT
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="fixed inset-0 w-full h-full overflow-hidden bg-[#060605]">
      <AsciiHouse />
    </main>
  );
}