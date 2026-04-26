# Fase 2.3 — Pricing recommendation final para PME portuguesa

Data de revisão: 26 Abril 2026  
Base: bottom-up + market research + CFO review (`audit/pricing/cfo-review.md`).

## Verificado

- `app/proposta/page.tsx` ainda mostra pricing antigo: Core EUR 8k-18k + EUR 450-900/mês; PRO EUR 28k-48k + EUR 1.400-2.800/mês; Enterprise EUR 52k-92k + EUR 2.800-4.600/mês.
- A análise enterprise anterior era tecnicamente defensável, mas comercialmente pesada para uma administração portuguesa com mentalidade PME/familiar.
- Anchors PME verificados em `market-research.md`: PHC GO, Moloni, Vendus, InvoiceXpress, EasyFleet, Tachogram, ManWinWin e serviços dev locais.
- `cfo-review.md` recomenda PRO faseado + Sprint 0 obrigatória, e não vender Enterprise como compromisso fechado nesta reunião.

## Assumido

- A reunião da Clarice com a administração acontece a 10 ou 13 Maio 2026.
- A administração entende melhor setup fee do que mensalidade elevada.
- A AiTiPro aceita margem inicial mais baixa para criar caso de referência, desde que o scope fique limitado.
- PHC Advanced escrito só entra depois de workshop técnico com o integrador PHC Advanced do grupo.
- Pricing não inclui IVA.

## Em Aberto

- Confirmação do integrador PHC Advanced.
- Acesso e limites reais da Frotcom/Logue Trans.
- Se “4 000 documentos/mês” são CMR/guias ou facturas-fornecedor.
- SLA pretendido: 99% business-hours vs 99.9%.
- Capacidade real AiTiPro para entregar PRO faseado em 3-4 meses.

## Decisão Final

Recomendação final: **Sprint 0 obrigatória + PRO faseado**.

Não recomendo vender Enterprise fechado nesta reunião. Enterprise deve aparecer apenas como roadmap condicionado.

## Pricing Final Para a Reunião

| Item | Setup | Recorrente | Scope | Posicionamento |
|---|---:|---:|---|---|
| **Sprint 0 — obrigatória** | **EUR 5k-7k** | — | 2 semanas. Workshop integrador PHC Advanced. Validação Frotcom + Logue Trans. Volume real. Plano fixo PRO. | Reduz risco do conselho. Descontável 50% se avançarem para PRO em 30 dias. |
| **Core — entrada** | EUR 14k-18k | EUR 600-900/mês | 1 MVP forte, tipicamente C ou A+B reduzido. Sem escrita directa PHC Advanced. SLA 99% horário útil. | Para começar pequeno. |
| **PRO faseado — recomendado** | **EUR 32k-45k** | **EUR 1.200-1.800/mês** | C + A + B + piloto F, faseado em 3-4 meses. XML PHC Advanced até integrador validar escrita. Suporte business-hours. | Recomendação principal. Quatro fluxos críticos, risco controlado. |
| **Enterprise faseado — roadmap** | EUR 58k-85k | EUR 2.200-3.500/mês | 6 fluxos no roadmap; D e E condicionados a Frotcom API + integrador PHC Advanced + saneamento de dados. Multi-empresa. | Não é compromisso desta reunião. |

## Porquê Esta Versão

- Baixa a fricção da mensalidade PRO: EUR 2.200/mês era psicologicamente alto; EUR 1.500/mês é ponto de venda mais simples.
- Mantém PRO dentro de um setup sério, mas sem rebentar a sala: EUR 32k-45k.
- Obriga Sprint 0 para não prometer PHC Advanced escrito, Frotcom live ou volumes documentais sem prova.
- Deixa Core como opção de entrada, mas evita vender Core como se resolvesse o caso completo.
- Mantém Enterprise no radar, mas sem criar compromisso impossível em D e E.

## Ordem Recomendada Dos MVPs

1. **C · Documentos / CMR / guias** — maior volume e dor transversal; cria base documental.
2. **A · Validação de quilómetros** — quick win e controlo diário.
3. **B · OCR facturas fornecedor** — começar pelos fornecedores principais, com validação humana.
4. **F · Oficina piloto** — só piloto com 1 mecânico antes de rollout.

Ficam fora do contrato inicial:

- **D · Combustível** — depende de Frotcom/API e tolerâncias confirmadas.
- **E · Bolsa/comissões** — depende de PHC Advanced e saneamento de dados; Excel actual mostra margem negativa/estranha, logo vender isto agora é arriscado.

## Como Justificar a Mensalidade

A mensalidade não deve ser vendida como “subscrição para usar software”. Deve ser vendida como operação contínua.

Inclui:

- alojamento e base de dados;
- backups e recuperação;
- segurança e actualizações;
- monitorização;
- suporte business-hours;
- pequenas correcções;
- manutenção de integrações;
- acompanhamento mensal;
- ajustes quando mudam ficheiros, fornecedores ou regras internas.

Frase simples:

> A mensalidade garante que a plataforma não fica abandonada depois do setup. Cobre operação, suporte, segurança, integrações e pequenas correcções mensais.

## Sensibilidades

### Se “4 000 documentos/mês” forem facturas-fornecedor

- PRO sobe +EUR 5k-10k setup.
- Mensalidade PRO sobe +EUR 300-800/mês.
- Alternativa: limitar volume incluído e cobrar overage por lote documental.

### Se SLA subir para 99.9%

- Não oferecer em Core.
- PRO 99.9% só como add-on: +EUR 700-1.200/mês.
- Enterprise 99.9%: +EUR 1.200-2.500/mês + setup técnico EUR 6k-15k.

### Se o integrador PHC Advanced não colaborar

- Retirar escrita PHC Advanced do scope.
- Manter XML/registo intermédio.
- Change request obrigatório para escrita directa futura.
- Não usar “integração PHC Advanced” como promessa fechada; usar “preparado para integração PHC Advanced”.

## Frase Executiva Para a Clarice

> Para esta primeira fase, recomendamos avançar com PRO faseado: EUR 32k-45k de implementação e EUR 1.200-1.800/mês, antecedidos por um Sprint 0 obrigatório de duas semanas a EUR 5k-7k. O Sprint 0 confirma com o integrador PHC Advanced e com a Frotcom o que é viável antes de qualquer compromisso, e é descontável até metade se avançarmos com PRO em 30 dias. PRO entrega quatro fluxos críticos — documentos, quilómetros, OCR fornecedor e piloto de oficina — em três a quatro meses, com controlo operacional auditável. Combustível e bolsa de cargas ficam no roadmap, condicionados a integrações e dados validados.

## Caso de Não Fazer

- Se recusarem Sprint 0, não fechar PRO. O risco de re-scope é demasiado alto.
- Se exigirem Enterprise fechado já, recusar. D e E ainda não estão controlados.
- Se pedirem mensalidade muito abaixo de EUR 1.200/mês, reduzir scope e suporte, não absorver margem negativa.

## Nota Para a Proposta

Antes da reunião, `app/proposta/page.tsx` tem de ser actualizado para estes valores ou marcado como “pricing em revisão”. O ajuste de UI/proposta fica para a Fase 4, salvo decisão explícita do Bilal para antecipar.
