ALTER TABLE "recipes" DROP CONSTRAINT "recipes_kcal_non_negative";--> statement-breakpoint
ALTER TABLE "recipes" DROP CONSTRAINT "recipes_protein_non_negative";--> statement-breakpoint
ALTER TABLE "recipes" DROP CONSTRAINT "recipes_carbs_non_negative";--> statement-breakpoint
ALTER TABLE "recipes" DROP CONSTRAINT "recipes_fat_non_negative";--> statement-breakpoint
ALTER TABLE "recipes" DROP CONSTRAINT "recipes_total_grams_positive";--> statement-breakpoint
ALTER TABLE "foods" ADD COLUMN "serving_grams" numeric(7, 2);--> statement-breakpoint
ALTER TABLE "recipes" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "recipes" DROP COLUMN "kcal";--> statement-breakpoint
ALTER TABLE "recipes" DROP COLUMN "protein_g";--> statement-breakpoint
ALTER TABLE "recipes" DROP COLUMN "carbs_g";--> statement-breakpoint
ALTER TABLE "recipes" DROP COLUMN "fat_g";--> statement-breakpoint
ALTER TABLE "recipes" DROP COLUMN "total_grams";--> statement-breakpoint
ALTER TABLE "foods" ADD CONSTRAINT "foods_serving_grams_positive" CHECK ("foods"."serving_grams" > 0);--> statement-breakpoint
DROP TYPE "public"."recipe_type";