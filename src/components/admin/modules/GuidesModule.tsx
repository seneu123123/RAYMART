import React, { useState } from "react";
import { Users, Award, ShieldCheck, CheckCircle2, Clock, Phone, Mail, MapPin } from "lucide-react";
import { UserAccount } from "../../../types";
import { StorageService } from "../../../services/storage";

export const GuidesModule: React.FC = () => {
  const staff = StorageService.getStaffAccounts();
  const guides = staff.filter(
    (s) =>
      s.role === "Tour Guide" ||
      s.role === "Field Tour Guide" ||
      s.role === "Operations Dispatch" ||
      s.role === "Operations Manager"
  );

  const [activeGuide, setActiveGuide] = useState<UserAccount>(guides[0] || staff[0]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-[#F4F1EA] font-bold">
            DOT Tour Guide Roster & Field Dispatch
          </h2>
          <p className="text-xs text-[#7C8B96]">
            Accredited Department of Tourism field guides with Wilderness First Responder (WFR) certifications
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          {guides.length} Active Field Officers
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Guides List */}
        <div className="bg-[#0B1014] border border-white/10 rounded-2xl p-4 space-y-3">
          <h3 className="text-xs uppercase tracking-widest text-[#7C8B96] font-semibold px-2">
            Field Officer Directory
          </h3>

          <div className="space-y-2">
            {guides.map((g) => {
              const isSelected = activeGuide.id === g.id;
              return (
                <div
                  key={g.id}
                  onClick={() => setActiveGuide(g)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#F26A4F]/10 border-[#F26A4F] text-[#F4F1EA]"
                      : "bg-[#070B0E] border-white/5 text-[#D1CCC0] hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">{g.name}</p>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono">
                      {g.dotLicenseNumber || "DOT-LIC-OK"}
                    </span>
                  </div>
                  <p className="text-xs text-[#7C8B96] mt-0.5">{g.role}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {g.languagesSpoken?.map((lang) => (
                      <span key={lang} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-[#D1CCC0]">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Guide Detail Dossier */}
        {activeGuide && (
          <div className="lg:col-span-2 bg-[#0B1014] border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#F26A4F] font-bold">
                  Official DOT Accreditation Dossier
                </span>
                <h3 className="font-serif text-2xl text-[#F4F1EA] font-bold mt-0.5">
                  {activeGuide.name}
                </h3>
                <p className="text-xs text-[#7C8B96]">{activeGuide.role} • Employee ID: {activeGuide.id}</p>
              </div>

              <div className="text-left sm:text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Seaworthiness Cleared
                </span>
                <p className="text-[11px] font-mono text-[#7C8B96] mt-1">
                  License: {activeGuide.dotLicenseNumber || "DOT-ACCR-2026"}
                </p>
              </div>
            </div>

            {/* Contact & Languages */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-[#070B0E] rounded-xl border border-white/5 space-y-1">
                <p className="text-[#7C8B96] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#F26A4F]" /> Official Email
                </p>
                <p className="text-[#F4F1EA] font-medium truncate">{activeGuide.email}</p>
              </div>

              <div className="p-3 bg-[#070B0E] rounded-xl border border-white/5 space-y-1">
                <p className="text-[#7C8B96] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#F26A4F]" /> Satellite Phone
                </p>
                <p className="text-[#F4F1EA] font-medium">{activeGuide.phone || "+63 917 455 3617"}</p>
              </div>

              <div className="p-3 bg-[#070B0E] rounded-xl border border-white/5 space-y-1">
                <p className="text-[#7C8B96] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#F26A4F]" /> Home Base
                </p>
                <p className="text-[#F4F1EA] font-medium">Coron & Palawan Base</p>
              </div>
            </div>

            {/* Certifications & Badges */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-widest text-[#7C8B96] font-semibold flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" /> Professional Certifications & Ratings
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {activeGuide.certifications?.map((c, i) => (
                  <div key={i} className="p-3 bg-[#070B0E] rounded-xl border border-white/5 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-[#F4F1EA] font-medium">{c}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assigned Expeditions */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs uppercase tracking-widest text-[#7C8B96] font-semibold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-400" /> Active Tour Assignments (Row-Level Access)
              </h4>

              <div className="p-4 bg-[#070B0E] rounded-xl border border-white/5 space-y-2 text-xs">
                <p className="text-[#F4F1EA] font-semibold">
                  PKG-CORON-01: Coron Ultimate Island Expedition & Kayangan Lake
                </p>
                <p className="text-[#7C8B96]">
                  Assigned Charter: HT-2026-8819 (Dr. Maria Lourdes Santos, 4 Guests) • Departing Oct 14, 2026
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">
                    Briefing Completed
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 text-[10px]">
                    Emergency Radios Checked
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
