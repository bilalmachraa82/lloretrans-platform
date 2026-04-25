import { describe, expect, it } from "vitest";
import { WORKSHOP_CHECKLIST, filterChecklistForService } from "@/lib/workshop-checklist";

describe("workshop real codes", () => {
  it("keeps exactly the 17 paper checklist items", () => {
    expect(WORKSHOP_CHECKLIST).toHaveLength(17);
    expect(WORKSHOP_CHECKLIST.map((item) => item.label)).toContain("Travões");
    expect(WORKSHOP_CHECKLIST.map((item) => item.label)).toContain("Velas");
  });

  it("does not depend on obsolete S17", () => {
    const labels = filterChecklistForService("L7").map((item) => item.label);
    expect(labels).toContain("Travões");
    expect(labels).toContain("Suspensão");
  });
});
