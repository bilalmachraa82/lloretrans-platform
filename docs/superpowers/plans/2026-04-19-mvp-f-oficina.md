# Plan — MVP F · Oficina PWA

**Spec:** 2026-04-19-mvp-f-oficina.md
**Esforço prod:** 5-8 sem (mais alto por iteração UX com mecânicos)
**Esforço demo:** ~3h

## Fases

1. **PWA essentials (20 min)**: `manifest.json` + `sw.js` minimal (cache shell). Meta tags no root layout.
2. **Actions (30 min)**: submit, approve, reject, export. Audit em todas.
3. **List page (30 min)**: role-split (mecanico vê suas / admin vê submitted).
4. **Multi-step form (90 min)**: client component único com step state, localStorage para rascunho, signature canvas.
5. **Detail page (30 min)**: render items/fotos/assinatura, botões admin.
6. **Polish mobile (30 min)**: tamanhos, espaçamentos, indicador offline.

## Checklist

- [ ] Manifest + SW no public/
- [ ] Actions com audit
- [ ] UI mobile-first (44px+ touch targets)
- [ ] localStorage draft
- [ ] Assinatura SVG
- [ ] Permissões mecanico/admin_oficina
- [ ] PT-PT
