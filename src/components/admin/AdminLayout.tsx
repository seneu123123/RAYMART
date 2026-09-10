import React, { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Users,
  ClipboardList,
  Compass,
  Anchor,
  Hotel,
  Receipt,
  Scale,
  MessageSquare,
  Server,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  UserCircle,
} from "lucide-react";
import { UserAccount, AdminModuleKey } from "../../types";
import { StorageService } from "../../services/storage";

interface AdminLayoutProps {
  currentUser: UserAccount;
  activeModule: AdminModuleKey;
  onSelectModule: (module: AdminModuleKey) => void;
  onSwitchPortal: (portal: "client" | "admin") => void;
  onSwitchUser: (userId: string) => void;
  onLogout?: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentUser,
  activeModule,
  onSelectModule,
  onSwitchPortal,
  onSwitchUser,
  onLogout,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const staffList = StorageService.getStaffAccounts();

  const navigationItems: {
    key: AdminModuleKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { key: "dashboard", label: "Operations Dashboard", icon: LayoutDashboard },
    { key: "packages", label: "Tour Packages & Catalog", icon: Package },
    { key: "guides", label: "DOT Guide Roster", icon: Users },
    { key: "manifest", label: "Passenger Manifest (PCG)", icon: ClipboardList },
    { key: "fleet", label: "Fleet & Vessels", icon: Anchor },
    { key: "hotels", label: "Hotel Accommodations", icon: Hotel },
    { key: "billing", label: "Billing & Invoices (BIR 2307)", icon: Receipt },
    { key: "settlement", label: "Daily Reconciliation", icon: Scale },
    { key: "reviews", label: "CSAT & Guest Feedback", icon: MessageSquare },
    { key: "laravel_hub", label: "Laravel Hub & API Sync", icon: Server },
    { key: "rbac", label: "RBAC & Team Access", icon: ShieldCheck },
    { key: "settings", label: "Tower System Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#030C16] flex flex-col md:flex-row text-slate-300 transition-colors">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-[#071726] border-b border-cyan-500/20 px-4 py-3 flex items-center justify-between z-30">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg bg-white/5 text-white"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-serif font-bold text-lg text-white">ALYN SHIR Ops</span>
        </div>
        <button
          onClick={() => onSwitchPortal("client")}
          className="text-xs px-2.5 py-1 rounded-lg bg-cyan-500 text-[#030C16] font-bold"
        >
          Traveler View
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#071726] border-r border-cyan-500/15 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Brand Header */}
          <div className="p-5 border-b border-cyan-500/15 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Anchor className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-base text-white tracking-wide">
                  ALYN SHIR
                </h2>
                <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-semibold font-mono">
                  Operations Tower
                </span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Persona Switcher */}
          <div className="px-4 py-3 bg-[#030C16] border-b border-white/5">
            <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-semibold font-mono">
              Simulate Active Staff Role:
            </label>
            <select
              value={currentUser.id}
              onChange={(e) => onSwitchUser(e.target.value)}
              className="w-full bg-[#071726] border border-cyan-500/20 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              {staffList.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.role})
                </option>
              ))}
            </select>
          </div>

          {/* Navigation Links (12 Modules) */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    onSelectModule(item.key);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-cyan-500 text-[#030C16] font-bold shadow-md shadow-cyan-500/20"
                      : "text-slate-300 hover:bg-cyan-950/40 hover:text-cyan-200"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#030C16]" : "text-cyan-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </nav>

          {/* Bottom Return to Traveler Portal & Lock */}
          <div className="p-4 border-t border-cyan-500/15 space-y-2">
            <button
              onClick={onLogout || (() => onSwitchPortal("client"))}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#030C16] hover:bg-rose-950/30 text-xs font-semibold text-rose-300 hover:text-rose-200 transition-colors cursor-pointer border border-rose-500/20"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Lock Tower &amp; Log Out</span>
            </button>
            <p className="text-[10px] text-center text-slate-400">
              DOT License: DOT-ACCR-RO7-2026-8819
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col overflow-y-auto">
        {/* Top bar */}
        <header className="hidden md:flex items-center justify-between h-16 px-8 bg-[#071726]/80 border-b border-cyan-500/15 backdrop-blur-md">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>Operations Tower</span>
            <span>/</span>
            <span className="text-white capitalize font-semibold">
              {activeModule.replace("_", " ")}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>OTP Authenticated</span>
            </div>

            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>PCG Ports Cleared</span>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <UserCircle className="w-5 h-5 text-cyan-400" />
              <div>
                <span className="text-white font-semibold">{currentUser.name}</span>
                <span className="text-slate-400 ml-1">({currentUser.role})</span>
              </div>
            </div>

            <button
              onClick={onLogout || (() => onSwitchPortal("client"))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-slate-300 hover:text-rose-200 text-xs font-medium transition-colors cursor-pointer"
              title="Lock operations tower session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock Tower</span>
            </button>
          </div>
        </header>

        {/* Dynamic Module Outlet */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};
