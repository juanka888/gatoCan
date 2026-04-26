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

  // Cerrar el selector si se hace clic fuera (como un menú de Windows)
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
      <p className="mb-6 text-sm opacity-70" style={{ color: '#666' }}>Abre cada gatete y marca el apoyo que quieras cubrir.</p>

      {/* 1. LISTADO DE GATOS */}
      <div className="flex flex-col gap-6 relative">
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
              <div className="p-4 flex flex-col gap-3" style={{ borderTop: '1px solid #f0f0f0', background: '#fafafa' }}>
                {donationOptions.map((option) => {
                  const key = `${cat.id}-${option.id}`;
                  return (
                    <label key={key} className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded-xl transition-all">
                      <input
                        type="checkbox"
                        style={{ accentColor: '#10b981', width: '18px', height: '18px' }}
                        checked={Boolean(donationSelections[key])}
                        onChange={(e) => setDonationSelections(prev => ({ ...prev, [key]: e.target.checked }))}
                      />
                      <span style={{ fontSize: '1rem', width: '32px', height: '32px', borderRadius: '50%', background: option.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {option.icon}
                      </span>
                      <span className="text-sm flex-grow">{option.label} — <strong>{option.price} €</strong></span>
                    </label>
                  );
                })}
              </div>
            </details>
          ))}

        {/* BOTÓN AÑADIR (Abajo a la derecha e intuitivo) */}
        <div className="flex justify-end mt-2 relative">
          <button 
            onClick={() => setShowPicker(!showPicker)}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              fontSize: '1.4rem',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10
            }}
          >
            <span style={{ marginRight: '2px' }}>+</span>
            <span style={{ fontSize: '1.2rem' }}>🐱</span>
          </button>

          {/* SELECTOR TIPO MENÚ CONTEXTUAL (No ocupa toda la pantalla) */}
          {showPicker && (
            <div 
              ref={pickerRef}
              style={{
                position: 'absolute',
                bottom: '60px',
                right: '0',
                width: '220px',
                background: 'white',
                borderRadius: '18px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                border: '1px solid #f0f0f0',
                padding: '10px',
                zIndex: 100,
                animation: 'fadeInUp 0.2s ease-out'
              }}
            >
              <p className="text-xs font-bold text-gray-400 mb-2 px-2 uppercase tracking-wider">Añadir otro gatete:</p>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {gatosColonia.filter(g => !visibleCatIds.includes(g.id)).map(g => (
                  <button 
                    key={g.id} 
                    onClick={() => addCatToView(g.id)}
                    className="flex items-center gap-3 p-2 hover:bg-emerald-50 rounded-xl w-full text-left transition-colors border-none bg-transparent cursor-pointer"
                  >
                    <img src={g.imagen} alt={g.nombre} style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover' }} />
                    <span className="font-semibold text-gray-700 text-sm">{g.nombre}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. RESUMEN Y BOTÓN 3D */}
      <div className="donation-summary bg-white p-6 rounded-3xl border border-gray-100 shadow-xl mt-8">
        <div className="flex justify-between items-center mb-4">
          <span style={{ color: '#888', fontWeight: 600 }}>Total: <span style={{ color: '#333', fontSize: '1.5rem', marginLeft: '5px' }}>{donationTotal} €</span></span>
          <span style={{ color: '#10b981', fontWeight: 800 }}>{donationTotal} ✨</span>
        </div>
        
        <button 
          className="w-full py-4 rounded-2xl font-black transition-all active:translate-y-1"
          style={{ 
            border: 'none', 
            color: 'white',
            cursor: donationTotal > 0 ? 'pointer' : 'not-allowed', 
            fontSize: '1rem', 
            textTransform: 'uppercase',
            // DISEÑO 3D / NEUMÓRFICO
            background: donationTotal > 0 
              ? 'linear-gradient(145deg, #10b981, #059669)' 
              : '#e5e7eb',
            boxShadow: donationTotal > 0 
              ? '0 6px 0px #047857, 0 12px 20px rgba(16, 185, 129, 0.3)' 
              : 'none',
            marginBottom: '20px'
          }}
          disabled={donationTotal === 0}
          onClick={() => handlePayment("Aporte Colonias", donationTotal)}
        >
          {donationTotal > 0 ? "🚀 Confirmar Aportación" : "Selecciona alguna ayuda"}
        </button>

        <BotonesMetodosPago />
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
