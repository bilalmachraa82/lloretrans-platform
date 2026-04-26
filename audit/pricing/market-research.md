# Fase 2.2 — Market research pricing

Data de análise: 26 Abril 2026  
Mercado: PT/ES + Europa, transporte/logística, OCR financeiro, bolsas de carga, oficina/manutenção.

## Verificado

- Muitos fornecedores enterprise não publicam preço final; a ausência de preço público é uma característica do segmento, não uma lacuna de pesquisa.
- Não encontrei prova pública de integração directa PHC CS / PHC GO / PHC Advanced nos concorrentes de transporte. Quando há integração, é descrita como API/ERP genérico ou “contact sales”.
- Para PHC CS/PHC GO/PHC Advanced, há evidência de integradores e APIs/limites, mas não uma garantia de que o integrador PHC Advanced do grupo aceite escrita directa. Fontes: PHC GO API/help center e integradores PHC CS/PHC Advanced públicos.
- Revisão PME: uma PME portuguesa é, por definição europeia/IAPMEI, <250 trabalhadores e <= EUR 50M volume de negócios ou <= EUR 43M balanço. Fonte: https://eur-lex.europa.eu/PT/legal-content/glossary/small-and-medium-sized-enterprises.html

## Rebase PME portuguesa

Nesta lente, o buyer compara a Lloretrans Ops com software português de gestão/facturação, ERP cloud e fornecedores verticais com preços públicos muito mais baixos. Isto não invalida o valor custom, mas muda a elasticidade de preço.

| Fornecedor | Categoria PME | Pricing público | Leitura para AiTiPro |
|---|---|---:|---|
| Cegid PHC GO | ERP cloud PME | Corporate EUR 38,36/mês; Advanced EUR 78,81/mês; Enterprise EUR 180/mês, valores equivalentes mensais em subscrição trienal sem IVA. | Anchor fortíssimo: PME vê ERP completo por <EUR 200/mês, mesmo que implementação/add-ons custem à parte. |
| Moloni | Faturação PT | Base EUR 6,49/mês anual; Flex EUR 10,90/mês anual; Pro EUR 15,90/mês anual. | Mostra tolerância baixa para software horizontal; não resolve operação Lloretrans. |
| Cegid Vendus | Faturação/POS PT | Base EUR 6,50/mês + IVA; Flex EUR 12,50/mês; Pro EUR 15/mês. | Mais um anchor psicológico baixo para PME. |
| InvoiceXpress | Faturação PT | Pricing PDF 2025/2026 com planos desde grátis/baixo custo até volumes altos; Capterra lista preço inicial EUR 6/mês. | Útil para demonstrar que factura/SAF-T é commodity. OCR + classificação + PHC Advanced é outro problema. |
| PlanningPME | Planeamento PME | Página PT mostra licenças desde EUR 6/mês e orçamento para integrações. | PME espera módulo de planeamento barato; integrações sob orçamento. |
| EasyFleet | Fleet management | Plano Advanced EUR 160 para small fleet 1-20, inclui API/manutenção/fuel/invoice reading. | Fleet SaaS PME fica em centenas/mês, não milhares, mas é produto standard. |
| Tachogram | Tacógrafo | EUR 3,99/motorista/mês. | Compliance/tacho é commodity por utilizador. |
| ManWinWin | CMMS PT | EUR 39/54/75 utilizador/mês; implementação EUR 1.890/2.700/3.590. | Melhor anchor PME para oficina: setup de milhares, não dezenas de milhares, quando é software standard. |
| Zaask programador | Serviços dev PT | EUR 10-45/hora publicado para programador. | PME conhece preços baixos de freelance; AiTiPro tem de justificar produto, risco e ownership, não horas. |

Fontes PME:

- Cegid PHC GO planos: https://phcsoftware.com/pt/phc-go/phc-go-planos/
- Moloni planos: https://www.moloni.pt/planos/
- Cegid Vendus preço: https://www.vendus.pt/ajuda/preco-vendus/
- InvoiceXpress pricing PDF: https://invoicexpress.com/wp-content/uploads/2025/07/pricing.pdf
- PlanningPME preços: https://www.planningpme.pt/precos.htm
- EasyFleet pricing: https://www.easyfleet.org/en-US/pricing
- Tachogram pricing: https://tachogram.com/en/pricing
- ManWinWin Professional: https://www.manwinwin.com/pt/manwinwin-professional-software-de-manutencao/
- Zaask programador: https://www.zaask.pt/quanto-custa/programador

## Concorrentes e comparáveis

| Fornecedor | Categoria | Modelo | Pricing público | Integração ERP Cegid pública | Leitura para Lloretrans |
|---|---|---|---|---|---|
| Frotcom | Fleet management / telematics | SaaS modular + hardware | Oficial não publica preço completo; G2 diz sem pricing publicado; TrustRadius lista Basic USD 15/mês; Frotcom UK mostra oferta promocional GBP 6/veículo/mês para tracking, não CANBus HGV. CANBus é add-on/quote. | Não encontrada. Frotcom publica API/back-office integration genérica. | Frotcom cobre tracking/fuel/CANBus, mas não substitui workflow PHC Advanced, OCR fornecedor, bolsa/comissões e oficina. |
| Webfleet (Bridgestone) | Fleet management / telematics | SaaS + hardware + serviços | Oficial quote/demo; fontes secundárias 2026 apontam USD 16-28/veículo/mês, mas deve ser tratado como “sob consulta”. | Não encontrada; integrações via PREMIUM.connect/API. | Forte em telematics e gestão frota; não cobre lógica Lloretrans de comissões/PHC Advanced/oficina. |
| EasyFleet | Fleet management | SaaS por fleet size | Página pública mostra plano Advanced EUR 160 para small fleet 1-20, com API, manutenção, fuel, AI invoice/fuel invoice reading. | Não encontrada. | Bom anchor para fleet SaaS barato; não inclui customização vertical/PT nem PHC Advanced. |
| TachoPlus | Tacógrafo / compliance | Software/licença | Sem pricing público encontrado na página de produto. | Não encontrada. | Produto vertical estreito; benchmark funcional, não pricing. |
| Tachogram | Tacógrafo / compliance | SaaS por motorista activo | EUR 3,99/motorista/mês; descontos 6/12 meses. | Não encontrada. | Mostra que compliance/tacho puro é commodity barato; não serve para justificar custom workflow. |
| Engibots | AI process automation PT | Project/managed automation | Sem pricing público. Publica ROI <12 meses, automação de invoice processing, integração ERP/CRM/apps. | Não encontrei PHC CS/PHC GO/PHC Advanced explícito; ERP genérico. | Concorrente mais próximo em “automação crítica + integração”; preço provavelmente project-based, não SaaS barato. |
| Visma AutoInvoice / Scan | E-invoicing/OCR | Serviço integrado ao ecossistema Visma | Pricing depende país/produto; docs públicas explicam OCR + controlo qualidade + entrega ao ERP. | Não PHC CS/PHC GO/PHC Advanced; ecossistema Visma. | Bom benchmark de AP automation, mas locked-in a stack Visma. |
| Pulpo / Pulpomatic | Fleet operations ES/LATAM | SaaS fleet management | SoftwareAdvice/GetApp listam starting USD 5/mês usage-based; fornecedor não dá detalhe enterprise público. | Não encontrada. | Ajuda a ancorar fleet SaaS horizontal; baixo preço não inclui custom PHC Advanced/Excel/comissões. |
| TIMOCOM | Bolsa de carga Europa | SaaS / licença mensal | Página PT não mostra preço; loja PL mostra oferta EUR 56,98/mês net num desconto vs EUR 189,90/mês, mais activação. | Não encontrada. | Bolsa externa para encontrar carga; não gere workflow interno, facturas e comissões Lloretrans. |
| Trans.eu | Bolsa de carga Europa | Subscrição | Página pública: subscription from EUR 136/mês para vehicle/load exchange; private freight exchange from EUR 240/mês net. | Não encontrada. | Preço de acesso a mercado, não substitui a operação interna. |
| Wtransnet | Bolsa de carga Iberia/Europa | Subscrição | Página lista planos/características, mas sem preço visível no HTML público capturado. | Não encontrada. | Muito relevante para Iberia; benchmark funcional, não pricing fechado. |
| Fleetio | Fleet maintenance | SaaS por plano/frota | Planos Essential/Professional/Premium; página actual anuncia packages mas não expõe preço directo no HTML capturado. | Não encontrada. | Referência forte para oficina/manutenção, mas sem PHC Advanced e sem adopção presencial de mecânicos. |
| Tractian | CMMS / predictive maintenance | SaaS quote + sensores | Pricing page pública, mas preço final via contacto/price match. | Não encontrada. | Enterprise CMMS; bom benchmark para “manutenção” como venda por valor, não por ecrãs. |
| ManWinWin | CMMS Portugal | SaaS por utilizador/mês | EUR 39/54/75 utilizador/mês; mínimo 2 utilizadores; implementação EUR 1.890/2.700/3.590; API no plano EUR 75. | Não encontrei PHC CS/PHC GO/PHC Advanced explícito na página. | Referência PT útil: CMMS puro pode custar EUR 78-150+/mês antes de implementação; API/integrações sobem plano. |

## Fontes concorrentes

- Frotcom API/back-office e módulos: https://www.frotcom.com/kit-digital-gestion-de-flotas
- Frotcom CANBus/driver coaching: https://info.frotcom.com/pt-br/features/driver-coaching
- Frotcom pricing não publicado: https://www.g2.com/products/frotcom/pricing
- Frotcom Basic USD 15/mês em TrustRadius: https://www.trustradius.com/products/frotcom/pricing
- Webfleet produto/API: https://www.webfleet.com/
- Webfleet pricing secundário 2026: https://softabase.com/pricing/webfleet
- EasyFleet pricing: https://www.easyfleet.org/en-US/pricing
- TachoPlus: https://www.tachoplus.com/en/software/
- Tachogram pricing: https://tachogram.com/en/pricing
- Engibots: https://engibots.com/en/
- Visma AutoInvoice integration guide: https://documentation.autoinvoice.visma.com/integration-guide/
- Pulpo/Pulpomatic SoftwareAdvice: https://www.softwareadvice.com/fleet-management/pulpomatic-profile/
- Pulpo/GetApp: https://www.getapp.com/operations-management-software/a/pulpomatic/pricing/
- TIMOCOM PT: https://www.timocom.pt/servi%C3%A7os/bolsa-de-cargas
- TIMOCOM oferta PL: https://sklep.timocom.pl/en/home-english/
- Trans.eu freight exchange: https://www.trans.eu/en/freight-exchange/
- Trans.eu price list: https://www.trans.eu/en/price-list/
- Wtransnet pricing page: https://www.wtransnet.com/en-en/freight-exchange/prices/
- Fleetio pricing packages: https://www.fleetio.com/pricing/pricing-packages
- Tractian pricing: https://tractian.com/en/pricing
- ManWinWin Professional: https://www.manwinwin.com/pt/manwinwin-professional-software-de-manutencao/

## PHC CS/PHC GO/PHC Advanced integration evidence

| Fonte | O que prova | O que não prova |
|---|---|---|
| PHC GO help center API limits | PHC GO tem limites/packs de pedidos API por plano; Advanced até 4 packs de 30.000, Enterprise com packs de 70.000. | Não prova que o grupo usa PHC GO; repo/proposta fala PHC Advanced. |
| PHC GO apresentação | PHC GO tem Basic/Full API e pedidos incluídos por plano. | Não prova compatibilidade com PHC CS/Advanced local. |
| Cegid PHC CS page | PHC CS tem gamas Corporate/Advanced/Enterprise e é personalizável. | Não dá preço nem API concreta. |
| Integradores públicos (eConnector, Aktionserver, SmartLinks, ERP Datalink) | Há mercado PT de integração PHC CS/PHC Advanced por parceiro. | Não substitui contacto com o integrador PHC Advanced do grupo. |

Fontes:

- PHC GO API limits: https://helpcenter.phcgo.net/PT/sug/ptxview.aspx?ptxid=18239
- PHC GO apresentação API: https://www.phc.pt/enews/ApresentacaoPHCGO.pdf
- Cegid PHC CS: https://phcsoftware.com/pt/cegid-phc-cs
- eConnector PHC CS: https://www.econnector.pt/
- Aktionserver PHC CS Advanced: https://aktionserver.winsig.pt/pt-pt/integracao-phc
- ERP Datalink para PHC CS/PHC Advanced: https://phc.erpdatalink.com/

## Comparáveis custom SaaS / enterprise

Não encontrei transacções públicas específicas “grupo português >1000 colaboradores comprou vertical SaaS custom em 2026 por EUR X”. Isto é normal: propostas B2B custom são privadas. A triangulação defensável é:

- Salary Guide 2026 Portugal: software developers EUR 30k-75k; tech leads/architects frequentemente EUR 60k-110k; IT Project Manager EUR 35k-70k. Fonte: Adecco Portugal Salary Guide 2026.
- Custom software 2026: projectos sérios SMB frequentemente USD 75k-250k; enterprise systems USD 300k-2M+. Fonte global, não PT: Aionys 2026 custom software guide.
- SaaS 2026: MVP custom com RBAC/multi-tenancy/integrations pode cair em USD 45k-120k; enterprise/AI SaaS USD 120k-300k+. Fonte: SSNTPL SaaS MVP Budget Planner 2026.
- SaaS development cost 2026: MVP USD 60k-120k, growth-ready USD 120k-250k, scale/enterprise USD 150k-450k+. Fonte: Azilen.

Fontes:

- Adecco Portugal Salary Guide 2026: https://www.adecco.com/pt-pt/-/media/project/adecco/adeccopt/pdfs/guia-salarial-2026-en.pdf
- Aionys custom software cost 2026: https://aionys.com/custom-software-development-cost-2026
- SSNTPL SaaS MVP Budget Planner 2026: https://ssntpl.com/wp-content/uploads/2026/04/ssntpl-saas-mvp-budget-planner.pdf
- Azilen SaaS development cost: https://www.azilen.com/learning/saas-development-cost/

## Taxas-hora PT 2026 — leitura operacional

Com base em salários PT 2026 e mercado de consultoria, uma proposta custom B2B que queira margem saudável não deve ser calculada abaixo destes anchors:

| Perfil | Salary guide PT 2026 | Custo loaded estimado | Taxa cliente defensável |
|---|---:|---:|---:|
| Senior software developer | EUR 50k-75k/ano | EUR 40-60/h | **EUR 70-100/h** |
| Software/solution architect | EUR 65k-110k/ano | EUR 55-90/h | **EUR 100-150/h** |
| PM / delivery lead | EUR 35k-70k/ano | EUR 30-55/h | **EUR 65-110/h** |

Usei EUR 50/h como custo interno no bottom-up, não como preço cliente. Se a AiTiPro se vender a preço cliente abaixo de EUR 70/h equivalente, está a competir como bodyshop, não como parceiro vertical.

## Síntese de mercado

- Para PME portuguesa, pricing de EUR 90k-150k só passa se for claramente transformação operacional multi-empresa, não “software”.
- A âncora real de PME é baixa: EUR 6-200/mês para software horizontal, centenas/mês para fleet, alguns milhares de implementação para CMMS/ERP standard.
- O argumento da AiTiPro tem de ser: “não estamos a vender Moloni/PHC GO/Fleetio; estamos a fechar fluxos órfãos entre Excel, papel, Frotcom, Logue Trans e PHC Advanced”.
- Fleet/telematics puro é barato por veículo, mas não resolve PHC Advanced, OCR fornecedor, comissões e adopção oficina.
- Bolsas de carga europeias custam dezenas/centenas por mês, mas vendem acesso a mercado, não workflow interno auditável.
- OCR/AP automation e RPA enterprise quase sempre são “request demo/contact sales”; o preço é dominado por integração ERP, validação e volumes.
- CMMS/oficina pode ser barato por utilizador se genérico, mas API, implementação e adopção sobem o TCO.
- Conclusão revista após CFO review: EUR 90k-150k é defensável para médio-grande/enterprise; para PME portuguesa, a zona comercial mais plausível para a reunião é Sprint 0 obrigatória EUR 5k-7k, Core EUR 14k-18k, PRO EUR 32k-45k e Enterprise faseado EUR 58k-85k apenas como roadmap.
