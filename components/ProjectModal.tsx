"use client";

import { useEffect } from "react";
import { PROJECTS, ROOMS } from "@/data/house";

interface ProjectModalProps {
  projectId: string | null;
  onClose: () => void;
  onNavigateProject: (nextProjectId: string) => void;
  mode: "work" | "wander";
}

export default function ProjectModal({
  projectId,
  onClose,
  onNavigateProject,
  mode,
}: ProjectModalProps) {
  const isNight = mode === "wander";
  const project = projectId ? PROJECTS[projectId] : null;
  const room = project ? ROOMS[project.roomId] : null;

  // Keyboard escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!project || !room) return null;

  const projectKeys = Object.keys(PROJECTS);
  const currentIndex = projectKeys.indexOf(project.id);
  const nextProjectId = projectKeys[(currentIndex + 1) % projectKeys.length];
  const nextProject = PROJECTS[nextProjectId];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-project-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto backdrop-blur-md bg-black/60 transition-all duration-300"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-5xl rounded-2xl overflow-hidden border-2 shadow-2xl transition-all duration-300 my-auto ${
          isNight
            ? "bg-[#14120F] text-[#F4F1EA] border-[#332E27]"
            : "bg-[#F8F5EE] text-[#1A1918] border-[#1A1918]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar with House Breadcrumb */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-current/15">
          <nav aria-label="Breadcrumb" className="font-mono text-xs uppercase tracking-wider opacity-70 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="hover:underline flex items-center gap-1 font-semibold"
            >
              &larr; House
            </button>
            <span>/</span>
            <span>{room.name}</span>
            <span>/</span>
            <span className="opacity-100 font-medium truncate max-w-[200px]">
              {project.title}
            </span>
          </nav>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Case Study"
            className="w-8 h-8 rounded-full border border-current/20 flex items-center justify-center font-mono text-sm hover:opacity-60 transition-opacity"
          >
            &times;
          </button>
        </div>

        {/* Modal Body: Split Layout matching Panel 4 */}
        <div className="grid lg:grid-cols-12 max-h-[80vh] overflow-y-auto">
          
          {/* Left Sidebar (Room & Project Scope) */}
          <aside className="lg:col-span-4 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-current/15 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#C04A38] font-bold block">
                {room.wing} &middot; Room {room.number}
              </span>

              <h2 className="font-serif text-3xl font-medium tracking-tight">
                {room.name}
              </h2>

              <p className="font-mono text-xs opacity-75">
                {room.disciplines.join(" · ")}
              </p>

              <div className="pt-4 border-t border-current/15 space-y-3 font-mono text-xs">
                <div>
                  <span className="opacity-50 uppercase text-[10px] block">Role &amp; Practice</span>
                  <span className="font-sans text-sm font-medium">{project.role}</span>
                </div>
                <div>
                  <span className="opacity-50 uppercase text-[10px] block">Context</span>
                  <span className="font-sans text-sm">{project.context}</span>
                </div>
              </div>
            </div>

            {/* Next Project Fast-Switch */}
            <div className="pt-6 border-t border-current/15 font-mono text-xs">
              <span className="opacity-50 text-[10px] uppercase tracking-wider block mb-2">
                Continue Through House &rarr;
              </span>
              <button
                type="button"
                onClick={() => onNavigateProject(nextProject.id)}
                className="w-full text-left p-3 rounded-lg border border-current/20 hover:border-current transition-colors flex justify-between items-center group"
              >
                <div>
                  <span className="font-serif text-base font-medium block group-hover:text-[#C04A38] transition-colors">
                    {nextProject.title}
                  </span>
                  <span className="text-[10px] opacity-60 uppercase">{nextProject.roomName}</span>
                </div>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </button>
            </div>
          </aside>

          {/* Right Main Content (Professional Case Study) */}
          <main className="lg:col-span-8 p-6 sm:p-10 space-y-8">
            
            {/* Project Header */}
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-[#C04A38] font-bold block mb-1">
                {project.category}
              </span>
              <h1 id="modal-project-title" className="font-serif text-3xl sm:text-5xl font-medium tracking-tight">
                {project.title}
              </h1>
              <p className="font-serif italic text-lg sm:text-xl opacity-80 mt-3 leading-relaxed">
                {project.summary}
              </p>
            </div>

            {/* Visual Specimen Plate (Image Replacement Frame) */}
            <div
              className={`relative aspect-[16/9] rounded-xl overflow-hidden border-2 flex flex-col justify-between p-5 sm:p-7 ${
                isNight
                  ? "bg-[#1D1A16] border-[#383127]"
                  : "bg-[#EFE9DB] border-[#1A1918]/25"
              }`}
            >
              <div className="flex justify-between font-mono text-[10px] opacity-50 uppercase tracking-widest border-b border-current/15 pb-2">
                <span>+ SPECIMEN FRAME // {room.name.toUpperCase()}</span>
                <span>[ ARTIFACT SPEC ]</span>
                <span>+</span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <span className="font-serif italic text-2xl font-medium">
                  {project.title}
                </span>
                <span className="font-mono text-xs opacity-60 mt-2 max-w-sm">
                  {/* Placeholder comment: Replace container with actual project asset / screenshot */}
                  {project.thumbnailPlaceholder.caption}
                </span>
              </div>

              <div className="flex justify-between font-mono text-[10px] opacity-50 uppercase border-t border-current/15 pt-2">
                <span>VERIFIED ARTIFACT</span>
                <span>SCALE: FULL WORKFLOW</span>
              </div>
            </div>

            {/* Overview / Context Section */}
            <div className="space-y-3">
              <h3 className="font-mono text-xs uppercase tracking-widest font-bold opacity-60">
                01 &middot; Context &amp; Inquiry
              </h3>
              <p className="text-base sm:text-lg leading-relaxed opacity-85">
                {project.overview}
              </p>
            </div>

            {/* Process & System Pillars */}
            <div className="space-y-4 pt-4 border-t border-current/15">
              <h3 className="font-mono text-xs uppercase tracking-widest font-bold opacity-60">
                02 &middot; Process &amp; Key Decisions
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {project.processPoints.map((point, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border ${
                      isNight ? "bg-[#181612] border-white/10" : "bg-white border-black/10"
                    }`}
                  >
                    <span className="font-mono text-xs text-[#C04A38] font-bold block mb-1">
                      [ Step 0{index + 1} ]
                    </span>
                    <h4 className="font-serif text-base font-medium mb-1.5">
                      {point.title}
                    </h4>
                    <p className="text-xs opacity-75 font-sans leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Outcome & Evaluation */}
            <div className="space-y-3 pt-4 border-t border-current/15">
              <h3 className="font-mono text-xs uppercase tracking-widest font-bold opacity-60">
                03 &middot; Outcomes &amp; System Highlights
              </h3>
              <div
                className={`p-5 rounded-xl border font-mono text-xs leading-relaxed ${
                  isNight ? "bg-[#1B1915] border-white/10 text-white/80" : "bg-black/[0.03] border-black/15 text-black/80"
                }`}
              >
                {project.outcomesPlaceholder}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-6 border-t border-current/15 flex justify-between items-center">
              <button
                type="button"
                onClick={onClose}
                className="font-mono text-xs uppercase tracking-wider hover:underline"
              >
                &larr; Return to House
              </button>

              <button
                type="button"
                onClick={() => onNavigateProject(nextProject.id)}
                className="px-5 py-2.5 rounded-lg font-mono text-xs uppercase tracking-wider bg-[#1A1918] text-[#F4F1EA] hover:bg-[#C04A38] transition-colors"
              >
                Next Room: {nextProject.title} &rarr;
              </button>
            </div>

          </main>

        </div>
      </div>
    </div>
  );
}
