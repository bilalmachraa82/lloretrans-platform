ALTER TABLE "freight_loads" ALTER COLUMN "supplier_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "freight_loads" ADD COLUMN "carrier_name" text;--> statement-breakpoint
ALTER TABLE "freight_loads" ADD COLUMN "carrier_kind" text DEFAULT 'external_transporter' NOT NULL;--> statement-breakpoint
ALTER TABLE "freight_loads" ADD COLUMN "trailer_plate" text;--> statement-breakpoint
ALTER TABLE "freight_loads" ADD COLUMN "source_row" integer;--> statement-breakpoint
ALTER TABLE "freight_loads" ADD COLUMN "customer_invoice_number" text;--> statement-breakpoint
ALTER TABLE "freight_loads" ADD COLUMN "supplier_invoice_number" text;--> statement-breakpoint
ALTER TABLE "freight_loads" ADD COLUMN "cmr_number" text;--> statement-breakpoint
ALTER TABLE "freight_loads" ADD COLUMN "payment_regularization" text;--> statement-breakpoint
ALTER TABLE "freight_loads" ADD COLUMN "payment_month" text;--> statement-breakpoint
ALTER TABLE "freight_loads" ADD COLUMN "service_value_eur" double precision;--> statement-breakpoint
ALTER TABLE "fuel_fills" ADD COLUMN "product" text;--> statement-breakpoint
ALTER TABLE "fuel_fills" ADD COLUMN "station_country" text;--> statement-breakpoint
ALTER TABLE "fuel_fills" ADD COLUMN "provider_invoice_number" text;--> statement-breakpoint
ALTER TABLE "fuel_fills" ADD COLUMN "source_file" text;--> statement-breakpoint
ALTER TABLE "fuel_fills" ADD COLUMN "source_row" integer;--> statement-breakpoint
ALTER TABLE "fuel_fills" ADD COLUMN "driver_name_raw" text;