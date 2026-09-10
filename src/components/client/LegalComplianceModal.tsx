import React, { useState } from "react";
import { X, ShieldCheck, Scale, FileText, Anchor } from "lucide-react";

interface LegalComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "privacy" | "terms" | "refunds";
}

export const LegalComplianceModal: React.FC<LegalComplianceModalProps> = ({
  isOpen,
  onClose,
  initialTab = "privacy",
}) => {
  const [activeTab, setActiveTab] = useState<"privacy" | "terms" | "refunds">(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0B1014] border border-white/10 rounded-2xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="bg-[#0E151A] px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-[#F26A4F]" />
            <h3 className="font-serif text-xl text-[#F4F1EA] font-semibold">
              Legal Governance & Maritime Compliance
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#7C8B96] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-white/10 bg-[#070B0E] px-6">
          <button
            onClick={() => setActiveTab("privacy")}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "privacy"
                ? "border-[#F26A4F] text-[#F26A4F]"
                : "border-transparent text-[#7C8B96] hover:text-[#D1CCC0]"
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Data Privacy Act (RA 10173)
          </button>
          <button
            onClick={() => setActiveTab("refunds")}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "refunds"
                ? "border-[#F26A4F] text-[#F26A4F]"
                : "border-transparent text-[#7C8B96] hover:text-[#D1CCC0]"
            }`}
          >
            <Anchor className="w-4 h-4" /> DOT Booking & Refund Policy
          </button>
          <button
            onClick={() => setActiveTab("terms")}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "terms"
                ? "border-[#F26A4F] text-[#F26A4F]"
                : "border-transparent text-[#7C8B96] hover:text-[#D1CCC0]"
            }`}
          >
            <FileText className="w-4 h-4" /> Terms of Service
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-8 max-h-[60vh] overflow-y-auto space-y-4 text-sm text-[#D1CCC0] leading-relaxed">
          {activeTab === "privacy" && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs">
                Accredited Operator: Holiday Travelers Travel and Tours Inc • DOT-ACCR-RO7-2026-8819
              </div>

              <h4 className="font-serif text-lg text-[#F4F1EA] font-semibold">
                Philippine Republic Act No. 10173 (Data Privacy Act of 2012)
              </h4>

              <p>
                Holiday Travelers Travel and Tours Inc is committed to safeguarding the personal and sensitive data of all guests embarking on Philippine island expeditions. In compliance with the National Privacy Commission (NPC) regulations:
              </p>

              <div className="space-y-2 text-xs">
                <p className="font-semibold text-[#F4F1EA]">1. Collection of Passenger Manifest Data:</p>
                <p className="text-[#7C8B96]">
                  We collect passenger names, birthdates, nationalities, government ID references, emergency contacts, and declared medical/dietary restrictions solely for the statutory requirements of the Philippine Coast Guard (PCG) Passenger Manifest and local municipal eco-tourism permits.
                </p>

                <p className="font-semibold text-[#F4F1EA]">2. Data Storage & Encryption:</p>
                <p className="text-[#7C8B96]">
                  All passenger identity documents and booking transaction records are encrypted using AES-256 standard protocols. Only authorized tour guides and operations dispatch officers assigned to your specific tour have access to your medical notes.
                </p>

                <p className="font-semibold text-[#F4F1EA]">3. Rights of Data Subjects:</p>
                <p className="text-[#7C8B96]">
                  You retain the legal right under RA 10173 to request access, correction, or deletion of your booking telemetry after your expedition is completed, provided statutory PCG and BIR tax retention periods are met.
                </p>
              </div>
            </div>
          )}

          {activeTab === "refunds" && (
            <div className="space-y-4">
              <h4 className="font-serif text-lg text-[#F4F1EA] font-semibold">
                Department of Tourism (DOT) Downpayment & Cancellation Guidelines
              </h4>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                  <p className="font-semibold text-[#F26A4F]">1. Required Slot Reservation Downpayment (30%)</p>
                  <p className="text-[#7C8B96]">
                    To lock chartered bancas, speedboats, and private resort villa allocations, a non-refundable but fully transferable 30% downpayment is required at the time of reservation. The remaining 70% balance is settled on or before departure day.
                  </p>
                </div>

                <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                  <p className="font-semibold text-emerald-400">2. Maritime Force Majeure & Gale Warnings (PCG Clearances)</p>
                  <p className="text-[#7C8B96]">
                    If the Philippine Coast Guard (PCG) raises a Gale Warning or closes port departures due to typhoons, sea swells, or volcanic disturbances, guests receive 100% free rescheduling with zero penalties, or a full refund minus pre-incurred eco-park tariffs.
                  </p>
                </div>

                <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                  <p className="font-semibold text-[#F4F1EA]">3. Guest-Initiated Cancellations</p>
                  <ul className="list-disc list-inside space-y-1 text-[#7C8B96] pt-1">
                    <li>15+ days before departure: 100% of balance refunded; downpayment converted to lifetime travel voucher.</li>
                    <li>7-14 days before departure: 50% refund of balance amount paid.</li>
                    <li>Within 7 days of departure: Non-refundable due to pre-locked vessel and guide allocations.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === "terms" && (
            <div className="space-y-4">
              <h4 className="font-serif text-lg text-[#F4F1EA] font-semibold">
                Expedition Terms & Maritime Safety Code
              </h4>

              <div className="space-y-2 text-xs text-[#7C8B96]">
                <p>
                  1. <strong className="text-[#F4F1EA]">Mandatory Life Vests:</strong> All passengers must wear DOT/PCG approved life vests during all vessel transit between islands and inside deep water lagoons without exception.
                </p>
                <p>
                  2. <strong className="text-[#F4F1EA]">Ancestral Domain Respect:</strong> Certain lagoons (such as Kayangan Lake and ancestral waters of the Tagbanwa indigenous people in Coron) are sacred ancestral domains. Guests must follow designated wooden walkways and refrain from touching corals or sacred rock shrines.
                </p>
                <p>
                  3. <strong className="text-[#F4F1EA]">Reef-Safe Sunscreen:</strong> Guests are strictly requested to utilize mineral-based reef-safe sunscreens to preserve UNESCO and municipal marine sanctuaries.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#0E151A] px-6 py-4 border-t border-white/10 flex items-center justify-between">
          <p className="text-xs text-[#7C8B96]">
            Holiday Travelers Travel & Tours Inc • Head Office Novaliches, QC
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#F26A4F] hover:bg-[#FF765B] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
