"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import BotonesMetodosPago from "./BotonesMetodosPago";

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

const donationOptions: DonationOption[] = [
  { id: "macho", label: "Esterilización macho", icon: "➕", iconClassName: "macho", price: 60, color: "#e3f2fd" },
  { id: "hembra", label: "Esterilización femenina", icon: "♀️", iconClassName: "hembra", price: 100, color: "#f3e5f5" },
  { id: "comida", label: "Comida mensual", icon: "🍴", iconClassName: "food", price: 10, color: "#e8f5e9" },
  { id: "pipeta", label: "Pipeta antiparasitaria", icon: "💊", iconClassName: "bug", price: 12, color: "#fff3e0" },
  { id: "apadrinar", label: "Apadrina este gato", icon: "💗", iconClassName: "heart", price: 15, color: "#fce4ec" },
];

export default function DonationSection({ gatosColonia, handlePayment, cardStyle }: DonationSectionProps) {
  const [visibleCatIds, setVisibleCatIds] = useState<(string | number)[]>(gatosColonia.slice(0, 2).map(g => g.id));
  const [openDonationCatId, setOpenDonationCatId] = useState<string | number | null>(null);
  const [donationSelections, setDonationSelections] = useState<Record<string, boolean>>({});
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  return (
    <section id="donar" style={{ ...cardStyle, position: 'relative' }} className="donation-card">
      <h3 className="text-xl font-bold mb-1" style={{ color: '#333' }}>Haz tu aporte gatuno 🐾</h3>
      <p className="mb-6 text-sm opacity-70" style={{ color: '#666' }}>Marca el apoyo que quieras cubrir.</p>

      {/* 1. LISTADO DE GATOS */}
      <div className="flex flex-col gap-5 relative">
        {gatosColonia
          .filter(cat => visibleCatIds.includes(cat.id))
          .map((cat) => (
            <details key={cat.id} className="donation-panel" open={openDonationCatId === cat.id} style={{ border: '1px solid #eee', borderRadius: '16px', overflow: 'hidden', background: '#fff' }}>
              <summary 
                onClick={(e) => {
                  e.preventDefault();
                  setOpenDonationCatId(openDonationCatId === cat.id ? null : cat.id);
                }}
                style={{ padding: '15px', cursor: 'pointer', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span className="cat-summary flex items-center gap-3">
                  <img src={cat.imagen} alt={cat.nombre} style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                  <span className="font-bold" style={{ color: '#333' }}>{cat.nombre}</span>
                </span>
                <span style={{ fontSize: '0.8rem', color: '#999' }}>{openDonationCatId === cat.id ? '▲' : '▼'}</span>
              </summary>
              <div className="p-4 flex flex-col gap-3" style={{ borderTop: '1px solid #f5f5f5', background: '#fafafa' }}>
                {donationOptions.map((option) => {
                  const key = `${cat.id}-${option.id}`;
                  return (
                    <label key={key} className="flex items-center gap-3 p-1 cursor-pointer hover:bg-white rounded-xl transition-all">
                      <input
                        type="checkbox"
                        style={{ accentColor: '#10b981', width: '18px', height: '18px', flexShrink: 0 }}
                        checked={Boolean(donationSelections[key])}
                        onChange={(e) => setDonationSelections(prev => ({ ...prev, [key]: e.target.checked }))}
                      />
                      {/* Icono y texto en la misma línea arreglado */}
                      <div className="flex items-center gap-3 w-full">
                        <span style={{ fontSize: '1rem', width: '32px', height: '32px', borderRadius: '50%', background: option.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {option.icon}
                        </span>
                        <span className="text-sm flex-grow text-gray-700">
                          {option.label}
                        </span>
                        <strong className="text-sm text-gray-900 whitespace-nowrap">{option.price} €</strong>
                      </div>
                    </label>
                  );
                })}
              </div>
            </details>
          ))}

        {/* BOTÓN AÑADIR (Ajustado margen derecho) */}
        <div className="flex justify-end mt-2 pr-2 relative">
          <button 
            onClick={() => setShowPicker(!showPicker)}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              fontSize: '1.3rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10
            }}
          >
            <span>+🐱</span>
          </button>

          {showPicker && (
            <div 
              ref={pickerRef}
              style={{
                position: 'absolute',
                bottom: '60px',
                right: '10px', // Separado del borde derecho
                width: '190px',
                background: 'white',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
                border: '1px solid #f0f0f0',
                padding: '12px',
                zIndex: 100,
                animation: 'popIn 0.2s ease-out'
              }}
            >
              <p className="text-[10px] font-bold text-gray-400 mb-2 px-2 uppercase tracking-tight">Más gatetes:</p>
              <div style={{ maxHeight: '180px', overflowY: 'auto' }} className="custom-scrollbar">
                {gatosColonia.filter(g => !visibleCatIds.includes(g.id)).map(g => (
                  <button 
                    key={g.id} 
                    onClick={() => addCatToView(g.id)}
                    className="flex items-center gap-3 p-2 hover:bg-emerald-50 rounded-xl w-full text-left transition-colors border-none bg-transparent cursor-pointer mb-1"
                  >
                    <img src={g.imagen} alt={g.nombre} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                    <span className="font-semibold text-gray-700 text-xs">{g.nombre}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. RESUMEN: Cifra y Confirmar en recuadro propio separado */}
      <div className="mt-8">
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '28px', 
          border: '1px solid #f0f0f0', 
          boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
          marginBottom: '20px' // SEPARACIÓN DE LOS BOTONES DE ABAJO
        }}>
          <div className="flex justify-between items-center mb-5">
            <span style={{ color: '#888', fontWeight: 600, fontSize: '0.9rem' }}>Total estimado:</span>
            <span style={{ color: '#333', fontSize: '1.5rem', fontWeight: 900 }}>
              {donationTotal} € <span style={{ color: '#10b981' }}>✨</span>
            </span>
          </div>
          
          <button 
            className="w-full py-4 rounded-2xl font-black transition-all active:translate-y-1"
            style={{ 
              border: 'none', 
              color: 'white',
              cursor: donationTotal > 0 ? 'pointer' : 'not-allowed', 
              fontSize: '1rem', 
              textTransform: 'uppercase',
              background: donationTotal > 0 
                ? 'linear-gradient(145deg, #10b981, #059669)' 
                : '#f3f4f6', 
              color: donationTotal > 0 ? 'white' : '#9ca3af',
              boxShadow: donationTotal > 0 
                ? '0 6px 0px #047857, 0 12px 20px rgba(16, 185, 129, 0.3)' 
                : '0 4px 0px #d1d5db', 
            }}
            disabled={donationTotal === 0}
            onClick={() => handlePayment("Aporte Colonias", donationTotal)}
          >
            {donationTotal > 0 ? "🚀 Confirmar Aportación" : "Selecciona alguna ayuda"}
          </button>
        </div>

        {/* MÉTODOS DE PAGO EN SU PROPIO BLOQUE (YA VIENE SEPARADO) */}
        <BotonesMetodosPago />
      </div>

      <style jsx>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.9) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </section>
  );
}
