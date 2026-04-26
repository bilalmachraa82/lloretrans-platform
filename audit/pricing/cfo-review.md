# Fase 2.4 — CFO review do pricing recomendado

Data de revisão: 26 Abril 2026
Reviewer: CFO PT + consultor SaaS B2B vertical
Base: bottom-up.md + market-research.md + recommendation.md + app/proposta/page.tsx
Reunião alvo: Clarice → conselho Lloretrans em 10 ou 13 Maio 2026

## TL;DR

O pricing está **equilibrado para enterprise mid-market**, mas **psicologicamente caro para uma PME familiar portuguesa** que toma decisões com anchor mental em PHC GO Advanced (~€78/mês) e EasyFleet (~€160/mês). A estrutura está certa; o tecto antigo da mensalidade PRO (€2.200) criava fricção desnecessária à leitura inicial e o Enterprise não deve ir à reunião como recomendação. Sprint 0 deve ser obrigatória. A âncora narrativa é controlo, custo de uma administrativa, e ROI mensurável — não comparação com SaaS horizontal.

---

## Verificado

- Tiers actuais em `app/proposta/page.tsx`: Core €8k-18k + €450-900/mês · PRO €28k-48k + €1.400-2.800/mês · Enterprise €52k-92k + €2.800-4.600/mês.
- Recomendação final (`recommendation.md`): Core €14k-18k + €600-900/mês · PRO €32k-45k + €1.200-1.800/mês · Enterprise faseado €58k-85k + €2.200-3.500/mês.
- Sprint 0 final em `recommendation.md`: €5k-7k, obrigatória, descontável até 50% se avançar para PRO em 30 dias.
- Anchors PME PT verificados em `market-research.md`:
  - Cegid PHC GO: €38,36 / €78,81 / €180/mês em subscrição trienal.
  - EasyFleet Advanced: €160/mês para frota 1-20 viaturas.
  - ManWinWin: €39-75/utilizador/mês + setup €1,89k-3,59k.
  - Moloni / Vendus / InvoiceXpress: €6-26/mês.
- Lloretrans isolada não é PME no critério IAPMEI (`market-research.md` confirma <250 trabalhadores e ≤€50M VN como critério europeu); o **grupo agregado** Patrícia Pilar tem >1000 colaboradores e >200M kg produção, o que afasta o caso do extremo PME puro.
- Excel da bolsa de cargas mostra margem global ≈ €0 e EUROREBELO a -€6.100 (`CODEX_AUDIT_PROMPT_V2.md`). Não é um problema de pricing AiTiPro, mas é uma sensibilidade comercial relevante para o MVP E.

## Assumido

- Conselho Lloretrans toma decisões com cabeça de PME familiar/operacional, mesmo que o grupo agregado não o seja.
- Comparação mental dominante: 1 administrativa fully loaded (€18k-25k/ano ≈ €1.500-2.000/mês equivalente) e 1 mês de subscrição PHC GO Advanced (€78).
- Decisor real é Clarice + 1-2 administradores; ticket >€50k pede aval explícito do conselho.
- Disposição cultural a mensalidades altas em PT é baixa: rejeitam mais o "para sempre" do que o "uma vez".
- A AiTiPro aceita margem inicial 35-45% para fechar este caso de referência, com upsell posterior, conforme bottom-up.md.

## Em aberto

- Confirmação do integrador PHC Advanced (sem isto, escrita directa em B/E/F **não** entra em scope fechado).
- Acesso à API Frotcom de leitura (sem isto, MVP D não tem baseline real).
- Volume real "4.000 documentos/mês": a resposta do Éder escreveu "faturas" dentro do Fluxo 1 (CMR/guias). Se afinal forem facturas-fornecedor, MVP B muda materialmente de custo.
- SLA pretendido (99% vs 99.9%).
- Se o conselho aceita o conceito de "Sprint 0 paga" antes de assinar contrato grande.

---

## 1. Diagnóstico do pricing — alto, baixo ou equilibrado?

**Equilibrado em margem, agressivo em mensalidade percebida.**

| Dimensão | Leitura |
|---|---|
| Setup Core €12k-18k | **Adequado.** Compatível com setup ManWinWin (€1,89k-3,59k) + customização vertical mínima. Não é commodity. |
| Setup PRO €32k-45k | **Adequado** se faseado e se a Sprint 0 confirmar PHC Advanced. Comparáveis enterprise SaaS PT começam aqui. Acima do tecto perde-se margem. |
| Setup Enterprise €58k-85k | **No limite.** Defensável para 6 fluxos com integrações live, **insustentável** se o conselho ler como "software". Não levar como recomendação primária. |
| Mensalidade Core €550-900 | **OK** se for 1 MVP estreito. Se for A+B real, fica abaixo do custo loaded. |
| Mensalidade PRO €1.200-1.800 | **Adequada** para conselho PME/familiar. €1.500 é o ponto de venda. |
| Mensalidade Enterprise €2.200-3.500 | Defensável para multi-empresa real, **comercialmente imprudente publicar como recomendação** nesta reunião. |

**Veredicto.** O pricing recomendado é tecnicamente sustentável mas optimiza margem AiTiPro em vez de optimizar fecho. Para esta reunião específica, há margem para baixar tectos sem perder defensabilidade.

## 2. Tier a recomendar à Clarice

**PRO faseado, antecedido de Sprint 0 obrigatória.** Concordo com a hipótese do Bilal e levanto a fasquia.

Razão:

- Core "puro" não resolve o caso Lloretrans. Resolve um problema (km ou OCR) sem fechar o ciclo. O conselho percebe-o como "vamos pôr o dedo na ferida" e fica indeciso.
- Enterprise é uma armadilha. Promete 6 fluxos quando D (combustível) e E (bolsa/comissões) dependem de Frotcom + PHC Advanced + dados Excel cuja margem aparece a €0/-€1.800. Vender Enterprise **agora** é vender o que **não controlas**.
- PRO faseado vende **controlo, não promessa**. Quatro fluxos com dependências razoavelmente conhecidas (A km, B OCR fornecedor, C documentos, F oficina piloto). É honesto, é absorvível e produz caso de referência.

**Sequenciamento dentro de PRO.** A ordem do Bilal está certa: começar por C (digitalização documentos — pré-requisito de B/F), depois A (km — quick win e prova de controlo), depois B (OCR — driver de poupança), depois piloto F (oficina — risco humano). D e E ficam fora do contrato inicial e entram como change request quando Frotcom + PHC Advanced + dados estiverem confirmados.

## 3. Mensalidade psicologicamente aceitável

**Faixa final recomendada: €1.200-1.800/mês para PRO**, com €1.500/mês como ponto de venda preferido.

Triangulação:

- Custo de 1 administrativa fully loaded em PT 2026: €1.500-2.000/mês. **€1.500/mês = "metade de uma administrativa, todos os meses".** Isto é a frase que faz a venda.
- Custo Frotcom + PHC Advanced + cartões combustível já pago pelo grupo: provavelmente €1.500-3.000/mês agregado. Adicionar mais €1.500/mês para fechar o gap entre eles é proporcional.
- Por viatura: €1.500/mês ÷ 60 viaturas ≈ €25/viatura/mês. Webfleet/Frotcom CANBus ronda €16-28/veículo/mês isolado. Posicionamento competitivo.
- Tecto €1.800 absorve 1 sensibilidade (ex.: SLA 99%, volume picos). €2.200 obriga a explicar 2 sensibilidades — fricção a mais para o conselho.

Para Core, manter **€600-900/mês**. €450 é desconto sem upside; subir o piso protege margem se scope for "1 MVP simples".

Para Enterprise faseado, se vier à conversa, **€2.200-3.500/mês**. Baixar o tecto de €3.900 evita ancorar negociação futura num número que o conselho não esquece.

## 4. Como justificar a mensalidade ao conselho

A mensalidade só ganha o conselho se for traduzida em **três comparações concretas**, não em features.

1. **Substituição de trabalho humano repetitivo.** "€1.500/mês equivale a metade de uma administrativa. A plataforma faz o cruzamento km, regista CMR e classifica facturas todos os dias, sem férias e sem erro humano. A administrativa fica liberta para o que exige decisão."
2. **Custo de erro silencioso.** "Cada km não validado, cada classificação errada de fornecedor, cada CMR perdido custa em factura errada, IVA cruzado errado, ou viagem facturada com prejuízo. Estimar 0,5-1% do volume facturado em erros silenciosos é conservador. Para a Lloretrans isolada, são milhares de euros/ano que a plataforma fecha."
3. **Reuso multi-empresa.** "A plataforma vive uma vez no grupo. As 29 entidades podem partilhar a mesma camada de digitalização documental e validação. A mensalidade não cresce linearmente com utilizadores — cresce com volume documental e suporte."

Adicionar **três protecções** que o conselho português valoriza acima da feature:

- Auditabilidade: tudo é exportável, nada fica preso à AiTiPro.
- Saída sem penalização: aviso prévio razoável (90 dias) e dados devolvidos em formato aberto.
- Cláusula de revisão anual de scope. O conselho aceita pagar mais se o uso real subir, e vice-versa.

**O que NÃO usar.** Comparações com Moloni / Vendus / InvoiceXpress. São anchors baixos que só te puxam para baixo. A linguagem certa é "isto não é software de facturação, é a plataforma operacional que liga PHC Advanced, Frotcom, Logue Trans, Excel e papel — coisas que hoje vivem desligadas".

## 5. Sprint 0 — obrigatória

**Obrigatória.**

Razões:

- Sem workshop com integrador PHC Advanced, qualquer promessa de escrita directa é especulação. Vender PRO sem este passo é assumir risco que não controlas.
- Frotcom API de leitura ainda não está confirmada. Sem ela, MVP D fica sem baseline e MVP A perde profundidade.
- Volume documental real (CMR/guias vs facturas fornecedor) muda o custo de B em €5k-10k de setup. Não fechar volume na Sprint 0 é assinar com risco invertido.
- Para o conselho, a Sprint 0 é exactamente o que reduz a percepção de "salto no escuro €58k+". Transforma "vamos gastar muito de uma vez" em "vamos validar pequeno, depois decidir".

**Estrutura recomendada da Sprint 0:**

- Preço €5k-7k; é trabalho real de 2 semanas, não diagnóstico de cortesia.
- Duração 2 semanas calendário.
- Outputs fixos e auditáveis:
  1. Workshop com integrador PHC Advanced + parecer escrito sobre escrita/XML.
  2. Confirmação técnica Frotcom + Logue Trans (acessos, limites API).
  3. Volume documental real medido (CMR, guias, facturas fornecedor).
  4. Escolha priorizada do primeiro MVP de PRO + estimativa de calendário.
  5. Carta de preço fixo por fase para PRO.
- Cláusula: 50% descontável se avançarem para PRO em 30 dias.

Se o conselho recusar a Sprint 0, recusar o contrato. Avançar sem isto é vender risco que vai ser devolvido em re-scope.

## 6. Riscos comerciais

| # | Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|---|
| R1 | Conselho rejeita por choque de €58k+ | Alta | Bloqueia fecho | Sprint 0 obrigatória + apresentar PRO como recomendação, não Enterprise |
| R2 | Mensalidade PRO percepcionada como "para sempre" alto | Média-alta | Negociação de desconto agressivo | Faixa €1.200-1.800; reframe "metade de uma admin"; cláusula de revisão anual |
| R3 | Integrador PHC Advanced não colabora | Média | PRO fica reduzido | Sprint 0 confirma; fallback XML/registo intermédio sem promessa de escrita directa |
| R4 | Frotcom API de leitura não chega a tempo | Média | MVP D sai do contrato inicial | Já está fora do PRO recomendado; é roadmap |
| R5 | Excel da bolsa mostra margem -€1.800 / EUROREBELO -€6.100 | Confirmado | Vender E como solução pode dar mau resultado se a causa for dados, não workflow | Manter E fora do contrato inicial; abordar como diagnóstico de dados na fase seguinte |
| R6 | Conselho exige Enterprise por reflexo "queremos tudo" | Média | Compromisso impossível de cumprir | Recusar firme, oferecer roadmap com gates de validação |
| R7 | Concorrência local entra com €15k bodyshop | Baixa-média | Pressão de preço | Diferenciação clara: AiTiPro vende ownership de produto + IA controlada, não horas |
| R8 | Pedido de desconto justificado por "volume futuro do grupo" | Alta | Erosão de margem | Política prévia: até 10% no Core, até 5% no PRO, condicionado a contrato pluri-anual ou caso de referência público |
| R9 | Cliente assina sem assinar DPA / sem definir DPO | Média | Risco RGPD | DPA formal anexo ao contrato; sem DPA não há produção |
| R10 | "IA que decide" misturada na narrativa do conselho | Média | Expectativa errada gera atrito pós-venda | Reforçar em proposta e apresentação: IA regista, cruza, valida; a decisão é humana |

## 7. Versão final de pricing para a reunião

Esta é a tabela que recomendo levar à apresentação à Clarice e, depois, ao conselho.

| Item | Setup | Recorrente | Scope | Posicionamento |
|---|---:|---:|---|---|
| **Sprint 0 — obrigatória** | **€5k-7k** | — | 2 semanas. Workshop integrador PHC Advanced. Validação Frotcom + Logue Trans. Volume real. Plano fixo PRO. | Reduz risco do conselho. Descontável 50% se avançar em 30 dias. |
| **Core (entrada)** | €14k-18k | €600-900/mês | 1 MVP forte (C ou A+B reduzido). Sem escrita directa PHC Advanced. SLA 99% horário útil. | Para um conselho que quer começar pequeno. |
| **PRO faseado — recomendado** | **€32k-45k** | **€1.200-1.800/mês** | C + A + B + piloto F, faseado em 3-4 meses. PHC Advanced via XML até integrador validar escrita. Suporte business-hours. | Recomendação principal. Quatro fluxos críticos, risco controlado. |
| **Enterprise faseado** | €58k-85k | €2.200-3.500/mês | 6 fluxos no roadmap; D e E condicionados a Frotcom API + integrador PHC Advanced + saneamento de dados. Multi-empresa. | Roadmap, **não compromisso desta reunião**. |

Diferenças vs. Cenário 2 actual de `recommendation.md`:

- Sprint 0 fica em **€5k-7k** e é **obrigatória**.
- Core piso sobe de €12k para €14k para reflectir custo real de 1 MVP entregue, não "Sprint 0 ampliada".
- PRO tecto baixa de €48k para **€45k** e mensalidade tecto baixa de €2.200 para **€1.800** para retirar fricção psicológica.
- Enterprise tecto baixa de €88k para €85k e mensalidade tecto baixa de €3.900 para €3.500 para evitar memória negativa em negociação futura.

Mantém-se tudo o resto, incluindo as sensibilidades já documentadas (volume facturas, SLA 99.9%, ausência de integrador PHC Advanced).

**O que retirar do site da proposta antes da reunião.** O bloco actual `app/proposta/page.tsx` tem PRO €28k-48k + €1.400-2.800/mês e Enterprise €52k-92k + €2.800-4.600/mês. Estes números públicos conflituam com a versão que se vai levar ao conselho. Antes da reunião, ajustar a página para a tabela acima — ou marcar a página como "em revisão" e entregar o pricing **só** em PDF assinado.

## 8. Frase executiva para a Clarice

> "Para esta primeira fase, recomendamos avançar com PRO faseado: €32k-45k de implementação e €1.200-1.800/mês, antecedidos por um Sprint 0 de duas semanas a €5k-7k. O Sprint 0 confirma com o integrador PHC Advanced e com a Frotcom o que é viável antes de qualquer compromisso, e é descontável até metade se avançarmos com PRO em 30 dias. PRO entrega quatro fluxos críticos — quilómetros, OCR fornecedores, documentos centrais e piloto de oficina — em três a quatro meses, com controlo operacional auditável. Combustível e bolsa de cargas ficam no roadmap, condicionados a integrações e dados validados, sem compromisso de calendário hoje."

Versão curta para abertura de reunião:

> "Cinco mil de Sprint 0 nas próximas duas semanas, depois trinta e dois a quarenta e cinco mil para implementar, mais mil e duzentos a mil e oitocentos por mês de operação. Quatro fluxos. Três a quatro meses. Controlo operacional, não software."

---

## Caso de NÃO fazer (10º homem)

Antes de validar esta recomendação, é honesto colocar na mesa o cenário em que **não se deve avançar**.

- Se a Lloretrans recusar a Sprint 0, a probabilidade de re-scope pós-contrato é alta. Sem PHC Advanced confirmado, qualquer setup PRO de €32k+ entra em risco de margem negativa. **Pior cenário plausível**: contrato fechado a €40k, descobre-se que o integrador PHC Advanced não escreve, MVP B reduz-se a XML manual, e os €1.500/mês mensais ficam a cobrir um produto que não fecha o ciclo. Trauma de referência negativa em mercado pequeno.
- Se o conselho insistir em Enterprise como compromisso fechado, **não fechar**. Dependências em D e E não estão controladas. Vender Enterprise hoje é vender o que não está nas mãos da AiTiPro.
- A premissa mais frágil deste pricing é "AiTiPro consegue entregar PRO faseado em 3-4 meses com 1-2 pessoas". Se a equipa real são 1 pessoa fully loaded + apoio, o calendário escorrega 6-8 semanas e a mensalidade €1.500 fica curta para cobrir o suporte. Validar capacidade interna antes de assinar.

---

*Documento de revisão crítica. Não substitui carta-proposta nem contrato. Em caso de divergência com o produto entregue, prevalece o que estiver no contrato assinado e na Sprint 0 fechada com a Clarice.*
