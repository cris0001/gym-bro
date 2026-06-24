CREATE TYPE "public"."planned_status" AS ENUM('planned', 'completed', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."session_type" AS ENUM('strength', 'activity');--> statement-breakpoint
CREATE TABLE "exercise_performances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workout_session_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"original_exercise_id" uuid NOT NULL,
	"actual_exercise_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "planned_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"workout_template_id" uuid NOT NULL,
	"scheduled_date" date NOT NULL,
	"status" "planned_status" DEFAULT 'planned' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exercise_performance_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"weight" numeric(6, 2),
	"reps" integer,
	"rir" smallint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sets_weight_non_negative" CHECK ("sets"."weight" >= 0),
	CONSTRAINT "sets_reps_non_negative" CHECK ("sets"."reps" >= 0),
	CONSTRAINT "sets_rir_range" CHECK ("sets"."rir" between 0 and 5)
);
--> statement-breakpoint
CREATE TABLE "workout_session_tags" (
	"workout_session_id" uuid NOT NULL,
	"workout_tag_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workout_session_tags_workout_session_id_workout_tag_id_pk" PRIMARY KEY("workout_session_id","workout_tag_id")
);
--> statement-breakpoint
CREATE TABLE "workout_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"planned_session_id" uuid,
	"workout_template_id" uuid,
	"session_type" "session_type" NOT NULL,
	"name" text NOT NULL,
	"performed_date" date NOT NULL,
	"duration_minutes" integer,
	"rating" smallint,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workout_sessions_rating_range" CHECK ("workout_sessions"."rating" between 1 and 5),
	CONSTRAINT "workout_sessions_duration_positive" CHECK ("workout_sessions"."duration_minutes" > 0)
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "active_plan_id" uuid;--> statement-breakpoint
ALTER TABLE "exercise_performances" ADD CONSTRAINT "exercise_performances_workout_session_id_workout_sessions_id_fk" FOREIGN KEY ("workout_session_id") REFERENCES "public"."workout_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_performances" ADD CONSTRAINT "exercise_performances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_performances" ADD CONSTRAINT "exercise_performances_original_exercise_id_exercises_id_fk" FOREIGN KEY ("original_exercise_id") REFERENCES "public"."exercises"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_performances" ADD CONSTRAINT "exercise_performances_actual_exercise_id_exercises_id_fk" FOREIGN KEY ("actual_exercise_id") REFERENCES "public"."exercises"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planned_sessions" ADD CONSTRAINT "planned_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planned_sessions" ADD CONSTRAINT "planned_sessions_workout_template_id_workout_templates_id_fk" FOREIGN KEY ("workout_template_id") REFERENCES "public"."workout_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sets" ADD CONSTRAINT "sets_exercise_performance_id_exercise_performances_id_fk" FOREIGN KEY ("exercise_performance_id") REFERENCES "public"."exercise_performances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sets" ADD CONSTRAINT "sets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_session_tags" ADD CONSTRAINT "workout_session_tags_workout_session_id_workout_sessions_id_fk" FOREIGN KEY ("workout_session_id") REFERENCES "public"."workout_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_session_tags" ADD CONSTRAINT "workout_session_tags_workout_tag_id_workout_tags_id_fk" FOREIGN KEY ("workout_tag_id") REFERENCES "public"."workout_tags"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_session_tags" ADD CONSTRAINT "workout_session_tags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_planned_session_id_planned_sessions_id_fk" FOREIGN KEY ("planned_session_id") REFERENCES "public"."planned_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_workout_template_id_workout_templates_id_fk" FOREIGN KEY ("workout_template_id") REFERENCES "public"."workout_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "exercise_performances_session_position_unique" ON "exercise_performances" USING btree ("workout_session_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "planned_sessions_user_date_template_unique" ON "planned_sessions" USING btree ("user_id","scheduled_date","workout_template_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sets_performance_position_unique" ON "sets" USING btree ("exercise_performance_id","position");--> statement-breakpoint
CREATE INDEX "workout_sessions_user_date_idx" ON "workout_sessions" USING btree ("user_id","performed_date");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_active_plan_id_training_plans_id_fk" FOREIGN KEY ("active_plan_id") REFERENCES "public"."training_plans"("id") ON DELETE set null ON UPDATE no action;