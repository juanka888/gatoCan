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

  const toggleDonation = (key: string) => {
    setDonationSelections(prev => ({ ...prev, [key]: !prev[key] }));
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
                  const isChecked = Boolean(donationSelections[key]);
                  
                  return (
                    <div
                      key={key}
                      onClick={() => toggleDonation(key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 14px',
                        borderRadius: '14px',
                        border: isChecked ? '2px solid #10b981' : '2px solid #e5e7eb',
                        background: isChecked ? '#f0fdf4' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        boxShadow: isChecked ? '0 4px 12px rgba(16, 185, 129, 0.15)' : '0 2px 4px rgba(0,0,0,0.04)',
                      }}
                      onMouseEnter={(e) => {
                        if (!isChecked) {
                          (e.currentTarget as HTMLElement).style.borderColor = '#d1fae5';
                          (e.currentTarget as HTMLElement).style.background = '#f9fffe';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isChecked) {
                          (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb';
                          (e.currentTarget as HTMLElement).style.background = '#ffffff';
                        }
                      }}
                    >
                      {/* Checkbox - Custom */}
                      <div
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '6px',
                          border: isChecked ? 'none' : '2px solid #d1d5db',
                          background: isChecked ? '#10b981' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        {isChecked && (
                          <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>
                        )}
                      </div>

                      {/* Icono Redondo */}
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: option.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          fontSize: '1.2rem',
                          transition: 'transform 0.2s ease-in-out',
                          transform: isChecked ? 'scale(1.1)' : 'scale(1)',
                        }}
                      >
                        {option.icon}
                      </div>

                      {/* Texto y Precio */}
                      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', minHeight: '24px' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 500, color: '#374151', whiteSpace: 'nowrap', marginRight: '8px' }}>
                          {option.label}
                        </span>
                        <span
                          style={{
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            color: '#10b981',
                            background: isChecked ? '#dcfce7' : '#ecfdf5',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            flexShrink: 0,
                            transition: 'all 0.2s ease-in-out',
                          }}
                        >
                          {option.price}€
                        </span>
                      </div>
                    </div>
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
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10,
              transition: 'all 0.2s ease-in-out',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.5)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';
            }}
          >
            <span>+🐱</span>
          </button>

          {showPicker && (
            <div 
              ref={pickerRef}
              style={{
                position: 'absolute', top: '10px', right: '55px',
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
