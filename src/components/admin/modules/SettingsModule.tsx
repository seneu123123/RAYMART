import React, { useState } from "react";
import {
  Settings,
  RefreshCcw,
  Save,
  ShieldAlert,
  CheckCircle2,
  Phone,
  Building,
  Palette,
  Eye,
  Sliders,
  Sparkles,
} from "lucide-react";
import {
  SystemSettings,
  ThemeSettings,
  AccessibilitySettings,
  ColorTheme,
} from "../../../types";
import {
  StorageService,
  DEFAULT_THEME_SETTINGS,
  DEFAULT_ACCESSIBILITY_SETTINGS,
} from "../../../services/storage";

interface SettingsModuleProps {
  onDataReset: () => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({ onDataReset }) => {
  const [settings, setSettings] = useState<SystemSettings>(StorageService.getSettings());
  const [theme, setTheme] = useState<ThemeSettings>(StorageService.getThemeSettings());
  const [access, setAccess] = useState<AccessibilitySettings>(
    StorageService.getAccessibilitySettings()
  );
  const [savedAlert, setSavedAlert] = useState(false);

  const applyDOMSettings = (th: ThemeSettings, ac: AccessibilitySettings) => {
    const root = document.documentElement;
    root.classList.remove(
      "theme-ocean-cyan",
      "theme-deep-sapphire",
      "theme-emerald-lagoon",
      "theme-obsidian-luxury"
    );
    if (th.theme !== "ocean-cyan") {
      root.classList.add(`theme-${th.theme}`);
    }

    root.classList.remove("font-scale-large", "font-scale-xlarge");
    if (ac.fontSizeScale === "large") root.classList.add("font-scale-large");
    if (ac.fontSizeScale === "xlarge") root.classList.add("font-scale-xlarge");

    if (ac.highContrast) root.classList.add("high-contrast");
    else root.classList.remove("high-contrast");

    if (ac.reducedMotion) root.classList.add("reduced-motion");
    else root.classList.remove("reduced-motion");

    if (ac.dyslexicFont) root.classList.add("font-dyslexic");
    else root.classList.remove("font-dyslexic");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSettings(settings);
    StorageService.saveThemeSettings(theme);
    StorageService.saveAccessibilitySettings(access);
    applyDOMSettings(theme, access);

    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2500);
    StorageService.addAuditLog({
      action: "Settings & Display Updated",
      module: "System Settings",
      details: `ALYN SHIR settings, theme (${theme.theme}), and accessibility preferences saved.`,
      severity: "Info",
    });
  };

  const handleSelectTheme = (palette: ColorTheme, accent: string) => {
    const updated = { ...theme, theme: palette, accentColor: accent };
    setTheme(updated);
    StorageService.saveThemeSettings(updated);
    applyDOMSettings(updated, access);
  };

  const handleResetFactorySeed = () => {
    if (
      confirm(
        "WARNING: This will reset all packages, bookings, fleet assets, and payments back to the initial pre-seeded ALYN SHIR state. Proceed?"
      )
    ) {
      StorageService.resetToSeedData();
      onDataReset();
      setSettings(StorageService.getSettings());
      setTheme(DEFAULT_THEME_SETTINGS);
      setAccess(DEFAULT_ACCESSIBILITY_SETTINGS);
      applyDOMSettings(DEFAULT_THEME_SETTINGS, DEFAULT_ACCESSIBILITY_SETTINGS);
      alert("System restored to factory seed state.");
    }
  };

  const themesList: {
    id: ColorTheme;
    name: string;
    description: string;
    accent: string;
    swatches: string[];
  }[] = [
    {
      id: "ocean-cyan",
      name: "Oceanic Cyan & Seafoam (Default)",
      description: "Deep oceanic marine navy with electric cyan, seafoam green, and cerulean blue.",
      accent: "#06B6D4",
      swatches: ["#030C16", "#06B6D4", "#10B981", "#0284C7"],
    },
    {
      id: "deep-sapphire",
      name: "Deep Sapphire & Azure",
      description: "Ultra-deep Mariana sapphire with bright azure and sky blue accents.",
      accent: "#38BDF8",
      swatches: ["#020B1A", "#38BDF8", "#06B6D4", "#6366F1"],
    },
    {
      id: "emerald-lagoon",
      name: "Emerald Coastal Lagoon",
      description: "Lush Philippine island lagoon greens paired with clean turquoise waters.",
      accent: "#10B981",
      swatches: ["#021411", "#10B981", "#14B8A6", "#06B6D4"],
    },
    {
      id: "obsidian-luxury",
      name: "Obsidian Twilight & Coral",
      description: "Editorial obsidian base with sunset coral highlights.",
      accent: "#F26A4F",
      swatches: ["#070B0E", "#F26A4F", "#FF765B", "#06B6D4"],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-white font-bold">
            Operations Tower &amp; System Configuration
          </h2>
          <p className="text-xs text-slate-400">
            Customize ALYN SHIR corporate parameters, oceanic theme styling, and accessibility
          </p>
        </div>

        {savedAlert && (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" /> All Preferences Saved
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Oceanic Color Themes Section */}
        <div className="bg-[#071726] border border-cyan-500/20 rounded-3xl p-6 space-y-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-white font-bold">
                  Customizable Oceanic Theme Settings
                </h3>
                <p className="text-xs text-slate-400">
                  Switch the whole interface color palette instantly across traveler and admin views
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-500/30">
              Active: {theme.theme}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {themesList.map((t) => {
              const isSelected = theme.theme === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTheme(t.id, t.accent)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-cyan-950/40 border-cyan-400 shadow-md shadow-cyan-950"
                      : "bg-[#030C16] border-white/5 hover:border-cyan-500/30 hover:bg-[#071726]"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{t.name}</span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{t.description}</p>
                  </div>

                  <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-white/5">
                    {t.swatches.map((c, i) => (
                      <span
                        key={i}
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Theme FX Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div
              onClick={() => {
                const up = { ...theme, glowEffects: !theme.glowEffects };
                setTheme(up);
                StorageService.saveThemeSettings(up);
                applyDOMSettings(up, access);
              }}
              className="p-3.5 bg-[#030C16] rounded-2xl border border-white/5 flex items-center justify-between cursor-pointer hover:border-cyan-500/30"
            >
              <div>
                <p className="text-xs font-bold text-white">Flowy Oceanic Radiance &amp; Glow</p>
                <p className="text-[11px] text-slate-400">Cyan highlights and subtle ambient light</p>
              </div>
              <div
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  theme.glowEffects ? "bg-cyan-500" : "bg-slate-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                    theme.glowEffects ? "left-5" : "left-0.5"
                  }`}
                />
              </div>
            </div>

            <div
              onClick={() => {
                const up = { ...theme, glassmorphism: !theme.glassmorphism };
                setTheme(up);
                StorageService.saveThemeSettings(up);
                applyDOMSettings(up, access);
              }}
              className="p-3.5 bg-[#030C16] rounded-2xl border border-white/5 flex items-center justify-between cursor-pointer hover:border-cyan-500/30"
            >
              <div>
                <p className="text-xs font-bold text-white">Frosted Glass Backdrops</p>
                <p className="text-[11px] text-slate-400">Glassmorphism blur on modals and navigation</p>
              </div>
              <div
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  theme.glassmorphism ? "bg-cyan-500" : "bg-slate-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                    theme.glassmorphism ? "left-5" : "left-0.5"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Accessibility Preferences */}
        <div className="bg-[#071726] border border-cyan-500/20 rounded-3xl p-6 space-y-5 shadow-lg">
          <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-white font-bold">
                Accessibility &amp; Sensory Comfort
              </h3>
              <p className="text-xs text-slate-400">
                WCAG compliance, dyslexic readability spacing, and motion accommodations
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Scale buttons */}
            <div className="p-3.5 bg-[#030C16] rounded-2xl border border-white/5 space-y-2">
              <label className="block text-slate-300 font-semibold">Reading Scale</label>
              <div className="flex gap-1">
                {(["normal", "large", "xlarge"] as const).map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => {
                      const up = { ...access, fontSizeScale: s };
                      setAccess(up);
                      StorageService.saveAccessibilitySettings(up);
                      applyDOMSettings(theme, up);
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold capitalize cursor-pointer ${
                      access.fontSizeScale === s
                        ? "bg-cyan-500 text-[#030C16]"
                        : "bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {s === "normal" ? "100%" : s === "large" ? "110%" : "122%"}
                  </button>
                ))}
              </div>
            </div>

            {/* High Contrast */}
            <div
              onClick={() => {
                const up = { ...access, highContrast: !access.highContrast };
                setAccess(up);
                StorageService.saveAccessibilitySettings(up);
                applyDOMSettings(theme, up);
              }}
              className="p-3.5 bg-[#030C16] rounded-2xl border border-white/5 flex items-center justify-between cursor-pointer hover:border-cyan-500/30"
            >
              <div>
                <p className="font-bold text-white">High Contrast</p>
                <p className="text-[11px] text-slate-400">Vivid outlines</p>
              </div>
              <div
                className={`w-9 h-5 rounded-full relative transition-colors ${
                  access.highContrast ? "bg-cyan-500" : "bg-slate-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                    access.highContrast ? "left-4.5" : "left-0.5"
                  }`}
                />
              </div>
            </div>

            {/* Reduced Motion */}
            <div
              onClick={() => {
                const up = { ...access, reducedMotion: !access.reducedMotion };
                setAccess(up);
                StorageService.saveAccessibilitySettings(up);
                applyDOMSettings(theme, up);
              }}
              className="p-3.5 bg-[#030C16] rounded-2xl border border-white/5 flex items-center justify-between cursor-pointer hover:border-cyan-500/30"
            >
              <div>
                <p className="font-bold text-white">Reduced Motion</p>
                <p className="text-[11px] text-slate-400">Zero parallax/jank</p>
              </div>
              <div
                className={`w-9 h-5 rounded-full relative transition-colors ${
                  access.reducedMotion ? "bg-cyan-500" : "bg-slate-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                    access.reducedMotion ? "left-4.5" : "left-0.5"
                  }`}
                />
              </div>
            </div>

            {/* Dyslexic spacing */}
            <div
              onClick={() => {
                const up = { ...access, dyslexicFont: !access.dyslexicFont };
                setAccess(up);
                StorageService.saveAccessibilitySettings(up);
                applyDOMSettings(theme, up);
              }}
              className="p-3.5 bg-[#030C16] rounded-2xl border border-white/5 flex items-center justify-between cursor-pointer hover:border-cyan-500/30"
            >
              <div>
                <p className="font-bold text-white">Dyslexic Spacing</p>
                <p className="text-[11px] text-slate-400">Generous kerning</p>
              </div>
              <div
                className={`w-9 h-5 rounded-full relative transition-colors ${
                  access.dyslexicFont ? "bg-cyan-500" : "bg-slate-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                    access.dyslexicFont ? "left-4.5" : "left-0.5"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Company Registration Details */}
        <div className="bg-[#071726] border border-cyan-500/20 rounded-3xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
            <Building className="w-4 h-4 text-cyan-400" />
            <h3 className="font-serif text-lg text-white font-bold">
              ALYN SHIR Corporate &amp; DOT Registration
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">
                Registered Enterprise Name
              </label>
              <input
                type="text"
                value={settings.companyName || "ALYN SHIR Marine Expeditions & Luxury Charters Inc."}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="w-full bg-[#030C16] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">
                DOT Accreditation Number
              </label>
              <input
                type="text"
                value={settings.dotAccreditationNumber || "DOT-ACCR-RO7-2026-8819"}
                onChange={(e) => setSettings({ ...settings, dotAccreditationNumber: e.target.value })}
                className="w-full bg-[#030C16] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">
                Headquarters Address
              </label>
              <input
                type="text"
                value={settings.headquartersAddress || "Novaliches Commercial Complex, Quezon City, Metro Manila"}
                onChange={(e) => setSettings({ ...settings, headquartersAddress: e.target.value })}
                className="w-full bg-[#030C16] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">
                Bureau of Internal Revenue TIN
              </label>
              <input
                type="text"
                value={settings.tinNumber || "009-842-119-000"}
                onChange={(e) => setSettings({ ...settings, tinNumber: e.target.value })}
                className="w-full bg-[#030C16] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Emergency Hotlines & Safety Limits */}
        <div className="bg-[#071726] border border-cyan-500/20 rounded-3xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
            <Phone className="w-4 h-4 text-cyan-400" />
            <h3 className="font-serif text-lg text-white font-bold">
              Emergency Relays &amp; Operational Thresholds
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">
                Coast Guard (PCG) Emergency Hotline
              </label>
              <input
                type="text"
                value={settings.pcgEmergencyHotline || "0917-724-0111"}
                onChange={(e) => setSettings({ ...settings, pcgEmergencyHotline: e.target.value })}
                className="w-full bg-[#030C16] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">
                Mandatory Downpayment Required (%)
              </label>
              <input
                type="number"
                value={settings.downpaymentPercentageRequired || 30}
                onChange={(e) => setSettings({ ...settings, downpaymentPercentageRequired: Number(e.target.value) })}
                className="w-full bg-[#030C16] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-[#030C16] text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings &amp; Display</span>
            </button>
          </div>
        </div>
      </form>

      {/* Danger Zone: Factory Seed Reset */}
      <div className="bg-rose-950/20 border border-rose-500/25 rounded-3xl p-6 space-y-3">
        <div className="flex items-center gap-2 text-rose-400">
          <ShieldAlert className="w-5 h-5" />
          <h3 className="font-serif text-lg font-bold">Demonstration Local Storage Reset</h3>
        </div>
        <p className="text-xs text-slate-400 max-w-xl">
          Restore all local storage data, including the 6 pre-seeded ALYN SHIR tour packages, staff profiles, sample passenger manifests, and payments back to the pristine default state.
        </p>
        <button
          onClick={handleResetFactorySeed}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold transition-colors cursor-pointer border border-rose-500/30"
        >
          <RefreshCcw className="w-4 h-4" />
          <span>Reset to ALYN SHIR Factory Seed Data</span>
        </button>
      </div>
    </div>
  );
};
