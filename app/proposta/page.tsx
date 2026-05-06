import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";

export const metadata = {
  title: "Proposta — Lloretrans × AiTiPro",
  description:
    "Documento comercial restrito. A proposta formal é entregue em PDF após validação executiva da plataforma.",
  robots: { index: false, follow: false },
};

export default async function PropostaPage() {
  await requireRole(["admin"]);
  redirect("/apresentacao");
}
