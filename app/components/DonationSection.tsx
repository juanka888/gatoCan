"use client";

import React, { useState, useMemo } from "react";
import { Copy } from "lucide-react";

// --- INTERFACES ---
interface Gato {
  id: string | number;
  nombre: string;
  imagen: string;
}

interface DonationOption {
  id: string;
  label: string;
  icon: string;
  iconClassName: string;
  price: number;
  color: string; 
}

interface DonationSectionProps {
  gatosColonia: Gato[];
  handlePayment: (title: string, amount: number) => void;
  cardStyle: React.CSSProperties;
}

// --- CONFIGURACIÓN DE OPCIONES (Karma 1:1) ---
const donationOptions: DonationOption[] = [
  { id: "macho", label: "Esterilización macho", icon: "➕", iconClassName: "macho", price: 60, color: "#e3f2fd" },
  { id: "hembra", label: "Esterilización femenina", icon: "♀️", iconClassName: "hembra", price: 100, color: "#f3e5f5" },
  { id: "comida", label: "Comida mensual", icon: "🍴", iconClassName: "food", price: 10, color: "#e8f5e9" },
  { id: "pipeta", label: "Pipeta antiparasitaria", icon: "💊", iconClassName: "bug", price: 12, color: "#fff3e0" },
  { id: "apadrinar", label: "Apadrina este gato", icon: "💗", iconClassName: "heart", price: 15, color: "#fce4ec" },
];

export default function DonationSection({ gatosColonia, handlePayment, cardStyle }: DonationSectionProps) {
  const [visibleCatIds, setVisibleCatIds] = useState<(string | number)[]>(gatosColonia.slice(0, 3).map(g => g.id));
  const [openDonationCatId, setOpenDonationCatId] = useState<string | number | null>(null);
  const [donationSelections, setDonationSelections] = useState<Record<string, boolean>>({});
  const [showPicker, setShowPicker] = useState(false);
  const [openManualMethod, setOpenManualMethod] = useState<"bizum" | "bank" | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const bizumNumber = "00000";
  const ibanNumber = "ES12 3456 7890 1234 5678 9012";

  const { donationTotal } = useMemo(() => {
    let total = 0;
    Object.entries(donationSelections).forEach(([key, checked]) => {
      if (checked) {
        const optionId = key.split("-")[1];
        const option = donationOptions.find((o) => o.id === optionId);
        if (option) { total += option.price; }
      }
    });
    return { donationTotal: total };
  }, [donationSelections]);

  const addCatToView = (id: string | number) => {
    if (!visibleCatIds.includes(id)) { setVisibleCatIds([...visibleCatIds, id]); }
    setOpenDonationCatId(id); 
    setShowPicker(false);
  };

  const toggleManualMethod = (method: "bizum" | "bank") => {
    setOpenManualMethod((prev) => (prev === method ? null : method));
  };

  const copyToClipboard = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1800);
    } catch (error) {
      console.error("No se pudo copiar al portapapeles", error);
    }
  };

  return (
    <section id="donar" style={cardStyle} className="donation-card">
      <h3 className="text-xl font-bold mb-1" style={{ color: '#333' }}>Haz tu aporte gatuno 🐾</h3>
      <p className="mb-6 text-sm opacity-70" style={{ color: '#666' }}>Abre cada gatete y marca el apoyo que quieras cubrir.</p>

      {/* 1. LISTADO DE GATOS */}
      <div className="flex flex-col gap-4">
        {gatosColonia
          .filter(cat => visibleCatIds.includes(cat.id))
          .map((cat) => (
            <details key={cat.id} className="donation-panel" open={openDonationCatId === cat.id} style={{ border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden', background: '#fff' }}>
              <summary 
                onClick={(e) => {
                  e.preventDefault();
                  setOpenDonationCatId(openDonationCatId === cat.id ? null : cat.id);
                }}
                style={{ padding: '15px', cursor: 'pointer', background: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span className="cat-summary flex items-center gap-3">
                  <img src={cat.imagen} alt={cat.nombre} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                  <span className="font-semibold" style={{ color: '#333' }}>{cat.nombre}</span>
                </span>
                <span style={{ fontSize: '0.8rem', color: '#999' }}>{openDonationCatId === cat.id ? '▲' : '▼'}</span>
              </summary>
              
              <div className="cat-options p-4 flex flex-col gap-3" style={{ borderTop: '1px solid #eee', background: 'rgba(240, 240, 240, 0.2)' }}>
                {donationOptions.map((option) => {
                  const key = `${cat.id}-${option.id}`;
                  return (
                    <label key={key} className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded-lg transition-colors" style={{ color: '#555' }}>
                      <input
                        type="checkbox"
                        className="donation-item w-5 h-5"
                        style={{ cursor: 'pointer', accentColor: '#10b981' }}
                        checked={Boolean(donationSelections[key])}
                        onChange={(e) => setDonationSelections(prev => ({ ...prev, [key]: e.target.checked }))}
                      />
                      {/* Icono pequeño y centrado */}
                      <span style={{ 
                        fontSize: '1rem', 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        background: option.color, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0 
                      }}>
                        {option.icon}
                      </span>
                      <span className="text-sm flex-grow" style={{ lineHeight: '1.2' }}>
                        {option.label} — <strong>{option.price} €</strong>
                      </span>
                    </label>
                  );
                })}
              </div>
            </details>
          ))}
      </div>

      {/* 2. BOTÓN AÑADIR GATOS (VERDE ESMERALDA) */}
      <div className="mt-8 mb-4">
        {!showPicker ? (
          <button 
            onClick={() => setShowPicker(true)} 
            className="w-full py-3 border-2 border-dashed border-emerald-400 rounded-xl text-emerald-600 font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
            style={{ background: '#fff', cursor: 'pointer' }}
          >
            <span className="text-xl">+</span> Ver más gatos para ayudar
          </button>
        ) : (
          <div className="bg-white border shadow-xl rounded-2xl p-4">
            <p className="text-sm font-bold text-gray-500 mb-4 px-2">Selecciona un gato:</p>
            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {gatosColonia
                  .filter(g => !visibleCatIds.includes(g.id))
                  .map(g => (
                    <button 
                      key={g.id} 
                      onClick={() => addCatToView(g.id)}
                      className="flex items-center gap-4 p-3 hover:bg-emerald-50 rounded-xl transition-colors w-full text-left"
                      style={{ border: '1px solid #f0f0f0', background: '#fff', cursor: 'pointer' }}
                    >
                      <img src={g.imagen} alt={g.nombre} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                      <span className="font-medium" style={{ color: '#333' }}>{g.nombre}</span>
                    </button>
                  ))}
              </div>
            </div>
            <button onClick={() => setShowPicker(false)} className="w-full mt-4 py-2 text-red-500 text-sm font-semibold hover:underline">Cancelar</button>
          </div>
        )}
      </div>

      {/* 3. RESUMEN FINAL (Puntos Karma 1:1) */}
      <div className="donation-summary bg-white p-6 rounded-2xl border border-gray-100 shadow-xl" style={{ borderRadius: "16px", backdropFilter: "blur(14px)", boxShadow: "0 10px 30px rgba(0,0,0,0.12)" }}>
        <div className="flex justify-between items-center mb-2">
          <span style={{ color: '#666' }}>Total estimado:</span>
          <span className="text-2xl font-bold" style={{ color: '#333' }}>{donationTotal} €</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span style={{ color: '#666' }}>Puntos Karma:</span>
          <span className="font-bold text-lg" style={{ color: '#10b981' }}>{donationTotal} ✨</span>
        </div>
        
        <button 
          className="w-full py-4 rounded-xl font-bold shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
          style={{ 
            border: 'none', 
            color: 'white',
            cursor: donationTotal > 0 ? 'pointer' : 'not-allowed', 
            fontSize: '1.1rem', 
            background: donationTotal > 0 
              ? 'linear-gradient(45deg, #FFC107 0%, #FFB300 100%)' 
              : 'linear-gradient(45deg, #FFECB3 0%, #FFD54F 100%)',
            boxShadow: donationTotal > 0 ? '0 6px 20px rgba(255, 193, 7, 0.3)' : 'none'
          }}
          disabled={donationTotal === 0}
          onClick={() => handlePayment("Donación conjunta Colonias", donationTotal)}
        >
          {donationTotal > 0 
            ? `Quiero confirmar mi aportación de ${donationTotal} €` 
            : "Selecciona una ayuda para continuar"}
        </button>

        <div style={{ marginTop: "14px", display: "grid", gap: "10px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <button
              type="button"
              onClick={() => toggleManualMethod("bizum")}
              style={{
                border: "1px solid rgba(16, 185, 129, 0.4)",
                borderRadius: "16px",
                padding: "0.8rem 0.9rem",
                fontWeight: 700,
                color: "#065f46",
                background: "rgba(255,255,255,0.75)",
                backdropFilter: "blur(10px)",
                cursor: "pointer",
              }}
            >
              Donar con Bizum
            </button>
            <button
              type="button"
              onClick={() => toggleManualMethod("bank")}
              style={{
                border: "1px solid rgba(37, 99, 235, 0.35)",
                borderRadius: "16px",
                padding: "0.8rem 0.9rem",
                fontWeight: 700,
                color: "#1d4ed8",
                background: "rgba(255,255,255,0.75)",
                backdropFilter: "blur(10px)",
                cursor: "pointer",
              }}
            >
              Transferencia Bancaria
            </button>
          </div>

          <p
            style={{
              margin: 0,
              fontWeight: 700,
              color: "#166534",
              background: "rgba(240,253,244,0.8)",
              border: "1px solid rgba(34,197,94,0.25)",
              borderRadius: "16px",
              padding: "0.65rem 0.8rem",
              backdropFilter: "blur(10px)",
            }}
          >
            Donación 100% íntegra: Sin comisiones bancarias para la asociación
          </p>

          {openManualMethod === "bizum" && (
            <div
              style={{
                border: "1px solid rgba(16, 185, 129, 0.28)",
                borderRadius: "16px",
                padding: "0.9rem",
                background: "rgba(236, 253, 245, 0.72)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 6px 20px rgba(16,185,129,0.1)",
              }}
            >
              <p style={{ margin: "0 0 8px", fontWeight: 700, color: "#065f46" }}>Bizum</p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <code style={{ fontSize: "1rem", fontWeight: 700, color: "#064e3b" }}>{bizumNumber}</code>
                <button
                  type="button"
                  onClick={() => copyToClipboard(bizumNumber, "bizum")}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    border: "1px solid rgba(16, 185, 129, 0.4)",
                    background: "white",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  aria-label="Copiar número Bizum"
                >
                  <Copy size={16} />
                </button>
                {copiedField === "bizum" && <span style={{ color: "#047857", fontWeight: 700 }}>¡Copiado!</span>}
              </div>
              <p style={{ margin: "10px 0 0", color: "#166534", fontWeight: 700 }}>
                IMPORTANTE: Pon tu nombre de usuario o email en el concepto para poder reclamar tus puntos Karma
              </p>
            </div>
          )}

          {openManualMethod === "bank" && (
            <div
              style={{
                border: "1px solid rgba(59, 130, 246, 0.25)",
                borderRadius: "16px",
                padding: "0.9rem",
                background: "rgba(239, 246, 255, 0.76)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 6px 20px rgba(59,130,246,0.1)",
              }}
            >
              <p style={{ margin: "0 0 8px", fontWeight: 700, color: "#1e3a8a" }}>Cuenta bancaria</p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <code style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1e40af" }}>{ibanNumber}</code>
                <button
                  type="button"
                  onClick={() => copyToClipboard(ibanNumber, "iban")}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    border: "1px solid rgba(59, 130, 246, 0.4)",
                    background: "white",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  aria-label="Copiar IBAN"
                >
                  <Copy size={16} />
                </button>
                {copiedField === "iban" && <span style={{ color: "#1d4ed8", fontWeight: 700 }}>¡Copiado!</span>}
              </div>
              <p style={{ margin: "10px 0 0", color: "#1e3a8a", fontWeight: 700 }}>
                IMPORTANTE: Pon tu nombre de usuario o email en el concepto para poder reclamar tus puntos Karma
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
