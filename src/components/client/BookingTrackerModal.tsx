import React, { useState } from "react";
import { motion } from "motion/react";
import {
  X,
  Search,
  QrCode,
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  Ship,
} from "lucide-react";
import { Booking } from "../../types";
import { StorageService } from "../../services/storage";

interface BookingTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewQR: (booking: Booking) => void;
}

export const BookingTrackerModal: React.FC<BookingTrackerModalProps> = ({
  isOpen,
  onClose,
  onViewQR,
}) => {
  const [query, setQuery] = useState("");
  const [foundBooking, setFoundBooking] = useState<Booking | null>(null);
  const [searched, setSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim().toLowerCase();
    if (!clean) return;

    const allBookings = StorageService.getBookings();
    const match = allBookings.find(
      (b) => b.id.toLowerCase() === clean || b.leadGuestEmail.toLowerCase() === clean
    );

    setFoundBooking(match || null);
    setSearched(true);
  };

  const handleQuickLookup = (code: string) => {
    setQuery(code);
    const allBookings = StorageService.getBookings();
    const match = allBookings.find((b) => b.id === code);
    setFoundBooking(match || null);
    setSearched(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0B1014] border border-white/10 rounded-2xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="bg-[#0E151A] px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-[#10B981]" />
            <h3 className="font-serif text-xl text-[#F4F1EA] font-semibold">
              Self-Service Expedition Booking Tracker
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#7C8B96] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {/* Search Box */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#7C8B96] absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Booking Code (e.g. HT-2026-8819) or Guest Email..."
                className="w-full bg-[#070B0E] border border-white/10 focus:border-[#F26A4F] rounded-xl pl-10 pr-4 py-3 text-sm text-[#F4F1EA] placeholder-[#7C8B96] focus:outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#F26A4F] hover:bg-[#FF765B] text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              Track
            </button>
          </form>

          {/* Quick Demo links */}
          <div className="flex items-center gap-2 text-xs text-[#7C8B96]">
            <span>Try sample codes:</span>
            <button
              onClick={() => handleQuickLookup("HT-2026-8819")}
              className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[#F4F1EA] font-mono underline"
            >
              HT-2026-8819
            </button>
            <button
              onClick={() => handleQuickLookup("HT-2026-1042")}
              className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[#F4F1EA] font-mono underline"
            >
              HT-2026-1042
            </button>
          </div>

          {/* Result Card */}
          {searched && foundBooking ? (
            <div className="bg-[#070B0E] border border-white/10 rounded-2xl p-6 space-y-6 animate-in fade-in duration-300">
              {/* Top Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-3">
                <div>
                  <span className="text-[11px] font-mono text-[#F26A4F] uppercase tracking-wider block">
                    {foundBooking.id}
                  </span>
                  <h4 className="font-serif text-xl text-[#F4F1EA] font-bold mt-0.5">
                    {foundBooking.packageTitle}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    foundBooking.status === "Confirmed"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                  }`}>
                    {foundBooking.status}
                  </span>
                </div>
              </div>

              {/* Payment Audit Status Notification Banner */}
              {foundBooking.paymentAuditStatus && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
                    foundBooking.paymentAuditStatus === "Verified"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : foundBooking.paymentAuditStatus === "Needs Re-Photo"
                      ? "bg-blue-500/15 border-blue-500/30 text-blue-300"
                      : foundBooking.paymentAuditStatus === "Flagged as Suspect"
                      ? "bg-rose-500/15 border-rose-500/30 text-rose-300"
                      : "bg-amber-500/10 border-amber-500/20 text-amber-300"
                  }`}
                >
                  {foundBooking.paymentAuditStatus === "Verified" && (
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                  )}
                  {foundBooking.paymentAuditStatus === "Needs Re-Photo" && (
                    <AlertCircle className="w-5 h-5 shrink-0 text-blue-400" />
                  )}
                  {(foundBooking.paymentAuditStatus === "Flagged as Suspect" ||
                    foundBooking.paymentAuditStatus === "Rejected") && (
                    <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                  )}
                  {foundBooking.paymentAuditStatus === "Pending Verification" && (
                    <Clock className="w-5 h-5 shrink-0 text-amber-400" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">
                      Payment Audit Status: {foundBooking.paymentAuditStatus}
                    </p>
                    <p className="text-[11px] text-[#D1CCC0] mt-0.5">
                      {foundBooking.paymentAuditStatus === "Verified" &&
                        "Your payment receipt to John Raymart Dordines (09466455124) has been audited and approved."}
                      {foundBooking.paymentAuditStatus === "Needs Re-Photo" &&
                        "Audit Note: Please re-upload a clearer or uncropped screenshot showing the complete transaction reference number."}
                      {foundBooking.paymentAuditStatus === "Flagged as Suspect" &&
                        "Audit Alert: Discrepancy detected in reference code or receipt format. Finance officer will review."}
                      {foundBooking.paymentAuditStatus === "Pending Verification" &&
                        "Your transaction receipt is currently queued for audit clearance by our finance desk."}
                    </p>
                    {foundBooking.paymentReference && (
                      <p className="text-[10px] text-[#7C8B96] font-mono mt-1">
                        Submitted Ref: {foundBooking.paymentReference} • Channel: {foundBooking.paymentMethod || "InstaPay"}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* 4-Step Booking & Verification Lifecycle Stepper */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                {/* Step 1 */}
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 mx-auto mb-1" />
                  <p className="font-semibold">1. Reserved</p>
                  <p className="text-[10px] text-slate-400">30% Downpayment</p>
                </div>

                {/* Step 2 */}
                <div
                  className={`p-2.5 rounded-xl border ${
                    foundBooking.paymentAuditStatus === "Verified"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-amber-500/10 border-amber-500/20 text-amber-300"
                  }`}
                >
                  {foundBooking.paymentAuditStatus === "Verified" ? (
                    <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                  ) : (
                    <Clock className="w-4 h-4 mx-auto mb-1" />
                  )}
                  <p className="font-semibold">2. Payment Audited</p>
                  <p className="text-[10px] text-slate-400">
                    {foundBooking.paymentAuditStatus || "Pending"}
                  </p>
                </div>

                {/* Step 3 */}
                <div
                  className={`p-2.5 rounded-xl border ${
                    foundBooking.manifestAuditStatus === "Manifest Cleared"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : foundBooking.manifestAuditStatus === "Needs Manifest Revision"
                      ? "bg-rose-500/10 border-rose-500/20 text-rose-300"
                      : "bg-cyan-500/10 border-cyan-500/20 text-cyan-300"
                  }`}
                >
                  {foundBooking.manifestAuditStatus === "Manifest Cleared" ? (
                    <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                  ) : (
                    <FileCheck className="w-4 h-4 mx-auto mb-1" />
                  )}
                  <p className="font-semibold">3. Onboarding Manifest</p>
                  <p className="text-[10px] text-slate-400">
                    {foundBooking.manifestAuditStatus || "Pending Audit"}
                  </p>
                </div>

                {/* Step 4 */}
                <div
                  className={`p-2.5 rounded-xl border ${
                    foundBooking.embarkationStatus === "Embarked & Departed"
                      ? "bg-purple-500/15 border-purple-500/30 text-purple-300"
                      : foundBooking.embarkationStatus === "Checked-In at Pier"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-slate-800/60 border-white/5 text-slate-400"
                  }`}
                >
                  <Ship className="w-4 h-4 mx-auto mb-1" />
                  <p className="font-semibold">4. Pier &amp; Departure</p>
                  <p className="text-[10px] text-slate-400">
                    {foundBooking.embarkationStatus || "Awaiting Departure"}
                  </p>
                </div>
              </div>

              {/* Manifest Audit Notification Banner */}
              {foundBooking.manifestAuditStatus && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
                    foundBooking.manifestAuditStatus === "Manifest Cleared"
                      ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
                      : foundBooking.manifestAuditStatus === "Needs Manifest Revision"
                      ? "bg-rose-500/15 border-rose-500/30 text-rose-300"
                      : "bg-amber-500/10 border-amber-500/20 text-amber-300"
                  }`}
                >
                  {foundBooking.manifestAuditStatus === "Manifest Cleared" ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-cyan-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">
                      Passenger Manifest Verification: {foundBooking.manifestAuditStatus}
                    </p>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      {foundBooking.manifestAuditStatus === "Manifest Cleared" &&
                        "All passenger legal IDs, emergency contacts, and medical alerts have been certified. Digital Embarkation Pass is ready."}
                      {foundBooking.manifestAuditStatus === "Needs Manifest Revision" &&
                        `Revision Required: ${foundBooking.manifestNotes || "Please update guest emergency contacts or legal identification."}`}
                      {foundBooking.manifestAuditStatus === "Pending Manifest Review" &&
                        "Your passenger roster is currently undergoing verification by our operations desk."}
                      {foundBooking.manifestAuditStatus === "Needs Manifest Submission" &&
                        "Please complete all passenger full names and emergency contacts before departure."}
                    </p>
                  </div>
                </div>
              )}

              {/* Embarked / Departed completion message */}
              {foundBooking.embarkationStatus === "Embarked & Departed" && (
                <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-200 text-xs flex items-center gap-3">
                  <Ship className="w-5 h-5 shrink-0 text-purple-400" />
                  <div>
                    <p className="font-semibold">Voyage Underway</p>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Your vessel has cleared the pier and departed. Your digital onboarding cycle is complete — no further website action is needed. Have a splendid voyage!
                    </p>
                  </div>
                </div>
              )}

              {/* Details grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-white/5 rounded-xl">
                  <p className="text-[#7C8B96]">Lead Guest</p>
                  <p className="text-[#F4F1EA] font-medium truncate mt-0.5">{foundBooking.leadGuestName}</p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl">
                  <p className="text-[#7C8B96]">Travel Date</p>
                  <p className="text-[#F4F1EA] font-medium mt-0.5">{foundBooking.travelDate}</p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl">
                  <p className="text-[#7C8B96]">Total Balance</p>
                  <p className="text-[#F26A4F] font-medium mt-0.5">₱{foundBooking.balanceAmount.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl">
                  <p className="text-[#7C8B96]">Assigned Guide</p>
                  <p className="text-[#F4F1EA] font-medium truncate mt-0.5">{foundBooking.assignedGuideName || "Operations Dispatch"}</p>
                </div>
              </div>

              {/* Action Button: Boarding Pass */}
              <div className="pt-2 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onViewQR(foundBooking)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F26A4F] hover:bg-[#FF765B] text-white text-xs font-semibold shadow-lg transition-colors cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  <span>View Official QR Boarding Pass &amp; Voucher</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          ) : searched ? (
            <div className="p-8 text-center bg-[#070B0E] rounded-2xl border border-white/5 space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
              <h4 className="font-serif text-lg text-[#F4F1EA]">No Booking Found</h4>
              <p className="text-xs text-[#7C8B96] max-w-sm mx-auto">
                We could not locate a record matching &quot;{query}&quot;. Please verify your tracking code or contact our 24/7 operations tower.
              </p>
            </div>
          ) : null}
        </div>

        <div className="bg-[#0E151A] px-6 py-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            Close Tracker
          </button>
        </div>
      </div>
    </div>
  );
};
