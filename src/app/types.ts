import { InferSelectModel } from "drizzle-orm";
import { deals, stages, attachments } from "@/db/schema";

export type Stage = InferSelectModel<typeof stages>;
export type Deal = InferSelectModel<typeof deals>;
export type Attachment = InferSelectModel<typeof attachments>;

export interface DealWithStage extends Deal {
  stage: Stage;
}
