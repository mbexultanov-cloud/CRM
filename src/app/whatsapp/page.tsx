"use client";

import { useState, useEffect } from "react";
import { WhatsAppMessage, Deal } from "@/app/types";
import { getAllWhatsAppChats, getWhatsAppMessages, getDeals, sendWhatsAppMessage } from "@/app/actions";
import Link from "next/link";

export default function WhatsAppPage() {
  const [chats, setChats] = useState<WhatsAppMessage[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDealId, setSelectedDealId] = useState<number | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadChats, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedDealId !== null) {
      loadMessages(selectedDealId);
    }
  }, [selectedDealId]);

  async function loadData() {
    const [chatsData, dealsData] = await Promise.all([
      getAllWhatsAppChats(),
      getDeals(),
    ]);
    setChats(chatsData);
    setDeals(dealsData);
    setLoading(false);
  }

  async function loadChats() {
    const chatsData = await getAllWhatsAppChats();
    setChats(chatsData);
  }

  async function loadMessages(dealId: number) {
    const msgs = await getWhatsAppMessages(dealId);
    setMessages(msgs);
  }

  async function handleSend() {
    if (!input.trim() || selectedDealId === null) return;
    const deal = deals.find((d) => d.id === selectedDealId);
    if (!deal?.phone) {
      setError("У сделки нет номера телефона");
      return;
    }
    setSending(true);
    setError(null);
    try {
      await sendWhatsAppMessage({ to: deal.phone, body: input.trim(), dealId: selectedDealId });
      setInput("");
      await loadMessages(selectedDealId);
      await loadChats();
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

  const selectedDeal = deals.find((d) => d.id === selectedDealId);

  function getDealForChat(msg: WhatsAppMessage): Deal | undefined {
    return deals.find((d) => d.id === msg.dealId);
  }

  function formatTime(date: Date | null) {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    if (diffDays === 1) return "Вчера";
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  }

  // Deduplicate chats by dealId
  const uniqueChats = chats.filter((c) => c.dealId !== null);

  return (
    <main className="min-h-screen bg-[#0f0f0f]">
      {/* Header */}
      <header className="border-b border-[#2a2a2a] bg-[#0f0f0f] sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#22c55e]">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#25d366]">
                <svg viewBox="0 0 24 24" fill="white" className="h-5 w-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white">WhatsApp</h1>
            </div>
          </div>
          <Link href="/" className="text-sm text-[#a1a1a1] hover:text-white transition-colors">
            ← Назад к CRM
          </Link>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar — список чатов */}
        <div className="w-80 border-r border-[#2a2a2a] bg-[#0f0f0f] overflow-y-auto flex-shrink-0">
          <div className="p-4 border-b border-[#2a2a2a]">
            <p className="text-sm text-[#a1a1a1]">
              {loading ? "Загрузка..." : `${uniqueChats.length} чатов`}
            </p>
          </div>

          {loading ? (
            <div className="p-4 text-[#666] text-sm">Загрузка чатов...</div>
          ) : uniqueChats.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-[#a1a1a1] text-sm">Нет переписок</p>
              <p className="text-[#555] text-xs mt-1">
                Сообщения появятся после первого контакта
              </p>
            </div>
          ) : (
            <div>
              {uniqueChats.map((chat) => {
                const deal = getDealForChat(chat);
                const isSelected = selectedDealId === chat.dealId;
                return (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedDealId(chat.dealId!)}
                    className={`w-full flex items-start gap-3 px-4 py-3 border-b border-[#1a1a1a] hover:bg-[#1a1a1a] transition-colors text-left ${
                      isSelected ? "bg-[#1a1a1a]" : ""
                    }`}
                  >
                    <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-[#25d366]/20 text-[#25d366] font-semibold text-sm">
                      {deal?.clientName?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white truncate">
                          {deal?.clientName || chat.from}
                        </p>
                        <span className="text-[10px] text-[#666] flex-shrink-0 ml-2">
                          {formatTime(chat.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-[#a1a1a1] truncate mt-0.5">
                        {chat.direction === "outbound" ? "Вы: " : ""}
                        {chat.body}
                      </p>
                      {deal && (
                        <p className="text-[10px] text-[#555] truncate">{deal.title}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Chat area */}
        {selectedDealId === null ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#25d366]/10 mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="#25d366" className="h-8 w-8">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <p className="text-[#a1a1a1]">Выберите чат для просмотра</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2a2a2a] bg-[#141414]">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25d366]/20 text-[#25d366] font-semibold">
                {selectedDeal?.clientName?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="font-semibold text-white">{selectedDeal?.clientName}</p>
                <p className="text-xs text-[#a1a1a1]">{selectedDeal?.phone || "Нет номера"}</p>
              </div>
              {selectedDeal && (
                <Link
                  href="/"
                  className="ml-auto text-xs text-[#3b82f6] hover:underline"
                >
                  Открыть сделку →
                </Link>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#0f0f0f]">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-[#666] text-sm">Нет сообщений</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[65%] rounded-2xl px-3 py-2 text-sm ${
                        msg.direction === "outbound"
                          ? "bg-[#005c4b] text-white rounded-br-sm"
                          : "bg-[#1e1e1e] text-white border border-[#2a2a2a] rounded-bl-sm"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                      <div className={`flex items-center gap-1 mt-1 ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}>
                        <span className="text-[10px] text-white/50">
                          {msg.timestamp
                            ? new Date(msg.timestamp).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
                            : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-2 bg-red-900/30 border-t border-red-800/50">
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            {/* Input */}
            <div className="flex items-end gap-2 px-4 py-3 border-t border-[#2a2a2a] bg-[#141414]">
              {!selectedDeal?.phone ? (
                <p className="text-xs text-[#a1a1a1] flex-1 text-center">
                  Добавьте номер телефона в сделку, чтобы отправлять сообщения
                </p>
              ) : (
                <>
                  <textarea
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
        )}
      </div>
    </main>
  );
}
