"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type CatMood = "reposo" | "hablando" | "feliz";
type ReplyKey = "welcome" | "donar" | "karma" | "bienestar";

const CHAT_CONTENT: Record<
  ReplyKey,
  {
    text: string;
    showDonationLink?: boolean;
    showGuideButton?: boolean;
  }
> = {
  welcome: {
    text: "¡Hola! Soy el asistente de Gatocan. ¿En qué puedo ayudarte, miau?",
  },
  donar: {
    text: "Puedes donar por Bizum, PayPal o Tarjeta. Si quieres ver los pasos y opciones disponibles, entra en la página de donaciones.",
    showDonationLink: true,
  },
  karma: {
    text: "El Karma son puntos que consigues al jugar al Runner y al colaborar con la comunidad. Cuanto más participas, más Karma ganas.",
  },
  bienestar: {
    text: "Aquí tienes la guía de bienestar para descargarla cuando quieras.",
    showGuideButton: true,
  },
};

export default function GatoAsistente() {
  const [isOpen, setIsOpen] = useState(false);
  const [catMood, setCatMood] = useState<CatMood>("reposo");
  const [replyKey, setReplyKey] = useState<ReplyKey>("welcome");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const animateTalking = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setCatMood("hablando");
    timeoutRef.current = setTimeout(() => {
      setCatMood("reposo");
    }, 2000);
  };

  const playResponseAudio = () => {
    const audio = new Audio("/sounds/cazar.mp3");
    audio.volume = 0.2;
    void audio.play().catch(() => {});
  };

  const handleOpenChat = () => {
    setIsOpen((prev) => {
      if (!prev) {
        setReplyKey("welcome");
        setCatMood("reposo");
      }
      return !prev;
    });
  };

  const handleCloseChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setCatMood("feliz");
    setIsOpen(false);
  };

  const handleQuickReply = (nextReply: ReplyKey) => {
    setReplyKey(nextReply);
    playResponseAudio();
    animateTalking();
  };

  const content = CHAT_CONTENT[replyKey];

  return (
    /* CONTENEDOR PADRE: Fuerza la posición arriba de todo el DOM */
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 999999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      pointerEvents: 'none' /* Para que no bloquee clics fuera del gato */
    }}>
      
      {isOpen && (
        <div style={{
          pointerEvents: 'auto',
          width: '300px',
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          border: '1px solid #f1f5f9',
          marginBottom: '15px',
          position: 'relative',
          fontFamily: 'sans-serif'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#1e293b', lineHeight: '1.5', fontWeight: 500 }}>
              {content.text}
            </p>
            <button 
              onClick={handleCloseChat}
              style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer', padding: '0 5px', lineHeight: 1 }}
            >×</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
            {content.showDonationLink && (
              <Link href="/donaciones" style={{ backgroundColor: '#059669', color: 'white', padding: '10px', borderRadius: '12px', fontSize: '12px', textAlign: 'center', fontWeight: 'bold', textDecoration: 'none' }}>
                Ir a donaciones
              </Link>
            )}
            {content.showGuideButton && (
              <a href="/docs/guia.pdf" download style={{ backgroundColor: '#0284c7', color: 'white', padding: '10px', borderRadius: '12px', fontSize: '12px', textAlign: 'center', fontWeight: 'bold', textDecoration: 'none' }}>
                Descargar guía
              </a>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
            <button onClick={() => handleQuickReply("donar")} style={{ cursor: 'pointer', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '10px', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase' }}>¿Donar?</button>
            <button onClick={() => handleQuickReply("karma")} style={{ cursor: 'pointer', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '10px', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase' }}>¿Karma?</button>
            <button onClick={() => handleQuickReply("bienestar")} style={{ cursor: 'pointer', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '10px', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase', gridColumn: 'span 2' }}>Guía de Bienestar</button>
          </div>

          {/* Pico del bocadillo */}
          <div style={{ position: 'absolute', bottom: '-8px', right: '24px', width: '16px', height: '16px', backgroundColor: 'white', transform: 'rotate(45deg)', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}></div>
        </div>
      )}

      {/* BOTÓN DEL GATO */}
      <button
        onClick={handleOpenChat}
        style={{
          pointerEvents: 'auto',
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          backgroundColor: 'white',
          border: '4px solid #f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          padding: 0
        }}
      >
        <div className={`gato-sprite gato-${catMood}`} />
      </button>

      <style jsx>{`
        .gato-sprite {
          width: 50px;
          height: 50px;
          background-image: url('/images/gato_asistente.png');
          background-repeat: no-repeat;
          background-size: 200px 150px;
          image-rendering: pixelated;
        }
        .gato-reposo { animation: anim-reposo 0.8s steps(4) infinite; }
        .gato-hablando { animation: anim-hablando 0.4s steps(2) infinite; }
        .gato-feliz { animation: anim-feliz 1.2s steps(4) infinite; }

        @keyframes anim-reposo { from { background-position: 0px 0px; } to { background-position: -200px 0px; } }
        @keyframes anim-hablando { from { background-position: 0px -50px; } to { background-position: -100px -50px; } }
        @keyframes anim-feliz { from { background-position: 0px -100px; } to { background-position: -200px -100px; } }
      `}</style>
    </div>
  );
}
