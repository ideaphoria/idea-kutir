"use client";

import { PROJECTS } from "@/data/house";

interface FeaturedWorkProps {
  onSelectProject: (projectId: string) => void;
  mode: "work" | "wander";
}

export default function FeaturedWork({ onSelectProject, mode }: FeaturedWorkProps) {
  const isNight = mode === "wander";
  const featuredProjects = Object.values(PROJECTS);

  return (
    <section
      aria-labelledby="featured-work-heading"
      className="w-full max-w-6xl mx-auto pt-10 pb-16"
    >
      {/* Section Header */}
      <div className="flex items-baseline justify-between mb-8 pb-3 border-b transition-colors border-current/15">
        <div>
          <h2
            id="featured-work-heading"
            className="font-serif text-3xl sm:text-4xl font-normal tracking-tight"
          >
            Featured Work
          </h2>
          <p className="font-mono text-xs opacity-60 mt-1 uppercase tracking-wider">
            [ 4 Principal Case Studies Across the House ]
          </p>
        </div>
        <span className="font-mono text-xs opacity-50 hidden sm:inline">
          Direct Recruiter Access &rarr;
        </span>
      </div>

      {/* 4 Cards Grid Row matching Panel 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredProjects.map((project) => (
          <article
            key={project.id}
            onClick={() => onSelectProject(project.id)}
            className={`group cursor-pointer flex flex-col justify-between p-4 rounded-xl border-2 transition-all duration-300 ${
              isNight
                ? "bg-[#161411] border-[#2A2722] hover:border-[#FFDE82]/60 hover:shadow-[0_8px_30px_rgba(0,0,0,0.8)]"
                : "bg-[#FFFFFF] border-[#1A1918]/15 hover:border-[#1A1918] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)]"
            }`}
          >
            {/* Visual Thumbnail Representation */}
            <div
              className={`relative aspect-[16/10] rounded-lg overflow-hidden border mb-4 flex flex-col justify-between p-3.5 transition-colors ${
                isNight
                  ? "bg-[#1F1C18] border-[#332E27] group-hover:border-[#FFDE82]/40"
                  : "bg-[#F3EFE6] border-[#1A1918]/15 group-hover:border-[#1A1918]/40"
              }`}
            >
              {/* Thumbnail Top Marker */}
              <div className="flex justify-between font-mono text-[9px] opacity-50 uppercase tracking-widest">
                <span>{project.roomName}</span>
                <span>&rarr; View</span>
              </div>

              {/* Graphic Thumbnail Motif */}
              <div className="flex-1 flex flex-col items-center justify-center text-center p-2">
                {project.id === "selected-ui-ux" && (
                  <div className="space-y-1 w-full max-w-[120px]">
                    <div className="h-1.5 w-full bg-[#1A1918]/20 rounded-full" />
                    <div className="grid grid-cols-3 gap-1">
                      <div className="h-8 bg-[#1A1918]/10 rounded border border-[#1A1918]/15" />
                      <div className="h-8 bg-[#1A1918]/10 rounded border border-[#1A1918]/15 col-span-2" />
                    </div>
                  </div>
                )}

                {project.id === "learning-from-place" && (
                  <div className="w-full h-12 flex items-center justify-center">
                    <svg viewBox="0 0 100 40" className="w-24 h-10 stroke-current opacity-40 fill-none" strokeWidth="1.5">
                      <path d="M 5 35 Q 25 10 45 25 T 95 15" />
                      <path d="M 5 38 Q 35 25 65 35 T 95 30" opacity="0.6" />
                    </svg>
                  </div>
                )}

                {project.id === "the-hands-that-forgot" && (
                  <div className="w-full h-12 flex items-center justify-center">
                    <svg viewBox="0 0 60 40" className="w-16 h-10 stroke-current opacity-40 fill-none" strokeWidth="1.5">
                      <path d="M 15 35 C 15 20, 25 15, 30 10 C 35 15, 45 20, 45 35" />
                      <circle cx="30" cy="18" r="4" opacity="0.5" />
                    </svg>
                  </div>
                )}

                {project.id === "cetacean-communication-station" && (
                  <div className="w-full h-12 flex items-center justify-center">
                    <svg viewBox="0 0 100 40" className="w-24 h-10 fill-none stroke-blue-400 opacity-80" strokeWidth="1.5">
                      <path d="M 10 25 Q 35 12 60 18 Q 85 22 90 12 Q 85 30 65 32 Q 35 34 10 25 Z" fill="#64B5F6" fillOpacity="0.2" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Thumbnail Bottom Label */}
              <div className="font-mono text-[9px] opacity-50 tracking-wider truncate">
                {project.thumbnailPlaceholder.caption}
              </div>
            </div>

            {/* Information */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-medium tracking-tight leading-snug group-hover:text-[#C04A38] transition-colors">
                  {project.title}
                </h3>
                <p className="font-mono text-xs opacity-60 mt-1 uppercase tracking-wider">
                  {project.subtitle}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-current/10 flex items-center justify-between font-mono text-[11px] opacity-75">
                <span>Case Study</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
