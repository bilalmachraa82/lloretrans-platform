# Fase 2.3 — Pricing recommendation

Data de análise: 26 Abril 2026  
Base: bottom-up + mercado real consultado em Abril 2026.

## Verificado

- Tiers actuais em `app/proposta/page.tsx`:
  - Core: EUR 8k-18k setup + EUR 450-900/mês.
  - PRO: EUR 28k-48k setup + EUR 1.400-2.800/mês.
  - Enterprise: EUR 52k-92k setup + EUR 2.800-4.600/mês.
- Bottom-up para scope normalizado 18-19 semanas:
  - Core A+B completo: EUR 22k-27k setup defensável.
  - PRO A+B+C+F: EUR 53k-64k setup defensável.
  - Enterprise 6 MVPs: EUR 86k-106k setup defensável.
- Recorrente bottom-up:
  - Core: EUR 550-1.300/mês.
  - PRO: EUR 1.300-2.900/mês.
  - Enterprise: EUR 2.600-5.100/mês.

## Assumido

- Margem alvo 45-55%.
- EUR 50/h custo interno fully loaded.
- Pricing não inclui IVA.
- Fase 0/Sprint 0 fica incluída no setup, mas deve ter saída contratual clara caso PHC Advanced/Frotcom/Logue Trans bloqueiem.

## Em Aberto

- Se “4 000 facturas/mês” são CMR/guias ou facturas-fornecedor.
- Contacto do integrador PHC Advanced.
- SLA pretendido: 99% vs 99.9%.
- Storage produção para PDFs/fotos.
- Se Lloretrans quer comprar 1 MVP, 4 MVPs ou a plataforma completa desde início.

## Cenários recomendados por tier

### Cenário 1 — Conservador

| Tier | Setup | Recorrente | Quando usar |
|---|---:|---:|---|
| Core | EUR 16k-24k | EUR 650-1.000/mês | 1 MVP ou A+B muito limitado; sem escrita PHC Advanced; Sprint 0 com saída clara. |
| PRO | EUR 42k-58k | EUR 1.600-2.600/mês | A+B+C+F em modo controlado, com XML PHC Advanced e sem promessa de automação full. |
| Enterprise | EUR 78k-98k | EUR 3.000-4.600/mês | 6 MVPs, mas com integrações live faseadas e sem SLA 99.9%. |

Risco: ganha credibilidade comercial por parecer “contido”, mas pressiona margem e deixa pouca folga para PHC Advanced, adopção oficina e retrabalho de dados.

### Cenário 2 — Base

| Tier | Setup | Recorrente | Quando usar |
|---|---:|---:|---|
| Core | EUR 22k-30k | EUR 900-1.300/mês | A+B completo ou 1 MVP complexo com onboarding real. |
| PRO | EUR 54k-72k | EUR 2.200-3.400/mês | A+B+C+F, humano no loop, XML PHC Advanced enquanto integrador não valida escrita. |
| Enterprise | EUR 92k-125k | EUR 3.800-5.600/mês | 6 MVPs, multi-empresa, dados reais, suporte mensal, DPA e rollout com mecânico piloto. |

Risco: pode obrigar a justificar a subida face aos EUR 52k-92k actuais, mas é o primeiro cenário que protege margem e credibilidade técnica.

### Cenário 3 — Esticado

| Tier | Setup | Recorrente | Quando usar |
|---|---:|---:|---|
| Core | EUR 28k-38k | EUR 1.200-1.800/mês | Core com integração real, discovery pesado ou urgência executiva. |
| PRO | EUR 68k-88k | EUR 3.000-4.500/mês | PRO com escrita PHC Advanced, mais fornecedores OCR e suporte operativo apertado. |
| Enterprise | EUR 115k-150k | EUR 5.000-7.500/mês | SLA superior, PHC Advanced live, maior volume documental e disponibilidade mais próxima de managed service. |

Risco: aumenta risco de objecção de preço se o conselho comparar com SaaS genérico por veículo/utilizador. Exige narrativa forte: isto não é Frotcom, Fleetio ou Trans.eu; é integração operacional vertical.

## Recomendação clara

Escolho o **Cenário Base**.

Razão:

- Protege a margem alvo de 45-55% sem parecer preço de consultora enterprise internacional.
- Corrige o problema principal dos tiers actuais: o piso estava demasiado baixo para o risco real.
- Mantém a proposta vendável em Portugal: PRO a EUR 54k-72k é defendível para uma solução vertical com 4 fluxos reais; Enterprise a EUR 92k-125k é defendível para 6 MVPs com multi-empresa e suporte.
- Permite uma conversa honesta com Clarice: “controlo, não tempo” justifica investimento por redução de risco operacional, não por horas poupadas em Excel.

Pricing a usar nos materiais executivos até validação do Bilal:

| Tier | Setup recomendado | Recorrente recomendado | Nota |
|---|---:|---:|---|
| Core | EUR 22k-30k | EUR 900-1.300/mês | A+B completo; se for 1 MVP, pode baixar para EUR 16k-22k. |
| PRO | EUR 54k-72k | EUR 2.200-3.400/mês | Recomendado para primeira decisão se querem A+B+C+F. |
| Enterprise | EUR 92k-125k | EUR 3.800-5.600/mês | Recomendado se conselho quiser plataforma completa desde início. |

## Sensibilidades

### Se as “4 000 facturas/mês” forem facturas-fornecedor, não CMR/guias

Impacto:

- MVP B deixa de ser “9-50 facturas/dia” e passa a 4.000/mês.
- Claude API continua não sendo o maior custo: 4.000 facturas/mês a 4.000 input + 1.000 output tokens ≈ USD 108/mês ≈ EUR 100/mês.
- O custo real sobe em validação humana, regras por fornecedor, excepções, retries, anexos, auditoria e PHC Advanced.

Ajuste recomendado:

- PRO +EUR 8k-15k setup e +EUR 500-1.200/mês.
- Enterprise +EUR 10k-20k setup e +EUR 800-1.500/mês.
- Contractualmente: volume incluído explícito; overage por lote de 1.000 documentos.

### Se SLA subir de 99% para 99.9%

Impacto:

- 99% permite até ~7h18m indisponibilidade/mês; 99.9% baixa para ~43m/mês.
- 99.9% exige monitorização, incident response, backups testados, redundância operacional e runbooks. Neon multi-AZ ajuda storage, mas não resolve app, integrações, deploys, filas, email e suporte humano.

Ajuste recomendado:

- Não oferecer 99.9% em Core.
- PRO 99.9% só como add-on: +EUR 800-1.500/mês.
- Enterprise 99.9%: +EUR 1.500-3.000/mês + setup técnico EUR 8k-20k, dependendo de storage/fila/observabilidade.

### Se o integrador PHC Advanced não colaborar

Impacto:

- Escrita automática B/E/F fica bloqueada.
- Valor ainda existe via XML/registo intermédio, mas promessa de integração cai.
- Risco de retrabalho se o formato exigido pelo integrador aparecer tarde.

Ajuste recomendado:

- Manter setup, mas trocar “PHC Advanced live” por “export controlado + validação administrativa”.
- Retirar escrita PHC Advanced de qualquer milestone contratual até workshop técnico com integrador.
- Incluir cláusula: alterações por especificação PHC Advanced tardia entram em change request.
- Se o cliente exigir escrita PHC Advanced sem integrador, adicionar EUR 12k-30k de risco e 3-6 semanas.

## O que mudar na proposta

- Substituir “EUR 8k-92k” por “EUR 22k-125k para scope multi-MVP; Sprint 0/1 MVP pode começar abaixo”.
- Não esconder que PRO recomendado passa de EUR 28k-48k para EUR 54k-72k.
- Manter recorrente Enterprise próximo do actual, mas subir tecto para EUR 5.600/mês.
- Escrever todos os preços como estimativas condicionadas a PHC Advanced, SLA e volume documental.

Frase executiva sugerida:

> Recomendamos PRO como primeira decisão: EUR 54k-72k de implementação e EUR 2.200-3.400/mês, assumindo A+B+C+F, export XML PHC Advanced até validação do integrador PHC Advanced, SLA 99% e volume documental confirmado. Enterprise completo fica em EUR 92k-125k + EUR 3.800-5.600/mês.
