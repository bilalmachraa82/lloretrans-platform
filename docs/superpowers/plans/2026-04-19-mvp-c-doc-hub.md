# Plano — MVP C · Digitalização Central de Documentos

**Versão:** 1.0 · 2026-04-19
**Spec:** `docs/superpowers/specs/2026-04-19-mvp-c-doc-hub.md`
**Âmbito de ficheiros:** `app/(platform)/docs/**` + smoke test

## Fases

### Fase 1 — Helpers de acesso (dentro de `actions.ts` / `page.tsx`)

- Utilitário `isPermissionScoped(session)` — retorna `true` apenas para `role=frutas`.
- Quando scoped, todas as queries do hub fazem `innerJoin(documentPermissions)` filtrado por `companyId = session.companyId`.
- Lista de roles autorizados: `["admin", "clarice", "admin_faturacao", "digitalizacao", "frutas"]`.

### Fase 2 — `/docs` (lista + filtros + KPIs)

- Server Component com `searchParams` para: `q` (texto único), `kind`, `tab` (todos|associados|orfaos), `from`, `to`.
- Barra de pesquisa única — se `q` tiver formato matrícula (AA-00-00 ou com letras) procura `plate`; caso contrário tenta `cmrNumber LIKE`.
- KPIs: total, % associados, órfãos, últimas 24h.
- Tabela limite 200 linhas, ordenada por `createdAt desc`.
- Tabs navegam via `?tab=`.

### Fase 3 — `/docs/[id]` (detalhe + associar/desassociar)

- Leitura do documento + associação actual + permissions.
- Se estado `orphan` ou `pending_association`: procura `trips` com `plate = doc.plate` e `startedAt` entre `loadedAt ±24h` — mostra até 5 candidatos com botão `Associar`.
- Se `associated`: mostra viagem + botão `Desassociar`.
- Histórico audit via `entityType='document', entityId=docId`.
- `frutas` não pode associar/desassociar (apenas vê).

### Fase 4 — `/docs/upload` (ingest mock)

- Client-side form `<input multiple>`. Server action `bulkIngest(files: File[])` cria rows mock.
- Gera `kind` heurístico pelo filename (`cmr`, `guia`, `frio`, `tara`); default `cmr`.
- Para simular auto-associação, escolhe viagem aleatória recente com probabilidade 0.7.

### Fase 5 — Server actions (`actions.ts`)

- `associateDocument(docId, tripId, method='manual')` — verifica role em `["admin","digitalizacao","clarice","admin_faturacao"]`, cria row, muda `state='associated'`, audit.
- `dissociateDocument(docId)` — mesmo grupo de roles; apaga row, marca `orphan`, audit.
- `bulkIngest(formData)` — cria N docs `pending_association`, tenta `cmrNumber` match em trips existentes (mock), audit agregado.
- `exportZip(formData)` — role autorizado; devolve `Response` com `application/zip` + filename dinâmico. Body placeholder "placeholder-zip-body" por agora.

### Fase 6 — Smoke tests (`tests/mvp-c-docs.test.ts`)

- Sanidade do schema (tabelas existem com colunas esperadas).
- Helper `resolvePermissionScope` retorna null para admin e `co_fdo` para frutas.
- Heurística de detecção de kind a partir de filename.

## Riscos & mitigações

- **Performance** em 1210 docs: índices `docs_cmr_idx` e `docs_plate_date_idx` já existem; LIKE em `cmrNumber` suportado.
- **Leaks cross-company**: testa-se que `frutas` + `co_fdo` vê só os docs com `document_permissions.companyId='co_fdo'`.
- **Export zip real**: adiado para v2 — por agora devolver placeholder identificável; audit regista o filtro usado.

## Validação final

```bash
npx tsc --noEmit 2>&1 | grep "docs/" | head -30
npm test -- mvp-c-docs
```
