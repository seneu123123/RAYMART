import React, { useState, useEffect } from "react";
import { X, Palette, Eye, Sparkles, Sliders, Check, RefreshCw } from "lucide-react";
import { ThemeSettings, AccessibilitySettings, ColorTheme } from "../../types";
import {
  StorageService,
  DEFAULT_THEME_SETTINGS,
  DEFAULT_ACCESSIBILITY_SETTINGS,
} from "../../services/storage";

interface ThemeAccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTheme?: () => void;
}

export const ThemeAccessibilityModal: React.FC<ThemeAccessibilityModalProps> = ({
  isOpen,
  onClose,
  onApplyTheme,
}) => {
  const [activeTab, setActiveTab] = useState<"theme" | "accessibility">("theme");
  const [theme, setTheme] = useState<ThemeSettings>(StorageService.getThemeSettings());
  const [access, setAccess] = useState<AccessibilitySettings>(
    StorageService.getAccessibilitySettings()
  );
  const [savedBadge, setSavedBadge] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTheme(StorageService.getThemeSettings());
      setAccess(StorageService.getAccessibilitySettings());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectTheme = (palette: ColorTheme, accent: string) => {
    const updated = { ...theme, theme: palette, accentColor: accent };
    setTheme(updated);
    StorageService.saveThemeSettings(updated);
    applyDOMSettings(updated, access);
    triggerSaved();
  };

  const handleToggleEffect = (key: "glowEffects" | "glassmorphism") => {
    const updated = { ...theme, [key]: !theme[key] };
    setTheme(updated);
    StorageService.saveThemeSettings(updated);
    applyDOMSettings(updated, access);
    triggerSaved();
  };

  const handleUpdateAccess = (key: keyof AccessibilitySettings, value: any) => {
    const updated = { ...access, [key]: value };
    setAccess(updated);
    StorageService.saveAccessibilitySettings(updated);
    applyDOMSettings(theme, updated);
    triggerSaved();
  };

  const handleResetDefaults = () => {
    setTheme(DEFAULT_THEME_SETTINGS);
    setAccess(DEFAULT_ACCESSIBILITY_SETTINGS);
    StorageService.saveThemeSettings(DEFAULT_THEME_SETTINGS);
    StorageService.saveAccessibilitySettings(DEFAULT_ACCESSIBILITY_SETTINGS);
    applyDOMSettings(DEFAULT_THEME_SETTINGS, DEFAULT_ACCESSIBILITY_SETTINGS);
    triggerSaved();
  };

  const triggerSaved = () => {
    setSavedBadge(true);
    if (onApplyTheme) onApplyTheme();
    setTimeout(() => setSavedBadge(false), 2000);
  };

  // Helper to sync CSS classes directly onto root element
  const applyDOMSettings = (th: ThemeSettings, ac: AccessibilitySettings) => {
    const root = document.documentElement;
    // Remove previous theme classes
    root.classList.remove(
      "theme-ocean-cyan",
      "theme-deep-sapphire",
      "theme-emerald-lagoon",
      "theme-obsidian-luxury"
    );
    if (th.theme !== "ocean-cyan") {
      root.classList.add(`theme-${th.theme}`);
    }

    // Font scales
    root.classList.remove("font-scale-large", "font-scale-xlarge");
    if (ac.fontSizeScale === "large") root.classList.add("font-scale-large");
    if (ac.fontSizeScale === "xlarge") root.classList.add("font-scale-xlarge");

    // Accessibility classes
    if (ac.highContrast) root.classList.add("high-contrast");
    else root.classList.remove("high-contrast");

    if (ac.reducedMotion) root.classList.add("reduced-motion");
    else root.classList.remove("reduced-motion");

    if (ac.dyslexicFont) root.classList.add("font-dyslexic");
    else root.classList.remove("font-dyslexic");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#071726] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-[#0B2238]/60 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-white">
                Display &amp; Accessibility Settings
              </h2>
              <p className="text-xs text-slate-400">
                Customizable oceanic color themes, sensory comfort, and readability
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedBadge && (
              <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <Check className="w-3 h-3" /> Saved
              </span>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 flex gap-3 border-b border-white/5 bg-[#071726]">
          <button
            onClick={() => setActiveTab("theme")}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === "theme"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Theme &amp; Oceanic Colors</span>
          </button>
          <button
            onClick={() => setActiveTab("accessibility")}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === "accessibility"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Accessibility &amp; Vision</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 flex-1">
          {activeTab === "theme" ? (
            <div className="space-y-6">
              {/* Palette Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-3">
                  Select Oceanic Color Palette
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {themesList.map((t) => {
                    const isSelected = theme.theme === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => handleSelectTheme(t.id, t.accent)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-cyan-950/40 border-cyan-400 shadow-lg shadow-cyan-950/50"
                            : "bg-[#0B2238]/40 border-white/5 hover:border-cyan-500/30 hover:bg-[#0B2238]/70"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white text-xs">{t.name}</span>
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-cyan-400 text-[#030C16] flex items-center justify-center text-[10px]">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {t.description}
                          </p>
                        </div>

                        {/* Swatches preview */}
                        <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-white/5">
                          {t.swatches.map((color, idx) => (
                            <span
                              key={idx}
                              className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Visual Enhancements */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-400">
                  Visual Styling &amp; Atmosphere
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => handleToggleEffect("glowEffects")}
                    className="p-3.5 bg-[#0B2238]/50 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:border-cyan-500/30"
                  >
                    <div>
                      <p className="font-semibold text-white">Oceanic Glow Accents</p>
                      <p className="text-[11px] text-slate-400">Subtle cyan radiance on key buttons</p>
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
                    onClick={() => handleToggleEffect("glassmorphism")}
                    className="p-3.5 bg-[#0B2238]/50 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:border-cyan-500/30"
                  >
                    <div>
                      <p className="font-semibold text-white">Frosted Glass Backdrops</p>
                      <p className="text-[11px] text-slate-400">Smooth backdrop blur effects</p>
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
            </div>
          ) : (
            <div className="space-y-6">
              {/* Text Sizing Scale */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">
                  Typography Reading Scale
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["normal", "large", "xlarge"] as const).map((scale) => (
                    <button
                      key={scale}
                      onClick={() => handleUpdateAccess("fontSizeScale", scale)}
                      className={`py-2.5 rounded-xl border text-xs font-medium capitalize transition-all cursor-pointer ${
                        access.fontSizeScale === scale
                          ? "bg-cyan-500 text-white border-cyan-400 font-bold"
                          : "bg-[#0B2238]/60 text-slate-300 border-white/10 hover:border-cyan-500/30"
                      }`}
                    >
                      {scale === "normal" ? "Standard (100%)" : scale === "large" ? "Large (110%)" : "Maximum (122%)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vision and Motor accessibility toggles */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-400">
                  Visual &amp; Motor Preferences
                </label>

                <div
                  onClick={() => handleUpdateAccess("highContrast", !access.highContrast)}
                  className="p-3.5 bg-[#0B2238]/50 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:border-cyan-500/30"
                >
                  <div>
                    <p className="font-semibold text-white">High Contrast Mode</p>
                    <p className="text-[11px] text-slate-400">Deep obsidian background with vivid cyan borders for sharp clarity</p>
                  </div>
                  <div
                    className={`w-10 h-5 rounded-full transition-colors relative ${
                      access.highContrast ? "bg-cyan-500" : "bg-slate-700"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                        access.highContrast ? "left-5" : "left-0.5"
                      }`}
                    />
                  </div>
                </div>

                <div
                  onClick={() => handleUpdateAccess("reducedMotion", !access.reducedMotion)}
                  className="p-3.5 bg-[#0B2238]/50 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:border-cyan-500/30"
                >
                  <div>
                    <p className="font-semibold text-white">Reduced Motion</p>
                    <p className="text-[11px] text-slate-400">Suppresses animations and smooth scrolling for motion sensitivity</p>
                  </div>
                  <div
                    className={`w-10 h-5 rounded-full transition-colors relative ${
                      access.reducedMotion ? "bg-cyan-500" : "bg-slate-700"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                        access.reducedMotion ? "left-5" : "left-0.5"
                      }`}
                    />
                  </div>
                </div>

                <div
                  onClick={() => handleUpdateAccess("dyslexicFont", !access.dyslexicFont)}
                  className="p-3.5 bg-[#0B2238]/50 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:border-cyan-500/30"
                >
                  <div>
                    <p className="font-semibold text-white">High-Legibility Font Spacing</p>
                    <p className="text-[11px] text-slate-400">Increases letter spacing and line height for effortless scanning</p>
                  </div>
                  <div
                    className={`w-10 h-5 rounded-full transition-colors relative ${
                      access.dyslexicFont ? "bg-cyan-500" : "bg-slate-700"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                        access.dyslexicFont ? "left-5" : "left-0.5"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0B2238]/60 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={handleResetDefaults}
            className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#030C16] font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            Apply &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
