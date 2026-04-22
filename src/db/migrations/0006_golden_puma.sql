CREATE TABLE IF NOT EXISTS `providers` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `email` text NOT NULL UNIQUE,
  `phone` text,
  `created_at` integer
);
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `provider_id` integer REFERENCES `providers`(`id`);
--> statement-breakpoint
ALTER TABLE `deals` ADD COLUMN `provider_id` integer REFERENCES `providers`(`id`);
--> statement-breakpoint
ALTER TABLE `stages` ADD COLUMN `provider_id` integer REFERENCES `providers`(`id`);
