"use client";
// ... (imports iguales)

export default function SessionHeader() {
  // ... (lógica igual)

  return (
    <div style={{ 
      position: "absolute", 
      right: "15px", // Más margen derecho
      top: "15px",   // Más margen superior
      zIndex: 1100, 
      display: "flex", 
      gap: "8px", 
      alignItems: "center" 
    }}>
      {status !== "authenticated" ? (
        <Link href="/login" className="btn btn-secondary" style={{ 
          padding: "6px 12px", // Botón más pequeño
          fontSize: "0.75rem", // Letra más pequeña
          borderRadius: "20px", 
          border: "1.5px solid #fff",
          whiteSpace: "nowrap" 
        }}>
          Acceder / Registro
        </Link>
      ) : (
        <div style={{ position: "relative" }}>
          <img 
            src={avatar} 
            alt="User" 
            onClick={() => setOpen(!open)} 
            style={{ width: "38px", height: "38px", borderRadius: "50%", cursor: "pointer", border: "2px solid #fff" }} 
          />
          {/* ... dropdown igual */}
        </div>
      )}
    </div>
  );
}
