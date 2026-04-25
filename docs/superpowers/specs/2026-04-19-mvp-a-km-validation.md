# Spec — MVP A · Validação de Quilómetros

**Versão:** 1.0 · 2026-04-19
**Dependências de infra:** spec mestre 2026-04-19-platform-architecture.md
**Dados seed disponíveis:** ~2.243 reconciliações (30 dias · 60 viaturas) já populadas em `km_reconciliations`.

## Dor

Administrativas de faturação validam viagem-a-viagem comparando km declarados no **Logue Trans** (app motorista) com km reais do **Frotcom** (GPS). Hoje é feito em Excel a 2 mãos, demora uma manhã por dia, e não há rasto de quem mudou o quê. Citação Clarice (reunião 16/04/2026): *"não é só tempo, a nossa preocupação também que é o controle"*. Vender como **controlo** e auditoria, não como poupança.

## Solução (v1)

Dashboard que recebe reconciliações pré-calculadas pelo seed/pipeline e apresenta-as por dia. Regra:

- `|delta| <= threshold` (threshold confirmado 3 km) → **verde** → autoaprovação via botão bulk.
- `3 < |delta| <= 9` → **amarelo** → pré-preenche `proposedKm` com valor GPS; administrativa confirma ou sobrepõe.
- `|delta| > 30`, GPS sem sinal, ou motorista não lançou → **vermelho** → investigação humana obrigatória.

GPS é fonte de verdade — excepto em `red` por gap de sinal, onde administrativa lança valor manual com motivo.

## Estados

`state` ∈ { `green`, `yellow`, `red` } (calculado no seed/pipeline).
Decisão: quando `decidedBy` + `finalKm` preenchidos → linha considerada fechada. `state` mantém-se para estatística.

## UX específica

- Topo: 3 cards (verde/amarelo/vermelho) com contagens clicáveis como filtro; date picker default "ontem".
- Tabela densa: viagem · matrícula · motorista · origem → destino · km declarado · km GPS · Δ · estado · acção.
- Selecção multi-linha só para verdes → "Aprovar seleccionadas".
- Detalhe por linha: histórico Logue Trans + Frotcom lado-a-lado, audit trail.
- Export CSV com cabeçalho PT (para enviar à Clarice).

## Audit

Cada aprovação/correcção/rejeição escreve `audit_log` com `before/after` contendo `state`, `finalKm`, `decidedBy`, `decisionReason`. Acção: `km.approve`, `km.use_gps`, `km.manual_override`, `km.reject`, `km.bulk_approve`.

## Integrações

- `createLogueTransClient()` — stub lê da DB; `getTripById` para detalhe.
- `createFrotcomClient()` — stub gera `FrotcomGpsReading` a partir de `trips.kmGps`.
- Threshold lido de cada row (`km_reconciliations.thresholdKm`) para audit reprodutível.

## Out of scope

- Recalcular reconciliações em tempo real (feito pelo seed; pipeline live é v2).
- Importar viagens novas durante o dia (cron / webhook — v2).
- Alertas a motoristas (responsabilidade Logue Trans).

## Critérios de aceitação (demo)

- [ ] Dashboard mostra contagens correctas por estado num dia com viagens.
- [ ] Filtro por estado muda a tabela.
- [ ] "Aprovar seleccionadas" fecha várias verdes de uma vez e escreve audit.
- [ ] Em amarela, "Usar valor GPS" grava `finalKm = kmGps` + audit.
- [ ] Em vermelha, alteração manual obriga a motivo e grava audit.
- [ ] Export CSV abre em Excel com acentos correctos.
- [ ] `tests/mvp-a-km.test.ts` verde.
