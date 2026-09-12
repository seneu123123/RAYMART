import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  XCircle,
  Eye,
  Search,
  ZoomIn,
  ZoomOut,
  X,
  ExternalLink,
  Filter,
  FileText,
  User,
  Calendar,
  CreditCard,
  Building2,
  Clock,
  Sparkles,
  ChevronRight,
  Info,
  Check,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import { PaymentTransaction, Booking, UserAccount } from "../../../types";
import { StorageService } from "../../../services/storage";
import { generateMockReceiptCanvas } from "../../../utils/mockReceiptGenerator";

interface PaymentAuditModuleProps {
  currentUser?: UserAccount;
  onViewBookingPass?: (booking: Booking) => void;
  onProceedToManifest?: (bookingId: string) => void;
}

export const PaymentAuditModule: React.FC<PaymentAuditModuleProps> = ({
  currentUser,
  onViewBookingPass,
  onProceedToManifest,
}) => {
  const [payments, setPayments] = useState<PaymentTransaction[]>(() => {
    const raw = StorageService.getPayments();
    // Ensure all payments have visual proof screenshots for inspection
    return raw.map((p) => {
      if (!p.proofImageUrl) {
        const isCropped = p.status === "Needs Re-Photo";
        const isTampered = p.status === "Flagged as Suspect";
        return {
          ...p,
          recipientAccountName: p.recipientAccountName || "John Raymart Dordines",
          recipientAccountNumber: p.recipientAccountNumber || "09466455124",
          proofImageUrl: generateMockReceiptCanvas({
            method: p.method,
            referenceNumber: p.referenceNumber,
            amount: p.amount,
            recipientName: "John Raymart Dordines",
            recipientNumber: "09466455124",
            senderName: p.guestName,
            isCropped,
            isTampered,
          }),
        };
      }
      return p;
    });
  });

  const [bookings] = useState<Booking[]>(StorageService.getBookings());
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "needs_rephoto" | "flagged" | "verified">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<PaymentTransaction | null>(null);

  // Inspector & Action dialogs
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [rephotoModalOpen, setRephotoModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rephotoReason, setRephotoReason] = useState("Reference number cut off or unreadable");
  const [rejectReason, setRejectReason] = useState("Receipt screenshot does not match bank records / detected duplicate transaction reference");
  const [customNote, setCustomNote] = useState("");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const officerName = currentUser?.name || "Brian Jake B. Tallada (Finance Officer)";

  // Filtered Payments
  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.method.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "pending") return p.status === "Pending Verification";
    if (activeTab === "needs_rephoto") return p.status === "Needs Re-Photo";
    if (activeTab === "flagged") return p.status === "Flagged as Suspect";
    if (activeTab === "verified") return p.status === "Verified";
    return true;
  });

  const handleUpdateStatus = (
    paymentId: string,
    newStatus: PaymentTransaction["status"],
    reason?: string,
    notes?: string
  ) => {
    const updatedList = payments.map((p) => {
      if (p.id === paymentId) {
        return {
          ...p,
          status: newStatus,
          verifiedBy: newStatus === "Verified" ? officerName : p.verifiedBy,
          auditReason: reason || p.auditReason,
          auditNotes: notes || p.auditNotes,
        };
      }
      return p;
    });

    setPayments(updatedList);
    StorageService.savePayments(updatedList);

    // Sync booking status if verified
    const matchedPayment = updatedList.find((p) => p.id === paymentId);
    if (matchedPayment) {
      const b = StorageService.getBookingById(matchedPayment.bookingId);
      if (b) {
        if (newStatus === "Verified") {
          b.paymentAuditStatus = "Verified";
          b.status = "Confirmed";
          if (matchedPayment.type.includes("Full")) {
            b.paymentStatus = "Fully Paid";
            b.amountPaid = b.totalAmount;
            b.balanceAmount = 0;
          } else {
            b.paymentStatus = "Downpayment Paid (30%)";
            b.amountPaid = matchedPayment.amount;
            b.balanceAmount = b.totalAmount - matchedPayment.amount;
          }
          if (!b.manifestAuditStatus || b.manifestAuditStatus === "Needs Manifest Submission") {
            b.manifestAuditStatus = "Pending Manifest Review";
          }

          // Trigger client notification for payment verified
          StorageService.addClientNotification({
            bookingId: b.id,
            packageTitle: b.packageTitle,
            type: "payment_verified",
            title: "Payment Certified & Approved",
            message: `Downpayment of ₱${matchedPayment.amount.toLocaleString()} (Ref: ${matchedPayment.referenceNumber}) has been audited & verified. Next step: Onboarding Manifest Verification.`,
            actionLabel: "Verify Manifest",
            priority: "high",
          });
        } else {
          b.paymentAuditStatus = newStatus;
          if (newStatus === "Needs Re-Photo") {
            StorageService.addClientNotification({
              bookingId: b.id,
              packageTitle: b.packageTitle,
              type: "payment_rephoto",
              title: "Payment Proof Re-Photo Requested",
              message: `Auditor note: ${reason || "Please upload an uncropped receipt clearly displaying the full reference number."}`,
              actionLabel: "Re-upload Receipt",
              priority: "urgent",
            });
          }
        }
        StorageService.updateBooking(b);
      }

      // Add to audit trail
      StorageService.addAuditLog({
        action: `PAYMENT_${newStatus.toUpperCase().replace(/\s+/g, "_")}`,
        module: "Payment Audit & Security",
        details: `Payment ${matchedPayment.referenceNumber} (₱${matchedPayment.amount.toLocaleString()}) set to '${newStatus}' by ${officerName}. Reason: ${reason || "Standard Audit"}`,
        severity: newStatus === "Flagged as Suspect" || newStatus === "Rejected" ? "Security Alert" : "Info",
        userName: officerName,
      });
    }

    if (selectedPayment && selectedPayment.id === paymentId) {
      setSelectedPayment(matchedPayment || null);
    }

    setActionSuccessMsg(
      newStatus === "Verified"
        ? `Payment ${matchedPayment?.referenceNumber} certified! Next step: Onboarding Manifest Verification.`
        : `Payment ${matchedPayment?.referenceNumber} updated to: ${newStatus}`
    );
    setTimeout(() => setActionSuccessMsg(null), 3500);

    setRephotoModalOpen(false);
    setRejectModalOpen(false);
  };

  // Preload realistic audit scenario examples for demo testing
  const handleLoadAuditDemoScenarios = () => {
    const demoItems: PaymentTransaction[] = [
      {
        id: "PAY-DEMO-001",
        bookingId: "HT-2026-8819",
        guestName: "Atty. Carlos Mendoza",
        amount: 22200,
        type: "Downpayment (30%)",
        method: "GCash",
        referenceNumber: "1004829104821",
        timestamp: "2026-09-12 14:15",
        status: "Pending Verification",
        proofImageUrl: generateMockReceiptCanvas({
          method: "GCash",
          referenceNumber: "1004829104821",
          amount: 22200,
          senderName: "Carlos Mendoza",
          recipientName: "John Raymart Dordines",
          recipientNumber: "09466455124",
        }),
        recipientAccountName: "John Raymart Dordines",
        recipientAccountNumber: "09466455124",
        auditNotes: "Clean GCash transaction receipt. Reference verified against BSP InstaPay switch.",
      },
      {
        id: "PAY-DEMO-002",
        bookingId: "HT-2026-1042",
        guestName: "Dr. Sofia Rodriguez",
        amount: 13680,
        type: "Downpayment (30%)",
        method: "Maya",
        referenceNumber: "MAYA-2026-CROPPED",
        timestamp: "2026-09-12 13:40",
        status: "Needs Re-Photo",
        auditReason: "Receipt cropped: reference number cut off at bottom",
        proofImageUrl: generateMockReceiptCanvas({
          method: "Maya",
          referenceNumber: "MAYA-2026-CROPPED",
          amount: 13680,
          senderName: "Sofia Rodriguez",
          recipientName: "John Raymart Dordines",
          recipientNumber: "09466455124",
          isCropped: true,
        }),
        recipientAccountName: "John Raymart Dordines",
        recipientAccountNumber: "09466455124",
        auditNotes: "Bottom half of receipt truncated. Cannot confirm full 16-digit Maya trace ID.",
      },
      {
        id: "PAY-DEMO-003",
        bookingId: "HT-2026-4401",
        guestName: "Maria Teresa Santos",
        amount: 14700,
        type: "Downpayment (30%)",
        method: "GCash",
        referenceNumber: "GCASH-DUPLICATE-999",
        timestamp: "2026-09-12 11:20",
        status: "Flagged as Suspect",
        auditReason: "Duplicate reference code and suspicious digital font artifacts detected",
        proofImageUrl: generateMockReceiptCanvas({
          method: "GCash",
          referenceNumber: "GCASH-DUPLICATE-999",
          amount: 14700,
          senderName: "Maria Santos",
          recipientName: "John Raymart Dordines",
          recipientNumber: "09466455124",
          isTampered: true,
        }),
        recipientAccountName: "John Raymart Dordines",
        recipientAccountNumber: "09466455124",
        auditNotes: "Digital artifact analysis detected potential screenshot editing. Reference code was previously submitted.",
      },
    ];

    const merged = [...demoItems, ...payments.filter((p) => !p.id.startsWith("PAY-DEMO-"))];
    setPayments(merged);
    StorageService.savePayments(merged);
    setActionSuccessMsg("Loaded 3 comprehensive payment audit demonstration scenarios!");
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  // Find associated booking for inspection
  const activeBooking = bookings.find((b) => b.id === selectedPayment?.bookingId);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl text-[#F4F1EA] font-bold">
              Payment Audit & Fraud Prevention Desk
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#F26A4F]/15 border border-[#F26A4F]/30 text-[#F26A4F] text-[10px] font-mono font-bold">
              InstaPay • QRPh
            </span>
          </div>
          <p className="text-xs text-[#7C8B96] mt-0.5">
            Audit GCash and Maya transfer receipts sent to <strong>John Raymart Dordines (09466455124)</strong>. Accept, request re-photo, or reject fake receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadAuditDemoScenarios}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-[#D1CCC0] font-medium border border-white/10 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F26A4F]" />
            <span>Load Audit Scenarios</span>
          </button>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-[#0B1014] rounded-2xl border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#7C8B96]">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="font-serif text-2xl font-bold text-amber-400">
            {payments.filter((p) => p.status === "Pending Verification").length}
          </p>
          <p className="text-[10px] text-[#7C8B96]">Awaiting officer clearance</p>
        </div>

        <div className="p-4 bg-[#0B1014] rounded-2xl border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#7C8B96]">
            <span>Needs Re-Photo</span>
            <RotateCcw className="w-4 h-4 text-blue-400" />
          </div>
          <p className="font-serif text-2xl font-bold text-blue-400">
            {payments.filter((p) => p.status === "Needs Re-Photo").length}
          </p>
          <p className="text-[10px] text-[#7C8B96]">Cropped or blurry image</p>
        </div>

        <div className="p-4 bg-[#0B1014] rounded-2xl border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#7C8B96]">
            <span>Flagged / Suspect</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <p className="font-serif text-2xl font-bold text-rose-500">
            {payments.filter((p) => p.status === "Flagged as Suspect").length}
          </p>
          <p className="text-[10px] text-[#7C8B96]">Tampered or duplicate ref</p>
        </div>

        <div className="p-4 bg-[#0B1014] rounded-2xl border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#7C8B96]">
            <span>Verified & Cleared</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="font-serif text-2xl font-bold text-emerald-400">
            {payments.filter((p) => p.status === "Verified").length}
          </p>
          <p className="text-[10px] text-[#7C8B96]">Boarding passes issued</p>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0B1014] p-2.5 rounded-2xl border border-white/5">
        <div className="flex flex-wrap gap-1 text-xs">
          {[
            { key: "all", label: "All Receipts" },
            { key: "pending", label: "Pending (Needs Action)" },
            { key: "needs_rephoto", label: "Re-Photo Requested" },
            { key: "flagged", label: "Flagged / Suspect" },
            { key: "verified", label: "Verified" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? "bg-[#F26A4F] text-white font-semibold"
                  : "text-[#7C8B96] hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-[#7C8B96] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ref #, guest, booking..."
            className="w-full sm:w-64 bg-[#070B0E] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#F4F1EA] placeholder-[#7C8B96] focus:outline-none focus:border-[#F26A4F]"
          />
        </div>
      </div>

      {/* Ledger & Audit Table */}
      <div className="bg-[#0B1014] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#0E151A] text-[#7C8B96] border-b border-white/10 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Screenshot</th>
                <th className="px-4 py-3.5">Reference No.</th>
                <th className="px-4 py-3.5">Charter ID & Guest</th>
                <th className="px-4 py-3.5">Method</th>
                <th className="px-4 py-3.5">Amount</th>
                <th className="px-4 py-3.5">Audit Status</th>
                <th className="px-4 py-3.5 text-right">Audit Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[#7C8B96]">
                    No payment submissions match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Thumbnail */}
                    <td className="px-4 py-3.5">
                      <div
                        onClick={() => {
                          setSelectedPayment(p);
                          setInspectModalOpen(true);
                        }}
                        className="w-12 h-14 bg-white rounded-lg border border-white/10 overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#F26A4F] transition-all relative group flex items-center justify-center"
                        title="Click to Inspect Receipt"
                      >
                        {p.proofImageUrl ? (
                          <img src={p.proofImageUrl} alt="Proof" className="w-full h-full object-cover" />
                        ) : (
                          <FileText className="w-5 h-5 text-gray-400" />
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </td>

                    {/* Reference */}
                    <td className="px-4 py-3.5">
                      <p className="font-mono text-[#F4F1EA] font-bold">{p.referenceNumber}</p>
                      <p className="text-[10px] text-[#7C8B96]">{p.timestamp}</p>
                    </td>

                    {/* Booking & Guest */}
                    <td className="px-4 py-3.5">
                      <p className="font-mono text-[#F26A4F] font-semibold">{p.bookingId}</p>
                      <p className="text-[#D1CCC0] font-medium">{p.guestName}</p>
                    </td>

                    {/* Method */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          p.method === "GCash"
                            ? "bg-[#005CE6]/20 text-[#4D94FF] border border-[#005CE6]/30"
                            : p.method === "Maya"
                            ? "bg-[#00D632]/20 text-[#00E53B] border border-[#00D632]/30"
                            : "bg-white/5 text-[#D1CCC0] border border-white/10"
                        }`}
                      >
                        {p.method}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3.5">
                      <p className="font-serif font-bold text-sm text-[#F4F1EA]">
                        ₱{p.amount.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-[#7C8B96]">{p.type}</p>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                          p.status === "Verified"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : p.status === "Pending Verification"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : p.status === "Needs Re-Photo"
                            ? "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                            : p.status === "Flagged as Suspect"
                            ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                            : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                        }`}
                      >
                        {p.status === "Verified" && <Check className="w-3 h-3" />}
                        {p.status === "Pending Verification" && <Clock className="w-3 h-3" />}
                        {p.status === "Needs Re-Photo" && <RotateCcw className="w-3 h-3" />}
                        {p.status === "Flagged as Suspect" && <ShieldAlert className="w-3 h-3" />}
                        {p.status === "Rejected" && <XCircle className="w-3 h-3" />}
                        <span>{p.status}</span>
                      </span>
                      {p.auditReason && (
                        <p className="text-[10px] text-[#7C8B96] mt-0.5 truncate max-w-[180px]" title={p.auditReason}>
                          {p.auditReason}
                        </p>
                      )}
                    </td>

                    {/* Quick Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedPayment(p);
                            setInspectModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#D1CCC0] text-[11px] font-medium transition-colors cursor-pointer border border-white/5"
                        >
                          Inspect
                        </motion.button>

                        {p.status !== "Verified" && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleUpdateStatus(p.id, "Verified")}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-[11px] font-semibold transition-colors cursor-pointer border border-emerald-500/30"
                            title="Accept Payment & Clear Booking"
                          >
                            Accept
                          </motion.button>
                        )}

                        {p.status === "Verified" && onProceedToManifest && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onProceedToManifest(p.bookingId)}
                            className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[11px] font-semibold transition-colors cursor-pointer border border-cyan-500/30 flex items-center gap-1"
                            title="Proceed to Onboarding Manifest Verification"
                          >
                            <ClipboardList className="w-3 h-3" />
                            <span>Manifest Desk</span>
                          </motion.button>
                        )}

                        {p.status === "Verified" && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedPayment(p);
                              setRephotoModalOpen(true);
                            }}
                            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#7C8B96] text-[11px] cursor-pointer"
                            title="Re-open Audit"
                          >
                            Re-check
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECT RECEIPT & ACTIONS MODAL */}
      {inspectModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-4xl bg-[#0B1014] border border-white/15 rounded-3xl overflow-hidden shadow-2xl my-6 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-[#0E151A] px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#F26A4F]" />
                <div>
                  <h3 className="font-serif text-lg text-[#F4F1EA] font-semibold">
                    Payment Verification & Forensic Inspector
                  </h3>
                  <p className="text-xs text-[#7C8B96]">
                    Ref: <span className="font-mono text-white">{selectedPayment.referenceNumber}</span> • {selectedPayment.method} Transfer
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setInspectModalOpen(false);
                  setZoomLevel(1);
                }}
                className="p-1 rounded-lg text-[#7C8B96] hover:text-white hover:bg-white/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Zoomable Receipt Image */}
              <div className="md:col-span-6 flex flex-col items-center justify-center bg-[#070B0E] p-4 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between w-full mb-3 text-xs text-[#7C8B96]">
                  <span className="font-medium">Uploaded Screenshot View</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.2))}
                      className="p-1 bg-white/5 hover:bg-white/10 rounded text-white"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono text-[10px] w-10 text-center">{Math.round(zoomLevel * 100)}%</span>
                    <button
                      onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                      className="p-1 bg-white/5 hover:bg-white/10 rounded text-white"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="w-full max-h-[420px] overflow-auto flex items-center justify-center bg-gray-900/50 p-2 rounded-xl border border-white/5">
                  <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top center" }} className="transition-transform duration-200">
                    {selectedPayment.proofImageUrl ? (
                      <img
                        src={selectedPayment.proofImageUrl}
                        alt="Receipt Screenshot"
                        className="max-w-full rounded-lg shadow-lg"
                      />
                    ) : (
                      <div className="p-12 text-center text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-2" />
                        <p>No screenshot image uploaded</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Beneficiary Details Verified */}
                <div className="mt-3 w-full bg-white/5 p-2.5 rounded-xl text-[11px] text-[#7C8B96] space-y-1">
                  <p>
                    <span className="text-[#D1CCC0]">Target Beneficiary:</span> {selectedPayment.recipientAccountName || "John Raymart Dordines"}
                  </p>
                  <p>
                    <span className="text-[#D1CCC0]">Account / Mobile:</span> {selectedPayment.recipientAccountNumber || "09466455124"}
                  </p>
                </div>
              </div>

              {/* Right Column: Transaction Details & Decision Console */}
              <div className="md:col-span-6 space-y-4">
                {/* Charter Details Card */}
                <div className="bg-[#070B0E] p-4 rounded-2xl border border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[#7C8B96]">Booking Reference:</span>
                    <span className="font-mono text-[#F26A4F] font-bold">{selectedPayment.bookingId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#7C8B96]">Lead Guest:</span>
                    <span className="text-[#F4F1EA] font-medium">{selectedPayment.guestName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#7C8B96]">Amount Claimed:</span>
                    <span className="font-serif text-base font-bold text-emerald-400">
                      ₱{selectedPayment.amount.toLocaleString()}.00
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#7C8B96]">Payment Channel:</span>
                    <span className="text-[#D1CCC0] font-medium">{selectedPayment.method}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#7C8B96]">Current Audit Status:</span>
                    <span className="font-semibold text-white">{selectedPayment.status}</span>
                  </div>
                  {selectedPayment.auditReason && (
                    <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-300 text-[11px]">
                      <strong>Flag Note:</strong> {selectedPayment.auditReason}
                    </div>
                  )}
                </div>

                {/* Audit Checklist */}
                <div className="bg-[#0E151A] p-4 rounded-2xl border border-white/5 space-y-2 text-xs">
                  <p className="font-semibold text-[#F4F1EA]">Forensic Verification Checklist</p>
                  <ul className="space-y-1.5 text-[11px] text-[#7C8B96]">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Beneficiary matches "John Raymart Dordines (09466455124)"</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Amount matches required 30% downpayment or full settlement</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Timestamp corresponds with reservation creation window</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Reference format matches {selectedPayment.method} standard</span>
                    </li>
                  </ul>
                </div>

                {/* Audit Decisions */}
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-semibold text-[#D1CCC0]">Execute Audit Action</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Accept */}
                    <button
                      onClick={() => handleUpdateStatus(selectedPayment.id, "Verified")}
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-xs border border-emerald-500/40 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Accept & Clear (Valid)</span>
                    </button>

                    {/* Request Rephoto */}
                    <button
                      onClick={() => setRephotoModalOpen(true)}
                      className="w-full py-2.5 px-3 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 font-semibold text-xs border border-blue-500/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Request Re-Photo</span>
                    </button>

                    {/* Flag as Suspect */}
                    <button
                      onClick={() =>
                        handleUpdateStatus(
                          selectedPayment.id,
                          "Flagged as Suspect",
                          "Suspect fraud: detected inconsistent receipt layout / potential image tampering"
                        )
                      }
                      className="w-full py-2.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-semibold text-xs border border-amber-500/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Flag as Suspect</span>
                    </button>

                    {/* Reject */}
                    <button
                      onClick={() => setRejectModalOpen(true)}
                      className="w-full py-2.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold text-xs border border-rose-500/40 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Fake / Invalid</span>
                    </button>
                  </div>

                  {/* Next Step in Lifecycle: Proceed to Passenger Onboarding Manifest Desk */}
                  {selectedPayment.status === "Verified" && onProceedToManifest && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                          <ClipboardList className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Next Step: Passenger Manifest Verification</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Audit passenger IDs &amp; medical clearances for Charter {selectedPayment.bookingId}.
                        </p>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setInspectModalOpen(false);
                          onProceedToManifest(selectedPayment.bookingId);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#030C16] text-xs font-bold transition-all cursor-pointer shadow-md shadow-cyan-500/20 shrink-0 flex items-center gap-1"
                      >
                        <span>Open Desk</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REQUEST RE-PHOTO MODAL */}
      {rephotoModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-[#0B1014] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-blue-400" />
                <h4 className="font-serif text-lg text-[#F4F1EA] font-semibold">Request Re-Photo</h4>
              </div>
              <button onClick={() => setRephotoModalOpen(false)} className="text-[#7C8B96] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-3">
              <p className="text-[#7C8B96]">
                Select the reason why the receipt screenshot cannot be verified:
              </p>

              <div className="space-y-2">
                {[
                  "Reference number cut off or unreadable",
                  "Amount does not match required charter settlement",
                  "Blurry or low-resolution image",
                  "Wrong beneficiary (not sent to John Raymart Dordines)",
                  "Missing timestamp or transaction date",
                ].map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                      rephotoReason === reason
                        ? "bg-blue-500/15 border-blue-500 text-white font-medium"
                        : "bg-white/5 border-white/5 text-[#D1CCC0] hover:bg-white/10"
                    }`}
                  >
                    <input
                      type="radio"
                      name="rephotoReason"
                      checked={rephotoReason === reason}
                      onChange={() => setRephotoReason(reason)}
                      className="text-blue-500"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-[#D1CCC0] mb-1">Additional Note for Guest:</label>
                <textarea
                  rows={2}
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Please re-upload an uncropped screenshot showing the full 13-digit reference..."
                  className="w-full bg-[#070B0E] border border-white/10 rounded-xl p-2.5 text-xs text-[#F4F1EA] focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() =>
                  handleUpdateStatus(
                    selectedPayment.id,
                    "Needs Re-Photo",
                    rephotoReason,
                    customNote
                  )
                }
                className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-xs cursor-pointer shadow-lg"
              >
                Send Re-Photo Request
              </button>
              <button
                onClick={() => setRephotoModalOpen(false)}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-[#D1CCC0] rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT FAKE RECEIPT MODAL */}
      {rejectModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-[#0B1014] border border-rose-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-500" />
                <h4 className="font-serif text-lg text-[#F4F1EA] font-semibold">Reject Payment</h4>
              </div>
              <button onClick={() => setRejectModalOpen(false)} className="text-[#7C8B96] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div className="p-3 bg-rose-500/15 border border-rose-500/20 rounded-xl text-rose-300">
                <strong>Fraud Safeguard Warning:</strong> Rejecting will mark this payment as invalid, withhold maritime boarding pass issuance, and log an immutable security alert.
              </div>

              <div>
                <label className="block text-[#D1CCC0] mb-1">Rejection Reason:</label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-[#070B0E] border border-white/10 rounded-xl p-2.5 text-xs text-[#F4F1EA]"
                >
                  <option value="Duplicate reference number used on another charter">
                    Duplicate reference number used on another charter
                  </option>
                  <option value="Fabricated / Photo-edited mock receipt detected">
                    Fabricated / Photo-edited mock receipt detected
                  </option>
                  <option value="Fund reversal or non-receipt at merchant account">
                    Fund reversal or non-receipt at merchant account
                  </option>
                  <option value="Incorrect recipient bank account">
                    Incorrect recipient bank account
                  </option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() =>
                  handleUpdateStatus(
                    selectedPayment.id,
                    "Rejected",
                    rejectReason,
                    "Payment rejected during maritime clearance audit."
                  )
                }
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-xs cursor-pointer shadow-lg"
              >
                Confirm Rejection
              </button>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-[#D1CCC0] rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
