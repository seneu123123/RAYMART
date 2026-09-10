import React, { useState, useEffect } from "react";
import { TourPackage, Booking, UserAccount, AdminModuleKey } from "./types";
import { StorageService } from "./services/storage";

// Common Components
import { Header } from "./components/common/Header";
import { Footer } from "./components/common/Footer";
import { QRPassModal } from "./components/common/QRPassModal";
import { ThemeAccessibilityModal } from "./components/common/ThemeAccessibilityModal";

// Client Portal Components
import { HeroSection } from "./components/client/HeroSection";
import { TourCatalog } from "./components/client/TourCatalog";
import { BookingModal } from "./components/client/BookingModal";
import { WeatherRadarModal } from "./components/client/WeatherRadarModal";
import { BookingTrackerModal } from "./components/client/BookingTrackerModal";
import { AIConciergeModal } from "./components/client/AIConciergeModal";
import { LegalComplianceModal } from "./components/client/LegalComplianceModal";
import { CookieConsent } from "./components/client/CookieConsent";

// Admin Portal Components
import { AdminLayout } from "./components/admin/AdminLayout";
import { DashboardModule } from "./components/admin/modules/DashboardModule";
import { PackagesModule } from "./components/admin/modules/PackagesModule";
import { GuidesModule } from "./components/admin/modules/GuidesModule";
import { ManifestModule } from "./components/admin/modules/ManifestModule";
import { FleetModule } from "./components/admin/modules/FleetModule";
import { HotelsModule } from "./components/admin/modules/HotelsModule";
import { BillingModule } from "./components/admin/modules/BillingModule";
import { SettlementModule } from "./components/admin/modules/SettlementModule";
import { ReviewsModule } from "./components/admin/modules/ReviewsModule";
import { SyncHubModule } from "./components/admin/modules/SyncHubModule";
import { RbacModule } from "./components/admin/modules/RbacModule";
import { SettingsModule } from "./components/admin/modules/SettingsModule";

export default function App() {
  // Navigation & Portal State
  const [currentPortal, setCurrentPortal] = useState<"client" | "admin">("client");
  const [adminModule, setAdminModule] = useState<AdminModuleKey>("dashboard");

  // Domain State
  const [packages, setPackages] = useState<TourPackage[]>(StorageService.getPackages());
  const [currentUser, setCurrentUser] = useState<UserAccount>(StorageService.getCurrentUser());
  const [filterDestination, setFilterDestination] = useState<string>("");

  // Modals
  const [bookingModalPkg, setBookingModalPkg] = useState<TourPackage | null>(null);
  const [qrPassBooking, setQrPassBooking] = useState<Booking | null>(null);
  const [weatherOpen, setWeatherOpen] = useState(false);
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [conciergeOpen, setConciergeOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [cookiesDrawerOpen, setCookiesDrawerOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  // Initialize Theme & Accessibility classes on root
  useEffect(() => {
    const applySavedDisplay = () => {
      const th = StorageService.getThemeSettings();
      const ac = StorageService.getAccessibilitySettings();
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

    applySavedDisplay();

    const handleStorageUpdate = () => {
      setPackages(StorageService.getPackages());
      setCurrentUser(StorageService.getCurrentUser());
      applySavedDisplay();
    };
    window.addEventListener("ht_storage_updated", handleStorageUpdate);
    return () => window.removeEventListener("ht_storage_updated", handleStorageUpdate);
  }, []);

  const handleSwitchUser = (userId: string) => {
    StorageService.setCurrentUser(userId);
    setCurrentUser(StorageService.getCurrentUser());
  };

  const handleBookingCreated = (newBooking: Booking) => {
    setBookingModalPkg(null);
    setQrPassBooking(newBooking);
  };

  return (
    <div className="min-h-screen bg-[#030C16] text-white flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {currentPortal === "client" ? (
        <>
          {/* Client Header */}
          <Header
            currentPortal={currentPortal}
            onSwitchPortal={setCurrentPortal}
            onOpenWeather={() => setWeatherOpen(true)}
            onOpenTracker={() => setTrackerOpen(true)}
            onOpenConcierge={() => setConciergeOpen(true)}
            onOpenTheme={() => setThemeOpen(true)}
            currentUser={currentUser}
          />

          {/* Client Main Body */}
          <main className="flex-1">
            <HeroSection
              onSearch={(dest) => setFilterDestination(dest)}
              onOpenWeather={() => setWeatherOpen(true)}
              onOpenConcierge={() => setConciergeOpen(true)}
            />

            <TourCatalog
              packages={packages}
              filterDestination={filterDestination}
              onBookPackage={(pkg) => setBookingModalPkg(pkg)}
            />
          </main>

          {/* Client Commercial Oceanic Footer with Comprehensive Compliance */}
          <Footer
            onOpenLegal={() => setLegalOpen(true)}
            onOpenCookies={() => setCookiesDrawerOpen(true)}
            onOpenTheme={() => setThemeOpen(true)}
            onSwitchPortal={setCurrentPortal}
          />
        </>
      ) : (
        /* Admin Operations Tower Portal */
        <AdminLayout
          currentUser={currentUser}
          activeModule={adminModule}
          onSelectModule={setAdminModule}
          onSwitchPortal={setCurrentPortal}
          onSwitchUser={handleSwitchUser}
        >
          {adminModule === "dashboard" && (
            <DashboardModule
              currentUser={currentUser}
              onViewQR={(b) => setQrPassBooking(b)}
              onSelectModule={setAdminModule}
            />
          )}

          {adminModule === "packages" && (
            <PackagesModule onDataChanged={() => setPackages(StorageService.getPackages())} />
          )}

          {adminModule === "guides" && <GuidesModule />}

          {adminModule === "manifest" && (
            <ManifestModule onViewQR={(b) => setQrPassBooking(b)} />
          )}

          {adminModule === "fleet" && <FleetModule />}

          {adminModule === "hotels" && <HotelsModule />}

          {adminModule === "billing" && <BillingModule />}

          {adminModule === "settlement" && <SettlementModule />}

          {adminModule === "reviews" && <ReviewsModule />}

          {adminModule === "laravel_hub" && <SyncHubModule />}

          {adminModule === "rbac" && <RbacModule />}

          {adminModule === "settings" && (
            <SettingsModule
              onDataReset={() => {
                setPackages(StorageService.getPackages());
                setCurrentUser(StorageService.getCurrentUser());
              }}
            />
          )}
        </AdminLayout>
      )}

      {/* Global Modals */}
      <BookingModal
        packageItem={bookingModalPkg}
        onClose={() => setBookingModalPkg(null)}
        onBookingSuccess={handleBookingCreated}
      />

      <QRPassModal
        booking={qrPassBooking}
        onClose={() => setQrPassBooking(null)}
      />

      <WeatherRadarModal
        isOpen={weatherOpen}
        onClose={() => setWeatherOpen(false)}
      />

      <BookingTrackerModal
        isOpen={trackerOpen}
        onClose={() => setTrackerOpen(false)}
        onViewQR={(b) => {
          setTrackerOpen(false);
          setQrPassBooking(b);
        }}
      />

      <AIConciergeModal
        isOpen={conciergeOpen}
        onClose={() => setConciergeOpen(false)}
        onOpenWeather={() => {
          setConciergeOpen(false);
          setWeatherOpen(true);
        }}
        onOpenTracker={() => {
          setConciergeOpen(false);
          setTrackerOpen(true);
        }}
      />

      <LegalComplianceModal
        isOpen={legalOpen}
        onClose={() => setLegalOpen(false)}
      />

      <ThemeAccessibilityModal
        isOpen={themeOpen}
        onClose={() => setThemeOpen(false)}
      />

      <CookieConsent
        forceOpenDrawer={cookiesDrawerOpen}
        onCloseDrawer={() => setCookiesDrawerOpen(false)}
      />
    </div>
  );
}
