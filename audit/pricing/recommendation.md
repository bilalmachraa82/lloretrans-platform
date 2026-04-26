# Fase 2.3 — Pricing recommendation revista para PME portuguesa

Data de revisão: 26 Abril 2026  
Base: bottom-up + mercado real + rebase para PME portuguesa.

## Verificado

- Os tiers actuais em `app/proposta/page.tsx` são:
  - Core: EUR 8k-18k setup + EUR 450-900/mês.
  - PRO: EUR 28k-48k setup + EUR 1.400-2.800/mês.
  - Enterprise: EUR 52k-92k setup + EUR 2.800-4.600/mês.
- A análise anterior era defensável para médio-grande/enterprise, mas agressiva para PME portuguesa.
- Mercado PME português tem anchors muito baixos:
  - PHC GO: EUR 38,36-180/mês em subscrição trienal.
  - Moloni/Vendus/InvoiceXpress: ~EUR 6-26/mês para facturação/POS.
  - EasyFleet: EUR 160/mês para small fleet 1-20 no plano Advanced.
  - ManWinWin: EUR 39-75/utilizador/mês + implementação EUR 1.890-3.590.
  - Programador em Zaask: EUR 10-45/hora.

## Assumido

- A venda tem de ser a PME/mid-market português, não a procurement enterprise internacional.
- A AiTiPro quer entrar com um caso de referência e aceita margem inicial 35-45% se o scope for estritamente controlado.
- O setup PME usa custo efectivo EUR 38/h porque parte da plataforma já existe e porque há productização/reutilização.
- O pricing não inclui IVA.
- PHC Advanced escrito fica sempre condicionado a workshop com integrador.

## Em Aberto

- Lloretrans pode não ser PME pura se o grupo agregado exceder limites IAPMEI; comercialmente, no entanto, compra como PME familiar/operacional.
- Volume real “4 000 facturas/mês”.
- Contacto do integrador PHC Advanced.
- SLA pretendido.
- Se querem comprar plataforma completa ou só uma primeira fase.

## Correcção de julgamento

A minha recomendação anterior, **PRO EUR 54k-72k** e **Enterprise EUR 92k-125k**, estava tecnicamente protegida mas comercialmente pesada para PME portuguesa.

O erro não estava no custo de engenharia; estava no posicionamento. Para PME, o preço deve ser:

- Entrada mais baixa.
- Scope mais estreito.
- Entrega faseada.
- Pressupostos visíveis.
- Upsell depois de provar controlo operacional.

## Cenários revistos

### Cenário 1 — PME entrada agressiva

| Tier | Setup | Recorrente | Scope |
|---|---:|---:|---|
| Core | EUR 9k-14k | EUR 450-750/mês | 1 MVP forte ou A+B reduzido; sem escrita PHC Advanced. |
| PRO | EUR 24k-36k | EUR 950-1.600/mês | A+B+C faseado ou A+B+F; suporte leve; PHC Advanced por XML. |
| Enterprise faseado | EUR 45k-65k | EUR 1.900-3.000/mês | 6 fluxos no roadmap, mas só 3-4 entregues no primeiro contrato. |

Risco: comercialmente fácil, mas margem apertada. Só aceito se houver cláusula de change request e limites duros de volume/suporte.

### Cenário 2 — PME base recomendado

| Tier | Setup | Recorrente | Scope |
|---|---:|---:|---|
| Core | EUR 12k-18k | EUR 550-900/mês | A+B controlado ou 1 MVP complexo com onboarding. |
| PRO | EUR 32k-48k | EUR 1.200-2.200/mês | A+B+C+F faseado, humano no loop, XML PHC Advanced até validação do integrador. |
| Enterprise faseado | EUR 58k-88k | EUR 2.400-3.900/mês | 6 MVPs no plano, entregues por fases; D/E dependem de Frotcom/PHC Advanced. |

Risco: ainda pode parecer alto face a Moloni/PHC GO, mas é defendível se a narrativa for “controlo operacional com dados reais”, não “software”.

### Cenário 3 — Médio-grande / enterprise

| Tier | Setup | Recorrente | Scope |
|---|---:|---:|---|
| Core | EUR 22k-30k | EUR 900-1.300/mês | A+B completo com onboarding real. |
| PRO | EUR 54k-72k | EUR 2.200-3.400/mês | A+B+C+F completo, mais integração e suporte próximo. |
| Enterprise | EUR 92k-125k | EUR 3.800-5.600/mês | 6 MVPs, multi-empresa, DPA formal, suporte mensal, rollout oficina. |

Risco: tecnicamente sólido, mas pode perder a sala se a Clarice/Bilal quiserem uma proposta PME pragmática.

## Recomendação clara revista

Escolho o **Cenário 2 — PME base recomendado**.

Preço a usar na próxima iteração da proposta:

| Tier | Setup recomendado | Recorrente recomendado | Nota |
|---|---:|---:|---|
| Core | EUR 12k-18k | EUR 550-900/mês | Mantém-se próximo do tier actual, mas com scope explicitamente limitado. |
| PRO | EUR 32k-48k | EUR 1.200-2.200/mês | Melhor equilíbrio para Clarice: 3-4 fluxos, valor visível, risco controlado. |
| Enterprise faseado | EUR 58k-88k | EUR 2.400-3.900/mês | Baixa o choque face à versão anterior; preserva margem se for faseado. |

Isto implica mudar a proposta menos do que a recomendação anterior. Em vez de subir tudo, mantemos a estrutura actual mas alteramos a promessa:

- Core deixa de significar “A+B completo garantido”; passa a “primeiro MVP ou A+B reduzido”.
- PRO é o tier recomendado.
- Enterprise é roadmap faseado, não compromisso fechado de 6 MVPs live com todas as integrações.

## Sprint 0 recomendado

Para PME portuguesa, eu adicionaria uma porta de entrada:

| Item | Preço | Condição |
|---|---:|---|
| Sprint 0 / Diagnóstico técnico-comercial | EUR 4,5k-7,5k | 2 semanas; descontável até 50% se avançarem para PRO/Enterprise em 30 dias. |

Outputs Sprint 0:

- Workshop PHC Advanced com integrador.
- Confirmação Frotcom/Logue Trans.
- Volume documental real.
- Escolha do primeiro MVP.
- Fecho de preço fixo por fase.

Isto reduz o risco de o conselho ver EUR 58k-88k como “salto no escuro”.

## Sensibilidades

### Se as “4 000 facturas/mês” forem facturas-fornecedor

- Não aumenta muito o custo Claude API, mas aumenta validação, regras, excepções e suporte.
- PRO sobe +EUR 5k-10k setup e +EUR 300-800/mês.
- Enterprise sobe +EUR 8k-15k setup e +EUR 600-1.200/mês.

### Se SLA subir de 99% para 99.9%

- Não oferecer em Core.
- PRO 99.9% só como add-on: +EUR 700-1.200/mês.
- Enterprise 99.9%: +EUR 1.200-2.500/mês + setup técnico EUR 6k-15k.

### Se o integrador PHC Advanced não colaborar

- Retirar escrita PHC Advanced de scope.
- Manter XML/registo intermédio.
- Change request obrigatório para escrita directa futura.
- Não usar “integração PHC Advanced” como promessa fechada; usar “preparado para integração PHC Advanced”.

## Frase executiva revista

> Recomendamos PRO faseado: EUR 32k-48k de implementação e EUR 1.200-2.200/mês, com Sprint 0 opcional de EUR 4,5k-7,5k. Inclui A+B+C+F em rollout controlado, XML PHC Advanced enquanto o integrador não valida escrita directa, SLA 99% e limites explícitos de volume/suporte. Enterprise completo fica como roadmap faseado de EUR 58k-88k + EUR 2.400-3.900/mês.

## Decisão

Substituo a recomendação anterior. Para este caso, a proposta deve ir para conselho com **pricing PME base**, não pricing enterprise.
