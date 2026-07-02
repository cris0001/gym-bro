ALTER TYPE "public"."food_log_unit" ADD VALUE 'units';--> statement-breakpoint
ALTER TABLE "foods" ADD COLUMN "unit_grams" numeric(7, 2);--> statement-breakpoint
ALTER TABLE "foods" ADD CONSTRAINT "foods_unit_grams_positive" CHECK ("foods"."unit_grams" > 0);