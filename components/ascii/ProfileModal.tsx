"use client";

import React, { useEffect } from "react";
import { WIN95 } from "./retroWin95";

interface ProfileModalProps {
  onClose: () => void;
}

export default function ProfileModal({ onClose }: ProfileModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "e" || e.key === "E") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/60 pointer-events-auto select-none font-sans"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black shadow-[2px_2px_0px_rgba(0,0,0,0.7)] text-black flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title Bar */}
        <header className="h-7 sm:h-6 px-1.5 flex items-center justify-between select-none bg-gradient-to-r from-[#13265C] via-[#436ECC] to-[#769EFD] text-white shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-bold truncate">
            <span>👤</span>
            <span id="profile-modal-title">Resident Profile — Ashani Gorakhnath (Curriculum Vitae)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 sm:w-4 sm:h-4 shrink-0 flex items-center justify-center text-black font-bold text-xs sm:text-[10px] leading-none cursor-pointer bg-[#c0c0c0] border border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white"
            title="Close [ESC]"
          >
            ✕
          </button>
        </header>

        {/* Sub-header status bar: Neutral, authentic role label */}
        <div className="px-3 py-1.5 border-b border-[#808080]/30 bg-[#c0c0c0] flex items-center justify-between text-xs text-black shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[11px] uppercase tracking-wide text-[#333]">
              Role:
            </span>
            <span className="border border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white px-2 py-0.5 text-[11px] font-semibold text-[#13265C]">
              UX Designer | Product Design | User Research
            </span>
          </div>
          <span className="text-[11px] text-[#555] font-mono hidden sm:inline">
            Bangalore, India &middot; PROFESSIONAL CV
          </span>
        </div>

        {/* Content Body: Scrollable Authentic CV Dossier */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 bg-[#c0c0c0] flex flex-col gap-3 font-sans">
          {/* Section 1: Professional Summary */}
          <section className="border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white p-3.5 space-y-2">
            <div className="text-[11px] font-bold text-[#13265C] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#e5e5e5] pb-1">
              <span>📋</span>
              <span>1. Professional Summary</span>
            </div>
            <p className="text-xs text-black leading-relaxed select-text">
              UX Designer with 7+ years of multidisciplinary design experience, including 4+ years designing digital products across fintech, telecom, ecommerce, media, and enterprise environments. Experienced in user research, information architecture, user flows, wireframing, prototyping, usability testing, accessibility, and scalable design systems.
            </p>
            <p className="text-xs text-[#333] leading-relaxed select-text border-l-2 border-[#769EFD] pl-2.5 italic">
              I am particularly interested in designing complex digital products where research, systems thinking, and interaction design come together to create intuitive experiences at scale. I work closely with product managers, developers, and stakeholders to translate complex requirements into intuitive, responsive, and measurable digital experiences across web and mobile.
            </p>
          </section>

          {/* Section 2: Professional Experience (Authentic Employment History) */}
          <section className="border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white p-3.5 space-y-3">
            <div className="text-[11px] font-bold text-[#13265C] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#e5e5e5] pb-1">
              <span>💼</span>
              <span>2. Professional Experience</span>
            </div>

            {/* Experience 1: India Today Group */}
            <div className="space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
                <div>
                  <h3 className="font-bold text-xs text-black">
                    India Today Group
                  </h3>
                  <span className="text-[11px] font-semibold text-[#13265C]">
                    UI/UX Designer &middot; Noida, UP
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#555] bg-[#f0f0f0] px-1.5 py-0.5 border border-[#ddd] self-start sm:self-auto">
                  July 2023 &ndash; January 2025
                </span>
              </div>
              <ul className="text-xs text-[#333] space-y-1 list-disc list-inside select-text pl-1">
                <li>
                  Conducted UX and UI audits across 10+ digital products, identifying usability, consistency, and responsive design issues and contributing to a 30% improvement in design consistency.
                </li>
                <li>
                  Designed responsive web and mobile experiences across Tak Digital Products, translating product requirements into user flows, wireframes, and high-fidelity interfaces.
                </li>
                <li>
                  Designed key landing experiences, including a hotline landing page that contributed to a 20% increase in user engagement and 15% increase in revenue.
                </li>
                <li>
                  Facilitated 12+ cross-functional sessions with product, development, and other stakeholders, improving design handoffs by 50%.
                </li>
                <li>
                  Participated in implementation and QA reviews to ensure design intent, responsive behavior, and visual consistency were maintained through delivery.
                </li>
                <li>
                  <strong>Special Initiatives:</strong> Introduced the use of Adobe Stock and Pexels ensuring 100% legal compliance; increased product documentation by 50% via structured PRDs and JIRA; led UI audits for AstroTak and Tak Live identifying 15+ critical issues.
                </li>
              </ul>
            </div>

            {/* Experience 2: One97 Communications (Paytm) */}
            <div className="space-y-1 border-t border-[#f0f0f0] pt-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
                <div>
                  <h3 className="font-bold text-xs text-black">
                    One97 Communications (Paytm)
                  </h3>
                  <span className="text-[11px] font-semibold text-[#13265C]">
                    UI/UX Designer &middot; Noida, UP
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#555] bg-[#f0f0f0] px-1.5 py-0.5 border border-[#ddd] self-start sm:self-auto">
                  April 2021 &ndash; July 2023
                </span>
              </div>
              <ul className="text-xs text-[#333] space-y-1 list-disc list-inside select-text pl-1">
                <li>
                  Designed digital products across enterprise, telecom, fintech, ecommerce, and B2C environments, collaborating with product managers, developers, and marketing teams.
                </li>
                <li>
                  Designed user flows, wireframes, high-fidelity prototypes, and responsive interfaces across web and mobile platforms.
                </li>
                <li>
                  Contributed to scalable design systems and component-based UI for products serving diverse user groups.
                </li>
                <li>
                  Designed culturally contextualized experiences for Nagad in Bangladesh, adapting interaction patterns and visual systems to regional user behavior.
                </li>
                <li>
                  Worked across products and clients including Vi, BSNL, Airtel, Ooredoo, iPay, Nagad, and Paytm First Games (Key projects: Vi Services, Hardy Games, iPay, Nagad).
                </li>
              </ul>
            </div>

            {/* Experience 3: Freelance Designer */}
            <div className="space-y-1 border-t border-[#f0f0f0] pt-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
                <div>
                  <h3 className="font-bold text-xs text-black">
                    Freelance Designer
                  </h3>
                  <span className="text-[11px] font-semibold text-[#13265C]">
                    Multiple Clients &middot; Gurgaon, HR
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#555] bg-[#f0f0f0] px-1.5 py-0.5 border border-[#ddd] self-start sm:self-auto">
                  May 2020 &ndash; April 2021
                </span>
              </div>
              <ul className="text-xs text-[#333] space-y-1 list-disc list-inside select-text pl-1">
                <li>
                  Adapted to the challenges presented by the pandemic, working remotely and delivering customized digital content.
                </li>
                <li>
                  Successfully handled 20+ clients as a freelance designer, delivering high-quality customized digital solutions.
                </li>
                <li>
                  Designed and developed merchandise for KAW&apos;s Charity Shop, raising over Rs 15,000 in funds for the organization.
                </li>
                <li>
                  Created animated shorts for e-cards and social media campaigns.
                </li>
              </ul>
            </div>

            {/* Experience 4: Needledust Pvt. Ltd. */}
            <div className="space-y-1 border-t border-[#f0f0f0] pt-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
                <div>
                  <h3 className="font-bold text-xs text-black">
                    Needledust Pvt. Ltd.
                  </h3>
                  <span className="text-[11px] font-semibold text-[#13265C]">
                    Designer &middot; Gurgaon, HR
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#555] bg-[#f0f0f0] px-1.5 py-0.5 border border-[#ddd] self-start sm:self-auto">
                  February 2020 &ndash; May 2020
                </span>
              </div>
              <ul className="text-xs text-[#333] space-y-1 list-disc list-inside select-text pl-1">
                <li>
                  Developed multiple motion graphics videos that increased viewership by 25%, resulting in increased brand recognition.
                </li>
                <li>
                  Developed a range of marketing materials, including illustrations, brochures, flyers, and presentations, resulting in improved customer engagement.
                </li>
              </ul>
            </div>

            {/* Experience 5: Metro Brands Pvt. Ltd. */}
            <div className="space-y-1 border-t border-[#f0f0f0] pt-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
                <div>
                  <h3 className="font-bold text-xs text-black">
                    Metro Brands Pvt. Ltd.
                  </h3>
                  <span className="text-[11px] font-semibold text-[#13265C]">
                    Graphic Designer &middot; Mumbai, MH
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#555] bg-[#f0f0f0] px-1.5 py-0.5 border border-[#ddd] self-start sm:self-auto">
                  February 2017 &ndash; January 2019
                </span>
              </div>
              <ul className="text-xs text-[#333] space-y-1 list-disc list-inside select-text pl-1">
                <li>
                  Designed innovative packaging solutions for in-house brands like Metro and Mochi, enhancing product appeal and driving a 15% increase in sales.
                </li>
                <li>
                  Worked closely with the production team to streamline the manufacturing process, ensuring designs were executed to the highest standards.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3: Education */}
          <section className="border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white p-3.5 space-y-2.5">
            <div className="text-[11px] font-bold text-[#13265C] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#e5e5e5] pb-1">
              <span>🎓</span>
              <span>3. Education &amp; Certifications</span>
            </div>
            
            <div className="space-y-2 text-xs">
              {/* Srishti Manipal */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
                <div>
                  <h4 className="font-bold text-black">
                    Srishti Manipal Institute of Art, Design and Technology
                  </h4>
                  <span className="text-[11px] text-[#13265C]">
                    Master&apos;s in Human-Centered Design &middot; Bangalore, KA
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#555] bg-[#f0f0f0] px-1.5 py-0.5 border border-[#ddd] self-start sm:self-auto">
                  2025 &ndash; 2027 (Ongoing)
                </span>
              </div>

              {/* IIT Delhi */}
              <div className="border-t border-[#f0f0f0] pt-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
                <div>
                  <h4 className="font-bold text-black">
                    Indian Institute of Technology Delhi (IIT Delhi)
                  </h4>
                  <span className="text-[11px] text-[#13265C]">
                    Design Thinking for User Experience (CEP) Certification &middot; New Delhi, DL
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#555] bg-[#f0f0f0] px-1.5 py-0.5 border border-[#ddd] self-start sm:self-auto">
                  2022 &ndash; 2023
                </span>
              </div>

              {/* Design Boat */}
              <div className="border-t border-[#f0f0f0] pt-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
                <div>
                  <h4 className="font-bold text-black">
                    Design Boat
                  </h4>
                  <span className="text-[11px] text-[#13265C]">
                    UI/UX Design Bootcamp &middot; New Delhi, DL
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#555] bg-[#f0f0f0] px-1.5 py-0.5 border border-[#ddd] self-start sm:self-auto">
                  Completed
                </span>
              </div>

              {/* NIFT Mumbai */}
              <div className="border-t border-[#f0f0f0] pt-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
                <div>
                  <h4 className="font-bold text-black">
                    National Institute of Fashion Technology (NIFT Mumbai)
                  </h4>
                  <span className="text-[11px] text-[#13265C]">
                    Bachelor&apos;s in Design (Fashion &amp; Lifestyle Design) &middot; Mumbai, MH
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#555] bg-[#f0f0f0] px-1.5 py-0.5 border border-[#ddd] self-start sm:self-auto">
                  2013 &ndash; 2017
                </span>
              </div>
            </div>
          </section>

          {/* Section 4: Skills & Core Competencies */}
          <section className="border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white p-3.5 space-y-2.5">
            <div className="text-[11px] font-bold text-[#13265C] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#e5e5e5] pb-1">
              <span>🛠️</span>
              <span>4. Core Competencies &amp; Technical Skills</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="bg-[#f8f9fa] border border-[#e5e5e5] p-2 space-y-1">
                <span className="font-bold text-[#13265C] block text-[11px]">
                  UX Design
                </span>
                <p className="text-[11px] text-[#333] leading-snug">
                  User Research, User Interviews, Usability Testing, Information Architecture, User Flows, Journey Mapping, Heuristic Evaluation, Competitive Analysis, A/B Testing, Accessibility, UX Strategy.
                </p>
              </div>

              <div className="bg-[#f8f9fa] border border-[#e5e5e5] p-2 space-y-1">
                <span className="font-bold text-[#13265C] block text-[11px]">
                  UI Design
                </span>
                <p className="text-[11px] text-[#333] leading-snug">
                  Wireframing, Prototyping, Responsive Design, Interaction Design, Design Systems, Component Libraries, Mobile &amp; Web Design, High Fidelity UI.
                </p>
              </div>

              <div className="bg-[#f8f9fa] border border-[#e5e5e5] p-2 space-y-1">
                <span className="font-bold text-[#13265C] block text-[11px]">
                  Visual Design
                </span>
                <p className="text-[11px] text-[#333] leading-snug">
                  Icon Design, Branding &amp; Packaging, Digital Illustration, Banner Design, Infographics, Marketing Creatives, Logo Design, Animation, Video Editing, Textual Hierarchy.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Fixed Bottom Action & Contact Bar */}
        <footer className="p-2.5 border-t-2 border-[#808080] bg-[#c0c0c0] flex flex-wrap items-center justify-between gap-2 shrink-0">
          {/* Contact Buttons */}
          <div className="flex items-center gap-2">
            <a
              href="https://www.behance.net/AshaniNath"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-[#c0c0c0] hover:bg-[#d0d0d0] border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white font-bold text-xs text-black flex items-center gap-1.5 shadow-[1px_1px_0px_rgba(0,0,0,0.5)]"
              title="View Ashani's Portfolio on Behance"
            >
              <span>💼</span>
              <span>Behance ↗</span>
            </a>

            <a
              href="mailto:ashani.nath.ux@gmail.com?subject=Hello%20Ashani"
              className="px-3 py-1 bg-[#c0c0c0] hover:bg-[#d0d0d0] border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white font-bold text-xs text-black flex items-center gap-1.5 shadow-[1px_1px_0px_rgba(0,0,0,0.5)]"
              title="Send email to ashani.nath.ux@gmail.com"
            >
              <span>✉️</span>
              <span>Email Ashani</span>
            </a>
          </div>

          {/* Close Action Button */}
          <button
            type="button"
            onClick={onClose}
            className={`${WIN95.classes.btn} px-4 py-1 text-xs`}
          >
            Close [ESC]
          </button>
        </footer>
      </div>
    </div>
  );
}
