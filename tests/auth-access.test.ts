import { describe, expect, it } from "vitest";
import { MVP_ACCESS, canAccessMvp, canAssignRole, isSuperAdminRole } from "@/lib/auth/types";

describe("auth access model", () => {
  it("gives Clarice the same module visibility as the super admin", () => {
    expect(MVP_ACCESS.clarice).toEqual(MVP_ACCESS.admin);
    expect(canAccessMvp("clarice", "admin")).toBe(true);
    expect(isSuperAdminRole("clarice")).toBe(true);
  });

  it("keeps delegated profiles limited to their operational modules", () => {
    expect(canAccessMvp("admin_oficina", "oficina")).toBe(true);
    expect(canAccessMvp("admin_oficina", "admin")).toBe(false);
    expect(canAccessMvp("comercial", "admin")).toBe(false);
  });

  it("lets Clarice manage delegated profiles without granting the internal admin profile", () => {
    expect(canAssignRole("clarice", "admin_faturacao")).toBe(true);
    expect(canAssignRole("clarice", "comercial")).toBe(true);
    expect(canAssignRole("clarice", "admin")).toBe(false);
    expect(canAssignRole("comercial", "admin_faturacao")).toBe(false);
  });
});
