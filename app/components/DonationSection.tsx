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
  color: string; 
}

interface DonationSectionProps {
  gatosColonia: Gato[];
  handlePayment: (title: string, amount: number) => void;
  cardStyle: React.CSSProperties;
}

// --- CONFIGURACIÓN DE OPCIONES (Karma es 1:1 con el precio) ---
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

  // --- LÓGICA DE TOTALES (Karma 1:1) ---
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
    <section id="donar" style={cardStyle} className="donation-card">
      <h3 className="text-xl font-bold mb-1" style={{ color: '#333' }}>Haz tu aporte gatuno 🐾</h3>
      <p className="mb-6 text-sm opacity-70" style={{ color: '#666' }}>Abre cada gatete y marca el apoyo que quieras cubrir.</p>

      <div className="flex flex-col gap-3">
        {gatosColonia
          .filter(cat => visibleCatIds.includes(cat.id))
          .map((cat) => (
            <details key={cat.id} className="group" open={openDonationCatId === cat.id} style={{ border: '1px solid #eee', borderRadius: '14px', overflow: 'hidden', background: '#fff' }}>
              <summary 
                onClick={(e) => {
                  e.preventDefault();
                  setOpenDonationCatId(openDonationCatId === cat.id ? null : cat.id);
                }}
                className="list-none"
                style={{ padding: '12px 18px', cursor: 'pointer', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div className="flex items-center gap-3">
                  <img src={cat.imagen} alt={cat.nombre} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff' }} />
                  <span className="font-bold text-gray-800" style={{ fontSize: '1.05rem' }}>{cat.nombre}</span>
                </div>
                <span className="text-gray-400 group-open:rotate-180 transition-transform" style={{ fontSize: '0.7rem' }}>▼</span>
              </summary>
              
              <div className="p-4 flex flex-col gap-2" style={{ background: 'rgba(248, 250, 252, 0.5)' }}>
                {donationOptions.map((option) => {
                  const key = `${cat.id}-${option.id}`;
                  return (
                    <label key={key} className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded"
                        style={{ cursor: 'pointer', accentColor: '#10b981' }}
                        checked={Boolean(donationSelections[key])}
                        onChange={(e) => setDonationSelections(prev => ({ ...prev, [key]: e.target.checked }))}
                      />
                      <span style={{ 
                        fontSize: '0.9rem', 
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
                      <span className="text-gray-600 font-medium" style={{ fontSize: '0.85rem', lineHeight: '1' }}>
                        {option.label} — <span className="font-bold text-gray-900">{option.price} €</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </details>
          ))}
      </div>

      {/* BOTÓN AÑADIR GATOS (AHORA VERDE) */}
      <div className="mt-6 mb-6">
        {!showPicker ? (
          <button 
            onClick={() => setShowPicker(true)} 
            className="w-full py-3.5 border-2 border-dashed border-emerald-200 rounded-2xl text-emerald-600 font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
            style={{ background: '#fff', cursor: 'pointer' }}
          >
            <span className="text-2xl">+</span> Ver más gatos para ayudar
          </button>
        ) : (
          <div className="bg-white border border-gray-100 shadow-xl rounded-2xl p-4">
            <p className="text-xs font-bold text-gray-400 uppercase mb-3 px-1">Selecciona un gato:</p>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }} className="flex flex-col gap-2">
                {gatosColonia
                  .filter(g => !visibleCatIds.includes(g.id))
                  .map(g => (
                    <button 
                      key={g.id} 
                      onClick={() => addCatToView(g.id)}
                      className="flex items-center gap-3 p-2 hover:bg-emerald-50 rounded-xl transition-colors w-full text-left border border-gray-50"
                    >
                      <img src={g.imagen} alt={g.nombre} style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover' }} />
                      <span className="font-medium text-sm text-gray-700">{g.nombre}</span>
                    </button>
                  ))}
            </div>
            <button onClick={() => setShowPicker(false)} className="w-full mt-3 py-1 text-gray-400 text-xs font-semibold hover:text-red-400">Cancelar</button>
          </div>
        )}
      </div>

      {/* RESUMEN FINAL */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg">
        <div className="flex justify-between items-center mb-1">
          <span className="text-gray-500 text-sm font-medium">Total estimado:</span>
          <span className="text-2xl font-black text-gray-900">{donationTotal} €</span>
        </div>
        <div className="flex justify-between items-center mb-5">
          <span className="text-gray-500 text-sm font-medium">Puntos Karma:</span>
          <span className="font-bold text-emerald-600">{donationTotal} ✨</span>
        </div>
        
        <button 
          className="w-full py-4 rounded-xl font-bold shadow-md transition-all active:scale-[0.97] disabled:opacity-40 disabled:grayscale"
          style={{ 
            border: 'none', 
            color: 'white',
            cursor: donationTotal > 0 ? 'pointer' : 'not-allowed', 
            fontSize: '1rem', 
            background: donationTotal > 0 
              ? 'linear-gradient(135deg, #FFB300 0%, #FFA000 100%)' 
              : 'linear-gradient(135deg, #FFECB3 0%, #FFD54F 100%)',
            boxShadow: donationTotal > 0 ? '0 4px 15px rgba(255, 160, 0, 0.3)' : 'none'
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