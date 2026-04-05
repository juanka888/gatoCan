"use client";

import { useState } from "react";
import { gatosColonia } from "@/lib/gatos"; // Asegúrate de tener este archivo en lib/

export default function GatoCards() {
  const [indiceInicio, setIndiceInicio] = useState(0);
  const [flipped, setFlipped] = useState<{ [key: number]: boolean }>({});

  const gatosVisibles = gatosColonia.slice(indiceInicio, indiceInicio + 3);

  const siguienteGato = () => {
    if (indiceInicio + 3 < gatosColonia.length) setIndiceInicio(indiceInicio + 1);
  };

  const anteriorGato = () => {
    if (indiceInicio > 0) setIndiceInicio(indiceInicio - 1);
  };

  const toggleFlip = (id: number) => {
    setFlipped(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePayment = (concepto: string, precio: number) => {
    alert(`Has elegido: ${concepto} (${precio}€)`);
  };

  return (
    <>
      <h2 style={tituloSeccion}>🐾 Gatocan: Colonias Felinas</h2>
      
      <div style={carouselWrapper}>
        <button 
          onClick={anteriorGato} 
          disabled={indiceInicio === 0} 
          style={{ ...flechaStyle, opacity: indiceInicio === 0 ? 0.3 : 1 }}
        >
          ⬅️
        </button>

        <div style={gridStyle}>
          {gatosVisibles.map((gato) => (
            <div key={gato.id} onClick={() => toggleFlip(gato.id)} style={cardContainer}>
              <div style={{
                ...cardInner,
                transform: flipped[gato.id] ? "rotateY(180deg)" : "rotateY(0deg)"
              }}>
                {/* CARA FRONTAL */}
                <div style={cardFace}>
                  <img src={gato.imagen} alt={gato.nombre} style={imageStyle} />
                  <div style={infoContainer}>
                    <strong style={{ display: 'block', fontSize: '1.2rem' }}>{gato.nombre}</strong>
                    <small style={{ color: '#666' }}>{gato.colonia}</small>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handlePayment(`Apadrinar a ${gato.nombre}`, 10); }} 
                      style={btnStyle}
                    >
                      Apadrinar 10€
                    </button>
                  </div>
                </div>

                {/* CARA TRASERA */}
                <div style={{ ...cardFace, transform: "rotateY(180deg)", backgroundColor: "#fdfdfd", padding: "15px" }}>
                  <h4 style={backTitle}>Estado de {gato.nombre}</h4>
                  <ul style={listStyle}>
                    <li><strong>✂️ Esterilización:</strong> {gato.detalles.esterilizacion}</li>
                    <li><strong>🩺 Enfermedad:</strong> {gato.detalles.enfermedad}</li>
                    <li><strong>💊 Tratamiento:</strong> {gato.detalles.tratamiento}</li>
                    <li><strong>🎂 Edad:</strong> {gato.detalles.edad}</li>
                    <li><strong>🐱 Carácter:</strong> {gato.detalles.caracter}</li>
                  </ul>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handlePayment(`Ayudar a ${gato.nombre}`, 10); }} 
                    style={{ ...btnStyle, backgroundColor: '#2ed573', marginTop: 'auto' }}
                  >
                    ❤️ Ayudar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={siguienteGato} 
          disabled={indiceInicio + 3 >= gatosColonia.length} 
          style={{ ...flechaStyle, opacity: indiceInicio + 3 >= gatosColonia.length ? 0.3 : 1 }}
        >
          ➡️
        </button>
      </div>
    </>
  );
}

// --- ESTILOS DEL COMPONENTE ---
const tituloSeccion: React.CSSProperties = { fontSize: "2.5rem", color: "#2c3e50", marginBottom: "30px", fontWeight: "800", textAlign: "center" };
const carouselWrapper: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", gap: "20px" };
const gridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', flex: 1, perspective: '1000px' };
const cardContainer: React.CSSProperties = { height: "400px", perspective: "1000px", cursor: "pointer" };
const cardInner: React.CSSProperties = { position: "relative", width: "100%", height: "100%", transition: "transform 0.6s", transformStyle: "preserve-3d" };
const cardFace: React.CSSProperties = { position: "absolute", width: "100%", height: "100%", backfaceVisibility: "hidden", borderRadius: "16px", boxShadow: "0 8px 20px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid #eee", background: "white" };
const imageStyle: React.CSSProperties = { width: '100%', height: '180px', objectFit: 'cover' };
const infoContainer: React.CSSProperties = { padding: "20px", textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" };
const btnStyle: React.CSSProperties = { background: '#ff4757', color: 'white', border: 'none', padding: '12px', borderRadius: '25px', fontWeight: 'bold', cursor: 'pointer' };
const backTitle: React.CSSProperties = { margin: '0 0 10px 0', borderBottom: '1px solid #eee', paddingBottom: '5px' };
const listStyle: React.CSSProperties = { textAlign: 'left', fontSize: '0.85rem', padding: '0', listStyle: 'none', lineHeight: '1.6', color: '#444' };
const flechaStyle: React.CSSProperties = { background: "none", border: "none", fontSize: "2.5rem", cursor: "pointer" };