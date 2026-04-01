import Link from "next/link";

export default function PoliticasPage() {
  return (
    <main className="privacy-page">
      <section className="card privacy-card" style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.5)" }}>
        <h1>POLÍTICA DE PRIVACIDAD Y PROTECCIÓN DE DATOS</h1>
        <p>
          En cumplimiento del Reglamento General de Protección de Datos (RGPD), se informa que los datos personales
          facilitados a través de este sitio web serán tratados por:
        </p>
        <p><strong>Responsable:</strong> ASOCIACIÓN GATOCAN NATURA RURAL</p>
        <p><strong>NIF:</strong> G21671193</p>
        <p><strong>Domicilio Social:</strong> Lugar O Outeiro, 12. 32779 San Xoán de Río (Ourense).</p>
        <p>
          <strong>Finalidad:</strong> Gestión de socios, donantes, adopciones y envío de información sobre las
          actividades y rescates de la protectora.
        </p>
        <p>
          <strong>Legitimación:</strong> El consentimiento del interesado al marcar la casilla de aceptación en los
          formularios o al realizar una donación.
        </p>
        <p>
          <strong>Destinatarios:</strong> Los datos no se cederán a terceros, salvo obligación legal o para la gestión
          técnica de donaciones (plataformas de pago seguras).
        </p>
        <p>
          <strong>Derechos:</strong> Usted tiene derecho a acceder, rectificar y suprimir sus datos, así como otros
          derechos, enviando un correo electrónico a gatocannaturarural@gmail.com.
        </p>
        <p>
          Este sitio web utiliza medidas de seguridad para proteger la información frente a accesos no autorizados. Al
          facilitarnos sus datos, garantiza que es mayor de edad y que la información facilitada es veraz.
        </p>
        <p>
          <Link href="/" className="back-link">← Volver a la web principal</Link>
        </p>
      </section>
    </main>
  );
}
