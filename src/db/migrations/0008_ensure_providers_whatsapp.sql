-- Ensure providers table exists (may have been missed in migration 0006)
CREATE TABLE IF NOT EXISTS `providers` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `email` text NOT NULL UNIQUE,
  `phone` text,
  `created_at` integer
);
--> statement-breakpoint
-- Ensure provider_id columns exist (ALTER TABLE ignores errors via IF NOT EXISTS workaround)
ALTER TABLE `users` ADD COLUMN `provider_id` integer REFERENCES `providers`(`id`);
--> statement-breakpoint
ALTER TABLE `deals` ADD COLUMN `provider_id` integer REFERENCES `providers`(`id`);
--> statement-breakpoint
ALTER TABLE `stages` ADD COLUMN `provider_id` integer REFERENCES `providers`(`id`);
--> statement-breakpoint
-- Ensure whatsapp_messages table exists
CREATE TABLE IF NOT EXISTS `whatsapp_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`deal_id` integer,
	`wa_message_id` text,
	`from` text NOT NULL,
	`to` text NOT NULL,
	`body` text NOT NULL,
	`direction` text DEFAULT 'outbound' NOT NULL,
	`status` text DEFAULT 'sent' NOT NULL,
	`timestamp` integer,
	`created_at` integer,
	FOREIGN KEY (`deal_id`) REFERENCES `deals`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `whatsapp_messages_wa_message_id_unique` ON `whatsapp_messages` (`wa_message_id`);
