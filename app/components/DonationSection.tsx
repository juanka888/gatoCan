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
  price: number;
  color: string; 
}

interface DonationSectionProps {
  gatosColonia: Gato[];
  handlePayment: (title: string, amount: number) => void;
  cardStyle: React.CSSProperties;
}

const donationOptions: DonationOption[] = [
  { id: "macho", label: "Esterilización macho", icon: "➕", price: 60, color: "#e3f2fd" },
  { id: "hembra", label: "Esterilización femenina", icon: "♀️", price: 100, color: "#f3e5f5" },
  { id: "comida", label: "Comida mensual", icon: "🍴", price: 10, color: "#e8f5e9" },
  { id: "pipeta", label: "Pipeta antiparasitaria", icon: "💊", price: 12, color: "#fff3e0" },
  { id: "apadrinar", label: "Apadrina este gato", icon: "💗", price: 15, color: "#fce4ec" },
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
      <div className="flex flex-col gap-4 relative">
        {gatosColonia
          .filter(cat => visibleCatIds.includes(cat.id))
          .map((cat) => (
            <details key={cat.id} className="donation-panel" open={openDonationCatId === cat.id} style={{ border: '1px solid #eee', borderRadius: '20px', overflow: 'hidden', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <summary 
                onClick={(e) => {
                  e.preventDefault();
                  setOpenDonationCatId(openDonationCatId === cat.id ? null : cat.id);
                }}
                style={{ padding: '15px', cursor: 'pointer', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div className="flex items-center gap-3">
                  <img src={cat.imagen} alt={cat.nombre} style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #f0f0f0' }} />
                  <span className="font-bold text-gray-800">{cat.nombre}</span>
                </div>
                <span className="text-xs text-gray-400">{openDonationCatId === cat.id ? '▲' : '▼'}</span>
              </summary>

              <div className="p-3 flex flex-col gap-2" style={{ borderTop: '1px solid #f9f9f9', background: '#fdfdfd' }}>
                {donationOptions.map((option) => {
                  const key = `${cat.id}-${option.id}`;
                  return (
                    <label key={key} className="flex items-center gap-3 p-3 rounded-xl border border-gray-50 bg-white shadow-sm cursor-pointer transition-all active:scale-[0.98]">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        style={{ accentColor: '#10b981', width: '20px', height: '20px', flexShrink: 0 }}
                        checked={Boolean(donationSelections[key])}
                        onChange={(e) => setDonationSelections(prev => ({ ...prev, [key]: e.target.checked }))}
                      />
                      {/* Icono Redondo */}
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: option.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.1rem' }}>
                        {option.icon}
                      </div>
                      {/* Texto y Precio en la misma línea */}
                      <div className="flex flex-row justify-between items-center w-full overflow-hidden">
                        <span className="text-sm font-medium text-gray-700 truncate mr-2">{option.label}</span>
                        <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg flex-shrink-0">{option.price}€</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </details>
          ))}

        {/* BOTÓN AÑADIR (Menú estilo click derecho) */}
        <div className="flex justify-end mt-1 relative px-2">
          <button 
            onClick={() => setShowPicker(!showPicker)}
            style={{
              background: '#10b981', color: 'white', border: 'none', borderRadius: '50%',
              width: '46px', height: '46px', fontSize: '1.2rem', cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10
            }}
          >
            <span>+🐱</span>
          </button>

          {showPicker && (
            <div 
              ref={pickerRef}
              style={{
                position: 'absolute', top: '10px', right: '55px', // Justo al lado del botón
                width: '180px', background: 'white', borderRadius: '15px',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)', border: '1px solid #f0f0f0',
                padding: '8px', zIndex: 100, animation: 'fadeIn 0.15s ease-out'
              }}
            >
              <p className="text-[10px] font-bold text-gray-400 mb-2 px-2 uppercase">Añadir otro:</p>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }} className="custom-scroll">
                {gatosColonia.filter(g => !visibleCatIds.includes(g.id)).map(g => (
                  <button 
                    key={g.id} onClick={() => addCatToView(g.id)}
                    className="flex items-center gap-2 p-2 hover:bg-emerald-50 rounded-lg w-full text-left transition-colors border-none bg-transparent cursor-pointer mb-1"
                  >
                    <img src={g.imagen} alt={g.nombre} style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} />
                    <span className="font-bold text-gray-700 text-xs">{g.nombre}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. RESUMEN: Separado en su propia tarjeta */}
      <div className="mt-8">
        <div style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #f0f0f0', boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
          <div className="flex justify-between items-center mb-5">
            <span style={{ color: '#999', fontWeight: 600, fontSize: '0.85rem' }}>TOTAL APORTACIÓN:</span>
            <span style={{ color: '#333', fontSize: '1.4rem', fontWeight: 900 }}>
              {donationTotal} € <span style={{ color: '#10b981' }}>✨</span>
            </span>
          </div>
          
          <button 
            className="w-full py-4 rounded-xl font-black transition-all active:translate-y-1"
            style={{ 
              border: 'none', 
              fontSize: '1rem', textTransform: 'uppercase',
              // VERDE CLARO SI NO HAY NADA, VERDE POTENTE SI HAY TOTAL
              background: donationTotal > 0 
                ? 'linear-gradient(145deg, #10b981, #059669)' 
                : 'linear-gradient(145deg, #dcfce7, #bbf7d0)', 
              color: donationTotal > 0 ? 'white' : '#15803d',
              boxShadow: donationTotal > 0 
                ? '0 6px 0px #047857, 0 8px 20px rgba(16, 185, 129, 0.3)' 
                : '0 4px 0px #86efac', 
              cursor: donationTotal > 0 ? 'pointer' : 'not-allowed',
            }}
            disabled={donationTotal === 0}
            onClick={() => handlePayment("Aporte Colonias", donationTotal)}
          >
            {donationTotal > 0 ? "🚀 Confirmar Aportación" : "Selecciona alguna ayuda"}
          </button>
        </div>

        <div className="mt-4">
          <BotonesMetodosPago />
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .custom-scroll::-webkit-scrollbar { width: 3px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </section>
  );
}
