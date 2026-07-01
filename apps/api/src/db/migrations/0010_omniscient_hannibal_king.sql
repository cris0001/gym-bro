ALTER TABLE "recipes" ADD COLUMN "total_grams" numeric(7, 2);--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_total_grams_positive" CHECK ("recipes"."total_grams" > 0);