# Spec — MVP E · Bolsa de Carga + Comissões

**Versão:** 1.0 · 2026-04-19
**Dependências de infra:** spec mestre 2026-04-19-platform-architecture.md
**Dados seed:** 240 cargas em 3 meses · 2 comerciais (Éder 18%, Miguel 15%) · 160 comissões

## Dor

Excel com 1000+ linhas/ano, sem versionamento, sem fluxo de estados. Factura cliente polaco chega 1 mês depois — comercial já não lembra. Valor facturado pelo fornecedor diverge do acordado e ninguém cruza. Comissão mensal calculada manual. Citação Clarice: *"IA regista, humano negoceia"* — proíbe IA a sugerir preços.

## Solução

Aplicação que substitui o Excel. Ciclo de vida **state-machine auditada**:

```
scheduled → delivered → supplier_invoiced → client_invoiced → paid
```

Transições só via acção humana. Cada transição escreve `freight_state_transitions` + `audit_log`.

### Alertas automáticos (read-only — ninguém é penalizado)

- Factura fornecedor com `|deviation| > 5%` vs valor acordado → destaque vermelho.
- Factura cliente com `due_at < hoje` sem `paid_at` → destaque amarelo.
- Carga em `scheduled` há > 7 dias sem `delivered` → destaque neutro.

### Comissões

- Regra padrão: **15% da margem** (`priceSell - priceBuy`).
- Regra override por comercial (Éder = 18%).
- `minMarginPct` opcional (filtra cargas com margem mínima).
- `computeCommissions(period)` agrega cargas `paid` do mês e gera rows em `commissions`.
- `markCommissionsPaid(period, salesperson)` marca pago + audit.

## UX

- **Vista principal `/bolsa`:** toggle "minhas cargas" (comercial) vs "todas" (admin). Kanban 5 colunas ou tabela. KPIs topo (cargas mês, P&L, comissões).
- **`/bolsa/new`:** formulário criar carga (ref auto, cliente, fornecedor, rota, preços).
- **`/bolsa/[id]`:** detalhe com timeline, alertas, factura fornecedor + cliente, comissão preview.
- **`/bolsa/commissions`:** relatório por período, por comercial.

## Regras de transição

- `scheduled` → `delivered` (manual, motorista entregou)
- `delivered` → `supplier_invoiced` (registas factura fornecedor)
- `supplier_invoiced` → `client_invoiced` (emites factura cliente)
- `client_invoiced` → `paid` (cliente pagou)
- Reversíveis via action `rollback` com motivo.

## Permissões

- `comercial` (Éder, Miguel) vê e modifica só as suas cargas.
- `admin_faturacao` emite factura cliente, marca paid.
- `admin`, `clarice` vêem tudo.

## Out of scope

- IA sugerindo preços (proibido).
- Integração Timocom/Teleroute (v2).
- App mobile comerciais (v2).
- Multi-currency conversion (v1 assume EUR).

## Critérios de aceitação

- [ ] Kanban mostra 5 colunas com contagem por estado.
- [ ] Criar carga calcula margem automaticamente.
- [ ] Registar factura fornecedor com deviation > 5% destaca vermelho.
- [ ] Transições bloqueadas (ex: scheduled→paid directo) dão erro claro.
- [ ] Relatório comissões mostra accrued + paid por período.
- [ ] Todas as mutações em `audit_log`.
