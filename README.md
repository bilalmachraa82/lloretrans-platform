# Lloretrans × AiTiPro — Plataforma dos 6 MVPs

**Demo live:** https://lloretrans.aitipro.com (Vercel fra1 · Neon Postgres EU)

Next.js 15 único com 6 módulos operacionais cobrindo os 6 fluxos do PRD 2026-04-19.
Todas as integrações externas (Logue Trans, Frotcom, PHC, cartões combustível) são stubs
que lêem de dados sintéticos + 9 facturas reais da Lloretrans.

**Demo-mode flag:** `USE_LIVE_APIS=false` por default. Trocar adaptadores stub → live é simples
quando chegarem credenciais do cliente.

---

## Arranque local (2 minutos)

```bash
npm install
cp .env.example .env.local   # editar com DATABASE_URL do teu projecto Neon
npm run db:push              # aplica schema em Neon (idempotente)
npm run db:seed              # dataset determinista (2243 viagens, 189 facturas, ...)
npm run dev                  # arranca em http://localhost:3001
```

No login, escolhe um dos 12 perfis pré-seeded. Cada role vê apenas os módulos que lhe
interessam (`lib/auth/types.ts` → `MVP_ACCESS`).

No login, escolhe um dos perfis pré-seeded. Cada role vê apenas os módulos que lhe interessam (`lib/auth/types.ts` → `MVP_ACCESS`).

---

## Os 6 MVPs

| Slug | MVP | URL | Propósito |
|------|-----|-----|-----------|
| km | A · Validação km | `/km` | Logue Trans × Frotcom · **tolerância 3 km** (verde ≤3 · amarelo ≤9 · vermelho) · bulk approve · audit |
| ocr | B · OCR Facturas | `/ocr` | **9 facturas reais** mapeadas (Würth, Policalço, Selcar, Popapneus, Prevrod, Carby/Dacia, Flexbor, SGP, Blinker) · regras aprendidas por fornecedor · export XML PHC Advanced |
| docs | C · Digitalização Central | `/docs` | Hub CMR + guias · associação automática à viagem · permissões cross-empresa (volume real: 4 000/mês) |
| fuel | D · Combustível | `/fuel` | CANBUS × cartões (Cepsa, Repsol, Radius Velocity) + bomba interna · ranking L/100km · detecção de anomalias |
| bolsa | E · Bolsa de Carga | `/bolsa` | State machine 5 estados · **comissões: 20% lucro + €2,50 nac / €5 intl (só carros Lloretrans)** · alertas deviation/atraso |
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

1. **Entra como Clarice.** Dashboard mostra os 6 KPIs — liga cada um a uma dor conhecida da reunião.
2. **Abre MVP B · OCR.** Mostra as 9 facturas reais já classificadas (Moeve Pro, Policalço, Selcar, etc.). Entra em Selcar — vê a regra aprendida "Selcar = sistemas de frio" já em memória. Altera código → novo rule criado → próxima Selcar classifica-se sozinha. **Argumento:** o conhecimento tácito da administrativa passa a ser do sistema.
3. **MVP A · km.** Filtra verdes → clica "Aprovar todas" → audit log regista. Abre uma amarela → mostra o valor GPS proposto → aceita com 1 clique. **Argumento:** tempo que era manual + risco de passar erros para facturação, eliminado.
4. **MVP E · Bolsa.** Vista kanban. Abre uma carga em deviation_detected → mostra alerta factura fornecedor. Vai a `/bolsa/commissions` → vê comissão calculada sem Excel. **Argumento:** substitui o Excel de 1000 linhas e protege os comerciais de erros de cruzamento.
5. **MVP F · Oficina.** Abre `/oficina/new` como mecânico. Mostra que em 6 toques e 2 min a folha está submetida. **Argumento principal:** risco de adopção é real — apresenta o processo honesto de piloto com 1 mecânico antes de alargar.
6. **Admin · Audit log.** Scroll. Cada click é rastreável. **Argumento:** RGPD e auditoria operacional sem esforço extra.

---

## Controlo pela Clarice (âncora não-negociável)

*"Não é só tempo, a nossa preocupação também que é o controle."*

Cada MVP foi desenhado para vender **controlo**, não tempo. O tempo é consequência. Nenhum MVP deixa a IA decidir sozinha — há sempre um humano a validar.

---

## O que é real e o que é simulado

| Dado / integração | Estado demo | Caminho prod |
|-------------------|-------------|--------------|
| **9 facturas reais Lloretrans** | ✓ extraídas em fixture (cache OCR) | Azure Document Intelligence EU region |
| 60 viaturas, 50 motoristas | Seed determinista PT (base real: 138 Lloretrans + frota grupo) | PHC Advanced master · integrador PHC por confirmar |
| Viagens Logue Trans | Seed com jitter realista | API Logue Trans (aguarda Hélio) |
| GPS Frotcom | Seed aligned com trips | Frotcom API |
| Abastecimentos SEPSA/Repsol/Anamor | Seed | APIs ou CSV mensal |
| CANBUS | Seed | Frotcom (confirmar plano inclui CANBUS) |
| PHC export | XML local download | Integrador PHC do grupo |
| Bolsa 240 cargas | Seed determinista | Novas criadas via UI |
| Folhas oficina 360 | Seed | Criadas via PWA |

Flag `USE_LIVE_APIS=true` + credenciais no `.env` activa as implementações `live` dos adaptadores.

---

## Assunções críticas ainda por validar com o cliente

Actualizado 2026-04-20 com feedback do Éder (resposta ao questionário):

| # | Assunção | Estado | Fonte |
|---|----------|--------|-------|
| 1 | **API Logue Trans** existe e é lida | ✅ **Confirmada** — depende do dept. informática abrir acesso | Éder |
| 2 | **API Frotcom** (leitura) | ✅ **Confirmada** — Éder pode pedir `API de Leitura` à Frotcom | Éder |
| 3 | Plano Frotcom inclui CANBUS em **toda** a frota | ⏳ Por confirmar | pendente |
| 4 | Integrador PHC colabora (escrita B/E/F) | ⏳ Contacto ainda não enviado; demo opera em modo degradado (XML) | pendente |
| 5 | **Tabela códigos serviço** completa | ✅ **Recebida** — S1–S9 externos (cliente) · L1–L8 + I0–I9 internos | PDF Éder |
| 6 | **Base viaturas grupo (interna/externa)** | ✅ **Recebida** — Viaturas Grupo.xlsx + Relação Lloretrans.xlsx | Éder |
| 7 | **Margem km tolerável** | ✅ **3 km máximo** (era 10 km no seed inicial) | Éder |
| 8 | **Volume digitalização** | ✅ **4 000 facturas/mês** | Éder |
| 9 | **Regras comissão comerciais** | ✅ **20% do lucro + €2,50 nacional · €5 internacional (só viaturas Lloretrans)** | Éder |
| 10 | **Versão PHC** | ✅ **PHC Advanced** (não CS) | Éder |
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
3. Contacto directo com integrador PHC (desbloqueia B + E + F · escrita).
4. Piloto MVP F com 1 mecânico (3 semanas) antes de alargar.
5. Provision Neon EU project + Azure Blob EU + Vercel deploy.

---

## RGPD · notas

- Dados em repouso: SQLite local (dev) · Neon EU (prod)
- Blobs: Azure Blob Storage EU (prod) — **não Vercel Blob** (sem região UE garantida)
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
6. **State machine do MVP E em `lib/freight-state.ts`** — validação de transições antes de DB write. Evita estados inválidos.
7. **Fixtures OCR cacheadas** — PDFs reais são scans sem texto; OCR cache simula o comportamento prod (extracção cara · uma vez · cacheada).

---

## Licença

Código interno AiTiPro. Dados do cliente ao abrigo do NDA em negociação.
