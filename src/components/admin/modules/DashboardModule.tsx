import React from "react";
import {
  TrendingUp,
  Users,
  Anchor,
  ShieldCheck,
  Calendar,
  CreditCard,
  AlertTriangle,
  QrCode,
  ArrowRight,
} from "lucide-react";
import { Booking, UserAccount } from "../../../types";
import { StorageService } from "../../../services/storage";

interface DashboardModuleProps {
  currentUser: UserAccount;
  onViewQR: (booking: Booking) => void;
  onSelectModule: (moduleKey: any) => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  currentUser,
  onViewQR,
  onSelectModule,
}) => {
  const bookings = StorageService.getBookings();
  const fleet = StorageService.getFleet();
  const payments = StorageService.getPayments();
  const weather = StorageService.getWeather();

  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);
  const activeCharters = fleet.filter((f) => f.status === "On Expedition").length;
  const totalGuests = bookings.reduce((acc, b) => acc + b.guestCount, 0);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B1014] border border-white/10 p-6 rounded-2xl">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#F26A4F] font-bold">
            Philippine Central Operations Command
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#F4F1EA] font-bold mt-1">
            Mabuhay, {currentUser.name}
          </h2>
          <p className="text-xs text-[#7C8B96] mt-1">
            Logged in as <span className="text-[#F4F1EA] font-semibold">{currentUser.role}</span>. All port departures from Coron, El Nido, and Mactan are currently cleared.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onSelectModule("manifest")}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-[#F4F1EA] transition-colors cursor-pointer"
          >
            PCG Manifest Check
          </button>
          <button
            onClick={() => onSelectModule("billing")}
            className="px-4 py-2 rounded-xl bg-[#F26A4F] hover:bg-[#FF765B] text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            View Settlement
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0B1014] border border-white/5 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-[#7C8B96]">
            <span>Total Collected Revenue</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#F4F1EA]">
            ₱{totalRevenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +18.4% vs last cycle
          </p>
        </div>

        <div className="bg-[#0B1014] border border-white/5 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-[#7C8B96]">
            <span>Active Bookings</span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#F4F1EA]">
            {bookings.length} Charters
          </div>
          <p className="text-[11px] text-[#7C8B96]">{totalGuests} Manifested Passengers</p>
        </div>

        <div className="bg-[#0B1014] border border-white/5 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-[#7C8B96]">
            <span>Vessels On Expedition</span>
            <Anchor className="w-4 h-4 text-[#F26A4F]" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#F4F1EA]">
            {activeCharters} / {fleet.length} Assets
          </div>
          <p className="text-[11px] text-emerald-400">All transponders active</p>
        </div>

        <div className="bg-[#0B1014] border border-white/5 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-[#7C8B96]">
            <span>Regulatory Clearance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-serif text-2xl font-bold text-emerald-400">
            100% Compliant
          </div>
          <p className="text-[11px] text-[#7C8B96]">DOT-ACCR-RO7-2026-8819</p>
        </div>
      </div>

      {/* Grid: Recent Bookings & Sea Weather Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings List (2 cols) */}
        <div className="lg:col-span-2 bg-[#0B1014] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg text-[#F4F1EA] font-semibold">
                Active Expedition Charters
              </h3>
              <p className="text-xs text-[#7C8B96]">
                Real-time booking registry with PCG QR boarding access
              </p>
            </div>
            <button
              onClick={() => onSelectModule("manifest")}
              className="text-xs text-[#F26A4F] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-white/5 text-xs">
            {bookings.slice(0, 5).map((b) => (
              <div key={b.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#F26A4F] font-bold">{b.id}</span>
                    <span className="text-[#F4F1EA] font-medium">{b.leadGuestName}</span>
                    <span className="text-[#7C8B96]">({b.guestCount} pax)</span>
                  </div>
                  <p className="text-[#7C8B96]">{b.packageTitle} • Travel: {b.travelDate}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                    b.status === "Confirmed"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                  }`}>
                    {b.status}
                  </span>

                  <button
                    onClick={() => onViewQR(b)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#D1CCC0] hover:text-[#F4F1EA] transition-colors cursor-pointer"
                    title="View QR Boarding Pass"
                  >
                    <QrCode className="w-4 h-4 text-[#F26A4F]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Weather & Fleet Radar (1 col) */}
        <div className="bg-[#0B1014] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg text-[#F4F1EA] font-semibold">
                Island Fleet Stations
              </h3>
              <p className="text-xs text-[#7C8B96]">Live PAGASA / PCG telemetry</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <div className="space-y-3">
            {weather.slice(0, 4).map((w) => (
              <div key={w.destination} className="p-3 bg-[#070B0E] rounded-xl border border-white/5 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#F4F1EA]">{w.destination}</span>
                  <span className="text-blue-400">{w.temperatureC.toFixed(0)}°C</span>
                </div>
                <div className="flex justify-between text-[11px] text-[#7C8B96]">
                  <span>{w.seaCondition} • Wave: {w.waveHeightM}m</span>
                  <span className="text-emerald-400">PCG Cleared</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => onSelectModule("fleet")}
              className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-[#D1CCC0] font-medium transition-colors cursor-pointer text-center"
            >
              Open Fleet Maintenance Ledger
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
