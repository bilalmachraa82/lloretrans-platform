import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const proposalPath = path.join(
  process.cwd(),
  "audit/pricing/proposta-clarice-fernando.html",
);
const printProposalPath = path.join(
  process.cwd(),
  "audit/pricing/proposta-clarice-fernando-print.html",
);

describe("Fernando-aligned static proposal", () => {
  it("keeps the approved commercial values unchanged", () => {
    const proposal = fs.readFileSync(proposalPath, "utf-8");

    [
      "€ 45.000",
      "€ 900",
      "€ 700",
      "€ 600",
      "€ 14.000",
      "€ 25.500",
      "€ 0",
      "€ 11.500",
      "€ 19.500",
      "€ 7.500",
      "€ 6.585",
      "€ 1.559",
      "€ 101.124",
      "€ 95.424",
      "€ 135.936",
    ].forEach((value) => {
      expect(proposal).toContain(value);
    });

    [
      "€ 3.500",
      "€ 4.000",
      "€ 6.500",
      "€ 10.500",
      "€ 9.000",
      "€ 32.400",
    ].forEach((oldValue) => {
      expect(proposal).not.toContain(oldValue);
    });
  });

  it("frames the commercial decision as an administration-ready phased investment", () => {
    const proposal = fs.readFileSync(proposalPath, "utf-8");

    [
      "Opção A · Núcleo de Validação",
      "Opção B · Núcleo Administrativo",
      "Opção C · Solução Completa",
      "custo acumulado",
      "retorno",
      "Diferença 36m",
      "custo actual",
      "break-even",
      "Sprint 0 sem custo",
    ].forEach((phrase) => {
      expect(proposal.toLowerCase()).toContain(phrase.toLowerCase());
    });
  });

  it("does not include internal sales coaching language", () => {
    const proposal = fs.readFileSync(proposalPath, "utf-8");

    [
      "Demo primeiro",
      "Primeiro valor percebido",
      "Depois preço",
      "Depois prioridade",
      "Ligar à Clarice",
      "Frase de abertura recomendada",
    ].forEach((phrase) => {
      expect(proposal.toLowerCase()).not.toContain(phrase.toLowerCase());
    });
  });

  it("renders explicit break-even line charts", () => {
    const proposal = fs.readFileSync(proposalPath, "utf-8");

    expect(proposal).toContain("break-even-chart");
    expect(proposal).toContain("Linha custo actual");
    expect(proposal).toContain("Linha nova solução");
    expect(proposal.match(/class="break-even-chart"/g)?.length ?? 0).toBe(1);
    expect(proposal.match(/<polyline/g)?.length ?? 0).toBe(2);
  });

  it("uses calculated break-even scenarios instead of forcing every chart to month 36", () => {
    const proposal = fs.readFileSync(proposalPath, "utf-8");

    expect(proposal).toContain(
      "Break-even = investimento inicial / (custo actual mensal - custo futuro mensal)",
    );
    expect(proposal).toContain("Estimativa a confirmar");
    expect(proposal).toContain("Break-even estimado");
    expect(proposal).toContain("Mês 9");
    expect(proposal).toContain("Diferença 36m");
    expect(proposal).toContain('points="58,238 145,205 232,173 319,140 406,107 493,74 580,42"');
    expect(proposal).toContain('points="58,201 145,193 232,185 319,178 406,170 493,162 580,154"');
    expect(proposal.toLowerCase()).not.toContain("break-even m36");
    expect(proposal).not.toContain("Break-even em 36 meses se");
  });

  it("shows monthly cost assumptions per block", () => {
    const proposal = fs.readFileSync(proposalPath, "utf-8");

    [
      "Custos mensais por bloco",
      "Custo HH de referência: € 15/h",
      "157 h · € 2.350 RH",
      "219 h · € 3.285 RH",
      "22 h · € 329 RH",
      "€ 6.585",
      "€ 1.559",
      "+€ 5.026",
      "Mês 6",
      "Mês 8",
      "Mês 9",
      "ROI +302%",
    ].forEach((phrase) => {
      expect(proposal).toContain(phrase);
    });
    expect(proposal).not.toContain("A confirmar*");
  });

  it("uses administration-friendly language instead of technical placeholders", () => {
    const proposal = fs.readFileSync(proposalPath, "utf-8");

    [
      "Baseline a validar",
      "baseline de trabalho",
      "Baseline actual",
      "Cenário de trabalho a validar",
      "custo carregado/hora",
      "seedadas",
      "threshold",
      "business case",
      "payback",
      "roadmap activo",
      "cashflow",
      "KPIs",
      "5+1",
      "v1.6",
      "Meta mínima mensal",
      "Gatinhar",
      "Andar",
      "Correr",
      "Frutas, Tomate e Cerejas",
      "As fases ficam comparáveis",
      "sem multiplicar gráficos",
      "A leitura financeira por fase é resumida",
      "A Administração vê",
      "sem perder a recomendação principal",
      "Esta tabela não atribui",
      "Define os dados",
      "modelo executivo",
      "Estes valores são estimativas de decisão",
    ].forEach((phrase) => {
      expect(proposal.toLowerCase()).not.toContain(phrase.toLowerCase());
    });

    expect(proposal).toContain("Custos actuais a confirmar");
    expect(proposal).toContain("Indicador a confirmar");
    expect(proposal).toContain("Opção futura");
  });

  it("is prepared as a formal standalone proposal", () => {
    const proposal = fs.readFileSync(proposalPath, "utf-8");

    expect(proposal).toContain("Referência LLO-2026-05-001");
    expect(proposal).toContain('src="data:image/png;base64,');
    expect(proposal).not.toContain('src="https://lloretrans.aitipro.com');
    expect(proposal).not.toContain("fonts.googleapis.com");
    expect(proposal).not.toContain("fonts.gstatic.com");
    expect(proposal).toContain('id="aceitacao"');
    expect(proposal).toContain("A Lloretrans aprova");
    expect(proposal).toContain("Nome / Cargo");
    expect(proposal).toContain("NIPC 509750460");
    expect(proposal).toContain("Bilal Machraa · AiTiPro");
    expect(proposal).not.toContain("NIPC a completar");
    expect(proposal).not.toContain("Morada fiscal");
    expect(proposal).not.toContain("capital social a completar");
    expect(proposal).not.toContain("CRC se aplicável");
  });

  it("keeps optional module D separated from the recommended total", () => {
    const proposal = fs.readFileSync(proposalPath, "utf-8");

    const moduleDIndex = proposal.indexOf("Módulo D</strong> <em>(opção futura, sem cobrança hoje)</em>");
    const totalIndex = proposal.indexOf("Total recomendado</strong>");

    expect(moduleDIndex).toBeGreaterThan(-1);
    expect(totalIndex).toBeGreaterThan(-1);
    expect(moduleDIndex).toBeLessThan(totalIndex);
    expect(proposal).toContain("€ 0 hoje");
    expect(proposal).toContain("Investimento total se o Módulo D for activado no futuro: € 52.500");
  });

  it("shows the implementation plan as a visual gantt instead of a coloured dot list", () => {
    const proposal = fs.readFileSync(proposalPath, "utf-8");

    expect(proposal).toContain("gantt-chart");
    expect(proposal).toContain("Semana 1");
    expect(proposal).toContain("14 semanas até operação completa");
    expect(proposal).toContain("Semanas 2-3");
    expect(proposal).toContain("Semanas 11-14");
    expect(proposal).toContain("Validação");
    expect(proposal).toContain("Operação");
    expect(proposal).not.toContain("tl-row");
    expect(proposal).not.toContain("dot orange");
  });

  it("keeps all six operational modules and the real proof points", () => {
    const proposal = fs.readFileSync(proposalPath, "utf-8");

    [
      "Módulo A",
      "Módulo B",
      "Módulo C",
      "Módulo D",
      "Módulo E",
      "Módulo F",
      "160 viagens",
      "92,4%",
      "2.161 abastecimentos reais",
      "306 cargas reais",
      "24 folhas",
    ].forEach((phrase) => {
      expect(proposal).toContain(phrase);
    });
  });

  it("keeps the PDF-specific proposal page controlled and client-facing", () => {
    const proposal = fs.readFileSync(printProposalPath, "utf-8");

    [
      "Proposta Comercial · Lloretrans × AiTiPro · PDF",
      "Sprint 0 oferecida",
      "€ 45.000",
      "€ 600 a € 900/mês",
      "14 semanas",
      "Mês 9",
      "€ 95.424",
      "€ 135.936",
      "A Lloretrans aprova",
      "page-break-after: always",
      "@page { size: A4; margin: 0; }",
    ].forEach((phrase) => {
      expect(proposal).toContain(phrase);
    });

    [
      "A confirmar*",
      "go-live",
      "Demo primeiro",
      "Primeiro valor percebido",
      "Depois preço",
      "Gatinhar",
      "Andar",
      "Correr",
      "NIPC a completar",
      "Morada fiscal",
      "capital social",
      "CRC se aplicável",
    ].forEach((phrase) => {
      expect(proposal.toLowerCase()).not.toContain(phrase.toLowerCase());
    });
  });
});
