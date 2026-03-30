import Link from "next/link";
import type { CSSProperties } from "react";
import EuropaPressNews from "./components/EuropaPressNews";

const galleryImages = [
  { src: "/img/foto-01.jpg", alt: "Gato negro en jaula humanitaria", tag: "Capturas" },
  { src: "/img/foto-02.jpg", alt: "Gato en jaula verde de captura", tag: "Capturas" },
  { src: "/img/foto-03.jpg", alt: "Gato en jaula cubierta en clínica", tag: "Capturas" },
  { src: "/img/foto-04.jpg", alt: "Gato en jaula sobre mesa clínica", tag: "Esterilizaciones" },
  { src: "/img/foto-05.jpg", alt: "Gato blanco en jaula de observación", tag: "Colonias" },
  { src: "/img/foto-06.jpg", alt: "Gata tricolor en transportín de captura", tag: "Actuaciones" },
  { src: "/img/foto-05.jpg", alt: "Gato blanco en jaula de observación", tag: "Colonias" }
  
];

export default function HomePage() {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "1rem", display: "grid", gap: "1rem" }}>
      <header id="inicio" style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            {/* Ruta del logo corregida */}
            <img src="/img/logo1.png" alt="Logo de GatoCan Natura Rural" style={{ width: 72, height: 72, objectFit: "contain" }} />
            <div>
              <p style={{ margin: 0 }}>Asociación de protección animal</p>
              <h1 style={{ margin: 0 }}>GatoCan Natura Rural</h1>
            </div>
          </div>
          <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
            <a href="/login">Acceder</a>
            <a href="/register">Crear cuenta</a>
          </div>
        </div>

        <nav aria-label="Principal">
          <ul style={navList}>
            <li><a href="#inicio">Inicio</a></li>
            <li><a href="#mision">Misión</a></li>
            <li><a href="#colonias">Colonias</a></li>
            <li><a href="#galeria">Galería</a></li>
            <li><a href="#fichas">Fichas</a></li>
            <li><a href="#minijuego">Minijuego</a></li>
            <li><a href="#ayuda">Cómo ayudar</a></li>
            <li><a href="#noticias">Noticias</a></li>
            <li><a href="/foro">Foro</a></li>
            <li><a href="#contacto">Contacto</a></li>
            <li><a href="#donar">Donar</a></li>
            <li><a href="/rankings">Rankings</a></li>
            <li><a href="#campana">Campaña</a></li>
            <li><a href="/perfil">Perfil</a></li>
          </ul>
        </nav>

        <section>
          <h2>Cuidamos colonias felinas con responsabilidad y compromiso</h2>
          <p>
            Aplicamos el método CER para mejorar la vida de los gatos comunitarios y fomentar una convivencia
            respetuosa en el entorno rural.
          </p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <a href="/login">Acceder</a>
            <a href="/register">Crear cuenta</a>
            <a href="#ayuda">Hazte voluntario/a</a>
            <a href="#donar">Donar ahora</a>
            <a href="/foro">Entrar al foro</a>
          </div>
        </section>
      </header>

      <section id="mision" style={card}><h3>Misión y valores</h3><p>Trabajamos para proteger, esterilizar y cuidar a los gatos de colonias felinas mediante acciones coordinadas con personas voluntarias, clínicas veterinarias y administraciones locales.</p></section>
      <section id="colonias" style={card}><h3>Colonias felinas</h3><p>Realizamos seguimiento sanitario, alimentación controlada y campañas de sensibilización para garantizar colonias estables, saludables y bien gestionadas.</p></section>

      <section id="galeria" style={card}>
        <h3>Galería de actuaciones</h3>
        <p>Recorrido visual de colonias, capturas y esterilizaciones.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "0.75rem" }}>
          {galleryImages.map((image) => (
            <figure key={image.src} style={{ margin: 0 }}>
              <img src={image.src} alt={image.alt} style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 8 }} />
              <figcaption>{image.tag}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section id="fichas" style={card}><h3>Fichas de gatos de colonia</h3><p>Pincha o toca cada tarjeta para girarla y ver el estado del caso.</p></section>
      <section id="minijuego" style={card}><h3>Minijuego: Gatito Runner 🐱</h3><p>Salta con espacio o flecha arriba para sumar puntos y esquivar obstáculos.</p><Link href="/gato-runner">Ir al minijuego</Link></section>
      <section id="campana" style={card}><h3>Campaña de firmas (Change.org)</h3><p>Apoya la petición para una gestión ética de colonias felinas en San Xoán de Río (Ourense).</p></section>
      <section id="ayuda" style={card}><h3>Cómo ayudar</h3><ul><li>Únete al equipo de voluntariado.</li><li>Colabora con material o alimento.</li><li>Difunde nuestras campañas en tu entorno.</li></ul></section>
      <section id="ranking" style={card}><h3>Rankings solidarios 🏆</h3><p>Consulta los dos rankings completos (donaciones y minijuego).</p><a href="/rankings">Ver página completa de rankings</a></section>

      <section id="noticias" style={card}>
        <h3>Noticias y actualizaciones</h3>
        <p>Feed dinámico de Europa Press (sin filtros).</p>
        <EuropaPressNews />
      </section>

      <section id="login" style={card}><h3>Iniciar sesión</h3><p>Accede para gestionar tus aportaciones y revisar tus puntos Karma.</p><a href="/login">Ir a login</a></section>
      <section id="registro" style={card}><h3>Registro</h3><p>Crea una cuenta y participa en campañas, eventos y retos solidarios.</p><a href="/register">Ir a registro</a></section>
      <section id="donar" style={card}><h3>Apoya nuestro trabajo con una donación</h3><p>Cada aportación nos ayuda a cubrir gastos veterinarios, alimentación y tratamientos de urgencia.</p></section>
      <section id="contacto" style={card}><h3>Contacta con Gatocan Natura Rural</h3><p>Para voluntariado, avisos o colaboración, usa los formularios de la web.</p></section>
    </main>
  );
}

const card: CSSProperties = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: "1rem",
};

const navList: CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: "0.75rem 0",
  display: "flex",
  gap: "0.6rem",
  flexWrap: "wrap",
};
