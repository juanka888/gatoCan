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
  donar: { text: "Puedes donar por Bizum, PayPal o Tarjeta en nuestra web.", showDonationLink: true },
  karma: { text: "El Karma son puntos que ganas jugando al Runner y ayudando a la comunidad." },
  bienestar: { text: "Aquí tienes la guía de bienestar animal.", showGuideButton: true },
  no_entiendo: { text: "No estoy seguro de entenderte, miau. Prueba con 'donar', 'karma' o 'guía'." }
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
    timeoutRef.current = setTimeout(() => setCatMood("reposo"), 2500);
  };

  const handleQuickReply = (nextReply: ReplyKey) => {
    setReplyKey(nextReply);
    const audio = new Audio("/sounds/cazar.mp3");
    audio.volume = 0.2;
    void audio.play().catch(() => {});
    animateTalking();
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.toLowerCase();
    setInputValue("");

    if (text.includes("donar") || text.includes("bizum") || text.includes("dinero")) {
      handleQuickReply("donar");
    } else if (text.includes("karma") || text.includes("puntos") || text.includes("runner")) {
      handleQuickReply("karma");
    } else if (text.includes("guia") || text.includes("bienestar") || text.includes("ayuda")) {
      handleQuickReply("bienestar");
    } else {
      handleQuickReply("no_entiendo");
    }
  };

  const content = CHAT_CONTENT[replyKey];

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 999999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', pointerEvents: 'none' }}>
      
      {isOpen && (
        <div style={{ pointerEvents: 'auto', width: '300px', backgroundColor: 'white', borderRadius: '20px', padding: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', marginBottom: '12px', position: 'relative', fontFamily: 'sans-serif' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#333', fontWeight: 600, paddingRight: '20px' }}>{content.text}</p>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#ccc', fontSize: '20px', cursor: 'pointer', position: 'absolute', top: '10px', right: '10px' }}>×</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px' }}>
            {content.showDonationLink && <Link href="/donaciones" style={{ backgroundColor: '#10b981', color: 'white', padding: '8px', borderRadius: '10px', fontSize: '11px', textAlign: 'center', textDecoration: 'none', fontWeight: 'bold' }}>Ir a Donaciones</Link>}
            {content.showGuideButton && <a href="/docs/guia.pdf" download style={{ backgroundColor: '#0ea5e9', color: 'white', padding: '8px', borderRadius: '10px', fontSize: '11px', textAlign: 'center', textDecoration: 'none', fontWeight: 'bold' }}>Descargar Guía</a>}
          </div>

          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '5px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe algo miau..."
              style={{ flex: 1, border: '1px solid #ddd', borderRadius: '8px', padding: '5px 10px', fontSize: '12px', outline: 'none' }}
            />
            <button type="submit" style={{ backgroundColor: '#f3f4f6', border: '1px solid #ddd', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', fontSize: '12px' }}>→</button>
          </form>

          <div style={{ position: 'absolute', bottom: '-8px', right: '25px', width: '16px', height: '16px', backgroundColor: 'white', transform: 'rotate(45deg)', borderRight: '1px solid #eee', borderBottom: '1px solid #eee' }}></div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          pointerEvents: 'auto',
          width: '75px',
          height: '75px',
          borderRadius: '50%',
          backgroundColor: '#fff',
          border: '3px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
          padding: 0,
          overflow: 'hidden'
        }}
      >
        <div 
          className={`gato-anim gato-${catMood}`} 
          style={{
            width: '100px',
            height: '100px',
            backgroundImage: "url('/images/gato_asistente.png')",
            backgroundRepeat: 'no-repeat',
            backgroundSize: '400px 300px', 
            imageRendering: 'pixelated',
            transform: 'scale(0.8) translateY(5px)' // Centra el gato en el círculo
          }} 
        />
      </button>

      <style jsx>{`
        .gato-reposo { animation: reposo-anim 1s steps(4) infinite; }
        .gato-hablando { animation: hablando-anim 0.5s steps(2) infinite; }
        .gato-feliz { animation: feliz-anim 1s steps(4) infinite; }

        @keyframes reposo-anim { from { background-position: 0px 0px; } to { background-position: -400px 0px; } }
        @keyframes hablando-anim { from { background-position: 0px -100px; } to { background-position: -200px -100px; } }
        @keyframes feliz-anim { from { background-position: 0px -200px; } to { background-position: -400px -200px; } }
      `}</style>
    </div>
  );
                       }
