CREATE TABLE "work_order_checklist_answers" (
	"id" text PRIMARY KEY NOT NULL,
	"work_order_id" text NOT NULL,
	"item_key" text NOT NULL,
	"substituted" boolean DEFAULT false NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "commission_rules" ADD COLUMN "fixed_bonus_national_eur" double precision DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "commission_rules" ADD COLUMN "fixed_bonus_international_eur" double precision DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "commission_rules" ADD COLUMN "require_internal_vehicle" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "direction" text DEFAULT 'saida' NOT NULL;--> statement-breakpoint
ALTER TABLE "work_orders" ADD COLUMN "active_minutes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "work_orders" ADD COLUMN "paused_minutes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "work_orders" ADD COLUMN "last_paused_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "work_orders" ADD COLUMN "pause_reason" text;--> statement-breakpoint
ALTER TABLE "work_order_checklist_answers" ADD CONSTRAINT "work_order_checklist_answers_work_order_id_work_orders_id_fk" FOREIGN KEY ("work_order_id") REFERENCES "public"."work_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "wo_checklist_wo_idx" ON "work_order_checklist_answers" USING btree ("work_order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "wo_checklist_wo_item_uidx" ON "work_order_checklist_answers" USING btree ("work_order_id","item_key");