"use client";

import { useState } from "react";
import { gatosColonia } from "@/lib/gatos";

// Definimos la interfaz para que TypeScript no se queje
interface GatoCardsProps {
  onPay: (name: string, amount: number) => void;
}

export default function GatoCards({ onPay }: GatoCardsProps) {
  const [indiceInicio, setIndiceInicio] = useState(0);
  // Estado para saber qué cartas están "bloqueadas" por clic
  const [bloqueadas, setBloqueadas] = useState<{ [key: number]: boolean }>({});

  const gatosVisibles = gatosColonia.slice(indiceInicio, indiceInicio + 3);

  const siguienteGato = () => {
    if (indiceInicio + 3 < gatosColonia.length) setIndiceInicio(indiceInicio + 1);
  };

  const anteriorGato = () => {
    if (indiceInicio > 0) setIndiceInicio(indiceInicio - 1);
  };

  // Esta función activa/desactiva el bloqueo manual
  const toggleBloqueo = (id: number) => {
    setBloqueadas((prev) => ({
      ...prev,
      [id]: !prev[id], 
    }));
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2 style={tituloSeccion}>🐾 Gatocan: Colonias Felinas</h2>

      <div style={carouselWrapper}>
        <button onClick={anteriorGato} disabled={indiceInicio === 0} style={flechaStyle}>⬅️</button>

        <div className="flip-grid" style={gridStyle}>
          {gatosVisibles.map((gato) => (
            <div 
              key={gato.id} 
              // La clase 'is-flipped' se activa por clic, el resto lo hace el CSS con :hover
              className={`flip-card ${bloqueadas[gato.id] ? "is-flipped" : ""}`} 
              onClick={() => toggleBloqueo(gato.id)}
            >
              <div className="flip-card-inner">
                {/* CARA FRONTAL */}
                <div className="flip-face flip-front">
                  <img src={gato.imagen} alt={gato.nombre} style={imgStyle} />
                  <div style={{ padding: "10px" }}>
                    <strong style={{ display: "block", fontSize: "1.2rem" }}>{gato.nombre}</strong>
                    <small style={{ color: "#666" }}>{gato.colonia}</small>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Evita que la carta gire al clicar el botón
                        onPay(`Apadrinar a ${gato.nombre}`, 10);
                      }} 
                      style={botonStyle}
                    >
                      Apadrinar 10€
                    </button>
                  </div>
                </div>

                {/* CARA TRASERA */}
                <div className="flip-face flip-back" style={{ padding: "15px" }}>
                  <h4 style={backTitle}>Estado de {gato.nombre}</h4>
                  <ul style={listStyle}>
                    <li><strong>● Esterilización:</strong> {gato.detalles.esterilizacion}</li>
                    <li><strong>● Enfermedad:</strong> {gato.detalles.enfermedad}</li>
                    <li><strong>● Edad:</strong> {gato.detalles.edad}</li>
                    <li><strong>● Carácter:</strong> {gato.detalles.caracter}</li>
                  </ul>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Evita que la carta gire al clicar el botón
                      onPay(`Ayuda médica para ${gato.nombre}`, 10);
                    }} 
                    style={{ ...botonStyle, backgroundColor: "#2ed573" }}
                  >
                    ❤️ Ayudar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={siguienteGato} disabled={indiceInicio + 3 >= gatosColonia.length} style={flechaStyle}>➡️</button>
      </div>
    </div>
  );
}

// Estilos
const tituloSeccion: React.CSSProperties = { fontSize: "2.2rem", color: "#2c3e50", marginBottom: "30px", fontWeight: "800" };
const carouselWrapper: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" };
const gridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", flex: 1, perspective: "1000px" };
const imgStyle: React.CSSProperties = { width: "100%", height: "140px", objectFit: "cover", borderRadius: "8px" };
const botonStyle: React.CSSProperties = { background: "#ff4757", color: "white", border: "none", padding: "10px 15px", borderRadius: "20px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" };
const backTitle: React.CSSProperties = { margin: "0 0 10px 0", borderBottom: "1px solid #eee", paddingBottom: "5px", color: "#333" };
const listStyle: React.CSSProperties = { textAlign: "left", fontSize: "0.85rem", padding: "0", listStyle: "none", lineHeight: "1.6", color: "#444" };
const flechaStyle: React.CSSProperties = { background: "none", border: "none", fontSize: "2.5rem", cursor: "pointer" };