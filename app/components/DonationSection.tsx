"use client";
import React, { useState, useMemo } from "react";
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
// --- CONFIGURACIÓN DE OPCIONES (Karma 1:1) ---
const donationOptions: DonationOption[] = [
  { id: "macho", label: "Esterilización macho", icon: "➕", iconClassName: "macho", price: 60, color: "#e3f2fd" },
  { id: "hembra", label: "Esterilización femenina", icon: "♀️", iconClassName: "hembra", price: 100, color: "#f3e5f5" },
  { id: "comida", label: "Comida mensual", icon: "🍴", iconClassName: "food", price: 10, color: "#e8f5e9" },
  { id: "pipeta", label: "Pipeta antiparasitaria", icon: "💊", iconClassName: "bug", price: 12, color: "#fff3e0" },
  { id: "apadrinar", label: "Apadrina este gato", icon: "💗", iconClassName: "heart", price: 15, color: "#fce4ec" },
];

export default function DonationSection({ gatosColonia, handlePayment, cardStyle }: DonationSectionProps) {
  // Cambiado a slice(0, 2) para mostrar solo dos gatos inicialmente
  const [visibleCatIds, setVisibleCatIds] = useState<(string | number)[]>(gatosColonia.slice(0, 2).map(g => g.id));
  const [openDonationCatId, setOpenDonationCatId] = useState<string | number | null>(null);
  const [donationSelections, setDonationSelections] = useState<Record<string, boolean>>({});
  const [showPicker, setShowPicker] = useState(false);

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
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold mb-1" style={{ color: '#333' }}>Haz tu aporte gatuno 🐾</h3>
          <p className="text-sm opacity-70" style={{ color: '#666' }}>Marca el apoyo que quieras cubrir.</p>
        </div>
        
        {/* BOTÓN AÑADIR GATOS: A la derecha y con icono de gato */}
        <button 
          onClick={() => setShowPicker(true)}
          style={{
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '45px',
            height: '45px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)',
            transition: 'transform 0.2s'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          +🐱
        </button>
      </div>

      {/* 1. LISTADO DE GATOS (Con más separación: gap-6) */}
      <div className="flex flex-col gap-6">
        {gatosColonia
          .filter(cat => visibleCatIds.includes(cat.id))
          .map((cat) => (
            <details key={cat.id} className="donation-panel" open={openDonationCatId === cat.id} style={{ border: '1px solid #eee', borderRadius: '16px', overflow: 'hidden', background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <summary 
                onClick={(e) => {
                  e.preventDefault();
                  setOpenDonationCatId(openDonationCatId === cat.id ? null : cat.id);
                }}
                style={{ padding: '15px', cursor: 'pointer', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span className="cat-summary flex items-center gap-3">
                  <img src={cat.imagen} alt={cat.nombre} style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                  <span className="font-bold text-lg" style={{ color: '#333' }}>{cat.nombre}</span>
                </span>
                <span style={{ color: '#999' }}>{openDonationCatId === cat.id ? '▲' : '▼'}</span>
              </summary>
              
              <div className="cat-options p-4 flex flex-col gap-3" style={{ borderTop: '1px solid #f5f5f5', background: '#fafafa' }}>
                {donationOptions.map((option) => {
                  const key = `${cat.id}-${option.id}`;
                  return (
                    <label key={key} className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded-xl transition-all" style={{ color: '#555' }}>
                      <input
                        type="checkbox"
                        className="donation-item w-5 h-5"
                        style={{ cursor: 'pointer', accentColor: '#10b981' }}
                        checked={Boolean(donationSelections[key])}
                        onChange={(e) => setDonationSelections(prev => ({ ...prev, [key]: e.target.checked }))}
                      />
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

      {/* 2. SELECTOR FLOTANTE (OVERLAY) */}
      {showPicker && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backdropFilter: 'blur(4px)'
        }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
            <h4 className="text-lg font-bold mb-4 text-center">Selecciona un gatete</h4>
            <div style={{ maxHeight: '350px', overflowY: 'auto' }} className="pr-2">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {gatosColonia
                  .filter(g => !visibleCatIds.includes(g.id))
                  .map(g => (
                    <button 
                      key={g.id} 
                      onClick={() => addCatToView(g.id)}
                      className="flex items-center gap-4 p-3 hover:bg-emerald-50 rounded-2xl transition-colors w-full text-left"
                      style={{ border: '1px solid #f0f0f0', background: '#fff', cursor: 'pointer' }}
                    >
                      <img src={g.imagen} alt={g.nombre} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                      <span className="font-bold text-gray-700">{g.nombre}</span>
                    </button>
                  ))}
              </div>
            </div>
            <button 
              onClick={() => setShowPicker(false)} 
              className="w-full mt-6 py-3 bg-gray-100 rounded-2xl font-bold text-gray-500 hover:bg-gray-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* 3. RESUMEN FINAL */}
      <div className="donation-summary bg-white p-6 rounded-3xl border border-gray-100 shadow-xl mt-8" style={{ backdropFilter: "blur(14px)", boxShadow: "0 10px 40px rgba(0,0,0,0.08)" }}>
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium" style={{ color: '#888' }}>Total estimado:</span>
          <span className="text-3xl font-black" style={{ color: '#333' }}>{donationTotal} €</span>
        </div>
        <div className="flex justify-between items-center mb-6">
          <span className="font-medium" style={{ color: '#888' }}>Puntos Karma:</span>
          <span className="font-bold text-xl" style={{ color: '#10b981' }}>{donationTotal} ✨</span>
        </div>
        
        {/* BOTÓN MEJORADO */}
        <button 
          className="w-full py-5 rounded-2xl font-black shadow-lg transition-all active:scale-[0.96] disabled:opacity-50 disabled:grayscale mb-6"
          style={{ 
            border: 'none', 
            color: 'white',
            cursor: donationTotal > 0 ? 'pointer' : 'not-allowed', 
            fontSize: '1rem', 
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            background: donationTotal > 0 
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
              : 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
            boxShadow: donationTotal > 0 ? '0 8px 25px rgba(16, 185, 129, 0.3)' : 'none'
          }}
          disabled={donationTotal === 0}
          onClick={() => handlePayment("Donación conjunta Colonias", donationTotal)}
        >
          {donationTotal > 0 
            ? `Confirmar mi aporte de ${donationTotal} €` 
            : "Selecciona una ayuda"}
        </button>

        <BotonesMetodosPago />
      </div>
    </section>
  );
}
