export default function RankingsPage() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "1rem" }}>
      <h1>Rankings solidarios</h1>
      <p>Consulta aquí el ranking de donaciones y del minijuego.</p>
      <ul>
        <li>Ruta pública: <strong>/gatoCan/rankings</strong></li>
        <li>Perfil: <a href="/gatoCan/perfil">/gatoCan/perfil</a></li>
        <li>Login: <a href="/gatoCan/login">/gatoCan/login</a></li>
      </ul>
      <a href="/gatoCan">Volver al inicio</a>
    </main>
  );
}
