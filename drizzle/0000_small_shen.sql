CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`before` text,
	`after` text,
	`reason` text,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `audit_entity_idx` ON `audit_log` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `audit_action_idx` ON `audit_log` (`action`,`created_at`);--> statement-breakpoint
CREATE TABLE `client_invoices_freight` (
	`id` text PRIMARY KEY NOT NULL,
	`load_id` text NOT NULL,
	`invoice_number` text NOT NULL,
	`issued_at` integer NOT NULL,
	`due_at` integer NOT NULL,
	`total_gross` real NOT NULL,
	`paid_at` integer,
	FOREIGN KEY (`load_id`) REFERENCES `freight_loads`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` text PRIMARY KEY NOT NULL,
	`tax_id` text,
	`name` text NOT NULL,
	`country` text DEFAULT 'PT',
	`payment_terms_days` integer DEFAULT 60,
	`phc_id` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `commission_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`salesperson_id` text,
	`percent_of_margin` real NOT NULL,
	`min_margin_pct` real,
	`active_from` integer NOT NULL,
	`active_to` integer,
	FOREIGN KEY (`salesperson_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `commissions` (
	`id` text PRIMARY KEY NOT NULL,
	`load_id` text NOT NULL,
	`salesperson_id` text NOT NULL,
	`period` text NOT NULL,
	`amount_eur` real NOT NULL,
	`rule_id` text,
	`state` text DEFAULT 'accrued' NOT NULL,
	`paid_at` integer,
	FOREIGN KEY (`load_id`) REFERENCES `freight_loads`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`salesperson_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`rule_id`) REFERENCES `commission_rules`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `companies` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`tax_id` text,
	`group` text DEFAULT 'patricia-pilar',
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `companies_slug_unique` ON `companies` (`slug`);--> statement-breakpoint
CREATE TABLE `document_associations` (
	`id` text PRIMARY KEY NOT NULL,
	`document_id` text NOT NULL,
	`trip_id` text,
	`confidence` real NOT NULL,
	`method` text NOT NULL,
	`confirmed_by` text,
	`confirmed_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`confirmed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `document_permissions` (
	`id` text PRIMARY KEY NOT NULL,
	`document_id` text NOT NULL,
	`company_id` text NOT NULL,
	`can_read` integer DEFAULT true NOT NULL,
	`can_download` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`cmr_number` text,
	`plate` text,
	`loaded_at` integer,
	`delivered_at` integer,
	`source_path` text NOT NULL,
	`source_hash` text NOT NULL,
	`ocr_text` text,
	`state` text DEFAULT 'pending_association' NOT NULL,
	`uploaded_by` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `documents_source_hash_unique` ON `documents` (`source_hash`);--> statement-breakpoint
CREATE INDEX `docs_cmr_idx` ON `documents` (`cmr_number`);--> statement-breakpoint
CREATE INDEX `docs_plate_date_idx` ON `documents` (`plate`,`loaded_at`);--> statement-breakpoint
CREATE TABLE `drivers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`employee_code` text,
	`company_id` text NOT NULL,
	`logue_trans_id` text,
	`active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `drivers_employee_code_unique` ON `drivers` (`employee_code`);--> statement-breakpoint
CREATE TABLE `feature_flags` (
	`key` text PRIMARY KEY NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`description` text,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `freight_loads` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`salesperson_id` text NOT NULL,
	`client_id` text NOT NULL,
	`supplier_id` text NOT NULL,
	`origin` text NOT NULL,
	`destination` text NOT NULL,
	`loaded_at` integer,
	`delivered_at` integer,
	`plate` text,
	`price_buy` real NOT NULL,
	`price_sell` real NOT NULL,
	`margin` real NOT NULL,
	`margin_pct` real NOT NULL,
	`currency` text DEFAULT 'EUR' NOT NULL,
	`state` text DEFAULT 'scheduled' NOT NULL,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`salesperson_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `freight_loads_reference_unique` ON `freight_loads` (`reference`);--> statement-breakpoint
CREATE INDEX `freight_state_idx` ON `freight_loads` (`state`);--> statement-breakpoint
CREATE INDEX `freight_salesperson_idx` ON `freight_loads` (`salesperson_id`);--> statement-breakpoint
CREATE TABLE `freight_state_transitions` (
	`id` text PRIMARY KEY NOT NULL,
	`load_id` text NOT NULL,
	`from_state` text NOT NULL,
	`to_state` text NOT NULL,
	`user_id` text,
	`reason` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`load_id`) REFERENCES `freight_loads`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `fuel_anomalies` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`kind` text NOT NULL,
	`severity` text NOT NULL,
	`detected_at` integer DEFAULT (unixepoch()) NOT NULL,
	`window_from` integer NOT NULL,
	`window_to` integer NOT NULL,
	`expected` real,
	`actual` real,
	`deviation_pct` real,
	`notes` text,
	`state` text DEFAULT 'open' NOT NULL,
	`resolved_by` text,
	`resolved_at` integer,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`resolved_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `fuel_fills` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`driver_id` text,
	`source` text NOT NULL,
	`filled_at` integer NOT NULL,
	`liters` real NOT NULL,
	`price_per_liter` real,
	`total_eur` real,
	`odometer_km` real,
	`card_number` text,
	`location` text,
	`external_ref` text,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `fills_vehicle_time_idx` ON `fuel_fills` (`vehicle_id`,`filled_at`);--> statement-breakpoint
CREATE INDEX `fills_source_idx` ON `fuel_fills` (`source`);--> statement-breakpoint
CREATE TABLE `fuel_readings_canbus` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`read_at` integer NOT NULL,
	`odometer_km` real,
	`tank_level_pct` real,
	`liters_consumed` real,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `canbus_vehicle_time_idx` ON `fuel_readings_canbus` (`vehicle_id`,`read_at`);--> statement-breakpoint
CREATE TABLE `invoice_lines` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice_id` text NOT NULL,
	`line_number` integer NOT NULL,
	`description` text NOT NULL,
	`quantity` real,
	`unit_price` real,
	`vat_rate` real,
	`total` real,
	`service_code` text,
	`confidence` real,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`service_code`) REFERENCES `service_codes`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`supplier_id` text,
	`supplier_name_raw` text,
	`supplier_tax_id_raw` text,
	`invoice_number` text,
	`issued_at` integer,
	`due_at` integer,
	`total_net` real,
	`total_vat` real,
	`total_gross` real,
	`currency` text DEFAULT 'EUR' NOT NULL,
	`plate` text,
	`vehicle_id` text,
	`service_code` text,
	`work_code` text,
	`state` text DEFAULT 'pending_ocr' NOT NULL,
	`confidence_avg` real,
	`source_path` text NOT NULL,
	`source_hash` text NOT NULL,
	`uploaded_by` text,
	`approved_by` text,
	`approved_at` integer,
	`exported_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`service_code`) REFERENCES `service_codes`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`work_code`) REFERENCES `work_codes`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `invoices_state_idx` ON `invoices` (`state`,`created_at`);--> statement-breakpoint
CREATE INDEX `invoices_supplier_idx` ON `invoices` (`supplier_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `invoices_hash_idx` ON `invoices` (`source_hash`);--> statement-breakpoint
CREATE TABLE `km_reconciliations` (
	`id` text PRIMARY KEY NOT NULL,
	`trip_id` text NOT NULL,
	`km_declared` real,
	`km_gps` real,
	`delta_km` real,
	`delta_pct` real,
	`threshold_km` real NOT NULL,
	`state` text NOT NULL,
	`proposed_km` real,
	`final_km` real,
	`decided_by` text,
	`decided_at` integer,
	`decision_reason` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`decided_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `km_reconciliations_trip_id_unique` ON `km_reconciliations` (`trip_id`);--> statement-breakpoint
CREATE INDEX `km_state_idx` ON `km_reconciliations` (`state`,`created_at`);--> statement-breakpoint
CREATE TABLE `ocr_extractions` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice_id` text NOT NULL,
	`engine` text NOT NULL,
	`raw_text` text,
	`raw_json` text,
	`confidence_per_field` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `service_codes` (
	`code` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`description` text,
	`kind` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `supplier_invoices_freight` (
	`id` text PRIMARY KEY NOT NULL,
	`load_id` text NOT NULL,
	`invoice_number` text NOT NULL,
	`issued_at` integer NOT NULL,
	`total_gross` real NOT NULL,
	`deviation` real,
	`deviation_pct` real,
	`state` text DEFAULT 'pending_review' NOT NULL,
	`reviewed_by` text,
	`reviewed_at` integer,
	FOREIGN KEY (`load_id`) REFERENCES `freight_loads`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `supplier_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`supplier_id` text NOT NULL,
	`field` text NOT NULL,
	`value` text NOT NULL,
	`match_pattern` text,
	`learned_from_invoice_id` text,
	`hit_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`learned_from_invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `rules_supplier_field_idx` ON `supplier_rules` (`supplier_id`,`field`);--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` text PRIMARY KEY NOT NULL,
	`tax_id` text NOT NULL,
	`name` text NOT NULL,
	`category` text,
	`default_service_code` text,
	`default_work_code` text,
	`contact_email` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`default_service_code`) REFERENCES `service_codes`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`default_work_code`) REFERENCES `work_codes`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `suppliers_tax_id_unique` ON `suppliers` (`tax_id`);--> statement-breakpoint
CREATE INDEX `suppliers_tax_idx` ON `suppliers` (`tax_id`);--> statement-breakpoint
CREATE TABLE `trips` (
	`id` text PRIMARY KEY NOT NULL,
	`external_id` text NOT NULL,
	`vehicle_id` text NOT NULL,
	`driver_id` text,
	`client_id` text,
	`origin` text,
	`destination` text,
	`started_at` integer NOT NULL,
	`ended_at` integer NOT NULL,
	`km_declared` real,
	`km_gps` real,
	`notes` text,
	`source` text NOT NULL,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `trips_external_id_unique` ON `trips` (`external_id`);--> statement-breakpoint
CREATE INDEX `trips_vehicle_time_idx` ON `trips` (`vehicle_id`,`started_at`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`company_id` text,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`role`);--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` text PRIMARY KEY NOT NULL,
	`plate` text NOT NULL,
	`kind` text NOT NULL,
	`company_id` text NOT NULL,
	`is_internal` integer DEFAULT true NOT NULL,
	`frotcom_id` text,
	`has_canbus` integer DEFAULT true NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vehicles_plate_unique` ON `vehicles` (`plate`);--> statement-breakpoint
CREATE INDEX `vehicles_company_idx` ON `vehicles` (`company_id`);--> statement-breakpoint
CREATE TABLE `work_codes` (
	`code` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`scope` text NOT NULL,
	`company_id` text,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `work_order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`work_order_id` text NOT NULL,
	`kind` text NOT NULL,
	`description` text NOT NULL,
	`part_code` text,
	`quantity` real DEFAULT 1 NOT NULL,
	`unit_price` real,
	`total` real,
	`source_invoice_id` text,
	FOREIGN KEY (`work_order_id`) REFERENCES `work_orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `work_order_photos` (
	`id` text PRIMARY KEY NOT NULL,
	`work_order_id` text NOT NULL,
	`stage` text NOT NULL,
	`path` text NOT NULL,
	`captured_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`work_order_id`) REFERENCES `work_orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `work_order_signatures` (
	`id` text PRIMARY KEY NOT NULL,
	`work_order_id` text NOT NULL,
	`signer_role` text NOT NULL,
	`signer_name` text NOT NULL,
	`svg_path` text NOT NULL,
	`signed_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`work_order_id`) REFERENCES `work_orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `work_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`vehicle_id` text NOT NULL,
	`mechanic_id` text NOT NULL,
	`service_code` text,
	`work_code` text,
	`started_at` integer NOT NULL,
	`ended_at` integer,
	`duration_minutes` integer,
	`summary` text,
	`state` text DEFAULT 'draft' NOT NULL,
	`approved_by` text,
	`approved_at` integer,
	`exported_at` integer,
	`sync_version` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`mechanic_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`service_code`) REFERENCES `service_codes`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`work_code`) REFERENCES `work_codes`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `work_orders_reference_unique` ON `work_orders` (`reference`);--> statement-breakpoint
CREATE INDEX `wo_vehicle_idx` ON `work_orders` (`vehicle_id`);--> statement-breakpoint
CREATE INDEX `wo_state_idx` ON `work_orders` (`state`);