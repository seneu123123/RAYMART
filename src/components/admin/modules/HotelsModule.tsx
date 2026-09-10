import React, { useState } from "react";
import { Hotel, Calendar, MapPin, CheckCircle2, User, KeyRound, Coffee } from "lucide-react";
import { HotelReservation } from "../../../types";
import { StorageService } from "../../../services/storage";

export const HotelsModule: React.FC = () => {
  const [hotels, setHotels] = useState<HotelReservation[]>(StorageService.getHotelReservations());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-[#F4F1EA] font-bold">
            Hotel & Luxury Resort Accommodations
          </h2>
          <p className="text-xs text-[#7C8B96]">
            Pre-booked luxury island bungalows, cliffside villas, and boutique heritage suites
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          {hotels.length} Active Vouchers
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {hotels.map((res) => (
          <div
            key={res.id}
            className="bg-[#0B1014] border border-white/10 rounded-2xl p-6 space-y-4 shadow-lg hover:border-[#F26A4F]/40 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-[#F26A4F] font-bold">
                  {res.destination}
                </span>
                <h3 className="font-serif text-xl text-[#F4F1EA] font-bold mt-0.5">
                  {res.hotelName}
                </h3>
                <p className="text-xs text-[#7C8B96]">{res.roomType}</p>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                {res.status}
              </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#070B0E] rounded-xl border border-white/5">
                <p className="text-[#7C8B96] flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#F26A4F]" /> Guest Name
                </p>
                <p className="text-[#F4F1EA] font-medium truncate mt-0.5">{res.leadGuestName}</p>
              </div>

              <div className="p-3 bg-[#070B0E] rounded-xl border border-white/5">
                <p className="text-[#7C8B96] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#F26A4F]" /> Check-In / Out
                </p>
                <p className="text-[#F4F1EA] font-medium mt-0.5">
                  {res.checkInDate} to {res.checkOutDate}
                </p>
              </div>

              <div className="p-3 bg-[#070B0E] rounded-xl border border-white/5">
                <p className="text-[#7C8B96] flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" /> Voucher Code
                </p>
                <p className="font-mono text-[#F4F1EA] font-bold mt-0.5">{res.confirmationCode}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5 text-[#7C8B96]">
              <div className="flex items-center gap-2">
                <Coffee className="w-3.5 h-3.5 text-amber-400" />
                <span>{res.breakfastIncluded ? "Full Island Breakfast Buffet Included" : "Room Only"}</span>
              </div>
              <span className="font-mono text-emerald-400 font-medium">Linked to {res.bookingId}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
