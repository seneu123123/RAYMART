import React, { useState } from "react";
import { ClipboardList, CheckCircle2, QrCode, Printer, AlertTriangle, ShieldCheck, Search, Users } from "lucide-react";
import { Booking } from "../../../types";
import { StorageService } from "../../../services/storage";

interface ManifestModuleProps {
  onViewQR: (booking: Booking) => void;
}

export const ManifestModule: React.FC<ManifestModuleProps> = ({ onViewQR }) => {
  const [bookings, setBookings] = useState<Booking[]>(StorageService.getBookings());
  const [selectedBookingId, setSelectedBookingId] = useState<string>(bookings[0]?.id || "");
  const [search, setSearch] = useState("");

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId) || bookings[0];

  const handleToggleCheckIn = (passengerId: string) => {
    if (!selectedBooking) return;

    const updatedPassengers = selectedBooking.passengers.map((p) =>
      p.id === passengerId ? { ...p, checkedIn: !p.checkedIn } : p
    );

    const updatedBooking = { ...selectedBooking, passengers: updatedPassengers };
    StorageService.updateBooking(updatedBooking);
    setBookings(StorageService.getBookings());
  };

  const handlePrintManifest = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-[#F4F1EA] font-bold">
            Philippine Coast Guard (PCG) Passenger Manifest
          </h2>
          <p className="text-xs text-[#7C8B96]">
            Statutory marine manifest registry compliant with PCG Memorandum Circular 03-14 and RA 10173
          </p>
        </div>
        <button
          onClick={handlePrintManifest}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Manifest for Coast Guard</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Charter Selector */}
        <div className="bg-[#0B1014] border border-white/10 rounded-2xl p-4 space-y-3">
          <h3 className="text-xs uppercase tracking-widest text-[#7C8B96] font-semibold px-2">
            Select Active Charter
          </h3>

          <div className="space-y-2">
            {bookings.map((b) => {
              const isSelected = selectedBooking?.id === b.id;
              const checkedInCount = b.passengers.filter((p) => p.checkedIn).length;
              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBookingId(b.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#F26A4F]/10 border-[#F26A4F] text-[#F4F1EA]"
                      : "bg-[#070B0E] border-white/5 text-[#D1CCC0] hover:bg-white/5"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-[#F26A4F]">{b.id}</span>
                    <span className="text-[10px] text-[#7C8B96]">{b.travelDate}</span>
                  </div>
                  <p className="font-semibold text-xs mt-1 truncate">{b.leadGuestName}</p>
                  <p className="text-[11px] text-[#7C8B96] truncate">{b.packageTitle}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className="text-[#7C8B96]">{b.guestCount} Guests</span>
                    <span className="text-emerald-400 font-medium">
                      {checkedInCount}/{b.passengers.length} Boarded
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Manifest Detail Sheet */}
        {selectedBooking && (
          <div className="lg:col-span-2 bg-[#0B1014] border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#F26A4F] font-bold">
                  Official PCG Manifest Entry
                </span>
                <h3 className="font-serif text-2xl text-[#F4F1EA] font-bold mt-0.5">
                  {selectedBooking.leadGuestName} &amp; Party
                </h3>
                <p className="text-xs text-[#7C8B96]">
                  Charter ID: <span className="font-mono text-[#F4F1EA]">{selectedBooking.id}</span> • Departure: {selectedBooking.travelDate}
                </p>
              </div>

              <button
                onClick={() => onViewQR(selectedBooking)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F26A4F] hover:bg-[#FF765B] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>View QR Pass</span>
              </button>
            </div>

            {/* Vessel & Route Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-[#070B0E] rounded-xl border border-white/5">
                <p className="text-[#7C8B96]">Destination</p>
                <p className="text-[#F4F1EA] font-semibold mt-0.5">{selectedBooking.destination}</p>
              </div>
              <div className="p-3 bg-[#070B0E] rounded-xl border border-white/5">
                <p className="text-[#7C8B96]">Assigned Vessel</p>
                <p className="text-[#F4F1EA] font-semibold mt-0.5">M/V Kalayaan Star</p>
              </div>
              <div className="p-3 bg-[#070B0E] rounded-xl border border-white/5">
                <p className="text-[#7C8B96]">Assigned Master Guide</p>
                <p className="text-[#F4F1EA] font-semibold mt-0.5">{selectedBooking.assignedGuideName || "Field Guide"}</p>
              </div>
              <div className="p-3 bg-[#070B0E] rounded-xl border border-white/5">
                <p className="text-[#7C8B96]">PCG Status</p>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold">
                  Boarding Cleared
                </span>
              </div>
            </div>

            {/* Passenger Manifest Roster */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-widest text-[#7C8B96] font-semibold flex items-center justify-between">
                <span>Passenger Roster ({selectedBooking.passengers.length} Registered)</span>
                <span className="text-[10px] text-emerald-400">Click to toggle Boarded status</span>
              </h4>

              <div className="overflow-x-auto rounded-xl border border-white/5">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#070B0E] text-[#7C8B96] border-b border-white/10 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-2.5">#</th>
                      <th className="px-4 py-2.5">Passenger Name</th>
                      <th className="px-4 py-2.5">Age / Gender</th>
                      <th className="px-4 py-2.5">Nationality</th>
                      <th className="px-4 py-2.5">Medical / Dietary</th>
                      <th className="px-4 py-2.5 text-right">Boarding Check-In</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {selectedBooking.passengers.map((pax, idx) => (
                      <tr key={pax.id} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3 text-[#7C8B96] font-mono">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium text-[#F4F1EA]">
                          {pax.fullName}
                          {idx === 0 && (
                            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-[#F26A4F]">
                              Lead
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[#D1CCC0]">{pax.age}y / {pax.gender}</td>
                        <td className="px-4 py-3 text-[#D1CCC0]">{pax.nationality}</td>
                        <td className="px-4 py-3">
                          {pax.medicalOrDietaryAlert ? (
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[10px]">
                              {pax.medicalOrDietaryAlert}
                            </span>
                          ) : (
                            <span className="text-[#7C8B96] text-[10px]">None Declared</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleToggleCheckIn(pax.id)}
                            className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1 ${
                              pax.checkedIn
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : "bg-white/5 text-[#7C8B96] hover:text-white border border-white/5"
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{pax.checkedIn ? "Boarded" : "Check-in"}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
