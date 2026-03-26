CREATE TABLE `account` (
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	PRIMARY KEY(`provider`, `providerAccountId`),
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `cinema` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`borough` text NOT NULL,
	`neighborhood` text,
	`address` text,
	`website_url` text,
	`logo_url` text,
	`created_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cinema_slug_unique` ON `cinema` (`slug`);--> statement-breakpoint
CREATE TABLE `crew_film_vote_ballot` (
	`vote_id` text NOT NULL,
	`profile_id` text NOT NULL,
	PRIMARY KEY(`vote_id`, `profile_id`),
	FOREIGN KEY (`vote_id`) REFERENCES `crew_film_vote`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`profile_id`) REFERENCES `profile`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `crew_film_vote` (
	`id` text PRIMARY KEY NOT NULL,
	`crew_id` text NOT NULL,
	`tmdb_id` integer NOT NULL,
	`film_title` text NOT NULL,
	`film_poster_path` text,
	`proposed_by` text,
	`created_at` text,
	FOREIGN KEY (`crew_id`) REFERENCES `crew`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`proposed_by`) REFERENCES `profile`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `crew_member` (
	`crew_id` text NOT NULL,
	`profile_id` text NOT NULL,
	`joined_at` text,
	`turn_order` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`crew_id`, `profile_id`),
	FOREIGN KEY (`crew_id`) REFERENCES `crew`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`profile_id`) REFERENCES `profile`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_crew_members_profile` ON `crew_member` (`profile_id`);--> statement-breakpoint
CREATE TABLE `crew` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`created_at` text
);
--> statement-breakpoint
CREATE TABLE `profile_cinema` (
	`profile_id` text NOT NULL,
	`cinema_id` text NOT NULL,
	PRIMARY KEY(`profile_id`, `cinema_id`),
	FOREIGN KEY (`profile_id`) REFERENCES `profile`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`cinema_id`) REFERENCES `cinema`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `profile` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`photo_url` text,
	`neighborhood` text,
	`genres` text,
	`letterboxd_username` text,
	`letterboxd_data` text,
	`onboarding_completed` integer DEFAULT false,
	`created_at` text,
	`updated_at` text,
	FOREIGN KEY (`id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `screening_attendee` (
	`screening_id` text NOT NULL,
	`profile_id` text NOT NULL,
	`status` text DEFAULT 'confirmed' NOT NULL,
	`joined_at` text,
	PRIMARY KEY(`screening_id`, `profile_id`),
	FOREIGN KEY (`screening_id`) REFERENCES `screening`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`profile_id`) REFERENCES `profile`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_screening_attendees_profile` ON `screening_attendee` (`profile_id`);--> statement-breakpoint
CREATE TABLE `screening` (
	`id` text PRIMARY KEY NOT NULL,
	`tmdb_id` integer NOT NULL,
	`film_title` text NOT NULL,
	`film_poster_path` text,
	`film_genres` text,
	`film_rating` real,
	`cinema_id` text,
	`datetime` text,
	`after_spot` text,
	`organizer_id` text NOT NULL,
	`cap` integer DEFAULT 6 NOT NULL,
	`crew_id` text,
	`status` text DEFAULT 'upcoming' NOT NULL,
	`created_at` text,
	FOREIGN KEY (`cinema_id`) REFERENCES `cinema`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organizer_id`) REFERENCES `profile`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`crew_id`) REFERENCES `crew`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_screenings_datetime` ON `screening` (`datetime`);--> statement-breakpoint
CREATE INDEX `idx_screenings_cinema` ON `screening` (`cinema_id`);--> statement-breakpoint
CREATE INDEX `idx_screenings_status` ON `screening` (`status`);--> statement-breakpoint
CREATE INDEX `idx_screenings_crew` ON `screening` (`crew_id`);--> statement-breakpoint
CREATE TABLE `session` (
	`sessionToken` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text,
	`emailVerified` integer,
	`image` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verificationToken` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL,
	PRIMARY KEY(`identifier`, `token`)
);
--> statement-breakpoint
CREATE TABLE `would_go_again` (
	`id` text PRIMARY KEY NOT NULL,
	`screening_id` text NOT NULL,
	`from_user_id` text NOT NULL,
	`to_user_id` text NOT NULL,
	`created_at` text,
	FOREIGN KEY (`screening_id`) REFERENCES `screening`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`from_user_id`) REFERENCES `profile`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`to_user_id`) REFERENCES `profile`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_would_go_again_unique` ON `would_go_again` (`screening_id`,`from_user_id`,`to_user_id`);--> statement-breakpoint
CREATE INDEX `idx_would_go_again_users` ON `would_go_again` (`from_user_id`,`to_user_id`);