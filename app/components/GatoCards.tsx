"use client";

import { useState, useEffect } from "react";
import { gatosColonia } from "@/lib/gatos";

interface GatoCardsProps {
  onPay: (name: string, amount: number) => void;
}

export default function GatoCards({ onPay }: GatoCardsProps) {
  const [indiceInicio, setIndiceInicio] = useState(0);
  const [flippedId, setFlippedId] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!mounted) return null;

  const numGatosVisible = isMobile ? 1 : 3;
  const gatosVisibles = gatosColonia.slice(indiceInicio, indiceInicio + numGatosVisible);

  const siguienteGato = () => {
    if (indiceInicio + numGatosVisible < gatosColonia.length) {
      setIndiceInicio(indiceInicio + 1);
      setFlippedId(null);
    }
  };

  const anteriorGato = () => {
    if (indiceInicio > 0) {
      setIndiceInicio(indiceInicio - 1);
      setFlippedId(null);
    }
  };

  const handleCardClick = (id: number) => {
    setFlippedId((prevId) => (prevId === id ? null : id));
  };

  // --- ESTILOS CORREGIDOS ---
  const sectionStyle: React.CSSProperties = {
    textAlign: "center",
    // Reducimos el padding vertical para quitar "aire" arriba y abajo
    padding: isMobile ? "10px 10px" : "15px 0", 
    boxSizing: "border-box",
    width: "100%",
  };

  const carouselStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: isMobile ? "8px" : "20px",
    width: "100%",
    // Aumentamos el ancho máximo para que las tarjetas respiren
    maxWidth: isMobile ? "100%" : "1100px", 
    margin: "0 auto",
  };

  const gridMobileSafeStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${numGatosVisible}, 1fr)`,
    gap: "15px",
    perspective: "1000px",
    flex: "1",
    minWidth: 0,
    // En móvil, forzamos que no sea excesivamente ancha pero sí más que antes
    width: isMobile ? "90%" : "auto", 
    margin: "0 auto"
  };

  const flechaStyle: React.CSSProperties = {
    background: "rgba(255, 255, 255, 0.8)",
    border: "1px solid #e2e8f0",
    borderRadius: "8px", // Flechas más modernas, menos circulares
    width: "36px",
    height: "50px", // Más altas para que sea fácil darles con el pulgar
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1rem",
    flexShrink: 0,
    transition: "all 0.2s",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    backdropFilter: "blur(4px)",
    zIndex: 10
  };

  return (
    <div style={sectionStyle}>
      <h2 style={tituloSeccion}>🐾 Gatocan: Colonias</h2>

      <div style={carouselStyle}>
        <button 
          onClick={anteriorGato} 
          disabled={indiceInicio === 0} 
          style={{ ...flechaStyle, opacity: indiceInicio === 0 ? 0.3 : 1 }}
        >
          {isMobile ? "❮" : "⬅️"}
        </button>

        <div style={gridMobileSafeStyle}>
          {gatosVisibles.map((gato) => (
            <div 
              key={gato.id} 
              className={`flip-card ${flippedId === gato.id ? "is-flipped" : ""}`}
              onClick={() => handleCardClick(gato.id)}
              // Reducimos la altura de 420px a 380px para que sea más cuadrada/rectangular
              style={{ height: "380px", cursor: "pointer", width: "100%" }}
            >
              <div className="flip-card-inner">
                
                {/* CARA FRONTAL */}
                <div className="flip-face flip-front" style={faceContentStyle}>
                  {/* Reducimos un poco la imagen para dar espacio al texto en una carta más baja */}
                  <img src={gato.imagen} alt={gato.nombre} style={{...imgStyle, height: "180px"}} />
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
                      <li><strong>● Esteril.:</strong> {gato.detalles.esterilizacion}</li>
                      <li><strong>● Salud:</strong> {gato.detalles.enfermedad}</li>
                      <li><strong>● Edad:</strong> {gato.detalles.edad}</li>
                      <li><strong>● Carácter:</strong> {gato.detalles.caracter}</li>
                    </ul>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onPay(`Ayuda médica para ${gato.nombre}`, 10);
                      }} 
                      style={{ ...botonStyle, backgroundColor: "#2ed573" }}
                    >
                      ❤️ Ayudar
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={siguienteGato} 
          disabled={indiceInicio + numGatosVisible >= gatosColonia.length} 
          style={{ ...flechaStyle, opacity: indiceInicio + numGatosVisible >= gatosColonia.length ? 0.3 : 1 }}
        >
          {isMobile ? "❯" : "➡️"}
        </button>
      </div>
    </div>
  );
}

// --- ESTILOS ESTÁTICOS ---
const tituloSeccion: React.CSSProperties = { 
  fontSize: "1.4rem", 
  color: "#2c3e50", 
  marginBottom: "10px", // Reducido de 20px a 10px para quitar aire
  fontWeight: "800" 
};

const faceContentStyle: React.CSSProperties = { 
  display: "flex", 
  flexDirection: "column", 
  height: "100%", 
  backgroundColor: "white", 
  borderRadius: "12px", 
  border: "1px solid #eee", 
  overflow: "hidden", 
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)" 
};

const imgStyle: React.CSSProperties = { 
  width: "100%", 
  objectFit: "cover", 
  flexShrink: 0 
};

const infoWrapperStyle: React.CSSProperties = { 
  flexGrow: 1, 
  display: "flex", 
  flexDirection: "column", 
  justifyContent: "center", 
  padding: "10px 15px" // Reducido ligeramente
};

const nombreStyle: React.CSSProperties = { 
  fontSize: "1.1rem", 
  fontWeight: "bold", 
  color: "#333" 
};

const coloniaStyle: React.CSSProperties = { 
  color: "#666", 
  fontSize: "0.85rem" 
};

const botonStyle: React.CSSProperties = { 
  background: "#ff4757", 
  color: "white", 
  border: "none", 
  padding: "12px", // Reducido de 14px para ganar espacio
  fontWeight: "bold", 
  cursor: "pointer", 
  width: "100%", 
  marginTop: "auto" 
};

const backTitle: React.CSSProperties = { 
  fontSize: "1rem", 
  margin: "0 0 8px 0", 
  borderBottom: "1px solid #eee", 
  paddingBottom: "5px", 
  fontWeight: "bold" 
};

const listStyle: React.CSSProperties = { 
  textAlign: "left", 
  fontSize: "0.8rem", 
  padding: "0", 
  listStyle: "none", 
  lineHeight: "1.4", 
  color: "#444", 
  flexGrow: 1 
};
