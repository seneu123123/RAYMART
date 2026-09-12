import {
  UserAccount,
  TourPackage,
  Booking,
  FleetAsset,
  HotelReservation,
  PaymentTransaction,
  CustomerReview,
  AuditLogEntry,
  DestinationWeather,
  SystemSettings,
  ThemeSettings,
  AccessibilitySettings,
  CookieSettings,
  ConciergeAutoReply,
  ClientNotification,
} from "../types";

import {
  INITIAL_STAFF_ACCOUNTS,
  INITIAL_PACKAGES,
  INITIAL_BOOKINGS,
  INITIAL_FLEET,
  INITIAL_HOTEL_RESERVATIONS,
  INITIAL_PAYMENTS,
  INITIAL_REVIEWS,
  INITIAL_AUDIT_LOGS,
  INITIAL_WEATHER,
  INITIAL_SYSTEM_SETTINGS,
  INITIAL_CLIENT_NOTIFICATIONS,
} from "../data/seedData";

const STORAGE_KEYS = {
  STAFF: "alynshir_staff_accounts",
  CURRENT_USER_ID: "alynshir_current_user_id",
  PACKAGES: "alynshir_packages",
  BOOKINGS: "alynshir_bookings",
  FLEET: "alynshir_fleet",
  HOTEL_RESERVATIONS: "alynshir_hotel_reservations",
  PAYMENTS: "alynshir_payments",
  REVIEWS: "alynshir_reviews",
  AUDIT_LOGS: "alynshir_audit_logs",
  WEATHER: "alynshir_weather",
  SETTINGS: "alynshir_system_settings",
  THEME: "alynshir_theme_settings",
  ACCESSIBILITY: "alynshir_accessibility_settings",
  COOKIES: "alynshir_cookie_settings",
  NOTIFICATIONS: "alynshir_client_notifications",
};

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  theme: "ocean-cyan",
  accentColor: "#06B6D4",
  glowEffects: true,
  glassmorphism: true,
};

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  fontSizeScale: "normal",
  highContrast: false,
  reducedMotion: false,
  dyslexicFont: false,
  screenReaderOptimized: false,
};

export const DEFAULT_COOKIE_SETTINGS: CookieSettings = {
  strictlyNecessary: true,
  analyticsPerformance: true,
  preferencesFunctional: true,
  marketingTailored: false,
  hasConsented: false,
  lastUpdated: new Date().toISOString(),
};

// Auto-Reply Knowledge Base for Offline Localhost Concierge
export const CONCIERGE_AUTO_REPLIES: ConciergeAutoReply[] = [
  {
    id: "ar-1",
    keywords: ["book", "reserve", "how to book", "process", "downpayment", "deposit", "30%"],
    category: "booking",
    title: "Booking & 30% Downpayment Policy",
    quickReply: "How do I secure an expedition charter?",
    detailedReply:
      "At ALYN SHIR, charter reservations require a 30% statutory downpayment to lock your Coast Guard-accredited vessel and DOT master guide. The remaining 70% balance is settled via GCash, Maya, or Bank Transfer prior to port embarkation.",
    suggestedAction: {
      label: "Browse Island Packages",
      actionType: "packages",
    },
  },
  {
    id: "ar-2",
    keywords: ["coron", "kayangan", "barracuda", "wreck", "twin lagoon", "palawan"],
    category: "packages",
    title: "Coron Ultimate Marine Sanctuary Guide",
    quickReply: "Tell me about the Coron Island Expedition",
    detailedReply:
      "Our Coron Expedition features Kayangan Lake, Barracuda Lake thermoclines, Japanese WWII skeleton shipwrecks, and private banca mooring at Twin Lagoon. Includes freshly grilled seafood buffet and Ancestral Domain Tagbanwa conservation permits.",
    suggestedAction: {
      label: "Book Coron Expedition",
      actionType: "book",
      targetId: "pkg-coron-ult",
    },
  },
  {
    id: "ar-3",
    keywords: ["el nido", "bacuit", "big lagoon", "secret lagoon", "shimisu"],
    category: "packages",
    title: "El Nido Bacuit Archipelago Expedition",
    quickReply: "What is included in the El Nido Bacuit tour?",
    detailedReply:
      "The Bacuit Archipelago charter covers Big Lagoon, Secret Lagoon, 7 Commandos Beach, and Pangulasian reefs. Kayak rentals, snorkeling mask sterilizations, and protected area conservation passes are fully included.",
    suggestedAction: {
      label: "View El Nido Tour",
      actionType: "book",
      targetId: "pkg-elnido-bac",
    },
  },
  {
    id: "ar-4",
    keywords: ["batanes", "weather", "rolling hills", "marlboro", "ivatan", "sabtang"],
    category: "packages",
    title: "Batanes Ivatan Heritage & Cliffs",
    quickReply: "How are the conditions in Batanes?",
    detailedReply:
      "Batanes expeditions feature Marlboro Hills, Basco Lighthouse, and Sabtang stone houses. Because Pacific swells can shift, our operations team coordinates daily with PAGASA Basco Station to ensure calm crossings.",
    suggestedAction: {
      label: "Check Marine Radar",
      actionType: "weather",
    },
  },
  {
    id: "ar-5",
    keywords: ["weather", "radar", "waves", "swell", "storm", "gale", "pagasa", "pcg", "safety"],
    category: "weather",
    title: "Real-time Maritime & Sea-State Telemetry",
    quickReply: "Are sea conditions safe today?",
    detailedReply:
      "ALYN SHIR operates with strict compliance to PCG Memorandum Circular 03-14. When PAGASA issues Gale Warnings or wave heights exceed 2.0 meters, coastal voyages are proactively rescheduled or routed through sheltered coves.",
    suggestedAction: {
      label: "Open Live Weather Radar",
      actionType: "weather",
    },
  },
  {
    id: "ar-6",
    keywords: ["track", "status", "booking code", "qr pass", "manifest", "check-in"],
    category: "booking",
    title: "Charter & E-Ticket QR Pass Tracker",
    quickReply: "How do I check my booking or get my QR pass?",
    detailedReply:
      "Use our Charter Tracker in the top navigation bar! Enter your Charter ID (e.g. HT-2026-8819) to view real-time status: Downpayment Verified, Guide Assigned, PCG Clearance, and Vessel Dispatched. You can also print your QR boarding pass directly.",
    suggestedAction: {
      label: "Open Booking Tracker",
      actionType: "track",
    },
  },
  {
    id: "ar-7",
    keywords: ["pack", "gear", "shoes", "mask", "sunscreen", "what to bring"],
    category: "gears",
    title: "Expedition Gear & Packing Checklist",
    quickReply: "What gear should I bring on board?",
    detailedReply:
      "Recommended essentials: Reef-safe biodegradable sunscreen (prohibited oxybenzone laws protect our coral), coral booties / aqua shoes, dry bag (10L - 20L), underwater camera, and comfortable rash guards. Life vests and snorkel gear are pre-fitted for you.",
  },
  {
    id: "ar-8",
    keywords: ["payment", "gcash", "maya", "bdo", "bpi", "credit card", "tax", "bir", "receipt"],
    category: "booking",
    title: "Payment Methods & Official BIR Receipts",
    quickReply: "What payment gateways are supported?",
    detailedReply:
      "We accept instant GCash QR, Maya Business, BDO/BPI online wire transfers, and cash at our port terminals. All corporate transactions receive formal Philippine BIR Form 2307 Creditable Tax Withholding certificates upon request.",
  },
  {
    id: "ar-9",
    keywords: ["private", "charter", "yacht", "catamaran", "custom", "group", "corporate"],
    category: "packages",
    title: "Private Vessel & Luxury Custom Charters",
    quickReply: "Can I book a private luxury charter?",
    detailedReply:
      "Yes! ALYN SHIR maintains executive twin-engine speedboats, motorized outrigger catamarans, and luxury sea cruisers. Private charters include custom departure times, chef-prepared beach barbecues, and dedicated marine biology guides.",
    suggestedAction: {
      label: "Explore Available Fleet",
      actionType: "packages",
    },
  },
];

// Dispatch storage change event for cross-component reactivity
function emitChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("ht_storage_updated"));
  }
}

function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    emitChange();
  } catch (err) {
    console.error("Storage write failure:", err);
  }
}

export const StorageService = {
  // Staff Accounts
  getStaffAccounts(): UserAccount[] {
    const list = getItem(STORAGE_KEYS.STAFF, INITIAL_STAFF_ACCOUNTS);
    let modified = false;
    const sanitized = list.map((s) => {
      const updated = { ...s };
      if (updated.email && updated.email.endsWith("@mail.com")) {
        updated.email = updated.email.replace("@mail.com", "@gmail.com");
        modified = true;
      }
      if (!updated.totpEnabled) {
        updated.totpEnabled = true;
        modified = true;
      }
      return updated;
    });
    if (modified && typeof window !== "undefined") {
      setItem(STORAGE_KEYS.STAFF, sanitized);
    }
    return sanitized;
  },
  saveStaffAccounts(accounts: UserAccount[]): void {
    setItem(STORAGE_KEYS.STAFF, accounts);
  },

  // Active user session
  getCurrentUserId(): string {
    return getItem(STORAGE_KEYS.CURRENT_USER_ID, "usr_superadmin");
  },
  getCurrentUser(): UserAccount {
    const staff = this.getStaffAccounts();
    const currentId = this.getCurrentUserId();
    return staff.find((s) => s.id === currentId) || staff[0];
  },
  setCurrentUser(userId: string): void {
    setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
  },

  // Tour Packages
  getPackages(): TourPackage[] {
    return getItem(STORAGE_KEYS.PACKAGES, INITIAL_PACKAGES);
  },
  getPackageById(id: string): TourPackage | undefined {
    return this.getPackages().find((p) => p.id === id);
  },
  savePackages(packages: TourPackage[]): void {
    setItem(STORAGE_KEYS.PACKAGES, packages);
  },
  addPackage(pkg: TourPackage): void {
    const list = this.getPackages();
    this.savePackages([pkg, ...list]);
  },
  updatePackage(pkg: TourPackage): void {
    const list = this.getPackages();
    const idx = list.findIndex((p) => p.id === pkg.id);
    if (idx !== -1) {
      list[idx] = pkg;
      this.savePackages(list);
    }
  },
  deletePackage(id: string): void {
    const list = this.getPackages().filter((p) => p.id !== id);
    this.savePackages(list);
  },

  // Bookings
  getBookings(): Booking[] {
    return getItem(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
  },
  getBookingById(id: string): Booking | undefined {
    return this.getBookings().find((b) => b.id.toUpperCase() === id.trim().toUpperCase());
  },
  saveBookings(bookings: Booking[]): void {
    setItem(STORAGE_KEYS.BOOKINGS, bookings);
  },
  addBooking(booking: Booking): void {
    const list = this.getBookings();
    this.saveBookings([booking, ...list]);
  },
  createBooking(booking: Booking): void {
    this.addBooking(booking);
  },
  updateBooking(booking: Booking): void {
    const list = this.getBookings();
    const idx = list.findIndex((b) => b.id === booking.id);
    if (idx !== -1) {
      list[idx] = booking;
      this.saveBookings(list);
    }
  },
  resetBookingManifest(bookingId: string): Booking | null {
    const list = this.getBookings();
    const idx = list.findIndex((b) => b.id.toUpperCase() === bookingId.trim().toUpperCase());
    if (idx !== -1) {
      const b = list[idx];
      const resetPassengers = b.passengers.map((p) => ({
        ...p,
        checkedIn: false,
        checkedOut: false,
        checkInTimestamp: undefined,
        checkOutTimestamp: undefined,
        idVerified: false,
      }));
      const updated: Booking = {
        ...b,
        passengers: resetPassengers,
        embarkationStatus: "Awaiting Clearance",
        manifestAuditStatus: "Pending Manifest Review",
        manifestNotes: undefined,
      };
      list[idx] = updated;
      this.saveBookings(list);
      return updated;
    }
    return null;
  },
  checkOutPassenger(bookingId: string, passengerId: string): Booking | null {
    const list = this.getBookings();
    const idx = list.findIndex((b) => b.id.toUpperCase() === bookingId.trim().toUpperCase());
    if (idx !== -1) {
      const b = list[idx];
      const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const updatedPax = b.passengers.map((p) =>
        p.id === passengerId
          ? {
              ...p,
              checkedIn: false,
              checkedOut: true,
              checkOutTimestamp: nowTime,
            }
          : p
      );

      const allCheckedOut = updatedPax.every((p) => p.checkedOut);
      const updated: Booking = {
        ...b,
        passengers: updatedPax,
        embarkationStatus: allCheckedOut ? "Checked-Out & Completed" : b.embarkationStatus,
        status: allCheckedOut ? "Completed" : b.status,
      };
      list[idx] = updated;
      this.saveBookings(list);
      return updated;
    }
    return null;
  },
  checkOutAllPassengersAndResetManifest(bookingId: string): Booking | null {
    const list = this.getBookings();
    const idx = list.findIndex((b) => b.id.toUpperCase() === bookingId.trim().toUpperCase());
    if (idx !== -1) {
      const b = list[idx];
      const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const checkedOutPax = b.passengers.map((p) => ({
        ...p,
        checkedIn: false,
        checkedOut: true,
        checkOutTimestamp: nowTime,
      }));
      const updated: Booking = {
        ...b,
        passengers: checkedOutPax,
        embarkationStatus: "Checked-Out & Completed",
        status: "Completed",
      };
      list[idx] = updated;
      this.saveBookings(list);
      return updated;
    }
    return null;
  },

  // Fleet
  getFleet(): FleetAsset[] {
    return getItem(STORAGE_KEYS.FLEET, INITIAL_FLEET);
  },
  saveFleet(fleet: FleetAsset[]): void {
    setItem(STORAGE_KEYS.FLEET, fleet);
  },
  updateFleetAsset(asset: FleetAsset): void {
    const list = this.getFleet();
    const idx = list.findIndex((f) => f.id === asset.id);
    if (idx !== -1) {
      list[idx] = asset;
      this.saveFleet(list);
    }
  },

  // Hotel Reservations
  getHotelReservations(): HotelReservation[] {
    return getItem(STORAGE_KEYS.HOTEL_RESERVATIONS, INITIAL_HOTEL_RESERVATIONS);
  },
  saveHotelReservations(reservations: HotelReservation[]): void {
    setItem(STORAGE_KEYS.HOTEL_RESERVATIONS, reservations);
  },

  // Payments
  getPayments(): PaymentTransaction[] {
    return getItem(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
  },
  savePayments(payments: PaymentTransaction[]): void {
    setItem(STORAGE_KEYS.PAYMENTS, payments);
  },
  addPayment(payment: PaymentTransaction): void {
    const list = this.getPayments();
    this.savePayments([payment, ...list]);
  },
  updatePayment(payment: PaymentTransaction): void {
    const list = this.getPayments();
    const idx = list.findIndex((p) => p.id === payment.id);
    if (idx !== -1) {
      list[idx] = payment;
      this.savePayments(list);
    }
  },

  // Reviews
  getReviews(): CustomerReview[] {
    return getItem(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  },
  saveReviews(reviews: CustomerReview[]): void {
    setItem(STORAGE_KEYS.REVIEWS, reviews);
  },
  updateReviewStatus(id: string, status: CustomerReview["status"]): void {
    const list = this.getReviews().map((r) => (r.id === id ? { ...r, status } : r));
    this.saveReviews(list);
  },

  // Audit Logs
  getAuditLogs(): AuditLogEntry[] {
    return getItem(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  },
  addAuditLog(entry: {
    action: string;
    module?: string;
    details: string;
    severity: "Info" | "Warning" | "Security Alert" | "High" | "Critical";
    userEmail?: string;
    userName?: string;
    role?: string;
    ipAddress?: string;
  }): void {
    const currentUser = this.getCurrentUser();
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const newLog: AuditLogEntry = {
      id: `aud-${Date.now().toString(36)}`,
      timestamp,
      userEmail: entry.userEmail || currentUser.email,
      userName: entry.userName || currentUser.name,
      role: entry.role || currentUser.role,
      action: entry.action,
      module: entry.module || "Security",
      details: entry.details,
      severity: entry.severity,
      ipAddress: entry.ipAddress || "192.168.1.104",
    };

    const currentLogs = this.getAuditLogs();
    setItem(STORAGE_KEYS.AUDIT_LOGS, [newLog, ...currentLogs].slice(0, 100));
  },

  // Dynamic Weather Generator (Comprehensive & changes every view/refresh)
  getDynamicMarineWeather(): DestinationWeather[] {
    const stations = [
      { destination: "Coron, Palawan", islandGroup: "Calamianes / Palawan" },
      { destination: "El Nido, Palawan", islandGroup: "Bacuit Bay / Palawan" },
      { destination: "Siargao Island", islandGroup: "Surigao / Mindanao" },
      { destination: "Cebu & Bohol", islandGroup: "Mactan Strait / Visayas" },
      { destination: "Batanes Archipelago", islandGroup: "Luzon Strait / Batanes" },
      { destination: "Boracay & Romblon", islandGroup: "Sibuyan Sea / Visayas" },
    ];

    // Seed variations slightly based on current minutes to simulate realistic marine shifts
    const now = new Date();
    const timeFactor = (now.getMinutes() * 7 + now.getSeconds()) % 100;

    return stations.map((st, idx) => {
      const isNorthern = st.destination.includes("Batanes");
      const tempVariation = (Math.sin(timeFactor + idx) * 1.5).toFixed(1);
      const tempC = Math.round(29 + Number(tempVariation));
      
      const waveBase = isNorthern ? 1.4 : 0.6;
      const waveFluctuation = (Math.abs(Math.sin(timeFactor * 0.2 + idx * 1.5)) * 0.7).toFixed(1);
      const waveM = Number((waveBase + Number(waveFluctuation)).toFixed(1));

      const windKts = Math.round(10 + (idx * 2.5) + (timeFactor % 8));
      const hasGale = waveM >= 2.2 || (isNorthern && (timeFactor % 10 < 3));

      let condition: DestinationWeather["condition"] = "Sunny & Calm";
      let seaCondition: DestinationWeather["seaCondition"] = "Smooth (0.3m)";

      if (hasGale) {
        condition = "Rough Seas";
        seaCondition = "Rough (Gale Warning)";
      } else if (waveM > 1.2) {
        condition = "Moderate Swells";
        seaCondition = "Moderate (1.2m - 2.0m)";
      } else if (waveM > 0.7) {
        condition = "Partly Cloudy";
        seaCondition = "Slight (0.6m - 1.0m)";
      }

      const tideHours = (now.getHours() + idx * 2) % 24;
      const tideMinutes = (now.getMinutes() + idx * 11) % 60;
      const pad = (n: number) => n.toString().padStart(2, "0");
      const tideType: DestinationWeather["tideType"] = idx % 2 === 0 ? "High Tide" : "Low Tide";

      return {
        destination: st.destination,
        islandGroup: st.islandGroup,
        temperatureC: tempC,
        condition,
        seaCondition,
        waveHeightM: waveM,
        windSpeedKts: windKts,
        pcgGaleWarning: hasGale,
        tideTime: `${pad(tideHours)}:${pad(tideMinutes)} PHT`,
        tideType,
      };
    });
  },

  getWeather(): DestinationWeather[] {
    return this.getDynamicMarineWeather();
  },

  // System Settings with ALYN SHIR defaults
  getSettings(): SystemSettings {
    const current = getItem(STORAGE_KEYS.SETTINGS, INITIAL_SYSTEM_SETTINGS);
    return {
      ...current,
      agencyName: "ALYN SHIR",
      companyName: "ALYN SHIR Marine Expeditions & Luxury Charters Inc.",
      contactEmail: "charters@alynshir.ph",
      headquartersAddress: "Marine Operations Tower, Novaliches Commercial Complex, Quezon City, Metro Manila",
    };
  },
  saveSettings(settings: SystemSettings): void {
    setItem(STORAGE_KEYS.SETTINGS, settings);
  },

  // Theme Settings
  getThemeSettings(): ThemeSettings {
    return getItem(STORAGE_KEYS.THEME, DEFAULT_THEME_SETTINGS);
  },
  saveThemeSettings(settings: ThemeSettings): void {
    setItem(STORAGE_KEYS.THEME, settings);
  },

  // Accessibility Settings
  getAccessibilitySettings(): AccessibilitySettings {
    return getItem(STORAGE_KEYS.ACCESSIBILITY, DEFAULT_ACCESSIBILITY_SETTINGS);
  },
  saveAccessibilitySettings(settings: AccessibilitySettings): void {
    setItem(STORAGE_KEYS.ACCESSIBILITY, settings);
  },

  // Cookie Settings
  getCookieSettings(): CookieSettings {
    return getItem(STORAGE_KEYS.COOKIES, DEFAULT_COOKIE_SETTINGS);
  },
  saveCookieSettings(settings: CookieSettings): void {
    setItem(STORAGE_KEYS.COOKIES, settings);
  },

  // Concierge Auto-Reply Helper
  findAutoReply(query: string): ConciergeAutoReply | undefined {
    const clean = query.toLowerCase().trim();
    if (!clean) return undefined;

    // Check direct keywords
    const match = CONCIERGE_AUTO_REPLIES.find((ar) =>
      ar.keywords.some((kw) => clean.includes(kw))
    );
    return match;
  },

  // Client Notifications
  getClientNotifications(): ClientNotification[] {
    return getItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_CLIENT_NOTIFICATIONS);
  },
  saveClientNotifications(notifications: ClientNotification[]): void {
    setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
  },
  addClientNotification(
    notif: Omit<ClientNotification, "id" | "timestamp" | "read">
  ): ClientNotification {
    const list = this.getClientNotifications();
    const newNotif: ClientNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: "Just now",
      read: false,
    };
    const updated = [newNotif, ...list];
    this.saveClientNotifications(updated);
    return newNotif;
  },
  markNotificationAsRead(id: string): void {
    const list = this.getClientNotifications();
    const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
    this.saveClientNotifications(updated);
  },
  markAllNotificationsAsRead(): void {
    const list = this.getClientNotifications();
    const updated = list.map((n) => ({ ...n, read: true }));
    this.saveClientNotifications(updated);
  },
  getUnreadNotificationCount(): number {
    return this.getClientNotifications().filter((n) => !n.read).length;
  },

  // Cross-component subscription listener
  subscribe(callback: () => void): () => void {
    if (typeof window !== "undefined") {
      window.addEventListener("ht_storage_updated", callback);
      return () => window.removeEventListener("ht_storage_updated", callback);
    }
    return () => {};
  },

  // Reset to Seed
  resetToSeedData(): void {
    localStorage.removeItem(STORAGE_KEYS.STAFF);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    localStorage.removeItem(STORAGE_KEYS.PACKAGES);
    localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
    localStorage.removeItem(STORAGE_KEYS.FLEET);
    localStorage.removeItem(STORAGE_KEYS.HOTEL_RESERVATIONS);
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.REVIEWS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.WEATHER);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.THEME);
    localStorage.removeItem(STORAGE_KEYS.ACCESSIBILITY);
    localStorage.removeItem(STORAGE_KEYS.COOKIES);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    emitChange();
  },
};
