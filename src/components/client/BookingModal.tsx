import React, { useState } from "react";
import { X, Calendar, MapPin, Users, CheckCircle2, ShieldCheck, ArrowRight, ArrowLeft, CreditCard, HeartPulse } from "lucide-react";
import { TourPackage, Booking, PassengerInfo } from "../../types";
import { StorageService } from "../../services/storage";

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

  if (!packageItem) return null;

  const totalAmount = packageItem.pricePerPerson * guestCount;
  const downpaymentAmount = Math.round(totalAmount * 0.3);
  const balanceAmount = totalAmount - downpaymentAmount;

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

    const amountPaid = paymentChoice === "full" ? totalAmount : downpaymentAmount;
    const remainingBalance = totalAmount - amountPaid;

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
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      assignedGuideName: "Babyjane G. Latonio",
      hotelVoucherCode: `RES-${randomCode}`,
    };

    StorageService.createBooking(newBooking);

    // Also record transaction
    StorageService.addPayment({
      id: `PAY-${Date.now().toString(36)}`,
      bookingId,
      guestName: leadName,
      amount: amountPaid,
      type: paymentChoice === "full" ? "Full Payment" : "Downpayment (30%)",
      method: paymentMethod,
      referenceNumber: `${paymentMethod.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-8)}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      status: "Verified",
      verifiedBy: "Automated Gateway",
      bir2307Generated: true,
    });

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
            onClick={onClose}
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
            <span>Logistics & Safety</span>
          </div>
          <span className="mx-3 text-white/20">/</span>
          <div className={`flex items-center gap-2 ${step >= 3 ? "text-[#F26A4F]" : "text-[#7C8B96]"}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">3</span>
            <span>Downpayment & Confirmation</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleNext} className="p-6 md:p-8 space-y-6">
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
                  <label className="block text-[#D1CCC0] mb-1 font-medium">Email Address (for e-Voucher) *</label>
                  <input
                    type="email"
                    required
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="carlos.mendoza@example.ph"
                    className="w-full bg-[#070B0E] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#F26A4F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#D1CCC0] mb-1 font-medium">Mobile Phone (PH or Int&apos;l) *</label>
                  <input
                    type="tel"
                    required
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    placeholder="+63 917 000 0000"
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
                  <label className="block text-[#D1CCC0] mb-1 font-medium">Passenger Count *</label>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full bg-[#070B0E] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#F26A4F]"
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? "Guest" : "Guests"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-[#7C8B96] text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Passenger data is securely filed for Philippine Coast Guard (PCG) Passenger Manifest compliance.
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
            <div className="space-y-4 text-xs">
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
                <label className="block text-[#D1CCC0] mb-2 font-medium">Select Payment Gateway</label>
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
              <span>{step === 3 ? "Complete Reservation & Generate Pass" : "Next Step"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
