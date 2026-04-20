# Plano — MVP A · Validação de Quilómetros

**Spec:** [`../specs/2026-04-19-mvp-a-km-validation.md`](../specs/2026-04-19-mvp-a-km-validation.md)
**Estimativa:** 1 sessão (infra pronta, schema pronto, seed pronto).

## Fase 1 — Leitura e queries

- [ ] Dashboard `app/(platform)/km/page.tsx` carrega em paralelo:
  - Contagens agrupadas por `km_reconciliations.state` no intervalo do dia filtrado.
  - Rows da tabela joinadas com `trips`, `vehicles`, `drivers` (nome + matrícula + motorista).
  - Lista de matrículas únicas + motoristas para os filtros.
- [ ] Params via `searchParams` (URL como estado): `date=YYYY-MM-DD`, `state=green|yellow|red`, `plate=`, `driverId=`.
- [ ] Default `date` = ontem (dia anterior à data actual em TZ Europe/Lisbon).

## Fase 2 — Detalhe

- [ ] `app/(platform)/km/[id]/page.tsx` lê reconciliation + trip + vehicle + driver + client.
- [ ] Chama stubs `createLogueTransClient().getTripById(externalId)` e `createFrotcomClient().getGpsForTrip(externalId)`; mostra side-by-side.
- [ ] Audit trail: últimas 20 entradas `audit_log` onde `entityType = 'km_reconciliation'` e `entityId = id`.

## Fase 3 — Server Actions

Ficheiro `app/(platform)/km/actions.ts`, todas com `"use server"`, `requireRole(['admin','clarice','admin_faturacao'])` e `audit(...)` com `before/after`.

- [ ] `approveReconciliation(formData)` — finalKm (opcional, default kmGps ou kmDeclared), reason opcional; valida + update + audit (`km.approve` ou `km.manual_override`).
- [ ] `bulkApproveGreen(formData)` — recebe `ids[]` (JSON string num hidden field), filtra apenas `state='green'` e `decidedBy IS NULL`, aprova todas com `finalKm = kmDeclared`, 1 audit row por reconciliação + 1 agregado `km.bulk_approve`.
- [ ] `useGpsValue(formData)` — só faz sentido em `state='yellow'`; grava `finalKm = kmGps`, audit `km.use_gps`.
- [ ] `rejectReconciliation(formData)` — marca `decidedBy` + `decisionReason`, `finalKm` nulo; audit `km.reject`.
- [ ] `exportCsv(formData)` — recebe `dateFrom`, `dateTo`; devolve CSV via response. Como server action do Next 15 não devolve Response directa, usar rota GET em `/api/km/export` (fora de scope aqui) **ou** gerar CSV e retornar string via `redirect` para data URL. **Decisão:** server action faz `redirect(' data:text/csv;...')` com BOM UTF-8.

## Fase 4 — UI (Server Components + forms)

- [ ] PageHeader com date picker (`<input type="date">` dentro de um `<form action="/km" method="GET">`).
- [ ] 3 `Card` clicáveis (Link com `?state=green` etc.) — StatusPill + contagem.
- [ ] Filtros: `<select>` de matrícula + motorista no mesmo form.
- [ ] Tabela densa estilo MVP B (`className="data-table"`). Colunas com `font-mono` para números.
- [ ] Selecção multi-linha: inputs checkbox com `name="ids"` dentro de um form bulk.
- [ ] Linhas com `decidedBy != null` visualmente mais esbatidas + pill "fechada".
- [ ] Botão export num form com `dateFrom`/`dateTo` hidden.

## Fase 5 — Testes

- [ ] `tests/mvp-a-km.test.ts` — Vitest, usa `db` real com seed existente (`lloretrans.db`):
  - Pega uma reconciliação `green` sem `decidedBy`, chama `approveReconciliation`, afirma `decidedBy`/`finalKm`/`decidedAt` gravados + `audit_log` row nova com `action='km.approve'`.
  - Pega uma `yellow`, chama `useGpsValue`, afirma `finalKm === kmGps` + audit.
  - Conta entries audit antes/depois para garantir diff correcto.
- [ ] Setup: criar um user `u_test_km` com role `admin` se não existir e mockar `requireRole` via mock pontual **ou** inserir cookie de sessão. **Decisão:** extrair a lógica interna em helpers testáveis (ex.: `applyApproval`) e testar apenas a lógica, não o wrapper de autenticação — segue padrão mais simples e evita dependência `next/headers` em Vitest.

## Fase 6 — Verificação

- [ ] `npx tsc --noEmit` apenas nos ficheiros criados.
- [ ] Correr a página mentalmente com os dados do seed — ontem deve ter ~70 verdes, ~20 amarelas, ~10 vermelhas (proporções do seed).
- [ ] Confirmar que todos os botões de mutação chamam `audit`.
