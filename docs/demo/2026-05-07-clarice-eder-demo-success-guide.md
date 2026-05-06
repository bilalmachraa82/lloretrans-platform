# Guiao comercial - demo Clarice + Eder

Data: 2026-05-07, 11:00, Europe/Lisbon  
Objectivo: validar que a plataforma corresponde as expectativas antes de apresentar preco.  
Participantes esperados: Clarice Santos, Eder Monteiro, AiTiPro.

## Principio da reuniao

Esta reuniao nao deve parecer uma apresentacao de funcionalidades. Deve parecer uma conversa de validacao com o produto aberto.

Linha central:

> "Antes de falarmos de preco, quero confirmar convosco se isto corresponde ao que a operacao precisa: controlo, menos trabalho manual e decisoes auditaveis."

O sucesso da reuniao nao e mostrar tudo. E conseguir tres validacoes explicitas:

1. "Sim, estas sao as nossas dores."
2. "Sim, o caminho proposto faz sentido."
3. "Sim, vale a pena passar a proposta/preco e fechar o proximo passo tecnico."

## Boas praticas aplicadas

- Discovery primeiro: gastar os primeiros minutos a confirmar prioridades antes de abrir produto.
- Demo invertida: mostrar primeiro o resultado de maior valor, nao guardar o melhor para o fim.
- Produto em pequenas doses: mostrar o suficiente para provocar perguntas, nao todos os detalhes.
- Conversa com o produto visivel: alternar demonstracao curta com perguntas de confirmacao.
- Proximo passo combinado antes do fim: nao terminar com "depois falamos".

Fontes de referencia:

- Gong: demos vencedoras espelham o que foi descoberto antes, tem estrutura, comecam pelo valor e reservam tempo para proximos passos.
- HubSpot: confirmar entendimento antes de avancar e priorizar os temas grandes antes dos detalhes de processo.
- Nimitai: demos B2B SaaS de maior conversao usam estrutura discovery-first e terminam com proximo passo confirmado.

## Preparacao 30 minutos antes

Abrir e deixar pronto:

1. `http://localhost:3001/login?fresh=1`
2. Entrar como Clarice.
3. Abrir `/dashboard`.
4. Confirmar que `/km` abre com dados em 26/04/2026.
5. Abrir em tabs separadas:
   - `/dashboard`
   - `/bolsa`
   - `/bolsa/commissions`
   - `/km`
   - `/ocr`
   - `/docs`
   - `/fuel`
   - `/oficina/new`
   - `/apresentacao`
6. Ter o PDF da proposta fechado, so abrir depois da validacao.
7. Confirmar som, partilha de ecra, zoom do browser a 90-100%.
8. Fechar notificacoes, Slack, email e tabs irrelevantes.

Comandos tecnicos se algo falhar:

```bash
git status --short --branch
npm run dev -- -p 3001
curl -I http://localhost:3001/
```

Estado esperado:

- Branch `main`
- Sem alteracoes locais
- `origin/main` sincronizado
- App em `http://localhost:3001`

## Agenda recomendada - 60 minutos

| Hora | Bloco | Objectivo |
| --- | --- | --- |
| 11:00-11:04 | Abertura e contrato | Alinhar que primeiro se valida fit; preco so depois. |
| 11:04-11:12 | Discovery curta | Confirmar prioridades de Clarice e Eder. |
| 11:12-11:18 | Dashboard | Mostrar controlo global e modo validacao. |
| 11:18-11:30 | Bolsa de carga | Dar prioridade ao Eder: Excel, estados, margem, comissoes. |
| 11:30-11:40 | Km + combustivel | Mostrar controlo operacional e limites das integracoes. |
| 11:40-11:48 | OCR + documentos | Mostrar reducao de trabalho administrativo e decisao humana. |
| 11:48-11:53 | Oficina mobile | Mostrar facilidade para mecanico e risco de adopcao. |
| 11:53-11:57 | Validacao final | Obter sim/nao por modulo e prioridades. |
| 11:57-12:00 | Ponte para preco | So apresentar preco se houver alinhamento explicito. |

Se houver 75 minutos, usar os 15 minutos extra em perguntas e preco. Nao alongar a demo.

## Abertura exacta

> "Obrigado por estarem aqui. A minha proposta para esta reuniao e simples: antes de vos apresentar preco, quero validar se a plataforma representa bem aquilo que nos pediram e aquilo que os dados do Eder confirmaram. Se algo nao corresponder, prefiro que me digam agora, porque o objectivo nao e vender um ecran bonito; e resolver o controlo operacional da Lloretrans."

> "Vou mostrar primeiro o valor e a forma de trabalho. Depois, no fim, se fizer sentido para voces, passamos ao preco e ao proximo passo."

Pergunta de contrato:

> "No fim da demo, podemos fechar uma de tres conclusoes: corresponde e avancamos para proposta; corresponde parcialmente e ajustamos prioridades; ou nao corresponde e paramos. Parece-vos justo?"

## Discovery curta - perguntas obrigatorias

Fazer antes de abrir muitos ecras.

Para Clarice:

1. "Quando diz que a preocupacao nao e so tempo, mas controlo, onde sente hoje maior risco: facturacao, documentos, oficina, combustivel ou km?"
2. "Se daqui a 90 dias isto estiver a funcionar bem, o que deixou de acontecer na operacao?"
3. "Que decisao nunca deve ser automatica sem aprovacao humana?"

Para Eder:

1. "Na bolsa, o maior problema hoje e encontrar informacao, controlar estados, calcular margem/comissao ou evitar esquecimentos?"
2. "O Excel actual serve mais como registo, como controlo de pagamento ou como ferramenta diaria de trabalho?"
3. "A regra de comissao que recebemos esta correcta: 20% do lucro + 2,50 EUR nacional com carro Lloretrans + 5 EUR internacional com carro Lloretrans?"

Pergunta de priorizacao:

> "Se so pudessemos colocar tres modulos em piloto primeiro, quais teriam mais impacto imediato?"

## Ordem de demo recomendada

### 1. Dashboard - 5 minutos

Rota: `/dashboard`

Dizer:

> "Este e o ponto de entrada da Clarice: nao e uma lista de apps, e uma fila operacional. O importante e saber o que exige decisao hoje."

Mostrar:

- Banner "Demo validada"
- "Modo validacao"
- CTAs: validar excecoes, validar facturas, associar orfaos, ver ranking, abrir ciclo, validar folhas
- Actividade recente

Perguntar:

> "Este tipo de painel ajuda a Clarice a perceber onde esta o risco do dia, ou falta algum indicador que para si e indispensavel?"

Nao dizer:

- "Isto ja esta em producao."
- "As integracoes ja estao todas ligadas."

### 2. Bolsa de carga - 12 minutos

Rota: `/bolsa`, depois uma carga, depois `/bolsa/commissions`

Dizer:

> "Vou comecar pela bolsa porque e o modulo mais ligado ao Eder e ao Excel real. O objectivo nao e substituir o criterio comercial; e tirar o ciclo da memoria e do ficheiro solto."

Mostrar:

- Kanban por estado
- Botao "Tabela Excel" para mostrar continuidade com o processo actual
- Filtros por R/NR, transportador, cliente
- Uma carga concreta com CMR, factura cliente, factura fornecedor, margem
- Comissoes acumuladas

Dizer no ponto da margem:

> "Aqui ha uma validacao importante: quando o Excel historico traz preco cliente e valor pago ao transportador iguais, a plataforma nao inventa margem. Sinaliza que precisa de saneamento."

Perguntas:

1. "Estes estados fazem sentido para o vosso ciclo real?"
2. "Que estado falta: carga adjudicada, entregue, fornecedor facturado, cliente facturado, pago?"
3. "A forma como mostramos margem e comissao e suficientemente clara para o Eder validar mensalmente?"

Nao dizer:

- "A plataforma negoceia preco."
- "As comissoes ficam juridicamente fechadas sem validacao."

### 3. Km - 8 minutos

Rota: `/km`, depois abrir uma reconciliação.

Dizer:

> "Aqui estamos a responder a regra confirmada pelo Eder: maximo 3 km de tolerancia entre Logue Trans e GPS."

Mostrar:

- Data com dados
- Verde/amarelo/vermelho
- Linha amarela ou vermelha
- Detail: Logue Trans vs Frotcom
- Caixa "Como decidir"
- Historico/auditoria

Perguntas:

1. "A tolerancia de 3 km e mesmo a regra que querem operacionalizar?"
2. "Quem deve poder aprovar amarelas e vermelhas?"
3. "Que motivo e obrigatorio para aceitarem uma alteracao manual?"

Nao dizer:

- "A API Frotcom ja esta activa."
- "A plataforma decide sozinha."

### 4. Combustivel - 7 minutos

Rota: `/fuel`

Dizer:

> "Aqui fomos conservadores: carregamos Cepsa, Repsol, Radius e bomba interna. O ficheiro Frotcom recebido nao e leitura operacional por viatura, e isso esta assumido no ecran."

Mostrar:

- Fonte carregada e contagens
- Top anomalias
- Ranking por viatura
- Exportar relatorio mensal

Perguntas:

1. "Qual e hoje a media aceitavel por tipo de viatura?"
2. "Que desvio deve gerar alerta: 10%, 15%, outro?"
3. "Quem recebe o alerta e quem fecha a anomalia?"

Nao dizer:

- "Temos telemetria completa Frotcom."
- "Isto acusa motorista."

### 5. OCR facturas - 7 minutos

Rota: `/ocr`, depois abrir uma factura.

Dizer:

> "O objectivo aqui e proteger o conhecimento tacito: fornecedor, matricula, codigo de servico e aprovacao humana antes de PHC Advanced."

Mostrar:

- Estados: a extrair, a validar, aprovada, exportada
- Uma factura real
- Classificacao proposta
- Campo matricula/codigo de servico
- Confiança
- Origem do ficheiro
- Aprovar/exportar apenas apos decisao humana

Perguntas:

1. "A classificacao por fornecedor/NIF e o caminho certo?"
2. "Quem deve validar antes de PHC Advanced?"
3. "Que fornecedores devem ser prioridade no piloto?"

Nao dizer:

- "O OCR fica perfeito desde o primeiro dia."
- "Exportamos automaticamente para PHC Advanced sem aprovacao."

### 6. Documentos centrais - 5 minutos

Rota: `/docs`, depois um documento.

Dizer:

> "Este modulo organiza CMR, guias e tickets por viagem, matricula e empresa, para deixar de depender de papel disperso e mensagens soltas."

Mostrar:

- Total, associados, a associar
- Filtros por tipo, direccao, data
- Detalhe de documento
- Candidatos de viagem ou mensagem de recuperacao manual
- Permissoes por empresa

Perguntas:

1. "Quem deve ser o ponto unico de digitalizacao?"
2. "Que horario de cobertura e necessario?"
3. "Que empresas do grupo podem consultar que documentos?"

Nao dizer:

- "O volume de 4000 esta totalmente confirmado como CMR/guias."
- "Nao precisam de definir processo de digitalizacao."

### 7. Oficina mobile - 5 minutos

Rota: `/oficina/new`

Dizer:

> "Este e o modulo com maior risco de adopcao humana. Por isso a proposta correcta e piloto com um mecanico, no telemovel, antes de alargar."

Mostrar:

- Passos: Matricula, Intervencoes, Checklist, Itens, Fotos, Assinatura, Revisao
- Rascunho automatico
- Checklist adaptada a matricula/codigo
- Submissao para validacao administrativa

Perguntas:

1. "O mecanico consegue fazer isto no telemovel no contexto real?"
2. "Que campos da folha em papel sao obrigatorios e nao podem faltar?"
3. "Quem aprova antes de PHC Advanced?"

Nao dizer:

- "Isto substitui o mecanico."
- "A adopcao esta resolvida sem treino."

## Frases de transicao

Ao mudar de modulo:

> "Nao vou entrar em todos os detalhes tecnicos; quero validar se este fluxo corresponde ao vosso processo."

Quando houver pergunta tecnica:

> "Boa pergunta. Para a demo, isto esta em modo validacao com dados carregados. Em producao, esse ponto depende de [PHC Advanced/Frotcom/Logue Trans] e esta identificado como proximo passo tecnico."

Quando pedirem preco cedo:

> "Tenho o preco preparado. Antes de o mostrar, deixem-me so confirmar se estamos a precificar a solucao certa. Se o fit estiver errado, qualquer preco fica mal apresentado."

Quando algo nao estiver fechado:

> "Prefiro marcar isto como ponto aberto do que fingir que esta fechado. O valor da plataforma esta tambem em tornar estas dependencias explicitas."

## Validacao antes de preco

Antes de abrir proposta/preco, perguntar literalmente:

> "Antes de passar ao investimento, de 0 a 10, quanto e que isto corresponde ao que esperavam ver?"

Se resposta for 8-10:

> "Perfeito. Entao o que vou apresentar agora e o investimento para transformar este ambiente validado em piloto operacional."

Se resposta for 6-7:

> "O que falta para isto ser um 9? E funcionalidade, prioridade, integracao, ou forma de usar?"

Se resposta for abaixo de 6:

> "Entao faz mais sentido corrigirmos o escopo antes de discutir preco. Qual foi o desalinhamento principal?"

Perguntas finais por pessoa:

Para Clarice:

> "Como direccao, isto da-lhe mais controlo ou ainda falta algum ponto para confiar no piloto?"

Para Eder:

> "Na bolsa de carga, isto substitui o Excel como ferramenta diaria ou ainda falta algum campo/estado essencial?"

## Quando apresentar preco

So apresentar preco depois de obter pelo menos dois sinais:

1. Clarice confirma que o painel/controlo faz sentido.
2. Eder confirma que bolsa e comissoes representam o processo.
3. Ninguem levanta um bloqueio estrutural sobre PHC Advanced/Frotcom/Logue Trans.

Introducao ao preco:

> "O preco que vou mostrar nao e por ecran. E pelo caminho para passar de demonstracao validada para piloto operacional: integracoes, saneamento de dados, treino, validacao humana e arranque controlado."

Nao defender preco com ROI inventado. Usar antes:

- antes/depois operacional;
- riscos que desaparecem;
- tempo manual que deixa de ser dependencia de uma pessoa;
- controlo e auditabilidade.

## Objecoes provaveis e respostas

### "Isto ainda nao esta ligado ao PHC Advanced/Frotcom/Logue Trans."

Resposta:

> "Correcto. E foi intencional nao esconder isso. A demonstracao valida processo e valor com dados reais; a fase seguinte liga os sistemas com os acessos tecnicos certos. Assim evitamos vender uma integracao antes de confirmar o processo."

### "Temos medo que a equipa nao use."

Resposta:

> "Concordo, sobretudo na oficina. Por isso proponho piloto curto com poucos utilizadores, treino presencial e folha em papel como contingencia durante a transicao."

### "O Excel da bolsa tem nuances."

Resposta:

> "Exacto. Por isso mantivemos a vista tabela e nao escondemos as margens a zero. A plataforma nao deve inventar o historico; deve tornar claro o que precisa de saneamento."

### "E se o OCR errar?"

Resposta:

> "Vai errar em alguns casos. A diferenca e que agora o erro fica em fila de validacao, com confianca visivel, e cada correccao humana melhora a regra do fornecedor."

### "Combustivel sem Frotcom nao chega."

Resposta:

> "Para producao completa, concordo. Para o piloto, ja conseguimos consolidar fornecedores e sinalizar anomalias com os ficheiros recebidos. A leitura operacional Frotcom fica como dependencia tecnica identificada."

## Checklist de sucesso da reuniao

Sair da reuniao com:

- Prioridade dos 3 primeiros modulos para piloto.
- Dono tecnico para PHC Advanced.
- Dono tecnico para Frotcom.
- Confirmacao Logue Trans com informatica.
- Confirmacao da regra de comissoes.
- Confirmacao da tolerancia de combustivel.
- Decisao sobre piloto oficina.
- Proxima reuniao marcada ou autorizacao para envio de proposta final.

## Follow-up depois da reuniao

Enviar email no mesmo dia com:

1. Agradecimento.
2. Tres pontos que validaram.
3. Pontos abertos e donos.
4. Modulos prioritarios do piloto.
5. Proposta/preco em anexo se houve validacao.
6. Proximo passo com data.

Template:

> Ola Clarice e Eder,
>
> Obrigado pela reuniao de hoje. Pelo que validamos, a plataforma corresponde sobretudo a tres necessidades: controlo operacional centralizado, reducao de trabalho manual e decisoes auditaveis antes de PHC Advanced/Frotcom/Logue Trans.
>
> Ficaram como prioridades: [modulos].  
> Ficaram em aberto: [dependencias].  
> Proximo passo proposto: [data/acao].
>
> Envio em anexo a proposta para passarmos da demonstracao validada para piloto operacional.

## Regra de ouro

Se estiverem a acenar pouco ou calados, parar a demo e perguntar:

> "Isto esta a bater certo com o vosso processo real, ou estou a mostrar uma parte menos importante?"

Melhor descobrir desalinhamento aos 15 minutos do que apresentar preco aos 55 minutos sem validacao.
