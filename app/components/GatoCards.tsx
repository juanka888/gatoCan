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

  // --- ESTILOS DINÁMICOS CORREGIDOS ---

  const sectionStyle: React.CSSProperties = {
    textAlign: "center",
    padding: isMobile ? "10px 5px" : "20px 0",
    boxSizing: "border-box",
    width: "100%",
    overflow: "hidden"
  };

  const carouselStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center", // Esto centra todo el bloque
    gap: isMobile ? "2px" : "15px",
    width: "100%",
    margin: "0 auto"
  };

  const gridMobileSafeStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${numGatosVisible}, 1fr)`,
    gap: "15px",
    perspective: "1000px",
    flex: isMobile ? "0 1 auto" : "1", // En móvil no crece, se ajusta al contenido
    maxWidth: isMobile ? "260px" : "100%", // Ancho controlado para que quepan flechas
    minWidth: 0,
  };

  const flechaMovilStyle: React.CSSProperties = {
    ...flechaStyle,
    opacity: indiceInicio === 0 ? 0.3 : 1,
    padding: isMobile ? "2px" : "10px",
    fontSize: isMobile ? "1.5rem" : "2rem",
    flexShrink: 0,
    zIndex: 10
  };

  const flechaMovilDerechaStyle: React.CSSProperties = {
    ...flechaStyle,
    opacity: indiceInicio + numGatosVisible >= gatosColonia.length ? 0.3 : 1,
    padding: isMobile ? "2px" : "10px",
    fontSize: isMobile ? "1.5rem" : "2rem",
    flexShrink: 0,
    zIndex: 10
  };

  return (
    <div style={sectionStyle}>
      <h2 style={tituloSeccion}>🐾 Gatocan: Colonias</h2>

      <div style={carouselStyle}>
        <button 
          onClick={anteriorGato} 
          disabled={indiceInicio === 0} 
          style={flechaMovilStyle}
        >
          ⬅️
        </button>

        <div style={gridMobileSafeStyle}>
          {gatosVisibles.map((gato) => (
            <div 
              key={gato.id} 
              className={`flip-card ${flippedId === gato.id ? "is-flipped" : ""}`}
              onClick={() => handleCardClick(gato.id)}
              style={{ height: "400px", cursor: "pointer", width: "100%" }}
            >
              <div className="flip-card-inner">
                
                {/* CARA FRONTAL */}
                <div className="flip-face flip-front" style={faceContentStyle}>
                  <img src={gato.imagen} alt={gato.nombre} style={imgStyle} />
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
                      style={{ ...botonStyle, backgroundColor: "#2ed573", borderRadius: "0 0 12px 12px" }}
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
          style={flechaMovilDerechaStyle}
        >
          ➡️
        </button>
      </div>
    </div>
  );
}

// --- ESTILOS BASE ---
const tituloSeccion: React.CSSProperties = { fontSize: "1.6rem", color: "#2c3e50", marginBottom: "15px", fontWeight: "800" };
const faceContentStyle: React.CSSProperties = { display: "flex", flexDirection: "column", height: "100%", backgroundColor: "white", borderRadius: "12px", border: "1px solid #eee", overflow: "hidden" };
const imgStyle: React.CSSProperties = { width: "100%", height: "180px", objectFit: "cover", flexShrink: 0 };
const infoWrapperStyle: React.CSSProperties = { flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "10px" };
const nombreStyle: React.CSSProperties = { fontSize: "1.1rem", fontWeight: "bold", color: "#333" };
const coloniaStyle: React.CSSProperties = { color: "#666", fontSize: "0.85rem" };
const botonStyle: React.CSSProperties = { background: "#ff4757", color: "white", border: "none", padding: "12px", fontWeight: "bold", cursor: "pointer", width: "100%", marginTop: "auto" };
const backTitle: React.CSSProperties = { fontSize: "1rem", margin: "0 0 10px 0", borderBottom: "1px solid #eee", paddingBottom: "5px" };
const listStyle: React.CSSProperties = { textAlign: "left", fontSize: "0.8rem", padding: "0", listStyle: "none", lineHeight: "1.5", color: "#444", flexGrow: 1 };
const flechaStyle: React.CSSProperties = { background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };
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
                      style={{ ...botonStyle, backgroundColor: "#2ed573", borderRadius: "0 0 12px 12px" }}
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
          style={flechaMovilDerechaStyle}
        >
          ➡️
        </button>
      </div>
    </div>
  );
}

// --- ESTILOS OPTIMIZADOS ---
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
