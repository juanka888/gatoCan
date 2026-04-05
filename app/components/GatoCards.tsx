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

  const handlePayment = (concepto: string, precio: number) => {
    alert(`Has elegido: ${concepto} (${precio}€)`);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ fontSize: '2.2rem', marginBottom: '30px', color: '#2c3e50' }}>🐾 Gatocan: Colonias Felinas</h2>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
        
        {/* Botón Izquierda */}
        <button 
          onClick={anteriorGato} 
          disabled={indiceInicio === 0}
          style={{ ...flechaStyle, opacity: indiceInicio === 0 ? 0.3 : 1 }}
        >
          ⬅️
        </button>

        {/* El Grid que me pasaste */}
        <div className="flip-grid" style={gridStyle}>
          {gatosVisibles.map((gato) => (
            <div className="flip-card" key={gato.id}>
              <label className="flip-card-inner">
                <input type="checkbox" className="flip-toggle" />
                
                {/* CARA FRONTAL */}
                <div className="flip-face flip-front">
                  <img src={gato.imagen} alt={gato.nombre} style={imgStyle} />
                  <strong style={{ display: 'block', marginTop: '10px' }}>{gato.nombre}</strong>
                  <small>{gato.colonia}</small>
                  <button 
                    onClick={(e) => { e.preventDefault(); handlePayment(`Apadrinar a ${gato.nombre}`, 10); }}
                    style={botonCaraFrontal}
                  >
                    Apadrinar 10€
                  </button>
                </div>

                {/* CARA TRASERA */}
                <div className="flip-face flip-back" style={{ padding: '15px' }}>
                  <h4 style={backTitle}>Estado de {gato.nombre}</h4>
                  <ul style={listStyle}>
                    <li><strong>● Esterilización:</strong> {gato.detalles.esterilizacion}</li>
                    <li><strong>● Enfermedad:</strong> {gato.detalles.enfermedad}</li>
                    <li><strong>● Tratamiento:</strong> {gato.detalles.tratamiento || "Sin tratamiento"}</li>
                    <li><strong>● Edad aprox.:</strong> {gato.detalles.edad}</li>
                    <li><strong>● Carácter:</strong> {gato.detalles.caracter || "Desconocido"}</li>
                  </ul>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); handlePayment(`Ayudar a ${gato.nombre}`, 10); }}
                    style={{ ...botonCaraFrontal, backgroundColor: '#2ed573', marginTop: '10px', width: '100%' }}
                  >
                    ❤️ Ayudar
                  </button>
                </div>
              </label>
            </div>
          ))}
        </div>

        {/* Botón Derecha */}
        <button 
          onClick={siguienteGato} 
          disabled={indiceInicio + 3 >= gatosColonia.length}
          style={{ ...flechaStyle, opacity: indiceInicio + 3 >= gatosColonia.length ? 0.3 : 1 }}
        >
          ➡️
        </button>
      </div>
    </div>
  );
}

// --- ESTILOS AUXILIARES ---
const gridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', perspective: '1000px', flex: 1 };
const imgStyle: React.CSSProperties = { width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' };
const botonCaraFrontal: React.CSSProperties = { background: '#ff4757', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' };
const backTitle: React.CSSProperties = { margin: '0 0 10px 0', borderBottom: '1px solid #eee', paddingBottom: '5px' };
const listStyle: React.CSSProperties = { textAlign: 'left', fontSize: '0.8rem', padding: '0', listStyle: 'none', lineHeight: '1.4' };
const flechaStyle: React.CSSProperties = { background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer' };