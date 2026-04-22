"use server";

import { db } from "@/db";
import { deals, stages, attachments, users, providers, whatsappMessages } from "@/db/schema";
import { eq, asc, desc, or } from "drizzle-orm";

export async function getProviders() {
  return db.select().from(providers);
}

export async function createProvider(data: { name: string; email: string; phone?: string }) {
  const [provider] = await db.insert(providers).values({
    name: data.name,
    email: data.email,
    phone: data.phone,
  }).returning();
  return provider;
}

export async function deleteProvider(id: number) {
  await db.delete(providers).where(eq(providers.id, id));
}

export async function getStages(providerId?: number) {
  if (providerId) {
    return db.select().from(stages).where(eq(stages.providerId, providerId)).orderBy(asc(stages.order));
  }
  return db.select().from(stages).orderBy(asc(stages.order));
}

export async function getDeals(providerId?: number) {
  if (providerId) {
    return db.select().from(deals).where(eq(deals.providerId, providerId)).orderBy(asc(deals.order));
  }
  return db.select().from(deals).orderBy(asc(deals.order));
}

export async function getUsers(providerId?: number) {
  if (providerId) {
    return db.select().from(users).where(eq(users.providerId, providerId));
  }
  return db.select().from(users);
}

export async function createUser(data: { name: string; email: string; role?: string; providerId?: number }) {
  const [user] = await db.insert(users).values({
    name: data.name,
    email: data.email,
    role: data.role || "user",
    providerId: data.providerId,
  }).returning();
  return user;
}

export async function deleteUser(id: number) {
  await db.delete(users).where(eq(users.id, id));
}

export async function createDeal(data: {
  title: string;
  clientName: string;
  phone?: string;
  amount?: number;
  description?: string;
  stageId: number;
  userId?: number;
  providerId?: number;
  dueDate?: Date;
}) {
  const now = new Date();
  const [deal] = await db
    .insert(deals)
    .values({
      title: data.title,
      clientName: data.clientName,
      phone: data.phone,
      amount: data.amount,
      description: data.description,
      stageId: data.stageId,
      userId: data.userId,
      providerId: data.providerId,
      dueDate: data.dueDate,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return deal;
}

export async function updateDeal(
  id: number,
  data: {
    title?: string;
    clientName?: string;
    phone?: string;
    amount?: number;
    description?: string;
    stageId?: number;
    userId?: number;
    providerId?: number;
    dueDate?: Date | null;
    order?: number;
  }
) {
  const [deal] = await db
    .update(deals)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(deals.id, id))
    .returning();
  return deal;
}

export async function deleteDeal(id: number) {
  await db.delete(deals).where(eq(deals.id, id));
}

export async function updateStage(
  id: number,
  data: {
    name?: string;
    color?: string;
    order?: number;
  }
) {
  const [stage] = await db
    .update(stages)
    .set(data)
    .where(eq(stages.id, id))
    .returning();
  return stage;
}

export async function createStage(data: { name: string; color: string }) {
  const maxOrder = await db.select({ max: stages.order }).from(stages).then(r => r[0]?.max || 0);
  const [stage] = await db.insert(stages).values({
    name: data.name,
    color: data.color,
    order: maxOrder + 1,
  }).returning();
  return stage;
}

export async function deleteStage(id: number) {
  await db.delete(stages).where(eq(stages.id, id));
}

export async function getAttachments(dealId: number) {
  return db.select().from(attachments).where(eq(attachments.dealId, dealId));
}

export async function createAttachment(data: {
  dealId: number;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
}) {
  const [attachment] = await db
    .insert(attachments)
    .values(data)
    .returning();
  return attachment;
}

export async function deleteAttachment(id: number) {
  await db.delete(attachments).where(eq(attachments.id, id));
}

// ===== WhatsApp Messages =====

export async function getWhatsAppMessages(dealId: number) {
  return db
    .select()
    .from(whatsappMessages)
    .where(eq(whatsappMessages.dealId, dealId))
    .orderBy(asc(whatsappMessages.timestamp));
}

export async function getAllWhatsAppChats() {
  // Возвращаем последнее сообщение для каждой уникальной пары (deal_id, from/to)
  // Получаем все сообщения, сгруппированные по deal_id
  const messages = await db
    .select()
    .from(whatsappMessages)
    .orderBy(desc(whatsappMessages.timestamp));

  // Группируем по dealId (или по номеру телефона для входящих без сделки)
  const chats = new Map<string, typeof messages[0]>();
  for (const msg of messages) {
    const key = msg.dealId ? `deal_${msg.dealId}` : `phone_${msg.direction === "inbound" ? msg.from : msg.to}`;
    if (!chats.has(key)) {
      chats.set(key, msg);
    }
  }

  return Array.from(chats.values());
}

export async function sendWhatsAppMessage(data: {
  to: string;
  body: string;
  dealId?: number;
}) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    throw new Error("WhatsApp не настроен. Добавьте WHATSAPP_PHONE_NUMBER_ID и WHATSAPP_ACCESS_TOKEN в .env.local");
  }

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
        to: data.to,
        type: "text",
        text: { body: data.body },
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.error?.message || "Failed to send WhatsApp message");
  }

  const waMessageId = result?.messages?.[0]?.id;

  const [saved] = await db.insert(whatsappMessages).values({
    dealId: data.dealId ?? null,
    waMessageId: waMessageId ?? null,
    from: phoneNumberId,
    to: data.to,
    body: data.body,
    direction: "outbound",
    status: "sent",
    timestamp: new Date(),
  }).returning();

  return saved;
}

export async function getWhatsAppMessagesByPhone(phone: string) {
  return db
    .select()
    .from(whatsappMessages)
    .where(
      or(
        eq(whatsappMessages.from, phone),
        eq(whatsappMessages.to, phone)
      )
    )
    .orderBy(asc(whatsappMessages.timestamp));
}
