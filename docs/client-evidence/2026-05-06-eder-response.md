# Resposta do Eder - dados operacionais para os seis fluxos

Registo criado em 2026-05-06 a partir da mensagem fornecida pelo utilizador no Codex. Esta nota deve ser usada como evidencia de necessidade, dados recebidos e lacunas ainda por fechar antes de producao.

## Sintese executiva

| Fluxo | Necessidade confirmada | Dados recebidos | Lacunas de producao |
| --- | --- | --- | --- |
| 1 - Digitalizacao | Centralizar rececao de documentos, com volume elevado. | Amostras PDF/imagem de documentos. Volume indicado: 4000 faturas/mes. | Ponto unico de digitalizacao e horario ainda por definir. Confirmar se o volume inclui CMR/guias ou apenas faturas. |
| 2 - Validacao de km | Comparar km declarado Logue Trans com GPS Frotcom. | Regra de tolerancia: maximo 3 km de margem de erro. | Pedir API de leitura Frotcom. Validar API Logue Trans com departamento de informatica. |
| 3 - OCR de faturas | Ler faturas de oficina, classificar servicos e preparar PHC Advanced. | PDFs por fornecedor, codigos de servico e base mestre de matriculas em Excel. | Contacto do integrador PHC Advanced e versao exacta de ambiente ainda por fechar. Cliente indicou PHC Advanced noutro fluxo. |
| 4 - Combustivel | Consolidar bomba interna e cartoes externos. | Exportacoes da bomba interna e dos cartoes frota externos na pasta Combustivel. | Media aceitavel e intervalo de tolerancia para alertas ainda nao definidos. Ficheiro Frotcom recebido e mensalidade/equipamento, nao leitura operacional. |
| 5 - Bolsa de carga | Substituir Excel operacional e automatizar margem/comissoes. | Excel de trabalho, regra comercial: 20% do lucro total + 2,50 EUR nacional com carro Lloretrans + 5 EUR internacional com carro Lloretrans. | Lista completa de fornecedores/clientes recorrentes ainda por fechar. Confirmar saneamento de margens quando preco cliente e pago transportador chegam iguais. |
| 6 - Folha de obra | Transformar template em papel num fluxo movel para mecanico. | Template de folha de obra, dispositivo confirmado: telemovel, PHC Advanced. | Estrutura/pontos de integracao PHC Advanced e piloto de adocao na oficina. |

## Transcricao operacional fornecida

> Bom dia,
>
> Envio em anexo dados solicitados.
>
> Fluxo 1 - Digitalizacao
>
> Volume medio mensal de CMRs, guias de remessa e guias de recessao: 4000 faturas / Mes.
>
> Amostras PDF de cada tipo de documento: Em anexo.
>
> Ponto unico de digitalizacao e horario de cobertura pretendido: Ainda por definir.
>
> Fluxo 2 - Validacao de km
>
> API Frotcom: Posso pedir a Frotcom um API de Leitura.
>
> API Logue Trans: Sim e possivel - temos que ver com Departamento de informatica.
>
> Limite de tolerancia entre km declarado e km GPS: No maximo 3 km de margem de erro.
>
> Fluxo 3 - OCR de facturas
>
> 1 PDF por fornecedor de oficina recorrente: Em anexo.
>
> Tabela de codigos de servico: Em anexo.
>
> Base de dados mestre de matriculas: Em anexo EXCEL.
>
> Contacto do integrador PHC Advanced do grupo e versao do PHC CS actual: por responder.
>
> Fluxo 4 - Combustivel
>
> Exportacao-tipo da bomba interna: Pasta Combustivel.
>
> Exportacoes-tipo dos cartoes frota externos: Pasta Combustivel.
>
> Media actual aceitavel e intervalo de tolerancia para alertas: por responder.
>
> Fluxo 5 - Bolsa de carga
>
> Excel actualmente em uso: Em anexo.
>
> Regras de comissionamento: 20% do lucro total; 2,5 EUR por carga Nacional com carro Lloretrans; 5 EUR por carga Internacional com carro Lloretrans.
>
> Lista de fornecedores e clientes recorrentes: por responder.
>
> Fluxo 6 - Folha de obra
>
> Template actual em papel usado pelo mecanico: Em anexo.
>
> Dispositivos disponiveis: Telemovel.
>
> Modulo PHC Advanced de manutencao de frota em uso: PHC Advanced.

## Implicacoes para o MVP

- O prototipo deve comunicar sempre quando esta em modo validacao e quando depende de integracoes reais.
- A regra de 3 km e a decisao humana devem estar visiveis no modulo de km.
- O OCR e a digitalizacao devem mostrar a origem do ficheiro importado mesmo quando a pre-visualizacao completa do anexo nao esta disponivel.
- Combustivel nao deve prometer leitura Frotcom operacional com o ficheiro actual.
- Bolsa deve arrancar por estados/kanban para explicar o ciclo, mantendo tabela Excel como alternativa.
- Oficina deve ser apresentada como piloto movel para telemovel, com exportacao PHC Advanced apenas apos validacao administrativa.
