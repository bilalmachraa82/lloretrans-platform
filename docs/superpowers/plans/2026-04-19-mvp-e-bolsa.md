# Plan — MVP E · Bolsa de Carga

**Spec:** 2026-04-19-mvp-e-bolsa.md
**Esforço estimado:** 6-10 semanas em prod · ~4h de código no demo

## Fases

### 1. State machine engine (0.5h)
- Ficheiro `lib/freight-state.ts` com `validTransitions` + `canTransition(from, to)`.
- Testes unitários curtos.

### 2. Actions (1h)
- `createLoad` — cria load + transition inicial
- `transitionState(loadId, toState, reason)` — valida
- `registerSupplierInvoice` — cria row, calcula deviation
- `registerClientInvoice` — cria row
- `markPaid` — muda estado
- `computeCommissions(period)` — agrega
- `markCommissionsPaid(period, salespersonId)` — audit
- Todas com `audit()`

### 3. List page `/bolsa` (1h)
- Toggle view + tabs (kanban/tabela)
- KPIs: cargas, P&L, comissões
- Filtro por comercial (role-based)
- Query considera permissões (comercial só vê suas)

### 4. New page `/bolsa/new` (0.5h)
- Form + auto-calc margin%
- Select clients + suppliers do seed

### 5. Detail page `/bolsa/[id]` (1h)
- Timeline de transitions
- Alertas (deviation, atraso pagamento)
- Acções contextuais por estado
- Forms embutidas para registar facturas

### 6. Commissions page `/bolsa/commissions` (0.5h)
- Filtro por período
- Tabela agrupada por comercial
- Botão "Marcar período pago"

### 7. Teste (0.5h)
- Smoke tests: criar carga, transicionar estados, calcular comissão

## Checklist de conformidade

- [ ] PT-PT UI
- [ ] TS strict, zero any
- [ ] Audit em todas as mutações
- [ ] Permissões comercial/admin
- [ ] State machine valida transições (não permite saltos)
- [ ] Zero sugestão de preços pela IA
