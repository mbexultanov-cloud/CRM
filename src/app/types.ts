import { InferSelectModel } from "drizzle-orm";
import { deals, stages, attachments, users, providers } from "@/db/schema";

export type Provider = InferSelectModel<typeof providers>;
export type Stage = InferSelectModel<typeof stages>;
export type Deal = InferSelectModel<typeof deals>;
export type Attachment = InferSelectModel<typeof attachments>;
export type User = InferSelectModel<typeof users>;

export interface DealWithStage extends Deal {
  stage: Stage;
}
