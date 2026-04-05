"use client";

import { useState } from "react";
import { gatosColonia } from "@/lib/gatos";

export default function GatoCards() {
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
      [id]: !prev[id], // Si estaba bloqueada, se desbloquea y viceversa
    }));
  };

  const irAPagoStripe = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitamos que el clic en el botón active el giro de la carta
    window.location.href = "https://buy.stripe.com/tu_enlace_real";
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
                <div className="flip-face flip-front">
                  <img src={gato.imagen} alt={gato.nombre} style={imgStyle} />
                  <strong style={{ display: "block", marginTop: "10px" }}>{gato.nombre}</strong>
                  <small>{gato.colonia}</small>
                  <button onClick={irAPagoStripe} style={botonStyle}>Apadrinar 10€</button>
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
                  <button onClick={irAPagoStripe} style={{ ...botonStyle, backgroundColor: "#2ed573" }}>❤️ Ayudar</button>
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

// Estilos (Asegúrate de que coincidan con tus nombres de variables)
const tituloSeccion: React.CSSProperties = { fontSize: "2.2rem", color: "#2c3e50", marginBottom: "30px" };
const carouselWrapper: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" };
const gridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", flex: 1, perspective: "1000px" };
const imgStyle: React.CSSProperties = { width: "100%", height: "140px", objectFit: "cover", borderRadius: "8px" };
const botonStyle: React.CSSProperties = { background: "#ff4757", color: "white", border: "none", padding: "10px 15px", borderRadius: "20px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" };
const backTitle: React.CSSProperties = { margin: "0 0 10px 0", borderBottom: "1px solid #eee", paddingBottom: "5px" };
const listStyle: React.CSSProperties = { textAlign: "left", fontSize: "0.8rem", padding: "0", listStyle: "none", lineHeight: "1.5" };
const flechaStyle: React.CSSProperties = { background: "none", border: "none", fontSize: "2rem", cursor: "pointer" };