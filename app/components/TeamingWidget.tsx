"use client";

import React from "react";

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "1rem",
  width: "100%",
  maxWidth: "1200px",
  margin: "0 auto 2rem auto",
  textAlign: "center"
};

export default function TeamingWidget() {
  return (
    <section id="teaming" style={cardStyle}>
      <h3>Apóyanos en Teaming</h3>
      <p>Con solo 1€ al mes nos ayudas a salvar vidas.</p>

      <div className="teaming-container" style={{ display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
        {/* VERSIÓN PC */}
        <div className="t-desktop">
          <iframe 
            src="https://www.teaming.net/group/spread/widgets/vhhzRoTGtqKuuLnVWB2kVKfrWgONnGQd06Cg6Uu6MSVJh/6?lang=es_ES&TM=true" 
            width="696" 
            height="315" 
            frameBorder="0" 
            scrolling="no" 
            style={{ border: "none" }} 
            title="Teaming Desktop"
          />
        </div>

        {/* VERSIÓN MÓVIL */}
        <div className="t-mobile">
          <iframe 
            src="https://www.teaming.net/group/spread/widgets/vhhzRoTGtqKuuLnVWB2kVKfrWgONnGQd06Cg6Uu6MSVJh/7?lang=es_ES&TM=true" 
            width="305" 
            height="567" 
            frameBorder="0" 
            scrolling="no" 
            style={{ border: "none" }} 
            title="Teaming Mobile"
          />
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <a 
          href="https://www.teaming.net/asociaciongatocannaturarural" 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          Unirse al Grupo de Teaming
        </a>
      </div>
    </section>
  );
}