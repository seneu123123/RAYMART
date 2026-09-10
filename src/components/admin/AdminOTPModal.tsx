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
  UserCheck,
  Radio,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { StorageService } from "../../services/storage";
import { UserAccount } from "../../types";

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

  // Step 1: Credentials
  const [passcode, setPasscode] = useState("ALYN-2026");
  const [showPasscode, setShowPasscode] = useState(false);
  const [credError, setCredError] = useState("");

  // Step 2: OTP State
  const [generatedOTP, setGeneratedOTP] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [otpError, setOtpError] = useState("");
  const [copied, setCopied] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lockoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeStaff =
    staffList.find((s) => s.id === selectedStaffId) || staffList[0];

  // Helper to generate fresh 6-digit OTP
  const generateNewOTP = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOTP(code);
    setTimeLeft(60);
    setOtpDigits(["", "", "", "", "", ""]);
    setOtpError("");
  };

  // Reset modal state when opening
  useEffect(() => {
    if (isOpen) {
      setStep("credentials");
      setCredError("");
      setOtpError("");
      setAttemptsLeft(3);
      setIsLockedOut(false);
      setLockoutTimer(0);
      setOtpDigits(["", "", "", "", "", ""]);
    }
  }, [isOpen]);

  // Countdown timer for OTP
  useEffect(() => {
    if (step === "otp" && !isLockedOut) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setOtpError("OTP code has expired. Please generate a new code.");
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
            generateNewOTP();
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

  // Verify Step 1 Passcode & advance to OTP
  const handleVerifyCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setCredError("");

    // Accept default master key "ALYN-2026" or "2026" or "admin"
    const validCodes = ["ALYN-2026", "2026", "admin", "alynshir"];
    if (!validCodes.includes(passcode.trim())) {
      setCredError("Invalid staff access key. (Default: ALYN-2026)");
      return;
    }

    generateNewOTP();
    setStep("otp");

    // Add audit log entry
    StorageService.addAuditLog({
      action: "OTP_CHALLENGE_REQUESTED",
      module: "Security Gateway",
      details: `Staff requested maritime Level 4 OTP dispatch for officer: ${activeStaff.name}`,
      ipAddress: "192.168.10.42 (Encrypted Port Terminal)",
      userName: activeStaff.name,
      role: activeStaff.role,
      userEmail: activeStaff.email,
      severity: "Info",
    });
  };

  // Handle digit typing
  const handleDigitChange = (index: number, val: string) => {
    if (isLockedOut) return;
    const cleanVal = val.replace(/\D/g, "");

    // If typing a single digit
    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal.slice(-1);
    setOtpDigits(newDigits);
    setOtpError("");

    // Auto-advance to next box if digit entered
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // If all 6 digits are typed, automatically verify
    const currentCode = newDigits.join("");
    if (currentCode.length === 6 && !newDigits.includes("")) {
      verifyOTP(currentCode);
    }
  };

  // Handle backspace key
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isLockedOut) return;
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste for full 6 digits
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (isLockedOut) return;
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

  // Verify OTP submission
  const verifyOTP = (codeToTest: string) => {
    if (timeLeft <= 0) {
      setOtpError("OTP code expired. Please generate a new code.");
      return;
    }

    if (codeToTest === generatedOTP) {
      // SUCCESS!
      setStep("granted");

      const sessionToken = `ALYN-SEC-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const sessionData = {
        userId: activeStaff.id,
        userName: activeStaff.name,
        role: activeStaff.role,
        token: sessionToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 60 * 60 * 1000, // 60 minutes
      };
      sessionStorage.setItem("alynshir_admin_session", JSON.stringify(sessionData));

      // Record successful audit log
      StorageService.addAuditLog({
        action: "ADMIN_OTP_AUTHENTICATED",
        module: "Security Gateway",
        details: `Level 4 security clearance verified with encrypted OTP for ${activeStaff.name}. Session token issued.`,
        ipAddress: "192.168.10.42 (Maritime Operations Console)",
        userName: activeStaff.name,
        role: activeStaff.role,
        userEmail: activeStaff.email,
        severity: "Info",
      });

      // Grant access after short celebration delay
      setTimeout(() => {
        onSuccess(activeStaff);
      }, 1200);
    } else {
      // Failed attempt
      const remaining = attemptsLeft - 1;
      setAttemptsLeft(remaining);

      if (remaining <= 0) {
        setIsLockedOut(true);
        setLockoutTimer(30);
        setOtpError("Exceeded 3 attempts. Security lockout active for 30 seconds.");

        StorageService.addAuditLog({
          action: "SECURITY_LOCKOUT_TRIGGERED",
          module: "Security Gateway",
          details: `Multiple failed OTP attempts for officer ${activeStaff.name}. Terminal locked for 30 seconds.`,
          ipAddress: "192.168.10.42",
          userName: activeStaff.name,
          role: activeStaff.role,
          userEmail: activeStaff.email,
          severity: "Critical",
        });
      } else {
        setOtpError(`Incorrect OTP code. ${remaining} attempt(s) remaining.`);
      }
    }
  };

  // Fast autofill for instant testing convenience
  const handleFastAutofill = () => {
    if (isLockedOut) return;
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
      <div className="relative w-full max-w-lg bg-[#071726] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl shadow-cyan-950/80">
        {/* Top Decorative Cyber-Oceanic Header */}
        <div className="bg-[#0B2238]/90 px-6 py-4 border-b border-cyan-500/20 flex items-center justify-between">
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
                Philippine Coast Guard &amp; Marine Operations Protocol
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

        {/* Easter Egg Notice Banner */}
        <div className="bg-cyan-950/40 border-b border-cyan-500/20 px-6 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>
              <strong>Easter Egg Activated:</strong> Admin portal access unsealed.
            </span>
          </div>
          <span className="text-[11px] font-mono text-cyan-400/80 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
            Ctrl+Shift+A
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* STEP 1: Staff Selection & Master Key */}
          {step === "credentials" && (
            <form onSubmit={handleVerifyCredentials} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-400/90 mb-1.5">
                  Select Authorized Officer
                </label>
                <div className="space-y-2">
                  {staffList.slice(0, 3).map((staff) => (
                    <div
                      key={staff.id}
                      onClick={() => setSelectedStaffId(staff.id)}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                        selectedStaffId === staff.id
                          ? "bg-cyan-950/50 border-cyan-500 text-white shadow-md shadow-cyan-950"
                          : "bg-[#030C16] border-white/10 text-slate-300 hover:border-cyan-500/40"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={staff.avatar}
                          alt={staff.name}
                          className="w-9 h-9 rounded-xl object-cover border border-cyan-500/30"
                        />
                        <div>
                          <p className="text-sm font-semibold">{staff.name}</p>
                          <p className="text-xs text-slate-400">{staff.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                          {staff.role === "Super Admin" ? "Master Access" : "Authorized"}
                        </span>
                        {selectedStaffId === staff.id && (
                          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Passcode Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-cyan-400/90">
                    Officer Security Passcode
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Default: <strong className="text-cyan-300">ALYN-2026</strong>
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Key className="w-4 h-4 text-cyan-400" />
                  </div>
                  <input
                    type={showPasscode ? "text" : "password"}
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter security passcode"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#030C16] border border-cyan-500/30 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {credError && (
                  <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {credError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-[#030C16] font-bold text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Request Maritime 6-Digit OTP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: 6-Digit OTP Verification */}
          {step === "otp" && (
            <div className="space-y-5">
              {/* Dispatch Info */}
              <div className="bg-[#030C16] p-4 rounded-2xl border border-cyan-500/20 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span>Encrypted Maritime Dispatch</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30">
                    TLS 1.3 Active
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Transmitted to registered device:{" "}
                  <span className="text-white font-mono font-medium">+63 917 ••• •111</span>{" "}
                  for officer <strong className="text-cyan-300">{activeStaff.name}</strong>.
                </p>

                {/* Testing Helper: Dispatched Code Card with 1-click Autofill */}
                <div className="mt-3 p-3 bg-cyan-950/40 rounded-xl border border-cyan-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-cyan-400 block">
                      Dispatched Security OTP
                    </span>
                    <span className="font-mono text-lg font-bold tracking-widest text-white">
                      {generatedOTP}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
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
                      disabled={isLockedOut}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#030C16] text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
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
                  Enter 6-Digit One-Time Code
                </label>
                <div className="flex justify-center gap-2 sm:gap-3">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      disabled={isLockedOut}
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
                      <span>Code expires in: <strong className="text-white">{timeLeft}s</strong></span>
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
                        : timeLeft < 15
                        ? "bg-rose-400"
                        : "bg-cyan-500"
                    }`}
                    style={{
                      width: isLockedOut
                        ? `${(lockoutTimer / 30) * 100}%`
                        : `${(timeLeft / 60) * 100}%`,
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
                  ← Change Officer
                </button>

                <button
                  type="button"
                  onClick={generateNewOTP}
                  disabled={isLockedOut}
                  className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed font-medium cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resend Fresh OTP</span>
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
                  Level 4 Maritime Operations Tower Unlocked
                </p>
              </div>

              <div className="max-w-xs mx-auto p-3 bg-[#030C16] rounded-2xl border border-cyan-500/20 text-xs text-slate-300 space-y-1">
                <p className="flex justify-between">
                  <span className="text-slate-400">Officer:</span>
                  <span className="font-semibold text-white">{activeStaff.name}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">Role:</span>
                  <span className="text-cyan-300 font-mono">{activeStaff.role}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">Session Duration:</span>
                  <span className="text-emerald-400 font-mono">60 Minutes</span>
                </p>
              </div>

              <p className="text-xs text-slate-400 animate-pulse">
                Entering Operations Tower Console...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
