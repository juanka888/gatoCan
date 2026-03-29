import Link from "next/link";
import type { CSSProperties } from "react";
import EuropaPressNews from "./components/EuropaPressNews";

export default function HomePage() {
  return (
    <main style={{ background: "#f6f7f8", color: "#111", minHeight: "100vh" }}>
      <header id="inicio" style={{ background: "#0f4c5c", color: "#fff", padding: "1.2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gap: "1rem" }}>
          <div>
            <p style={{ margin: 0, opacity: 0.9 }}>Asociación de protección animal</p>
            <h1 style={{ margin: "0.35rem 0" }}>GatoCan Natura Rural</h1>
          </div>

          <nav aria-label="Principal">
            <ul style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", listStyle: "none", padding: 0 }}>
              <li><a href="#inicio">Inicio</a></li>
              <li><a href="#mision">Misión</a></li>
              <li><a href="#colonias">Colonias</a></li>
              <li><a href="#fichas">Fichas</a></li>
              <li><a href="#ayuda">Cómo ayudar</a></li>
              <li><a href="#noticias">Noticias</a></li>
              <li><Link href="/foro">Foro</Link></li>
              <li><Link href="/perfil">Perfil</Link></li>
              <li><Link href="/rankings">Rankings</Link></li>
              <li><a href="#donar">Donar</a></li>
            </ul>
          </nav>

          <section style={{ padding: "1rem", background: "rgba(255,255,255,0.12)", borderRadius: 12 }}>
            <h2 style={{ marginTop: 0 }}>Cuidamos colonias felinas con responsabilidad y compromiso</h2>
            <p>
              Aplicamos el método CER para mejorar la vida de los gatos comunitarios y fomentar
              una convivencia respetuosa en el entorno rural.
            </p>
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              <Link href="/login">Acceder</Link>
              <Link href="/register">Crear cuenta</Link>
              <a href="#ayuda">Hazte voluntario/a</a>
              <a href="#donar">Donar ahora</a>
            </div>
          </section>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: "1rem auto", padding: "0 1rem", display: "grid", gap: "1rem" }}>
        <section id="mision" style={cardStyle}>
          <h3>Misión y valores</h3>
          <p>
            Trabajamos para proteger, esterilizar y cuidar a los gatos de colonias felinas mediante
            acciones coordinadas con personas voluntarias, clínicas veterinarias y administraciones locales.
          </p>
        </section>

        <section id="colonias" style={cardStyle}>
          <h3>Colonias felinas</h3>
          <p>
            Realizamos seguimiento sanitario, alimentación controlada y campañas de sensibilización para
            garantizar colonias estables, saludables y bien gestionadas.
          </p>
        </section>

        <section id="fichas" style={cardStyle}>
          <h3>Fichas de gatos de colonia</h3>
          <p>Pincha o toca cada tarjeta para consultar el estado del caso.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "0.8rem" }}>
            <article style={miniCardStyle}><h4>Nube</h4><p>Esterilización hecha · Gingivitis leve · 4 años</p></article>
            <article style={miniCardStyle}><h4>Menta</h4><p>Esterilización pendiente · Desparasitación preventiva · 2 años</p></article>
            <article style={miniCardStyle}><h4>Rayo</h4><p>Lesión ocular antigua · Aviso activo desde febrero de 2026 · 7 años</p></article>
          </div>
        </section>

        <section id="minijuego" style={cardStyle}>
          <h3>Minijuego: Gatito Runner 🐱</h3>
          <p>Juega al runner solidario y mejora tu posición en la clasificación global.</p>
          <Link href="/gato-runner">Ir al minijuego</Link>
        </section>

        <section id="campana" style={cardStyle}>
          <h3>Campaña de firmas (Change.org)</h3>
          <p>Apoya la petición para una gestión ética de colonias felinas en San Xoán de Río (Ourense).</p>
        </section>

        <section id="ayuda" style={cardStyle}>
          <h3>Cómo ayudar</h3>
          <ul>
            <li>Únete al equipo de voluntariado.</li>
            <li>Colabora con material o alimento.</li>
            <li>Difunde nuestras campañas en tu entorno.</li>
          </ul>
        </section>

        <section id="ranking" style={cardStyle}>
          <h3>Rankings solidarios 🏆</h3>
          <p>Consulta los dos rankings completos (donaciones y minijuego).</p>
          <Link href="/rankings">Ver página completa de rankings</Link>
        </section>

        <section id="noticias" style={cardStyle}>
          <h3>Noticias y actualizaciones</h3>
          <p>Feed dinámico desde Europa Press (medio ambiente y animales).</p>
          <EuropaPressNews />
        </section>

        <section id="login" style={cardStyle}>
          <h3>Iniciar sesión</h3>
          <p>Accede para gestionar tus aportaciones y revisar tus puntos Karma.</p>
          <Link href="/login">Ir a login</Link>
        </section>

        <section id="registro" style={cardStyle}>
          <h3>Registro</h3>
          <p>Crea una cuenta y participa en campañas, eventos y retos solidarios.</p>
          <Link href="/register">Ir a registro</Link>
        </section>

        <section id="donar" style={cardStyle}>
          <h3>Apoya nuestro trabajo con una donación</h3>
          <p>Cada aportación nos ayuda a cubrir gastos veterinarios, alimentación y tratamientos de urgencia.</p>
          <div style={{ display: "grid", gap: "0.6rem" }}>
            <details open><summary>Gatete Luna</summary><p>Esterilización, comida, pipetas o apadrinamiento.</p></details>
            <details open><summary>Gatete Misu</summary><p>Esterilización, comida, pipetas o apadrinamiento.</p></details>
            <details open><summary>Gatete Bigotes</summary><p>Esterilización, comida, pipetas o apadrinamiento.</p></details>
          </div>
        </section>

        <section id="contacto" style={cardStyle}>
          <h3>Contacto</h3>
          <p>Escríbenos para voluntariado, avisos o consultas generales.</p>
        </section>
      </div>
    </main>
  );
}

const cardStyle: CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  padding: "1rem",
  border: "1px solid #e6e6e6",
};

const miniCardStyle: CSSProperties = {
  background: "#fafafa",
  border: "1px solid #ececec",
  borderRadius: 10,
  padding: "0.75rem",
};
