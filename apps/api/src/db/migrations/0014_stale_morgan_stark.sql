CREATE TABLE "global_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ean" text NOT NULL,
	"name" text NOT NULL,
	"brand" text,
	"kcal" numeric(6, 2) NOT NULL,
	"protein_g" numeric(6, 2) NOT NULL,
	"carbs_g" numeric(6, 2) NOT NULL,
	"fat_g" numeric(6, 2) NOT NULL,
	"serving_grams" numeric(7, 2),
	"unit_grams" numeric(7, 2),
	"image_url" text,
	"off_raw" jsonb,
	"first_scanned_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "global_products_kcal_non_negative" CHECK ("global_products"."kcal" >= 0),
	CONSTRAINT "global_products_protein_non_negative" CHECK ("global_products"."protein_g" >= 0),
	CONSTRAINT "global_products_carbs_non_negative" CHECK ("global_products"."carbs_g" >= 0),
	CONSTRAINT "global_products_fat_non_negative" CHECK ("global_products"."fat_g" >= 0),
	CONSTRAINT "global_products_serving_grams_positive" CHECK ("global_products"."serving_grams" > 0),
	CONSTRAINT "global_products_unit_grams_positive" CHECK ("global_products"."unit_grams" > 0)
);
--> statement-breakpoint
DROP INDEX "foods_user_name_active_unique";--> statement-breakpoint
ALTER TABLE "foods" ADD COLUMN "global_product_id" uuid;--> statement-breakpoint
ALTER TABLE "foods" ADD COLUMN "ean" text;--> statement-breakpoint
ALTER TABLE "foods" ADD COLUMN "brand" text;--> statement-breakpoint
ALTER TABLE "foods" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "global_products" ADD CONSTRAINT "global_products_first_scanned_by_users_id_fk" FOREIGN KEY ("first_scanned_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "global_products_ean_unique" ON "global_products" USING btree ("ean");--> statement-breakpoint
ALTER TABLE "foods" ADD CONSTRAINT "foods_global_product_id_global_products_id_fk" FOREIGN KEY ("global_product_id") REFERENCES "public"."global_products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "foods_user_global_unique" ON "foods" USING btree ("user_id","global_product_id") WHERE "foods"."global_product_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "foods_user_name_active_unique" ON "foods" USING btree ("user_id",lower("name")) WHERE "foods"."is_active" AND "foods"."global_product_id" IS NULL;