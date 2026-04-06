"use client";

import { useState, useEffect } from "react";
import { gatosColonia } from "@/lib/gatos";

interface GatoCardsProps {
  onPay: (name: string, amount: number) => void;
}

export default function GatoCards({ onPay }: GatoCardsProps) {
  const [indiceInicio, setIndiceInicio] = useState(0);
  // Estado para saber qué tarjeta está girada
  const [flippedId, setFlippedId] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const numGatosVisible = isMobile ? 1 : 3;
  const gatosVisibles = gatosColonia.slice(indiceInicio, indiceInicio + numGatosVisible);

  const siguienteGato = () => {
    if (indiceInicio + numGatosVisible < gatosColonia.length) {
      setIndiceInicio(indiceInicio + 1);
      setFlippedId(null); // Resetear giro al cambiar de gato
    }
  };

  const anteriorGato = () => {
    if (indiceInicio > 0) {
      setIndiceInicio(indiceInicio - 1);
      setFlippedId(null); // Resetear giro al cambiar de gato
    }
  };

  // NUEVA LÓGICA DE GIRO: Si ya está girada, vuelve al frente. Si no, gira.
  const handleCardClick = (id: number) => {
    setFlippedId(flippedId === id ? null : id);
  };

  return (
    <div style={{ textAlign: "center", padding: "0 10px" }}>
      <h2 style={tituloSeccion}>🐾 Gatocan: Colonias</h2>

      <div style={carouselWrapper}>
        <button 
          onClick={anteriorGato} 
          disabled={indiceInicio === 0} 
          style={{...flechaStyle, opacity: indiceInicio === 0 ? 0.3 : 1}}
        >
          ⬅️
        </button>

        <div style={{
          ...gridStyle, 
          gridTemplateColumns: `repeat(${numGatosVisible}, 1fr)`,
          maxWidth: isMobile ? "300px" : "100%" 
        }}>
          {gatosVisibles.map((gato) => (
            <div 
              key={gato.id} 
              className={`flip-card ${flippedId === gato.id ? "is-flipped" : ""}`} 
              onClick={() => handleCardClick(gato.id)}
              style={{ height: "400px", cursor: "pointer" }}
            >
              <div className="flip-card-inner">
                
                {/* CARA FRONTAL (FOTO) */}
                <div className="flip-face flip-front" style={faceContentStyle}>
                  <img src={gato.imagen} alt={gato.nombre} style={imgStyle} />
                  <div style={infoWrapperStyle}>
                    <strong style={nombreStyle}>{gato.nombre}</strong>
                    <small style={coloniaStyle}>{gato.colonia}</small>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // IMPORTANTE: Evita que la carta gire al pagar
                      onPay(`Apadrinar a ${gato.nombre}`, 10);
                    }} 
                    style={botonStyle}
                  >
                    Apadrinar 10€
                  </button>
                </div>

                {/* CARA TRASERA (DETALLES) */}
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
                        e.stopPropagation(); // Evita que la carta gire al pagar
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
          style={{...flechaStyle, opacity: (indiceInicio + numGatosVisible >= gatosColonia.length) ? 0.3 : 1}}
        >
          ➡️
        </button>
      </div>
    </div>
  );
}

// --- ESTILOS MANTENIDOS ---
const tituloSeccion: React.CSSProperties = { fontSize: "1.8rem", color: "#2c3e50", marginBottom: "20px", fontWeight: "800" };
const carouselWrapper: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", width: "100%" };
const gridStyle: React.CSSProperties = { display: "grid", gap: "15px", flex: 1, perspective: "1000px", margin: "0 auto" };
const faceContentStyle: React.CSSProperties = { display: "flex", flexDirection: "column", height: "100%", backgroundColor: "white", borderRadius: "12px", border: "1px solid #eee", overflow: "hidden" };
const imgStyle: React.CSSProperties = { width: "100%", height: "180px", objectFit: "cover", flexShrink: 0 };
const infoWrapperStyle: React.CSSProperties = { flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "10px" };
const nombreStyle: React.CSSProperties = { fontSize: "1.1rem", fontWeight: "bold", color: "#333" };
const coloniaStyle: React.CSSProperties = { color: "#666", fontSize: "0.85rem" };
const botonStyle: React.CSSProperties = { background: "#ff4757", color: "white", border: "none", padding: "12px", fontWeight: "bold", cursor: "pointer", width: "100%", marginTop: "auto" };
const backTitle: React.CSSProperties = { fontSize: "1rem", margin: "0 0 10px 0", borderBottom: "1px solid #eee", paddingBottom: "5px" };
const listStyle: React.CSSProperties = { textAlign: "left", fontSize: "0.8rem", padding: "0", listStyle: "none", lineHeight: "1.5", color: "#444", flexGrow: 1 };
const flechaStyle: React.CSSProperties = { background: "none", border: "none", fontSize: "1.8rem", cursor: "pointer", padding: "5px" };
          ))}
        </div>

        <button 
          onClick={siguienteGato} 
          disabled={indiceInicio + numGatosVisible >= gatosColonia.length} 
          style={{...flechaStyle, opacity: (indiceInicio + numGatosVisible >= gatosColonia.length) ? 0.3 : 1}}
        >
          ➡️
        </button>
      </div>
    </div>
  );
}

// --- ESTILOS ADAPTADOS ---

const tituloSeccion: React.CSSProperties = { 
  fontSize: "1.8rem", 
  color: "#2c3e50", 
  marginBottom: "20px", 
  fontWeight: "800" 
};

const carouselWrapper: React.CSSProperties = { 
  display: "flex", 
  alignItems: "center", 
  justifyContent: "center", 
  gap: "5px",
  width: "100%"
};

const gridStyle: React.CSSProperties = { 
  display: "grid", 
  gap: "15px", 
  flex: 1, 
  perspective: "1000px",
  margin: "0 auto"
};

const faceContentStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  backgroundColor: "white",
  borderRadius: "12px",
  border: "1px solid #eee",
  overflow: "hidden"
};

const imgStyle: React.CSSProperties = { 
  width: "100%", 
  height: "180px", 
  objectFit: "cover",
  flexShrink: 0
};

const infoWrapperStyle: React.CSSProperties = {
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  padding: "10px"
};

const nombreStyle: React.CSSProperties = { fontSize: "1.1rem", fontWeight: "bold", color: "#333" };
const coloniaStyle: React.CSSProperties = { color: "#666", fontSize: "0.85rem" };

const botonStyle: React.CSSProperties = { 
  background: "#ff4757", 
  color: "white", 
  border: "none", 
  padding: "12px", 
  borderRadius: "0 0 12px 12px",
  fontWeight: "bold", 
  cursor: "pointer", 
  width: "100%"
};

const backTitle: React.CSSProperties = { fontSize: "1rem", margin: "0 0 10px 0", borderBottom: "1px solid #eee", paddingBottom: "5px" };
const listStyle: React.CSSProperties = { textAlign: "left", fontSize: "0.8rem", padding: "0", listStyle: "none", lineHeight: "1.5", color: "#444", flexGrow: 1 };
const flechaStyle: React.CSSProperties = { background: "none", border: "none", fontSize: "1.8rem", cursor: "pointer", padding: "5px" };
