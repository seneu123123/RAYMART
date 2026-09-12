import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  HeartPulse,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  AlertCircle,
  Sparkles,
  FileCheck,
} from "lucide-react";
import { TourPackage, Booking, PassengerInfo } from "../../types";
import { StorageService } from "../../services/storage";
import { InstaPayQR } from "../common/InstaPayQR";
import { generateMockReceiptCanvas } from "../../utils/mockReceiptGenerator";

interface BookingModalProps {
  packageItem: TourPackage | null;
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  packageItem,
  onClose,
  onBookingSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form states
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [travelDate, setTravelDate] = useState("2026-10-12");
  const [guestCount, setGuestCount] = useState(2);
  const [pickupLocation, setPickupLocation] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [medicalAlert, setMedicalAlert] = useState("");
  const [paymentChoice, setPaymentChoice] = useState<"downpayment" | "full">("downpayment");
  const [paymentMethod, setPaymentMethod] = useState<"GCash" | "Maya" | "Bank Transfer (BDO/BPI)" | "Cash">("GCash");

  // Payment Verification States
  const [referenceNumber, setReferenceNumber] = useState("");
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setStep(1);
    setLeadName("");
    setLeadEmail("");
    setLeadPhone("");
    setTravelDate("2026-10-12");
    setGuestCount(2);
    setPickupLocation("");
    setSpecialRequests("");
    setMedicalAlert("");
    setPaymentChoice("downpayment");
    setPaymentMethod("GCash");
    setReferenceNumber("");
    setProofImage(null);
    setUploadError(null);
    setDragActive(false);
  };

  // Reset form cleanly whenever a package is opened or selected
  useEffect(() => {
    if (packageItem) {
      resetForm();
    }
  }, [packageItem?.id]);

  const handleModalClose = () => {
    resetForm();
    onClose();
  };

  if (!packageItem) return null;

  const totalAmount = packageItem.pricePerPerson * guestCount;
  const downpaymentAmount = Math.round(totalAmount * 0.3);
  const balanceAmount = totalAmount - downpaymentAmount;
  const amountToPay = paymentChoice === "full" ? totalAmount : downpaymentAmount;

  const handleFileProcess = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload a valid image (PNG, JPG, JPEG).");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setUploadError("Image size exceeds 8MB limit.");
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === "string") {
        setProofImage(ev.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleQuickMockReceipt = () => {
    const autoRef = referenceNumber.trim() || `${paymentMethod.substring(0, 4).toUpperCase()}-9810482910`;
    if (!referenceNumber) {
      setReferenceNumber(autoRef);
    }
    const receipt = generateMockReceiptCanvas({
      method: paymentMethod,
      referenceNumber: autoRef,
      amount: amountToPay,
      recipientName: "John Raymart Dordines",
      recipientNumber: "09466455124",
      senderName: leadName || "Guest Depositor",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
    });
    setProofImage(receipt);
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep((prev) => (prev + 1) as 1 | 2 | 3);
    } else {
      handleSubmitBooking();
    }
  };

  const handleSubmitBooking = () => {
    // Generate unique code e.g. HT-2026-XXXX
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const bookingId = `HT-2026-${randomCode}`;

    // Create passenger records
    const passengers: PassengerInfo[] = [];
    passengers.push({
      id: `pax-${Date.now()}-1`,
      fullName: leadName,
      age: 32,
      gender: "Male",
      nationality: "Filipino",
      emergencyContact: leadPhone,
      medicalOrDietaryAlert: medicalAlert || undefined,
      idVerified: true,
      checkedIn: false,
    });

    for (let i = 2; i <= guestCount; i++) {
      passengers.push({
        id: `pax-${Date.now()}-${i}`,
        fullName: `Guest Companion ${i} (${leadName.split(" ")[0]} Party)`,
        age: 30,
        gender: "Female",
        nationality: "Filipino",
        emergencyContact: leadPhone,
        idVerified: false,
        checkedIn: false,
      });
    }

    // Calculate dates
    const dateObj = new Date(travelDate);
    const returnDateObj = new Date(dateObj);
    returnDateObj.setDate(returnDateObj.getDate() + packageItem.durationDays);
    const returnDate = returnDateObj.toISOString().split("T")[0];

    const amountPaid = amountToPay;
    const remainingBalance = totalAmount - amountPaid;
    const finalRef =
      referenceNumber.trim() ||
      `${paymentMethod.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-8)}`;

    const finalProofImage =
      proofImage ||
      generateMockReceiptCanvas({
        method: paymentMethod,
        referenceNumber: finalRef,
        amount: amountPaid,
        recipientName: "John Raymart Dordines",
        recipientNumber: "09466455124",
        senderName: leadName || "Guest Depositor",
      });

    const newBooking: Booking = {
      id: bookingId,
      packageId: packageItem.id,
      packageTitle: packageItem.title,
      destination: packageItem.destination,
      travelDate,
      returnDate,
      leadGuestName: leadName,
      leadGuestEmail: leadEmail,
      leadGuestPhone: leadPhone,
      guestCount,
      passengers,
      pickupLocation: pickupLocation || "Resort / Airport Terminal Front Entrance",
      specialRequests,
      totalAmount,
      downpaymentAmount,
      balanceAmount: remainingBalance,
      amountPaid,
      status: "Confirmed",
      paymentStatus: paymentChoice === "full" ? "Fully Paid" : "Downpayment Paid (30%)",
      paymentAuditStatus: "Pending Verification",
      paymentReference: finalRef,
      paymentProofUrl: finalProofImage,
      paymentMethod,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      assignedGuideName: "Babyjane G. Latonio",
      hotelVoucherCode: `RES-${randomCode}`,
    };

    StorageService.createBooking(newBooking);

    // Record in payments ledger for admin verification desk
    StorageService.addPayment({
      id: `PAY-${Date.now().toString(36).toUpperCase()}`,
      bookingId,
      guestName: leadName,
      amount: amountPaid,
      type: paymentChoice === "full" ? "Full Payment" : "Downpayment (30%)",
      method: paymentMethod,
      referenceNumber: finalRef,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      status: "Pending Verification",
      verifiedBy: undefined,
      bir2307Generated: true,
      proofImageUrl: finalProofImage,
      recipientAccountName: "John Raymart Dordines",
      recipientAccountNumber: "09466455124",
    });

    // Also record audit log
    StorageService.addAuditLog({
      action: "CLIENT_PAYMENT_SUBMITTED",
      module: "Billing & Audit",
      details: `Guest ${leadName} submitted payment of ₱${amountPaid.toLocaleString()} via ${paymentMethod} (Ref: ${finalRef}) with receipt screenshot for charter ${bookingId}.`,
      severity: "Info",
      userEmail: leadEmail,
      userName: leadName,
    });

    resetForm();
    onBookingSuccess(newBooking);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0B1014] border border-white/10 rounded-2xl overflow-hidden shadow-2xl my-8">
        {/* Top Header */}
        <div className="bg-[#0E151A] px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#F26A4F] font-bold">
              Instant Reservation Flow • Step {step} of 3
            </span>
            <h3 className="font-serif text-xl text-[#F4F1EA] font-semibold">
              {packageItem.title}
            </h3>
          </div>
          <button
            onClick={handleModalClose}
            className="p-1 rounded-lg text-[#7C8B96] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Indicator */}
        <div className="flex border-b border-white/5 bg-[#070B0E] px-6 py-2.5 text-xs">
          <div className={`flex items-center gap-2 ${step >= 1 ? "text-[#F26A4F]" : "text-[#7C8B96]"}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">1</span>
            <span>Guest Information</span>
          </div>
          <span className="mx-3 text-white/20">/</span>
          <div className={`flex items-center gap-2 ${step >= 2 ? "text-[#F26A4F]" : "text-[#7C8B96]"}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">2</span>
            <span>Logistics & Health</span>
          </div>
          <span className="mx-3 text-white/20">/</span>
          <div className={`flex items-center gap-2 ${step >= 3 ? "text-[#F26A4F]" : "text-[#7C8B96]"}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">3</span>
            <span>InstaPay QR & Payment Proof</span>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleNext} className="p-6 space-y-6">
          {step === 1 && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#D1CCC0] mb-1 font-medium">Lead Guest Full Name *</label>
                  <input
                    type="text"
                    required
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="e.g. Atty. Carlos Mendoza"
                    className="w-full bg-[#070B0E] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#F26A4F]"
                  />
                </div>
                <div>
                  <label className="block text-[#D1CCC0] mb-1 font-medium">Email Address (for e-Tickets) *</label>
                  <input
                    type="email"
                    required
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="e.g. carlos.mendoza@lawfirm.ph"
                    className="w-full bg-[#070B0E] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#F26A4F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#D1CCC0] mb-1 font-medium">Mobile / Viber No. *</label>
                  <input
                    type="tel"
                    required
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    placeholder="+63 917 888 2211"
                    className="w-full bg-[#070B0E] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#F26A4F]"
                  />
                </div>
                <div>
                  <label className="block text-[#D1CCC0] mb-1 font-medium">Expedition Departure Date *</label>
                  <input
                    type="date"
                    required
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full bg-[#070B0E] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#F26A4F]"
                  />
                </div>
                <div>
                  <label className="block text-[#D1CCC0] mb-1 font-medium">Total Passengers (Pax) *</label>
                  <input
                    type="number"
                    min={1}
                    max={packageItem.maxGroupSize}
                    required
                    value={guestCount}
                    onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                    className="w-full bg-[#070B0E] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#F26A4F]"
                  />
                </div>
              </div>

              <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-[#7C8B96] text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  Passenger roster is certified by Alyn Shir operations for maritime safety and digital pier embarkation.
                </span>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[#D1CCC0] mb-1 font-medium">
                  Airport / Hotel Pickup Location in {packageItem.destination}
                </label>
                <input
                  type="text"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="e.g. Busuanga Airport arrival terminal or Resort Lobby"
                  className="w-full bg-[#070B0E] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#F26A4F]"
                />
              </div>

              <div>
                <label className="block text-[#D1CCC0] mb-1 font-medium flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                  Medical Alerts, Allergies, or Dietary Requirements
                </label>
                <input
                  type="text"
                  value={medicalAlert}
                  onChange={(e) => setMedicalAlert(e.target.value)}
                  placeholder="e.g. Shellfish allergy, vegetarian, asthma, requires life vest extension"
                  className="w-full bg-[#070B0E] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#F26A4F]"
                />
              </div>

              <div>
                <label className="block text-[#D1CCC0] mb-1 font-medium">Special Requests & Inclusions</label>
                <textarea
                  rows={3}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. Honeymoon anniversary banner, paddleboard rental, underwater camera"
                  className="w-full bg-[#070B0E] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#F26A4F]"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 text-xs">
              {/* Financial Calculation breakdown */}
              <div className="bg-[#070B0E] p-4 rounded-xl border border-white/10 space-y-2">
                <div className="flex justify-between text-[#7C8B96]">
                  <span>Package Rate (₱{packageItem.pricePerPerson.toLocaleString()} x {guestCount} guests)</span>
                  <span className="text-[#F4F1EA] font-semibold">₱{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#7C8B96]">
                  <span>Mandatory Slot Downpayment (30%)</span>
                  <span className="text-[#F26A4F] font-semibold">₱{downpaymentAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#7C8B96]">
                  <span>Remaining 70% Balance (Due on Departure)</span>
                  <span>₱{balanceAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Choice Selector */}
              <div>
                <label className="block text-[#D1CCC0] mb-2 font-medium">Choose Payment Option</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setPaymentChoice("downpayment")}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentChoice === "downpayment"
                        ? "bg-[#F26A4F]/10 border-[#F26A4F] text-[#F4F1EA]"
                        : "bg-white/5 border-white/5 text-[#7C8B96]"
                    }`}
                  >
                    <p className="font-semibold text-sm">Pay 30% Downpayment</p>
                    <p className="text-base font-serif text-[#F26A4F] mt-1">₱{downpaymentAmount.toLocaleString()}</p>
                    <p className="text-[10px] mt-1">Locks private banca & hotel slots</p>
                  </div>

                  <div
                    onClick={() => setPaymentChoice("full")}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentChoice === "full"
                        ? "bg-[#F26A4F]/10 border-[#F26A4F] text-[#F4F1EA]"
                        : "bg-white/5 border-white/5 text-[#7C8B96]"
                    }`}
                  >
                    <p className="font-semibold text-sm">Pay Full Balance</p>
                    <p className="text-base font-serif text-emerald-400 mt-1">₱{totalAmount.toLocaleString()}</p>
                    <p className="text-[10px] mt-1">Zero balance remaining</p>
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-[#D1CCC0] mb-2 font-medium">Select Gateway</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["GCash", "Maya", "Bank Transfer (BDO/BPI)", "Cash"] as const).map((method) => (
                    <button
                      type="button"
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === method
                          ? "bg-[#F26A4F] text-white border-[#F26A4F] font-semibold"
                          : "bg-white/5 border-white/5 text-[#D1CCC0] hover:bg-white/10"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* InstaPay QR Generator Component for John Raymart Dordines 09466455124 */}
              <InstaPayQR
                amount={amountToPay}
                bookingRef={leadName ? `${leadName.split(" ")[0].toUpperCase()}-2026` : "ALYN-SHIR"}
                defaultChannel={paymentMethod === "Maya" ? "Maya" : "GCash"}
                onChannelChange={(ch) => {
                  if (ch === "Maya") setPaymentMethod("Maya");
                  else if (ch === "GCash") setPaymentMethod("GCash");
                  else setPaymentMethod("Bank Transfer (BDO/BPI)");
                }}
              />

              {/* Reference Number and Proof of Payment Upload */}
              <div className="bg-[#070B0E] p-4 rounded-xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-[#F26A4F]" />
                    <span className="font-semibold text-[#F4F1EA] text-xs">
                      Payment Verification & Screenshot Proof
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickMockReceipt}
                    className="inline-flex items-center gap-1 text-[11px] text-[#F26A4F] hover:underline cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-Generate Sample Receipt</span>
                  </button>
                </div>

                {/* Reference Number Field */}
                <div>
                  <label className="block text-[#D1CCC0] mb-1 font-medium">
                    {paymentMethod} Reference / Transaction Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder={
                      paymentMethod === "GCash"
                        ? "e.g. 1008492810492 (13-digit GCash Ref)"
                        : paymentMethod === "Maya"
                        ? "e.g. MAYA-2026-98104"
                        : "e.g. BDO-REF-44910283"
                    }
                    className="w-full bg-[#0B1014] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-[#F4F1EA] focus:outline-none focus:border-[#F26A4F]"
                  />
                  <p className="text-[10px] text-[#7C8B96] mt-1">
                    Enter the exact reference number from your {paymentMethod} transaction receipt.
                  </p>
                </div>

                {/* Drag and Drop Screenshot Zone */}
                <div>
                  <label className="block text-[#D1CCC0] mb-1 font-medium">
                    Upload Payment Screenshot / Proof of Transfer
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileProcess(e.target.files[0]);
                      }
                    }}
                  />

                  {!proofImage ? (
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                        dragActive
                          ? "border-[#F26A4F] bg-[#F26A4F]/10 text-white"
                          : "border-white/15 bg-white/[0.02] hover:bg-white/[0.05] text-[#7C8B96]"
                      }`}
                    >
                      <UploadCloud className="w-8 h-8 mx-auto mb-2 text-[#F26A4F]" />
                      <p className="font-semibold text-xs text-[#F4F1EA]">
                        Drag & Drop receipt screenshot here, or <span className="text-[#F26A4F] underline">browse file</span>
                      </p>
                      <p className="text-[10px] text-[#7C8B96] mt-1">
                        Supports PNG, JPG, JPEG up to 8MB • Captured on GCash or Maya app
                      </p>
                    </div>
                  ) : (
                    <div className="relative p-3 bg-[#0B1014] rounded-xl border border-white/10 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img
                          src={proofImage}
                          alt="Uploaded Receipt"
                          className="w-14 h-14 rounded-lg object-cover border border-white/10 shrink-0 bg-white"
                        />
                        <div className="truncate">
                          <p className="text-[#F4F1EA] font-semibold text-xs truncate">
                            Receipt Screenshot Attached
                          </p>
                          <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Ready for Auditor Review
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#D1CCC0] cursor-pointer"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={() => setProofImage(null)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {uploadError && (
                    <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {uploadError}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-[#D1CCC0] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <span />
            )}

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#F26A4F] hover:bg-[#FF765B] text-white text-xs font-semibold shadow-lg shadow-[#F26A4F]/20 transition-all cursor-pointer"
            >
              <span>{step === 3 ? "Submit Reservation & Receipt" : "Next Step"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
