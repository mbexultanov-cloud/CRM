CREATE TABLE `whatsapp_messages` (
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
CREATE UNIQUE INDEX `whatsapp_messages_wa_message_id_unique` ON `whatsapp_messages` (`wa_message_id`);
