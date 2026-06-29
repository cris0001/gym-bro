CREATE TYPE "public"."food_log_unit" AS ENUM('grams', 'servings');--> statement-breakpoint
CREATE TYPE "public"."meal_type" AS ENUM('breakfast', 'second_breakfast', 'lunch', 'snack', 'dinner');--> statement-breakpoint
ALTER TABLE "food_log" ADD COLUMN "meal" "meal_type" DEFAULT 'breakfast' NOT NULL;--> statement-breakpoint
ALTER TABLE "food_log" ADD COLUMN "unit" "food_log_unit" DEFAULT 'grams' NOT NULL;--> statement-breakpoint
-- Backfill: existing recipe entries were logged by servings (the old implied unit).
UPDATE "food_log" SET "unit" = 'servings' WHERE "recipe_id" IS NOT NULL;