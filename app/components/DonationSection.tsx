"use client";

import React, { useState, useMemo } from "react";

// --- TIPOS ---
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

// --- OPCIONES DE DONACIÓN (REUTILIZANDO TUS DATOS) ---
const donationOptions: DonationOption[] = [
  { id: "comida", label: "Comida (semana)", icon: "🥣", iconClassName: "food", price: 10, karma: 10 },
  { id: "vet", label: "Revisión Veterinaria", icon: "🏥", iconClassName: "vet", price: 30, karma: 35 },
  { id: "desparasitar", label: "Desparasitación", icon: "🪱", iconClassName: "bug", price: 15, karma: 15 },
  // Añadimos la opción de unificar apadrinamiento si quieres:
  // { id: "apadrinar", label: "Apadrita este gato", icon: "💖", iconClassName: "heart", price: 15, karma: 20 },
];

export default function DonationSection({ gatosColonia, handlePayment, cardStyle }: DonationSectionProps) {
  // --- ESTADOS ---
  // Gatos visibles (empezamos con los 3 primeros)
  const [visibleCatIds, setVisibleCatIds] = useState<any[]>(gatosColonia.slice(0, 3).map(g => g.id));
  
  // Gato abierto (para el accordion)
  const [openDonationCatId, setOpenDonationCatId] = useState<any | null>(null);
  
  // Selecciones de checkboxes
  const [donationSelections, setDonationSelections] = useState<Record<string, boolean>>({});
  
  // Mostrar/Ocultar el buscador con scroll
  const [showPicker, setShowPicker] = useState(false);

  // --- CÁLCULO DE TOTALES (useMemo para eficiencia) ---
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

  // --- FUNCIONES DE LÓGICA ---
  const addCatToView = (id: any) => {
    if (!visibleCatIds.includes(id)) {
      setVisibleCatIds([...visibleCatIds, id]);
    }
    setOpenDonationCatId(id); // Lo abre automáticamente al añadirlo
    setShowPicker(false); // Cierra el buscador
  };

  return (
    <section id="donar" style={cardStyle} className="donation-card">
      <h3 style={{ color: '#FFFFFF' }}>Haz tu aporte gatuno 🐾</h3>
      <p>Abre cada gatete y marca el apoyo que quieras cubrir.</p>

      {/* 1. LISTADO DE GATOS VISIBLES (REUTILIZANDO TU CLASE donation-panel) */}
      <div className="cats-container" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {gatosColonia
          .filter(cat => visibleCatIds.includes(cat.id))
          .map((cat) => (
            <details 
              key={cat.id} 
              className="donation-panel" 
              open={openDonationCatId === cat.id}
            >
              <summary
                onClick={(event) => {
                  // LÓGICA DE MINIMIZAR: Quitamos event.preventDefault() para no romper el accordion
                  // y simplemente gestionamos qué gato está abierto en el estado.
                  const isCurrentlyOpen = openDonationCatId === cat.id;
                  setOpenDonationCatId(isCurrentlyOpen ? null : cat.id);
                }}
              >
                <span className="cat-summary">
                  <img src={cat.imagen} alt={cat.nombre} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                  <span>{cat.nombre}</span>
                </span>
              </summary>
              
              {/* USAMOS TU CLASE cat-options PARA RECUPERAR EL DISEÑO */}
              <div className="cat-options">
                {donationOptions.map((option) => {
                  const key = `${cat.id}-${option.id}`;
                  return (
                    <label key={key}>
                      <input
                        type="checkbox"
                        // USAMOS TU CLASE donation-item
                        className="donation-item"
                        checked={Boolean(donationSelections[key])}
                        onChange={(event) => {
                          const checked = event.target.checked;
                          setDonationSelections((prev) => ({ ...prev, [key]: checked }));
                        }}
                      />{" "}
                      {/* USAMOS TU CLASE option-icon */}
                      <span className={`option-icon ${option.iconClassName}`}>{option.icon}</span> {option.label}
                    </label>
                  );
                })}
              </div>
            </details>
          ))}
      </div>

      {/* 2. SELECTOR DE GATOS (EL MINI SCROLL) - Aseguramos visibilidad */}
      <div className="add-cat-selector" style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
        {!showPicker ? (
          <button 
            type="button" // Evita que envíe el formulario si lo hay
            onClick={() => setShowPicker(true)} 
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '12px', 
              border: '2px dashed rgba(255,255,255,0.4)', // Más visible
              background: 'rgba(255,255,255,0.05)', // Pequeño fondo para visibilidad
              color: 'white', 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            + Ayudar a otro gato (Ver colonia completa)
          </button>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '15px', padding: '15px', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>
            <p style={{ fontSize: '0.9rem', marginBottom: '10px', fontWeight: 'bold' }}>Selecciona un gato de la colonia:</p>
            
            {/* MINI SCROLL: maxHeight y overflowY */}
            <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '5px' }}>
              {gatosColonia.map(g => (
                <div 
                  key={g.id} 
                  onClick={() => addCatToView(g.id)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    padding: '10px', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <img src={g.imagen} alt={g.nombre} style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} />
                  <span style={{ fontSize: '0.95rem' }}>{g.nombre}</span>
                </div>
              ))}
            </div>
            
            <button 
              type="button"
              onClick={() => setShowPicker(false)} 
              style={{ width: '100%', marginTop: '10px', background: 'none', border: 'none', color: '#ff7675', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* 3. RESUMEN FINAL (REUTILIZANDO TU CLASE donation-summary) */}
      <div className="donation-summary" style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
        <p><strong>Total estimado:</strong> {donationTotal} €</p>
        <p><strong>Puntos Karma:</strong> {karmaTotal}</p>
        
        <button 
          className="btn btn-primary" 
          style={{ 
            marginTop: '15px', 
            width: '100%',
            // Estilos de opacidad para el botón principal
            opacity: donationTotal > 0 ? 1 : 0.6,
            cursor: donationTotal > 0 ? 'pointer' : 'not-allowed'
          }}
          disabled={donationTotal === 0}
          onClick={() => {
            handlePayment("Donación conjunta Colonias", donationTotal);
          }}
        >
          {donationTotal > 0 
            ? `Quiero confirmar mi aportación de ${donationTotal} €` 
            : "Selecciona una ayuda para continuar"}
        </button>
      </div>
    </section>
  );
}