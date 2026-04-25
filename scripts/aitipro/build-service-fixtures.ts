import fs from "node:fs";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "fixtures", "aitipro");

const serviceCodes = [
  { code: "S1", label: "Pneus", description: "Pneus, equilibragem, alinhamento (veículo cliente)", kind: "oficina_externa", source: "tabela_codigos" },
  { code: "S2", label: "Eletricista", description: "Reparação eléctrica (veículo cliente)", kind: "oficina_externa", source: "tabela_codigos" },
  { code: "S3", label: "Motores de Frio", description: "Compressores, gás, frio (veículo cliente)", kind: "oficina_externa", source: "tabela_codigos" },
  { code: "S4", label: "Batechapa / Pintura / Fibra", description: "Chapa, pintura, fibra (veículo cliente)", kind: "oficina_externa", source: "tabela_codigos" },
  { code: "S5", label: "Substituição de Vidros", description: "Vidros (veículo cliente)", kind: "oficina_externa", source: "tabela_codigos" },
  { code: "S6", label: "Eletrónica e Programação", description: "Diagnóstico, ECU, programação (veículo cliente)", kind: "oficina_externa", source: "tabela_codigos" },
  { code: "S7", label: "Retificação e Torneiras", description: "Rectificação mecânica (veículo cliente)", kind: "oficina_externa", source: "tabela_codigos" },
  { code: "S8", label: "Mecânica Geral", description: "Motor, transmissão, travões (veículo cliente)", kind: "oficina_externa", source: "tabela_codigos" },
  { code: "S9", label: "Inspeção", description: "Inspecção IPO (veículo cliente)", kind: "oficina_externa", source: "tabela_codigos" },
  { code: "L1", label: "Serviços de Pneus", description: "Pneus em viatura interna", kind: "oficina_interna", source: "tabela_codigos" },
  { code: "L2", label: "Serviços de Eletricista", description: "Eléctrica em viatura interna", kind: "oficina_interna", source: "tabela_codigos" },
  { code: "L3", label: "Serviços de Motores de Frio e Termógrafo", description: "Frio + termógrafo interno", kind: "oficina_interna", source: "tabela_codigos" },
  { code: "L4", label: "Serviços de Batechapa / Pintura / Fibra", description: "Chapa/pintura interna", kind: "oficina_interna", source: "tabela_codigos" },
  { code: "L5", label: "Substituição de Vidros", description: "Vidros em viatura interna", kind: "oficina_interna", source: "tabela_codigos" },
  { code: "L6", label: "Serviços de Retificação e Torneiras", description: "Rectificação mecânica interna", kind: "oficina_interna", source: "tabela_codigos" },
  { code: "L7", label: "Serviços de Mecânica Geral", description: "Mecânica geral interna", kind: "oficina_interna", source: "tabela_codigos" },
  { code: "L8", label: "Serviços de Eletrónica e Programação", description: "Electrónica/programação interna", kind: "oficina_interna", source: "tabela_codigos" },
  { code: "I0", label: "Renting - Serviço de Gestão", description: "Gestão renting frota", kind: "operacao_interna", source: "tabela_codigos" },
  { code: "I1", label: "Renting - Valor de Aluguer", description: "Aluguer mensal frota", kind: "operacao_interna", source: "tabela_codigos" },
  { code: "I2", label: "Aferições Tacógrafo", description: "Calibrações e aferições tacógrafo", kind: "operacao_interna", source: "tabela_codigos" },
  { code: "I3", label: "Outros Fluidos Interno", description: "AdBlue, líquidos, aditivos", kind: "operacao_interna", source: "tabela_codigos" },
  { code: "I4", label: "Serviços de Manutenções Externas", description: "Manutenções subcontratadas", kind: "operacao_interna", source: "tabela_codigos" },
  { code: "I5", label: "Serviços ISQ - ATP", description: "Certificação ISQ / ATP frio", kind: "operacao_interna", source: "tabela_codigos" },
  { code: "I6", label: "Serviços Assistência em Viagem", description: "Socorro em rota", kind: "operacao_interna", source: "tabela_codigos" },
  { code: "I7", label: "Serviços de Inspeções", description: "IPO frota interna", kind: "operacao_interna", source: "tabela_codigos" },
  { code: "I8", label: "Consumíveis Veículos", description: "Ferramentas, consumíveis gerais", kind: "operacao_interna", source: "tabela_codigos" },
  { code: "I9", label: "Serviços Específicos Ocasionais", description: "Catch-all fora da tabela", kind: "operacao_interna", source: "tabela_codigos" },
  { code: "C1", label: "Combustível", description: "Gasóleo, AdBlue, cartões frota", kind: "combustivel", source: "derived_demo" },
  { code: "T1", label: "Transporte / Frete", description: "Viagens Lloretrans + bolsa de carga", kind: "transporte", source: "derived_demo" },
];

const checklist = [
  "Alinhar direção",
  "Embraiagem",
  "Equilibrar rodas",
  "Filtro de ar",
  "Filtro de gasóleo",
  "Filtro de óleo",
  "Inspeção",
  "Lavagem",
  "Luzes",
  "Mudar óleo",
  "Revisão",
  "Serviço Pintura",
  "Sub. Correia distribuição",
  "Substituir Correias",
  "Suspensão",
  "Travões",
  "Velas",
];

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, "service-codes.json"), `${JSON.stringify(serviceCodes, null, 2)}\n`);
fs.writeFileSync(path.join(OUT_DIR, "workshop-checklist.json"), `${JSON.stringify(checklist, null, 2)}\n`);
console.log(`Wrote ${serviceCodes.length} service codes and ${checklist.length} workshop checklist items`);
