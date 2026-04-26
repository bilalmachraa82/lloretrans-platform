# Fase 2.1 — Bottom-up pricing

Data de análise: 26 Abril 2026  
Âmbito: 6 MVPs Lloretrans Ops, branch `feat/aitipro-realignment`

## Verificado

- Timeline da proposta: plataforma completa em 18-19 semanas; primeiros benefícios à semana 3. Fonte local: `app/proposta/page.tsx`.
- Esforço por MVP na proposta: A 2-3 sem, B 4-6 sem, C 3-5 sem, D 3-4 sem, E 6-10 sem, F 5-8 sem. Estas durações são úteis para preço isolado, mas não somam linearmente porque a proposta usa calendário sobreposto.
- Repo usa `pdf-parse` (`package.json`) e `ANTHROPIC_API_KEY` opcional (`.env.example`) para OCR/classificação. Não existe dependência de OCR gerido da Azure no `package.json`.
- Existem variáveis `AZURE_BLOB_*` / storage em `.env.example` e README, mas storage produção não está implementado no `package.json`; isto entra como risco, não como custo fechado.
- Preços infra consultados a 26 Abril 2026:
  - Neon pricing: Launch/Scale usage-based; Launch compute a USD 0.106/CU-hour; Scale a USD 0.222/CU-hour; storage USD 0.35/GB-month; PITR USD 0.20/GB-month de changes. Fonte: https://neon.com/pricing
  - Vercel Pro: pricing público com plano Pro e usage metered; inclui recursos base e overages. Fonte: https://vercel.com/pricing
  - Resend Pro: USD 20/mês para 50.000 emails/mês; extra USD 0.90/1.000. Fonte: https://resend.com/pricing
  - Claude Sonnet 4: USD 3/MTok input e USD 15/MTok output. Fonte: https://platform.claude.com/docs/en/about-claude/pricing

## Assumido

- Câmbio de trabalho: 1 USD = EUR 0,93. Estimativa, não taxa de tesouraria.
- Custo interno fully loaded de 1 senior full-stack/product engineer: EUR 50/h. Justificação: salários PT 2026 para software developer / tech lead / architect em Lisboa e Porto, ajustados a encargos patronais, férias, equipamento e horas produtivas. Fonte salarial base: Adecco Portugal Salary Guide 2026, https://www.adecco.com/pt-pt/-/media/project/adecco/adeccopt/pdfs/guia-salarial-2026-en.pdf
- Revisão PME portuguesa: para pricing de entrada, usei também EUR 38/h como custo efectivo productizado. Isto só é defensável se a AiTiPro reutilizar a base já construída, limitar scope e aceitar margem inicial inferior para abrir caso de referência.
- 40h/semana.
- Buffer de imprevistos: 25%.
- Margem bruta alvo para custom B2B PT: 45-55%. A recomendação usa este intervalo como critério, não como facto público.
- Margem PME de entrada: 35-45%. Não deve ser usada para Enterprise com escrita PHC Advanced, SLA superior ou responsabilidade operacional alargada.
- Não inclui IVA.

## Em Aberto

- Volume “4 000 documentos/mês”: a proposta trata como digitalização CMR/guias (MVP C), porque a resposta do Éder apareceu no Fluxo 1. Se afinal forem facturas-fornecedor, muda o custo/risco do MVP B.
- Contacto e colaboração do integrador PHC Advanced: sem isto, escrita directa B/E/F não pode ser assumida.
- SLA 99% vs 99.9%: 99.9% implica redundância, monitorização e suporte de escala diferente.
- Storage produção para PDFs/imagens: Azure Blob EU ou R2 EU ainda não está fechado no repo.

## Custo de IA e infra 12 meses

### Anthropic Claude API

MVP C, hipótese pedida: 4.000 documentos/mês, sem serviço OCR gerido da Azure, `pdf-parse` para texto e Claude Sonnet 4 para extracção/classificação.

- Estimativa por documento CMR/guia: 2.000 input tokens + 500 output tokens.
- Volume mensal: 8,0 MTok input + 2,0 MTok output.
- Custo mensal: USD 24 + USD 30 = USD 54 ≈ EUR 50.
- Custo anual: EUR 603.

MVP B, hipótese pedida: 9-50 facturas/dia, 1 chamada Sonnet 4 cada.

- Estimativa por factura: 4.000 input tokens + 1.000 output tokens.
- 270 facturas/mês: USD 7,29/mês ≈ EUR 6,78/mês; EUR 81/ano.
- 1.500 facturas/mês: USD 40,50/mês ≈ EUR 37,67/mês; EUR 452/ano.

Conclusão: Claude API não é o driver principal de pricing. O driver é integração, validação humana, PHC Advanced, adopção e suporte.

### Infra anual por tier

| Item | Core | PRO | Enterprise | Nota |
|---|---:|---:|---:|---|
| Neon Postgres EU | EUR 300-500 | EUR 500-900 | EUR 900-1.600 | Launch/Scale usage-based; Enterprise assume PITR mais longo e margem de compute |
| Vercel Pro | EUR 220-450 | EUR 450-700 | EUR 450-900 | 1-3 lugares + overages prudentes |
| Resend Pro | EUR 220 | EUR 220 | EUR 220-500 | Pro chega para alerts; escala se houver notificações massivas |
| Claude Sonnet 4 | EUR 100-300 | EUR 500-900 | EUR 700-1.300 | B+C; Enterprise usa buffer de picos |
| Observabilidade/backups/test env | EUR 300-600 | EUR 600-1.200 | EUR 1.000-2.000 | Estimativa operacional |
| **Total anual infra** | **EUR 1.140-2.070** | **EUR 2.270-3.920** | **EUR 3.270-6.300** | Sem storage final de PDFs/imagens |

## MVP isolado

Preço isolado usa as semanas da proposta por MVP, como se cada módulo fosse comprado sozinho. É um upper bound por módulo; não deve ser somado para obter Enterprise.

Fórmula: `semanas × 40h × EUR 50/h × 1,25 buffer ÷ (1 - margem alvo)`.

| MVP | Semanas proposta | Custo com buffer | Setup defensável @45-55% margem |
|---|---:|---:|---:|
| A · Validação km | 2-3 | EUR 5k-7,5k | **EUR 11k-14k** |
| B · OCR facturas | 4-6 | EUR 10k-15k | **EUR 22k-27k** |
| C · Digitalização central | 3-5 | EUR 7,5k-12,5k | **EUR 17k-23k** |
| D · Combustível | 3-4 | EUR 7,5k-10k | **EUR 17k-18k** |
| E · Bolsa + comissões | 6-10 | EUR 15k-25k | **EUR 33k-45k** |
| F · Oficina PWA | 5-8 | EUR 12,5k-20k | **EUR 28k-36k** |

Notas:

- MVP B isolado fica acima do Core actual se comprado com OCR completo e regras por fornecedor. Core só é defensável a EUR 8k-18k se for 1 MVP simples ou Sprint 0 limitada.
- MVP E é caro pelo risco PHC Advanced + fluxo comercial + factura cliente/fornecedor + comissão auditável. Não é apenas “uma tabela do Excel”.
- MVP F é caro pelo risco de adopção humana e offline/mobile, não pela UI em si.

## Tier pricing por esforço normalizado

Para respeitar o PRD/proposta de 18-19 semanas, normalizei os midpoints dos MVPs para 760h totais. Isto evita somar durações isoladas que se sobrepõem no calendário.

| MVP | Peso usado | Horas normalizadas |
|---|---:|---:|
| A | 2,5 / 29,5 | 64h |
| B | 5 / 29,5 | 129h |
| C | 4 / 29,5 | 103h |
| D | 3,5 / 29,5 | 90h |
| E | 8 / 29,5 | 206h |
| F | 6,5 / 29,5 | 167h |
| **Total** | 29,5 / 29,5 | **760h** |

| Tier | Scope usado | Horas | Custo delivery + 25% buffer | Setup defensável @45-55% margem |
|---|---|---:|---:|---:|
| Core | A+B | 193h | EUR 12,1k | **EUR 22k-27k** |
| PRO | A+B+C+F | 464h | EUR 29,0k | **EUR 53k-64k** |
| Enterprise | A+B+C+D+E+F | 760h | EUR 47,5k | **EUR 86k-106k** |

## Recorrente mensal bottom-up

Fórmula: `(infra mensal + suporte mensal × EUR 50/h) ÷ (1 - margem alvo)`.

| Tier | Suporte assumido | Custo mensal base | Recorrente defensável |
|---|---:|---:|---:|
| Core | 4-8h/mês | EUR 300-600 | **EUR 550-1.300/mês** |
| PRO | 10-18h/mês | EUR 700-1.300 | **EUR 1.300-2.900/mês** |
| Enterprise | 22-35h/mês | EUR 1.400-2.300 | **EUR 2.600-5.100/mês** |

## Leitura face aos tiers actuais

| Tier actual | Setup actual | Leitura bottom-up |
|---|---:|---|
| Core | EUR 8k-18k | Só defensável para 1 MVP simples ou Sprint 0. A+B completo pede EUR 22k-27k. |
| PRO | EUR 28k-48k | Abaixo da margem alvo se incluir A+B+C+F com onboarding e suporte real. |
| Enterprise | EUR 52k-92k | O tecto actual entra na zona defensável; o piso destrói margem se os 6 MVPs forem reais. |

## Rebase PME portuguesa

Esta secção responde à objecção comercial: para uma PME portuguesa, os preços enterprise acima parecem altos porque a comparação mental é PHC GO, Moloni, EasyFleet, ManWinWin ou “um integrador local”, não um projecto custom enterprise.

Condições para este rebase ser honesto:

- Scope faseado, não “6 MVPs fechados” desde o primeiro contrato.
- XML PHC Advanced ou registo intermédio até integrador confirmar escrita.
- SLA 99% em horário útil; nada de 99.9%.
- Suporte business-hours, sem managed service 24/7.
- A AiTiPro aceita margem inicial 35-45% para entrar, com upsell posterior.

Fórmula PME: `horas normalizadas × EUR 38/h × 1,25 buffer ÷ (1 - 35-45% margem)`.

| Tier | Scope usado | Horas | Custo PME com buffer | Setup mínimo sustentável @35-45% margem |
|---|---|---:|---:|---:|
| Core | 1 MVP forte ou A+B muito controlado | 130-193h | EUR 6,2k-9,2k | **EUR 10k-17k** |
| PRO | A+B+C+F faseado, sem escrita PHC Advanced prometida | 360-464h | EUR 17,1k-22,0k | **EUR 27k-40k** |
| Enterprise faseado | 6 MVPs, mas entregues por fases e com integrações live condicionadas | 600-760h | EUR 28,5k-36,1k | **EUR 44k-66k** |

Leitura:

- A proposta original **EUR 8k-18k / 28k-48k / 52k-92k** faz sentido para PME se for vendida como faseamento controlado, não como promessa enterprise full.
- A recomendação anterior **EUR 92k-125k Enterprise** fica tecnicamente defensável, mas comercialmente pesada para PME portuguesa.
- Para PME, o preço deve abrir mais baixo e compensar risco com limites contratuais: volume, PHC Advanced, SLA, suporte e change requests.

## Recorrente PME

| Tier | Suporte assumido | Custo mensal PME | Recorrente PME sustentável |
|---|---:|---:|---:|
| Core | 3-6h/mês + infra curta | EUR 250-450 | **EUR 450-850/mês** |
| PRO | 8-14h/mês + infra + revisão mensal leve | EUR 550-950 | **EUR 1.000-1.900/mês** |
| Enterprise faseado | 16-28h/mês + coordenação + auditoria mensal | EUR 1.100-1.800 | **EUR 2.000-3.300/mês** |

Conclusão revista após CFO review: para PME portuguesa, não se deve subir já para EUR 92k-125k como recomendação principal. O preço defensável para a reunião é Sprint 0 obrigatória EUR 5k-7k; Core EUR 14k-18k + EUR 600-900/mês; PRO faseado EUR 32k-45k + EUR 1.200-1.800/mês; Enterprise faseado EUR 58k-85k + EUR 2.200-3.500/mês, apenas como roadmap.
