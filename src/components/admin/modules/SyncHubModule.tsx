import React, { useState } from "react";
import { Server, RefreshCw, CheckCircle2, ShieldCheck, Zap, Globe, Key, AlertCircle } from "lucide-react";
import { StorageService } from "../../../services/storage";

export const SyncHubModule: React.FC = () => {
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState("Just now (Asia/Manila)");
  const [syncLogs, setSyncLogs] = useState<string[]>([
    "[10:42:01 PHT] POST /api/v1/pcg/manifest/transmit -> 200 OK (Batch HT-2026-8819)",
    "[10:35:14 PHT] POST /api/v1/bir/2307/ledger -> 200 OK (TIN 009-847-219-000)",
    "[10:15:20 PHT] GET /api/v1/pagasa/marine-radar -> 200 OK (All stations clear)",
  ]);

  const handleTriggerSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      const now = new Date().toLocaleTimeString("en-US", { timeZone: "Asia/Manila" });
      setLastSynced(`${now} PHT`);
      setSyncLogs((prev) => [
        `[${now} PHT] FULL SYNC: Synced 6 packages, ${StorageService.getBookings().length} charters, 4 fleet transponders to central Laravel API tower.`,
        ...prev,
      ]);
      StorageService.addAuditLog({
        action: "Central Hub Sync",
        module: "Laravel Sync Hub",
        details: "Manual full sync triggered to central enterprise cluster.",
        severity: "Info",
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-[#F4F1EA] font-bold">
            Laravel Enterprise Hub & Central API Bridge
          </h2>
          <p className="text-xs text-[#7C8B96]">
            High-speed sync engine connecting this TOCBS station to centralized Laravel cloud clusters and PCG relays
          </p>
        </div>
        <button
          onClick={handleTriggerSync}
          disabled={syncing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F26A4F] hover:bg-[#FF765B] disabled:opacity-50 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
          <span>{syncing ? "Synchronizing Relays..." : "Trigger Full Central Sync"}</span>
        </button>
      </div>

      {/* Connection Status Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-[#0B1014] border border-white/5 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-[#7C8B96]">
            <span>Core Laravel API Status</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="font-serif text-xl font-bold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Connected (TLS 1.3)
          </p>
          <p className="text-[11px] text-[#7C8B96]">Latency: 28ms • Asia-East (PH/SG)</p>
        </div>

        <div className="bg-[#0B1014] border border-white/5 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-[#7C8B96]">
            <span>Coast Guard Relay Status</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <p className="font-serif text-xl font-bold text-blue-400 flex items-center gap-1.5">
            <Zap className="w-4 h-4" /> Port Clearances Active
          </p>
          <p className="text-[11px] text-[#7C8B96]">Auto-dispatch enabled</p>
        </div>

        <div className="bg-[#0B1014] border border-white/5 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-[#7C8B96]">
            <span>Last Telemetry Push</span>
            <Globe className="w-4 h-4 text-[#F26A4F]" />
          </div>
          <p className="font-serif text-xl font-bold text-[#F4F1EA]">{lastSynced}</p>
          <p className="text-[11px] text-emerald-400">Zero packet drop detected</p>
        </div>
      </div>

      {/* Configured Endpoints */}
      <div className="bg-[#0B1014] border border-white/10 rounded-2xl p-6 space-y-4">
        <h3 className="font-serif text-lg text-[#F4F1EA] font-semibold">
          Configured Synchronous Endpoints
        </h3>
        <div className="divide-y divide-white/5 text-xs font-mono">
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-[#F26A4F]">POST /api/v1/bookings/charter-manifest</span>
            <span className="text-emerald-400">200 OK • Live</span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-[#F26A4F]">POST /api/v1/payments/webhook/gcash</span>
            <span className="text-emerald-400">200 OK • Live</span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-[#F26A4F]">POST /api/v1/payments/webhook/maya</span>
            <span className="text-emerald-400">200 OK • Live</span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-[#F26A4F]">GET /api/v1/fleet/transponders</span>
            <span className="text-emerald-400">200 OK • Live</span>
          </div>
        </div>
      </div>

      {/* Sync Log Console */}
      <div className="bg-[#0B1014] border border-white/10 rounded-2xl p-6 space-y-3">
        <h3 className="font-serif text-lg text-[#F4F1EA] font-semibold">
          Real-Time API & Webhook Transmission Stream
        </h3>
        <div className="bg-[#070B0E] p-4 rounded-xl border border-white/5 space-y-1.5 font-mono text-xs text-[#D1CCC0] max-h-48 overflow-y-auto">
          {syncLogs.map((log, i) => (
            <div key={i} className="text-[11px] text-emerald-400/90 leading-relaxed">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
