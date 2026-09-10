import React, { useState, useRef } from "react";
import {
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Anchor,
  LifeBuoy,
  AlertCircle,
  Sliders,
  Cookie,
  FileText,
  Lock,
} from "lucide-react";

interface FooterProps {
  onOpenLegal: () => void;
  onOpenCookies: () => void;
  onOpenTheme?: () => void;
  onTriggerAdminEasterEgg?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenLegal,
  onOpenCookies,
  onOpenTheme,
  onTriggerAdminEasterEgg,
}) => {
  const [footerTapCount, setFooterTapCount] = useState(0);
  const footerTapTimer = useRef<NodeJS.Timeout | null>(null);

  const handleFooterBrandTap = () => {
    setFooterTapCount((prev) => {
      const next = prev + 1;
      if (footerTapTimer.current) clearTimeout(footerTapTimer.current);
      if (next >= 5) {
        if (onTriggerAdminEasterEgg) onTriggerAdminEasterEgg();
        return 0;
      }
      footerTapTimer.current = setTimeout(() => {
        setFooterTapCount(0);
      }, 2500);
      return next;
    });
  };
  return (
    <footer className="bg-[#030C16] border-t border-cyan-500/20 text-slate-300 pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Comprehensive Accreditation & Safety Precautions Panel */}
        <div className="bg-[#071726]/90 border border-cyan-500/20 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-xl sm:text-2xl text-white font-bold">
                  Accreditation, Compliance &amp; Maritime Safety Precautions
                </h3>
                <p className="text-xs text-slate-400">
                  ALYN SHIR Operates in Strict Conformance with Republic of the Philippines Maritime &amp; Tourism Laws
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-300 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                DOT-ACCR-RO7-2026-8819
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300 font-semibold">
                <Anchor className="w-3.5 h-3.5" />
                PCG Seaworthiness Inspected
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-xs text-slate-300">
            {/* Safety Rule 1 */}
            <div className="space-y-2 bg-[#030C16] p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 font-semibold text-cyan-400 text-sm">
                <LifeBuoy className="w-4 h-4" />
                <h4>PCG MC 03-14 Vessel Clearance</h4>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Vessels do not embark during active PAGASA Public Storm Signals or wave crests exceeding 2.0 meters. SOLAS-approved life vests are mandatory before disembarkation from port docks.
              </p>
            </div>

            {/* Safety Rule 2 */}
            <div className="space-y-2 bg-[#030C16] p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 font-semibold text-emerald-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <h4>Passenger Manifest &amp; QR Pass</h4>
              </div>
              <p className="text-slate-400 leading-relaxed">
                100% of guest manifests are transmitted directly to the Philippine Coast Guard station commander prior to anchor lifting. Each passenger is issued a verified biometric QR pass.
              </p>
            </div>

            {/* Safety Rule 3 */}
            <div className="space-y-2 bg-[#030C16] p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 font-semibold text-cyan-300 text-sm">
                <Anchor className="w-4 h-4" />
                <h4>Conservation &amp; Ancestral Domain</h4>
              </div>
              <p className="text-slate-400 leading-relaxed">
                All charters include Indigenous Tagbanwa Ancestral Domain conservation fees in Coron and Bacuit Protected Area eco-tickets in El Nido. Oxybenzone sunscreens are strictly prohibited.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-6">
          {/* Col 1 & 2: Brand & License */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={handleFooterBrandTap}
              className="flex items-center space-x-3.5 cursor-pointer select-none group"
              title="ALYN SHIR Marine Expeditions"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#071726] border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/20 group-hover:border-cyan-400 transition-colors">
                <Anchor className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                    ALYN SHIR
                  </span>
                  {footerTapCount >= 2 && (
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/40 animate-pulse">
                      Gate: {footerTapCount}/5
                    </span>
                  )}
                </div>
                <span className="block text-[11px] uppercase tracking-widest text-cyan-400 font-semibold">
                  Marine Expeditions &amp; Luxury Charters
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Department of Tourism (DOT) Accredited Philippine Archipelago Tour Operator. Specialized in private twin-engine speedboats, outrigger catamarans, and curated island sanctuary charters.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={onOpenCookies}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Cookie className="w-3.5 h-3.5" />
                <span>Cookie Settings</span>
              </button>
              <span className="text-slate-600">•</span>
              {onOpenTheme && (
                <button
                  onClick={onOpenTheme}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Display &amp; Accessibility</span>
                </button>
              )}
            </div>
          </div>

          {/* Col 3: Destinations */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-white tracking-wide">
              Archipelago Stations
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="hover:text-cyan-300 transition-colors">Coron Marine Sanctuary (Palawan)</li>
              <li className="hover:text-cyan-300 transition-colors">Bacuit Archipelago (El Nido)</li>
              <li className="hover:text-cyan-300 transition-colors">Siargao &amp; Sohoton Marine Reserve</li>
              <li className="hover:text-cyan-300 transition-colors">Mactan Strait &amp; Bohol Coves</li>
              <li className="hover:text-cyan-300 transition-colors">Batanes Windswept Islands</li>
            </ul>
          </div>

          {/* Col 4: Operations Control (No visible admin button) */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-white tracking-wide">
              Operations Control
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5 text-slate-400 font-medium">
                <Lock className="w-3 h-3 text-cyan-500/70" />
                <span>Maritime Dispatch Relay</span>
                <span className="text-[9px] text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/30">
                  Restricted
                </span>
              </li>
              <li>Passenger Manifest &amp; E-Tickets</li>
              <li>Fleet Readiness &amp; Seaworthiness</li>
              <li>DOT Field Master Guides</li>
              <li>BIR Form 2307 Tax Invoicing</li>
            </ul>
          </div>

          {/* Col 5: Contact & Location */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-white tracking-wide">
              Operations Tower
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                <span>Novaliches Commercial Complex, Quezon City, Metro Manila</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>+63 (02) 8924-1123 / PCG 0917-724-0111</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>charters@alynshir.ph</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 ALYN SHIR Marine Expeditions &amp; Luxury Charters Inc. All Rights Reserved.</p>

          <div className="flex items-center space-x-6">
            <button
              onClick={onOpenLegal}
              className="hover:text-cyan-300 transition-colors underline underline-offset-4 cursor-pointer flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Privacy Policy (RA 10173) &amp; DOT Terms</span>
            </button>
            <button
              onClick={onOpenCookies}
              className="hover:text-cyan-300 transition-colors underline underline-offset-4 cursor-pointer"
            >
              Locally Saved Cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
