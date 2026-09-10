import React, { useState } from "react";
import { Search, Anchor, Sparkles, MapPin, Compass, ArrowDown, Waves, ShieldCheck } from "lucide-react";

interface HeroSectionProps {
  onSearch: (destination: string) => void;
  onOpenWeather: () => void;
  onOpenConcierge: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearch,
  onOpenWeather,
  onOpenConcierge,
}) => {
  const [selectedDest, setSelectedDest] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(selectedDest);
    const el = document.getElementById("expeditions-catalog");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-10 pb-20">
      {/* Background Imagery with Oceanic Cyan & Deep Sapphire Gradient */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=1920&auto=format&fit=crop&q=85"
          alt="Palawan Karst Lagoons"
          className="w-full h-full object-cover opacity-25 filter saturate-150 scale-105 transform"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030C16]/85 via-[#071726]/90 to-[#030C16]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        {/* Subtle, Elegant Status Pill (Subdued as requested, full details moved to footer) */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/50 border border-cyan-500/25 backdrop-blur-md text-xs text-cyan-200">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-semibold text-white">ALYN SHIR Marine Logistics</span>
          <span className="text-cyan-500/40">•</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            PCG Inspected &amp; DOT Accredited
          </span>
        </div>

        {/* Commercial Oceanic Headline */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08]">
            Luxury Philippine <br />
            <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
              Marine Expeditions
            </span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            Curating bespoke chartered bancas, private catamaran voyages, and pristine marine sanctuary odysseys across Palawan, Siargao, Bohol, and Batanes.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto bg-[#071726]/95 backdrop-blur-xl border border-cyan-500/25 p-3 sm:p-4 rounded-3xl shadow-2xl shadow-cyan-950/40">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Destination select */}
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-[#030C16] rounded-2xl border border-cyan-500/15 text-left">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="flex-1">
                <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  Archipelago Station
                </span>
                <select
                  value={selectedDest}
                  onChange={(e) => setSelectedDest(e.target.value)}
                  className="w-full bg-transparent text-xs text-white focus:outline-none cursor-pointer font-medium"
                >
                  <option value="" className="bg-[#071726]">All 7,641 Islands</option>
                  <option value="Coron" className="bg-[#071726]">Coron, Palawan</option>
                  <option value="El Nido" className="bg-[#071726]">El Nido Bacuit Bay</option>
                  <option value="Cebu" className="bg-[#071726]">Cebu &amp; Bohol Coves</option>
                  <option value="Siargao" className="bg-[#071726]">Siargao Island</option>
                  <option value="Batanes" className="bg-[#071726]">Batanes Archipelago</option>
                </select>
              </div>
            </div>

            {/* Weather advisory check button */}
            <button
              type="button"
              onClick={onOpenWeather}
              className="flex items-center justify-between px-3.5 py-2.5 bg-[#030C16] hover:bg-cyan-950/40 rounded-2xl border border-cyan-500/15 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <Waves className="w-4 h-4 text-cyan-400 shrink-0 group-hover:animate-pulse" />
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                    Sea-State Radar
                  </span>
                  <span className="block text-xs text-white font-medium">Live Telemetry</span>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-semibold">
                Open
              </span>
            </button>

            {/* Explore expeditions button */}
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-[#030C16] text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Explore Expeditions</span>
            </button>
          </form>
        </div>

        {/* Value Highlights Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-2 text-left">
          <div className="p-4 bg-[#071726]/80 border border-cyan-500/15 rounded-2xl backdrop-blur-sm shadow-sm">
            <p className="text-[10px] text-cyan-400 uppercase tracking-wider font-semibold font-mono">
              Charter Deposit
            </p>
            <p className="text-xs font-bold text-white mt-1">30% Slot Downpayment</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Locks vessel &amp; master guide</p>
          </div>

          <div className="p-4 bg-[#071726]/80 border border-cyan-500/15 rounded-2xl backdrop-blur-sm shadow-sm">
            <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold font-mono">
              Coast Guard
            </p>
            <p className="text-xs font-bold text-emerald-300 mt-1">100% PCG Seaworthy</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Strict wave &amp; swell limits</p>
          </div>

          <div className="p-4 bg-[#071726]/80 border border-cyan-500/15 rounded-2xl backdrop-blur-sm shadow-sm">
            <p className="text-[10px] text-cyan-400 uppercase tracking-wider font-semibold font-mono">
              Instant Help
            </p>
            <button
              onClick={onOpenConcierge}
              className="text-xs font-bold text-cyan-300 hover:text-cyan-200 mt-1 flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>24/7 Auto Concierge</span>
            </button>
            <p className="text-[11px] text-slate-400 mt-0.5">Gear, tides &amp; booking tips</p>
          </div>

          <div className="p-4 bg-[#071726]/80 border border-cyan-500/15 rounded-2xl backdrop-blur-sm shadow-sm">
            <p className="text-[10px] text-teal-400 uppercase tracking-wider font-semibold font-mono">
              Eco Stewardship
            </p>
            <p className="text-xs font-bold text-white mt-1">Reef-Safe Protocol</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Ancestral Tagbanwa fees inc.</p>
          </div>
        </div>

        <div className="pt-2">
          <a
            href="#expeditions-catalog"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 transition-colors"
          >
            <span>View All Philippine Expeditions</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce text-cyan-400" />
          </a>
        </div>
      </div>
    </section>
  );
};
