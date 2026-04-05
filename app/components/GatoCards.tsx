"use client";

import { useState } from "react";
import { gatosColonia } from "@/lib/gatos";

interface GatoCardsProps {
  onPay: (name: string, amount: number) => void;
}

export default function GatoCards({ onPay }: GatoCardsProps) {
  const [indiceInicio, setIndiceInicio] = useState(0);
  const [bloqueadas, setBloqueadas] = useState<{ [key: number]: boolean }>({});

  const gatosVisibles = gatosColonia.slice(indiceInicio, indiceInicio + 3);

  const siguienteGato = () => {
    if (indiceInicio + 3 < gatosColonia.length) setIndiceInicio(indiceInicio + 1);
  };

  const anteriorGato = () => {
    if (indiceInicio > 0) setIndiceInicio(indiceInicio - 1);
  };

  const toggleBloqueo = (id: number) => {
    setBloqueadas((prev) => ({ ...prev, [id]: !prev[id] }));
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
              className={`flip-card ${bloqueadas[gato.id] ? "is-flipped" : ""}`} 
              onClick={() => toggleBloqueo(gato.id)}
            >
              <div className="flip-card-inner">
                
                {/* CARA FRONTAL */}
                <div className="flip-face flip-front" style={faceContentStyle}>
                  <img src={gato.imagen} alt={gato.nombre} style={imgStyle} />
                  
                  {/* Este contenedor ocupa todo el espacio sobrante empujando el botón abajo */}
                  <div style={infoWrapperStyle}>
                    <strong style={nombreStyle}>{gato.nombre}</strong>
                    <small style={coloniaStyle}>{gato.colonia}</small>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); 
                      onPay(`Apadrinar a ${gato.nombre}`, 10);
                    }} 
                    style={botonStyle}
                  >
                    Apadrinar 10€
                  </button>
                </div>

                {/* CARA TRASERA */}
                <div className="flip-face flip-back" style={faceContentStyle}>
                  <div style={{ padding: "15px", height: "100%", display: "flex", flexDirection: "column" }}>
                    <h4 style={backTitle}>Estado de {gato.nombre}</h4>
                    <ul style={listStyle}>
                      <li><strong>● Esterilización:</strong> {gato.detalles.esterilizacion}</li>
                      <li><strong>● Enfermedad:</strong> {gato.detalles.enfermedad}</li>
                      <li><strong>● Edad:</strong> {gato.detalles.edad}</li>
                      <li><strong>● Carácter:</strong> {gato.detalles.caracter}</li>
                    </ul>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onPay(`Ayuda médica para ${gato.nombre}`, 10);
                      }} 
                      style={{ ...botonStyle, backgroundColor: "#2ed573", marginTop: "auto" }}
                    >
                      ❤️ Ayudar
                    </button>
                  </div>
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

// --- ESTILOS MEJORADOS ---

const tituloSeccion: React.CSSProperties = { fontSize: "2.2rem", color: "#2c3e50", marginBottom: "30px", fontWeight: "800" };
const carouselWrapper: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" };
const gridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", flex: 1, perspective: "1000px" };

const faceContentStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  backgroundColor: "white",
  borderRadius: "12px",
  overflow: "hidden"
};

const imgStyle: React.CSSProperties = { 
  width: "100%", 
  height: "160px", 
  objectFit: "cover", 
  flexShrink: 0 // Evita que la imagen se encoja si hay mucho texto
};

const infoWrapperStyle: React.CSSProperties = {
  flexGrow: 1, // Esto hace que este div "empuje" al botón hacia abajo
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  padding: "10px"
};

const nombreStyle: React.CSSProperties = { display: "block", fontSize: "1.2rem", color: "#333" };
const coloniaStyle: React.CSSProperties = { display: "block", color: "#666", fontSize: "0.9rem" };

const botonStyle: React.CSSProperties = { 
  background: "#ff4757", 
  color: "white", 
  border: "none", 
  padding: "12px", 
  borderRadius: "0 0 12px 12px", // Botón pegado al borde inferior
  fontWeight: "bold", 
  cursor: "pointer", 
  width: "100%",
  flexShrink: 0
};

const backTitle: React.CSSProperties = { margin: "0 0 10px 0", borderBottom: "1px solid #eee", paddingBottom: "5px", color: "#333" };
const listStyle: React.CSSProperties = { textAlign: "left", fontSize: "0.85rem", padding: "0", listStyle: "none", lineHeight: "1.6", color: "#444", flexGrow: 1 };
const flechaStyle: React.CSSProperties = { background: "none", border: "none", fontSize: "2.5rem", cursor: "pointer" };