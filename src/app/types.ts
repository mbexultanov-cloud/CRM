import { InferSelectModel } from "drizzle-orm";
import { deals, stages } from "@/db/schema";

export type Stage = InferSelectModel<typeof stages>;
export type Deal = InferSelectModel<typeof deals>;

export interface DealWithStage extends Deal {
  stage: Stage;
}
