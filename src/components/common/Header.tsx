import React, { useState, useEffect, useRef } from "react";
import { Compass, CloudSun, Search, Sparkles, Sliders, Menu, X, Anchor, Shield, Lock } from "lucide-react";
import { UserAccount } from "../../types";

interface HeaderProps {
  currentPortal: "client" | "admin";
  onSwitchPortal: (portal: "client" | "admin") => void;
  onOpenWeather: () => void;
  onOpenTracker: () => void;
  onOpenConcierge: () => void;
  onOpenTheme?: () => void;
  onTriggerAdminEasterEgg?: () => void;
  currentUser: UserAccount;
}

export const Header: React.FC<HeaderProps> = ({
  currentPortal,
  onSwitchPortal,
  onOpenWeather,
  onOpenTracker,
  onOpenConcierge,
  onOpenTheme,
  onTriggerAdminEasterEgg,
  currentUser,
}) => {
  const [currentTime, setCurrentTime] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Manila",
        }) + " PHT"
      );
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleBrandClick = () => {
    if (currentPortal === "admin") {
      onSwitchPortal("client");
      return;
    }

    setTapCount((prev) => {
      const next = prev + 1;
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);

      if (next >= 5) {
        if (onTriggerAdminEasterEgg) {
          onTriggerAdminEasterEgg();
        }
        return 0;
      }

      tapTimerRef.current = setTimeout(() => {
        setTapCount(0);
      }, 2500);

      return next;
    });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#030C16]/90 backdrop-blur-xl border-b border-cyan-500/20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo with 5-Tap Easter Egg */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBrandClick}
              title={currentPortal === "client" ? "Tap 5x for Operations Gateway (or press Ctrl+Shift+A)" : "Return to traveler view"}
              className="flex items-center space-x-3.5 group text-left cursor-pointer select-none"
            >
              <div className="relative w-11 h-11 rounded-2xl bg-[#071726] border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 group-hover:shadow-lg group-hover:shadow-cyan-500/25 transition-all">
                <Anchor className="w-6 h-6 animate-pulse" />
                {tapCount >= 2 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-[#030C16] text-[10px] font-mono font-bold flex items-center justify-center animate-ping">
                    {tapCount}
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="block font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                    ALYN SHIR
                  </span>
                  {tapCount >= 2 && (
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/40 animate-pulse">
                      Gate: {tapCount}/5
                    </span>
                  )}
                </div>
                <span className="block text-[10px] tracking-[0.22em] uppercase text-cyan-400/80 font-semibold">
                  Marine Expeditions &amp; Charters
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-5 text-xs font-semibold">
            <button
              onClick={() => {
                if (currentPortal !== "client") onSwitchPortal("client");
                const el = document.getElementById("expeditions-catalog");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer py-1.5 px-2.5 rounded-lg hover:bg-cyan-950/30"
            >
              Curated Charters
            </button>

            <button
              onClick={onOpenWeather}
              className="flex items-center gap-1.5 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer py-1.5 px-2.5 rounded-lg hover:bg-cyan-950/30"
            >
              <CloudSun className="w-4 h-4 text-cyan-400" />
              <span>Marine Weather Radar</span>
            </button>

            <button
              onClick={onOpenTracker}
              className="flex items-center gap-1.5 text-slate-300 hover:text-emerald-300 transition-colors cursor-pointer py-1.5 px-2.5 rounded-lg hover:bg-emerald-950/30"
            >
              <Search className="w-4 h-4 text-emerald-400" />
              <span>Track Charter QR</span>
            </button>

            <button
              onClick={onOpenConcierge}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer shadow-sm shadow-cyan-500/15"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Auto Concierge</span>
            </button>

            {onOpenTheme && (
              <button
                onClick={onOpenTheme}
                title="Theme & Accessibility Settings"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden lg:inline">Theme</span>
              </button>
            )}
          </nav>

          {/* Right Controls: Date & Status (No visible admin button) */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right text-xs">
              <span className="text-slate-400 block font-mono text-[11px]">{currentTime}</span>
              <span className="text-emerald-400 text-[10px] font-semibold flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                PCG Voyage Clearances Active
              </span>
            </div>

            {/* If currently in admin portal, provide traveler exit */}
            {currentPortal === "admin" && (
              <button
                onClick={() => onSwitchPortal("client")}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#030C16] text-xs font-bold transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>Traveler Portal</span>
              </button>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-cyan-500/15 space-y-3 bg-[#071726]/95 px-2 rounded-b-2xl">
            <div className="flex items-center justify-between text-xs px-3 py-1.5 bg-black/40 rounded-xl font-mono text-slate-400">
              <span>{currentTime}</span>
              <span className="text-emerald-400 font-semibold">PCG Cleared</span>
            </div>

            <div className="flex flex-col space-y-1 text-xs">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSwitchPortal("client");
                  const el = document.getElementById("expeditions-catalog");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-left px-3 py-2 rounded-xl text-slate-200 hover:bg-cyan-950/40"
              >
                Curated Expeditions
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenWeather();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-200 hover:bg-cyan-950/40"
              >
                <CloudSun className="w-4 h-4 text-cyan-400" />
                <span>Marine Weather Radar</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenTracker();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-200 hover:bg-cyan-950/40"
              >
                <Search className="w-4 h-4 text-emerald-400" />
                <span>Track Charter QR</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenConcierge();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-cyan-300 bg-cyan-950/40 font-semibold"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Auto Concierge</span>
              </button>

              {onOpenTheme && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenTheme();
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-white/5"
                >
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>Theme &amp; Accessibility</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
