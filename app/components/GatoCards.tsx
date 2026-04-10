"use client";

import { useState, useEffect } from "react";
import { gatosColonia } from "@/lib/gatos";

interface GatoCardsProps {
  onPay: (name: string, amount: number) => void;
}

export default function GatoCards({ onPay }: GatoCardsProps) {
  const [indiceInicio, setIndiceInicio] = useState(0);
  const [flippedId, setFlippedId] = useState<number | null>(null);
  const [visibleCards, setVisibleCards] = useState(3);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const syncBreakpoints = () => {
      if (window.innerWidth < 640) {
        setVisibleCards(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCards(2);
      } else {
        setVisibleCards(3);
      }
    };

    syncBreakpoints();
    window.addEventListener("resize", syncBreakpoints);
    return () => window.removeEventListener("resize", syncBreakpoints);
  }, []);

  useEffect(() => {
    const maxStart = Math.max(0, gatosColonia.length - visibleCards);
    setIndiceInicio((prev) => Math.min(prev, maxStart));
  }, [visibleCards]);

  if (!mounted) return null;

  const gatosVisibles = gatosColonia.slice(indiceInicio, indiceInicio + visibleCards);

  const siguienteGato = () => {
    if (indiceInicio + visibleCards < gatosColonia.length) {
      setIndiceInicio((prev) => prev + 1);
      setFlippedId(null);
    }
  };

  const anteriorGato = () => {
    if (indiceInicio > 0) {
      setIndiceInicio((prev) => prev - 1);
      setFlippedId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-white/40 bg-white/65 px-3 py-5 text-center backdrop-blur-md sm:px-6">
      <h2 style={tituloSeccion}>🐾 Gatocan: Colonias</h2>

      <div className="relative mx-auto w-full max-w-6xl px-12 sm:px-14">
        <button
          onClick={anteriorGato}
          disabled={indiceInicio === 0}
          style={{ ...flechaStyle, opacity: indiceInicio === 0 ? 0.3 : 1 }}
          className="absolute left-1 top-1/2 z-10 -translate-y-1/2"
          aria-label="Anterior"
        >
          ⬅️
        </button>

        <div
          style={{ ...gridStyle, gridTemplateColumns: `repeat(${visibleCards}, minmax(0, 1fr))` }}
          className="mx-auto w-full"
        >
          {gatosVisibles.map((gato) => (
            <div
              key={gato.id}
              className={`flip-card ${flippedId === gato.id ? "is-flipped" : ""}`}
              onClick={() => setFlippedId((prevId) => (prevId === gato.id ? null : gato.id))}
              style={{ height: "400px", cursor: "pointer", width: "100%" }}
            >
              <div className="flip-card-inner">
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
          disabled={indiceInicio + visibleCards >= gatosColonia.length}
          style={{ ...flechaStyle, opacity: indiceInicio + visibleCards >= gatosColonia.length ? 0.3 : 1 }}
          className="absolute right-1 top-1/2 z-10 -translate-y-1/2"
          aria-label="Siguiente"
        >
          ➡️
        </button>
      </div>
    </div>
  );
}

const tituloSeccion: React.CSSProperties = { fontSize: "1.8rem", color: "#2c3e50", marginBottom: "20px", fontWeight: "800" };
const gridStyle: React.CSSProperties = { display: "grid", gap: "15px", perspective: "1000px" };
const faceContentStyle: React.CSSProperties = { display: "flex", flexDirection: "column", height: "100%", backgroundColor: "white", borderRadius: "12px", border: "1px solid #eee", overflow: "hidden" };
const imgStyle: React.CSSProperties = { width: "100%", height: "180px", objectFit: "cover", flexShrink: 0 };
const infoWrapperStyle: React.CSSProperties = { flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "10px" };
const nombreStyle: React.CSSProperties = { fontSize: "1.1rem", fontWeight: "bold", color: "#333" };
const coloniaStyle: React.CSSProperties = { color: "#666", fontSize: "0.85rem" };
const botonStyle: React.CSSProperties = { background: "#ff4757", color: "white", border: "none", padding: "12px", fontWeight: "bold", cursor: "pointer", width: "100%", marginTop: "auto" };
const backTitle: React.CSSProperties = { fontSize: "1rem", margin: "0 0 10px 0", borderBottom: "1px solid #eee", paddingBottom: "5px" };
const listStyle: React.CSSProperties = { textAlign: "left", fontSize: "0.8rem", padding: "0", listStyle: "none", lineHeight: "1.5", color: "#444", flexGrow: 1 };
const flechaStyle: React.CSSProperties = { background: "none", border: "none", fontSize: "1.8rem", cursor: "pointer", padding: "5px" };
