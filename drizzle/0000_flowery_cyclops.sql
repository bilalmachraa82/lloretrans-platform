CREATE TABLE "audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"before" text,
	"after" text,
	"reason" text,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_invoices_freight" (
	"id" text PRIMARY KEY NOT NULL,
	"load_id" text NOT NULL,
	"invoice_number" text NOT NULL,
	"issued_at" timestamp with time zone NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"total_gross" double precision NOT NULL,
	"paid_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" text PRIMARY KEY NOT NULL,
	"tax_id" text,
	"name" text NOT NULL,
	"country" text DEFAULT 'PT',
	"payment_terms_days" integer DEFAULT 60,
	"phc_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commission_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"salesperson_id" text,
	"percent_of_margin" double precision NOT NULL,
	"min_margin_pct" double precision,
	"active_from" timestamp with time zone NOT NULL,
	"active_to" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "commissions" (
	"id" text PRIMARY KEY NOT NULL,
	"load_id" text NOT NULL,
	"salesperson_id" text NOT NULL,
	"period" text NOT NULL,
	"amount_eur" double precision NOT NULL,
	"rule_id" text,
	"state" text DEFAULT 'accrued' NOT NULL,
	"paid_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"tax_id" text,
	"group" text DEFAULT 'patricia-pilar',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "companies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "document_associations" (
	"id" text PRIMARY KEY NOT NULL,
	"document_id" text NOT NULL,
	"trip_id" text,
	"confidence" double precision NOT NULL,
	"method" text NOT NULL,
	"confirmed_by" text,
	"confirmed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"document_id" text NOT NULL,
	"company_id" text NOT NULL,
	"can_read" boolean DEFAULT true NOT NULL,
	"can_download" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"cmr_number" text,
	"plate" text,
	"loaded_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"source_path" text NOT NULL,
	"source_hash" text NOT NULL,
	"ocr_text" text,
	"state" text DEFAULT 'pending_association' NOT NULL,
	"uploaded_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "documents_source_hash_unique" UNIQUE("source_hash")
);
--> statement-breakpoint
CREATE TABLE "drivers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"employee_code" text,
	"company_id" text NOT NULL,
	"logue_trans_id" text,
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "drivers_employee_code_unique" UNIQUE("employee_code")
);
--> statement-breakpoint
CREATE TABLE "feature_flags" (
	"key" text PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"description" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "freight_loads" (
	"id" text PRIMARY KEY NOT NULL,
	"reference" text NOT NULL,
	"salesperson_id" text NOT NULL,
	"client_id" text NOT NULL,
	"supplier_id" text NOT NULL,
	"origin" text NOT NULL,
	"destination" text NOT NULL,
	"loaded_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"plate" text,
	"price_buy" double precision NOT NULL,
	"price_sell" double precision NOT NULL,
	"margin" double precision NOT NULL,
	"margin_pct" double precision NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"state" text DEFAULT 'scheduled' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "freight_loads_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "freight_state_transitions" (
	"id" text PRIMARY KEY NOT NULL,
	"load_id" text NOT NULL,
	"from_state" text NOT NULL,
	"to_state" text NOT NULL,
	"user_id" text,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fuel_anomalies" (
	"id" text PRIMARY KEY NOT NULL,
	"vehicle_id" text NOT NULL,
	"kind" text NOT NULL,
	"severity" text NOT NULL,
	"detected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"window_from" timestamp with time zone NOT NULL,
	"window_to" timestamp with time zone NOT NULL,
	"expected" double precision,
	"actual" double precision,
	"deviation_pct" double precision,
	"notes" text,
	"state" text DEFAULT 'open' NOT NULL,
	"resolved_by" text,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "fuel_fills" (
	"id" text PRIMARY KEY NOT NULL,
	"vehicle_id" text NOT NULL,
	"driver_id" text,
	"source" text NOT NULL,
	"filled_at" timestamp with time zone NOT NULL,
	"liters" double precision NOT NULL,
	"price_per_liter" double precision,
	"total_eur" double precision,
	"odometer_km" double precision,
	"card_number" text,
	"location" text,
	"external_ref" text
);
--> statement-breakpoint
CREATE TABLE "fuel_readings_canbus" (
	"id" text PRIMARY KEY NOT NULL,
	"vehicle_id" text NOT NULL,
	"read_at" timestamp with time zone NOT NULL,
	"odometer_km" double precision,
	"tank_level_pct" double precision,
	"liters_consumed" double precision
);
--> statement-breakpoint
CREATE TABLE "invoice_lines" (
	"id" text PRIMARY KEY NOT NULL,
	"invoice_id" text NOT NULL,
	"line_number" integer NOT NULL,
	"description" text NOT NULL,
	"quantity" double precision,
	"unit_price" double precision,
	"vat_rate" double precision,
	"total" double precision,
	"service_code" text,
	"confidence" double precision
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"supplier_id" text,
	"supplier_name_raw" text,
	"supplier_tax_id_raw" text,
	"invoice_number" text,
	"issued_at" timestamp with time zone,
	"due_at" timestamp with time zone,
	"total_net" double precision,
	"total_vat" double precision,
	"total_gross" double precision,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"plate" text,
	"vehicle_id" text,
	"service_code" text,
	"work_code" text,
	"state" text DEFAULT 'pending_ocr' NOT NULL,
	"confidence_avg" double precision,
	"source_path" text NOT NULL,
	"source_hash" text NOT NULL,
	"uploaded_by" text,
	"approved_by" text,
	"approved_at" timestamp with time zone,
	"exported_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "km_reconciliations" (
	"id" text PRIMARY KEY NOT NULL,
	"trip_id" text NOT NULL,
	"km_declared" double precision,
	"km_gps" double precision,
	"delta_km" double precision,
	"delta_pct" double precision,
	"threshold_km" double precision NOT NULL,
	"state" text NOT NULL,
	"proposed_km" double precision,
	"final_km" double precision,
	"decided_by" text,
	"decided_at" timestamp with time zone,
	"decision_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "km_reconciliations_trip_id_unique" UNIQUE("trip_id")
);
--> statement-breakpoint
CREATE TABLE "ocr_extractions" (
	"id" text PRIMARY KEY NOT NULL,
	"invoice_id" text NOT NULL,
	"engine" text NOT NULL,
	"raw_text" text,
	"raw_json" text,
	"confidence_per_field" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_codes" (
	"code" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"kind" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplier_invoices_freight" (
	"id" text PRIMARY KEY NOT NULL,
	"load_id" text NOT NULL,
	"invoice_number" text NOT NULL,
	"issued_at" timestamp with time zone NOT NULL,
	"total_gross" double precision NOT NULL,
	"deviation" double precision,
	"deviation_pct" double precision,
	"state" text DEFAULT 'pending_review' NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "supplier_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"supplier_id" text NOT NULL,
	"field" text NOT NULL,
	"value" text NOT NULL,
	"match_pattern" text,
	"learned_from_invoice_id" text,
	"hit_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" text PRIMARY KEY NOT NULL,
	"tax_id" text NOT NULL,
	"name" text NOT NULL,
	"category" text,
	"default_service_code" text,
	"default_work_code" text,
	"contact_email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "suppliers_tax_id_unique" UNIQUE("tax_id")
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" text PRIMARY KEY NOT NULL,
	"external_id" text NOT NULL,
	"vehicle_id" text NOT NULL,
	"driver_id" text,
	"client_id" text,
	"origin" text,
	"destination" text,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone NOT NULL,
	"km_declared" double precision,
	"km_gps" double precision,
	"notes" text,
	"source" text NOT NULL,
	CONSTRAINT "trips_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"company_id" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" text PRIMARY KEY NOT NULL,
	"plate" text NOT NULL,
	"kind" text NOT NULL,
	"company_id" text NOT NULL,
	"is_internal" boolean DEFAULT true NOT NULL,
	"frotcom_id" text,
	"has_canbus" boolean DEFAULT true NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vehicles_plate_unique" UNIQUE("plate")
);
--> statement-breakpoint
CREATE TABLE "work_codes" (
	"code" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"scope" text NOT NULL,
	"company_id" text
);
--> statement-breakpoint
CREATE TABLE "work_order_items" (
	"id" text PRIMARY KEY NOT NULL,
	"work_order_id" text NOT NULL,
	"kind" text NOT NULL,
	"description" text NOT NULL,
	"part_code" text,
	"quantity" double precision DEFAULT 1 NOT NULL,
	"unit_price" double precision,
	"total" double precision,
	"source_invoice_id" text
);
--> statement-breakpoint
CREATE TABLE "work_order_photos" (
	"id" text PRIMARY KEY NOT NULL,
	"work_order_id" text NOT NULL,
	"stage" text NOT NULL,
	"path" text NOT NULL,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_order_signatures" (
	"id" text PRIMARY KEY NOT NULL,
	"work_order_id" text NOT NULL,
	"signer_role" text NOT NULL,
	"signer_name" text NOT NULL,
	"svg_path" text NOT NULL,
	"signed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_orders" (
	"id" text PRIMARY KEY NOT NULL,
	"reference" text NOT NULL,
	"vehicle_id" text NOT NULL,
	"mechanic_id" text NOT NULL,
	"service_code" text,
	"work_code" text,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone,
	"duration_minutes" integer,
	"summary" text,
	"state" text DEFAULT 'draft' NOT NULL,
	"approved_by" text,
	"approved_at" timestamp with time zone,
	"exported_at" timestamp with time zone,
	"sync_version" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "work_orders_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_invoices_freight" ADD CONSTRAINT "client_invoices_freight_load_id_freight_loads_id_fk" FOREIGN KEY ("load_id") REFERENCES "public"."freight_loads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commission_rules" ADD CONSTRAINT "commission_rules_salesperson_id_users_id_fk" FOREIGN KEY ("salesperson_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_load_id_freight_loads_id_fk" FOREIGN KEY ("load_id") REFERENCES "public"."freight_loads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_salesperson_id_users_id_fk" FOREIGN KEY ("salesperson_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_rule_id_commission_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."commission_rules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_associations" ADD CONSTRAINT "document_associations_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_associations" ADD CONSTRAINT "document_associations_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_associations" ADD CONSTRAINT "document_associations_confirmed_by_users_id_fk" FOREIGN KEY ("confirmed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_permissions" ADD CONSTRAINT "document_permissions_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_permissions" ADD CONSTRAINT "document_permissions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "freight_loads" ADD CONSTRAINT "freight_loads_salesperson_id_users_id_fk" FOREIGN KEY ("salesperson_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "freight_loads" ADD CONSTRAINT "freight_loads_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "freight_loads" ADD CONSTRAINT "freight_loads_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "freight_state_transitions" ADD CONSTRAINT "freight_state_transitions_load_id_freight_loads_id_fk" FOREIGN KEY ("load_id") REFERENCES "public"."freight_loads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "freight_state_transitions" ADD CONSTRAINT "freight_state_transitions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_anomalies" ADD CONSTRAINT "fuel_anomalies_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_anomalies" ADD CONSTRAINT "fuel_anomalies_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_fills" ADD CONSTRAINT "fuel_fills_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_fills" ADD CONSTRAINT "fuel_fills_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_readings_canbus" ADD CONSTRAINT "fuel_readings_canbus_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_service_code_service_codes_code_fk" FOREIGN KEY ("service_code") REFERENCES "public"."service_codes"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_service_code_service_codes_code_fk" FOREIGN KEY ("service_code") REFERENCES "public"."service_codes"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_work_code_work_codes_code_fk" FOREIGN KEY ("work_code") REFERENCES "public"."work_codes"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "km_reconciliations" ADD CONSTRAINT "km_reconciliations_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "km_reconciliations" ADD CONSTRAINT "km_reconciliations_decided_by_users_id_fk" FOREIGN KEY ("decided_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ocr_extractions" ADD CONSTRAINT "ocr_extractions_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_invoices_freight" ADD CONSTRAINT "supplier_invoices_freight_load_id_freight_loads_id_fk" FOREIGN KEY ("load_id") REFERENCES "public"."freight_loads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_invoices_freight" ADD CONSTRAINT "supplier_invoices_freight_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_rules" ADD CONSTRAINT "supplier_rules_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_rules" ADD CONSTRAINT "supplier_rules_learned_from_invoice_id_invoices_id_fk" FOREIGN KEY ("learned_from_invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_default_service_code_service_codes_code_fk" FOREIGN KEY ("default_service_code") REFERENCES "public"."service_codes"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_default_work_code_work_codes_code_fk" FOREIGN KEY ("default_work_code") REFERENCES "public"."work_codes"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_codes" ADD CONSTRAINT "work_codes_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order_items" ADD CONSTRAINT "work_order_items_work_order_id_work_orders_id_fk" FOREIGN KEY ("work_order_id") REFERENCES "public"."work_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order_items" ADD CONSTRAINT "work_order_items_source_invoice_id_invoices_id_fk" FOREIGN KEY ("source_invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order_photos" ADD CONSTRAINT "work_order_photos_work_order_id_work_orders_id_fk" FOREIGN KEY ("work_order_id") REFERENCES "public"."work_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order_signatures" ADD CONSTRAINT "work_order_signatures_work_order_id_work_orders_id_fk" FOREIGN KEY ("work_order_id") REFERENCES "public"."work_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_mechanic_id_users_id_fk" FOREIGN KEY ("mechanic_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_service_code_service_codes_code_fk" FOREIGN KEY ("service_code") REFERENCES "public"."service_codes"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_work_code_work_codes_code_fk" FOREIGN KEY ("work_code") REFERENCES "public"."work_codes"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_entity_idx" ON "audit_log" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_action_idx" ON "audit_log" USING btree ("action","created_at");--> statement-breakpoint
CREATE INDEX "docs_cmr_idx" ON "documents" USING btree ("cmr_number");--> statement-breakpoint
CREATE INDEX "docs_plate_date_idx" ON "documents" USING btree ("plate","loaded_at");--> statement-breakpoint
CREATE INDEX "freight_state_idx" ON "freight_loads" USING btree ("state");--> statement-breakpoint
CREATE INDEX "freight_salesperson_idx" ON "freight_loads" USING btree ("salesperson_id");--> statement-breakpoint
CREATE INDEX "fills_vehicle_time_idx" ON "fuel_fills" USING btree ("vehicle_id","filled_at");--> statement-breakpoint
CREATE INDEX "fills_source_idx" ON "fuel_fills" USING btree ("source");--> statement-breakpoint
CREATE INDEX "canbus_vehicle_time_idx" ON "fuel_readings_canbus" USING btree ("vehicle_id","read_at");--> statement-breakpoint
CREATE INDEX "invoices_state_idx" ON "invoices" USING btree ("state","created_at");--> statement-breakpoint
CREATE INDEX "invoices_supplier_idx" ON "invoices" USING btree ("supplier_id");--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_hash_idx" ON "invoices" USING btree ("source_hash");--> statement-breakpoint
CREATE INDEX "km_state_idx" ON "km_reconciliations" USING btree ("state","created_at");--> statement-breakpoint
CREATE INDEX "rules_supplier_field_idx" ON "supplier_rules" USING btree ("supplier_id","field");--> statement-breakpoint
CREATE INDEX "suppliers_tax_idx" ON "suppliers" USING btree ("tax_id");--> statement-breakpoint
CREATE INDEX "trips_vehicle_time_idx" ON "trips" USING btree ("vehicle_id","started_at");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "vehicles_company_idx" ON "vehicles" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "wo_vehicle_idx" ON "work_orders" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "wo_state_idx" ON "work_orders" USING btree ("state");