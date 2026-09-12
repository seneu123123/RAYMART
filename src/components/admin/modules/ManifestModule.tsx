import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ClipboardList,
  CheckCircle2,
  QrCode,
  Printer,
  AlertTriangle,
  ShieldCheck,
  Search,
  Users,
  UserCheck,
  AlertCircle,
  ArrowRight,
  Check,
  X,
  Filter,
  Sparkles,
  Ship,
  Clock,
  Phone,
  FileCheck,
  Send,
  LifeBuoy,
  RotateCcw,
  LogOut,
} from "lucide-react";
import { Booking, PassengerInfo, ManifestAuditStatus, EmbarkationStatus, BookingStatus } from "../../../types";
import { StorageService } from "../../../services/storage";

interface ManifestModuleProps {
  onViewQR: (booking: Booking) => void;
  preselectedBookingId?: string;
}

export const ManifestModule: React.FC<ManifestModuleProps> = ({
  onViewQR,
  preselectedBookingId,
}) => {
  const [bookings, setBookings] = useState<Booking[]>(() => StorageService.getBookings());
  const [selectedBookingId, setSelectedBookingId] = useState<string>(
    preselectedBookingId || bookings[0]?.id || ""
  );
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "pending_review" | "cleared" | "needs_revision" | "departed"
  >("all");
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Revision modal state
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [revisionReason, setRevisionReason] = useState("");

  const refreshBookings = () => {
    const updated = StorageService.getBookings();
    setBookings(updated);
  };

  // Sync with live storage updates and booking creation
  useEffect(() => {
    const handleUpdate = () => {
      refreshBookings();
    };
    window.addEventListener("booking_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("booking_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Update selected booking if preselectedBookingId changes
  useEffect(() => {
    if (preselectedBookingId) {
      setSelectedBookingId(preselectedBookingId);
    }
  }, [preselectedBookingId]);

  const selectedBooking =
    bookings.find((b) => b.id === selectedBookingId) || bookings[0];

  // Toggle passenger ID verification
  const handleToggleIdVerified = (passengerId: string) => {
    if (!selectedBooking) return;
    const updatedPassengers = selectedBooking.passengers.map((p) =>
      p.id === passengerId ? { ...p, idVerified: !p.idVerified } : p
    );
    const updated = { ...selectedBooking, passengers: updatedPassengers };
    StorageService.updateBooking(updated);
    refreshBookings();
  };

  // Toggle passenger dock check-in / boarding
  const handleToggleCheckIn = (passengerId: string) => {
    if (!selectedBooking) return;

    const updatedPassengers = selectedBooking.passengers.map((p) => {
      if (p.id === passengerId) {
        const nextState = !p.checkedIn;
        return {
          ...p,
          checkedIn: nextState,
          checkedOut: false,
          checkInTimestamp: nextState ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined,
        };
      }
      return p;
    });

    const allCheckedIn = updatedPassengers.every((p) => p.checkedIn);
    const anyCheckedIn = updatedPassengers.some((p) => p.checkedIn);

    let nextEmbarkationStatus: EmbarkationStatus = selectedBooking.embarkationStatus || "Awaiting Clearance";
    if (selectedBooking.embarkationStatus !== "Embarked & Departed" && selectedBooking.embarkationStatus !== "Checked-Out & Completed") {
      if (allCheckedIn || anyCheckedIn) {
        nextEmbarkationStatus = "Checked-In at Pier";
      }
    }

    const updated = {
      ...selectedBooking,
      passengers: updatedPassengers,
      embarkationStatus: nextEmbarkationStatus,
    };

    StorageService.updateBooking(updated);
    refreshBookings();
  };

  // Check out individual passenger from manifest
  const handleCheckOutPassenger = (passengerId: string) => {
    if (!selectedBooking) return;
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const updatedPassengers = selectedBooking.passengers.map((p) => {
      if (p.id === passengerId) {
        return {
          ...p,
          checkedIn: false,
          checkedOut: true,
          checkOutTimestamp: nowTime,
        };
      }
      return p;
    });

    const allCheckedOut = updatedPassengers.every((p) => p.checkedOut);
    const anyCheckedIn = updatedPassengers.some((p) => p.checkedIn);

    let nextEmbarkationStatus: EmbarkationStatus = selectedBooking.embarkationStatus || "Awaiting Clearance";
    let nextBookingStatus: BookingStatus = selectedBooking.status;

    if (allCheckedOut) {
      nextEmbarkationStatus = "Checked-Out & Completed";
      nextBookingStatus = "Completed";
    } else if (!anyCheckedIn && updatedPassengers.some((p) => p.checkedOut)) {
      nextEmbarkationStatus = "Checked-Out & Completed";
      nextBookingStatus = "Completed";
    }

    const updated: Booking = {
      ...selectedBooking,
      passengers: updatedPassengers,
      embarkationStatus: nextEmbarkationStatus,
      status: nextBookingStatus,
    };

    StorageService.updateBooking(updated);
    refreshBookings();

    if (allCheckedOut) {
      setActionSuccessMsg(
        `All passengers checked out. Manifest has been completed and reset for subsequent charters.`
      );
    } else {
      setActionSuccessMsg(`Passenger checked out at ${nowTime}. Manifest updated.`);
    }
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // Reset an individual passenger back to initial unboarded state
  const handleResetPassenger = (passengerId: string) => {
    if (!selectedBooking) return;
    const updatedPassengers = selectedBooking.passengers.map((p) => {
      if (p.id === passengerId) {
        return {
          ...p,
          checkedIn: false,
          checkedOut: false,
          checkInTimestamp: undefined,
          checkOutTimestamp: undefined,
          idVerified: false,
        };
      }
      return p;
    });

    const anyCheckedIn = updatedPassengers.some((p) => p.checkedIn);
    const anyCheckedOut = updatedPassengers.some((p) => p.checkedOut);
    let nextEmbarkationStatus: EmbarkationStatus = selectedBooking.embarkationStatus || "Awaiting Clearance";
    if (!anyCheckedIn && !anyCheckedOut) {
      nextEmbarkationStatus = "Boarding Pass Ready";
    }

    const updated = {
      ...selectedBooking,
      passengers: updatedPassengers,
      embarkationStatus: nextEmbarkationStatus,
    };
    StorageService.updateBooking(updated);
    refreshBookings();
    setActionSuccessMsg(`Passenger manifest status reset.`);
    setTimeout(() => setActionSuccessMsg(null), 2500);
  };

  // Reset entire manifest roster for this charter/tour package
  const handleResetManifest = () => {
    if (!selectedBooking) return;

    const resetPassengers = selectedBooking.passengers.map((p) => ({
      ...p,
      checkedIn: false,
      checkedOut: false,
      checkInTimestamp: undefined,
      checkOutTimestamp: undefined,
      idVerified: false,
    }));

    const updated: Booking = {
      ...selectedBooking,
      passengers: resetPassengers,
      embarkationStatus: "Awaiting Clearance",
      manifestAuditStatus: "Pending Manifest Review",
      manifestNotes: undefined,
    };

    StorageService.updateBooking(updated);
    refreshBookings();

    StorageService.addAuditLog({
      action: "MANIFEST_RESET",
      module: "Passenger Onboarding Verification",
      details: `Manifest roster for charter ${selectedBooking.id} (${selectedBooking.packageTitle}) was reset to clean state. Ready for new passenger onboarding.`,
      severity: "Info",
      userName: "Manifest Officer",
    });

    setActionSuccessMsg(
      `Manifest roster for ${selectedBooking.id} has been cleanly reset. Ready for new passenger onboarding.`
    );
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // Check out all passengers and complete/reset charter manifest
  const handleCheckOutAllAndReset = () => {
    if (!selectedBooking) return;
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const checkedOutPassengers = selectedBooking.passengers.map((p) => ({
      ...p,
      checkedIn: false,
      checkedOut: true,
      checkOutTimestamp: nowTime,
    }));

    const updated: Booking = {
      ...selectedBooking,
      passengers: checkedOutPassengers,
      embarkationStatus: "Checked-Out & Completed",
      status: "Completed",
    };

    StorageService.updateBooking(updated);
    refreshBookings();

    StorageService.addAuditLog({
      action: "EXPEDITION_CHECKED_OUT",
      module: "Passenger Onboarding Verification",
      details: `Charter ${selectedBooking.id} completed. All ${selectedBooking.guestCount} passengers checked out at pier. Manifest archived and reset.`,
      severity: "Info",
      userName: "Manifest Officer",
    });

    setActionSuccessMsg(
      `Charter ${selectedBooking.id} check-out complete. Manifest reset and voyage marked Completed.`
    );
    setTimeout(() => setActionSuccessMsg(null), 4500);
  };

  // Certify Manifest
  const handleCertifyManifest = () => {
    if (!selectedBooking) return;

    const updated: Booking = {
      ...selectedBooking,
      manifestAuditStatus: "Manifest Cleared",
      embarkationStatus: "Boarding Pass Ready",
      passengers: selectedBooking.passengers.map((p) => ({ ...p, idVerified: true })),
    };

    StorageService.updateBooking(updated);

    // Audit log
    StorageService.addAuditLog({
      action: "MANIFEST_CERTIFIED",
      module: "Passenger Onboarding Verification",
      details: `Charter ${selectedBooking.id} (${selectedBooking.leadGuestName}, ${selectedBooking.guestCount} pax) manifest certified & cleared for embarkation.`,
      severity: "Info",
      userName: "Ops Desk Verifier",
    });

    // Client notification
    StorageService.addClientNotification({
      bookingId: selectedBooking.id,
      packageTitle: selectedBooking.packageTitle,
      type: "manifest_approved",
      title: "Passenger Manifest Certified",
      message: `Your guest manifest for ${selectedBooking.packageTitle} has been audited & certified. Official Digital Embarkation Pass is now unlocked.`,
      actionLabel: "View Boarding Pass",
      priority: "high",
    });

    refreshBookings();
    setActionSuccessMsg(`Manifest for ${selectedBooking.id} certified. Embarkation Pass issued.`);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // Flag for revision
  const handleFlagForRevision = () => {
    if (!selectedBooking) return;
    const reason = revisionReason.trim() || "Missing emergency contact or valid government ID for passenger registration.";

    const updated: Booking = {
      ...selectedBooking,
      manifestAuditStatus: "Needs Manifest Revision",
      manifestNotes: reason,
    };

    StorageService.updateBooking(updated);

    StorageService.addAuditLog({
      action: "MANIFEST_REVISION_REQUESTED",
      module: "Passenger Onboarding Verification",
      details: `Charter ${selectedBooking.id} manifest flagged for revision: ${reason}`,
      severity: "Warning",
      userName: "Ops Desk Verifier",
    });

    StorageService.addClientNotification({
      bookingId: selectedBooking.id,
      packageTitle: selectedBooking.packageTitle,
      type: "manifest_needed",
      title: "Action Required: Manifest Revision",
      message: `Auditor note: ${reason}. Please update passenger details to finalize your embarkation clearance.`,
      actionLabel: "Update Manifest",
      priority: "urgent",
    });

    setRevisionModalOpen(false);
    setRevisionReason("");
    refreshBookings();
    setActionSuccessMsg(`Revision requested for ${selectedBooking.id}. Notification sent to traveler.`);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // Authorize dock departure & release vessel ("until the passenger leaves for the trip and never needing the website")
  const handleAuthorizeDeparture = () => {
    if (!selectedBooking) return;

    const updated: Booking = {
      ...selectedBooking,
      embarkationStatus: "Embarked & Departed",
      status: "Completed",
    };

    StorageService.updateBooking(updated);

    StorageService.addAuditLog({
      action: "EXPEDITION_DEPARTED",
      module: "Passenger Onboarding Verification",
      details: `Charter ${selectedBooking.id} with ${selectedBooking.guestCount} guests cleared pier disembarkation. Vessel departed dock.`,
      severity: "Info",
      userName: "Harbor Master Guide",
    });

    StorageService.addClientNotification({
      bookingId: selectedBooking.id,
      packageTitle: selectedBooking.packageTitle,
      type: "embarked",
      title: "Expedition Underway: Welcome Aboard",
      message: `Your charter has cast off from ${selectedBooking.departureDock || "Private Pier 4"}. Your digital onboarding cycle is complete. Enjoy the pristine Philippine horizons!`,
      actionLabel: "View Expedition Log",
      priority: "normal",
    });

    refreshBookings();
    setActionSuccessMsg(`Charter ${selectedBooking.id} marked as Departed. Digital journey cycle completed.`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // Print manifest
  const handlePrintManifest = () => {
    window.print();
  };

  // Filtered bookings
  const filteredBookings = bookings.filter((b) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      b.id.toLowerCase().includes(q) ||
      b.leadGuestName.toLowerCase().includes(q) ||
      b.destination.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (activeFilter === "pending_review") {
      return (
        b.manifestAuditStatus === "Pending Manifest Review" ||
        b.manifestAuditStatus === "Needs Manifest Submission" ||
        !b.manifestAuditStatus
      );
    }
    if (activeFilter === "cleared") {
      return (
        b.manifestAuditStatus === "Manifest Cleared" &&
        b.embarkationStatus !== "Embarked & Departed"
      );
    }
    if (activeFilter === "needs_revision") {
      return b.manifestAuditStatus === "Needs Manifest Revision";
    }
    if (activeFilter === "departed") {
      return (
        b.embarkationStatus === "Embarked & Departed" ||
        b.embarkationStatus === "Checked-Out & Completed" ||
        b.status === "Completed"
      );
    }

    return true;
  });

  const checkedInCount = selectedBooking?.passengers.filter((p) => p.checkedIn).length || 0;
  const verifiedIdCount = selectedBooking?.passengers.filter((p) => p.idVerified).length || 0;
  const totalPax = selectedBooking?.passengers.length || 0;

  return (
    <div className="space-y-6">
      {/* Module Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl text-white font-bold">
              Passenger Onboarding &amp; Manifest Verification Desk
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              DOT Verified
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit guest rosters, verify government IDs, review dietary/medical alerts, and authorize dock departures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePrintManifest}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Manifest</span>
          </motion.button>

          {selectedBooking && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onViewQR(selectedBooking)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#030C16] text-xs font-bold transition-colors cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <QrCode className="w-4 h-4" />
              <span>Inspect Boarding Pass</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {actionSuccessMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{actionSuccessMsg}</span>
            </div>
            <button
              onClick={() => setActionSuccessMsg(null)}
              className="text-emerald-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#071726] p-2.5 rounded-2xl border border-cyan-500/20">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: "all", label: "All Charters", count: bookings.length },
            {
              id: "pending_review",
              label: "Needs Manifest Audit",
              count: bookings.filter(
                (b) =>
                  b.manifestAuditStatus === "Pending Manifest Review" ||
                  b.manifestAuditStatus === "Needs Manifest Submission" ||
                  !b.manifestAuditStatus
              ).length,
            },
            {
              id: "cleared",
              label: "Manifest Certified",
              count: bookings.filter(
                (b) =>
                  b.manifestAuditStatus === "Manifest Cleared" &&
                  b.embarkationStatus !== "Embarked & Departed"
              ).length,
            },
            {
              id: "needs_revision",
              label: "Correction Flagged",
              count: bookings.filter(
                (b) => b.manifestAuditStatus === "Needs Manifest Revision"
              ).length,
            },
            {
              id: "departed",
              label: "Departed / Complete",
              count: bookings.filter(
                (b) =>
                  b.embarkationStatus === "Embarked & Departed" ||
                  b.embarkationStatus === "Checked-Out & Completed" ||
                  b.status === "Completed"
              ).length,
            },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeFilter === tab.id
                  ? "bg-cyan-500 text-[#030C16] font-bold shadow-md shadow-cyan-500/20"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeFilter === tab.id
                    ? "bg-[#030C16]/20 text-[#030C16]"
                    : "bg-white/10 text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            </motion.button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by Booking ID, Lead Guest..."
            className="w-full bg-[#030C16] border border-cyan-500/20 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Charter Selector List */}
        <div className="bg-[#071726] border border-cyan-500/20 rounded-3xl p-4 space-y-3">
          <div className="flex items-center justify-between px-2 pb-1 border-b border-white/5">
            <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold font-mono">
              Select Active Charter ({filteredBookings.length})
            </span>
            <Filter className="w-3.5 h-3.5 text-slate-500" />
          </div>

          <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
            {filteredBookings.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No charters match this filter.
              </div>
            ) : (
              filteredBookings.map((b) => {
                const isSelected = selectedBooking?.id === b.id;
                const bCheckedIn = b.passengers.filter((p) => p.checkedIn).length;
                const bIdVerified = b.passengers.filter((p) => p.idVerified).length;

                return (
                  <motion.div
                    key={b.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedBookingId(b.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-cyan-950/40 border-cyan-400 text-white shadow-lg shadow-cyan-500/10"
                        : "bg-[#030C16] border-white/5 text-slate-300 hover:border-cyan-500/30"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs font-bold text-cyan-400">{b.id}</span>
                      <span className="text-[10px] text-slate-400">{b.travelDate}</span>
                    </div>

                    <p className="font-semibold text-xs mt-1 text-white truncate">
                      {b.leadGuestName}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{b.packageTitle}</p>

                    {/* Manifest & Embarkation Status Pills */}
                    <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
                      {b.manifestAuditStatus === "Manifest Cleared" ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[9px] font-semibold flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> Manifest Certified
                        </span>
                      ) : b.manifestAuditStatus === "Needs Manifest Revision" ? (
                        <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[9px] font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" /> Revision Needed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[9px] font-semibold flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> Awaiting Audit
                        </span>
                      )}

                      {b.embarkationStatus === "Checked-Out & Completed" || b.status === "Completed" ? (
                        <span className="px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-300 border border-teal-500/30 text-[9px] font-semibold">
                          Checked-Out &amp; Completed
                        </span>
                      ) : b.embarkationStatus === "Embarked & Departed" ? (
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[9px] font-semibold">
                          Voyage Departed
                        </span>
                      ) : b.embarkationStatus === "Checked-In at Pier" ? (
                        <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[9px] font-semibold">
                          At Dock ({bCheckedIn}/{b.passengers.length})
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{b.guestCount} Guests</span>
                      <span>
                        IDs: {bIdVerified}/{b.passengers.length}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Manifest Detail & Verification Sheet */}
        {selectedBooking ? (
          <div className="lg:col-span-2 bg-[#071726] border border-cyan-500/20 rounded-3xl p-6 space-y-6">
            {/* Header / Summary Ribbon */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-5 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold font-mono">
                    Charter Manifest Verification Desk
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="font-mono text-xs text-white">{selectedBooking.id}</span>
                </div>
                <h3 className="font-serif text-2xl text-white font-bold mt-1">
                  {selectedBooking.leadGuestName} &amp; Expedition Party
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Package: <span className="text-slate-200">{selectedBooking.packageTitle}</span> • Destination:{" "}
                  <span className="text-cyan-300">{selectedBooking.destination}</span>
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex sm:flex-col items-end gap-1.5">
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
                    selectedBooking.manifestAuditStatus === "Manifest Cleared"
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                      : selectedBooking.manifestAuditStatus === "Needs Manifest Revision"
                      ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                      : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                  }`}
                >
                  {selectedBooking.manifestAuditStatus === "Manifest Cleared" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : selectedBooking.manifestAuditStatus === "Needs Manifest Revision" ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>
                    {selectedBooking.manifestAuditStatus || "Pending Manifest Review"}
                  </span>
                </div>

                <span className="text-[11px] font-mono text-slate-400">
                  Embarkation: {selectedBooking.embarkationStatus || "Awaiting Clearance"}
                </span>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-[#030C16] rounded-2xl border border-white/5">
                <p className="text-slate-400">Assigned Vessel</p>
                <p className="text-white font-semibold mt-0.5 flex items-center gap-1">
                  <Ship className="w-3.5 h-3.5 text-cyan-400" />
                  <span>M/V Kalayaan Star</span>
                </p>
              </div>

              <div className="p-3 bg-[#030C16] rounded-2xl border border-white/5">
                <p className="text-slate-400">Departure Dock</p>
                <p className="text-white font-semibold mt-0.5 truncate">
                  {selectedBooking.departureDock || "Private Pier Terminal 4"}
                </p>
              </div>

              <div className="p-3 bg-[#030C16] rounded-2xl border border-white/5">
                <p className="text-slate-400">Master Tour Guide</p>
                <p className="text-white font-semibold mt-0.5 truncate">
                  {selectedBooking.assignedGuideName || "Operations Dispatcher"}
                </p>
              </div>

              <div className="p-3 bg-[#030C16] rounded-2xl border border-white/5">
                <p className="text-slate-400">Departure Time</p>
                <p className="text-cyan-400 font-semibold font-mono mt-0.5">
                  {selectedBooking.departureTime || "07:30 AM PHT"}
                </p>
              </div>
            </div>

            {/* Verification Checklist Ribbon */}
            <div className="p-4 bg-cyan-950/20 border border-cyan-500/20 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Audit Verification Checkpoints</span>
                </span>
                <span className="text-[11px] font-mono text-cyan-300">
                  {verifiedIdCount}/{totalPax} Government IDs Verified
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2 p-2 bg-[#030C16] rounded-xl border border-white/5">
                  <div className={`w-4 h-4 rounded-md flex items-center justify-center ${verifiedIdCount === totalPax ? "bg-emerald-500 text-black" : "bg-white/10 text-slate-400"}`}>
                    <Check className="w-3 h-3" />
                  </div>
                  <span>All Guest Passports/IDs Checked</span>
                </div>

                <div className="flex items-center gap-2 p-2 bg-[#030C16] rounded-xl border border-white/5">
                  <div className="w-4 h-4 rounded-md bg-emerald-500 text-black flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Emergency Contacts on File</span>
                </div>

                <div className="flex items-center gap-2 p-2 bg-[#030C16] rounded-xl border border-white/5">
                  <div className="w-4 h-4 rounded-md bg-emerald-500 text-black flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Dietary &amp; Medical Logged</span>
                </div>
              </div>
            </div>

            {/* Passenger Manifest Roster & Individual Inspection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold font-mono">
                  Passenger Roster ({selectedBooking.passengers.length} Registered)
                </h4>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="text-emerald-400 font-semibold">
                    {checkedInCount}/{totalPax} Boarded at Pier
                  </span>
                  {selectedBooking.passengers.some((p) => p.checkedOut) && (
                    <span className="text-cyan-400 font-semibold">
                      {selectedBooking.passengers.filter((p) => p.checkedOut).length}/{totalPax} Checked Out
                    </span>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleResetManifest}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-[11px] font-medium transition-colors cursor-pointer"
                    title="Reset manifest boarding and check-in statuses"
                  >
                    <RotateCcw className="w-3 h-3 text-amber-400" />
                    <span>Reset Manifest</span>
                  </motion.button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#030C16] text-slate-400 border-b border-white/10 uppercase tracking-wider text-[10px] font-mono">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Passenger Full Legal Name</th>
                      <th className="px-4 py-3">Age / Gender / Nat</th>
                      <th className="px-4 py-3">Emergency Contact</th>
                      <th className="px-4 py-3">Medical / Dietary Notes</th>
                      <th className="px-4 py-3 text-center">ID Verified</th>
                      <th className="px-4 py-3 text-right">Pier Check-In &amp; Check-Out</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-[#071726]/40">
                    {selectedBooking.passengers.map((pax, idx) => (
                      <tr key={pax.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 text-slate-500 font-mono">{idx + 1}</td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{pax.fullName}</span>
                            {idx === 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[9px]">
                                Lead Guest
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-slate-300">
                          {pax.age}y / {pax.gender} • <span className="font-mono">{pax.nationality}</span>
                        </td>

                        <td className="px-4 py-3">
                          {pax.emergencyContact ? (
                            <span className="text-slate-300 flex items-center gap-1 font-mono text-[11px]">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {pax.emergencyContact}
                            </span>
                          ) : (
                            <span className="text-amber-400 text-[10px] flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Missing Contact
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          {pax.medicalOrDietaryAlert ? (
                            <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-medium">
                              {pax.medicalOrDietaryAlert}
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">None</span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleToggleIdVerified(pax.id)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-colors cursor-pointer inline-flex items-center gap-1 ${
                              pax.idVerified
                                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
                            }`}
                            title="Click to toggle ID validation"
                          >
                            <Check className="w-3 h-3" />
                            <span>{pax.idVerified ? "ID Checked" : "Verify ID"}</span>
                          </motion.button>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {pax.checkedOut ? (
                              <>
                                <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                                  <span>Checked Out</span>
                                  {pax.checkOutTimestamp && (
                                    <span className="text-[10px] text-cyan-200/70 font-mono">
                                      ({pax.checkOutTimestamp})
                                    </span>
                                  )}
                                </span>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleResetPassenger(pax.id)}
                                  className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                  title="Reset passenger status back to unboarded"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                </motion.button>
                              </>
                            ) : pax.checkedIn ? (
                              <>
                                <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-500 text-[#030C16] border border-emerald-400 shadow-sm shadow-emerald-500/20 inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Boarded</span>
                                  {pax.checkInTimestamp && (
                                    <span className="text-[10px] opacity-80 font-mono">
                                      ({pax.checkInTimestamp})
                                    </span>
                                  )}
                                </span>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleCheckOutPassenger(pax.id)}
                                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
                                  title="Check out passenger from pier manifest"
                                >
                                  <LogOut className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Check Out</span>
                                </motion.button>
                              </>
                            ) : (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleToggleCheckIn(pax.id)}
                                className="px-3 py-1 rounded-xl text-[11px] font-bold bg-white/5 text-slate-300 hover:text-white border border-white/10 hover:bg-white/10 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                                <span>Check-in &amp; Board</span>
                              </motion.button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Operational Decision Bar with Micro-Animated Buttons */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                <span>Verification State: </span>
                <strong className="text-white">
                  {selectedBooking.manifestAuditStatus || "Pending Audit"}
                </strong>
                {selectedBooking.manifestNotes && (
                  <p className="text-[11px] text-amber-400 mt-0.5">
                    Note: {selectedBooking.manifestNotes}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Reset Manifest Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleResetManifest}
                  className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Resets manifest and all passenger check-in/boarding statuses back to initial clean state."
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Reset Manifest</span>
                </motion.button>

                {/* Check Out All Guests & Reset */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckOutAllAndReset}
                  className="px-3.5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  title="Checks out all passengers and resets manifest for next charter."
                >
                  <LogOut className="w-3.5 h-3.5 text-amber-400" />
                  <span>Check Out All &amp; Reset</span>
                </motion.button>

                {/* Flag Revision */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setRevisionModalOpen(true)}
                  className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/10 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Request Revision</span>
                </motion.button>

                {/* Certify Manifest */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCertifyManifest}
                  className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#030C16] text-xs font-bold transition-colors cursor-pointer shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Certify Manifest &amp; Issue Pass</span>
                </motion.button>

                {/* Authorize Departure & Offboard ("until passenger leaves for trip and never needing website") */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAuthorizeDeparture}
                  disabled={selectedBooking.embarkationStatus === "Embarked & Departed" || selectedBooking.embarkationStatus === "Checked-Out & Completed"}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedBooking.embarkationStatus === "Embarked & Departed" || selectedBooking.embarkationStatus === "Checked-Out & Completed"
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5"
                      : "bg-gradient-to-r from-emerald-500 to-teal-400 text-[#030C16] hover:brightness-110 shadow-lg shadow-emerald-500/20"
                  }`}
                  title="Marks charter as departed, fulfilling the digital reservation lifecycle."
                >
                  <Ship className="w-4 h-4" />
                  <span>
                    {selectedBooking.embarkationStatus === "Embarked & Departed"
                      ? "Voyage Underway (Departed)"
                      : selectedBooking.embarkationStatus === "Checked-Out & Completed"
                      ? "Voyage Completed"
                      : "Authorize Pier Departure"}
                  </span>
                </motion.button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* REQUEST REVISION MODAL */}
      <AnimatePresence>
        {revisionModalOpen && selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#071726] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  <h4 className="font-serif text-lg text-white font-bold">
                    Flag Manifest for Revision
                  </h4>
                </div>
                <button
                  onClick={() => setRevisionModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-slate-300">
                  Charter: <strong className="text-cyan-400 font-mono">{selectedBooking.id}</strong> ({selectedBooking.leadGuestName})
                </p>
                <p className="text-slate-400">
                  Select or type the specific reason why this manifest needs guest correction:
                </p>

                <div className="space-y-2">
                  {[
                    "Missing emergency phone contact for secondary passengers",
                    "Legal full name does not match valid government ID",
                    "Unclear dietary or medical alert for deep sea excursion",
                    "Minor child passenger requires accompanying guardian verification",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRevisionReason(preset)}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition-colors ${
                        revisionReason === preset
                          ? "bg-cyan-950/60 border-cyan-400 text-cyan-200 font-medium"
                          : "bg-[#030C16] border-white/5 text-slate-300 hover:border-cyan-500/30"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">
                    Auditor Notes to Traveler:
                  </label>
                  <textarea
                    rows={3}
                    value={revisionReason}
                    onChange={(e) => setRevisionReason(e.target.value)}
                    placeholder="Provide specific directions for traveler..."
                    className="w-full bg-[#030C16] border border-cyan-500/20 focus:border-cyan-400 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setRevisionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleFlagForRevision}
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-lg shadow-rose-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Revision Request</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
