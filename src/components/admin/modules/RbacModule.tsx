import React, { useState } from "react";
import { ShieldCheck, Users, Lock, Key, CheckCircle2, History, AlertCircle } from "lucide-react";
import { UserAccount, AuditLogEntry } from "../../../types";
import { StorageService } from "../../../services/storage";

export const RbacModule: React.FC = () => {
  const staff = StorageService.getStaffAccounts();
  const logs = StorageService.getAuditLogs();
  const [activeTab, setActiveTab] = useState<"accounts" | "roles" | "audit">("accounts");

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
            Role-Based Access Control (RBAC) & System Audit
          </h2>
          <p className="text-xs text-[#7C8B96]">
            Strict separation of duties, Row-Level Security (RLS) for field guides, and immutable security audit logging
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
            Staff Accounts
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
        <div className="bg-[#0B1014] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0E151A] text-[#7C8B96] border-b border-white/10 uppercase">
                <tr>
                  <th className="px-5 py-3.5">Staff Name & ID</th>
                  <th className="px-5 py-3.5">System Role</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">DOT License Reference</th>
                  <th className="px-5 py-3.5">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {staff.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-4 font-medium text-[#F4F1EA]">
                      {s.name}
                      <p className="text-[10px] text-[#7C8B96] font-mono">{s.id}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-[#F26A4F]/10 text-[#F26A4F] text-[11px] font-medium border border-[#F26A4F]/20">
                        {s.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#D1CCC0]">{s.email}</td>
                    <td className="px-5 py-4 font-mono text-[#7C8B96]">{s.dotLicenseNumber || "EXECUTIVE-LEVEL"}</td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px]">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                        log.severity === "High"
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
