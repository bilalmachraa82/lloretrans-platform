# Spec — MVP C · Digitalização Central de Documentos

**Versão:** 1.0 · 2026-04-19
**Dependências de infra:** spec mestre `2026-04-19-platform-architecture.md`
**Dados seed:** 1210 documentos (~73 órfãos), 400 viagens associadas a 2–4 docs cada.

## Dor

CMR, guia de remessa, guia de recepção, ticket de frio e controlo tara chegam em papel com o motorista ao terminal. Várias empresas do grupo (Lloretrans, Frutas do Oeste, Tomate do Oeste, Cerejas do Norte) precisam de aceder aos mesmos documentos para conciliação e auditoria — hoje são fotocopiados, digitalizados ao calhar, ou simplesmente perdidos. Risco operacional + risco RGPD.

## Solução (v1)

Digitalização **centralizada à entrada**:

1. Operador/a (`role=digitalizacao`) scan em lote múltiplos PDFs no hub.
2. Sistema cria `documents` em estado `pending_association`, tenta auto-associar à viagem:
   - Se `kind=cmr` e `cmrNumber` match exacto → `associated` confiança 0.99 (`method=cmr_exact`).
   - Senão, tenta `plate + loadedAt ±24h` contra `trips` → `associated` confiança ~0.9 (`method=plate_date_match`).
   - Sem match → `orphan`, entra na fila de tratamento humano.
3. Hub lista documentos filtráveis por CMR, matrícula, intervalo de datas, tipo.
4. Permissões por empresa via `document_permissions`: Lloretrans vê tudo, Frutas só vê docs com permissão explícita.
5. Exportação zip por filtro para partilha com empresas do grupo.

## Entidades

- `documents(kind, cmrNumber?, plate?, loadedAt?, deliveredAt?, sourcePath, state)`
- `document_associations(documentId, tripId, confidence, method, confirmedBy?, confirmedAt?)`
- `document_permissions(documentId, companyId, canRead, canDownload)`

## Fluxo de estados

`pending_association` → `associated` | `orphan`
Reversíveis: `associated` ↔ `orphan` via desassociar/associar manual.

## Permissões cross-empresa (CRÍTICO)

- `admin`, `clarice`, `admin_faturacao`, `digitalizacao` → vêem todos os documentos.
- `frutas` → query tem de filtrar por `document_permissions.companyId = session.companyId` (tipicamente `co_fdo`).
- Download respeita `canDownload` (por agora sempre true quando `canRead=true`).

## UX

- **Hub** (`/docs`) com pesquisa única que atravessa CMR, matrícula e datas; tabs Todos · Associados · Órfãos; KPIs total/associados/órfãos/últimas 24h.
- **Detalhe** (`/docs/[id]`) com preview placeholder + campos extraídos + sugestões de viagens candidatas (se órfão) ou viagem associada (se associado) + histórico audit.
- **Upload** (`/docs/upload`) drag-drop múltiplo; apenas mock — cria rows `pending_association` e dispara auto-associação.

## Audit

Todas as mutações passam por `audit()`: `document.associate`, `document.dissociate`, `document.ingest`, `document.export_zip`.

## Out of scope

- OCR real do scan (mock text determinista baseado no tipo + viagem).
- Workflow de digitalização móvel (v2).
- Reconhecimento automático do tipo pelo conteúdo do PDF (v2 — assumimos o operador classifica).
- Retenção configurável por kind (v2 — fixa 5 anos).

## Critérios de aceitação (demo)

- [ ] `/docs` mostra ~1210 documentos com KPIs corretos.
- [ ] Filtro por CMR, matrícula e datas funciona.
- [ ] Tab Órfãos mostra ~73 registos.
- [ ] Detalhe de órfão mostra candidatos + botão Associar.
- [ ] Associar cria `document_associations`, muda estado, audit.
- [ ] Upload de lote simulado cria N documentos + tenta auto-associar.
- [ ] Role `frutas` vê apenas docs com permissão para `co_fdo`.
- [ ] Export zip gera placeholder com filename correcto.
