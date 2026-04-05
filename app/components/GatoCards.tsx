"use client";

import { useState } from "react";
import { gatosColonia } from "@/lib/gatos";

export default function GatoCards() {
  const [indiceInicio, setIndiceInicio] = useState(0);

  const gatosVisibles = gatosColonia.slice(indiceInicio, indiceInicio + 3);

  const siguienteGato = () => {
    if (indiceInicio + 3 < gatosColonia.length) setIndiceInicio(indiceInicio + 1);
  };

  const anteriorGato = () => {
    if (indiceInicio > 0) setIndiceInicio(indiceInicio - 1);
  };

  // FUNCIÓN PARA REDIRIGIR A STRIPE
  const irAPagoStripe = (precioId: string) => {
    // Aquí debes poner tu enlace real de Stripe Checkout o la lógica de tu API
    // Por ahora, si tienes un enlace directo de Stripe, úsalo aquí:
    window.location.href = `https://buy.stripe.com/tu_enlace_aqui?client_reference_id=donacion_gatos`;
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2 style={tituloSeccion}>🐾 Gatocan: Colonias Felinas</h2>
      
      <div style={carouselWrapper}>
        <button onClick={anteriorGato} disabled={indiceInicio === 0} style={flechaStyle}>⬅️</button>

        <div className="flip-grid" style={gridStyle}>
          {gatosVisibles.map((gato) => (
            <div className="flip-card" key={gato.id}>
              {/* Usamos el ID del gato para el 'htmlFor' y el 'id' del input para que el clic funcione */}
              <input type="checkbox" id={`flip-${gato.id}`} className="flip-toggle" style={{ display: 'none' }} />
              <label htmlFor={`flip-${gato.id}`} className="flip-card-inner">
                
                {/* CARA FRONTAL */}
                <div className="flip-face flip-front">
                  <img src={gato.imagen} alt={gato.nombre} style={imgStyle} />
                  <strong style={{ display: 'block', marginTop: '10px' }}>{gato.nombre}</strong>
                  <small>{gato.colonia}</small>
                  <button 
                    onClick={(e) => { 
                      e.preventDefault(); // Evita que la carta gire al pulsar el botón
                      e.stopPropagation();
                      irAPagoStripe("price_H12345"); // Tu ID de Stripe
                    }}
                    style={botonStyle}
                  >
                    Apadrinar 10€
                  </button>
                </div>

                {/* CARA TRASERA */}
                <div className="flip-face flip-back">
                  <h4 style={backTitle}>Estado de {gato.nombre}</h4>
                  <ul style={listStyle}>
                    <li><strong>✂️ Esterilización:</strong> {gato.detalles.esterilizacion}</li>
                    <li><strong>🩺 Enfermedad:</strong> {gato.detalles.enfermedad}</li>
                    <li><strong>💊 Tratamiento:</strong> {gato.detalles.tratamiento}</li>
                    <li><strong>🎂 Edad:</strong> {gato.detalles.edad}</li>
                  </ul>
                  <button 
                    onClick={(e) => { 
                      e.preventDefault();
                      e.stopPropagation();
                      irAPagoStripe("price_H12345"); 
                    }}
                    style={{ ...botonStyle, backgroundColor: '#2ed573' }}
                  >
                    ❤️ Ayudar
                  </button>
                </div>
              </label>
            </div>
          ))}
        </div>

        <button onClick={siguienteGato} disabled={indiceInicio + 3 >= gatosColonia.length} style={flechaStyle}>➡️</button>
      </div>
    </div>
  );
}

// --- ESTILOS ---
const tituloSeccion: React.CSSProperties = { fontSize: "2.2rem", color: "#2c3e50", marginBottom: "30px" };
const carouselWrapper: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" };
const gridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', flex: 1 };
const imgStyle: React.CSSProperties = { width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' };
const botonStyle: React.CSSProperties = { background: '#ff4757', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' };
const backTitle: React.CSSProperties = { margin: '0 0 10px 0', borderBottom: '1px solid #eee', paddingBottom: '5px' };
const listStyle: React.CSSProperties = { textAlign: 'left', fontSize: '0.8rem', padding: '0', listStyle: 'none', lineHeight: '1.6' };
const flechaStyle: React.CSSProperties = { background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer' };