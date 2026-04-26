# Spec — MVP B · OCR Facturas de Fornecedor

**Versão:** 1.0 · 2026-04-19
**Dependências de infra:** spec mestre 2026-04-19-platform-architecture.md
**Dados reais disponíveis:** 9 PDFs de facturas reais (fixtures/real-invoices/)

## Dor

Facturas de fornecedor (9 reais amostra: Würth, Policalço, Selcar, Popapneus, Prevrod, Vesauto/Carby, Flexbor, SGP-Global Parts, Blinker) chegam em PDF/papel, lançamento manual em PHC com classificação (S1-S9 externos, L1-L8 internos, I0-I9 operações internas + obra interno/externo) por conhecimento tácito. Risco: pessoa que sabe sair = perda.

## Solução (v1)

Pipeline:
1. Admin da oficina faz upload PDF.
2. Extracção de texto com `pdf-parse` + classificação opcional por Claude API quando activa; cache local em dev/demo produz JSON estruturado + confiança por campo.
3. Classificação automática via **regra do fornecedor aprendida** (tabela `supplier_rules` indexada por `taxId`). Se inexistente, modelo default pede humano.
4. UI side-by-side: PDF à esquerda · campos editáveis à direita + sugestão + confiança.
5. Admin corrige → sistema aprende (`supplier_rules` cresce).
6. Admin aprova → export XML PHC (ou JSON se integrador activo).

## Fluxo de estados

`pending_ocr` → `pending_review` → `approved` → `exported`
Reversíveis: `approved` → `pending_review` (reabrir); `exported` → `approved` (cancelar export).

## Aprendizagem por fornecedor

Tabela `supplier_rules(supplier_id, field, value, match_pattern, hit_count)`. Quando admin corrige `service_code` numa factura:
1. Incrementa `hit_count` da regra existente se matching, ou cria nova.
2. Regra com `hit_count > 3` aplica-se automaticamente a novas facturas desse fornecedor com confiança 0.95.

## Audit

Cada correcção humana escrita em `audit_log` com `before/after` + factura associada.

## UX específica

- Upload drag-drop ou pasta monitorizada (v1 só upload).
- Lista principal com filtros: estado, fornecedor, período, confiança baixa.
- Página detalhe com PDF embed + formulário editável + decisões do sistema + histórico de correcções.
- Botão "Aprovar e exportar" gera XML e marca estado.

## Out of scope

- Email ingestion (v2).
- Reconciliação com ordem de compra (não existe no cliente).
- Lançamento automático no PHC sem validação humana (proibido por regra da Clarice).
- Facturas não-oficina (água, luz, etc.).

## Critérios de aceitação (demo)

- [ ] Lista de facturas mostra as 9 facturas reais carregadas nas fixtures, sem lote sintético.
- [ ] 9 facturas reais aparecem em `pending_review` com classificação proposta.
- [ ] Detalhe de factura permite editar campos.
- [ ] Aprovar cria `audit_log`.
- [ ] Export gera XML válido para a factura.
- [ ] Aprender regra: alterar código de serviço e ver novo rule criado.
