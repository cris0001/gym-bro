CREATE TABLE "food_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"logged_date" date NOT NULL,
	"food_id" uuid,
	"recipe_id" uuid,
	"item_name" text NOT NULL,
	"quantity" numeric(7, 2) NOT NULL,
	"kcal" numeric(7, 2) NOT NULL,
	"protein_g" numeric(7, 2) NOT NULL,
	"carbs_g" numeric(7, 2) NOT NULL,
	"fat_g" numeric(7, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "food_log_one_reference" CHECK (("food_log"."food_id" is not null)::int + ("food_log"."recipe_id" is not null)::int = 1),
	CONSTRAINT "food_log_quantity_positive" CHECK ("food_log"."quantity" > 0),
	CONSTRAINT "food_log_kcal_non_negative" CHECK ("food_log"."kcal" >= 0),
	CONSTRAINT "food_log_protein_non_negative" CHECK ("food_log"."protein_g" >= 0),
	CONSTRAINT "food_log_carbs_non_negative" CHECK ("food_log"."carbs_g" >= 0),
	CONSTRAINT "food_log_fat_non_negative" CHECK ("food_log"."fat_g" >= 0)
);
--> statement-breakpoint
CREATE TABLE "foods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"kcal" numeric(6, 2) NOT NULL,
	"protein_g" numeric(6, 2) NOT NULL,
	"carbs_g" numeric(6, 2) NOT NULL,
	"fat_g" numeric(6, 2) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "foods_kcal_non_negative" CHECK ("foods"."kcal" >= 0),
	CONSTRAINT "foods_protein_non_negative" CHECK ("foods"."protein_g" >= 0),
	CONSTRAINT "foods_carbs_non_negative" CHECK ("foods"."carbs_g" >= 0),
	CONSTRAINT "foods_fat_non_negative" CHECK ("foods"."fat_g" >= 0)
);
--> statement-breakpoint
CREATE TABLE "nutrition_targets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"effective_date" date NOT NULL,
	"kcal" numeric(6, 2) NOT NULL,
	"protein_g" numeric(6, 2) NOT NULL,
	"carbs_g" numeric(6, 2) NOT NULL,
	"fat_g" numeric(6, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "nutrition_targets_kcal_non_negative" CHECK ("nutrition_targets"."kcal" >= 0),
	CONSTRAINT "nutrition_targets_protein_non_negative" CHECK ("nutrition_targets"."protein_g" >= 0),
	CONSTRAINT "nutrition_targets_carbs_non_negative" CHECK ("nutrition_targets"."carbs_g" >= 0),
	CONSTRAINT "nutrition_targets_fat_non_negative" CHECK ("nutrition_targets"."fat_g" >= 0)
);
--> statement-breakpoint
CREATE TABLE "recipe_ingredients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipe_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"food_id" uuid NOT NULL,
	"amount_grams" numeric(7, 2) NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recipe_ingredients_amount_positive" CHECK ("recipe_ingredients"."amount_grams" > 0)
);
--> statement-breakpoint
CREATE TABLE "recipes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"servings" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recipes_servings_positive" CHECK ("recipes"."servings" > 0)
);
--> statement-breakpoint
ALTER TABLE "food_log" ADD CONSTRAINT "food_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_log" ADD CONSTRAINT "food_log_food_id_foods_id_fk" FOREIGN KEY ("food_id") REFERENCES "public"."foods"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_log" ADD CONSTRAINT "food_log_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "foods" ADD CONSTRAINT "foods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nutrition_targets" ADD CONSTRAINT "nutrition_targets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_food_id_foods_id_fk" FOREIGN KEY ("food_id") REFERENCES "public"."foods"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "food_log_user_date_idx" ON "food_log" USING btree ("user_id","logged_date");--> statement-breakpoint
CREATE UNIQUE INDEX "foods_user_name_active_unique" ON "foods" USING btree ("user_id",lower("name")) WHERE "foods"."is_active";--> statement-breakpoint
CREATE UNIQUE INDEX "nutrition_targets_user_date_unique" ON "nutrition_targets" USING btree ("user_id","effective_date");--> statement-breakpoint
CREATE UNIQUE INDEX "recipe_ingredients_recipe_position_unique" ON "recipe_ingredients" USING btree ("recipe_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "recipes_user_name_active_unique" ON "recipes" USING btree ("user_id",lower("name")) WHERE "recipes"."is_active";