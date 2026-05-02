export default function LegislacionPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#111", color: "#f5f5f5", padding: "30px 20px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.16)", borderRadius: "18px", padding: "24px" }}>
        <h1 style={{ marginTop: 0, fontSize: "1.9rem" }}>Legislación y Gestión de Colonias Felinas</h1>
        <section style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "8px" }}>Introducción</h2>
          <p style={{ lineHeight: 1.6, margin: 0 }}>
            En España, la gestión integral de colonias felinas es una obligación legal de carácter municipal dentro del marco de protección animal.
            La normativa estatal exige actuaciones planificadas y sostenidas para garantizar el bienestar de los gatos comunitarios mediante protocolos
            como CER (Captura, Esterilización y Retorno), control sanitario, alimentación adecuada y seguimiento técnico.
          </p>
        </section>
        <section style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "8px" }}>Obligaciones del Ayuntamiento</h2>
          <p style={{ lineHeight: 1.6, marginTop: 0 }}>
            El incumplimiento de las obligaciones municipales puede contravenir la <strong>Ley 7/2023</strong> (arts. 38-42), que regula la gestión ética
            de colonias felinas y la responsabilidad de las administraciones públicas en materia de bienestar animal.
          </p>
          <p style={{ lineHeight: 1.6, marginBottom: 0 }}>
            Asimismo, la <strong>Ley de Bases del Régimen Local (LBRL)</strong> en sus arts. 25-26 atribuye competencias a los ayuntamientos en servicios
            públicos y salubridad, incluyendo actuaciones de protección y control en el entorno urbano y rural.
          </p>
        </section>
        <section style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "8px" }}>Recursos obligatorios</h2>
          <ul style={{ lineHeight: 1.7, margin: 0, paddingLeft: "20px" }}>
            <li>Creación de partidas presupuestarias específicas para la gestión de colonias felinas.</li>
            <li>Justificación del uso de remanentes cuando proceda para cubrir obligaciones de bienestar animal.</li>
            <li>Apoyo subsidiario de las Diputaciones para municipios con insuficiencia de medios técnicos o económicos.</li>
          </ul>
        </section>
        <section>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "8px" }}>Descarga del documento</h2>
          <a href="/Masterclass_Colonias_Felinas.pdf" target="_blank" rel="noreferrer" style={{ color: "#ffd166", fontWeight: 700, textDecoration: "underline" }}>
            Descargar documento: Gestión Integral de Colonias Felinas (PDF)
          </a>
        </section>
      </div>
    </main>
  );
}
