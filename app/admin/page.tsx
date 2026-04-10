import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import AdminPanelClient from "./AdminPanelClient";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  if (!isAdmin(session.user.email)) {
    redirect("/");
  }

  const pending = await prisma.manualDonation.findMany({
    where: { status: "PENDING" },
    include: {
      user: { select: { email: true } },
    },
    orderBy: { fecha: "asc" },
  });

  return (
    <main style={{ maxWidth: 1100, margin: "1.5rem auto", padding: "1rem", display: "grid", gap: 16 }}>
      <section
        style={{
          background: "rgba(255,255,255,0.18)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.24)",
          borderRadius: 16,
          padding: "1rem",
          color: "white",
        }}
      >
        <h1 style={{ marginTop: 0 }}>🛠️ Panel de Administración</h1>
        <p style={{ marginBottom: 0 }}>Supervisión de donaciones manuales y moderación del foro.</p>
      </section>

      <AdminPanelClient initialPending={pending as any} />
    </main>
  );
}
