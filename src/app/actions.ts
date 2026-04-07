"use server";

import { db } from "@/db";
import { deals, stages, attachments } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function getStages() {
  return db.select().from(stages).orderBy(asc(stages.order));
}

export async function getDeals() {
  return db.select().from(deals).orderBy(asc(deals.order));
}

export async function createDeal(data: {
  title: string;
  clientName: string;
  phone?: string;
  amount?: number;
  description?: string;
  stageId: number;
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
