export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { createExecuteQuery } = await import("@kilocode/app-builder-db");
    try {
      const executeQuery = createExecuteQuery();

      // Run each statement individually, ignoring "duplicate column" errors
      async function runSafe(sql: string) {
        try {
          await executeQuery(sql, [], "run");
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          // Ignore "column already exists" and "table already exists" errors
          if (
            msg.includes("duplicate column") ||
            msg.includes("already exists") ||
            msg.includes("UNIQUE constraint failed")
          ) {
            // silently skip
          } else {
            throw err;
          }
        }
      }

      // Ensure providers table
      await runSafe(`CREATE TABLE IF NOT EXISTS "providers" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "name" text NOT NULL,
        "email" text NOT NULL UNIQUE,
        "phone" text,
        "created_at" integer
      )`);

      // Ensure provider_id columns exist
      await runSafe(`ALTER TABLE "users" ADD COLUMN "provider_id" integer REFERENCES "providers"("id")`);
      await runSafe(`ALTER TABLE "deals" ADD COLUMN "provider_id" integer REFERENCES "providers"("id")`);
      await runSafe(`ALTER TABLE "stages" ADD COLUMN "provider_id" integer REFERENCES "providers"("id")`);

      // Ensure whatsapp_messages table
      await runSafe(`CREATE TABLE IF NOT EXISTS "whatsapp_messages" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "deal_id" integer,
        "wa_message_id" text,
        "from" text NOT NULL,
        "to" text NOT NULL,
        "body" text NOT NULL,
        "direction" text DEFAULT 'outbound' NOT NULL,
        "status" text DEFAULT 'sent' NOT NULL,
        "timestamp" integer,
        "created_at" integer,
        FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON UPDATE no action ON DELETE no action
      )`);
      await runSafe(`CREATE UNIQUE INDEX IF NOT EXISTS "whatsapp_messages_wa_message_id_unique" ON "whatsapp_messages" ("wa_message_id")`);

      console.log("[DB] Schema ensured successfully");
    } catch (err) {
      console.error("[DB] Schema setup error:", err);
    }
  }
}
