import {
  pgTable,
  text,
  integer,
  doublePrecision,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const pk = () => text("id").primaryKey();
const ts = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });

// ────────────────────────────────────────────────────────────────────────────
// CORE — auth, companies, audit, flags
// ────────────────────────────────────────────────────────────────────────────

export const companies = pgTable("companies", {
  id: pk(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  taxId: text("tax_id"),
  group: text("group").default("patricia-pilar"),
  createdAt: ts("created_at").defaultNow().notNull(),
});

export const users = pgTable(
  "users",
  {
    id: pk(),
    email: text("email").notNull().unique(),
    name: text("name").notNull(),
    role: text("role").notNull(),
    companyId: text("company_id").references(() => companies.id),
    active: boolean("active").default(true).notNull(),
    createdAt: ts("created_at").defaultNow().notNull(),
  },
  (t) => ({
    roleIdx: index("users_role_idx").on(t.role),
  }),
);

export const sessions = pgTable("sessions", {
  id: pk(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: ts("expires_at").notNull(),
  createdAt: ts("created_at").defaultNow().notNull(),
});

export const auditLog = pgTable(
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
    createdAt: ts("created_at").defaultNow().notNull(),
  },
  (t) => ({
    entityIdx: index("audit_entity_idx").on(t.entityType, t.entityId),
    actionIdx: index("audit_action_idx").on(t.action, t.createdAt),
  }),
);

export const featureFlags = pgTable("feature_flags", {
  key: text("key").primaryKey(),
  enabled: boolean("enabled").default(true).notNull(),
  description: text("description"),
  updatedAt: ts("updated_at").defaultNow().notNull(),
});

// ────────────────────────────────────────────────────────────────────────────
// MASTERS
// ────────────────────────────────────────────────────────────────────────────

export const vehicles = pgTable(
  "vehicles",
  {
    id: pk(),
    plate: text("plate").notNull().unique(),
    kind: text("kind").notNull(),
    companyId: text("company_id")
      .notNull()
      .references(() => companies.id),
    isInternal: boolean("is_internal").default(true).notNull(),
    frotcomId: text("frotcom_id"),
    hasCanbus: boolean("has_canbus").default(true).notNull(),
    active: boolean("active").default(true).notNull(),
    createdAt: ts("created_at").defaultNow().notNull(),
  },
  (t) => ({
    companyIdx: index("vehicles_company_idx").on(t.companyId),
  }),
);

export const drivers = pgTable("drivers", {
  id: pk(),
  name: text("name").notNull(),
  employeeCode: text("employee_code").unique(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  logueTransId: text("logue_trans_id"),
  active: boolean("active").default(true).notNull(),
});

export const serviceCodes = pgTable("service_codes", {
  code: text("code").primaryKey(),
  label: text("label").notNull(),
  description: text("description"),
  kind: text("kind").notNull(),
});

export const workCodes = pgTable("work_codes", {
  code: text("code").primaryKey(),
  label: text("label").notNull(),
  scope: text("scope").notNull(),
  companyId: text("company_id").references(() => companies.id),
});

export const suppliers = pgTable(
  "suppliers",
  {
    id: pk(),
    taxId: text("tax_id").notNull().unique(),
    name: text("name").notNull(),
    category: text("category"),
    defaultServiceCode: text("default_service_code").references(() => serviceCodes.code),
    defaultWorkCode: text("default_work_code").references(() => workCodes.code),
    contactEmail: text("contact_email"),
    createdAt: ts("created_at").defaultNow().notNull(),
  },
  (t) => ({
    taxIdx: index("suppliers_tax_idx").on(t.taxId),
  }),
);

export const clients = pgTable("clients", {
  id: pk(),
  taxId: text("tax_id"),
  name: text("name").notNull(),
  country: text("country").default("PT"),
  paymentTermsDays: integer("payment_terms_days").default(60),
  phcId: text("phc_id"),
  createdAt: ts("created_at").defaultNow().notNull(),
});

// ────────────────────────────────────────────────────────────────────────────
// MVP A — KM Validation
// ────────────────────────────────────────────────────────────────────────────

export const trips = pgTable(
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
    kmDeclared: doublePrecision("km_declared"),
    kmGps: doublePrecision("km_gps"),
    notes: text("notes"),
    source: text("source").notNull(),
  },
  (t) => ({
    vehicleTimeIdx: index("trips_vehicle_time_idx").on(t.vehicleId, t.startedAt),
  }),
);

export const kmReconciliations = pgTable(
  "km_reconciliations",
  {
    id: pk(),
    tripId: text("trip_id")
      .notNull()
      .references(() => trips.id)
      .unique(),
    kmDeclared: doublePrecision("km_declared"),
    kmGps: doublePrecision("km_gps"),
    deltaKm: doublePrecision("delta_km"),
    deltaPct: doublePrecision("delta_pct"),
    thresholdKm: doublePrecision("threshold_km").notNull(),
    state: text("state").notNull(),
    proposedKm: doublePrecision("proposed_km"),
    finalKm: doublePrecision("final_km"),
    decidedBy: text("decided_by").references(() => users.id),
    decidedAt: ts("decided_at"),
    decisionReason: text("decision_reason"),
    createdAt: ts("created_at").defaultNow().notNull(),
    updatedAt: ts("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    stateIdx: index("km_state_idx").on(t.state, t.createdAt),
  }),
);

// ────────────────────────────────────────────────────────────────────────────
// MVP B — OCR Invoices
// ────────────────────────────────────────────────────────────────────────────

export const invoices = pgTable(
  "invoices",
  {
    id: pk(),
    supplierId: text("supplier_id").references(() => suppliers.id),
    supplierNameRaw: text("supplier_name_raw"),
    supplierTaxIdRaw: text("supplier_tax_id_raw"),
    invoiceNumber: text("invoice_number"),
    issuedAt: ts("issued_at"),
    dueAt: ts("due_at"),
    totalNet: doublePrecision("total_net"),
    totalVat: doublePrecision("total_vat"),
    totalGross: doublePrecision("total_gross"),
    currency: text("currency").default("EUR").notNull(),
    plate: text("plate"),
    vehicleId: text("vehicle_id").references(() => vehicles.id),
    serviceCode: text("service_code").references(() => serviceCodes.code),
    workCode: text("work_code").references(() => workCodes.code),
    state: text("state").notNull().default("pending_ocr"),
    confidenceAvg: doublePrecision("confidence_avg"),
    sourcePath: text("source_path").notNull(),
    sourceHash: text("source_hash").notNull(),
    uploadedBy: text("uploaded_by").references(() => users.id),
    approvedBy: text("approved_by").references(() => users.id),
    approvedAt: ts("approved_at"),
    exportedAt: ts("exported_at"),
    createdAt: ts("created_at").defaultNow().notNull(),
    updatedAt: ts("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    stateIdx: index("invoices_state_idx").on(t.state, t.createdAt),
    supplierIdx: index("invoices_supplier_idx").on(t.supplierId),
    hashIdx: uniqueIndex("invoices_hash_idx").on(t.sourceHash),
  }),
);

export const invoiceLines = pgTable("invoice_lines", {
  id: pk(),
  invoiceId: text("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  lineNumber: integer("line_number").notNull(),
  description: text("description").notNull(),
  quantity: doublePrecision("quantity"),
  unitPrice: doublePrecision("unit_price"),
  vatRate: doublePrecision("vat_rate"),
  total: doublePrecision("total"),
  serviceCode: text("service_code").references(() => serviceCodes.code),
  confidence: doublePrecision("confidence"),
});

export const ocrExtractions = pgTable("ocr_extractions", {
  id: pk(),
  invoiceId: text("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  engine: text("engine").notNull(),
  rawText: text("raw_text"),
  rawJson: text("raw_json"),
  confidencePerField: text("confidence_per_field"),
  createdAt: ts("created_at").defaultNow().notNull(),
});

export const supplierRules = pgTable(
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
    createdAt: ts("created_at").defaultNow().notNull(),
  },
  (t) => ({
    supplierFieldIdx: index("rules_supplier_field_idx").on(t.supplierId, t.field),
  }),
);

// ────────────────────────────────────────────────────────────────────────────
// MVP C — Document Hub
// ────────────────────────────────────────────────────────────────────────────

export const documents = pgTable(
  "documents",
  {
    id: pk(),
    kind: text("kind").notNull(),
    direction: text("direction").default("saida").notNull(),
    cmrNumber: text("cmr_number"),
    plate: text("plate"),
    loadedAt: ts("loaded_at"),
    deliveredAt: ts("delivered_at"),
    sourcePath: text("source_path").notNull(),
    sourceHash: text("source_hash").notNull().unique(),
    ocrText: text("ocr_text"),
    state: text("state").notNull().default("pending_association"),
    uploadedBy: text("uploaded_by").references(() => users.id),
    createdAt: ts("created_at").defaultNow().notNull(),
  },
  (t) => ({
    cmrIdx: index("docs_cmr_idx").on(t.cmrNumber),
    plateDateIdx: index("docs_plate_date_idx").on(t.plate, t.loadedAt),
  }),
);

export const documentAssociations = pgTable("document_associations", {
  id: pk(),
  documentId: text("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  tripId: text("trip_id").references(() => trips.id),
  confidence: doublePrecision("confidence").notNull(),
  method: text("method").notNull(),
  confirmedBy: text("confirmed_by").references(() => users.id),
  confirmedAt: ts("confirmed_at"),
  createdAt: ts("created_at").defaultNow().notNull(),
});

export const documentPermissions = pgTable("document_permissions", {
  id: pk(),
  documentId: text("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  canRead: boolean("can_read").default(true).notNull(),
  canDownload: boolean("can_download").default(true).notNull(),
});

// ────────────────────────────────────────────────────────────────────────────
// MVP D — Fuel
// ────────────────────────────────────────────────────────────────────────────

export const fuelReadingsCanbus = pgTable(
  "fuel_readings_canbus",
  {
    id: pk(),
    vehicleId: text("vehicle_id")
      .notNull()
      .references(() => vehicles.id),
    readAt: ts("read_at").notNull(),
    odometerKm: doublePrecision("odometer_km"),
    tankLevelPct: doublePrecision("tank_level_pct"),
    litersConsumed: doublePrecision("liters_consumed"),
  },
  (t) => ({
    vehicleTimeIdx: index("canbus_vehicle_time_idx").on(t.vehicleId, t.readAt),
  }),
);

export const fuelFills = pgTable(
  "fuel_fills",
  {
    id: pk(),
    vehicleId: text("vehicle_id")
      .notNull()
      .references(() => vehicles.id),
    driverId: text("driver_id").references(() => drivers.id),
    source: text("source").notNull(),
    filledAt: ts("filled_at").notNull(),
    liters: doublePrecision("liters").notNull(),
    pricePerLiter: doublePrecision("price_per_liter"),
    totalEur: doublePrecision("total_eur"),
    odometerKm: doublePrecision("odometer_km"),
    cardNumber: text("card_number"),
    location: text("location"),
    externalRef: text("external_ref"),
  },
  (t) => ({
    vehicleTimeIdx: index("fills_vehicle_time_idx").on(t.vehicleId, t.filledAt),
    sourceIdx: index("fills_source_idx").on(t.source),
  }),
);

export const fuelAnomalies = pgTable("fuel_anomalies", {
  id: pk(),
  vehicleId: text("vehicle_id")
    .notNull()
    .references(() => vehicles.id),
  kind: text("kind").notNull(),
  severity: text("severity").notNull(),
  detectedAt: ts("detected_at").defaultNow().notNull(),
  windowFrom: ts("window_from").notNull(),
  windowTo: ts("window_to").notNull(),
  expected: doublePrecision("expected"),
  actual: doublePrecision("actual"),
  deviationPct: doublePrecision("deviation_pct"),
  notes: text("notes"),
  state: text("state").notNull().default("open"),
  resolvedBy: text("resolved_by").references(() => users.id),
  resolvedAt: ts("resolved_at"),
});

// ────────────────────────────────────────────────────────────────────────────
// MVP E — Freight Exchange
// ────────────────────────────────────────────────────────────────────────────

export const freightLoads = pgTable(
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
    priceBuy: doublePrecision("price_buy").notNull(),
    priceSell: doublePrecision("price_sell").notNull(),
    margin: doublePrecision("margin").notNull(),
    marginPct: doublePrecision("margin_pct").notNull(),
    currency: text("currency").default("EUR").notNull(),
    state: text("state").notNull().default("scheduled"),
    notes: text("notes"),
    createdAt: ts("created_at").defaultNow().notNull(),
    updatedAt: ts("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    stateIdx: index("freight_state_idx").on(t.state),
    salespersonIdx: index("freight_salesperson_idx").on(t.salespersonId),
  }),
);

export const freightStateTransitions = pgTable("freight_state_transitions", {
  id: pk(),
  loadId: text("load_id")
    .notNull()
    .references(() => freightLoads.id, { onDelete: "cascade" }),
  fromState: text("from_state").notNull(),
  toState: text("to_state").notNull(),
  userId: text("user_id").references(() => users.id),
  reason: text("reason"),
  createdAt: ts("created_at").defaultNow().notNull(),
});

export const supplierInvoicesFreight = pgTable("supplier_invoices_freight", {
  id: pk(),
  loadId: text("load_id")
    .notNull()
    .references(() => freightLoads.id, { onDelete: "cascade" }),
  invoiceNumber: text("invoice_number").notNull(),
  issuedAt: ts("issued_at").notNull(),
  totalGross: doublePrecision("total_gross").notNull(),
  deviation: doublePrecision("deviation"),
  deviationPct: doublePrecision("deviation_pct"),
  state: text("state").notNull().default("pending_review"),
  reviewedBy: text("reviewed_by").references(() => users.id),
  reviewedAt: ts("reviewed_at"),
});

export const clientInvoicesFreight = pgTable("client_invoices_freight", {
  id: pk(),
  loadId: text("load_id")
    .notNull()
    .references(() => freightLoads.id, { onDelete: "cascade" }),
  invoiceNumber: text("invoice_number").notNull(),
  issuedAt: ts("issued_at").notNull(),
  dueAt: ts("due_at").notNull(),
  totalGross: doublePrecision("total_gross").notNull(),
  paidAt: ts("paid_at"),
});

export const commissionRules = pgTable("commission_rules", {
  id: pk(),
  salespersonId: text("salesperson_id").references(() => users.id),
  percentOfMargin: doublePrecision("percent_of_margin").notNull(),
  minMarginPct: doublePrecision("min_margin_pct"),
  activeFrom: ts("active_from").notNull(),
  activeTo: ts("active_to"),
});

export const commissions = pgTable("commissions", {
  id: pk(),
  loadId: text("load_id")
    .notNull()
    .references(() => freightLoads.id),
  salespersonId: text("salesperson_id")
    .notNull()
    .references(() => users.id),
  period: text("period").notNull(),
  amountEur: doublePrecision("amount_eur").notNull(),
  ruleId: text("rule_id").references(() => commissionRules.id),
  state: text("state").notNull().default("accrued"),
  paidAt: ts("paid_at"),
});

// ────────────────────────────────────────────────────────────────────────────
// MVP F — Workshop (Folha de Obra)
// ────────────────────────────────────────────────────────────────────────────

export const workOrders = pgTable(
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
    activeMinutes: integer("active_minutes").default(0).notNull(),
    pausedMinutes: integer("paused_minutes").default(0).notNull(),
    lastPausedAt: ts("last_paused_at"),
    pauseReason: text("pause_reason"),
    summary: text("summary"),
    state: text("state").notNull().default("draft"),
    approvedBy: text("approved_by").references(() => users.id),
    approvedAt: ts("approved_at"),
    exportedAt: ts("exported_at"),
    syncVersion: integer("sync_version").default(0).notNull(),
    createdAt: ts("created_at").defaultNow().notNull(),
    updatedAt: ts("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    vehicleIdx: index("wo_vehicle_idx").on(t.vehicleId),
    stateIdx: index("wo_state_idx").on(t.state),
  }),
);

export const workOrderItems = pgTable("work_order_items", {
  id: pk(),
  workOrderId: text("work_order_id")
    .notNull()
    .references(() => workOrders.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  description: text("description").notNull(),
  partCode: text("part_code"),
  quantity: doublePrecision("quantity").default(1).notNull(),
  unitPrice: doublePrecision("unit_price"),
  total: doublePrecision("total"),
  sourceInvoiceId: text("source_invoice_id").references(() => invoices.id),
});

export const workOrderPhotos = pgTable("work_order_photos", {
  id: pk(),
  workOrderId: text("work_order_id")
    .notNull()
    .references(() => workOrders.id, { onDelete: "cascade" }),
  stage: text("stage").notNull(),
  path: text("path").notNull(),
  capturedAt: ts("captured_at").defaultNow().notNull(),
});

export const workOrderSignatures = pgTable("work_order_signatures", {
  id: pk(),
  workOrderId: text("work_order_id")
    .notNull()
    .references(() => workOrders.id, { onDelete: "cascade" }),
  signerRole: text("signer_role").notNull(),
  signerName: text("signer_name").notNull(),
  svgPath: text("svg_path").notNull(),
  signedAt: ts("signed_at").defaultNow().notNull(),
});
