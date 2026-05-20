CREATE TYPE "public"."subject_level" AS ENUM('IGCSE', 'A Level');--> statement-breakpoint
ALTER TABLE "subjects" ADD COLUMN "level" "subject_level" DEFAULT 'A Level' NOT NULL;