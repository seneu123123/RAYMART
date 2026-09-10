import React, { useState } from "react";
import { Receipt, Plus, CreditCard, CheckCircle2, FileText, Search, Printer, X } from "lucide-react";
import { PaymentTransaction, Booking } from "../../../types";
import { StorageService } from "../../../services/storage";

export const BillingModule: React.FC = () => {
  const [payments, setPayments] = useState<PaymentTransaction[]>(StorageService.getPayments());
  const [bookings] = useState<Booking[]>(StorageService.getBookings());
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [birModalPayment, setBirModalPayment] = useState<PaymentTransaction | null>(null);

  // Form State
  const [selectedBookingId, setSelectedBookingId] = useState(bookings[0]?.id || "");
  const [amount, setAmount] = useState(25000);
  const [method, setMethod] = useState<PaymentTransaction["method"]>("GCash");
  const [type, setType] = useState<PaymentTransaction["type"]>("Downpayment (30%)");
  const [refNo, setRefNo] = useState("");

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

  const handleLogPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const booking = bookings.find((b) => b.id === selectedBookingId);
    if (!booking) return;

    const newPayment: PaymentTransaction = {
      id: `PAY-${Date.now().toString(36).toUpperCase()}`,
      bookingId: booking.id,
      guestName: booking.leadGuestName,
      amount,
      type,
      method,
      referenceNumber: refNo || `${method.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      status: "Verified",
      verifiedBy: "Finance Auditor",
      bir2307Generated: true,
    };

    StorageService.addPayment(newPayment);
    setPayments(StorageService.getPayments());
    setLogModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-[#F4F1EA] font-bold">
            Billing, Invoices & Tax Withholding (BIR 2307)
          </h2>
          <p className="text-xs text-[#7C8B96]">
            Philippine Bureau of Internal Revenue (BIR) compliant transaction ledger and gateway reconciliation
          </p>
        </div>
        <button
          onClick={() => setLogModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F26A4F] hover:bg-[#FF765B] text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Record Client Payment</span>
        </button>
      </div>

      {/* Summary Stat Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[#0B1014] rounded-2xl border border-white/5 space-y-1">
          <p className="text-xs text-[#7C8B96]">Total Collections</p>
          <p className="font-serif text-2xl font-bold text-[#F4F1EA]">
            ₱{totalCollected.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-400">All gateway receipts reconciled</p>
        </div>
        <div className="p-4 bg-[#0B1014] rounded-2xl border border-white/5 space-y-1">
          <p className="text-xs text-[#7C8B96]">Mandatory Downpayments (30%)</p>
          <p className="font-serif text-2xl font-bold text-[#F26A4F]">
            ₱{payments.filter((p) => p.type.includes("Downpayment")).reduce((s, p) => s + p.amount, 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-[#7C8B96]">Vessel slots locked</p>
        </div>
        <div className="p-4 bg-[#0B1014] rounded-2xl border border-white/5 space-y-1">
          <p className="text-xs text-[#7C8B96]">BIR Form 2307 Compliance</p>
          <p className="font-serif text-2xl font-bold text-blue-400">
            {payments.filter((p) => p.bir2307Generated).length} / {payments.length} Filed
          </p>
          <p className="text-[11px] text-[#7C8B96]">Certificate of Creditable Tax Withheld</p>
        </div>
      </div>

      {/* Payments Ledger Table */}
      <div className="bg-[#0B1014] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#0E151A] text-[#7C8B96] border-b border-white/10 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Transaction Ref</th>
                <th className="px-5 py-3.5">Charter ID</th>
                <th className="px-5 py-3.5">Lead Guest</th>
                <th className="px-5 py-3.5">Gateway / Method</th>
                <th className="px-5 py-3.5">Payment Type</th>
                <th className="px-5 py-3.5">Amount (PHP)</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Tax Cert</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-mono text-[#F4F1EA] font-semibold">{p.referenceNumber}</p>
                    <p className="text-[10px] text-[#7C8B96]">{p.timestamp}</p>
                  </td>
                  <td className="px-5 py-4 font-mono text-[#F26A4F]">{p.bookingId}</td>
                  <td className="px-5 py-4 font-medium text-[#F4F1EA]">{p.guestName}</td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-[11px] text-[#D1CCC0]">
                      {p.method}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[#7C8B96]">{p.type}</td>
                  <td className="px-5 py-4 font-serif text-sm font-bold text-[#F4F1EA]">
                    ₱{p.amount.toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium">
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => setBirModalPayment(p)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>BIR 2307</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Payment Modal */}
      {logModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-lg bg-[#0B1014] border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-serif text-lg text-[#F4F1EA] font-semibold">Record Payment</h3>
              <button onClick={() => setLogModalOpen(false)} className="text-[#7C8B96] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogPayment} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#D1CCC0] mb-1">Select Charter / Booking *</label>
                <select
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                  className="w-full bg-[#070B0E] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#F4F1EA]"
                >
                  {bookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.id} - {b.leadGuestName} (₱{b.balanceAmount.toLocaleString()} bal)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#D1CCC0] mb-1">Payment Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-[#070B0E] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#F4F1EA]"
                  >
                    <option value="Downpayment (30%)">Downpayment (30%)</option>
                    <option value="Balance Settlement (70%)">Balance Settlement (70%)</option>
                    <option value="Full Payment">Full Payment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#D1CCC0] mb-1">Gateway Method</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as any)}
                    className="w-full bg-[#070B0E] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#F4F1EA]"
                  >
                    <option value="GCash">GCash</option>
                    <option value="Maya">Maya</option>
                    <option value="Bank Transfer (BDO/BPI)">Bank Transfer (BDO/BPI)</option>
                    <option value="Cash">Cash at Port</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#D1CCC0] mb-1">Amount (PHP) *</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-[#070B0E] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#F4F1EA]"
                  />
                </div>
                <div>
                  <label className="block text-[#D1CCC0] mb-1">Transaction Ref / Trace</label>
                  <input
                    type="text"
                    placeholder="e.g. GC-99482184"
                    value={refNo}
                    onChange={(e) => setRefNo(e.target.value)}
                    className="w-full bg-[#070B0E] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#F4F1EA]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setLogModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#F26A4F] hover:bg-[#FF765B] text-white font-semibold"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BIR Form 2307 Preview Modal */}
      {birModalPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-2xl bg-[#0B1014] border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="font-serif text-lg text-[#F4F1EA] font-semibold">
                  BIR Form No. 2307 Certificate of Creditable Tax Withheld
                </h3>
              </div>
              <button onClick={() => setBirModalPayment(null)} className="text-[#7C8B96] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#070B0E] p-5 rounded-xl border border-white/5 space-y-4 text-xs">
              <div className="flex justify-between border-b border-white/5 pb-2 text-[#7C8B96]">
                <span>Payor: Holiday Travelers Travel and Tours Inc</span>
                <span>TIN: 009-847-219-000</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[#7C8B96]">Payee (Passenger / Client):</p>
                  <p className="text-sm font-semibold text-[#F4F1EA]">{birModalPayment.guestName}</p>
                  <p className="text-[11px] text-[#7C8B96]">Booking Ref: {birModalPayment.bookingId}</p>
                </div>
                <div>
                  <p className="text-[#7C8B96]">Transaction Reference:</p>
                  <p className="text-sm font-mono text-[#F4F1EA]">{birModalPayment.referenceNumber}</p>
                  <p className="text-[11px] text-[#7C8B96]">Date: {birModalPayment.timestamp}</p>
                </div>
              </div>

              <div className="border border-white/10 rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-[#D1CCC0]">
                  <span>Gross Travel Payments:</span>
                  <span className="font-serif text-sm font-semibold">₱{birModalPayment.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#7C8B96]">
                  <span>Creditable Expanded Withholding Tax (EWT 2%):</span>
                  <span>₱{(birModalPayment.amount * 0.02).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-semibold pt-1 border-t border-white/5">
                  <span>Net Tax Remittance Basis:</span>
                  <span>₱{(birModalPayment.amount * 0.98).toLocaleString()}</span>
                </div>
              </div>

              <p className="text-[10px] text-[#7C8B96]">
                Certified true and correct in accordance with Republic Act No. 8424 (National Internal Revenue Code of 1997) as amended by TRAIN & CREATE Law.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print BIR Form
              </button>
              <button
                onClick={() => setBirModalPayment(null)}
                className="px-4 py-2 rounded-xl bg-[#F26A4F] text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
