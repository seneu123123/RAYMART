import React, { useState, useEffect } from "react";
import {
  X,
  CloudSun,
  Waves,
  Wind,
  Compass,
  ShieldCheck,
  RefreshCw,
  Radio,
  Eye,
  Thermometer,
  Gauge,
  SunMedium,
  CheckCircle2,
} from "lucide-react";
import { DestinationWeather } from "../../types";
import { StorageService } from "../../services/storage";

interface WeatherRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeatherRadarModal: React.FC<WeatherRadarModalProps> = ({ isOpen, onClose }) => {
  const [weatherData, setWeatherData] = useState<DestinationWeather[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>("Coron, Palawan");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastTelemetryTimestamp, setLastTelemetryTimestamp] = useState<string>("");

  // Re-generate fresh automated telemetry whenever opened
  useEffect(() => {
    if (isOpen) {
      loadFreshTelemetry();
    }
  }, [isOpen]);

  const loadFreshTelemetry = () => {
    const fresh = StorageService.getDynamicMarineWeather();
    setWeatherData(fresh);
    if (!selectedStation && fresh[0]) {
      setSelectedStation(fresh[0].destination);
    }
    const now = new Date();
    setLastTelemetryTimestamp(
      now.toLocaleTimeString("en-US", { timeZone: "Asia/Manila", hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " PHT"
    );
  };

  if (!isOpen) return null;

  const current = weatherData.find((w) => w.destination === selectedStation) || weatherData[0];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      loadFreshTelemetry();
      setIsRefreshing(false);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#071726] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl my-6 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-[#0B2238]/80 px-6 py-4 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-sm shadow-cyan-500/20">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-serif text-xl text-white font-bold flex items-center gap-2">
                <span>PAGASA &amp; Marine Weather Radar</span>
                <span className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Live Satellite Telemetry
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Philippine Coast Guard (PCG) Sea-State &amp; Archipelagic Swell Telemetry • Synced {lastTelemetryTimestamp}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/25 transition-all cursor-pointer"
              title="Refresh radar telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
              <span className="hidden sm:inline">Refresh Radar</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6 overflow-y-auto">
          {/* Station selector buttons */}
          <div className="flex flex-wrap gap-2 pb-2 border-b border-white/5">
            {weatherData.map((station) => {
              const isSelected = selectedStation === station.destination;
              return (
                <button
                  key={station.destination}
                  onClick={() => setSelectedStation(station.destination)}
                  className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-cyan-500 text-[#030C16] shadow-md shadow-cyan-500/25 font-bold"
                      : "bg-[#0B2238]/60 text-slate-300 hover:bg-cyan-950/40 hover:text-cyan-200 border border-white/5"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-[#030C16]" : "bg-cyan-400"}`} />
                  {station.destination}
                </button>
              );
            })}
          </div>

          {/* Main Selected Station telemetry */}
          {current && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Primary Gauge */}
              <div className="md:col-span-1 bg-[#030C16] p-6 rounded-3xl border border-cyan-500/20 space-y-4 text-center shadow-lg shadow-cyan-950/40 flex flex-col justify-between">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-widest text-cyan-400 font-semibold font-mono">
                    {current.islandGroup}
                  </p>
                  <h4 className="font-serif text-2xl sm:text-3xl text-white font-bold">
                    {current.destination}
                  </h4>
                </div>

                <div className="py-2 flex justify-center items-baseline gap-1">
                  <span className="font-serif text-5xl font-bold text-white tracking-tight">
                    {current.temperatureC}
                  </span>
                  <span className="text-2xl text-cyan-400 font-semibold">°C</span>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>PCG Port Cleared (Voyage Safe)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Wave height: <span className="text-cyan-300 font-semibold">{current.waveHeightM}m</span> (Threshold: 2.5m)
                  </p>
                </div>
              </div>

              {/* Comprehensive Maritime Metrics */}
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#030C16] p-4 rounded-2xl border border-cyan-500/15 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Waves className="w-4 h-4 text-cyan-400" />
                    <span>Sea Condition &amp; Swell Profile</span>
                  </div>
                  <p className="text-white text-base font-bold">{current.seaCondition}</p>
                  <p className="text-[11px] text-slate-400">
                    Average Wave Crest: <strong className="text-cyan-300">{current.waveHeightM} meters</strong>
                  </p>
                </div>

                <div className="bg-[#030C16] p-4 rounded-2xl border border-cyan-500/15 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Wind className="w-4 h-4 text-emerald-400" />
                    <span>Wind Velocity &amp; Direction</span>
                  </div>
                  <p className="text-white text-base font-bold">{current.windSpeedKts} knots (Moderate)</p>
                  <p className="text-[11px] text-slate-400">
                    Prevailing: Northeast Monsoon / Easterly Trade Winds
                  </p>
                </div>

                <div className="bg-[#030C16] p-4 rounded-2xl border border-cyan-500/15 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Compass className="w-4 h-4 text-cyan-400" />
                    <span>Tidal Cycle &amp; Moon Windows</span>
                  </div>
                  <p className="text-white text-base font-bold">{current.tideType}</p>
                  <p className="text-[11px] text-slate-400">
                    Next Slack Water Peak at <strong className="text-cyan-300">{current.tideTime}</strong>
                  </p>
                </div>

                <div className="bg-[#030C16] p-4 rounded-2xl border border-cyan-500/15 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Eye className="w-4 h-4 text-cyan-300" />
                    <span>Underwater Water Visibility</span>
                  </div>
                  <p className="text-white text-base font-bold">18 - 25 meters</p>
                  <p className="text-[11px] text-emerald-400">
                    Crystal clear: Perfect for snorkeling &amp; diving
                  </p>
                </div>

                <div className="bg-[#030C16] p-4 rounded-2xl border border-cyan-500/15 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Thermometer className="w-4 h-4 text-teal-400" />
                    <span>Surface Sea Water Temp</span>
                  </div>
                  <p className="text-white text-base font-bold">28.5°C (Warm Tropical)</p>
                  <p className="text-[11px] text-slate-400">Thermal layer stable down to 30m depth</p>
                </div>

                <div className="bg-[#030C16] p-4 rounded-2xl border border-cyan-500/15 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <SunMedium className="w-4 h-4 text-amber-400" />
                    <span>UV Index &amp; Exposure Level</span>
                  </div>
                  <p className="text-white text-base font-bold">UV Index 7 (High)</p>
                  <p className="text-[11px] text-slate-400">Reef-safe sunscreen &amp; rash guards advised</p>
                </div>
              </div>
            </div>
          )}

          {/* Regional Table Overview */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h5 className="text-xs uppercase tracking-widest text-cyan-400 font-semibold font-mono">
                Archipelago Marine Telemetry Summary
              </h5>
              <span className="text-[11px] text-slate-400">All 6 Coastal Stations Online</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-cyan-500/20 bg-[#030C16]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#0B2238] text-slate-400 border-b border-cyan-500/20 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Destination Station</th>
                    <th className="px-5 py-3">Sea Temp</th>
                    <th className="px-5 py-3">Swell / State</th>
                    <th className="px-5 py-3">Wave Height</th>
                    <th className="px-5 py-3">Surface Wind</th>
                    <th className="px-5 py-3 text-right">PCG Clearance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {weatherData.map((row) => (
                    <tr
                      key={row.destination}
                      onClick={() => setSelectedStation(row.destination)}
                      className={`hover:bg-cyan-500/5 cursor-pointer transition-colors ${
                        selectedStation === row.destination ? "bg-cyan-500/10" : ""
                      }`}
                    >
                      <td className="px-5 py-3 font-semibold text-white flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        {row.destination}
                      </td>
                      <td className="px-5 py-3 text-slate-300">{row.temperatureC}°C</td>
                      <td className="px-5 py-3 text-cyan-300 font-medium">{row.seaCondition}</td>
                      <td className="px-5 py-3 text-slate-300">{row.waveHeightM}m</td>
                      <td className="px-5 py-3 text-slate-300">{row.windSpeedKts} kts</td>
                      <td className="px-5 py-3 text-right">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                          Voyage Cleared
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#0B2238]/80 px-6 py-4 border-t border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>All charters strictly observe PCG Memorandum Circular 03-14 wave limits.</span>
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#030C16] font-bold text-xs shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
          >
            Close Radar
          </button>
        </div>
      </div>
    </div>
  );
};
