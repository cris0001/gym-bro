CREATE TABLE "body_measurements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"measured_date" date NOT NULL,
	"weight_kg" numeric(5, 2),
	"body_fat_pct" numeric(4, 2),
	"biceps_cm" numeric(5, 2),
	"chest_cm" numeric(5, 2),
	"waist_cm" numeric(5, 2),
	"hip_cm" numeric(5, 2),
	"thigh_cm" numeric(5, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "body_measurements_weight_non_negative" CHECK ("body_measurements"."weight_kg" >= 0),
	CONSTRAINT "body_measurements_body_fat_range" CHECK ("body_measurements"."body_fat_pct" >= 0 and "body_measurements"."body_fat_pct" <= 100),
	CONSTRAINT "body_measurements_biceps_non_negative" CHECK ("body_measurements"."biceps_cm" >= 0),
	CONSTRAINT "body_measurements_chest_non_negative" CHECK ("body_measurements"."chest_cm" >= 0),
	CONSTRAINT "body_measurements_waist_non_negative" CHECK ("body_measurements"."waist_cm" >= 0),
	CONSTRAINT "body_measurements_hip_non_negative" CHECK ("body_measurements"."hip_cm" >= 0),
	CONSTRAINT "body_measurements_thigh_non_negative" CHECK ("body_measurements"."thigh_cm" >= 0)
);
--> statement-breakpoint
ALTER TABLE "body_measurements" ADD CONSTRAINT "body_measurements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "body_measurements_user_date_unique" ON "body_measurements" USING btree ("user_id","measured_date");