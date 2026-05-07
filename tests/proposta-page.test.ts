import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const proposalRoutePath = path.join(process.cwd(), "app/proposta/page.tsx");

describe("commercial proposal route", () => {
  it("keeps a v6-aligned module pricing section for live sales conversations", () => {
    const page = fs.readFileSync(proposalRoutePath, "utf-8");

    [
      'id="modulos-precos"',
      "Detalhe por módulo",
      "Módulo A",
      "Módulo B",
      "Módulo C",
      "Módulo D",
      "Módulo E",
      "Módulo F",
      "A + C",
      "E + F",
      "€14.000",
      "€11.500",
      "€19.500",
      "€45.000",
      "€7.500",
      "sem cobrança hoje",
      "opção futura",
      "/proposta#modulos-precos",
    ].forEach((phrase) => {
      expect(page).toContain(phrase);
    });

    [
      "€8.000",
      "€10.000",
      "€12.000",
      "€18.000",
      "€30.000",
      "à vulso por ecrã",
    ].forEach((oldOrAmbiguousValue) => {
      expect(page).not.toContain(oldOrAmbiguousValue);
    });
  });
});
