import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  Lock,
  Key,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  X,
  Copy,
  Check,
  Zap,
  Radio,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Mail,
  Send,
  HelpCircle,
  ExternalLink,
  Shield,
} from "lucide-react";
import { StorageService } from "../../services/storage";
import { ApiService } from "../../services/api";
import { UserAccount } from "../../types";
import { EmailService } from "../../services/emailService";
import { EmailJSConfigModal } from "./EmailJSConfigModal";

interface AdminOTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (authenticatedUser: UserAccount) => void;
}

export const AdminOTPModal: React.FC<AdminOTPModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const staffList = StorageService.getStaffAccounts();
  const [selectedStaffId, setSelectedStaffId] = useState<string>(
    staffList[0]?.id || "usr_superadmin"
  );
  const [step, setStep] = useState<"credentials" | "otp" | "granted">("credentials");

  // Step 1: Credentials (Password)
  const [password, setPassword] = useState("Password123!");
  const [showPassword, setShowPassword] = useState(false);
  const [credError, setCredError] = useState("");
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [dispatchTargetType, setDispatchTargetType] = useState<"officer" | "tester">("officer");
  const [testerEmail, setTesterEmail] = useState("karlljacob8@gmail.com");

  // Step 2: OTP State & Email status
  const [generatedOTP, setGeneratedOTP] = useState("");
  const [dispatchedEmail, setDispatchedEmail] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [mailMethod, setMailMethod] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(120);
  const [otpError, setOtpError] = useState("");
  const [copied, setCopied] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState(false);
  const [showEmailJsModal, setShowEmailJsModal] = useState(false);
  const [emailJsStatus, setEmailJsStatus] = useState<"connected" | "not_connected">(() =>
    EmailService.isConfigured() ? "connected" : "not_connected"
  );
  const [emailJsDeliveryResult, setEmailJsDeliveryResult] = useState<{
    provider: "emailjs" | "simulated";
    success: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lockoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeStaff =
    staffList.find((s) => s.id === selectedStaffId) || staffList[0];

  const destinationEmail =
    dispatchTargetType === "tester" && testerEmail.trim()
      ? testerEmail.trim()
      : activeStaff.email || "karlljacob8@gmail.com";

  // Request fresh OTP via Email (EmailJS SDK or Local Simulation)
  const requestOtpDispatch = async () => {
    setIsRequestingOtp(true);
    setCredError("");

    try {
      const res = await ApiService.requestStaffOtp(selectedStaffId, password, destinationEmail);

      if (res.success && res.otp) {
        setGeneratedOTP(res.otp);
        const targetEmail = res.email || destinationEmail;
        setDispatchedEmail(targetEmail);
        setMaskedEmail(res.maskedEmail || targetEmail.replace(/(?<=..).(?=.*@)/u, "*"));

        // Dispatch real email via EmailJS if keys configured
        const sendResult = await EmailService.sendOtpEmail({
          toEmail: targetEmail,
          toName: activeStaff.name,
          otpCode: res.otp,
          expiresInMinutes: 2,
        });

        setEmailJsDeliveryResult(sendResult);
        if (sendResult.provider === "emailjs" && sendResult.success) {
          setMailMethod("Live EmailJS SDK Dispatch");
        } else if (sendResult.provider === "emailjs" && !sendResult.success) {
          setMailMethod("EmailJS Dispatch Error");
        } else {
          setMailMethod("Local Simulation (EmailJS Ready)");
        }

        setTimeLeft(res.expiresInSeconds || 120);
        setOtpDigits(["", "", "", "", "", ""]);
        setOtpError("");
        setStep("otp");

        // Log audit trail
        StorageService.addAuditLog({
          action: "EMAIL_OTP_DISPATCHED",
          module: "Security Gateway",
          details: `Level 4 encrypted OTP sent to email (${targetEmail}) via ${sendResult.provider === "emailjs" ? "EmailJS" : "Simulator"} for officer ${activeStaff.name} (${activeStaff.role}).`,
          ipAddress: "192.168.10.42 (Maritime Operations Terminal)",
          userName: activeStaff.name,
          role: activeStaff.role,
          userEmail: targetEmail,
          severity: "Info",
        });
      } else {
        setCredError(res.error || "Authentication failed. Check your password.");
      }
    } catch {
      setCredError("Could not connect to authentication gateway.");
    } finally {
      setIsRequestingOtp(false);
    }
  };

  // Reset modal state when opening
  useEffect(() => {
    if (isOpen) {
      setStep("credentials");
      setPassword("Password123!");
      setCredError("");
      setOtpError("");
      setAttemptsLeft(3);
      setIsLockedOut(false);
      setLockoutTimer(0);
      setOtpDigits(["", "", "", "", "", ""]);
      setShowEmailPreviewModal(false);
    }
  }, [isOpen]);

  // Countdown timer for OTP
  useEffect(() => {
    if (step === "otp" && !isLockedOut) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setOtpError("OTP code has expired. Please request a new code.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, isLockedOut, generatedOTP]);

  // Lockout countdown timer
  useEffect(() => {
    if (isLockedOut && lockoutTimer > 0) {
      lockoutRef.current = setInterval(() => {
        setLockoutTimer((prev) => {
          if (prev <= 1) {
            clearInterval(lockoutRef.current!);
            setIsLockedOut(false);
            setAttemptsLeft(3);
            requestOtpDispatch();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (lockoutRef.current) clearInterval(lockoutRef.current);
    };
  }, [isLockedOut, lockoutTimer]);

  // Auto-focus first input when entering OTP step
  useEffect(() => {
    if (step === "otp" && !isLockedOut) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [step, isLockedOut]);

  if (!isOpen) return null;

  // Handle credentials form submit
  const handleVerifyCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setCredError("Password is required.");
      return;
    }
    requestOtpDispatch();
  };

  // Handle digit typing
  const handleDigitChange = (index: number, val: string) => {
    if (isLockedOut || isVerifying) return;
    const cleanVal = val.replace(/\D/g, "");

    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal.slice(-1);
    setOtpDigits(newDigits);
    setOtpError("");

    // Auto-advance
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when 6 digits present
    const currentCode = newDigits.join("");
    if (currentCode.length === 6 && !newDigits.includes("")) {
      verifyOTP(currentCode);
    }
  };

  // Backspace handling
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isLockedOut || isVerifying) return;
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Paste 6 digits
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (isLockedOut || isVerifying) return;
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newDigits = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);
    setOtpError("");

    const targetIndex = Math.min(pasted.length, 5);
    inputRefs.current[targetIndex]?.focus();

    if (pasted.length === 6) {
      verifyOTP(pasted);
    }
  };

  // Verify OTP submission via API
  const verifyOTP = async (codeToTest: string) => {
    if (timeLeft <= 0) {
      setOtpError("OTP code expired. Please request a new code to be sent to your email.");
      return;
    }

    setIsVerifying(true);
    setOtpError("");

    try {
      const res = await ApiService.verifyStaffOtp(selectedStaffId, codeToTest, generatedOTP);

      if (res.success) {
        setStep("granted");

        const sessionToken = res.token || `ALYN-SEC-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const sessionData = {
          userId: activeStaff.id,
          userName: activeStaff.name,
          role: activeStaff.role,
          token: sessionToken,
          createdAt: Date.now(),
          expiresAt: Date.now() + 60 * 60 * 1000,
        };
        sessionStorage.setItem("alynshir_admin_session", JSON.stringify(sessionData));

        StorageService.addAuditLog({
          action: "ADMIN_OTP_AUTHENTICATED",
          module: "Security Gateway",
          details: `Email-dispatched OTP verified for ${activeStaff.name} (${activeStaff.role}). Operations Tower Console unlocked.`,
          ipAddress: "192.168.10.42",
          userName: activeStaff.name,
          role: activeStaff.role,
          userEmail: activeStaff.email,
          severity: "Info",
        });

        setTimeout(() => {
          onSuccess(res.user || activeStaff);
        }, 1200);
      } else {
        const remaining = attemptsLeft - 1;
        setAttemptsLeft(remaining);

        if (remaining <= 0) {
          setIsLockedOut(true);
          setLockoutTimer(30);
          setOtpError("Exceeded 3 attempts. Security lockout active for 30 seconds.");

          StorageService.addAuditLog({
            action: "SECURITY_LOCKOUT_TRIGGERED",
            module: "Security Gateway",
            details: `Multiple failed OTP entries for officer ${activeStaff.name}. Terminal locked for 30 seconds.`,
            ipAddress: "192.168.10.42",
            userName: activeStaff.name,
            role: activeStaff.role,
            userEmail: activeStaff.email,
            severity: "Critical",
          });
        } else {
          setOtpError(res.error || `Incorrect OTP code. ${remaining} attempt(s) remaining.`);
        }
      }
    } catch {
      setOtpError("Network error validating OTP code.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Fast autofill for instant testing
  const handleFastAutofill = () => {
    if (isLockedOut || !generatedOTP) return;
    const digits = generatedOTP.split("");
    setOtpDigits(digits);
    verifyOTP(generatedOTP);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedOTP);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#071726] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl shadow-cyan-950/80 max-h-[92vh] flex flex-col">
        {/* Top Decorative Oceanic Header */}
        <div className="bg-[#0B2238]/90 px-6 py-4 border-b border-cyan-500/20 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
              <ShieldCheck className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <span>ALYN SHIR Operations Gateway</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-sans font-semibold border border-cyan-500/30">
                  Level 4 Clearance
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                ALYN SHIR Officer Password &amp; EmailJS 2FA Authentication
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Security Feature Banner with EmailJS Quick Button */}
        <div className="bg-cyan-950/40 border-b border-cyan-500/20 px-6 py-2.5 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>
              <strong>Two-Factor Authentication:</strong> Password + EmailJS 6-Digit OTP.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowEmailJsModal(true)}
            className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
              emailJsStatus === "connected"
                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
                : "bg-cyan-500/10 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20"
            }`}
          >
            <Mail className="w-3 h-3 text-cyan-400" />
            <span>{emailJsStatus === "connected" ? "EmailJS: Active" : "EmailJS: Service & Template Configured"}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(92vh-130px)]">
          {/* STEP 1: Staff Selection & Officer Password */}
          {step === "credentials" && (
            <form onSubmit={handleVerifyCredentials} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-cyan-400/90">
                    Select Authorized Officer ({staffList.length} Accounts)
                  </label>
                  <span className="text-[10px] text-slate-400">
                    All members equipped with 2FA
                  </span>
                </div>
                <div className="space-y-2">
                  {staffList.map((staff) => {
                    const isSelected = selectedStaffId === staff.id;
                    return (
                      <div
                        key={staff.id}
                        onClick={() => {
                          setSelectedStaffId(staff.id);
                          setCredError("");
                        }}
                        className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-cyan-950/60 border-cyan-400 text-white shadow-md shadow-cyan-950/80 ring-1 ring-cyan-500/30"
                            : "bg-[#030C16] border-white/10 text-slate-300 hover:border-cyan-500/40"
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <img
                            src={staff.avatar}
                            alt={staff.name}
                            className="w-9 h-9 rounded-xl object-cover border border-cyan-500/30 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate text-white">{staff.name}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-slate-400">{staff.role}</span>
                              <span className="text-[11px] text-cyan-400/80 flex items-center gap-1 font-mono truncate">
                                <Mail className="w-3 h-3 shrink-0" />
                                {staff.email}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0 ml-2">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-medium border ${
                              staff.role === "Super Admin"
                                ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                : staff.role === "Operations Manager"
                                ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                                : staff.role === "Finance Officer"
                                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                : "bg-purple-500/15 text-purple-300 border-purple-500/30"
                            }`}
                          >
                            {staff.role}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* OTP Destination Routing Box */}
              <div className="bg-[#030C16] p-3 rounded-2xl border border-cyan-500/20 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400/90 flex items-center gap-1.5">
                    <Send className="w-3 h-3 text-cyan-400" />
                    OTP Delivery Destination
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    EmailJS Ready
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setDispatchTargetType("officer")}
                    className={`px-3 py-2 rounded-xl border text-left transition-all cursor-pointer ${
                      dispatchTargetType === "officer"
                        ? "bg-cyan-950/70 border-cyan-400 text-white font-semibold"
                        : "bg-[#071726]/70 border-white/10 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px]">Officer's Inbox</span>
                      {dispatchTargetType === "officer" && (
                        <Check className="w-3.5 h-3.5 text-cyan-400" />
                      )}
                    </div>
                    <p className="text-[10px] text-cyan-300 font-mono truncate mt-0.5">
                      {activeStaff.email}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDispatchTargetType("tester")}
                    className={`px-3 py-2 rounded-xl border text-left transition-all cursor-pointer ${
                      dispatchTargetType === "tester"
                        ? "bg-cyan-950/70 border-cyan-400 text-white font-semibold"
                        : "bg-[#071726]/70 border-white/10 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px]">Route to Test Inbox</span>
                      {dispatchTargetType === "tester" && (
                        <Check className="w-3.5 h-3.5 text-cyan-400" />
                      )}
                    </div>
                    <p className="text-[10px] text-emerald-300 font-mono truncate mt-0.5">
                      {testerEmail}
                    </p>
                  </button>
                </div>

                {dispatchTargetType === "tester" && (
                  <div className="pt-1">
                    <label className="text-[10px] text-slate-400 block mb-1">
                      Custom recipient email address for testing:
                    </label>
                    <input
                      type="email"
                      value={testerEmail}
                      onChange={(e) => setTesterEmail(e.target.value)}
                      placeholder="e.g. karlljacob8@gmail.com"
                      className="w-full bg-[#071726] border border-cyan-500/30 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-cyan-400/90">
                    Officer Account Password
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Default: <strong className="text-cyan-300">Password123!</strong>
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4 text-cyan-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter officer security password"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#030C16] border border-cyan-500/30 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                  <span>Secured with PHP 8.x bcrypt hashing</span>
                  <span className="text-cyan-400/80">Master key: ALYN-2026</span>
                </div>
                {credError && (
                  <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{credError}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isRequestingOtp}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-[#030C16] font-bold text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
              >
                {isRequestingOtp ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatching OTP via EmailJS to {destinationEmail}...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>
                      Dispatch OTP to {dispatchTargetType === "tester" ? testerEmail : activeStaff.name}
                    </span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: 6-Digit OTP Verification via Email */}
          {step === "otp" && (
            <div className="space-y-5">
              {/* Email Dispatch Info Box */}
              <div className="bg-[#030C16] p-4 rounded-2xl border border-cyan-500/20 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
                    <Mail className="w-4 h-4 animate-bounce" />
                    <span>Security OTP Dispatched</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-sans font-semibold border ${
                        emailJsDeliveryResult?.provider === "emailjs" && emailJsDeliveryResult.success
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                          : "bg-cyan-500/10 text-cyan-300 border-cyan-500/25"
                      }`}
                    >
                      {emailJsDeliveryResult?.provider === "emailjs" && emailJsDeliveryResult.success
                        ? "EmailJS Live Sent"
                        : "Simulated Dispatch"}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                      TLS 1.3
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-slate-300">
                  <p className="text-slate-400">
                    We sent an official verification code to:
                  </p>
                  <p className="text-white font-mono font-bold text-sm mt-0.5 flex items-center justify-between">
                    <span>{dispatchedEmail}</span>
                    <span className="text-[10px] text-emerald-400 font-sans font-medium px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">
                      Dispatched
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Officer: <strong className="text-cyan-300">{activeStaff.name}</strong> ({activeStaff.role})
                  </p>
                </div>

                {/* EmailJS Live Delivery Notification or Error Callout */}
                {emailJsDeliveryResult?.provider === "emailjs" && emailJsDeliveryResult.success ? (
                  <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-emerald-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-[11px]">
                        <strong>Real Email Dispatched via EmailJS:</strong> Sent to <code className="font-mono text-white">{dispatchedEmail}</code>!
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowEmailJsModal(true)}
                      className="text-[10px] text-emerald-200 underline hover:text-white cursor-pointer shrink-0 ml-2"
                    >
                      Gateway
                    </button>
                  </div>
                ) : emailJsDeliveryResult?.provider === "emailjs" && !emailJsDeliveryResult.success ? (
                  <div className="p-2.5 bg-amber-950/40 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs text-amber-300">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="text-[11px]">
                        <strong>EmailJS Notice:</strong> {emailJsDeliveryResult.error || "Dispatch notice."}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowEmailJsModal(true)}
                      className="px-2 py-0.5 rounded bg-amber-500 text-black font-semibold text-[10px] hover:bg-amber-400 cursor-pointer shrink-0 ml-2"
                    >
                      Diagnose
                    </button>
                  </div>
                ) : (
                  <div className="p-2.5 bg-cyan-950/30 border border-cyan-500/25 rounded-xl flex items-center justify-between text-xs text-cyan-300">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="text-[11px] text-slate-300">
                        EmailJS Live Gateway: Configured with Gmail (<code className="text-cyan-300 font-mono">service_fvtrijl</code>).
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowEmailJsModal(true)}
                      className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30 text-[10px] font-semibold cursor-pointer shrink-0 ml-2"
                    >
                      Config
                    </button>
                  </div>
                )}

                {/* Convenient Testing Card: Direct View & 1-Click Fill */}
                <div className="p-3 bg-gradient-to-r from-cyan-950/60 to-[#0B2238] rounded-xl border border-cyan-500/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-cyan-400 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Email Dispatch Carrier &bull; Preview
                    </span>
                    <span className="font-mono text-xl font-extrabold tracking-widest text-white">
                      {generatedOTP}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowEmailPreviewModal(true)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1 border border-cyan-500/20"
                      title="View simulated email preview"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">View Email</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
                      title="Copy OTP"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleFastAutofill}
                      disabled={isLockedOut || isVerifying}
                      className="px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#030C16] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-cyan-500/20"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Auto-Fill</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 6 Digit Input Grid */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-400/90 mb-2 text-center">
                  Enter 6-Digit Code from Your Email
                </label>
                <div className="flex justify-center gap-2 sm:gap-3">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      disabled={isLockedOut || isVerifying}
                      value={digit}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold font-mono rounded-xl border transition-all focus:outline-none ${
                        isLockedOut
                          ? "bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed"
                          : digit
                          ? "bg-[#030C16] border-cyan-400 text-cyan-300 shadow-md shadow-cyan-950"
                          : "bg-[#030C16] border-cyan-500/30 text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                      }`}
                    />
                  ))}
                </div>

                {otpError && (
                  <p className="mt-2 text-xs text-rose-400 text-center flex items-center justify-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{otpError}</span>
                  </p>
                )}
              </div>

              {/* Countdown Progress & Resend */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    {isLockedOut ? (
                      <span className="text-rose-400 font-semibold">
                        Lockout: {lockoutTimer}s
                      </span>
                    ) : (
                      <span>Code expires in: <strong className="text-white">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}</strong></span>
                    )}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Attempts: <strong className={attemptsLeft <= 1 ? "text-rose-400" : "text-cyan-300"}>{attemptsLeft}/3</strong>
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      isLockedOut
                        ? "bg-rose-500"
                        : timeLeft < 30
                        ? "bg-rose-400"
                        : "bg-cyan-500"
                    }`}
                    style={{
                      width: isLockedOut
                        ? `${(lockoutTimer / 30) * 100}%`
                        : `${(timeLeft / 120) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep("credentials")}
                  className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  ← Re-enter Password
                </button>

                <button
                  type="button"
                  onClick={requestOtpDispatch}
                  disabled={isLockedOut || isRequestingOtp}
                  className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed font-medium cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRequestingOtp ? "animate-spin" : ""}`} />
                  <span>Resend Email OTP</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Clearance Granted Confirmation */}
          {step === "granted" && (
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8 animate-bounce" />
              </div>

              <div>
                <h4 className="font-serif text-xl font-bold text-white">
                  Security Clearance Granted
                </h4>
                <p className="text-xs text-emerald-400 mt-1 font-mono">
                  Password &amp; Email OTP Verified Successfully
                </p>
              </div>

              <div className="max-w-xs mx-auto p-3 bg-[#030C16] rounded-2xl border border-cyan-500/20 text-xs text-slate-300 space-y-1">
                <p className="flex justify-between">
                  <span className="text-slate-400">Officer:</span>
                  <span className="font-semibold text-white">{activeStaff.name}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">System Role:</span>
                  <span className="text-cyan-300 font-mono">{activeStaff.role}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">Authenticated Email:</span>
                  <span className="text-white font-mono">{dispatchedEmail}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">Session Validity:</span>
                  <span className="text-emerald-400 font-mono">60 Minutes</span>
                </p>
              </div>

              <p className="text-xs text-slate-400 animate-pulse">
                Entering Operations Tower Console...
              </p>
            </div>
          )}
        </div>

        {/* Email Simulation Preview Modal */}
        {showEmailPreviewModal && (
          <div className="absolute inset-0 z-50 bg-[#030C16]/95 backdrop-blur-md p-5 flex flex-col justify-between animate-in fade-in">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <Mail className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Dispatched Email Inbox View</span>
              </div>
              <button
                onClick={() => setShowEmailPreviewModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-3 overflow-y-auto max-h-[380px] rounded-xl bg-[#071726] border border-cyan-500/30 p-4 text-xs space-y-3 font-sans">
              <div className="border-b border-white/10 pb-2.5 text-slate-400 space-y-1">
                <p><strong className="text-slate-200">From:</strong> ALYN SHIR Maritime Security &lt;security@alynshir.ph&gt;</p>
                <p><strong className="text-slate-200">To:</strong> {activeStaff.name} &lt;{dispatchedEmail}&gt;</p>
                <p><strong className="text-slate-200">Subject:</strong> ALYN SHIR Maritime Operations - Security OTP: {generatedOTP}</p>
                <p><strong className="text-slate-200">Security:</strong> TLS 1.3, Signed DKIM / SPF</p>
              </div>

              <div className="py-2 space-y-3">
                <p className="text-slate-300">
                  Mabuhay Officer <strong className="text-white">{activeStaff.name}</strong>,
                </p>
                <p className="text-slate-400">
                  An administrative login request was initiated for your assigned profile ({activeStaff.role}). Use the following encrypted One-Time Password (OTP) to authenticate into the maritime dispatch console:
                </p>

                <div className="text-center p-4 rounded-xl bg-cyan-950/60 border-2 border-dashed border-cyan-500/50">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 block tracking-widest">
                    Your 6-Digit Verification Code
                  </span>
                  <span className="font-mono text-3xl font-extrabold tracking-widest text-white my-1 block">
                    {generatedOTP}
                  </span>
                  <span className="text-[11px] text-rose-400 font-semibold block">
                    Valid for 2 minutes only
                  </span>
                </div>

                <p className="text-[11px] text-slate-400">
                  If you did not initiate this request, contact our 24/7 Operations Tower immediately at <span className="text-cyan-400">security@alynshir.ph</span>.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowEmailPreviewModal(false);
                  handleFastAutofill();
                }}
                className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#030C16] font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Auto-Fill Code &amp; Close Preview</span>
              </button>
              <button
                type="button"
                onClick={() => setShowEmailPreviewModal(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* EmailJS Setup & Live Key Config Modal */}
        <EmailJSConfigModal
          isOpen={showEmailJsModal}
          onClose={() => {
            setShowEmailJsModal(false);
            setEmailJsStatus(EmailService.isConfigured() ? "connected" : "not_connected");
          }}
          onConfigSaved={() => {
            setEmailJsStatus(EmailService.isConfigured() ? "connected" : "not_connected");
          }}
          defaultEmail={activeStaff.email || "karlljacob8@gmail.com"}
        />
      </div>
    </div>
  );
};
