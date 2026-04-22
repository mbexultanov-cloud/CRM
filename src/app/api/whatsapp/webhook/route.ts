import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { whatsappMessages, deals } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET — верификация webhook от Meta
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// POST — получение входящих сообщений от WhatsApp
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Структура payload от Meta WhatsApp Cloud API
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value) {
      return NextResponse.json({ status: "ok" });
    }

    // Обработка входящих сообщений
    const messages = value.messages;
    if (messages && Array.isArray(messages)) {
      for (const msg of messages) {
        if (msg.type !== "text") continue; // пока только текст

        const fromPhone = msg.from; // номер отправителя
        const waMessageId = msg.id;
        const messageBody = msg.text?.body || "";
        const timestamp = msg.timestamp
          ? new Date(parseInt(msg.timestamp) * 1000)
          : new Date();

        // Ищем сделку по номеру телефона клиента
        const matchingDeals = await db
          .select()
          .from(deals)
          .where(eq(deals.phone, fromPhone))
          .limit(1);

        const dealId = matchingDeals[0]?.id ?? null;

        // Сохраняем сообщение в БД
        await db.insert(whatsappMessages).values({
          dealId,
          waMessageId,
          from: fromPhone,
          to: value.metadata?.phone_number_id || "unknown",
          body: messageBody,
          direction: "inbound",
          status: "delivered",
          timestamp,
        }).onConflictDoNothing();
      }
    }

    // Обработка статусов доставки
    const statuses = value.statuses;
    if (statuses && Array.isArray(statuses)) {
      for (const status of statuses) {
        const waMessageId = status.id;
        const newStatus = status.status; // "sent" | "delivered" | "read" | "failed"

        await db
          .update(whatsappMessages)
          .set({ status: newStatus })
          .where(eq(whatsappMessages.waMessageId, waMessageId));
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
