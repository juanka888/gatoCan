"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type CatMood = "reposo" | "hablando" | "feliz";
type ReplyKey = "welcome" | "donar" | "karma" | "bienestar" | "no_entiendo";

const CHAT_CONTENT: Record<
  ReplyKey,
  {
    text: string;
    showDonationLink?: boolean;
    showGuideButton?: boolean;
  }
> = {
  welcome: { text: "¡Hola! Soy el asistente de Gatocan. ¿En qué puedo ayudarte, miau?" },
  donar: { text: "Puedes donar por Bizum, PayPal o Tarjeta en nuestra web oficial.", showDonationLink: true },
  karma: { text: "El Karma son puntos que ganas jugando al Runner y ayudando en el foro." },
  bienestar: { text: "Aquí tienes la guía de bienestar animal para descargar.", showGuideButton: true },
  no_entiendo: { text: "Miau... no te he entendido bien. Prueba con palabras como 'donar', 'karma' o 'guía'." }
};

export default function GatoAsistente() {
  const [isOpen, setIsOpen] = useState(false);
  const [catMood, setCatMood] = useState<CatMood>("reposo");
  const [replyKey, setReplyKey] = useState<ReplyKey>("welcome");
  const [inputValue, setInputValue] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  const animateTalking = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setCatMood("hablando");
    timeoutRef.current = setTimeout(() => { setCatMood("reposo"); }, 2500);
  };

  const handleResponse = (key: ReplyKey) => {
    setReplyKey(key);
    const audio = new Audio("/sounds/cazar.mp3");
    audio.volume = 0.2;
    void audio.play().catch(() => {});
    animateTalking();
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.toLowerCase().trim();
    if (!text) return;
    setInputValue("");

    if (text.includes("donar") || text.includes("bizum") || text.includes("dinero")) {
      handleResponse("donar");
    } else if (text.includes("karma") || text.includes("puntos") || text.includes("runner")) {
      handleResponse("karma");
    } else if (text.includes("guia") || text.includes("bienestar") || text.includes("ayuda")) {
      handleResponse("bienestar");
    } else {
      handleResponse("no_entiendo");
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 999999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', pointerEvents: 'none', fontFamily: 'sans-serif' }}>
      
      {isOpen && (
        <div style={{ pointerEvents: 'auto', width: '310px', backgroundColor: 'white', borderRadius: '24px', padding: '18px', boxShadow: '0 15px 35px rgba(0,0,0,0.2)', marginBottom: '15px', position: 'relative', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#1e293b', fontWeight: 600, lineHeight: '1.4' }}>{CHAT_CONTENT[replyKey].text}</p>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#cbd5e1', fontSize: '24px', cursor: 'pointer' }}>×</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
            {CHAT_CONTENT[replyKey].showDonationLink && <Link href="/donaciones" style={{ backgroundColor: '#10b981', color: 'white', padding: '10px', borderRadius: '12px', fontSize: '12px', textAlign: 'center', textDecoration: 'none', fontWeight: 700 }}>Ir a Donaciones</Link>}
            {CHAT_CONTENT[replyKey].showGuideButton && <a href="/docs/guia.pdf" download style={{ backgroundColor: '#0ea5e9', color: 'white', padding: '10px', borderRadius: '12px', fontSize: '12px', textAlign: 'center', textDecoration: 'none', fontWeight: 700 }}>Descargar Guía</a>}
          </div>

          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Escribe aquí..." style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none' }} />
            <button type="submit" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0 15px', cursor: 'pointer' }}>→</button>
          </form>
          <div style={{ position: 'absolute', bottom: '-8px', right: '30px', width: '16px', height: '16px', backgroundColor: 'white', transform: 'rotate(45deg)', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}></div>
        </div>
      )}

      {/* BOTÓN CIRCULAR CON EL GATO TRANS-PARENTE */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          pointerEvents: 'auto',
          width: '75px',
          height: '75px',
          borderRadius: '50%',
          backgroundColor: '#fff',
          border: '4px solid #f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          padding: 0
        }}
      >
        <div 
          className={`gato-sprite gato-${catMood}`} 
          style={{
            width: '100px', // Ancho de un frame individual
            height: '100px', // Alto de un frame individual
            backgroundImage: "url('/images/gato_asistente.png')", // ASEGÚRATE DE QUE SEA PNG
            backgroundRepeat: 'no-repeat',
            // Asumiendo una cuadrícula de 4x3 frames de 100px cada uno
            backgroundSize: '400px 300px', 
            imageRendering: 'pixelated', // Mantiene el Pixel Art nítido
            transform: 'scale(0.85) translateY(5px)' // Centra el gato en el círculo
          }} 
        />
      </button>

      <style jsx>{`
        .gato-sprite { display: block; }
        
        // Ajusta los steps y tiempos según tu sprite sheet final
        .gato-reposo { animation: reposo-anim 1s steps(4) infinite; }
        .gato-hablando { animation: hablando-anim 0.5s steps(4) infinite; }
        .gato-feliz { animation: feliz-anim 1s steps(4) infinite; }

        @keyframes reposo-anim { from { background-position: 0px 0px; } to { background-position: -400px 0px; } }
        @keyframes hablando-anim { from { background-position: 0px -100px; } to { background-position: -400px -100px; } }
        @keyframes feliz-anim { from { background-position: 0px -200px; } to { background-position: -400px -200px; } }
      `}</style>
    </div>
  );
}
