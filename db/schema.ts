import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real, blob, index, uniqueIndex } from "drizzle-orm/sqlite-core";

const pk = () => text("id").primaryKey();
const ts = (name: string) => integer(name, { mode: "timestamp" });
const now = () => sql`(unixepoch())`;

// ────────────────────────────────────────────────────────────────────────────
// CORE — auth, companies, audit, flags
// ────────────────────────────────────────────────────────────────────────────

export const companies = sqliteTable("companies", {
  id: pk(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  taxId: text("tax_id"),
  group: text("group").default("patricia-pilar"),
  createdAt: ts("created_at").default(now()).notNull(),
});

export const users = sqliteTable(
  "users",
  {
    id: pk(),
    email: text("email").notNull().unique(),
    name: text("name").notNull(),
    role: text("role").notNull(),
    companyId: text("company_id").references(() => companies.id),
    active: integer("active", { mode: "boolean" }).default(true).notNull(),
    createdAt: ts("created_at").default(now()).notNull(),
  },
  (t) => ({
    roleIdx: index("users_role_idx").on(t.role),
  }),
);

export const sessions = sqliteTable("sessions", {
  id: pk(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: ts("expires_at").notNull(),
  createdAt: ts("created_at").default(now()).notNull(),
});

export const auditLog = sqliteTable(
  "audit_log",
  {
    id: pk(),
    userId: text("user_id").references(() => users.id),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    before: text("before"),
    after: text("after"),
    reason: text("reason"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: ts("created_at").default(now()).notNull(),
  },
  (t) => ({
    entityIdx: index("audit_entity_idx").on(t.entityType, t.entityId),
    actionIdx: index("audit_action_idx").on(t.action, t.createdAt),
  }),
);

export const featureFlags = sqliteTable("feature_flags", {
  key: text("key").primaryKey(),
  enabled: integer("enabled", { mode: "boolean" }).default(true).notNull(),
  description: text("description"),
  updatedAt: ts("updated_at").default(now()).notNull(),
});

// ────────────────────────────────────────────────────────────────────────────
// MASTERS
// ────────────────────────────────────────────────────────────────────────────

export const vehicles = sqliteTable(
  "vehicles",
  {
    id: pk(),
    plate: text("plate").notNull().unique(),
    kind: text("kind").notNull(),
    companyId: text("company_id")
      .notNull()
      .references(() => companies.id),
    isInternal: integer("is_internal", { mode: "boolean" }).default(true).notNull(),
    frotcomId: text("frotcom_id"),
    hasCanbus: integer("has_canbus", { mode: "boolean" }).default(true).notNull(),
    active: integer("active", { mode: "boolean" }).default(true).notNull(),
    createdAt: ts("created_at").default(now()).notNull(),
  },
  (t) => ({
    companyIdx: index("vehicles_company_idx").on(t.companyId),
  }),
);

export const drivers = sqliteTable("drivers", {
  id: pk(),
  name: text("name").notNull(),
  employeeCode: text("employee_code").unique(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  logueTransId: text("logue_trans_id"),
  active: integer("active", { mode: "boolean" }).default(true).notNull(),
});

export const serviceCodes = sqliteTable("service_codes", {
  code: text("code").primaryKey(),
  label: text("label").notNull(),
  description: text("description"),
  kind: text("kind").notNull(),
});

export const workCodes = sqliteTable("work_codes", {
  code: text("code").primaryKey(),
  label: text("label").notNull(),
  scope: text("scope").notNull(),
  companyId: text("company_id").references(() => companies.id),
});

export const suppliers = sqliteTable(
  "suppliers",
  {
    id: pk(),
    taxId: text("tax_id").notNull().unique(),
    name: text("name").notNull(),
    category: text("category"),
    defaultServiceCode: text("default_service_code").references(() => serviceCodes.code),
    defaultWorkCode: text("default_work_code").references(() => workCodes.code),
    contactEmail: text("contact_email"),
    createdAt: ts("created_at").default(now()).notNull(),
  },
  (t) => ({
    taxIdx: index("suppliers_tax_idx").on(t.taxId),
  }),
);

export const clients = sqliteTable("clients", {
  id: pk(),
  taxId: text("tax_id"),
  name: text("name").notNull(),
  country: text("country").default("PT"),
  paymentTermsDays: integer("payment_terms_days").default(60),
  phcId: text("phc_id"),
  createdAt: ts("created_at").default(now()).notNull(),
});

// ────────────────────────────────────────────────────────────────────────────
// MVP A — KM Validation
// ────────────────────────────────────────────────────────────────────────────

export const trips = sqliteTable(
  "trips",
  {
    id: pk(),
    externalId: text("external_id").notNull().unique(),
    vehicleId: text("vehicle_id")
      .notNull()
      .references(() => vehicles.id),
    driverId: text("driver_id").references(() => drivers.id),
    clientId: text("client_id").references(() => clients.id),
    origin: text("origin"),
    destination: text("destination"),
    startedAt: ts("started_at").notNull(),
    endedAt: ts("ended_at").notNull(),
    kmDeclared: real("km_declared"),
    kmGps: real("km_gps"),
    notes: text("notes"),
    source: text("source").notNull(),
  },
  (t) => ({
    vehicleTimeIdx: index("trips_vehicle_time_idx").on(t.vehicleId, t.startedAt),
  }),
);

export const kmReconciliations = sqliteTable(
  "km_reconciliations",
  {
    id: pk(),
    tripId: text("trip_id")
      .notNull()
      .references(() => trips.id)
      .unique(),
    kmDeclared: real("km_declared"),
    kmGps: real("km_gps"),
    deltaKm: real("delta_km"),
    deltaPct: real("delta_pct"),
    thresholdKm: real("threshold_km").notNull(),
    state: text("state").notNull(),
    proposedKm: real("proposed_km"),
    finalKm: real("final_km"),
    decidedBy: text("decided_by").references(() => users.id),
    decidedAt: ts("decided_at"),
    decisionReason: text("decision_reason"),
    createdAt: ts("created_at").default(now()).notNull(),
    updatedAt: ts("updated_at").default(now()).notNull(),
  },
  (t) => ({
    stateIdx: index("km_state_idx").on(t.state, t.createdAt),
  }),
);

// ────────────────────────────────────────────────────────────────────────────
// MVP B — OCR Invoices
// ────────────────────────────────────────────────────────────────────────────

export const invoices = sqliteTable(
  "invoices",
  {
    id: pk(),
    supplierId: text("supplier_id").references(() => suppliers.id),
    supplierNameRaw: text("supplier_name_raw"),
    supplierTaxIdRaw: text("supplier_tax_id_raw"),
    invoiceNumber: text("invoice_number"),
    issuedAt: ts("issued_at"),
    dueAt: ts("due_at"),
    totalNet: real("total_net"),
    totalVat: real("total_vat"),
    totalGross: real("total_gross"),
    currency: text("currency").default("EUR").notNull(),
    plate: text("plate"),
    vehicleId: text("vehicle_id").references(() => vehicles.id),
    serviceCode: text("service_code").references(() => serviceCodes.code),
    workCode: text("work_code").references(() => workCodes.code),
    state: text("state").notNull().default("pending_ocr"),
    confidenceAvg: real("confidence_avg"),
    sourcePath: text("source_path").notNull(),
    sourceHash: text("source_hash").notNull(),
    uploadedBy: text("uploaded_by").references(() => users.id),
    approvedBy: text("approved_by").references(() => users.id),
    approvedAt: ts("approved_at"),
    exportedAt: ts("exported_at"),
    createdAt: ts("created_at").default(now()).notNull(),
    updatedAt: ts("updated_at").default(now()).notNull(),
  },
  (t) => ({
    stateIdx: index("invoices_state_idx").on(t.state, t.createdAt),
    supplierIdx: index("invoices_supplier_idx").on(t.supplierId),
    hashIdx: uniqueIndex("invoices_hash_idx").on(t.sourceHash),
  }),
);

export const invoiceLines = sqliteTable("invoice_lines", {
  id: pk(),
  invoiceId: text("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  lineNumber: integer("line_number").notNull(),
  description: text("description").notNull(),
  quantity: real("quantity"),
  unitPrice: real("unit_price"),
  vatRate: real("vat_rate"),
  total: real("total"),
  serviceCode: text("service_code").references(() => serviceCodes.code),
  confidence: real("confidence"),
});

export const ocrExtractions = sqliteTable("ocr_extractions", {
  id: pk(),
  invoiceId: text("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  engine: text("engine").notNull(),
  rawText: text("raw_text"),
  rawJson: text("raw_json"),
  confidencePerField: text("confidence_per_field"),
  createdAt: ts("created_at").default(now()).notNull(),
});

export const supplierRules = sqliteTable(
  "supplier_rules",
  {
    id: pk(),
    supplierId: text("supplier_id")
      .notNull()
      .references(() => suppliers.id),
    field: text("field").notNull(),
    value: text("value").notNull(),
    matchPattern: text("match_pattern"),
    learnedFromInvoiceId: text("learned_from_invoice_id").references(() => invoices.id),
    hitCount: integer("hit_count").default(0).notNull(),
    createdAt: ts("created_at").default(now()).notNull(),
  },
  (t) => ({
    supplierFieldIdx: index("rules_supplier_field_idx").on(t.supplierId, t.field),
  }),
);

// ────────────────────────────────────────────────────────────────────────────
// MVP C — Document Hub
// ────────────────────────────────────────────────────────────────────────────

export const documents = sqliteTable(
  "documents",
  {
    id: pk(),
    kind: text("kind").notNull(),
    cmrNumber: text("cmr_number"),
    plate: text("plate"),
    loadedAt: ts("loaded_at"),
    deliveredAt: ts("delivered_at"),
    sourcePath: text("source_path").notNull(),
    sourceHash: text("source_hash").notNull().unique(),
    ocrText: text("ocr_text"),
    state: text("state").notNull().default("pending_association"),
    uploadedBy: text("uploaded_by").references(() => users.id),
    createdAt: ts("created_at").default(now()).notNull(),
  },
  (t) => ({
    cmrIdx: index("docs_cmr_idx").on(t.cmrNumber),
    plateDateIdx: index("docs_plate_date_idx").on(t.plate, t.loadedAt),
  }),
);

export const documentAssociations = sqliteTable("document_associations", {
  id: pk(),
  documentId: text("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  tripId: text("trip_id").references(() => trips.id),
  confidence: real("confidence").notNull(),
  method: text("method").notNull(),
  confirmedBy: text("confirmed_by").references(() => users.id),
  confirmedAt: ts("confirmed_at"),
  createdAt: ts("created_at").default(now()).notNull(),
});

export const documentPermissions = sqliteTable("document_permissions", {
  id: pk(),
  documentId: text("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  canRead: integer("can_read", { mode: "boolean" }).default(true).notNull(),
  canDownload: integer("can_download", { mode: "boolean" }).default(true).notNull(),
});

// ────────────────────────────────────────────────────────────────────────────
// MVP D — Fuel
// ────────────────────────────────────────────────────────────────────────────

export const fuelReadingsCanbus = sqliteTable(
  "fuel_readings_canbus",
  {
    id: pk(),
    vehicleId: text("vehicle_id")
      .notNull()
      .references(() => vehicles.id),
    readAt: ts("read_at").notNull(),
    odometerKm: real("odometer_km"),
    tankLevelPct: real("tank_level_pct"),
    litersConsumed: real("liters_consumed"),
  },
  (t) => ({
    vehicleTimeIdx: index("canbus_vehicle_time_idx").on(t.vehicleId, t.readAt),
  }),
);

export const fuelFills = sqliteTable(
  "fuel_fills",
  {
    id: pk(),
    vehicleId: text("vehicle_id")
      .notNull()
      .references(() => vehicles.id),
    driverId: text("driver_id").references(() => drivers.id),
    source: text("source").notNull(),
    filledAt: ts("filled_at").notNull(),
    liters: real("liters").notNull(),
    pricePerLiter: real("price_per_liter"),
    totalEur: real("total_eur"),
    odometerKm: real("odometer_km"),
    cardNumber: text("card_number"),
    location: text("location"),
    externalRef: text("external_ref"),
  },
  (t) => ({
    vehicleTimeIdx: index("fills_vehicle_time_idx").on(t.vehicleId, t.filledAt),
    sourceIdx: index("fills_source_idx").on(t.source),
  }),
);

export const fuelAnomalies = sqliteTable("fuel_anomalies", {
  id: pk(),
  vehicleId: text("vehicle_id")
    .notNull()
    .references(() => vehicles.id),
  kind: text("kind").notNull(),
  severity: text("severity").notNull(),
  detectedAt: ts("detected_at").default(now()).notNull(),
  windowFrom: ts("window_from").notNull(),
  windowTo: ts("window_to").notNull(),
  expected: real("expected"),
  actual: real("actual"),
  deviationPct: real("deviation_pct"),
  notes: text("notes"),
  state: text("state").notNull().default("open"),
  resolvedBy: text("resolved_by").references(() => users.id),
  resolvedAt: ts("resolved_at"),
});

// ────────────────────────────────────────────────────────────────────────────
// MVP E — Freight Exchange
// ────────────────────────────────────────────────────────────────────────────

export const freightLoads = sqliteTable(
  "freight_loads",
  {
    id: pk(),
    reference: text("reference").notNull().unique(),
    salespersonId: text("salesperson_id")
      .notNull()
      .references(() => users.id),
    clientId: text("client_id")
      .notNull()
      .references(() => clients.id),
    supplierId: text("supplier_id")
      .notNull()
      .references(() => suppliers.id),
    origin: text("origin").notNull(),
    destination: text("destination").notNull(),
    loadedAt: ts("loaded_at"),
    deliveredAt: ts("delivered_at"),
    plate: text("plate"),
    priceBuy: real("price_buy").notNull(),
    priceSell: real("price_sell").notNull(),
    margin: real("margin").notNull(),
    marginPct: real("margin_pct").notNull(),
    currency: text("currency").default("EUR").notNull(),
    state: text("state").notNull().default("scheduled"),
    notes: text("notes"),
    createdAt: ts("created_at").default(now()).notNull(),
    updatedAt: ts("updated_at").default(now()).notNull(),
  },
  (t) => ({
    stateIdx: index("freight_state_idx").on(t.state),
    salespersonIdx: index("freight_salesperson_idx").on(t.salespersonId),
  }),
);

export const freightStateTransitions = sqliteTable("freight_state_transitions", {
  id: pk(),
  loadId: text("load_id")
    .notNull()
    .references(() => freightLoads.id, { onDelete: "cascade" }),
  fromState: text("from_state").notNull(),
  toState: text("to_state").notNull(),
  userId: text("user_id").references(() => users.id),
  reason: text("reason"),
  createdAt: ts("created_at").default(now()).notNull(),
});

export const supplierInvoicesFreight = sqliteTable("supplier_invoices_freight", {
  id: pk(),
  loadId: text("load_id")
    .notNull()
    .references(() => freightLoads.id, { onDelete: "cascade" }),
  invoiceNumber: text("invoice_number").notNull(),
  issuedAt: ts("issued_at").notNull(),
  totalGross: real("total_gross").notNull(),
  deviation: real("deviation"),
  deviationPct: real("deviation_pct"),
  state: text("state").notNull().default("pending_review"),
  reviewedBy: text("reviewed_by").references(() => users.id),
  reviewedAt: ts("reviewed_at"),
});

export const clientInvoicesFreight = sqliteTable("client_invoices_freight", {
  id: pk(),
  loadId: text("load_id")
    .notNull()
    .references(() => freightLoads.id, { onDelete: "cascade" }),
  invoiceNumber: text("invoice_number").notNull(),
  issuedAt: ts("issued_at").notNull(),
  dueAt: ts("due_at").notNull(),
  totalGross: real("total_gross").notNull(),
  paidAt: ts("paid_at"),
});

export const commissionRules = sqliteTable("commission_rules", {
  id: pk(),
  salespersonId: text("salesperson_id").references(() => users.id),
  percentOfMargin: real("percent_of_margin").notNull(),
  minMarginPct: real("min_margin_pct"),
  activeFrom: ts("active_from").notNull(),
  activeTo: ts("active_to"),
});

export const commissions = sqliteTable("commissions", {
  id: pk(),
  loadId: text("load_id")
    .notNull()
    .references(() => freightLoads.id),
  salespersonId: text("salesperson_id")
    .notNull()
    .references(() => users.id),
  period: text("period").notNull(),
  amountEur: real("amount_eur").notNull(),
  ruleId: text("rule_id").references(() => commissionRules.id),
  state: text("state").notNull().default("accrued"),
  paidAt: ts("paid_at"),
});

// ────────────────────────────────────────────────────────────────────────────
// MVP F — Workshop (Folha de Obra)
// ────────────────────────────────────────────────────────────────────────────

export const workOrders = sqliteTable(
  "work_orders",
  {
    id: pk(),
    reference: text("reference").notNull().unique(),
    vehicleId: text("vehicle_id")
      .notNull()
      .references(() => vehicles.id),
    mechanicId: text("mechanic_id")
      .notNull()
      .references(() => users.id),
    serviceCode: text("service_code").references(() => serviceCodes.code),
    workCode: text("work_code").references(() => workCodes.code),
    startedAt: ts("started_at").notNull(),
    endedAt: ts("ended_at"),
    durationMinutes: integer("duration_minutes"),
    summary: text("summary"),
    state: text("state").notNull().default("draft"),
    approvedBy: text("approved_by").references(() => users.id),
    approvedAt: ts("approved_at"),
    exportedAt: ts("exported_at"),
    syncVersion: integer("sync_version").default(0).notNull(),
    createdAt: ts("created_at").default(now()).notNull(),
    updatedAt: ts("updated_at").default(now()).notNull(),
  },
  (t) => ({
    vehicleIdx: index("wo_vehicle_idx").on(t.vehicleId),
    stateIdx: index("wo_state_idx").on(t.state),
  }),
);

export const workOrderItems = sqliteTable("work_order_items", {
  id: pk(),
  workOrderId: text("work_order_id")
    .notNull()
    .references(() => workOrders.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  description: text("description").notNull(),
  partCode: text("part_code"),
  quantity: real("quantity").default(1).notNull(),
  unitPrice: real("unit_price"),
  total: real("total"),
  sourceInvoiceId: text("source_invoice_id").references(() => invoices.id),
});

export const workOrderPhotos = sqliteTable("work_order_photos", {
  id: pk(),
  workOrderId: text("work_order_id")
    .notNull()
    .references(() => workOrders.id, { onDelete: "cascade" }),
  stage: text("stage").notNull(),
  path: text("path").notNull(),
  capturedAt: ts("captured_at").default(now()).notNull(),
});

export const workOrderSignatures = sqliteTable("work_order_signatures", {
  id: pk(),
  workOrderId: text("work_order_id")
    .notNull()
    .references(() => workOrders.id, { onDelete: "cascade" }),
  signerRole: text("signer_role").notNull(),
  signerName: text("signer_name").notNull(),
  svgPath: text("svg_path").notNull(),
  signedAt: ts("signed_at").default(now()).notNull(),
});
