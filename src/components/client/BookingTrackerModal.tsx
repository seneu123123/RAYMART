import React, { useState } from "react";
import { X, Search, QrCode, Calendar, MapPin, Users, CheckCircle2, Clock, AlertCircle, ArrowRight } from "lucide-react";
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

              {/* Status Stepper */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 mx-auto mb-1" />
                  <p className="font-medium">1. Slot Reserved</p>
                  <p className="text-[10px] text-[#7C8B96]">30% Downpayment</p>
                </div>
                <div className={`p-2.5 rounded-xl border ${
                  foundBooking.paymentStatus === "Fully Paid"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-amber-500/10 border-amber-500/20 text-amber-300"
                }`}>
                  <Clock className="w-4 h-4 mx-auto mb-1" />
                  <p className="font-medium">2. Settlement</p>
                  <p className="text-[10px] text-[#7C8B96]">{foundBooking.paymentStatus}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300">
                  <CheckCircle2 className="w-4 h-4 mx-auto mb-1" />
                  <p className="font-medium">3. Coast Guard Clearance</p>
                  <p className="text-[10px] text-[#7C8B96]">Manifest OK</p>
                </div>
              </div>

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
                <button
                  onClick={() => onViewQR(foundBooking)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F26A4F] hover:bg-[#FF765B] text-white text-xs font-semibold shadow-lg transition-colors cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  <span>View Official QR Boarding Pass & Voucher</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
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
