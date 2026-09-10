import React, { useState, useEffect } from "react";
import { Cookie, Shield, Check, X, Settings2, Lock } from "lucide-react";
import { CookieSettings } from "../../types";
import { StorageService } from "../../services/storage";

interface CookieConsentProps {
  forceOpenDrawer?: boolean;
  onCloseDrawer?: () => void;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({
  forceOpenDrawer = false,
  onCloseDrawer,
}) => {
  const [cookieSettings, setCookieSettings] = useState<CookieSettings>(
    StorageService.getCookieSettings()
  );
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    setCookieSettings(StorageService.getCookieSettings());
  }, []);

  useEffect(() => {
    if (forceOpenDrawer) {
      setDrawerOpen(true);
    }
  }, [forceOpenDrawer]);

  const handleAcceptAll = () => {
    const updated: CookieSettings = {
      strictlyNecessary: true,
      analyticsPerformance: true,
      preferencesFunctional: true,
      marketingTailored: true,
      hasConsented: true,
      lastUpdated: new Date().toISOString(),
    };
    setCookieSettings(updated);
    StorageService.saveCookieSettings(updated);
    setDrawerOpen(false);
    onCloseDrawer?.();
  };

  const handleSavePreferences = () => {
    const updated: CookieSettings = {
      ...cookieSettings,
      hasConsented: true,
      lastUpdated: new Date().toISOString(),
    };
    setCookieSettings(updated);
    StorageService.saveCookieSettings(updated);
    setDrawerOpen(false);
    onCloseDrawer?.();
  };

  return (
    <>
      {/* Floating Bottom Banner if no consent */}
      {!cookieSettings.hasConsented && !drawerOpen && (
        <div className="fixed bottom-4 left-4 right-4 md:left-8 md:right-auto md:max-w-lg z-50 bg-[#071726]/95 border border-cyan-500/30 rounded-3xl p-5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 shrink-0">
              <Cookie className="w-6 h-6" />
            </div>
            <div className="space-y-2 text-sm flex-1">
              <h4 className="font-serif text-base text-white font-bold">
                ALYN SHIR Privacy &amp; Local Storage
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                In compliance with RA 10173 (Philippine Data Privacy Act), we store your session preferences, theme choices, and charter manifests securely on your local device.
              </p>
              <div className="flex flex-wrap gap-2 pt-1.5">
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#030C16] text-xs font-bold transition-all cursor-pointer shadow-md shadow-cyan-500/20"
                >
                  Accept All
                </button>
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 font-medium transition-colors cursor-pointer"
                >
                  Cookie Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Drawer / Modal */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-lg bg-[#071726] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Settings2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-white font-bold">
                    Locally Saved Cookie &amp; Privacy Settings
                  </h3>
                  <p className="text-[11px] text-slate-400">Stored safely in your browser localStorage</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  onCloseDrawer?.();
                }}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              We respect your right to privacy under Republic Act 10173. Configure which functional data categories you permit for your local ALYN SHIR experience.
            </p>

            <div className="space-y-3 text-xs">
              {/* Essential */}
              <div className="p-3.5 rounded-2xl bg-[#030C16] border border-cyan-500/15 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-white">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Strictly Necessary &amp; Security Tokens</span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Essential for booking manifest state, role permissions, and port clearance records.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-mono border border-cyan-500/20">
                  Always Active
                </span>
              </div>

              {/* Functional Preferences */}
              <div className="p-3.5 rounded-2xl bg-[#030C16] border border-cyan-500/15 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">Theme &amp; Accessibility Preferences</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Remembers your chosen oceanic color theme, text sizing, and high contrast settings.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={cookieSettings.preferencesFunctional}
                  onChange={(e) =>
                    setCookieSettings({
                      ...cookieSettings,
                      preferencesFunctional: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                />
              </div>

              {/* Analytics */}
              <div className="p-3.5 rounded-2xl bg-[#030C16] border border-cyan-500/15 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">Telemetry &amp; Marine Operations Metrics</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Anonymized local caching of station weather telemetry and charter schedules.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={cookieSettings.analyticsPerformance}
                  onChange={(e) =>
                    setCookieSettings({
                      ...cookieSettings,
                      analyticsPerformance: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-cyan-500/20">
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white font-medium transition-colors cursor-pointer"
              >
                Accept All
              </button>
              <button
                onClick={handleSavePreferences}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-xs text-[#030C16] font-bold shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
