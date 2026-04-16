"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * DEFINICIÓN DE TIPOS Y CONSTANTES
 * Mantenemos tu estructura original de 213 líneas adaptada.
 */
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
  welcome: { 
    text: "¡Hola! Soy el asistente de Gatocan. ¿En qué puedo ayudarte, miau?" 
  },
  donar: { 
    text: "Puedes donar por Bizum, PayPal o Tarjeta en nuestra web oficial.", 
    showDonationLink: true 
  },
  karma: { 
    text: "El Karma son puntos que ganas jugando al Runner y ayudando en el foro." 
  },
  bienestar: { 
    text: "Aquí tienes la guía de bienestar animal para descargar.", 
    showGuideButton: true 
  },
  no_entiendo: { 
    text: "Miau... no te he entendido bien. Prueba con palabras como 'donar' o 'karma'." 
  }
};

export default function GatoAsistente() {
  // --- ESTADOS ---
  const [isOpen, setIsOpen] = useState(false);
  const [catMood, setCatMood] = useState<CatMood>("reposo");
  const [replyKey, setReplyKey] = useState<ReplyKey>("welcome");
  const [inputValue, setInputValue] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- EFECTOS ---
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // --- LÓGICA DE ANIMACIÓN Y SONIDO ---
  const animateTalking = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setCatMood("hablando");
    timeoutRef.current = setTimeout(() => {
      setCatMood("reposo");
    }, 2500);
  };

  const handleQuickReply = (nextReply: ReplyKey) => {
    setReplyKey(nextReply);
    const audio = new Audio("/sounds/cazar.mp3");
    audio.volume = 0.2;
    void audio.play().catch(() => {});
    animateTalking();
  };

  // --- LÓGICA DEL INPUT (PALABRAS CLAVE) ---
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const text = inputValue.toLowerCase();
    setInputValue("");

    if (text.includes("donar") || text.includes("bizum") || text.includes("dinero") || text.includes("donar")) {
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
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 999999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      pointerEvents: 'none'
    }}>
      
      {/* BURBUJA DE CHAT */}
      {isOpen && (
        <div style={{
          pointerEvents: 'auto',
          width: '320px',
          backgroundColor: 'white',
          borderRadius: '24px',
          padding: '20px',
          boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
          marginBottom: '15px',
          position: 'relative',
          fontFamily: 'inherit',
          border: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#1e293b', fontWeight: 600, lineHeight: '1.4' }}>
              {content.text}
            </p>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: '#cbd5e1', fontSize: '24px', cursor: 'pointer', padding: '0 5px' }}
            >×</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
            {content.showDonationLink && (
              <Link href="/donaciones" style={{ backgroundColor: '#10b981', color: 'white', padding: '10px', borderRadius: '12px', fontSize: '12px', textAlign: 'center', textDecoration: 'none', fontWeight: 700 }}>
                Ir a Donaciones
              </Link>
            )}
            {content.showGuideButton && (
              <a href="/docs/guia.pdf" download style={{ backgroundColor: '#0ea5e9', color: 'white', padding: '10px', borderRadius: '12px', fontSize: '12px', textAlign: 'center', textDecoration: 'none', fontWeight: 700 }}>
                Descargar Guía
              </a>
            )}
          </div>

          {/* INPUT FORM */}
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe 'donar' o 'karma'..."
              style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px', fontSize: '13px', outline: 'none' }}
            />
            <button type="submit" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0 15px', cursor: 'pointer', fontSize: '16px' }}>
              →
            </button>
          </form>

          {/* PICO DEL BOCADILLO */}
          <div style={{ position: 'absolute', bottom: '-8px', right: '30px', width: '16px', height: '16px', backgroundColor: 'white', transform: 'rotate(45deg)', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}></div>
        </div>
      )}

      {/* BOTÓN DEL GATO (SPRITE) */}
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
            width: '100px',
            height: '100px',
            backgroundImage: "url('/images/gato_asistente.png')",
            backgroundRepeat: 'no-repeat',
            backgroundSize: '400px 300px', 
            imageRendering: 'pixelated',
            transform: 'scale(0.8) translateY(5px)'
          }} 
        />
      </button>

      <style jsx>{`
        .gato-sprite { display: block; }
        .gato-reposo { animation: anim-reposo 0.8s steps(4) infinite; }
        .gato-hablando { animation: anim-hablando 0.4s steps(4) infinite; }
        .gato-feliz { animation: anim-feliz 1.2s steps(4) infinite; }

        @keyframes anim-reposo { 
          from { background-position: 0px 0px; } 
          to { background-position: -400px 0px; } 
        }
        @keyframes anim-hablando { 
          from { background-position: 0px -100px; } 
          to { background-position: -400px -100px; } 
        }
        @keyframes anim-feliz { 
          from { background-position: 0px -200px; } 
          to { background-position: -400px -200px; } 
        }
      `}</style>
    </div>
  );
}
