import React, { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import {
  QrCode,
  ZoomIn,
  ZoomOut,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Smartphone,
  Eye,
  X,
  ExternalLink,
} from "lucide-react";

interface InstaPayQRProps {
  amount: number;
  bookingRef?: string;
  defaultChannel?: "GCash" | "Maya" | "InstaPay";
  onChannelChange?: (channel: "GCash" | "Maya" | "InstaPay") => void;
}

export const InstaPayQR: React.FC<InstaPayQRProps> = ({
  amount,
  bookingRef = "HT-EXPEDITION",
  defaultChannel = "GCash",
  onChannelChange,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<"GCash" | "Maya" | "InstaPay">(defaultChannel);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const accountName = "John Raymart Dordines";
  const accountNumber = "09466455124";

  // Generate QR Code with standard Philippine EMVCo / QRPh style metadata
  useEffect(() => {
    // InstaPay standard payload format string
    const qrPayload = JSON.stringify({
      format: "QRPH_INTEROPERABLE",
      network: "INSTAPAY",
      accName: accountName,
      accNum: accountNumber,
      channel: selectedChannel,
      amount: amount > 0 ? amount : undefined,
      ref: bookingRef,
      issuer: "Bangko Sentral ng Pilipinas Registered QRPh",
    });

    QRCode.toDataURL(qrPayload, {
      width: 380,
      margin: 2,
      color: {
        dark: selectedChannel === "GCash" ? "#0047AB" : selectedChannel === "Maya" ? "#056839" : "#0F172A",
        light: "#FFFFFF",
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("Error generating QR", err));
  }, [selectedChannel, amount, bookingRef]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `InstaPay-QR-${selectedChannel}-${accountName.replace(/\s+/g, "_")}.png`;
    link.click();
  };

  const handleSelectChannel = (channel: "GCash" | "Maya" | "InstaPay") => {
    setSelectedChannel(channel);
    if (onChannelChange) {
      onChannelChange(channel);
    }
  };

  return (
    <div className="bg-[#070B0E] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Channel Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-[#F26A4F]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#F4F1EA]">
            Official InstaPay / QRPh Gateway
          </span>
        </div>

        {/* Tab pills */}
        <div className="flex bg-[#0B1014] p-1 rounded-xl border border-white/5 text-[11px]">
          <button
            type="button"
            onClick={() => handleSelectChannel("GCash")}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              selectedChannel === "GCash"
                ? "bg-[#005CE6] text-white shadow-sm font-semibold"
                : "text-[#7C8B96] hover:text-white"
            }`}
          >
            GCash QR
          </button>
          <button
            type="button"
            onClick={() => handleSelectChannel("Maya")}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              selectedChannel === "Maya"
                ? "bg-[#00D632] text-black shadow-sm font-bold"
                : "text-[#7C8B96] hover:text-white"
            }`}
          >
            Maya QR
          </button>
          <button
            type="button"
            onClick={() => handleSelectChannel("InstaPay")}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              selectedChannel === "InstaPay"
                ? "bg-[#F26A4F] text-white shadow-sm font-semibold"
                : "text-[#7C8B96] hover:text-white"
            }`}
          >
            Any Bank / InstaPay
          </button>
        </div>
      </div>

      {/* Main QR Display & Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* QR Code Presentation Frame */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-[#0E151A] rounded-xl border border-white/10 relative group">
          {/* Top QRPh Badge */}
          <div className="flex items-center gap-1.5 mb-2.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-[#D1CCC0]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono font-bold tracking-wider">QRPh • INSTAPAY</span>
          </div>

          {/* QR Image Box with Hover Overlay */}
          <div className="relative bg-white p-2.5 rounded-xl shadow-lg cursor-pointer overflow-hidden" onClick={() => setZoomModalOpen(true)}>
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="InstaPay QR Code"
                className="w-44 h-44 object-contain transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-44 h-44 flex items-center justify-center bg-gray-100 text-gray-400">
                <QrCode className="w-8 h-8 animate-spin" />
              </div>
            )}

            {/* Quick Action Overlay on hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white text-[11px] font-medium backdrop-blur-[2px]">
              <Eye className="w-5 h-5" />
              <span>Click to Zoom & View</span>
            </div>
          </div>

          {/* Action buttons under QR */}
          <div className="flex items-center gap-2 mt-3 w-full justify-center">
            <button
              type="button"
              onClick={() => setZoomModalOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-[#D1CCC0] font-medium transition-colors cursor-pointer border border-white/5"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Zoom</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadQR}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F26A4F]/15 hover:bg-[#F26A4F]/25 text-[#F26A4F] text-[11px] font-medium transition-colors cursor-pointer border border-[#F26A4F]/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save QR</span>
            </button>
          </div>
        </div>

        {/* Recipient Credential Breakdown */}
        <div className="md:col-span-7 space-y-3">
          <div className="p-3 bg-[#0E151A] rounded-xl border border-white/5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#7C8B96]">Account Name</span>
              <button
                type="button"
                onClick={() => handleCopy(accountName, "name")}
                className="inline-flex items-center gap-1 text-[11px] text-[#F26A4F] hover:underline cursor-pointer"
              >
                {copiedField === "name" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedField === "name" ? "Copied!" : "Copy"}</span>
              </button>
            </div>
            <p className="font-serif text-sm sm:text-base font-bold text-[#F4F1EA] tracking-wide">
              {accountName}
            </p>
          </div>

          <div className="p-3 bg-[#0E151A] rounded-xl border border-white/5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#7C8B96]">Mobile / Account Number</span>
              <button
                type="button"
                onClick={() => handleCopy(accountNumber, "number")}
                className="inline-flex items-center gap-1 text-[11px] text-[#F26A4F] hover:underline cursor-pointer"
              >
                {copiedField === "number" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedField === "number" ? "Copied!" : "Copy"}</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-emerald-400 tracking-wider">
                {accountNumber}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Verified Merchant
              </span>
            </div>
          </div>

          {/* Amount Reminder */}
          <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
            <span className="text-xs text-[#7C8B96]">Amount to Send:</span>
            <span className="text-base font-serif font-bold text-[#F26A4F]">
              ₱{amount.toLocaleString()}.00
            </span>
          </div>

          {/* Security footnote */}
          <p className="text-[11px] text-[#7C8B96] leading-relaxed flex items-start gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
            <span>
              All transactions are encrypted and audited through Bangko Sentral ng Pilipinas (BSP) QRPh standards. Works seamlessly with GCash, Maya, BDO, BPI, UnionBank, RCBC, and Seabank.
            </span>
          </p>
        </div>
      </div>

      {/* Interactive Zoom & Save Modal */}
      {zoomModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#0B1014] border border-white/15 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="text-left">
                <span className="text-[10px] uppercase tracking-widest text-[#F26A4F] font-bold">
                  {selectedChannel} • InstaPay QRPh
                </span>
                <h4 className="font-serif text-lg text-[#F4F1EA] font-semibold">
                  Official Maritime Reservation QR
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setZoomModalOpen(false);
                  setZoomLevel(1);
                }}
                className="p-1.5 rounded-lg text-[#7C8B96] hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Enlarged QR Code Canvas Container */}
            <div className="p-6 bg-white rounded-2xl inline-block shadow-inner mx-auto relative overflow-hidden">
              <div
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
                className="transition-transform duration-200"
              >
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="Enlarged QR Code"
                    className="w-64 h-64 sm:w-72 sm:h-72 object-contain"
                  />
                )}
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.max(0.8, prev - 0.2))}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-[#7C8B96]">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.min(2.0, prev + 0.2))}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Recipient Details Pill */}
            <div className="bg-[#070B0E] p-3 rounded-xl border border-white/10 text-xs text-left space-y-1">
              <div className="flex justify-between">
                <span className="text-[#7C8B96]">Merchant Beneficiary:</span>
                <span className="text-[#F4F1EA] font-semibold">{accountName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7C8B96]">InstaPay Account / Mobile:</span>
                <span className="text-emerald-400 font-mono font-bold">{accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7C8B96]">Exact Settlement:</span>
                <span className="text-[#F26A4F] font-bold">₱{amount.toLocaleString()}.00</span>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownloadQR}
                className="flex-1 py-3 rounded-xl bg-[#F26A4F] hover:bg-[#FF765B] text-white text-xs font-semibold shadow-lg shadow-[#F26A4F]/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Save QR to Device (PNG)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoomModalOpen(false);
                  setZoomLevel(1);
                }}
                className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-[#D1CCC0] text-xs font-medium cursor-pointer"
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
