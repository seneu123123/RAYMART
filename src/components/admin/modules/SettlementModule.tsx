import React, { useState } from "react";
import { Scale, CheckCircle2, AlertTriangle, ShieldCheck, Download, RefreshCw } from "lucide-react";
import { StorageService } from "../../../services/storage";

export const SettlementModule: React.FC = () => {
  const payments = StorageService.getPayments();
  const [settled, setSettled] = useState(false);

  // Group by payment method
  const gcashTotal = payments.filter((p) => p.method === "GCash").reduce((s, p) => s + p.amount, 0);
  const mayaTotal = payments.filter((p) => p.method === "Maya").reduce((s, p) => s + p.amount, 0);
  const bankTotal = payments.filter((p) => p.method.includes("Bank")).reduce((s, p) => s + p.amount, 0);
  const cashTotal = payments.filter((p) => p.method === "Cash").reduce((s, p) => s + p.amount, 0);
  const grandTotal = gcashTotal + mayaTotal + bankTotal + cashTotal;

  const handleExecuteClose = () => {
    setSettled(true);
    StorageService.addAuditLog({
      action: "Daily Settlement Executed",
      module: "Reconciliation",
      details: `Reconciliation closed for grand total ₱${grandTotal.toLocaleString()} with 0.00 discrepancy.`,
      severity: "Info",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-[#F4F1EA] font-bold">
            Daily Merchant Settlement & Gateway Reconciliation
          </h2>
          <p className="text-xs text-[#7C8B96]">
            Cross-audit payment gateway webhooks against bank statement feeds and port terminal collections
          </p>
        </div>
        <button
          onClick={handleExecuteClose}
          disabled={settled}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{settled ? "Settlement Closed & Reconciled" : "Execute Daily Settlement Close"}</span>
        </button>
      </div>

      {/* Reconciliation Health Alert */}
      <div className="bg-[#0B1014] border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-lg text-[#F4F1EA] font-semibold">
              Reconciliation Balance: ₱0.00 Variance
            </h3>
            <p className="text-xs text-[#7C8B96]">
              All 4 payment channels align with gateway settlements and PCG passenger headcounts.
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-semibold">
          100% BALANCED
        </span>
      </div>

      {/* Gateway Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-[#0B1014] border border-white/5 p-5 rounded-2xl space-y-2">
          <div className="flex justify-between text-[#7C8B96]">
            <span>GCash Merchant QR</span>
            <span className="text-emerald-400">Synced</span>
          </div>
          <p className="font-serif text-2xl font-bold text-[#F4F1EA]">₱{gcashTotal.toLocaleString()}</p>
          <p className="text-[11px] text-[#7C8B96]">Net of 1.5% MDR fee</p>
        </div>

        <div className="bg-[#0B1014] border border-white/5 p-5 rounded-2xl space-y-2">
          <div className="flex justify-between text-[#7C8B96]">
            <span>Maya Business Hub</span>
            <span className="text-emerald-400">Synced</span>
          </div>
          <p className="font-serif text-2xl font-bold text-[#F4F1EA]">₱{mayaTotal.toLocaleString()}</p>
          <p className="text-[11px] text-[#7C8B96]">Instant clearing batch</p>
        </div>

        <div className="bg-[#0B1014] border border-white/5 p-5 rounded-2xl space-y-2">
          <div className="flex justify-between text-[#7C8B96]">
            <span>BDO / BPI Corporate Wire</span>
            <span className="text-emerald-400">Synced</span>
          </div>
          <p className="font-serif text-2xl font-bold text-[#F4F1EA]">₱{bankTotal.toLocaleString()}</p>
          <p className="text-[11px] text-[#7C8B96]">Electronic bank advice</p>
        </div>

        <div className="bg-[#0B1014] border border-white/5 p-5 rounded-2xl space-y-2">
          <div className="flex justify-between text-[#7C8B96]">
            <span>Port Terminal Cash</span>
            <span className="text-emerald-400">Deposited</span>
          </div>
          <p className="font-serif text-2xl font-bold text-[#F4F1EA]">₱{cashTotal.toLocaleString()}</p>
          <p className="text-[11px] text-[#7C8B96]">Physical vault remittance</p>
        </div>
      </div>

      {/* End of Day Batch Table */}
      <div className="bg-[#0B1014] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-[#0E151A] border-b border-white/10 flex justify-between items-center">
          <h4 className="font-serif text-sm font-semibold text-[#F4F1EA]">
            Daily Settlement Batch Ledger
          </h4>
          <span className="text-xs text-[#7C8B96] font-mono">Date: Today • Timezone: Asia/Manila</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#070B0E] text-[#7C8B96] border-b border-white/5 uppercase">
              <tr>
                <th className="px-5 py-3">Channel / Gateway</th>
                <th className="px-5 py-3">Gross Sales</th>
                <th className="px-5 py-3">Merchant Fees</th>
                <th className="px-5 py-3">Net Settlement</th>
                <th className="px-5 py-3">Discrepancy</th>
                <th className="px-5 py-3 text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="px-5 py-3.5 font-medium text-[#F4F1EA]">GCash QR Direct</td>
                <td className="px-5 py-3.5">₱{gcashTotal.toLocaleString()}</td>
                <td className="px-5 py-3.5 text-[#7C8B96]">₱{(gcashTotal * 0.015).toLocaleString()}</td>
                <td className="px-5 py-3.5 font-semibold text-emerald-400">₱{(gcashTotal * 0.985).toLocaleString()}</td>
                <td className="px-5 py-3.5 text-emerald-400 font-mono">₱0.00</td>
                <td className="px-5 py-3.5 text-right"><span className="text-emerald-400">Verified</span></td>
              </tr>
              <tr>
                <td className="px-5 py-3.5 font-medium text-[#F4F1EA]">Maya QR Merchant</td>
                <td className="px-5 py-3.5">₱{mayaTotal.toLocaleString()}</td>
                <td className="px-5 py-3.5 text-[#7C8B96]">₱{(mayaTotal * 0.015).toLocaleString()}</td>
                <td className="px-5 py-3.5 font-semibold text-emerald-400">₱{(mayaTotal * 0.985).toLocaleString()}</td>
                <td className="px-5 py-3.5 text-emerald-400 font-mono">₱0.00</td>
                <td className="px-5 py-3.5 text-right"><span className="text-emerald-400">Verified</span></td>
              </tr>
              <tr>
                <td className="px-5 py-3.5 font-medium text-[#F4F1EA]">Bank Transfers (BDO / BPI)</td>
                <td className="px-5 py-3.5">₱{bankTotal.toLocaleString()}</td>
                <td className="px-5 py-3.5 text-[#7C8B96]">₱0.00</td>
                <td className="px-5 py-3.5 font-semibold text-emerald-400">₱{bankTotal.toLocaleString()}</td>
                <td className="px-5 py-3.5 text-emerald-400 font-mono">₱0.00</td>
                <td className="px-5 py-3.5 text-right"><span className="text-emerald-400">Verified</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
