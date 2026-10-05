"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { SITE } from "@/lib/site";

type Message = { role: "user" | "assistant"; content: string };

export function AskAIPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const sendMessage = async () => {
    const q = input.trim();
    if (!q || loading) return;

    setInput("");
    const userMsg: Message = { role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          history: messages.slice(-8),
          session_id: sessionId,
        }),
      });

      const data = await res.json();
      if (data.error) {
        setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ ${data.error}` }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Maaf, terjadi gangguan koneksi. Silakan hubungi kami via [WhatsApp](https://wa.me/${SITE.whatsapp}) 🙏`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Tombol floating */}
      <button
        id="btn-ask-ai"
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Tanya AI"
        className={`fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-brand-strong text-white shadow-float transition-all hover:scale-105 hover:shadow-xl active:scale-95 ${open ? "scale-0 opacity-0" : "scale-100 opacity-100"}`}
      >
        <MessageCircle size={26} />
      </button>

      {/* Panel chat */}
      <div
        className={`fixed bottom-0 right-0 z-50 flex flex-col transition-all duration-300 sm:bottom-5 sm:right-5 ${
          open
            ? "h-[100dvh] w-full translate-y-0 opacity-100 sm:h-[540px] sm:w-[400px] sm:rounded-2xl"
            : "pointer-events-none h-0 w-0 translate-y-4 opacity-0"
        } overflow-hidden bg-surface shadow-float`}
        role="dialog"
        aria-label="Panel Tanya AI"
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-brand-dark/10 bg-brand-dark px-4 py-3 text-white">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-strong">
            <Bot size={20} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold !text-white">Asisten Ibra Jaya</p>
            <p className="text-[11px] text-white/60">Tanya seputar layanan kami</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Tutup chat"
            className="grid h-9 w-9 place-items-center rounded-xl hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-strong/10 text-brand-strong">
                <Bot size={28} />
              </div>
              <p className="font-heading text-sm font-bold text-brand-dark">Halo! Ada yang bisa dibantu? 👋</p>
              <p className="text-xs text-muted">Tanya soal sewa mobil, pengemudi, atau shuttle</p>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {[
                  "Mobil apa untuk 6 orang ke Bromo?",
                  "Bedanya lepas kunci dan pengemudi?",
                  "Jadwal shuttle Jakarta-Bandung?",
                ].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      setInput(q);
                      setTimeout(() => inputRef.current?.focus(), 50);
                    }}
                    className="rounded-xl border border-brand-dark/15 bg-white px-3 py-1.5 text-left text-xs font-medium text-brand-dark transition hover:border-brand-strong hover:bg-brand-strong/5"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div
                className={`grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg ${
                  m.role === "user" ? "bg-brand-strong text-white" : "bg-brand-dark/10 text-brand-dark"
                }`}
              >
                {m.role === "user" ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-brand-strong text-white rounded-tr-md"
                    : "bg-white text-ink shadow-soft rounded-tl-md"
                }`}
              >
                {m.content.split("\n").map((line, j) => (
                  <p key={j} className={j > 0 ? "mt-1" : ""}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2">
              <div className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg bg-brand-dark/10 text-brand-dark">
                <Bot size={14} />
              </div>
              <div className="flex items-center gap-2 rounded-2xl rounded-tl-md bg-white px-4 py-3 shadow-soft">
                <Loader2 size={16} className="animate-spin text-brand-strong" />
                <span className="text-xs text-muted">Sedang mengetik...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-brand-dark/10 bg-white p-3">
          <div className="flex items-end gap-2 rounded-xl border border-brand-dark/15 bg-surface-100 px-3 py-2 focus-within:border-brand-strong focus-within:ring-2 focus-within:ring-brand-strong/20">
            <textarea
              ref={inputRef}
              id="ask-ai-input"
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 500))}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pertanyaan..."
              rows={1}
              className="max-h-20 flex-1 resize-none bg-transparent text-sm text-ink outline-none placeholder:text-muted"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              aria-label="Kirim"
              className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-brand-strong text-white transition hover:bg-brand-hover disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="mt-1 text-center text-[10px] text-muted">
            AI bisa salah. Verifikasi info penting dengan admin.
          </p>
        </div>
      </div>
    </>
  );
}
