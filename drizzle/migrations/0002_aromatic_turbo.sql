CREATE TABLE "illustrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"object_id" text NOT NULL,
	"display_name" text NOT NULL,
	"tags" text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "objects" (
	"id" text PRIMARY KEY NOT NULL,
	"hash" text NOT NULL,
	"uploader" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "specys" (
	"id" serial PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"parents" integer[] NOT NULL
);
--> statement-breakpoint
ALTER TABLE "characters" RENAME COLUMN "personality" TO "tags";--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "illustrations" integer[] NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "is_died" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "is_female" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "information" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "specy" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "height" double precision NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "length" double precision NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "color" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "relation_ships" jsonb NOT NULL;