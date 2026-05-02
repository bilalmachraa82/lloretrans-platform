export function formatServiceLabel(label: string): string {
  return label
    .replaceAll("Eletricista", "Electricista")
    .replaceAll("Eletrónica", "Electrónica")
    .replaceAll("Retificação", "Rectificação")
    .replaceAll("Inspeção", "Inspecção")
    .replaceAll("Inspeções", "Inspecções");
}
