import React from 'react';

interface StatsProps {
  total: number;
  usuarios: number;
  anonimo: number;
}

const StatsDonaciones = ({ total, usuarios, anonimo }: StatsProps) => {
  const cardStyle: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "1.5rem",
    textAlign: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", margin: "1rem 0" }}>
      <div style={cardStyle}>
        <h4 style={{ color: "#0f4c5c", margin: 0 }}>Total Recaudado</h4>
        <p style={{ fontSize: "1.8rem", fontWeight: "bold", margin: "0.5rem 0" }}>{total}€</p>
      </div>
      <div style={cardStyle}>
        <h4 style={{ color: "#0f766e", margin: 0 }}>Socios Logueados</h4>
        <p style={{ fontSize: "1.8rem", fontWeight: "bold", margin: "0.5rem 0" }}>{usuarios}€</p>
      </div>
      <div style={cardStyle}>
        <h4 style={{ color: "#64748b", margin: 0 }}>Donaciones Anónimas</h4>
        <p style={{ fontSize: "1.8rem", fontWeight: "bold", margin: "0.5rem 0" }}>{anonimo}€</p>
      </div>
    </div>
  );
};

export default StatsDonaciones;