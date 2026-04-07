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

const donationOptions: DonationOption[] = [
  { id: "macho", label: "Esterilización macho", icon: "➕", iconClassName: "macho", price: 60, karma: 50 },
  { id: "hembra", label: "Esterilización femenina", icon: "♀️", iconClassName: "hembra", price: 100, karma: 80 },
  { id: "comida", label: "Comida mensual", icon: "🍴", iconClassName: "food", price: 10, karma: 10 },
  { id: "pipeta", label: "Pipeta antiparasitaria", icon: "💊", iconClassName: "bug", price: 12, karma: 10 },
  { id: "apadrinar", label: "Apadrina este gato", icon: "💗", iconClassName: "heart", price: 15, karma: 20 },
];

export default function DonationSection({ gatosColonia, handlePayment, cardStyle }: DonationSectionProps) {
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
      <h3 className="text-xl font-bold mb-2" style={{ color: '#333' }}>Haz tu aporte gatuno 🐾</h3>
      <p className="mb-6 opacity-80" style={{ color: '#666' }}>Abre cada gatete y marca el apoyo que quieras cubrir.</p>

      {/* LISTADO DE GATOS VISIBLES */}
      <div className="flex flex-col gap-4">
        {gatosColonia
          .filter(cat => visibleCatIds.includes(cat.id))
          .map((cat) => (
            <details key={cat.id} className="donation-panel" open={openDonationCatId === cat.id} style={{ border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden', background: '#fff' }}>
              <summary onClick={(e) => {
                  e.preventDefault();
                  setOpenDonationCatId(openDonationCatId === cat.id ? null : cat.id);
                }}
                style={{ padding: '15px', cursor: 'pointer', background: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span className="cat-summary flex items-center gap-3">
                  {/* Imagen en el listado principal */}
                  <img src={cat.imagen} alt={cat.nombre} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                  <span className="font-semibold" style={{ color: '#333' }}>{cat.nombre}</span>
                </span>
                <span style={{ fontSize: '0.8rem', color: '#999' }}>{openDonationCatId === cat.id ? '▲' : '▼'}</span>
              </summary>
              <div className="cat-options p-4 flex flex-col gap-3" style={{ borderTop: '1px solid #eee' }}>
                {donationOptions.map((option) => {
                  const key = `${cat.id}-${option.id}`;
                  return (
                    <label key={key} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors" style={{ color: '#555' }}>
                      <input
                        type="checkbox"
                        className="donation-item w-5 h-5"
                        style={{ cursor: 'pointer' }}
                        checked={Boolean(donationSelections[key])}
                        onChange={(e) => setDonationSelections(prev => ({ ...prev, [key]: e.target.checked }))}
                      />
                      <span className={`option-icon ${option.iconClassName}`} style={{ fontSize: '1.2rem' }}>
                        {option.icon}
                      </span>
                      <span className="text-sm">{option.label} — <strong>{option.price} €</strong></span>
                    </label>
                  );
                })}
              </div>
            </details>
          ))}
      </div>

      {/* BOTÓN AÑADIR GATOS */}
      <div className="mt-8 mb-4">
        {!showPicker ? (
          <button 
            onClick={() => setShowPicker(true)} 
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center gap-2"
            style={{ background: '#fff', cursor: 'pointer' }}
          >
            <span className="text-xl">+</span> Ver más gatos para ayudar
          </button>
        ) : (
          {/* --- AQUÍ ESTÁ EL ARREGLO DEL SELECTOR --- */}
          <div className="bg-white border shadow-xl rounded-2xl p-4 animate-in fade-in slide-in-from-bottom-4" style={{ borderColor: '#eee' }}>
            <p className="text-sm font-bold text-gray-500 mb-4 px-2">Selecciona un gato de la colonia:</p>
            
            {/* Contenedor del scroll con altura limitada */}
            <div style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '5px' }} className="custom-scrollbar">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {gatosColonia
                  .filter(g => !visibleCatIds.includes(g.id))
                  .map(g => (
                    <button 
                      key={g.id} 
                      onClick={() => addCatToView(g.id)}
                      className="flex items-center gap-4 p-3 hover:bg-blue-50 rounded-xl transition-colors w-full text-left"
                      style={{ border: '1px solid #f0f0f0', background: '#fff', cursor: 'pointer' }}
                    >
                      {/* --- ARREGLO DE LA IMAGEN EN EL SELECTOR --- */}
                      <img 
                        src={g.imagen} 
                        alt={g.nombre} 
                        style={{ 
                          width: '45px',      // Ancho fijo pequeño
                          height: '45px',     // Alto fijo pequeño
                          borderRadius: '50%', // Redonda
                          objectFit: 'cover', // Asegura que no se deforme
                          border: '2px solid #fff',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          flexShrink: 0       // Evita que se aplaste si el nombre es largo
                        }} 
                      />
                      <span className="font-medium" style={{ color: '#333', fontSize: '1rem' }}>{g.nombre}</span>
                    </button>
                  ))}
                
                {/* Mensaje si no quedan gatos por añadir */}
                {gatosColonia.filter(g => !visibleCatIds.includes(g.id)).length === 0 && (
                  <p className="text-center py-6 text-gray-400 text-sm italic bg-gray-50 rounded-xl">
                    Ya estás ayudando a todos los gatos de la colonia ❤️
                  </p>
                )}
              </div>
            </div>
            
            <button 
              onClick={() => setShowPicker(false)} 
              className="w-full mt-4 py-2 text-red-500 text-sm font-semibold hover:underline"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* RESUMEN FINAL */}
      <div className="donation-summary bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-inner" style={{ background: '#f9f9f9' }}>
        <div className="flex justify-between items-center mb-2">
          <span style={{ color: '#666' }}>Total estimado:</span>
          <span className="text-2xl font-bold" style={{ color: '#333' }}>{donationTotal} €</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span style={{ color: '#666' }}>Puntos Karma:</span>
          <span className="font-bold text-lg" style={{ color: '#f5a623' }}>{karmaTotal} ✨</span>
        </div>
        <p className="text-sm mb-6" style={{ color: '#888', fontStyle: 'italic' }}>Cada punto ayuda a cambiar vidas felinas 💛</p>
        
        <button 
          className="w-full py-4 bg-[#f5a623] text-white rounded-xl font-bold shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
          style={{ border: 'none', cursor: donationTotal > 0 ? 'pointer' : 'not-allowed', fontSize: '1.1rem' }}
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