CREATE TYPE "public"."food_log_source" AS ENUM('manual', 'ai');--> statement-breakpoint
ALTER TABLE "food_log" DROP CONSTRAINT "food_log_one_reference";--> statement-breakpoint
ALTER TABLE "food_log" ADD COLUMN "source" "food_log_source" DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE "food_log" ADD CONSTRAINT "food_log_one_reference" CHECK (("food_log"."food_id" is not null)::int + ("food_log"."recipe_id" is not null)::int <= 1);