export type UserRole =
  | "Super Admin"
  | "Operations Manager"
  | "Finance Officer"
  | "Tour Guide"
  | "Field Tour Guide"
  | "Operations Dispatch";

export type AdminModuleKey =
  | "dashboard"
  | "packages"
  | "guides"
  | "manifest"
  | "fleet"
  | "hotels"
  | "billing"
  | "settlement"
  | "reviews"
  | "laravel_hub"
  | "rbac"
  | "settings";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  totpEnabled: boolean;
  active: boolean;
  phone?: string;
  dotLicenseNumber?: string;
  languagesSpoken?: string[];
  certifications?: string[];
  assignedTourIds?: string[];
  permissions: {
    canEditPackages: boolean;
    canViewFinancials: boolean;
    canApprovePayments: boolean;
    canDispatchFleet: boolean;
    canCheckInGuests: boolean;
    canManageStaff: boolean;
  };
}

export type TourCategory = 
  | "Island Hopping" 
  | "Adventure & Nature" 
  | "Heritage & Culture" 
  | "Luxury & Wellness" 
  | "City Tour";

export interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
  mealsIncluded: ("Breakfast" | "Lunch" | "Dinner" | "Island Feast")[];
}

export interface TourPackage {
  id: string;
  title: string;
  tagline: string;
  category: TourCategory;
  destination: string; // e.g., "Coron, Palawan", "El Nido, Palawan", "Cebu & Bohol", "Siargao", "Batanes"
  islandGroup?: string;
  durationDays: number;
  durationNights: number;
  pricePerPerson: number;
  downpaymentRequiredPercent: number; // usually 30%
  maxCapacity: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  galleryUrls: string[];
  overview: string;
  inclusions: string[];
  exclusions: string[];
  itinerary: ItineraryDay[];
  featured: boolean;
  status: "Active" | "Seasonal" | "Sold Out";
  highlights: string[];
}

export interface PassengerInfo {
  id: string;
  fullName: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  nationality: string;
  emergencyContact: string;
  medicalOrDietaryAlert?: string;
  idVerified: boolean;
  checkedIn: boolean;
  checkInTimestamp?: string;
}

export type BookingStatus = "Confirmed" | "Pending Payment" | "Completed" | "Cancelled";
export type PaymentStatus = "Unpaid" | "Downpayment Paid (30%)" | "Fully Paid" | "Refunded";

export interface Booking {
  id: string; // e.g. "HT-2026-8819"
  packageId: string;
  packageTitle: string;
  destination: string;
  travelDate: string;
  returnDate: string;
  leadGuestName: string;
  leadGuestEmail: string;
  leadGuestPhone: string;
  guestCount: number;
  passengers: PassengerInfo[];
  pickupLocation: string;
  specialRequests?: string;
  totalAmount: number;
  downpaymentAmount: number;
  balanceAmount: number;
  amountPaid: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  assignedGuideId?: string;
  assignedGuideName?: string;
  assignedVesselId?: string;
  assignedVanId?: string;
  hotelVoucherCode?: string;
}

export type VesselType = "Motorized Banca Catamaran" | "Twin-Engine Speedboat" | "Tourist Coaster Van";

export interface FleetAsset {
  id: string;
  name: string;
  type: VesselType;
  registrationNumber: string;
  capacity: number;
  captainOrDriverName: string;
  captainPhone: string;
  pcgClearanceStatus: "Cleared" | "Pending Inspection" | "Restricted Wave Alert";
  pcgClearanceDate: string;
  status: "Available" | "On Expedition" | "Scheduled" | "Maintenance" | "Under Maintenance";
  currentLocation: string;
  code?: string;
  capacityPax?: number;
  captainOrDriver?: string;
  seaworthinessExpiry?: string;
}

export interface HotelReservation {
  id: string;
  resortName: string;
  islandLocation: string;
  voucherCode: string;
  roomType: string;
  roomCount: number;
  bookingId: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  status: "Confirmed" | "Reserved" | "Cancelled";
  contactPerson: string;
  contactPhone: string;
  destination?: string;
  hotelName?: string;
  leadGuestName?: string;
  confirmationCode?: string;
  breakfastIncluded?: boolean;
}

export type PaymentMethod = "GCash" | "Maya" | "Bank Transfer (BDO/BPI)" | "Cash";

export interface PaymentTransaction {
  id: string;
  bookingId: string;
  guestName: string;
  amount: number;
  type: "Downpayment (30%)" | "Balance Settlement" | "Full Payment" | string;
  method: PaymentMethod;
  referenceNumber: string;
  timestamp: string;
  status: "Verified" | "Pending Verification" | "Flagged";
  verifiedBy?: string;
  bir2307Generated?: boolean;
}

export interface CustomerReview {
  id: string;
  bookingId: string;
  authorName: string;
  tourName: string;
  rating: number; // 1 - 5
  npsScore: number; // 0 - 10
  reviewText: string;
  date: string;
  verifiedGuest: boolean;
  status: "Published" | "Pending Moderation" | "Hidden";
  guestName?: string;
  packageTitle?: string;
  comment?: string;
  guideMentioned?: string;
  createdAt?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userEmail: string;
  userName: string;
  role: string;
  action: string;
  module: string;
  details: string;
  severity: "Info" | "Warning" | "Security Alert" | "High" | "Critical";
  ipAddress?: string;
}

export interface DestinationWeather {
  destination: string;
  islandGroup: string;
  temperatureC: number;
  condition: "Sunny & Calm" | "Partly Cloudy" | "Tropical Squall" | "Moderate Swells" | "Rough Seas";
  seaCondition: "Smooth (0.3m)" | "Slight (0.6m - 1.0m)" | "Moderate (1.2m - 2.0m)" | "Rough (Gale Warning)";
  waveHeightM: number;
  windSpeedKts: number;
  pcgGaleWarning: boolean;
  tideTime: string;
  tideType: "High Tide" | "Low Tide" | "Slack Water";
}

export interface SystemSettings {
  agencyName: string;
  dotLicense: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  currencySymbol: string;
  taxRatePercent: number;
  accentColor: string;
  safetyChecklistMandatory: boolean;
  autoLockMinutes: number;
  companyName?: string;
  dotAccreditationNumber?: string;
  headquartersAddress?: string;
  tinNumber?: string;
  pcgEmergencyHotline?: string;
  pnpMaritimeHotline?: string;
  downpaymentPercentageRequired?: number;
  maxWaveHeightMeters?: number;
}

export type ColorTheme = "ocean-cyan" | "deep-sapphire" | "emerald-lagoon" | "obsidian-luxury";

export interface ThemeSettings {
  theme: ColorTheme;
  accentColor: string;
  glowEffects: boolean;
  glassmorphism: boolean;
}

export interface AccessibilitySettings {
  fontSizeScale: "normal" | "large" | "xlarge";
  highContrast: boolean;
  reducedMotion: boolean;
  dyslexicFont: boolean;
  screenReaderOptimized: boolean;
}

export interface CookieSettings {
  strictlyNecessary: boolean;
  analyticsPerformance: boolean;
  preferencesFunctional: boolean;
  marketingTailored: boolean;
  hasConsented: boolean;
  lastUpdated: string;
}

export interface ConciergeAutoReply {
  id: string;
  keywords: string[];
  category: "booking" | "weather" | "packages" | "permits" | "gears" | "general";
  title: string;
  quickReply: string;
  detailedReply: string;
  suggestedAction?: {
    label: string;
    actionType: "book" | "weather" | "track" | "packages";
    targetId?: string;
  };
}
