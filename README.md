# Lloretrans x AiTiPro

Plataforma operacional Next.js 15 para os seis fluxos Lloretrans: quilómetros, facturas de fornecedor, documentos, combustível, bolsa de carga e oficina.

**Ambiente publicado:** https://lloretrans.aitipro.com

## Arranque Local

```bash
npm install
cp .env.example .env.local
npm run db:push
npm run db:seed
npm run dev
```

O login usa perfis pré-configurados. Cada perfil vê apenas os módulos da sua área, definidos em `lib/auth/types.ts`.

## Módulos

| Área | URL | Propósito |
| --- | --- | --- |
| A · Validação de km | `/km` | Logue Trans x Frotcom, tolerância de 3 km, aprovação em lote e registo de decisão. |
| B · Facturas de fornecedor | `/ocr` | 9 facturas reais, classificação por fornecedor e preparação de exportação PHC Advanced. |
| C · Documentos centrais | `/docs` | CMR, guias e tickets com associação a viagem e permissões por empresa. |
| D · Combustível | `/fuel` | Cepsa, Repsol, Radius e bomba interna, com leitura de bordo em validação técnica. |
| E · Bolsa de carga | `/bolsa` | 306 cargas reais, estados, R/NR, facturação e comissões. |
| F · Oficina | `/oficina` | Folha de obra móvel com checklist, estados, fotos, assinatura e validação administrativa. |

`/admin` contém dados mestres, utilizadores, parâmetros operacionais e registo de auditoria.

## Perfis

| Papel | Utilizador | Acesso |
| --- | --- | --- |
| Direcção | Clarice Santos | Seis módulos operacionais |
| Comercial bolsa | Éder Monteiro · Miguel Ferreira | Bolsa de carga |
| Administrativa oficina | Ana Almeida | Facturas + oficina |
| Administrativa facturação | Rita Pereira | Quilómetros, documentos e bolsa |
| Contas grupo | Sofia Coelho | Facturas e bolsa |
| Digitalização | Marta Silva | Documentos centrais |
| Mecânico | João Oliveira · Pedro Reis | Folhas de obra próprias |
| Frutas do Oeste | Patrícia Cardoso | Documentos autorizados |

## Roteiro de Demonstração

1. Abrir `/dashboard` com Clarice: visão consolidada dos seis módulos.
2. Abrir `/km`: mostrar semáforo, threshold de 3 km e motivo obrigatório em correcções críticas.
3. Abrir `/ocr`: mostrar facturas reais, confiança, regra por fornecedor e aprovação humana.
4. Abrir `/docs`: mostrar CMR/guias/tickets, associação e permissões Frutas do Oeste.
5. Abrir `/fuel`: mostrar abastecimentos reais e leitura de bordo em validação técnica.
6. Abrir `/bolsa`: mostrar 306 cargas reais, estados, margem e comissões.
7. Abrir `/oficina/new`: criar folha com tipo de viatura, códigos múltiplos e checklist condicionada.

## Controlo

Frase de referência da Clarice:

> "Não é só tempo, a nossa preocupação também que é o controle."

O desenho de cada módulo mantém decisão humana em todos os passos irreversíveis. A plataforma prepara, classifica e sinaliza; a pessoa aprova; o sistema regista.

## Estado Dos Dados

| Dado / integração | Estado actual | Caminho de produção |
| --- | --- | --- |
| Facturas reais | 9 facturas carregadas e classificadas | Extracção controlada e validação humana. |
| Viaturas e motoristas | Base Lloretrans/grupo carregada | Master PHC Advanced e confirmação Frotcom. |
| Viagens Logue Trans | Cenário operacional para validação | API Logue Trans com acesso técnico do cliente. |
| GPS / Frotcom | Leituras alinhadas para demonstração | API Frotcom de leitura. |
| Abastecimentos | 2.161 linhas reais agregadas | API ou ficheiro recorrente por fornecedor. |
| Bolsa de carga | 306 cargas reais convertidas do Excel | Novas cargas criadas e auditadas na plataforma. |
| Oficina | Checklist real e códigos de serviço carregados | Piloto com um mecânico antes de alargar. |

`USE_LIVE_APIS=true` activa integrações reais quando as credenciais forem confirmadas.

## Assunções A Validar

| # | Assunção | Estado |
| --- | --- | --- |
| 1 | API Logue Trans | Confirmada, dependente de acesso técnico. |
| 2 | API Frotcom de leitura | Por confirmar com Frotcom. |
| 3 | Integrador PHC Advanced | Contacto técnico ainda necessário. |
| 4 | Volume documental | 4.000 documentos/mês, a confirmar se inclui facturas ou CMR/guias. |
| 5 | Comissões | 20% do lucro + 2,50 EUR nacional / 5 EUR internacional em viatura Lloretrans. |
| 6 | Adopção oficina | Risco principal do módulo F; piloto recomendado. |
| 7 | Baselines de ROI | Sessão de observação administrativa ainda necessária. |

## Arquitectura

- Next.js 15 App Router, Server Components e Server Actions.
- Drizzle ORM com Postgres.
- Validação Zod nas fronteiras de entrada.
- Registo de auditoria centralizado em todas as mutações relevantes.
- Componentes Tailwind/Radix com tokens próprios.
- Adaptadores de integração em `lib/integrations/*`.

Estrutura principal:

```text
app/
  (auth)/login/
  (platform)/
    dashboard/
    km/ ocr/ docs/ fuel/ bolsa/ oficina/
    admin/
db/
  schema.ts
lib/
  auth/ audit/ integrations/
fixtures/
  aitipro/ extracted/ real-invoices/
docs/superpowers/
  specs/ plans/
scripts/
  seed.ts
```

## Comandos

```bash
npm run dev
npm run build
npm run typecheck
npm run lint
npm run test
npm run db:push
npm run db:seed
npm run db:reset
```

## Próximos Passos Técnicos

1. Reunião técnica com Hélio para acessos Logue Trans.
2. Contacto com responsável PHC Advanced interno.
3. Confirmação Frotcom para leitura operacional.
4. Sessão de observação com facturação e Éder para baseline.
5. Piloto da oficina com um mecânico.

## RGPD

- Dados operacionais em base de dados na União Europeia.
- Credenciais apenas por variáveis de ambiente.
- Registo de auditoria preservado.
- Retenção configurável por tipo de documento.
- Anonimização quando aplicável, preservando evidência de auditoria.
