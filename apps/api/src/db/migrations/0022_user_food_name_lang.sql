CREATE TYPE "public"."food_name_lang" AS ENUM('pl', 'en');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "food_name_lang" "food_name_lang";