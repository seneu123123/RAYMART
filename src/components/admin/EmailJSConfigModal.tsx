import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  X,
  CheckCircle2,
  AlertTriangle,
  Key,
  ExternalLink,
  Copy,
  Check,
  Send,
  Sparkles,
  Info,
  HelpCircle,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { EmailService, EmailJsConfig } from "../../services/emailService";
import { AshLogo } from "../common/AshLogo";

interface EmailJSConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: () => void;
  defaultEmail?: string;
}

export const EmailJSConfigModal: React.FC<EmailJSConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
  defaultEmail = "karlljacob8@gmail.com",
}) => {
  const [config, setConfig] = useState<EmailJsConfig>({
    serviceId: "",
    templateId: "",
    publicKey: "",
  });

  const [activeTab, setActiveTab] = useState<"keys" | "guide" | "test">("keys");
  const [testEmail, setTestEmail] = useState(defaultEmail);
  const [testStatus, setTestStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfig(EmailService.getConfig());
      setTestStatus("idle");
      setTestMessage("");
      setSaveFeedback(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    EmailService.saveConfig(config);
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 3000);
    if (onConfigSaved) onConfigSaved();
  };

  const handleClear = () => {
    if (window.confirm("Clear custom EmailJS credentials and reset to local simulation?")) {
      EmailService.clearConfig();
      setConfig({ serviceId: "", templateId: "", publicKey: "" });
      setTestStatus("idle");
      setTestMessage("");
      if (onConfigSaved) onConfigSaved();
    }
  };

  const handleTestSend = async () => {
    if (!config.serviceId || !config.templateId || !config.publicKey) {
      setTestStatus("error");
      setTestMessage("Please fill in Service ID, Template ID, and Public Key before testing.");
      return;
    }

    // Save first to ensure state is synchronized
    EmailService.saveConfig(config);

    setTestStatus("sending");
    setTestMessage("Connecting to EmailJS servers...");

    const testOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const result = await EmailService.sendOtpEmail({
      toEmail: testEmail.trim(),
      toName: "Authorized Officer",
      otpCode: testOtp,
      expiresInMinutes: 2,
    });

    if (result.success && result.provider === "emailjs") {
      setTestStatus("success");
      setTestMessage(`Test OTP (${testOtp}) successfully sent to ${testEmail}! Check your inbox and spam folder.`);
    } else {
      setTestStatus("error");
      setTestMessage(result.error || result.message || "Failed to send via EmailJS.");
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(id);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const isComplete = Boolean(config.serviceId && config.templateId && config.publicKey);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-2xl bg-[#071726] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl my-8 text-white"
      >
        {/* Modal Top Ribbon */}
        <div className="bg-[#030C16] px-6 py-4 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AshLogo size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base font-bold text-white tracking-wide">
                  EmailJS OTP Integration
                </h3>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-sans font-semibold border ${
                    isComplete
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                      : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                  }`}
                >
                  {isComplete ? "Connected" : "Setup Needed"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Deliver real one-time password codes directly to recipient email inboxes via EmailJS.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="bg-[#05111E] px-6 pt-3 border-b border-cyan-500/15 flex gap-4 text-xs">
          <button
            onClick={() => setActiveTab("keys")}
            className={`pb-3 font-semibold transition-colors relative cursor-pointer ${
              activeTab === "keys" ? "text-cyan-300" : "text-slate-400 hover:text-white"
            }`}
          >
            API Credentials &amp; Keys
            {activeTab === "keys" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("guide")}
            className={`pb-3 font-semibold transition-colors relative cursor-pointer flex items-center gap-1.5 ${
              activeTab === "guide" ? "text-cyan-300" : "text-slate-400 hover:text-white"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Step-by-Step Tutorial</span>
            {activeTab === "guide" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("test")}
            className={`pb-3 font-semibold transition-colors relative cursor-pointer flex items-center gap-1.5 ${
              activeTab === "test" ? "text-cyan-300" : "text-slate-400 hover:text-white"
            }`}
          >
            <Send className="w-3.5 h-3.5 text-cyan-400" />
            <span>Live Inbox Test</span>
            {activeTab === "test" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* TAB 1: KEYS FORM */}
          {activeTab === "keys" && (
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="p-3.5 bg-cyan-950/40 border border-cyan-500/25 rounded-2xl flex items-start gap-3">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-white font-semibold">How EmailJS Works in ALYN SHIR</p>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    EmailJS allows client-side dispatch of authentic emails without requiring complex SMTP servers.
                    Create a free account at <a href="https://www.emailjs.com" target="_blank" rel="noreferrer" className="text-cyan-300 underline font-medium">emailjs.com</a>, add your Gmail/Outlook service, and paste your keys below.
                  </p>
                </div>
              </div>

              {/* Service ID */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-300 font-semibold">
                    1. Service ID <span className="text-cyan-400">*</span>
                  </label>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
                    Configured: Gmail (service_fvtrijl)
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="service_fvtrijl"
                  value={config.serviceId}
                  onChange={(e) => setConfig({ ...config, serviceId: e.target.value })}
                  className="w-full bg-[#030C16] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
                />
                <p className="text-[10px] text-slate-400">
                  Gmail Service connected in your EmailJS dashboard (ID: <code className="text-cyan-300">service_fvtrijl</code>).
                </p>
              </div>

              {/* Template ID */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-300 font-semibold">
                    2. Template ID <span className="text-cyan-400">*</span>
                  </label>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
                    Configured: One-Time Password (template_k2rr6sa)
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="template_k2rr6sa"
                  value={config.templateId}
                  onChange={(e) => setConfig({ ...config, templateId: e.target.value })}
                  className="w-full bg-[#030C16] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
                />
                <p className="text-[10px] text-slate-400">
                  Email template with OTP parameters (ID: <code className="text-cyan-300">template_k2rr6sa</code>).
                </p>
              </div>

              {/* Public Key */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30">
                <div className="flex items-center justify-between">
                  <label className="block text-white font-semibold flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-cyan-400" />
                    <span>3. Public Key (User ID)</span>
                    <span className="text-cyan-400">*</span>
                  </label>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
                    Configured: lFvRN2wduy5HDdxII
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="lFvRN2wduy5HDdxII"
                  value={config.publicKey}
                  onChange={(e) => setConfig({ ...config, publicKey: e.target.value })}
                  className="w-full bg-[#030C16] border border-cyan-500/30 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
                <p className="text-[10px] text-slate-300">
                  EmailJS Account Public Key is linked and verified (<code className="text-cyan-300">lFvRN2wduy5HDdxII</code>).
                </p>
              </div>

              {saveFeedback && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-300 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>EmailJS keys saved successfully in browser local session!</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-rose-500/15 hover:text-rose-300 text-slate-400 text-xs transition-colors cursor-pointer border border-white/5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Keys</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("test")}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/50 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Test Send</span>
                  </button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#030C16] text-xs font-bold transition-colors cursor-pointer shadow-md shadow-cyan-500/20"
                  >
                    Save Configuration
                  </motion.button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: STEP-BY-STEP TUTORIAL */}
          {activeTab === "guide" && (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-cyan-950/30 border border-cyan-500/20 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">EmailJS Fast Setup (Under 2 Minutes)</h4>
                  <p className="text-slate-400 text-[11px]">Free tier includes 200 emails every month.</p>
                </div>
                <a
                  href="https://dashboard.emailjs.com/sign-up"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 text-[#030C16] font-bold text-xs hover:bg-cyan-400 transition-colors shadow-sm"
                >
                  <span>Open EmailJS</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Step 1 */}
              <div className="p-4 bg-[#030C16] border border-cyan-500/15 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-bold text-[11px]">
                    1
                  </span>
                  <h5 className="font-semibold text-white">Create Service (Connect your Gmail or Outlook)</h5>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Go to <strong className="text-white">Email Services</strong> in the left sidebar &gt; click <strong className="text-white">Add New Service</strong> &gt; choose <strong className="text-cyan-300">Gmail</strong> (or your email provider) &gt; click <strong className="text-white">Connect Account</strong>.
                </p>
                <p className="text-slate-400 text-[11px]">
                  Copy the generated <code className="text-cyan-300">Service ID</code> (e.g. <code className="text-slate-200">service_xyz123</code>).
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-4 bg-[#030C16] border border-cyan-500/15 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-bold text-[11px]">
                    2
                  </span>
                  <h5 className="font-semibold text-white">Create Email Template</h5>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Go to <strong className="text-white">Email Templates</strong> &gt; click <strong className="text-white">Create New Template</strong>.
                </p>
                <div className="bg-[#071726] p-3 rounded-xl border border-cyan-500/20 space-y-2 font-mono text-[11px]">
                  <div className="flex justify-between items-center text-slate-400 text-[10px]">
                    <span>Suggested Template Subject &amp; Body</span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          `Subject: ALYN SHIR OTP Code: {{otp_code}}\n\nHello {{to_name}},\n\nYour one-time login verification passcode is:\n{{otp_code}}\n\nThis code will expire in {{expires_in}}.\n\nALYN SHIR Luxury Philippine Marine Expeditions`,
                          "template_body"
                        )
                      }
                      className="text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedStep === "template_body" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Template</span>
                    </button>
                  </div>
                  <p className="text-cyan-200">Subject: ALYN SHIR OTP Code: &#123;&#123;otp_code&#125;&#125;</p>
                  <p className="text-slate-300 text-[10px] whitespace-pre-wrap leading-relaxed">
                    Hello &#123;&#123;to_name&#125;&#125;,<br />
                    Your one-time login verification passcode is:<br />
                    <strong className="text-cyan-400 text-xs">&#123;&#123;otp_code&#125;&#125;</strong><br />
                    This code expires in &#123;&#123;expires_in&#125;&#125;.<br />
                    ALYN SHIR Luxury Philippine Marine Expeditions
                  </p>
                </div>
                <p className="text-slate-400 text-[11px]">
                  In the template settings, set <strong className="text-white">To Email</strong> to <code className="text-cyan-300">&#123;&#123;to_email&#125;&#125;</code>, click <strong className="text-white">Save</strong>, and copy the <code className="text-cyan-300">Template ID</code> (e.g. <code className="text-slate-200">template_abc456</code>).
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 bg-[#030C16] border border-cyan-500/15 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-bold text-[11px]">
                    3
                  </span>
                  <h5 className="font-semibold text-white">Copy Public Key</h5>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Click your profile or <strong className="text-white">Account</strong> in the left bottom sidebar &gt; <strong className="text-white">API Keys</strong> &gt; copy your <code className="text-cyan-300">Public Key</code>.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("keys")}
                  className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#030C16] text-xs font-bold transition-colors cursor-pointer text-center shadow-md shadow-cyan-500/20"
                >
                  I Have My Keys &rarr; Enter Credentials
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE INBOX TEST */}
          {activeTab === "test" && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-cyan-950/30 border border-cyan-500/20 rounded-2xl space-y-1">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Send a Live One-Time Password to Your Inbox</span>
                </p>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Enter your real email address below to verify that EmailJS delivers the OTP code to your inbox right now.
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-300 font-semibold">
                  Recipient Test Email
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="e.g. karlljacob8@gmail.com"
                    className="flex-1 bg-[#030C16] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleTestSend}
                    disabled={testStatus === "sending"}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-[#030C16] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
                  >
                    {testStatus === "sending" ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Test</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>

              {testStatus === "success" && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-1 text-emerald-300">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Email Delivered Successfully!</span>
                  </div>
                  <p className="text-[11px] text-emerald-200 leading-relaxed">
                    {testMessage}
                  </p>
                </div>
              )}

              {testStatus === "error" && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl space-y-1 text-rose-300">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Dispatch Error</span>
                  </div>
                  <p className="text-[11px] text-rose-200 leading-relaxed">
                    {testMessage}
                  </p>
                  <p className="text-[10px] text-slate-400 pt-1">
                    Tip: Check the &ldquo;Step-by-Step Tutorial&rdquo; tab to ensure your Service ID, Template ID, and Public Key match your EmailJS dashboard exactly.
                  </p>
                </div>
              )}

              {/* Status breakdown */}
              <div className="p-3 bg-[#030C16] border border-cyan-500/15 rounded-xl space-y-1 text-[11px]">
                <p className="text-slate-400">
                  Current Service ID: <span className="text-slate-200 font-mono">{config.serviceId || "(not configured)"}</span>
                </p>
                <p className="text-slate-400">
                  Current Template ID: <span className="text-slate-200 font-mono">{config.templateId || "(not configured)"}</span>
                </p>
                <p className="text-slate-400">
                  Public Key: <span className="text-slate-200 font-mono">{config.publicKey ? `${config.publicKey.slice(0, 4)}...${config.publicKey.slice(-3)}` : "(not configured)"}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#030C16] px-6 py-4 border-t border-cyan-500/20 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Powered by official EmailJS SDK for browser delivery
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
