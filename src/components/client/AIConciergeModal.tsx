import React, { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User, Compass, CheckCircle2, ArrowRight, Zap, Anchor, Shield } from "lucide-react";
import { StorageService, CONCIERGE_AUTO_REPLIES } from "../../services/storage";
import { ConciergeAutoReply } from "../../types";

interface Message {
  id: string;
  sender: "concierge" | "user";
  text: string;
  timestamp: string;
  suggestedAction?: ConciergeAutoReply["suggestedAction"];
}

interface AIConciergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWeather?: () => void;
  onOpenTracker?: () => void;
}

export const AIConciergeModal: React.FC<AIConciergeModalProps> = ({
  isOpen,
  onClose,
  onOpenWeather,
  onOpenTracker,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-welcome",
      sender: "concierge",
      text: "Mabuhay! Welcome to ALYN SHIR Island Expeditions & Marine Charters.\n\nI am your automated 24/7 expedition assistant. I can instantly assist you with island tour details, 30% downpayment policies, gear packing lists, PAGASA maritime safety advisories, and QR boarding passes.\n\nSelect a topic below or type your inquiry!",
      timestamp: "Just now",
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 80);
    }
  }, [isOpen, messages, isTyping]);

  if (!isOpen) return null;

  const handleSelectPrebuilt = (reply: ConciergeAutoReply) => {
    sendMessage(reply.quickReply, reply.detailedReply, reply.suggestedAction);
  };

  const handleSendInput = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputPrompt.trim();
    if (!query) return;

    // Search local auto-reply database
    const matched = StorageService.findAutoReply(query);
    let replyText = "";
    let action = matched?.suggestedAction;

    if (matched) {
      replyText = matched.detailedReply;
    } else {
      replyText =
        "Thank you for contacting ALYN SHIR! For your expedition inquiry:\n\n• All scheduled charters include Coast Guard manifest clearance, DOT master guides, and buffet catering.\n• A 30% downpayment locks your vessel slot, with the balance payable via GCash, Maya, or bank transfer prior to departure.\n• You can check our live weather telemetry or contact our Novaliches operations center for custom group charters.";
    }

    sendMessage(query, replyText, action);
    setInputPrompt("");
  };

  const sendMessage = (
    userText: string,
    responseText: string,
    action?: ConciergeAutoReply["suggestedAction"]
  ) => {
    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Fast, natural automated response delay
    setTimeout(() => {
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: "concierge",
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedAction: action,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 280);
  };

  const handleActionClick = (action: ConciergeAutoReply["suggestedAction"]) => {
    if (!action) return;
    onClose();
    if (action.actionType === "weather" && onOpenWeather) {
      onOpenWeather();
    } else if (action.actionType === "track" && onOpenTracker) {
      onOpenTracker();
    } else if (action.actionType === "packages") {
      const el = document.getElementById("expeditions-catalog");
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#071726] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl my-6 flex flex-col h-[680px] max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#0B2238]/80 px-6 py-4 border-b border-cyan-500/20 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/20">
              <Anchor className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-white font-bold flex items-center gap-2">
                <span>ALYN SHIR Automated Concierge</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-sans font-medium border border-cyan-500/25 flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5" /> Instant Auto-Reply
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Philippine Island Expedition &amp; Marine Logistics Assistant
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

        {/* Message Log */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#030C16]/90">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 ${
                  msg.sender === "user"
                    ? "bg-cyan-500 text-[#030C16] font-bold"
                    : "bg-cyan-950/60 text-cyan-400 border border-cyan-500/30"
                }`}
              >
                {msg.sender === "user" ? <User className="w-4 h-4" /> : <Compass className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-cyan-600 text-white rounded-tr-xs shadow-md shadow-cyan-950"
                    : "bg-[#071726] text-slate-200 border border-cyan-500/15 rounded-tl-xs whitespace-pre-line shadow-md"
                }`}
              >
                {msg.text}

                {/* Suggested Action Pill */}
                {msg.suggestedAction && (
                  <div className="mt-3 pt-2 border-t border-cyan-500/20 flex justify-start">
                    <button
                      onClick={() => handleActionClick(msg.suggestedAction)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <span>{msg.suggestedAction.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <span
                  className={`block text-[10px] mt-1.5 ${
                    msg.sender === "user" ? "text-cyan-100/70 text-right" : "text-slate-400"
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-2xl bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="bg-[#071726] border border-cyan-500/20 px-4 py-2.5 rounded-2xl text-xs text-cyan-400/80 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                Instant automated reply compiling...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Topic Chips (Instant Auto Replies) */}
        <div className="px-5 py-2.5 bg-[#0B2238]/60 border-t border-cyan-500/15 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
          {CONCIERGE_AUTO_REPLIES.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelectPrebuilt(item)}
              className="text-[11px] px-3.5 py-1.5 rounded-full bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-200 border border-cyan-500/25 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>{item.title}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#071726] border-t border-cyan-500/20 shrink-0">
          <form onSubmit={handleSendInput} className="flex items-center gap-2">
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask about booking, 30% downpayment, gear checklist, or weather..."
              className="flex-1 bg-[#030C16] border border-cyan-500/25 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim()}
              className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-[#030C16] font-bold transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
