CREATE TABLE `deals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`client_name` text NOT NULL,
	`amount` integer,
	`description` text,
	`tags` text,
	`stage_id` integer NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`stage_id`) REFERENCES `stages`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `stages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
INSERT INTO `stages` (`name`, `color`, `order`) VALUES ('New', '#6366f1', 0), ('Contact', '#8b5cf6', 1), ('Proposal', '#f59e0b', 2), ('Negotiation', '#f97316', 3), ('Won', '#22c55e', 4), ('Lost', '#ef4444', 5);
