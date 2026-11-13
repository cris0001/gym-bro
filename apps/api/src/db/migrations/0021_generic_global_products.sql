ALTER TABLE "global_products" ALTER COLUMN "ean" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "global_products" ADD COLUMN "name_pl" text;--> statement-breakpoint
ALTER TABLE "global_products" ADD COLUMN "name_en" text;--> statement-breakpoint
CREATE UNIQUE INDEX "global_products_generic_name_pl_unique" ON "global_products" USING btree (lower("name_pl")) WHERE "global_products"."ean" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "global_products_generic_name_en_unique" ON "global_products" USING btree (lower("name_en")) WHERE "global_products"."ean" IS NULL;--> statement-breakpoint
ALTER TABLE "global_products" ADD CONSTRAINT "global_products_generic_names_required" CHECK ("global_products"."ean" IS NOT NULL OR ("global_products"."name_pl" IS NOT NULL AND "global_products"."name_en" IS NOT NULL));