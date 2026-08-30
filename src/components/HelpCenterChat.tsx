import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Phone,
  Mail,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Clock,
  ShieldCheck,
  Zap,
  HelpCircle,
  ExternalLink,
  User,
  ArrowRight
} from 'lucide-react';
import { UserProfile } from '../types';
import { API_BASE_URL } from '../lib/apiBase';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  needsEscalation?: boolean;
}

interface HelpCenterChatProps {
  userProfile: UserProfile | null;
}

const QUICK_SUGGESTIONS = [
  '⚡ Wire gauge for AC & Geyser',
  '🚀 60-Min Kolkata Delivery',
  '📄 Download GST Tax Invoice',
  '🔧 Book an Electrician',
  '🔄 Return & Replacement Policy',
  '📞 Talk to Human Agent'
];

export const HelpCenterChat: React.FC<HelpCenterChatProps> = ({ userProfile }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hello ${userProfile?.name || 'there'}! 👋 I am your **BuildNow 24/7 AI Support Specialist**.\n\nI can help you with Kolkata 60-min delivery updates, technical wire/MCB sizing recommendations, GST invoices, electrician bookings, and store policies. How may I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSecondaryContacts, setShowSecondaryContacts] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  const scrollToBottom = (smooth = true) => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  // Ensure window is always at top on initial mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Only scroll inner chat container when messages are added or when loading state changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    scrollToBottom(true);
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/gemini/support-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.sender,
            content: m.text
          })),
          customerName: userProfile?.name || 'Giriraj Customer',
          customerEmail: userProfile?.email || '',
          customerArea: 'Kolkata'
        })
      });


      if (!response.ok) {
        throw new Error('Support service unavailable');
      }

      const data = await response.json();
      const botMessage: Message = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.text || 'I am ready to help. If your inquiry requires physical warehouse dispatch intervention, feel free to tap the direct contact options below.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        needsEscalation: data.needsEscalation || query.toLowerCase().includes('human') || query.toLowerCase().includes('call')
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      // Offline fallback
      const fallbackMessage: Message = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: `I've noted your question regarding **"${query}"**.\n\nOur team delivers across all Kolkata zones within 60 minutes. For urgent order modifications or technical contractor quotes, you can send us an email or tap the dialer button below to speak directly with our desk.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        needsEscalation: true
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialer = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleOpenWhatsApp = (phone: string, text: string) => {
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const renderFormattedText = (text: string) => {
    // Process markdown-like bold and bullet formatting for clean chat bubbles
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 leading-relaxed text-xs sm:text-[13px]">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;
          
          // Bullet point
          if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
            const clean = line.replace(/^[•\-]\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1">
                <span className="text-amber-500 font-bold mt-0.5">•</span>
                <span>{renderBoldSpans(clean)}</span>
              </div>
            );
          }

          return <p key={idx}>{renderBoldSpans(line)}</p>;
        })}
      </div>
    );
  };

  const renderBoldSpans = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="space-y-4">
      {/* 1. TOP PRIMARY ACTION OPTIONS: GEMINI CHAT (MAIN) & EMAIL SUPPORT */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-950 px-2 py-0.5 rounded-md">
                <Sparkles className="w-3 h-3 text-amber-600" />
                Primary Support
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live 24/7
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 mt-1">BuildNow AI Help Desk</h2>
          </div>

          {/* Direct External Option: Email Support */}
          <a
            href="mailto:team@girirajpower.in?subject=Support Request - Giriraj Power Customer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-2xs hover:shadow-xs shrink-0"
          >
            <Mail className="w-4 h-4 text-amber-400" />
            <span>Email Official Support</span>
          </a>
        </div>
        <p className="text-xs text-slate-600">
          Instant automated answers for orders, 60-min delivery, wire gauges, GST tax invoices, and electrician booking.
        </p>
      </div>

      {/* 2. MAIN CHATBOT WINDOW (MAIN EVENT) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[520px] sm:h-[580px]">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 px-4 py-3 text-white flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-black flex items-center justify-center font-bold shadow-2xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-white flex items-center gap-1.5">
                Gemini AI Support Specialist
              </p>
              <p className="text-[10px] text-amber-300 font-medium">Kasba Central Warehouse • Instant Response</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setMessages([
                {
                  id: 'welcome-reset',
                  sender: 'assistant',
                  text: 'Chat history cleared. How can I help you with your electrical or hardware needs today?',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ]);
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors text-xs flex items-center gap-1 cursor-pointer"
            title="Reset Chat"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Clear</span>
          </button>
        </div>

        {/* Chat Message Stream */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-end gap-2 max-w-[88%] sm:max-w-[80%]">
                  {!isUser && (
                    <div className="w-6 h-6 rounded-full bg-amber-400 text-black flex items-center justify-center shrink-0 mb-1 text-[10px] font-bold shadow-2xs">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-4 py-3 shadow-2xs text-slate-800 ${
                      isUser
                        ? 'bg-amber-400 text-slate-950 font-medium rounded-br-xs'
                        : 'bg-white border border-slate-200/80 rounded-bl-xs'
                    }`}
                  >
                    {renderFormattedText(msg.text)}

                    {/* If Gemini notes escalation or cannot solve, render direct contact action buttons (Numbers Hidden behind Dialers) */}
                    {!isUser && msg.needsEscalation && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                        <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Direct Human Contact Options:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleOpenWhatsApp('918777400280', 'Hello Giriraj Power Kasba, I need help with my electrical order.')}
                            className="flex items-center justify-center gap-2 p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-950 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Open WhatsApp Chat</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenDialer('+919007168561')}
                            className="flex items-center justify-center gap-2 p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Open Phone Dialer (Contractor)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenDialer('+919874569712')}
                            className="flex items-center justify-center gap-2 p-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-950 text-xs font-bold transition-colors cursor-pointer sm:col-span-2"
                          >
                            <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>Open Phone Dialer (Customer Helpline)</span>
                          </button>
                        </div>
                      </div>
                    )}

                    <span
                      className={`block text-[10px] mt-1.5 text-right ${
                        isUser ? 'text-slate-700' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  {isUser && (
                    <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 mb-1 text-[10px] font-bold">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-end gap-2 max-w-[80%]">
              <div className="w-6 h-6 rounded-full bg-amber-400 text-black flex items-center justify-center shrink-0 mb-1">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl rounded-bl-xs px-4 py-3 shadow-2xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-xs text-slate-500 font-medium ml-1">Gemini AI is analyzing...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 py-2 bg-slate-100/80 border-t border-slate-200/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {QUICK_SUGGESTIONS.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(suggestion.replace(/^[^\w\s]+\s*/, ''))}
              disabled={isLoading}
              className="text-[11px] font-bold text-slate-700 bg-white hover:bg-amber-50 hover:text-slate-900 border border-slate-200 rounded-full px-2.5 py-1 whitespace-nowrap transition-colors shrink-0 cursor-pointer disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about delivery, wire sizes, GST invoices..."
            disabled={isLoading}
            className="flex-1 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white text-slate-900 placeholder:text-slate-400 transition-all"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-black font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-2xs"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* 3. SECONDARY / COMPACT COLLAPSIBLE: DIRECT ESCALATION DESK (Numbers Hidden Behind Dialer Buttons) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <button
          type="button"
          onClick={() => setShowSecondaryContacts(!showSecondaryContacts)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Phone className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Alternative Support & Contractor Desk</p>
              <p className="text-[11px] text-slate-500">Tap to open phone dialers or WhatsApp directly</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <span>{showSecondaryContacts ? 'Hide' : 'Show'}</span>
            {showSecondaryContacts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showSecondaryContacts && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-2.5">
            <p className="text-[11px] text-slate-600">
              Numbers are masked for privacy. Clicking a button below will immediately open your phone&apos;s dialer with the support line pre-filled:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {/* WhatsApp Button */}
              <button
                type="button"
                onClick={() => handleOpenWhatsApp('918777400280', 'Hi Giriraj Power, I am contacting you from the app support center.')}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open WhatsApp</span>
              </button>

              {/* Contractor Line Button */}
              <button
                type="button"
                onClick={() => handleOpenDialer('+919007168561')}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Open Dialer (Contractor)</span>
              </button>

              {/* Alternative Support Line Button */}
              <button
                type="button"
                onClick={() => handleOpenDialer('+919874569712')}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Open Dialer (Customer Care)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. FREQUENTLY ASKED QUESTIONS */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
          Frequently Asked Questions
        </h3>
        <div className="space-y-3 text-xs">
          <div className="border-b border-slate-100 pb-2.5">
            <p className="font-bold text-slate-900">How fast is the express delivery in Kolkata?</p>
            <p className="text-slate-600 mt-0.5">
              We dispatch in 60 minutes across Kasba, Nator Park, Salt Lake, New Town, Park Street, Ballygunge, Gariahat, and all covered Kolkata zones directly from our Kasba warehouse.
            </p>
          </div>
          <div className="border-b border-slate-100 pb-2.5">
            <p className="font-bold text-slate-900">Are genuine manufacturer warranty cards & GST bills included?</p>
            <p className="text-slate-600 mt-0.5">
              Yes, 100% of Polycab, Havells, Anchor, and Finolex products come sealed with genuine ISI guarantee stamps and GST tax invoices.
            </p>
          </div>
          <div>
            <p className="font-bold text-slate-900">Can I request a certified electrician?</p>
            <p className="text-slate-600 mt-0.5">
              Yes! You can ask our Gemini AI chat above to schedule an electrician or book a verified technician through the electrician service tab.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
