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
  { id: "comida", label: "Comida (semana)", icon: "🥣", iconClassName: "food", price: 10, karma: 10 },
  { id: "vet", label: "Revisión Veterinaria", icon: "🏥", iconClassName: "vet", price: 30, karma: 35 },
  { id: "desparasitar", label: "Desparasitación", icon: "🪱", iconClassName: "bug", price: 15, karma: 15 },
];

export default function DonationSection({ gatosColonia, handlePayment, cardStyle }: DonationSectionProps) {
  // 1. Estado para saber qué gatos se muestran (empezamos con los 3 primeros)
  const [visibleCatIds, setVisibleCatIds] = useState<any[]>(gatosColonia.slice(0, 3).map(g => g.id));
  const [openDonationCatId, setOpenDonationCatId] = useState<any | null>(null);
  const [donationSelections, setDonationSelections] = useState<Record<string, boolean>>({});
  
  // Estado para mostrar/ocultar el selector de gatos
  const [showPicker, setShowPicker] = useState(false);

  const { donationTotal, karmaTotal } = useMemo(() => {
    let total = 0;
    let karma = 0;
    Object.entries(donationSelections).forEach(([key, checked]) => {
      if (checked) {
        const optionId = key.split("-")[1];
        const option = donationOptions.find((o) => o.id === optionId);
        if (option) {
          total += option.price;
          karma += option.karma;
        }
      }
    });
    return { donationTotal: total, karmaTotal: karma };
  }, [donationSelections]);

  // Función para añadir un gato a la lista visual
  const addCatToView = (id: any) => {
    if (!visibleCatIds.includes(id)) {
      setVisibleCatIds([...visibleCatIds, id]);
    }
    setOpenDonationCatId(id); // Lo abre automáticamente al añadirlo
    setShowPicker(false); // Cierra el buscador
  };

  return (
    <section id="donar" style={cardStyle} className="donation-card">
      <h3>Haz tu aporte gatuno 🐾</h3>
      <p>Abre cada gatete y marca el apoyo que quieras cubrir.</p>

      {/* LISTADO DE GATOS VISIBLES */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {gatosColonia
          .filter(cat => visibleCatIds.includes(cat.id))
          .map((cat) => (
            <details key={cat.id} className="donation-panel" open={openDonationCatId === cat.id}>
              <summary
                onClick={(event) => {
                  event.preventDefault();
                  // Lógica de minimizar: si pincho el que ya está abierto, se cierra (null)
                  setOpenDonationCatId(openDonationCatId === cat.id ? null : cat.id);
                }}
              >
                <span className="cat-summary">
                  <img src={cat.imagen} alt={cat.nombre} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                  <span>{cat.nombre}</span>
                </span>
              </summary>
              <div className="cat-options">
                {donationOptions.map((option) => {
                  const key = `${cat.id}-${option.id}`;
                  return (
                    <label key={key}>
                      <input
                        type="checkbox"
                        checked={Boolean(donationSelections[key])}
                        onChange={(e) => setDonationSelections(prev => ({ ...prev, [key]: e.target.checked }))}
                      />{" "}
                      <span className={`option-icon ${option.iconClassName}`}>{option.icon}</span> {option.label}
                    </label>
                  );
                })}
              </div>
            </details>
          ))}
      </div>

      {/* SELECTOR DE GATOS (EL MINI SCROLL) */}
      <div style={{ marginTop: '15px' }}>
        {!showPicker ? (
          <button 
            onClick={() => setShowPicker(true)} 
            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px dashed rgba(255,255,255,0.3)', background: 'transparent', color: 'white', cursor: 'pointer' }}
          >
            + Ayudar a otro gato de la colonia
          </button>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '15px', padding: '10px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <p style={{ fontSize: '0.8rem', marginBottom: '8px', opacity: 0.8 }}>Selecciona un gato para añadirlo:</p>
            <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {gatosColonia.map(g => (
                <div 
                  key={g.id} 
                  onClick={() => addCatToView(g.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)' }}
                >
                  <img src={g.imagen} alt={g.nombre} style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
                  <span style={{ fontSize: '0.9rem' }}>{g.nombre}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowPicker(false)} style={{ width: '100%', marginTop: '10px', background: 'none', border: 'none', color: '#ff7675', cursor: 'pointer', fontSize: '0.8rem' }}>
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* RESUMEN FINAL */}
      <div className="donation-summary" style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
        <p><strong>Total estimado:</strong> {donationTotal} €</p>
        <p><strong>Puntos Karma:</strong> {karmaTotal}</p>
        
        <button 
          className="btn btn-primary" 
          style={{ 
            marginTop: '15px', 
            width: '100%',
            opacity: donationTotal > 0 ? 1 : 0.6,
            cursor: donationTotal > 0 ? 'pointer' : 'not-allowed'
          }}
          disabled={donationTotal === 0}
          onClick={() => handlePayment("Donación conjunta Colonias", donationTotal)}
        >
          {donationTotal > 0 ? `Confirmar aportación de ${donationTotal} €` : "Selecciona una ayuda"}
        </button>
      </div>
    </section>
  );
}