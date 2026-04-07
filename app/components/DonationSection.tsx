"use client";

import React, { useState, useMemo } from "react";

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
  karma: number;
  color: string; // Color de fondo para el círculo del emoji
}

interface DonationSectionProps {
  gatosColonia: Gato[];
  handlePayment: (title: string, amount: number) => void;
  cardStyle: React.CSSProperties;
}

// --- CONFIGURACIÓN DE OPCIONES CON TUS COLORES ---
const donationOptions: DonationOption[] = [
  { id: "macho", label: "Esterilización macho", icon: "➕", iconClassName: "macho", price: 60, karma: 50, color: "#e3f2fd" },
  { id: "hembra", label: "Esterilización femenina", icon: "♀️", iconClassName: "hembra", price: 100, karma: 80, color: "#f3e5f5" },
  { id: "comida", label: "Comida mensual", icon: "🍴", iconClassName: "food", price: 10, karma: 10, color: "#e8f5e9" },
  { id: "pipeta", label: "Pipeta antiparasitaria", icon: "💊", iconClassName: "bug", price: 12, karma: 10, color: "#fff3e0" },
  { id: "apadrinar", label: "Apadrina este gato", icon: "💗", iconClassName: "heart", price: 15, karma: 20, color: "#fce4ec" },
];

export default function DonationSection({ gatosColonia, handlePayment, cardStyle }: DonationSectionProps) {
  // --- ESTADOS ---
  const [visibleCatIds, setVisibleCatIds] = useState<(string | number)[]>(gatosColonia.slice(0, 3).map(g => g.id));
  const [openDonationCatId, setOpenDonationCatId] = useState<string | number | null>(null);
  const [donationSelections, setDonationSelections] = useState<Record<string, boolean>>({});
  const [showPicker, setShowPicker] = useState(false);

  // --- LÓGICA DE TOTALES ---
  const { donationTotal, karmaTotal } = useMemo(() => {
    let total = 0, karma = 0;
    Object.entries(donationSelections).forEach(([key, checked]) => {
      if (checked) {
        const optionId = key.split("-")[1];
        const option = donationOptions.find((o) => o.id === optionId);
        if (option) { total += option.price; karma += option.karma; }
      }
    });
    return { donationTotal: total, karmaTotal: karma };
  }, [donationSelections]);

  const addCatToView = (id: string | number) => {
    if (!visibleCatIds.includes(id)) {
      setVisibleCatIds([...visibleCatIds, id]);
    }
    setOpenDonationCatId(id); 
    setShowPicker(false);
  };

  return (
    <section id="donar" style={cardStyle} className="donation-card">
      <h3 className="text-xl font-bold mb-2" style={{ color: '#333' }}>Haz tu aporte gatuno 🐾</h3>
      <p className="mb-6 opacity-80" style={{ color: '#666' }}>Abre cada gatete y marca el apoyo que quieras cubrir.</p>

      {/* 1. LISTADO DE GATOS VISIBLES */}
      <div className="flex flex-col gap-4">
        {gatosColonia
          .filter(cat => visibleCatIds.includes(cat.id))
          .map((cat) => (
            <details key={cat.id} className="donation-panel" open={openDonationCatId === cat.id} style={{ border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <summary 
                onClick={(e) => {
                  e.preventDefault();
                  setOpenDonationCatId(openDonationCatId === cat.id ? null : cat.id);
                }}
                style={{ padding: '15px 20px', cursor: 'pointer', background: '#fcfcfc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span className="cat-summary flex items-center gap-4">
                  <img src={cat.imagen} alt={cat.nombre} style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                  <span className="font-semibold" style={{ color: '#333', fontSize: '1.05rem' }}>{cat.nombre}</span>
                </span>
                <span style={{ fontSize: '0.8rem', color: '#999' }}>
                  {openDonationCatId === cat.id ? '▲' : '▼'}
                </span>
              </summary>
              
              <div className="cat-options p-5 flex flex-col gap-3" style={{ borderTop: '1px solid #f0f0f0', background: 'rgba(240, 240, 240, 0.2)' }}>
                {donationOptions.map((option) => {
                  const key = `${cat.id}-${option.id}`;
                  return (
                    <label key={key} className="flex items-center gap-4 cursor-pointer hover:bg-white p-2.5 rounded-xl transition-colors" style={{ color: '#555' }}>
                      <input
                        type="checkbox"
                        className="donation-item w-5 h-5"
                        style={{ cursor: 'pointer', accentColor: '#34d399' }}
                        checked={Boolean(donationSelections[key])}
                        onChange={(e) => setDonationSelections(prev => ({ ...prev, [key]: e.target.checked }))}
                      />
                      <span style={{ fontSize: '1.2rem', padding: '10px', borderRadius: '50%', background: option.color, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '42px', minHeight: '42px' }}>
                        {option.icon}
                      </span>
                      <span className="text-sm font-medium">{option.label} — <strong>{option.price} €</strong></span>
                    </label>
                  );
                })}
              </div>
            </details>
          ))}
      </div>

      {/* 2. BOTÓN AÑADIR GATOS (VERDE) */}
      <div className="mt-8 mb-6">
        {!showPicker ? (
          <button 
            onClick={() => setShowPicker(true)} 
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-semibold hover:border-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/30 transition-all flex items-center justify-center gap-2.5"
            style={{ background: '#fff', cursor: 'pointer' }}
          >
            <span className="text-3xl text-emerald-600">+</span> Ver más gatos para ayudar
          </button>
        ) : (
          <div className="bg-white border border-gray-100 shadow-2xl rounded-2xl p-5">
            <p className="text-sm font-bold text-gray-500 mb-4 px-2">Selecciona un gato de la colonia:</p>
            <div style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '5px' }}>
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
                      <img src={g.imagen} alt={g.nombre} style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      <span className="font-medium" style={{ color: '#333' }}>{g.nombre}</span>
                    </button>
                  ))}
              </div>
            </div>
            <button onClick={() => setShowPicker(false)} className="w-full mt-4 py-2 text-red-500 text-sm font-semibold hover:underline" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* 3. RESUMEN Y BOTÓN DORADO */}
      <div className="donation-summary bg-white p-7 rounded-2xl border border-gray-100 shadow-xl">
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-gray-600 font-medium">Total estimado:</span>
          <span className="text-3xl font-extrabold" style={{ color: '#222' }}>{donationTotal} €</span>
        </div>
        <div className="flex justify-between items-center mb-5">
          <span className="text-gray-600 font-medium">Puntos Karma:</span>
          <span className="font-bold text-lg" style={{ color: '#f5a623' }}>{karmaTotal} ✨</span>
        </div>
        
        <button 
          className="w-full py-4 rounded-2xl font-bold shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
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
      </div>
    </section>
  );
}