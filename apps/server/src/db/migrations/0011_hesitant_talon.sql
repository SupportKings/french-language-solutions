ALTER TABLE "cohorts" ADD COLUMN "max_students" integer DEFAULT 10;--> statement-breakpoint
ALTER TABLE "cohorts" ADD COLUMN "setup_finalized" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "classes" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "classes" DROP COLUMN "mode";--> statement-breakpoint
ALTER TABLE "classes" DROP COLUMN "room";--> statement-breakpoint
ALTER TABLE "classes" DROP COLUMN "materials";--> statement-breakpoint
ALTER TABLE "classes" DROP COLUMN "max_students";--> statement-breakpoint
ALTER TABLE "classes" DROP COLUMN "is_active";