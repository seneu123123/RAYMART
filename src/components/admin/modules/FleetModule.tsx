import React, { useState } from "react";
import { Anchor, ShieldCheck, Wrench, Navigation, CheckCircle2, Clock, MapPin } from "lucide-react";
import { FleetAsset } from "../../../types";
import { StorageService } from "../../../services/storage";

export const FleetModule: React.FC = () => {
  const [fleet, setFleet] = useState<FleetAsset[]>(StorageService.getFleet());

  const handleUpdateStatus = (id: string, newStatus: FleetAsset["status"]) => {
    const asset = fleet.find((f) => f.id === id);
    if (!asset) return;
    const updated = { ...asset, status: newStatus };
    StorageService.updateFleetAsset(updated);
    setFleet(StorageService.getFleet());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-[#F4F1EA] font-bold">
            Marine Fleet & Overland Logistics Assets
          </h2>
          <p className="text-xs text-[#7C8B96]">
            Coast Guard accredited outrigger bancas, power catamarans, and luxury overland transit units
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-mono">
            {fleet.length} Total Deployed Assets
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fleet.map((vessel) => {
          const isExpedition = vessel.status === "On Expedition";
          const isAvailable = vessel.status === "Available";
          const isMaintenance = vessel.status.includes("Maintenance");

          return (
            <div
              key={vessel.id}
              className="bg-[#0B1014] border border-white/10 rounded-2xl p-6 space-y-4 shadow-lg hover:border-[#F26A4F]/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-[#F26A4F] font-semibold">
                      {vessel.code} • {vessel.type}
                    </span>
                    <h3 className="font-serif text-xl text-[#F4F1EA] font-bold mt-0.5">
                      {vessel.name}
                    </h3>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                      isAvailable
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : isExpedition
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    }`}
                  >
                    {vessel.status}
                  </span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-[#070B0E] rounded-xl border border-white/5">
                    <p className="text-[#7C8B96]">Licensed Capacity</p>
                    <p className="text-[#F4F1EA] font-medium">{vessel.capacityPax} Pax</p>
                  </div>
                  <div className="p-2.5 bg-[#070B0E] rounded-xl border border-white/5">
                    <p className="text-[#7C8B96]">Master / Captain</p>
                    <p className="text-[#F4F1EA] font-medium truncate">{vessel.captainOrDriver}</p>
                  </div>
                </div>

                {/* Location & PCG Certificate */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-[#D1CCC0]">
                    <MapPin className="w-3.5 h-3.5 text-[#F26A4F]" />
                    <span>Home Harbor: {vessel.currentLocation}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#7C8B96]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>PCG Seaworthiness Valid until {vessel.seaworthinessExpiry}</span>
                  </div>
                </div>
              </div>

              {/* Status Switcher Control */}
              <div className="pt-3 border-t border-white/5">
                <label className="block text-[10px] text-[#7C8B96] uppercase mb-1">
                  Dispatch Action / Status
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => handleUpdateStatus(vessel.id, "Available")}
                    className={`py-1.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                      vessel.status === "Available"
                        ? "bg-emerald-500 text-white"
                        : "bg-white/5 text-[#7C8B96] hover:text-white"
                    }`}
                  >
                    Dock / Ready
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(vessel.id, "On Expedition")}
                    className={`py-1.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                      vessel.status === "On Expedition"
                        ? "bg-blue-500 text-white"
                        : "bg-white/5 text-[#7C8B96] hover:text-white"
                    }`}
                  >
                    Deploy Sea
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(vessel.id, "Under Maintenance")}
                    className={`py-1.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                      vessel.status === "Under Maintenance"
                        ? "bg-amber-500 text-white"
                        : "bg-white/5 text-[#7C8B96] hover:text-white"
                    }`}
                  >
                    Dry Dock
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
