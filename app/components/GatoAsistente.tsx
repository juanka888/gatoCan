"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type CatMood = "quieto" | "reposo" | "hablando";
type ReplyKey = "welcome" | "donar" | "karma" | "bienestar" | "no_entiendo";

const CHAT_CONTENT: Record<ReplyKey, { text: string; showDonationLink?: boolean; showGuideButton?: boolean; }> = {
  welcome: { text: "¡Hola! Soy el asistente de Gatocan. ¿En qué puedo ayudarte, miau?" },
  donar: { text: "Puedes donar por Bizum, PayPal o Tarjeta en nuestra web oficial.", showDonationLink: true },
  karma: { text: "El Karma son puntos que ganas jugando al Runner y ayudando en el foro." },
  bienestar: { text: "Aquí tienes la guía de bienestar animal para descargar.", showGuideButton: true },
  no_entiendo: { text: "Miau... no te he entendido bien. Prueba con palabras como 'donar' o 'karma'." }
};

export default function GatoAsistente() {
  const [isOpen, setIsOpen] = useState(false);
  const [catMood, setCatMood] = useState<CatMood>("quieto");
  const [replyKey, setReplyKey] = useState<ReplyKey>("welcome");
  const [inputValue, setInputValue] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleToggle = () => {
    if (!isOpen) {
      setIsOpen(true);
      setCatMood("reposo");
    } else {
      setIsOpen(false);
      setCatMood("quieto");
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.toLowerCase().trim();
    if (!text) return;
    setInputValue("");

    if (text.includes("donar")) setReplyKey("donar");
    else if (text.includes("karma")) setReplyKey("karma");
    else if (text.includes("guia")) setReplyKey("bienestar");
    else setReplyKey("no_entiendo");

    setCatMood("hablando");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCatMood("reposo"), 3000);
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 999999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', pointerEvents: 'none' }}>
      
      {isOpen && (
        <div style={{ pointerEvents: 'auto', width: '300px', backgroundColor: 'white', borderRadius: '24px', padding: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', marginBottom: '10px', position: 'relative', border: '1px solid #eee' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#333' }}>{CHAT_CONTENT[replyKey].text}</p>
            <button onClick={handleToggle} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#ccc' }}>×</button>
          </div>
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '5px' }}>
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Escribe 'donar'..." style={{ flex: 1, padding: '8px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '12px', outline: 'none' }} />
            <button type="submit" style={{ padding: '8px 12px', borderRadius: '10px', border: 'none', backgroundColor: '#eee', cursor: 'pointer' }}>→</button>
          </form>
        </div>
      )}

      {/* BOTÓN CIRCULAR CON AJUSTE ANTI-CORTE */}
      <button
        onClick={handleToggle}
        style={{
          pointerEvents: 'auto',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'white',
          border: '4px solid #f9f9f9',
          boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          overflow: 'hidden', // ESTO HACE EL RECORTE CIRCULAR
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0
        }}
      >
        <div style={{
          width: '128px', // Aumentamos la "ventana" para que no corte los lados
          height: '128px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'scale(0.8) translateY(8px)', // Ajuste de tamaño y altura
        }}>
          <div 
            className={`gato-anim gato-${catMood}`} 
            style={{
              width: '128px', 
              height: '128px',
              backgroundImage: "url('/images/gato_asistente.png')",
              backgroundRepeat: 'no-repeat',
              backgroundSize: '512px 512px', // 4x4 frames de 128px
              imageRendering: 'pixelated',
            }} 
          />
        </div>
      </button>

      <style jsx>{`
        .gato-quieto { background-position: 0px 0px; }
        
        .gato-reposo { animation: reposo 1.2s steps(4) infinite; }
        @keyframes reposo {
          from { background-position: 0px 0px; }
          to { background-position: -512px 0px; }
        }

        .gato-hablando { animation: hablando 0.4s steps(2) infinite; }
        @keyframes hablando {
          from { background-position: 0px -128px; }
          to { background-position: -256px -128px; }
        }

        .gato-anim {
          /* Este margen negativo centra al gato que está bailando de lado a lado */
          margin-left: 10px; 
        }
      `}</style>
    </div>
  );
}
