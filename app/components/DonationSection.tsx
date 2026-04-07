"use client";

import React, { useState, useMemo } from "react";

interface Gato {
  id: any;
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
}

interface DonationSectionProps {
  gatosColonia: Gato[];
  handlePayment: (title: string, amount: number) => void;
  cardStyle: React.CSSProperties;
}

// 1. RECUPERAMOS TODAS TUS OPCIONES ORIGINALES DE LA CAPTURA
const donationOptions: DonationOption[] = [
  { id: "macho", label: "Esterilización macho", icon: "➕", iconClassName: "macho", price: 60, karma: 50 },
  { id: "hembra", label: "Esterilización femenina", icon: "♀️", iconClassName: "hembra", price: 100, karma: 80 },
  { id: "comida", label: "Comida mensual", icon: "🍴", iconClassName: "food", price: 10, karma: 10 },
  { id: "pipeta", label: "Pipeta antiparasitaria", icon: "💊", iconClassName: "bug", price: 12, karma: 10 },
  { id: "apadrinar", label: "Apadrina este gato", icon: "💗", iconClassName: "heart", price: 15, karma: 20 },
];

export default function DonationSection({ gatosColonia, handlePayment, cardStyle }: DonationSectionProps) {
  // Empezamos mostrando solo 3 gatos (puedes cambiar el 3 por el número que prefieras)
  const [visibleCatIds, setVisibleCatIds] = useState<any[]>(gatosColonia.slice(0, 3).map(g => g.id));
  const [openDonationCatId, setOpenDonationCatId] = useState<any | null>(null);
  const [donationSelections, setDonationSelections] = useState<Record<string, boolean>>({});
  const [showPicker, setShowPicker] = useState(false);

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

  const addCatToView = (id: any) => {
    if (!visibleCatIds.includes(id)) {
      setVisibleCatIds([...visibleCatIds, id]);
    }
    setOpenDonationCatId(id); 
    setShowPicker(false);
  };

  return (
    <section id="donar" style={cardStyle} className="donation-card">
      <h3 className="text-xl font-bold mb-2">Haz tu aporte gatuno 🐾</h3>
      <p className="mb-6 opacity-80">Abre cada gatete y marca el apoyo que quieras cubrir.</p>

      {/* LISTADO DE GATOS VISIBLES */}
      <div className="flex flex-col gap-4">
        {gatosColonia
          .filter(cat => visibleCatIds.includes(cat.id))
          .map((cat) => (
            <details key={cat.id} className="donation-panel" open={openDonationCatId === cat.id}>
              <summary onClick={(e) => {
                  e.preventDefault();
                  setOpenDonationCatId(openDonationCatId === cat.id ? null : cat.id);
                }}>
                <span className="cat-summary flex items-center gap-3">
                  <img src={cat.imagen} alt={cat.nombre} className="w-10 h-10 rounded-full object-cover" />
                  <span className="font-semibold text-gray-800">{cat.nombre}</span>
                </span>
              </summary>
              <div className="cat-options p-4 flex flex-col gap-3">
                {donationOptions.map((option) => {
                  const key = `${cat.id}-${option.id}`;
                  return (
                    <label key={key} className="flex items-center gap-3 cursor-pointer hover:bg-black/5 p-2 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        className="donation-item w-5 h-5"
                        checked={Boolean(donationSelections[key])}
                        onChange={(e) => setDonationSelections(prev => ({ ...prev, [key]: e.target.checked }))}
                      />
                      <span className={`option-icon ${option.iconClassName} p-1 rounded-full bg-blue-100`}>
                        {option.icon}
                      </span>
                      <span className="text-sm text-gray-700">{option.label} — <strong>{option.price} €</strong></span>
                    </label>
                  );
                })}
              </div>
            </details>
          ))}
      </div>

      {/* BOTÓN AÑADIR GATOS (AHORA MÁS VISIBLE) */}
      <div className="mt-8 mb-4">
        {!showPicker ? (
          <button 
            onClick={() => setShowPicker(true)} 
            className="w-full py-4 border-2 border-dashed border-gray-400 rounded-2xl text-gray-600 font-medium hover:bg-gray-50 hover:border-gray-600 transition-all flex items-center justify-center gap-2"
          >
            <span className="text-2xl">+</span> Ver más gatos para ayudar
          </button>
        ) : (
          <div className="bg-white border shadow-xl rounded-2xl p-4 animate-in fade-in slide-in-from-bottom-4">
            <p className="text-sm font-bold text-gray-500 mb-3 px-2">Selecciona un gato de la colonia:</p>
            {/* MINI SCROLL: Solo muestra gatos que NO están ya en la lista de arriba */}
            <div className="max-h-60 overflow-y-auto flex flex-col gap-1 pr-2 custom-scrollbar">
              {gatosColonia
                .filter(g => !visibleCatIds.includes(g.id))
                .map(g => (
                  <button 
                    key={g.id} 
                    onClick={() => addCatToView(g.id)}
                    className="flex items-center gap-4 p-3 hover:bg-blue-50 rounded-xl transition-colors w-full text-left"
                  >
                    <img src={g.imagen} alt={g.nombre} className="w-12 h-12 rounded-full object-cover shadow-sm" />
                    <span className="font-medium text-gray-800">{g.nombre}</span>
                  </button>
                ))}
              {gatosColonia.filter(g => !visibleCatIds.includes(g.id)).length === 0 && (
                <p className="text-center py-4 text-gray-400 text-sm italic">Ya estás ayudando a todos los gatos ❤️</p>
              )}
            </div>
            <button onClick={() => setShowPicker(false)} className="w-full mt-4 py-2 text-red-500 text-sm font-semibold hover:underline">
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* RESUMEN FINAL */}
      <div className="donation-summary bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-inner">
        <div className="flex justify-between items-center mb-1">
          <span className="text-gray-600">Total estimado:</span>
          <span className="text-xl font-bold text-gray-900">{donationTotal} €</span>
        </div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-600">Puntos Karma:</span>
          <span className="font-bold text-yellow-600">{karmaTotal}</span>
        </div>
        <p className="text-xs text-blue-600 font-medium mb-6">Cada punto ayuda a cambiar vidas felinas 💛</p>
        
        <button 
          className="w-full py-4 bg-[#f5a623] text-white rounded-xl font-bold shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
          disabled={donationTotal === 0}
          onClick={() => handlePayment("Donación conjunta", donationTotal)}
        >
          {donationTotal > 0 ? `Confirmar mi aportación de ${donationTotal} €` : "Selecciona una ayuda para continuar"}
        </button>
      </div>
    </section>
  );
}