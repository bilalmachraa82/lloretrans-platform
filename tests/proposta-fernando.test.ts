import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const proposalPath = path.join(
  process.cwd(),
  "audit/pricing/proposta-clarice-fernando.html",
);

describe("Fernando-aligned static proposal", () => {
  it("keeps the approved commercial values unchanged", () => {
    const proposal = fs.readFileSync(proposalPath, "utf-8");

    [
      "€ 45.000",
      "€ 900",
      "€ 14.000",
      "€ 25.500",
      "€ 3.500",
      "€ 4.000",
      "€ 11.500",
      "€ 6.500",
      "€ 10.500",
      "€ 9.000",
      "€ 7.500",
    ].forEach((value) => {
      expect(proposal).toContain(value);
    });
  });

  it("frames the commercial decision as an administration-ready phased investment", () => {
    const proposal = fs.readFileSync(proposalPath, "utf-8");

    [
      "Gatinhar",
      "Andar",
      "Correr",
      "custo acumulado",
      "payback",
      "poupança acumulada",
      "baseline",
      "break-even",
      "Administração",
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
    expect(proposal.match(/<svg/g)?.length ?? 0).toBeGreaterThanOrEqual(4);
    expect(proposal.match(/<polyline/g)?.length ?? 0).toBeGreaterThanOrEqual(8);
  });

  it("uses calculated break-even scenarios instead of forcing every chart to month 36", () => {
    const proposal = fs.readFileSync(proposalPath, "utf-8");

    expect(proposal).toContain(
      "Break-even = investimento inicial / (custo actual mensal validado - € 900/mês)",
    );
    expect(proposal).toContain("Cenário de trabalho a validar");
    expect(proposal).toContain("Break-even estimado");
    expect(proposal).toContain("Mês 12");
    expect(proposal).toContain("Mês 15");
    expect(proposal).toContain("Mês 18");
    expect(proposal).toContain("Mês 20");
    expect(proposal).toContain("Poupança 36m");
    expect(proposal.toLowerCase()).not.toContain("break-even m36");
    expect(proposal).not.toContain("Break-even em 36 meses se");
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
      "9 facturas reais",
      "2.161 abastecimentos reais",
      "306 cargas reais",
      "24 folhas seedadas",
    ].forEach((phrase) => {
      expect(proposal).toContain(phrase);
    });
  });
});
