import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Ship,
  Sparkles,
  CheckCheck,
} from "lucide-react";
import { ClientNotification } from "../../types";
import { StorageService } from "../../services/storage";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onInspectBooking: (bookingId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onInspectBooking,
}) => {
  const [notifications, setNotifications] = useState<ClientNotification[]>(() =>
    StorageService.getClientNotifications()
  );

  const refreshNotifications = () => {
    setNotifications(StorageService.getClientNotifications());
  };

  useEffect(() => {
    refreshNotifications();
    return StorageService.subscribe(() => {
      refreshNotifications();
    });
  }, []);

  const handleMarkAllRead = () => {
    StorageService.markAllNotificationsAsRead();
    refreshNotifications();
  };

  const handleNotificationClick = (notif: ClientNotification) => {
    StorageService.markNotificationAsRead(notif.id);
    refreshNotifications();
    onInspectBooking(notif.bookingId);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIconForType = (type: ClientNotification["type"]) => {
    switch (type) {
      case "payment_verified":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "payment_rephoto":
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      case "manifest_approved":
        return <ShieldCheck className="w-4 h-4 text-cyan-400" />;
      case "manifest_needed":
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
      case "boarding_pass_ready":
        return <QrCode className="w-4 h-4 text-cyan-400" />;
      case "embarked":
        return <Ship className="w-4 h-4 text-purple-400" />;
      default:
        return <Bell className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Drawer Body */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="relative z-10 w-full max-w-md h-full bg-[#071726] border-l border-cyan-500/20 text-white flex flex-col shadow-2xl"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#030C16]/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                    <span>Expedition Status Desk</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-mono bg-cyan-500 text-[#030C16] font-bold">
                        {unreadCount} New
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Live booking verification &amp; boarding updates
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleMarkAllRead}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors cursor-pointer"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <Bell className="w-10 h-10 text-slate-600 mb-3" />
                  <p className="font-serif text-sm text-slate-300 font-semibold">
                    No active notifications
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Updates regarding downpayments, manifest reviews, and official QR boarding passes will appear here.
                  </p>
                </div>
              ) : (
                notifications.map((n) => {
                  const isUnread = !n.read;
                  return (
                    <motion.div
                      key={n.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                        isUnread
                          ? "bg-cyan-950/40 border-cyan-500/40 shadow-lg shadow-cyan-500/10"
                          : "bg-[#030C16] border-white/5 text-slate-300 hover:border-cyan-500/20"
                      }`}
                    >
                      {/* Unread indicator dot */}
                      {isUnread && (
                        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      )}

                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-white/5 shrink-0 mt-0.5">
                          {getIconForType(n.type)}
                        </div>

                        <div className="flex-1 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold text-cyan-400 uppercase">
                              {n.bookingId}
                            </span>
                            <span className="text-slate-500 text-[10px]">•</span>
                            <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                          </div>

                          <h4 className="font-serif text-xs font-bold text-white mt-1">
                            {n.title}
                          </h4>

                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            {n.message}
                          </p>

                          <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 truncate max-w-[160px]">
                              {n.packageTitle}
                            </span>

                            <span className="inline-flex items-center gap-1 text-cyan-400 font-semibold group-hover:text-cyan-300">
                              <span>{n.actionLabel || "Inspect Booking"}</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-white/10 bg-[#030C16]/80 flex items-center justify-between text-xs text-slate-400">
              <span className="text-[11px]">
                Alyn Shir Operations Tower • 24/7 Manila Dispatch
              </span>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium cursor-pointer"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
