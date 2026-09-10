import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Booking } from "../../types";
import { X, Printer, ShieldCheck, Anchor, MapPin, Calendar, Users, CheckCircle2 } from "lucide-react";

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
      dotLicense: "DOT-ACCR-RO7-2026-8819",
    });

    QRCode.toDataURL(qrPayload, {
      width: 240,
      margin: 2,
      color: {
        dark: "#070B0E",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0B1014] border border-white/10 rounded-2xl overflow-hidden shadow-2xl my-8">
        {/* Header Bar */}
        <div className="bg-[#0E151A] px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Anchor className="w-5 h-5 text-[#F26A4F]" />
            <span className="font-serif text-lg tracking-wide text-[#F4F1EA]">
              Expedition Boarding Pass & Official Voucher
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#7C8B96] hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Ticket Body */}
        <div id="printable-boarding-pass" className="p-6 md:p-8 space-y-6">
          {/* Brand & DOT Top Ribbon */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4 gap-2">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#F26A4F] font-semibold">
                Holiday Travelers Travel and Tours Inc
              </p>
              <h3 className="font-serif text-2xl text-[#F4F1EA] font-semibold">
                {booking.packageTitle}
              </h3>
            </div>
            <div className="text-left sm:text-right">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> DOT-ACCR-RO7-2026-8819
              </span>
              <p className="text-[11px] text-[#7C8B96] mt-1 font-mono">
                Booking ID: <span className="text-[#F4F1EA] font-bold">{booking.id}</span>
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-[#070B0E] p-3 rounded-xl border border-white/5">
              <p className="text-xs text-[#7C8B96] flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#F26A4F]" /> Lead Passenger
              </p>
              <p className="text-[#F4F1EA] font-medium mt-0.5 truncate">{booking.leadGuestName}</p>
            </div>

            <div className="bg-[#070B0E] p-3 rounded-xl border border-white/5">
              <p className="text-xs text-[#7C8B96] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#F26A4F]" /> Travel Date
              </p>
              <p className="text-[#F4F1EA] font-medium mt-0.5">{booking.travelDate}</p>
            </div>

            <div className="bg-[#070B0E] p-3 rounded-xl border border-white/5">
              <p className="text-xs text-[#7C8B96] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#F26A4F]" /> Destination
              </p>
              <p className="text-[#F4F1EA] font-medium mt-0.5 truncate">{booking.destination}</p>
            </div>

            <div className="bg-[#070B0E] p-3 rounded-xl border border-white/5">
              <p className="text-xs text-[#7C8B96]">Total Guests</p>
              <p className="text-[#F4F1EA] font-medium mt-0.5">{booking.guestCount} Persons</p>
            </div>

            <div className="bg-[#070B0E] p-3 rounded-xl border border-white/5">
              <p className="text-xs text-[#7C8B96]">Booking Status</p>
              <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                booking.status === "Confirmed"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
              }`}>
                {booking.status}
              </span>
            </div>

            <div className="bg-[#070B0E] p-3 rounded-xl border border-white/5">
              <p className="text-xs text-[#7C8B96]">Payment Status</p>
              <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                booking.paymentStatus === "Fully Paid"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-amber-500/10 text-amber-400"
              }`}>
                {booking.paymentStatus}
              </span>
            </div>
          </div>

          {/* Passenger Manifest Snapshot */}
          <div className="bg-[#070B0E] p-4 rounded-xl border border-white/5 space-y-2">
            <p className="text-xs font-semibold text-[#F4F1EA] uppercase tracking-wider">
              Manifest & Coast Guard (PCG) Registry ({booking.passengers.length} Registered)
            </p>
            <div className="divide-y divide-white/5 text-xs">
              {booking.passengers.map((pax, idx) => (
                <div key={pax.id} className="py-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[#7C8B96]">{idx + 1}.</span>
                    <span className="text-[#F4F1EA] font-medium">{pax.fullName}</span>
                    <span className="text-[#7C8B96]">({pax.age}y, {pax.nationality})</span>
                    {pax.medicalOrDietaryAlert && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                        {pax.medicalOrDietaryAlert}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {pax.checkedIn ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Checked In
                      </span>
                    ) : (
                      <span className="text-[#7C8B96]">Awaiting Boarding</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-sm font-semibold text-[#F4F1EA]">Official Coast Guard Terminal QR</p>
              <p className="text-xs text-[#7C8B96] max-w-xs">
                Scan at the port departure dock or show to your assigned field expedition guide upon boarding.
              </p>
              <p className="text-[11px] font-mono text-[#F26A4F] pt-1">
                REF: {booking.id} • PCG PASS-OK
              </p>
            </div>
            {qrDataUrl && (
              <div className="p-2 bg-white rounded-xl shadow-md">
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
        <div className="bg-[#0E151A] px-6 py-4 border-t border-white/10 flex items-center justify-between">
          <p className="text-xs text-[#7C8B96]">
            Complies with RA 10173 Philippine Data Privacy Act
          </p>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#F4F1EA] text-sm font-medium transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print Voucher / Pass
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#F26A4F] hover:bg-[#FF765B] text-white text-sm font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
