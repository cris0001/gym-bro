CREATE TABLE "strava_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"athlete_id" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"scope" text,
	"last_sync_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strava_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"strava_activity_id" text NOT NULL,
	"activity_type" text NOT NULL,
	"name" text NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"timezone" text,
	"local_date" date NOT NULL,
	"distance_m" numeric(10, 2),
	"moving_time_s" integer,
	"elapsed_time_s" integer,
	"elevation_gain_m" numeric(8, 2),
	"average_speed_ms" numeric(8, 3),
	"max_speed_ms" numeric(8, 3),
	"average_heartrate" numeric(5, 1),
	"max_heartrate" smallint,
	"calories" numeric(8, 2),
	"rating" smallint,
	"note" text,
	"raw" jsonb,
	"last_synced_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "strava_sessions_distance_non_negative" CHECK ("strava_sessions"."distance_m" >= 0),
	CONSTRAINT "strava_sessions_moving_time_positive" CHECK ("strava_sessions"."moving_time_s" > 0),
	CONSTRAINT "strava_sessions_elapsed_time_positive" CHECK ("strava_sessions"."elapsed_time_s" > 0),
	CONSTRAINT "strava_sessions_elevation_non_negative" CHECK ("strava_sessions"."elevation_gain_m" >= 0),
	CONSTRAINT "strava_sessions_avg_hr_non_negative" CHECK ("strava_sessions"."average_heartrate" >= 0),
	CONSTRAINT "strava_sessions_rating_range" CHECK ("strava_sessions"."rating" between 1 and 5)
);
--> statement-breakpoint
ALTER TABLE "strava_connections" ADD CONSTRAINT "strava_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strava_sessions" ADD CONSTRAINT "strava_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "strava_connections_user_unique" ON "strava_connections" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "strava_sessions_user_activity_unique" ON "strava_sessions" USING btree ("user_id","strava_activity_id");--> statement-breakpoint
CREATE INDEX "strava_sessions_user_date_idx" ON "strava_sessions" USING btree ("user_id","local_date");