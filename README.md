# Lloretrans × AiTiPro — Plataforma dos 6 MVPs

**Demo live:** https://lloretrans.aitipro.com (Vercel fra1 · Neon Postgres EU)

Next.js 15 único com 6 módulos operacionais cobrindo os 6 fluxos do PRD 2026-04-19.
Todas as integrações externas (Logue Trans, Frotcom, PHC Advanced, cartões combustível) são stubs
que lêem de fixtures reais AITIPRO + dados demo complementares.

**Demo-mode flag:** `USE_LIVE_APIS=false` por default. Trocar adaptadores stub → live é simples
quando chegarem credenciais do cliente.

---

## Arranque local (2 minutos)

```bash
npm install
cp .env.example .env.local   # editar com DATABASE_URL do teu projecto Neon
npm run db:push              # aplica schema em Neon (idempotente)
npm run db:seed              # fixtures reais AITIPRO + dados demo complementares
npm run dev                  # arranca em http://localhost:3001
```

No login, escolhe um dos perfis pré-seeded. Cada role vê apenas os módulos que lhe interessam (`lib/auth/types.ts` → `MVP_ACCESS`).

---

## Os 6 MVPs

| Slug | MVP | URL | Propósito |
|------|-----|-----|-----------|
| km | A · Validação km | `/km` | Logue Trans × Frotcom · **tolerância 3 km** (verde ≤3 · amarelo ≤9 · vermelho) · bulk approve · audit |
| ocr | B · OCR Facturas | `/ocr` | **9 facturas reais** mapeadas (Würth, Policalço, Selcar, Popapneus, Prevrod, Carby/Dacia, Flexbor, SGP, Blinker) · regras aprendidas por fornecedor · export XML PHC Advanced |
| docs | C · Digitalização Central | `/docs` | Hub CMR + guias · associação automática à viagem · permissões cross-empresa (volume real: 4 000/mês) |
| fuel | D · Combustível | `/fuel` | Cepsa, Repsol, Radius Velocity + bomba interna · Frotcom API de leitura por confirmar · ranking L/100km · detecção de anomalias |
| bolsa | E · Bolsa de Carga | `/bolsa` | Fluxo auditado 5 estados · **comissões: 20% lucro + €2,50 nac / €5 intl (só carros Lloretrans)** · alertas deviation/atraso |
| oficina | F · Folha de Obra PWA | `/oficina` | **Telemóvel · offline** · 17-item checklist + substituição/verificação · assinatura canvas · export PHC Advanced |

`/admin` tem masters (viaturas, fornecedores, códigos), feature flags e audit log completo.

---

## Perfis de demo

| Papel | Utilizador | Vê |
|-------|-----------|----|
| Admin AiTiPro | Bilal Machraa | Tudo |
| Direcção | Clarice Santos | 6 MVPs (sem admin) |
| Comercial bolsa | Éder Monteiro · Miguel Ferreira | Só MVP E + as suas cargas |
| Admin oficina | Ana Almeida | OCR + Oficina (validação) |
| Admin faturação | Rita Pereira | km, Docs, Bolsa |
| Admin contas grupo | Sofia Coelho | OCR, Bolsa |
| Operadora digitalização | Marta Silva | Docs (ingestão) |
| Mecânico | João Oliveira · Pedro Reis | Oficina (só suas folhas) |
| Frutas do Oeste (consumo) | Patrícia Cardoso | Docs (só viagens com permissão `co_fdo`) |

---

## Script para a próxima reunião com a Clarice (20 min)

1. **Admin · evidência carregada.** Começa em `/admin`: mostra masters reais, famílias S1-S9/L1-L8/I0-I9 e fornecedores OCR. **Argumento:** a demo já está ancorada no evidence pack recebido, não em dados inventados.
2. **MVP E · Bolsa.** Abre `/bolsa` em tabela. Mostra as 306 cargas do Excel, R/NR, CMR, factura cliente, factura fornecedor e transportador. **Argumento:** substitui o Excel operacional sem mudar a lógica da equipa.
3. **MVP E · comissão.** Abre uma carga Lloretrans e o relatório `/bolsa/commissions`. Mostra a regra 20% lucro + €2,50 nacional / €5 internacional e explica a margem global negativa do Excel como pergunta em aberto. **Argumento:** não prometemos lucro automático; damos rastreio e cálculo auditável.
4. **MVP D · combustível.** Abre `/fuel`. Mostra Cepsa 1261 linhas, Repsol 175, Radius 96 e bomba interna 629. Explica que o ficheiro Frotcom recebido é mensalidade/equipamento; leitura API está pendente. **Argumento:** sinalização, não bloqueio.
5. **MVP B · OCR.** Mostra as 9 facturas reais já classificadas (Würth, Policalço, Selcar, Popapneus, Prevrod, Carby/Dacia, Flexbor, SGP-Global Parts, Blinker). Entra em Policalço ou Selcar — vê a regra aprendida por fornecedor já em memória. **Argumento:** o conhecimento tácito da administrativa passa a ser do sistema.
6. **MVP F · Oficina.** Abre `/oficina/new` como mecânico. Mostra o checklist de 17 itens da folha em papel e os códigos reais. **Argumento principal:** risco de adopção é real; piloto com 1 mecânico antes de alargar.
7. **Perguntas abertas.** Fecha com as 5 perguntas ao Éder: sentido de `PREÇO CLIENTE`/`PAGO TRANSPORTADOR`, bónus com lucro zero, tolerância combustível, contacto integrador PHC Advanced, cobertura da digitalização.

---

## Controlo pela Clarice (âncora não-negociável)

*"Não é só tempo, a nossa preocupação também que é o controle."*

Cada MVP foi desenhado para vender **controlo**, não tempo. O tempo é consequência. Nenhum MVP deixa a IA decidir sozinha — há sempre um humano a validar.

---

## O que é real e o que é simulado

| Dado / integração | Estado demo | Caminho prod |
|-------------------|-------------|--------------|
| **9 facturas reais Lloretrans** | ✓ extraídas em fixture (cache OCR) | Extracção controlada + armazenamento EU |
| 60 viaturas, 50 motoristas | Seed determinista PT (base real: 138 Lloretrans + frota grupo) | PHC Advanced master · integrador PHC Advanced por confirmar |
| Viagens Logue Trans | Seed com jitter realista | API Logue Trans (aguarda Hélio) |
| GPS Frotcom | Seed aligned com trips | Frotcom API |
| Abastecimentos Cepsa/Repsol/Radius/bomba interna | ✓ extraídos de ficheiros reais (2161 linhas) | APIs ou CSV mensal por fornecedor |
| Frotcom leitura operacional | ⏳ pendente — ficheiro recebido é mensalidade/equipamento | Pedir API de leitura à Frotcom |
| Export PHC Advanced | XML local download | Integrador PHC Advanced do grupo |
| Bolsa 306 cargas | ✓ extraídas do Excel real | Novas criadas via UI |
| Folhas oficina | Checklist real de 17 itens + demo seed | Criadas via PWA |

Flag `USE_LIVE_APIS=true` + credenciais no `.env` activa as implementações `live` dos adaptadores.

---

## Assunções críticas ainda por validar com o cliente

Actualizado 2026-04-20 com feedback do Éder (resposta ao questionário):

| # | Assunção | Estado | Fonte |
|---|----------|--------|-------|
| 1 | **API Logue Trans** existe e é lida | ✅ **Confirmada** — depende do dept. informática abrir acesso | Éder |
| 2 | **API Frotcom** (leitura) | ⏳ Éder pode pedir `API de Leitura` à Frotcom; acesso técnico ainda pendente | Éder |
| 3 | Cobertura Frotcom por viatura e campos disponíveis | ⏳ Por confirmar | pendente |
| 4 | Integrador PHC Advanced colabora (escrita B/E/F) | ⏳ Contacto ainda não enviado; demo opera em modo degradado (XML) | pendente |
| 5 | **Tabela códigos serviço** completa | ✅ **Recebida** — S1–S9 externos (cliente) · L1–L8 + I0–I9 internos | PDF Éder |
| 6 | **Base viaturas grupo (interna/externa)** | ✅ **Recebida** — Viaturas Grupo.xlsx + Relação Lloretrans.xlsx | Éder |
| 7 | **Margem km tolerável** | ✅ **3 km máximo** | Éder |
| 8 | **Volume digitalização** | ✅ **4 000 documentos/mês** (Éder escreveu “faturas” dentro do Fluxo 1: CMR/guias) | Éder |
| 9 | **Regras comissão comerciais** | ✅ **20% do lucro + €2,50 nacional · €5 internacional (só viaturas Lloretrans)** | Éder |
| 10 | **Versão Cegid confirmada** | ✅ **PHC Advanced** (não CS) | Éder |
| 11 | **Dispositivo mecânicos** | ✅ **Telemóvel** (confirma PWA mobile-first) | Éder |
| 12 | Ponto único de digitalização | ⏳ "Ainda por definir" | pendente |
| 13 | Média aceitável L/100 km e tolerância anomalias | ⏳ Éder não respondeu explicitamente | pendente |
| 14 | Mecânicos aceitam PWA (adopção) | ⏳ Risco de adopção nº 1 — piloto 1 mecânico | pendente |
| 15 | Baselines de tempo actual por fluxo | ⏳ Shadow session 2h pendente | pendente |

Lista completa na secção 8.5 do PRD.

---

## Arquitectura

- **Next.js 15** App Router + Server Components + Server Actions
- **Drizzle ORM** + **Neon Postgres** (EU Frankfurt · serverless com `@neondatabase/serverless`)
- **Tailwind + Radix primitives** + shadcn-style design tokens
- **Zod** em todas as fronteiras
- **PWA** só no módulo Oficina (`/oficina` · service worker scope isolado)

Estrutura:

```
app/
  (auth)/login/             role selector (demo)
  (platform)/               autenticado, sidebar + header
    page.tsx                dashboard com 6 KPIs
    km/  ocr/  docs/        MVPs A · B · C
    fuel/  bolsa/  oficina/ MVPs D · E · F
    admin/                  masters + audit + feature flags
db/
  schema.ts                 todas as tabelas (26) organizadas por secção
lib/
  auth/  audit/  integrations/   adapters com pattern stub/live
fixtures/
  real-invoices/            9 PDFs reais
  extracted/                catálogo JSON curado
docs/superpowers/
  specs/                    1 spec de arquitectura + 6 specs por MVP
  plans/                    6 planos de implementação
scripts/
  seed.ts                   dataset determinista
  extract-pdfs.ts           pipeline OCR (cache fixture)
```

---

## Comandos

```bash
npm run dev           # http://localhost:3001
npm run build         # Next.js build
npm run typecheck     # tsc --noEmit (passa)
npm run db:push       # drizzle-kit push (aplica schema em Neon)
npm run db:seed       # popula dados deterministas
npm run db:reset      # push + seed (full reset)
npm run pdf:extract   # re-extrair PDFs (fixtures)
npm run test          # smoke tests vitest
```

---

## Próximos passos (pós-demo)

1. Reunião técnica com Hélio (45 min) para desbloquear MVP A + C.
2. Shadow session com administrativa (2h) para baseline de tempo.
3. Contacto directo com integrador PHC Advanced (desbloqueia B + E + F · escrita).
4. Piloto MVP F com 1 mecânico (3 semanas) antes de alargar.
5. Provision Neon EU project + storage EU por definir (Azure Blob EU ou R2 EU) + Vercel deploy.

---

## RGPD · notas

- Dados em repouso: SQLite local (dev) · Neon EU (prod)
- Blobs: storage produção por definir (Azure Blob EU ou R2 EU). O repo ainda não inclui driver final de object storage; **não prometer Vercel Blob** sem confirmação de região/contrato.
- Credenciais só via `.env`, rotação trimestral documentada
- Audit log append-only — base para compliance RGPD
- Retenção configurável por tipo, alinhada com legislação PT (facturas 10 anos, CMR 5, uploads oficina 5)
- Direito ao esquecimento: anonimização (preserva audit), não apagamento

---

## Decisões de design não-óbvias

1. **Todas as rotas `(platform)` são `force-dynamic`** — necessário porque dependem de sessão + DB por request.
2. **better-sqlite3 em dev** dá zero-friction (`npm run db:reset` funciona sem Neon). Schema Drizzle traduz 1:1 para Postgres.
3. **Stub/Live adapter pattern** em `lib/integrations/*` permite correr offline. Trocar para prod = meter `USE_LIVE_APIS=true` + credenciais.
4. **PWA isolado a `/oficina`** — outros módulos são desktop-first para administrativa.
5. **Audit log append-only centralizado** — cada mutação em qualquer MVP passa por `lib/audit/audit()`. Facilita compliance e debugging.
6. **Fluxo auditado do MVP E em `lib/freight-state.ts`** — validação de transições antes de DB write. Evita estados inválidos.
7. **Fixtures OCR cacheadas** — PDFs reais são scans sem texto; OCR cache simula o comportamento prod (extracção cara · uma vez · cacheada).

---

## Licença

Código interno AiTiPro. Dados do cliente ao abrigo do NDA em negociação.
