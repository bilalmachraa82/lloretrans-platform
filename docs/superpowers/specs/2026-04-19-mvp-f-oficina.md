# Spec — MVP F · App Folha de Obra (Oficina · PWA mobile-first)

**Versão:** 1.0 · 2026-04-19
**Dependências de infra:** spec mestre 2026-04-19-platform-architecture.md
**Risco:** ALTO — adopção humana. Maior risco do portfólio. 1 mecânico a resistir arrasta os outros.
**Dados seed:** 360 folhas em 3 meses · 2 mecânicos · 1074 items · 332 fotos

## Dor

Mecânico preenche folha em papel. Administrativa da oficina relança manualmente em PHC. Duplicação total + zero audit trail na fonte + arquivo físico. Citação Clarice: *"alguma coisa que ajudasse nessa facilitação desse processo"*.

## Solução

**PWA mobile-first offline-first.** Mecânico regista no telemóvel em &lt; 3 min. Admin valida e exporta para PHC. UX tem de ser mais rápido que papel — se não for, morre.

### Não-negociáveis
- Botões mínimos 48px, fonts ≥ 16px (evita zoom iOS).
- Offline: rascunho em localStorage, sync quando online.
- Sem App Store — instalação via "Adicionar ao ecrã inicial".

## Fluxo multi-step

1. **Matrícula** — autocomplete do master `vehicles`.
2. **Serviço** — dropdown S1-S9 externos, L1-L8 internos, I0-I9 operações internas → carrega template de peças típicas.
3. **Items** — adicionar linhas: peça (código + descrição + qt + valor) ou mão-de-obra.
4. **Fotos** — 3 stages: before / detail / after · `<input capture>`.
5. **Assinatura** — canvas + `signature_pad` library · SVG path guardado.
6. **Revisão + submeter** — cria `work_order` em `submitted`.

## Estados

`draft` → `submitted` → `approved` / `rejected`
Reversíveis: rejeitar volta para `draft` com motivo.

## UX segundo perfil

- **Mecânico:** dashboard grande com botão "+ Nova folha" e últimas 10 folhas suas com estado.
- **Admin oficina:** lista de folhas `submitted` para validar + contagem por mecânico.
- Indicador online/offline no topo da app.

## Out of scope

- Gestão de stock (v2 · produto separado).
- Agendamento preventivo.
- Notificações push (v2).
- Assinatura qualificada eIDAS (v2 · interna chega para auditoria).
- IndexedDB + Background Sync (v2 · localStorage chega para MVP).

## Critérios de aceitação

- [ ] PWA instalável (manifest + SW cacheia shell).
- [ ] Formulário funciona em &lt; 3 min end-to-end num telemóvel.
- [ ] Rascunho sobrevive refresh em offline.
- [ ] Assinatura gravada como SVG path.
- [ ] Admin aprova → audit log + export disponível.
- [ ] Role `mecanico` só vê as suas folhas.
