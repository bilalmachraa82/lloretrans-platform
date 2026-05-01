# Fase 2.5 — Pricing modular final para a reunião com a Clarice

Data: 27 Abril 2026
Versão: 1.0 final, para usar na proposta a enviar e na reunião de 10 ou 13 Maio.
Substitui: as tabelas de tier em `recommendation.md` e `cfo-review.md` para efeitos de **versão a apresentar**. As análises anteriores ficam como suporte interno.

## Posicionamento

A AiTiPro **não vende horas**. Vende **fluxos operacionais entregues e operados**, com velocidade AI-native como diferenciador. Cada um dos 6 fluxos solicitados pela Clarice tem complexidade diferente; por isso, cada um tem preço fixo próprio. A cliente escolhe a combinação. Bundles com desconto recompensam compromisso.

A IA acelera **calendário**, não baixa preço. O preço está alinhado com mercado custom B2B PT mid-market e protege margem para sustentar suporte, evolução e responsabilidade operacional.

## Verificado

- Tiers actuais publicados em `app/proposta/page.tsx` ainda mostram Core/PRO/Enterprise antigos. Devem ser substituídos por esta tabela modular antes da reunião, ou o pricing vai apenas em PDF assinado.
- Estimativas de esforço por MVP em `bottom-up.md` (proposta original) e em `market-research.md` (anchors PT 2026).
- Excel da bolsa de cargas mostra margem global ≈ €0 e EUROREBELO a -€6.100 — sensibilidade comercial em E.
- Anchors PME PT confirmados: PHC GO Advanced €78,81/mês; EasyFleet Advanced €160/mês 1-20; ManWinWin €39-75/utilizador/mês + setup €1,89k-3,59k.
- Mercado AI-native consultancy PT 2026: posicionamento premium é a norma para players sérios (ex.: Engibots project-based). "AI partilhada como desconto" é um anti-padrão a evitar.

## Assumido

- Os MVPs no repo `lloretrans-platform` são protótipos demonstráveis, não produto multi-tenant production-hardened. A reutilização da base reduz tempo de UI/scaffolding (~30-40%) mas **não reduz** integração externa, adopção ou suporte.
- Velocidade AI-native (Claude Opus 4.7 + GPT 5.5) traduz-se em entrega 30-40% mais rápida no calendário, não em preço 30-40% mais baixo.
- A AiTiPro entrega com 1-2 pessoas; suporte business-hours; sem equipa de night-ops.
- PHC Advanced escrito directo continua condicionado a workshop com integrador na Sprint 0.
- IVA não incluído.

## Em aberto

- Estado real production-readiness dos MVPs no repo (validar antes de assinar prazos).
- Confirmação do integrador PHC Advanced.
- Acesso à API Frotcom de leitura.
- Volume documental real (CMR/guias vs facturas-fornecedor) — muda o custo de B.
- SLA pretendido (99% horário útil é o assumido).

---

## Catálogo modular — preço por MVP

Cada MVP é uma unidade comercial autónoma, com preço fixo de implementação e prazo calendário comprometido. Mensalidade entra apenas com bundles — não há mensalidade por MVP isolado, evita contratos minúsculos sem retenção.

| Cód. | Fluxo | Complexidade | Setup fixo | Prazo entrega | Dependências críticas |
|---|---|---|---:|---:|---|
| A | Validação de Quilómetros | Baixa | **€8k-10k** | 2 semanas | API Logue Trans (Hélio) + credenciais Frotcom |
| B | OCR Facturas Fornecedor | Alta | **€18k-22k** | 4 semanas | Top 10 fornecedores (80% volume); formato XML PHC Advanced |
| C | Digitalização Central de Documentos | Média | **€12k-15k** | 3 semanas | Volume diário; scanner/MFP portaria; matriz de permissões cross-empresa |
| D | Médias de Combustível | Média | **€12k-15k\*** | 3 semanas\* | API Frotcom de leitura; ingestão Cepsa/Repsol/Radius/bomba interna |
| E | Bolsa de Carga + Comissões | Muito alta | **€22k-28k\*** | 6 semanas\* | Integrador PHC Advanced (master clientes/fornecedores + emissão facturas); saneamento Excel da bolsa |
| F | Folha de Obra Oficina (PWA) | Alta | **€18k-22k** | 4 semanas | Adopção real pelos mecânicos; matriz de estados; export PHC validado |

*D e E têm preço **condicionado** ao output da Sprint 0. Se Frotcom API ou PHC Advanced não confirmarem, D entra em modo "ingestão manual leve" e E sai do scope contratual.

### Notas de leitura por MVP

- **A** é o quick win e o cartão de visita: 2 semanas para um dashboard verde/amarelo/vermelho com bulk-approve. Demonstra velocidade AI-native ao conselho na primeira semana.
- **B** é o driver de ROI mais visível: cada factura mal classificada pesa em IVA cruzado e em comissão errada. Top 10 fornecedores cobrem 80% do volume — é aqui que se prova o produto.
- **C** é pré-requisito de B e F. Faz sentido começar por aqui no PRO faseado.
- **D** depende da API Frotcom. Sem acesso, oferece valor reduzido. Não fechar preço sem confirmação.
- **E** é o módulo mais arriscado: dados Excel mostram margem ≈ €0 globalmente e -€6.100 em EUROREBELO. Vender E sem saneamento prévio dos dados é importar o problema do cliente. Recomendo manter fora do contrato inicial.
- **F** tem risco de adopção humana, não técnico. PWA offline funciona; o que falha é o mecânico não preencher. Contratar piloto de 1 mês com 2-3 mecânicos antes de rollout total.

## Sprint 0 — porta de entrada obrigatória

| Item | Preço | Prazo | Output |
|---|---:|---:|---|
| **Sprint 0 — Diagnóstico técnico-comercial** | **€5k-7k** | 1-2 semanas | Workshop com integrador PHC Advanced + parecer escrito sobre escrita/XML; confirmação técnica Frotcom + Logue Trans (acessos, limites API); volume documental real medido; escolha priorizada do MVP inicial; carta de preço fixo por fase para o bundle escolhido. |

Cláusula: 50% descontável se avançarem para qualquer bundle de 2+ MVPs em 30 dias após entrega.

A Sprint 0 é **pré-condição contratual** para qualquer bundle ≥ 4 MVPs. Para bundle de 2 MVPs simples (ex.: A+C), pode ser dispensada se as dependências forem triviais.

A velocidade AI-native permite comprimir a Sprint 0 de 2 semanas para 1 semana se o cliente disponibilizar o integrador PHC Advanced e o ponto de contacto Frotcom logo na semana 1.

## Bundles — combinações com desconto

A Clarice escolhe entre estas combinações pré-definidas. Bundles personalizados aceitam-se mediante quote.

### Bundle 2 — "Controlo essencial"

**Recomendado a quem quer começar pequeno e validar a AiTiPro antes de avançar.**

- Inclusão: A + C (km validado + documentos centrais)
- Setup: **€20k-25k** (vs €20k-25k somando isolado — sem desconto, é entrada honesta)
- Mensalidade: **€600-900/mês**
- Prazo total: 4 semanas calendário (entrega faseada — A na semana 2, C na semana 4)
- SLA: 99% horário útil
- Suporte: 4-8h/mês

### Bundle 4 — "Operação fechada" *(recomendação principal)*

**Recomendado a quem quer fechar o ciclo administrativo + financeiro + oficina piloto.**

- Inclusão: A + B + C + F (km + OCR fornecedor + documentos + oficina piloto)
- Setup à la carte (somatório): €56k-69k
- **Setup com desconto bundle: €48k-58k** (~14% desconto)
- Mensalidade: **€1.200-1.800/mês**
- Prazo total: 10-12 semanas calendário (com paralelização AI-native)
- SLA: 99% horário útil
- Suporte: 10-18h/mês
- Pré-condição: Sprint 0 obrigatória

### Bundle 6 — "Plataforma operacional completa" *(roadmap, não compromisso fechado hoje)*

**Recomendado quando D e E tiverem dependências resolvidas. Não fechar como compromisso integral nesta reunião.**

- Inclusão: A + B + C + D + F + piloto E (com saneamento de dados na fase prévia)
- Setup à la carte (somatório): €90k-112k
- **Setup com desconto bundle faseado: €78k-92k** (~15% desconto)
- Mensalidade: **€2.200-3.200/mês**
- Prazo total: 16-20 semanas calendário em fases
- SLA: 99% horário útil
- Suporte: 18-30h/mês
- Pré-condição: Sprint 0 obrigatória + workshop específico de saneamento de dados antes de E entrar em scope contratual

E é mantido como **piloto** porque o estado dos dados (Excel margem ≈ €0; EUROREBELO -€6.100) torna irresponsável vendê-lo como entrega fechada antes de saneamento. O preço pode subir após a Sprint 0 se o saneamento for mais profundo do que o esperado.

## Tabela resumo para a reunião

| Decisão | Investimento | Recorrente | Prazo | Para quem |
|---|---:|---:|---:|---|
| Sprint 0 | €5k-7k | — | 1-2 sem | Pré-condição para bundles 4 e 6 |
| Bundle 2 | €20k-25k | €600-900/mês | 4 sem | Entrada controlada |
| **Bundle 4** | **€48k-58k** | **€1.200-1.800/mês** | **10-12 sem** | **Recomendação principal** |
| Bundle 6 | €78k-92k | €2.200-3.200/mês | 16-20 sem em fases | Roadmap; D+E condicionados |

## Diferenciais a comunicar (não a baixar preço por isso)

1. **Velocidade AI-native demonstrada, não prometida.** Demo funcional com dados reais em 5 dias. Iteração semanal visível. MVP A entregue em 2 semanas. Iso é o que justifica o preço, não baixa o preço.
2. **Plataforma própria, não scaffolding.** Não estás a vender consultoria pura nem licença SaaS pura — vendes ownership de uma plataforma vertical operada. O cliente fica com o produto, não fica preso à AiTiPro.
3. **Compromisso de prazo, não estimativa.** Cada MVP tem prazo de entrega contratual. Atraso por causa AiTiPro = penalidade. Atraso por causa cliente (acessos, dados, decisões) = pausa de calendário registada.
4. **Auditabilidade total.** Tudo é exportável. Saída sem penalização com 90 dias de aviso. Dados devolvidos em formato aberto.
5. **Sem dependência de IA "decisora".** A IA regista, cruza, valida e classifica. A decisão é humana. Isto não é um diferencial técnico — é uma protecção comercial e jurídica que conselhos portugueses valorizam.

## Comparação directa com pricing anterior

| Versão | Pequeno | Médio | Grande | Mensalidade médio |
|---|---:|---:|---:|---:|
| `app/proposta/page.tsx` original | €8k-18k | €28k-48k | €52k-92k | €1.400-2.800 |
| `recommendation.md` Cenário 2 | €12k-18k | €32k-48k | €58k-88k | €1.200-2.200 |
| `cfo-review.md` final | €14k-18k | €32k-45k | €58k-85k | €1.200-1.800 |
| **Modular (este doc)** | **€20k-25k (Bundle 2)** | **€48k-58k (Bundle 4)** | **€78k-92k (Bundle 6)** | **€1.200-1.800 (Bundle 4)** |

Notas sobre as diferenças:

- O Bundle 2 modular fica acima do Core (€14k-18k) porque inclui 2 MVPs reais, não 1 MVP reduzido. É honesto: no Core antigo, "A+B" era promessa não-defensável a esse preço.
- O Bundle 4 modular fica em linha com o PRO faseado (€32k-45k) mas com tecto ligeiramente acima (€58k) para reflectir que inclui 4 MVPs entregues, não 3-4 prometidos. Cobertura completa com desconto bundle.
- O Bundle 6 fica em linha com o Enterprise faseado anterior, mas explicitamente com D e E condicionados à Sprint 0.

## Frase executiva modular para a Clarice

> "A proposta tem uma porta de entrada — Sprint 0 de €5k-7k em uma a duas semanas, que valida com o integrador PHC Advanced e com a Frotcom o que é viável — e três pacotes à escolha. O que recomendamos é o Bundle 4: €48k-58k de implementação e €1.200-1.800/mês para A, B, C e oficina piloto, em dez a doze semanas. Se preferirem começar mais pequeno, há o Bundle 2 a €20k-25k para validação em quatro semanas. O Bundle 6 fica como roadmap: D e E entram quando as dependências externas estiverem confirmadas."

Versão curta para abertura:

> "Cinco mil de Sprint 0 numa a duas semanas. Quarenta e oito a cinquenta e oito mil de implementação. Mil duzentos a mil e oitocentos por mês. Quatro fluxos críticos em dez a doze semanas. Velocidade AI-native demonstrada, não prometida."

---

## Caso de NÃO fazer (10º homem)

- Se o conselho exigir desconto agressivo invocando "vocês usam IA, devia ser mais barato": **recusar e sair**. Esse cliente vai puxar margem para sempre. Em alternativa, oferecer Bundle 2 mais pequeno em vez de descontar Bundle 4.
- Se a Sprint 0 não confirmar o integrador PHC Advanced nem o acesso Frotcom, **não fechar Bundle 4 nem 6**. Fica Bundle 2 (A+C) ou nada.
- Se o repo `lloretrans-platform` ainda não tiver os MVPs em estado próximo de produção (multi-tenant, autenticação real, deploy estável), **comprimir os prazos para os valores anunciados nesta tabela é arriscado**. Validar production-readiness antes de assinar contrato com penalidades de atraso.
- Premissa mais frágil: "AiTiPro consegue entregar Bundle 4 em 10-12 semanas com 1-2 pessoas e velocidade AI-native". Se a equipa real for 1 pessoa fully loaded, o calendário pode escorregar 3-4 semanas; preferir contratualizar 12 semanas com tolerância de 2 semanas a contratualizar 10 firmes.

---

## Acção recomendada — agora

1. **Decisão hoje**: passa esta tabela modular ao Fernando para feedback rápido (sim/não, sem nova ronda de polish). Concorda → ship. Discorda em algum ponto → discute na chamada e fecha em 30 minutos. Não há 6ª iteração.
2. **Antes da reunião**: actualizar `app/proposta/page.tsx` para esta estrutura modular **ou** marcar a página como "em revisão" e entregar pricing apenas em PDF assinado e numerado para a Clarice.
3. **Na reunião**: apresentar com a frase executiva acima. Se o conselho pedir Enterprise fechado, oferecer Bundle 6 com Sprint 0 obrigatória e cláusula explícita de saneamento de dados antes de E. Se pedir desconto baseado em "usam IA", responder com a linha do diferencial AI-native: "a velocidade está no preço; é por isso que entregamos em metade do tempo de uma software house tradicional".
4. **Pós-fecho**: registar lição aprendida — bundles modulares > tier abstracto para PME PT mid-market.

*Stop iterating. Go ship.*
