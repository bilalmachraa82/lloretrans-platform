# Lloretrans · Script Comercial da Demo

**Objectivo:** mostrar controlo operacional com evidência real, sem prometer integrações ainda por confirmar.
**Ambiente:** `https://lloretrans.aitipro.com` ou local `http://localhost:3001`.
**Login recomendado:** Clarice para visão executiva; Bilal para Admin.

## Versão 5 minutos

1. `/admin` — evidência e masters.
   - Dizer: "Começo pelo que é verificável: ficheiros recebidos, códigos reais S1-S9/L1-L8/I0-I9, viaturas e fornecedores."
   - Não dizer: "Isto já está ligado ao PHC Advanced."

2. `/bolsa` — Excel real de cargas.
   - Dizer: "Aqui está o Excel operacional convertido em fluxo auditável: 306 cargas, R/NR, CMR, factura cliente, factura fornecedor e transportador."
   - Não dizer: "A plataforma decide preços ou negoceia."

3. `/bolsa/commissions` — comissão e pergunta de margem.
   - Dizer: "A regra carregada é 20% do lucro total + €2,50 nacional ou €5 internacional quando a carga usa viatura Lloretrans. Há uma pergunta crítica: confirmar se `PREÇO CLIENTE` e `PAGO TRANSPORTADOR` significam venda e custo, porque o Excel mostra margem global -€1.800."
   - Não dizer: "As comissões estão fechadas contratualmente."

4. `/fuel` — combustível por fornecedor.
   - Dizer: "Temos Cepsa 1261 linhas, Repsol 175, Radius 96 e bomba interna 629. O anexo Frotcom recebido é mensalidade/equipamento, não leitura operacional."
   - Não dizer: "Temos leitura live da Frotcom."

5. `/ocr` e `/oficina/new` — conhecimento tácito e adopção.
   - Dizer: "No OCR, as 9 facturas reais já mostram regras por fornecedor. Na oficina, o checklist vem da folha em papel; o risco principal é adopção humana, por isso o rollout começa com 1 mecânico."
   - Não dizer: "A app substitui os mecânicos ou decide sozinha."

## Versão 15 minutos

1. `/admin` · 2 min
   - Mostrar `Admin` → service codes, vehicles, suppliers.
   - Dizer: "Esta plataforma já pode ser apresentada porque deixou de depender de dados genéricos; está assente no pacote AITIPRO recebido."
   - Mostrar: famílias de códigos S1-S9 externos, L1-L8 internos, I0-I9 operações internas.

2. `/bolsa` · 4 min
   - Mostrar tabela, filtros R/NR, transportador e pesquisa.
   - Abrir uma carga com viatura Lloretrans.
   - Dizer: "O ganho não é a IA inventar preços; é rastrear estado, factura cliente, factura fornecedor e comissão no mesmo sítio."
   - Mostrar: CMR, factura cliente, factura fornecedor, margem, transportador.

3. `/bolsa/commissions` · 2 min
   - Mostrar regra: 20% lucro + €2,50 nacional / €5 internacional.
   - Dizer: "O cálculo está auditável, mas há duas confirmações antes de proposta fechada: sentido das colunas e bónus quando lucro é zero."

4. `/fuel` e `/fuel/[plate]` · 3 min
   - Mostrar evidence card dos fornecedores.
   - Abrir uma matrícula.
   - Dizer: "Isto é sinalização operacional. Não bloqueia cartão, não acusa motorista, não substitui investigação."
   - Não dizer: "A API Frotcom já está activa."

5. `/ocr` · 2 min
   - Mostrar catálogo das 9 facturas reais.
   - Dizer: "Cada correcção humana cria memória de fornecedor para reduzir dependência da pessoa que sabe classificar."

6. `/oficina/new` · 2 min
   - Mostrar fluxo mobile-first e checklist.
   - Dizer: "Este é o módulo com maior risco humano. A recomendação é piloto com 1 mecânico, treino presencial e fallback documentado."

## Perguntas abertas para o Éder

1. Confirmar sentido de `PREÇO CLIENTE` e `PAGO TRANSPORTADOR`.
2. Confirmar se bónus €2,50/€5 aplica mesmo quando lucro é zero.
3. Confirmar tolerância combustível.
4. Confirmar contacto integrador PHC Advanced.
5. Confirmar cobertura digitalização.
