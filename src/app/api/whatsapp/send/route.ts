import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { whatsappMessages } from "@/db/schema";

export async function POST(request: NextRequest) {
  try {
    const { to, body, dealId } = await request.json();

    if (!to || !body) {
      return NextResponse.json({ error: "Missing required fields: to, body" }, { status: 400 });
    }

    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!phoneNumberId || !accessToken) {
      return NextResponse.json(
        { error: "WhatsApp is not configured. Set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN." },
        { status: 503 }
      );
    }

    // Отправка через WhatsApp Cloud API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body },
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("WhatsApp API error:", result);
      return NextResponse.json(
        { error: result?.error?.message || "Failed to send message" },
        { status: response.status }
      );
    }

    const waMessageId = result?.messages?.[0]?.id;

    // Сохраняем отправленное сообщение в БД
    const [saved] = await db.insert(whatsappMessages).values({
      dealId: dealId ?? null,
      waMessageId: waMessageId ?? null,
      from: phoneNumberId,
      to,
      body,
      direction: "outbound",
      status: "sent",
      timestamp: new Date(),
    }).returning();

    return NextResponse.json({ success: true, message: saved });
  } catch (error) {
    console.error("WhatsApp send error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
