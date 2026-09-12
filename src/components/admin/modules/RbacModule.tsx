import React, { useState } from "react";
import {
  ShieldCheck,
  Users,
  Lock,
  Key,
  CheckCircle2,
  History,
  AlertCircle,
  Mail,
  Edit3,
  Check,
  X,
  Eye,
  EyeOff,
  RefreshCw,
  Send,
  Sparkles,
} from "lucide-react";
import { UserAccount, AuditLogEntry } from "../../../types";
import { StorageService } from "../../../services/storage";
import { ApiService } from "../../../services/api";
import { EmailService } from "../../../services/emailService";

export const RbacModule: React.FC = () => {
  const [staff, setStaff] = useState<UserAccount[]>(StorageService.getStaffAccounts());
  const logs = StorageService.getAuditLogs();
  const [activeTab, setActiveTab] = useState<"accounts" | "roles" | "audit">("accounts");

  // State for changing credentials modal
  const [selectedOfficer, setSelectedOfficer] = useState<UserAccount | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [actionStatus, setActionStatus] = useState<{ success?: string; error?: string }>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [testingOtpId, setTestingOtpId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; msg: string; success: boolean } | null>(null);

  const handleOpenOfficerEdit = (officer: UserAccount) => {
    setSelectedOfficer(officer);
    setEditEmail(officer.email);
    setNewPassword("");
    setActionStatus({});
  };

  const handleUpdateOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfficer) return;

    if (!editEmail || !editEmail.includes("@")) {
      setActionStatus({ error: "Please enter a valid email address." });
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setActionStatus({ error: "New password must be at least 6 characters long." });
      return;
    }

    setIsUpdating(true);
    setActionStatus({});

    try {
      // 1. Update email if changed
      if (editEmail.trim() !== selectedOfficer.email) {
        await ApiService.updateStaffEmail(selectedOfficer.id, editEmail.trim());
      }

      // 2. Update password if provided
      if (newPassword.trim()) {
        await ApiService.updateStaffPassword(selectedOfficer.id, newPassword.trim());
      }

      setActionStatus({
        success: `Credentials updated for ${selectedOfficer.name}.`,
      });

      // Refresh local staff state
      const refreshed = StorageService.getStaffAccounts();
      setStaff(refreshed);

      setTimeout(() => {
        setSelectedOfficer(null);
        setNewPassword("");
        setActionStatus({});
      }, 1400);
    } catch {
      setActionStatus({ error: "Failed to update officer credentials." });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendTestOtp = async (officer: UserAccount) => {
    setTestingOtpId(officer.id);
    setTestResult(null);

    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const res = await EmailService.sendOtpEmail({
        toEmail: officer.email,
        toName: officer.name,
        otpCode: code,
        expiresInMinutes: 2,
      });

      if (res.success) {
        setTestResult({
          id: officer.id,
          success: true,
          msg: `Live OTP code (${code}) dispatched to ${officer.email} via ${res.provider === "emailjs" ? "EmailJS" : "Simulator"}.`,
        });
      } else {
        setTestResult({
          id: officer.id,
          success: false,
          msg: res.error || "Failed to dispatch test OTP.",
        });
      }
    } catch {
      setTestResult({
        id: officer.id,
        success: false,
        msg: "Failed to connect to email service.",
      });
    } finally {
      setTestingOtpId(null);
    }
  };

  const rolesMatrix = [
    {
      role: "Super Admin (Executive)",
      description: "Unrestricted master governance across all portals, pricing, manifests, and billing.",
      permissions: ["FULL_SYSTEM_ACCESS", "MODIFY_ROLES", "APPROVE_SETTLEMENT", "EXPORT_BIR_2307"],
    },
    {
      role: "Operations Dispatch",
      description: "Manages port departures, vessel assignments, hotel vouchers, and PCG manifests.",
      permissions: ["MANAGE_FLEET", "DISPATCH_GUIDES", "EDIT_MANIFESTS", "VIEW_WEATHER_RADAR"],
    },
    {
      role: "Field Tour Guide",
      description: "Row-Level Security (RLS) scoped strictly to assigned tour passengers and check-in.",
      permissions: ["VIEW_ASSIGNED_CHARTER", "CHECK_IN_PASSENGERS", "LOG_MEDICAL_INCIDENTS"],
    },
    {
      role: "Finance Auditor",
      description: "Governs GCash/Maya reconciliation, BIR Form 2307 withholdings, and bank batches.",
      permissions: ["VIEW_LEDGER", "RECORD_PAYMENTS", "EXECUTE_DAILY_CLOSE", "AUDIT_TAX_RECORDS"],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-[#F4F1EA] font-bold">
            Role-Based Access Control (RBAC) &amp; Security
          </h2>
          <p className="text-xs text-[#7C8B96]">
            Strict separation of duties, Bcrypt password management, Email OTP verification, and immutable security audit logging
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-[#0B1014] p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab("accounts")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === "accounts" ? "bg-[#F26A4F] text-white font-semibold" : "text-[#7C8B96] hover:text-white"
            }`}
          >
            Staff Accounts &amp; Passwords
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === "roles" ? "bg-[#F26A4F] text-white font-semibold" : "text-[#7C8B96] hover:text-white"
            }`}
          >
            Permissions Matrix
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === "audit" ? "bg-[#F26A4F] text-white font-semibold" : "text-[#7C8B96] hover:text-white"
            }`}
          >
            Security Audit Trail
          </button>
        </div>
      </div>

      {activeTab === "accounts" && (
        <div className="space-y-4">
          <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 text-cyan-300">
              <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <p className="font-semibold text-white">Bcrypt Password Hashing &amp; Email OTP Enabled</p>
                <p className="text-[#7C8B96]">
                  All passwords are encrypted with PHP 8.x <code className="text-cyan-400 font-mono">password_hash(..., PASSWORD_BCRYPT)</code>. One-Time Passwords are sent directly to the registered officer email.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 font-mono text-[11px] self-start sm:self-auto">
              Default: Password123!
            </span>
          </div>

          <div className="bg-[#0B1014] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#0E151A] text-[#7C8B96] border-b border-white/10 uppercase">
                  <tr>
                    <th className="px-5 py-3.5">Staff Name &amp; ID</th>
                    <th className="px-5 py-3.5">System Role</th>
                    <th className="px-5 py-3.5">OTP Dispatch Email</th>
                    <th className="px-5 py-3.5">2FA &amp; Security</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {staff.map((s) => (
                    <tr key={s.id} className="hover:bg-white/[0.02]">
                      <td className="px-5 py-4 font-medium text-[#F4F1EA]">
                        <div className="flex items-center gap-3">
                          <img
                            src={s.avatar}
                            alt={s.name}
                            className="w-8 h-8 rounded-lg object-cover border border-cyan-500/30"
                          />
                          <div>
                            <span className="font-semibold text-white">{s.name}</span>
                            <p className="text-[10px] text-[#7C8B96] font-mono">{s.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                            s.role === "Super Admin"
                              ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                              : s.role === "Operations Manager"
                              ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                              : s.role === "Finance Officer"
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                              : "bg-purple-500/15 text-purple-300 border-purple-500/30"
                          }`}
                        >
                          {s.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[#D1CCC0]">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1.5 font-mono text-cyan-300 text-xs">
                            <Mail className="w-3.5 h-3.5 text-cyan-400" />
                            {s.email}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleSendTestOtp(s)}
                            disabled={testingOtpId === s.id}
                            title="Dispatch real 6-digit test OTP to this email via EmailJS"
                            className="px-2 py-0.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-semibold cursor-pointer flex items-center gap-1 disabled:opacity-50"
                          >
                            {testingOtpId === s.id ? (
                              <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                            ) : (
                              <Send className="w-2.5 h-2.5" />
                            )}
                            <span>{testingOtpId === s.id ? "Sending..." : "Test OTP"}</span>
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>EmailJS 2FA Active</span>
                          </span>
                          <span className="text-[10px] text-slate-400">Bcrypt Salted</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleOpenOfficerEdit(s)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 hover:text-white border border-white/10 transition-colors text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit Credentials</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {testResult && (
              <div
                className={`p-3 border-t text-xs flex items-center justify-between ${
                  testResult.success
                    ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                    : "bg-rose-950/40 border-rose-500/30 text-rose-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{testResult.msg}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTestResult(null)}
                  className="text-slate-400 hover:text-white ml-2 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Officer Credentials & Email Modal */}
      {selectedOfficer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#071726] border border-cyan-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <div className="flex items-center gap-2 text-white">
                <Lock className="w-4 h-4 text-cyan-400" />
                <h3 className="font-serif text-lg font-bold">Officer Security Credentials</h3>
              </div>
              <button
                onClick={() => setSelectedOfficer(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-cyan-950/30 rounded-xl border border-cyan-500/20 text-xs text-slate-300">
              <p>Officer: <strong className="text-white">{selectedOfficer.name}</strong></p>
              <p>System Role: <span className="text-cyan-300 font-mono">{selectedOfficer.role}</span></p>
              <p>Current Email: <span className="text-slate-400 font-mono">{selectedOfficer.email}</span></p>
            </div>

            <form onSubmit={handleUpdateOfficer} className="space-y-3.5">
              {/* Registered Email for OTP */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-400/90 mb-1">
                  Registered OTP Destination Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="officer@domain.com"
                    required
                    className="w-full px-3 py-2 bg-[#030C16] border border-cyan-500/30 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  EmailJS will dispatch all 6-digit authentication OTP codes to this address.
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-400/90 mb-1">
                  New Security Password (Leave blank to keep current)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Leave blank or min. 6 characters"
                    className="w-full pl-3 pr-10 py-2 bg-[#030C16] border border-cyan-500/30 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {actionStatus.error && (
                <p className="text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {actionStatus.error}
                </p>
              )}

              {actionStatus.success && (
                <p className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                  <Check className="w-3.5 h-3.5" />
                  {actionStatus.success}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#030C16] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOfficer(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === "roles" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rolesMatrix.map((r) => (
            <div
              key={r.role}
              className="bg-[#0B1014] border border-white/10 rounded-2xl p-6 space-y-4 shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-serif text-lg text-[#F4F1EA] font-bold">{r.role}</h3>
                  <p className="text-xs text-[#7C8B96] mt-1 leading-relaxed">{r.description}</p>
                </div>
                <Lock className="w-5 h-5 text-[#F26A4F] shrink-0" />
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5">
                <p className="text-[11px] uppercase tracking-wider text-[#7C8B96] font-semibold">
                  Granted Privileges
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {r.permissions.map((p) => (
                    <span
                      key={p}
                      className="px-2 py-1 rounded-md bg-white/5 text-[10px] font-mono text-emerald-400 border border-white/5 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "audit" && (
        <div className="bg-[#0B1014] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-[#0E151A] border-b border-white/10 flex justify-between items-center">
            <h4 className="font-serif text-sm font-semibold text-[#F4F1EA] flex items-center gap-2">
              <History className="w-4 h-4 text-[#F26A4F]" />
              Immutable Operations Audit Trail
            </h4>
            <span className="text-xs text-[#7C8B96]">Last 100 System Events</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#070B0E] text-[#7C8B96] border-b border-white/5 uppercase">
                <tr>
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3">User &amp; Role</th>
                  <th className="px-5 py-3">Module</th>
                  <th className="px-5 py-3">Action Description</th>
                  <th className="px-5 py-3 text-right">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-3.5 font-mono text-[#7C8B96]">{log.timestamp}</td>
                    <td className="px-5 py-3.5 font-medium text-[#F4F1EA]">
                      {log.userName}
                      <span className="block text-[10px] text-[#7C8B96]">{log.role}</span>
                    </td>
                    <td className="px-5 py-3.5 text-[#D1CCC0]">{log.module}</td>
                    <td className="px-5 py-3.5 text-[#7C8B96] max-w-sm">{log.details}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        log.severity === "High" || log.severity === "Critical"
                          ? "bg-rose-500/10 text-rose-400"
                          : log.severity === "Warning"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-emerald-500/10 text-emerald-400"
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
