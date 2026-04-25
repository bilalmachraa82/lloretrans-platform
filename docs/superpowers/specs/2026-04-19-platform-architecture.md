# Spec — Plataforma Lloretrans × AiTiPro (arquitectura partilhada)

**Versão:** 1.0 · 2026-04-19
**Âmbito:** infraestrutura partilhada pelos 6 MVPs (A, B, C, D, E, F)
**Estado:** aprovado — implementação em curso

---

## 1. Objectivo

Entregar os 6 MVPs do PRD 2026-04-19 numa **única aplicação Next.js**, partilhando infraestrutura (DB, auth, masters, audit log, export PHC), mas com módulos isolados por MVP para venda independente. A aplicação deve correr **offline localmente** (sem APIs externas) via stubs realistas, e promover-se para produção trocando adaptadores de integração.

## 2. Princípios não-negociáveis

1. **Realidade alinhada.** Dados sintéticos espelham volumes e padrões reais extraídos do PRD (30-100 motoristas, ~180 facturas/mês, ~450 viagens/mês, ~80 cargas bolsa/mês). Stubs têm jitter, erros, e estados ambíguos — não é happy-path.
2. **Humano no loop.** IA nunca decide sozinha. Cada MVP tem um gate de validação humana antes de acção irreversível (facturar, aprovar, lançar em PHC).
3. **Auditabilidade total.** Cada mutação passa por `audit_log`. Tabela append-only. `who/what/before/after/reason/timestamp` para todas as transições de estado.
4. **RGPD by default.** Zero analytics terceiros, zero tracking cookies, credenciais só em env, retenção configurável por tipo.
5. **Reversibilidade.** Qualquer módulo pode ser desligado por feature flag sem partir os outros.

## 3. Arquitectura

### 3.1 Stack

- **Next.js 15** (App Router, Server Components, Server Actions).
- **TypeScript strict**, zero `any` em código aplicacional.
- **Drizzle ORM** com **better-sqlite3** local, schema equivalente para **Postgres (Neon)** em produção.
- **Tailwind CSS** + primitives Radix + shadcn-style tokens. PT-PT, sem frufru.
- **Zod** em todas as fronteiras (API, Server Actions, upload).
- **Zustand** para estado local cliente quando preciso. SSR sempre que possível.
- **Vitest** para unit + integration. Smoke tests por MVP.

### 3.2 Estrutura de pastas

```
lloretrans-platform/
├── app/
│   ├── (auth)/login/                  # login stub + role switcher para demo
│   ├── (platform)/                    # layout autenticado com sidebar
│   │   ├── page.tsx                   # dashboard geral (6 MVPs)
│   │   ├── km/                        # MVP A
│   │   ├── ocr/                       # MVP B
│   │   ├── docs/                      # MVP C
│   │   ├── fuel/                      # MVP D
│   │   ├── bolsa/                     # MVP E
│   │   ├── oficina/                   # MVP F (PWA)
│   │   └── admin/                     # masters, users, rules, audit
│   ├── api/
│   │   ├── integrations/              # webhooks + stub endpoints
│   │   └── health/route.ts
│   └── layout.tsx
├── components/
│   ├── ui/                            # shadcn-style primitives
│   └── platform/                      # sidebar, header, status badge
├── lib/
│   ├── auth/                          # session, roles, guards
│   ├── audit/                         # audit log helpers
│   ├── integrations/                  # adapters (stub + live)
│   │   ├── logue-trans/
│   │   ├── frotcom/
│   │   ├── phc/
│   │   └── fuel-cards/
│   ├── money.ts                       # formatação EUR + cálculos
│   └── tokens.ts                      # design tokens
├── db/
│   ├── schema.ts                      # Drizzle schema (1 arquivo, temas por secção)
│   ├── client.ts
│   └── queries/                       # queries por MVP
├── drizzle/                           # migrations geradas
├── fixtures/
│   ├── real-invoices/                 # 9 PDFs reais Lloretrans
│   └── extracted/                     # JSON extraído
├── scripts/
│   ├── migrate.ts
│   ├── seed.ts                        # seed completo para demo
│   └── extract-pdfs.ts
├── tests/
└── docs/superpowers/
    ├── specs/                         # 1 por MVP + este
    └── plans/                         # 1 por MVP
```

### 3.3 Base de dados — decomposição

Schema único `db/schema.ts` mas organizado por secções lógicas:

- **Core:** `users`, `roles`, `companies` (Lloretrans + empresas do grupo), `audit_log`, `feature_flags`.
- **Masters:** `vehicles` (matrícula, tipologia, empresa proprietária), `service_codes` (S1-S9 externos, L1-L8 internos, I0-I9 operações internas + descrições), `work_codes` (interno/externo), `suppliers` (NIF + regras OCR), `clients` (master PHC).
- **MVP A:** `trips`, `km_reconciliations`, `km_approvals`.
- **MVP B:** `invoices`, `invoice_lines`, `supplier_rules`, `ocr_extractions`.
- **MVP C:** `documents`, `document_associations`, `document_permissions`.
- **MVP D:** `fuel_readings_canbus`, `fuel_fills`, `fuel_anomalies`.
- **MVP E:** `freight_loads`, `freight_states`, `supplier_invoices_freight`, `client_invoices_freight`, `commissions`, `commission_rules`.
- **MVP F:** `work_orders`, `work_order_items`, `work_order_photos`, `work_order_signatures`.

### 3.4 Integrações — adaptador abstracto

Cada integração externa tem interface única + 2 implementações (stub + live). Flag `USE_LIVE_APIS` no env decide.

```typescript
// lib/integrations/logue-trans/index.ts
export interface LogueTransClient {
  getTripsByVehicle(plate: string, from: Date, to: Date): Promise<Trip[]>;
  getTripById(id: string): Promise<Trip | null>;
}

// lib/integrations/logue-trans/stub.ts — lê de seed
// lib/integrations/logue-trans/live.ts — chamada HTTP real

export function createLogueTransClient(): LogueTransClient {
  return process.env.USE_LIVE_APIS === "true"
    ? new LogueTransLive()
    : new LogueTransStub();
}
```

Mesma pattern para Frotcom, PHC, Cepsa, Repsol, Radius Velocity e bomba interna.

### 3.5 Auth — estratégia

Para demo + dev usamos **auth stub** com selector de role no login. Em prod, NextAuth com provider a decidir (Microsoft 365? Google? email magic link?). Roles:

- `admin` — Bilal + Éder
- `clarice` — direcção Lloretrans
- `admin_oficina` — administrativa da oficina
- `admin_faturacao` — administrativa faturação Lloretrans
- `admin_contas` — administrativa contas grupo
- `comercial` — Éder + Miguel
- `mecanico` — mecânicos (MVP F)
- `digitalizacao` — operador/a doc hub (MVP C)
- `frutas` — colegas empresas grupo (consumo MVP C)

RBAC via middleware + `lib/auth/guards.ts` helpers.

### 3.6 Audit log

Tabela `audit_log` append-only:

```typescript
{
  id: string,
  userId: string,
  action: string,            // ex: "km.approve", "invoice.classify", "load.state_change"
  entityType: string,        // ex: "km_reconciliation"
  entityId: string,
  before: string | null,     // JSON snapshot
  after: string | null,
  reason: string | null,
  ipAddress: string | null,
  userAgent: string | null,
  createdAt: timestamp,
}
```

Helper `audit(user, action, entity, before, after, reason)` chamado em toda mutação.

### 3.7 Export PHC standardizado

Formato neutro (JSON intermediário) + serializador XML PHC. MVPs B, E, F produzem JSON; serializador converte no fim. Quando integrador PHC ficar disponível, troca-se serializador por cliente HTTP sem refactor de upstream.

## 4. Feature flags

Tabela `feature_flags` + helper `isEnabled(flag, user)`. Flags:

- `mvp.a`, `mvp.b`, `mvp.c`, `mvp.d`, `mvp.e`, `mvp.f` — desligam MVP inteiro.
- `integration.logue_trans_live`, `integration.frotcom_live`, etc. — forçam stub mesmo com env live.
- `demo.seed_button` — expõe botão "resetar demo" na UI (only se role=admin).

## 5. Estratégia de dados sintéticos

- **1 projecto:** Lloretrans (empresa principal) + Frutas do Oeste + Tomate do Oeste + Cerejas do Norte (grupo).
- **~60 viaturas** (matrículas portuguesas válidas, mix ligeiro/pesado).
- **~50 motoristas** com nomes portugueses realistas.
- **30 dias de viagens** (~13.500 viagens no período).
- **9 facturas fornecedor reais** (dos PDFs) + 180 sintéticas/mês por 3 meses.
- **~80 cargas aluguer/mês** por 3 meses para MVP E.
- **~120 folhas oficina/mês** por 3 meses para MVP F.
- **Abastecimentos diários** viatura a viatura para MVP D.

Seed determinista via seed numérico — `npm run db:reset` dá sempre o mesmo dataset.

## 6. Design system

- **Tipografia:** Inter (sans) + JetBrains Mono (dados tabulares).
- **Paleta:** neutros + primary blue (oficina) + semânticas (success/warning/destructive).
- **Componentes:** Button, Card, Table, Dialog, Tabs, Select, Badge, StatusPill (verde/amarelo/vermelho), DataTable com filtros, EmptyState, PageHeader.
- **Layout:** sidebar esquerda com lista de MVPs (badges de estado), header com role switcher + audit badge.

## 7. RGPD & segurança

- Dados em repouso: SQLite local (dev) ou Neon EU + Azure Blob EU (prod). **Não** usar Vercel Blob (sem garantia de região UE).
- Dados em trânsito: TLS obrigatório.
- Retenção configurável por tipo — defaults: facturas 10 anos (obrigação fiscal PT), CMR 5 anos, audit_log 7 anos, uploads oficina 5 anos.
- Direito ao esquecimento: anonimização (preserva auditoria), não apagamento.
- Credenciais: `.env` fora do git, rotação trimestral documentada.

## 8. Critérios de "pronto"

Para cada MVP:

- [ ] Spec próprio em `docs/superpowers/specs/`.
- [ ] Plano próprio em `docs/superpowers/plans/`.
- [ ] Código funcional com seed correr end-to-end.
- [ ] Mínimo 1 smoke test.
- [ ] Entrada no dashboard principal com métricas em tempo real.
- [ ] README do MVP com "como demonstrar" para reunião Clarice.

## 9. Out of scope desta plataforma (para evitar scope creep)

- Multi-tenant real (cada cliente é instância separada).
- Billing/facturação de licenças AiTiPro.
- CRM/marketing (coberto por outro produto AiTiPro).
- Internacionalização (só PT-PT).
- Accessibility além de contraste + navegação por teclado básica (WCAG AA é v2).

## 10. Decisões deliberadamente adiadas

| Decisão | Adiada até | Porquê |
|---------|-----------|--------|
| Provider auth prod | reunião Hélio | Depende do ecossistema do grupo |
| Neon projecto dedicado ou partilhado com diagnóstico | deploy | Custo vs isolamento |
| Região Azure Blob UE | NDA final | Processamento dados sensíveis requer NDA fechado |
| App mobile nativa MVP F | pós-piloto | Avaliar se PWA chega |
| Integração bolsas externas (Timocom etc.) MVP E | v2 | Não pedido |

---

**Próximo:** implementação da infra partilhada + MVPs B→A→C→D→E→F conforme plano master.
