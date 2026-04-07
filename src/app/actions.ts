"use server";

import { db } from "@/db";
import { deals, stages } from "@/db/schema";
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
