"use client";

import { useState, useEffect, useRef } from "react";
import { WhatsAppMessage, Deal } from "@/app/types";
import { getWhatsAppMessages, sendWhatsAppMessage } from "@/app/actions";

interface WhatsAppChatProps {
  deal: Deal;
  onClose: () => void;
}

export function WhatsAppChat({ deal, onClose }: WhatsAppChatProps) {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const phone = deal.phone || "";

  useEffect(() => {
    loadMessages();
    // Polling каждые 10 секунд для входящих
    const interval = setInterval(loadMessages, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deal.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadMessages() {
    try {
      const msgs = await getWhatsAppMessages(deal.id);
      setMessages(msgs);
    } catch {
      setError("Не удалось загрузить сообщения");
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    if (!input.trim()) return;
    if (!phone) {
      setError("У этой сделки нет номера телефона");
      return;
    }

    setSending(true);
    setError(null);

    try {
      await sendWhatsAppMessage({
        to: phone,
        body: input.trim(),
        dealId: deal.id,
      });
      setInput("");
      await loadMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка отправки");
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function formatTime(date: Date | null) {
    if (!date) return "";
    return new Date(date).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatDate(date: Date | null) {
    if (!date) return "";
    return new Date(date).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    });
  }

  // Группируем сообщения по дате
  const groupedMessages: { date: string; msgs: WhatsAppMessage[] }[] = [];
  let currentDate = "";
  for (const msg of messages) {
    const d = formatDate(msg.timestamp);
    if (d !== currentDate) {
      currentDate = d;
      groupedMessages.push({ date: d, msgs: [] });
    }
    groupedMessages[groupedMessages.length - 1].msgs.push(msg);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="flex flex-col w-full max-w-lg h-[600px] bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2a2a2a] bg-[#141414]">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25d366]">
            <svg viewBox="0 0 24 24" fill="white" className="h-5 w-5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white truncate">{deal.clientName}</p>
            <p className="text-xs text-[#a1a1a1]">{phone || "Нет номера телефона"}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#a1a1a1] hover:text-white transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0f0f0f]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-[#a1a1a1] text-sm">Загрузка...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25d366]/10">
                <svg viewBox="0 0 24 24" fill="#25d366" className="h-6 w-6">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <p className="text-[#a1a1a1] text-sm">Нет сообщений</p>
              <p className="text-[#555] text-xs">Отправьте первое сообщение клиенту</p>
            </div>
          ) : (
            groupedMessages.map((group) => (
              <div key={group.date}>
                <div className="flex items-center justify-center mb-3">
                  <span className="text-xs text-[#666] bg-[#1a1a1a] px-3 py-1 rounded-full">
                    {group.date}
                  </span>
                </div>
                <div className="space-y-2">
                  {group.msgs.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                          msg.direction === "outbound"
                            ? "bg-[#005c4b] text-white rounded-br-sm"
                            : "bg-[#1e1e1e] text-white border border-[#2a2a2a] rounded-bl-sm"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                        <div
                          className={`flex items-center gap-1 mt-1 ${
                            msg.direction === "outbound" ? "justify-end" : "justify-start"
                          }`}
                        >
                          <span className="text-[10px] text-white/50">
                            {formatTime(msg.timestamp)}
                          </span>
                          {msg.direction === "outbound" && (
                            <StatusIcon status={msg.status} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-2 bg-red-900/30 border-t border-red-800/50">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        {/* Input */}
        <div className="flex items-end gap-2 px-4 py-3 border-t border-[#2a2a2a] bg-[#141414]">
          {!phone && (
            <p className="text-xs text-[#a1a1a1] flex-1 text-center">
              Добавьте номер телефона в сделку, чтобы отправлять сообщения
            </p>
          )}
          {phone && (
            <>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Написать сообщение..."
                rows={1}
                className="flex-1 resize-none rounded-xl bg-[#252525] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-[#666] focus:outline-none focus:border-[#25d366] max-h-24 overflow-y-auto"
                style={{ minHeight: "40px" }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25d366] text-white hover:bg-[#22c55e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                {sending ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth={2} strokeDasharray="40" strokeDashoffset="30" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "read") {
    return (
      <svg className="h-3 w-3 text-[#53bdeb]" viewBox="0 0 16 15" fill="currentColor">
        <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.319.319 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.029l3.75-4.67a.418.418 0 0 0-.076-.524zm-4.101 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.77a.366.366 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3 2.9a.32.32 0 0 0 .484-.029l6.512-8.063a.366.366 0 0 0-.076-.524z" />
      </svg>
    );
  }
  if (status === "delivered") {
    return (
      <svg className="h-3 w-3 text-white/50" viewBox="0 0 16 15" fill="currentColor">
        <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.319.319 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.029l3.75-4.67a.418.418 0 0 0-.076-.524zm-4.101 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.77a.366.366 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3 2.9a.32.32 0 0 0 .484-.029l6.512-8.063a.366.366 0 0 0-.076-.524z" />
      </svg>
    );
  }
  if (status === "failed") {
    return (
      <svg className="h-3 w-3 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="10" strokeWidth={2} />
        <path strokeLinecap="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
      </svg>
    );
  }
  // sent
  return (
    <svg className="h-3 w-3 text-white/50" viewBox="0 0 16 15" fill="currentColor">
      <path d="M10.91 3.316l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.77a.366.366 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3 2.9a.32.32 0 0 0 .484-.029l6.512-8.063a.366.366 0 0 0-.076-.524z" />
    </svg>
  );
}
