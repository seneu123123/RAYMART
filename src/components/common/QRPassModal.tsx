import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { motion } from "motion/react";
import { Booking } from "../../types";
import {
  X,
  Printer,
  ShieldCheck,
  MapPin,
  Calendar,
  Users,
  CheckCircle2,
  FileCheck,
  Ship,
  Sparkles,
} from "lucide-react";
import { AshLogo } from "./AshLogo";

interface QRPassModalProps {
  booking: Booking | null;
  onClose: () => void;
}

export const QRPassModal: React.FC<QRPassModalProps> = ({ booking, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    if (!booking) return;
    const qrPayload = JSON.stringify({
      code: booking.id,
      lead: booking.leadGuestName,
      pax: booking.guestCount,
      dest: booking.destination,
      status: booking.status,
      manifest: booking.manifestAuditStatus || "Manifest Cleared",
      embarkation: booking.embarkationStatus || "Awaiting Clearance",
      operator: "ALYN SHIR LUXURY PHILIPPINE MARINE EXPEDITIONS",
      dotLicense: "DOT-ACCR-RO7-2026-8819",
    });

    QRCode.toDataURL(qrPayload, {
      width: 260,
      margin: 2,
      color: {
        dark: "#030C16",
        light: "#FFFFFF",
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QR Generation error", err));
  }, [booking]);

  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#071726] border border-cyan-500/30 rounded-2xl overflow-hidden shadow-2xl my-8 text-white">
        {/* Header Bar */}
        <div className="bg-[#030C16] px-6 py-4 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AshLogo size="sm" />
            <div>
              <span className="font-serif text-base font-bold tracking-wide text-white block">
                ALYN SHIR Official Expedition Pass
              </span>
              <span className="text-[10px] text-cyan-400 font-sans tracking-wide block">
                Digital Boarding &amp; Port Embarkation Voucher
              </span>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Printable Ticket Body */}
        <div id="printable-boarding-pass" className="p-6 md:p-8 space-y-6 bg-[#071726]">
          {/* Brand & DOT Top Ribbon */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-cyan-500/20 pb-4 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <AshLogo size="sm" />
                <div>
                  <p className="text-xs uppercase tracking-widest text-cyan-400 font-bold">
                    ALYN SHIR
                  </p>
                  <p className="text-[10px] text-slate-400 font-sans">
                    Luxury Philippine Marine Expeditions
                  </p>
                </div>
              </div>
              <p className="text-[9px] text-slate-400 italic mt-1 max-w-xs">
                Always Leading Your Next Seamless Horizon, Inspiring Roads
              </p>
              <h3 className="font-serif text-xl text-white font-bold mt-2">
                {booking.packageTitle}
              </h3>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> DOT-ACCR-RO7-2026-8819
              </span>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                Booking ID: <span className="text-cyan-300 font-bold">{booking.id}</span>
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <div className="bg-[#030C16] p-3 rounded-xl border border-cyan-500/15">
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-cyan-400" /> Lead Passenger
              </p>
              <p className="text-white font-semibold mt-0.5 truncate">{booking.leadGuestName}</p>
            </div>

            <div className="bg-[#030C16] p-3 rounded-xl border border-cyan-500/15">
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Travel Date
              </p>
              <p className="text-white font-semibold mt-0.5">{booking.travelDate}</p>
            </div>

            <div className="bg-[#030C16] p-3 rounded-xl border border-cyan-500/15">
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Destination
              </p>
              <p className="text-white font-semibold mt-0.5 truncate">{booking.destination}</p>
            </div>

            <div className="bg-[#030C16] p-3 rounded-xl border border-cyan-500/15">
              <p className="text-xs text-slate-400">Total Party</p>
              <p className="text-white font-semibold mt-0.5">{booking.guestCount} Guests</p>
            </div>

            <div className="bg-[#030C16] p-3 rounded-xl border border-cyan-500/15">
              <p className="text-xs text-slate-400">Payment Audit</p>
              <span
                className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  booking.paymentAuditStatus === "Verified"
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                    : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                }`}
              >
                {booking.paymentAuditStatus || "Verified"}
              </span>
            </div>

            <div className="bg-[#030C16] p-3 rounded-xl border border-cyan-500/15">
              <p className="text-xs text-slate-400">Manifest Status</p>
              <span
                className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  booking.manifestAuditStatus === "Manifest Cleared"
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                    : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                }`}
              >
                {booking.manifestAuditStatus || "Manifest Cleared"}
              </span>
            </div>
          </div>

          {/* Passenger Manifest Snapshot */}
          <div className="bg-[#030C16] p-4 rounded-xl border border-cyan-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Verified Passenger Onboarding Manifest ({booking.passengers.length} Guests)</span>
              </p>
              <span className="text-[10px] text-cyan-400 font-mono">
                {booking.embarkationStatus || "Pier Ready"}
              </span>
            </div>

            <div className="divide-y divide-white/5 text-xs">
              {booking.passengers.map((pax, idx) => (
                <div key={pax.id} className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-mono">{idx + 1}.</span>
                    <span className="text-white font-medium">{pax.fullName}</span>
                    <span className="text-slate-400 text-[11px]">({pax.age}y, {pax.nationality})</span>
                    {pax.medicalOrDietaryAlert && (
                      <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px]">
                        {pax.medicalOrDietaryAlert}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {pax.checkedIn ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Pier Checked-In
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Ready for Embarkation</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-[#030C16] border border-cyan-500/20 gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-sm font-bold text-white flex items-center gap-1.5 justify-center sm:justify-start">
                <Ship className="w-4 h-4 text-cyan-400" />
                <span>Official Pier Embarkation QR</span>
              </p>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Present this encrypted pass at the terminal pier or directly to your assigned expedition guide for instant manifest clearance.
              </p>
              <p className="text-[11px] font-mono text-cyan-400 pt-1">
                REF: {booking.id} • PASS CERTIFIED
              </p>
            </div>
            {qrDataUrl && (
              <div className="p-2 bg-white rounded-xl shadow-lg border border-cyan-400/40">
                <img
                  src={qrDataUrl}
                  alt={`QR code for ${booking.id}`}
                  className="w-28 h-28 object-contain"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-[#030C16] px-6 py-4 border-t border-cyan-500/20 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Complies with RA 10173 Philippine Data Privacy Act
          </p>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors cursor-pointer border border-white/10"
            >
              <Printer className="w-4 h-4" /> Print Pass / Save PDF
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#030C16] text-xs font-bold transition-colors cursor-pointer shadow-md shadow-cyan-500/20"
            >
              Close
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};
