"use client";

import React, { useState, useMemo } from "react";

// Definimos los tipos para que TypeScript esté contento
interface Gato {
  id: string;
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
  cardStyle: React.CSSProperties; // Pasamos el estilo de la card para que sea igual
}

// Opciones de donación (puedes moverlas aquí o pasarlas por props)
const donationOptions: DonationOption[] = [
  { id: "comida", label: "Comida (semana)", icon: "🥣", iconClassName: "food", price: 10, karma: 10 },
  { id: "vet", label: "Revisión Veterinaria", icon: "🏥", iconClassName: "vet", price: 30, karma: 35 },
  { id: "desparasitar", label: "Desparasitación", icon: "🪱", iconClassName: "bug", price: 15, karma: 15 },
];

export default function DonationSection({ gatosColonia, handlePayment, cardStyle }: DonationSectionProps) {
  const [openDonationCatId, setOpenDonationCatId] = useState<string | null>(null);
  const [donationSelections, setDonationSelections] = useState<Record<string, boolean>>({});

  // Cálculo de totales usando useMemo para eficiencia
  const { donationTotal, karmaTotal } = useMemo(() => {
    let total = 0;
    let karma = 0;
    
    // Recorremos las selecciones: la clave es "catId-optionId"
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

  return (
    <section id="donar" style={cardStyle} className="donation-card">
      <h3>Apoya nuestro trabajo con una donación</h3>
      <p>Cada aportación nos ayuda a cubrir gastos veterinarios, alimentación y tratamientos de urgencia.</p>
      <h3>Haz tu aporte gatuno 🐾</h3>
      <p>Abre cada gatete y marca el apoyo que quieras cubrir. Verás el total y tus <strong>Puntos Karma</strong> al momento.</p>

      {gatosColonia.map((cat) => (
        <details key={cat.id} className="donation-panel" open={openDonationCatId === cat.id}>
          <summary
            onClick={(event) => {
              event.preventDefault();
              // Si ya está abierto, lo cierra. Si no, abre el nuevo.
              setOpenDonationCatId(openDonationCatId === cat.id ? null : cat.id);
            }}
          >
            <span className="cat-summary">
              <img src={cat.imagen} alt={cat.nombre} />
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
                    className="donation-item"
                    checked={Boolean(donationSelections[key])}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setDonationSelections((prev) => ({ ...prev, [key]: checked }));
                    }}
                  />{" "}
                  <span className={`option-icon ${option.iconClassName}`}>{option.icon}</span> {option.label}
                </label>
              );
            })}
          </div>
        </details>
      ))}

      <div className="donation-summary" aria-live="polite">
        <p><strong>Total estimado:</strong> <span id="donation-total">{donationTotal} €</span></p>
        <p><strong>Puntos Karma:</strong> <span id="karma-total">{karmaTotal}</span></p>
        <p id="karma-message" className="karma-message">Cada punto ayuda a cambiar vidas felinas 💛</p>
        <button id="saveDonationScoreBtn" type="button" className="btn btn-secondary">Guardar puntos en mi perfil</button>
      </div>

      <button 
        className="btn btn-primary" 
        style={{ 
          marginTop: '20px', 
          width: '100%',
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
    </section>
  );
}