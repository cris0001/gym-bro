CREATE TYPE "public"."recipe_type" AS ENUM('ingredients', 'manual');--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "type" "recipe_type" DEFAULT 'ingredients' NOT NULL;--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "kcal" numeric(7, 2);--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "protein_g" numeric(7, 2);--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "carbs_g" numeric(7, 2);--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "fat_g" numeric(7, 2);--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_kcal_non_negative" CHECK ("recipes"."kcal" >= 0);--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_protein_non_negative" CHECK ("recipes"."protein_g" >= 0);--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_carbs_non_negative" CHECK ("recipes"."carbs_g" >= 0);--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_fat_non_negative" CHECK ("recipes"."fat_g" >= 0);