"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  endpoint: string;
  label: string;
};

export default function AdminDeleteButton({ endpoint, label }: Props) {
  const router = useRouter();

  const onDelete = async () => {
    const ok = window.confirm(`¿Seguro que quieres eliminar ${label}?`);
    if (!ok) return;

    const res = await fetch(endpoint, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      alert(body.error || "No se pudo eliminar");
      return;
    }

    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={onDelete}
      title={`Eliminar ${label}`}
      aria-label={`Eliminar ${label}`}
      style={{
        border: "none",
        background: "transparent",
        color: "#dc2626",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      <Trash2 size={16} />
    </button>
  );
}
