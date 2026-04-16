"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * Mantenemos tu estructura original y la lógica del input.
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
  // --- ESTADOS Y LÓGICA (Tus 213 líneas originales) ---
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
    timeoutRef.current = setTimeout(() => {
      setCatMood("reposo");
    }, 2500);
  };

  const playResponseAudio = () => {
    const audio = new Audio("/sounds/cazar.mp3");
    audio.volume = 0.2;
    void audio.play().catch(() => {});
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const text = inputValue.toLowerCase();
    setInputValue("");

    if (text.includes("donar") || text.includes("bizum") || text.includes("dinero")) {
      setReplyKey("donar");
    } else if (text.includes("karma") || text.includes("puntos") || text.includes("runner")) {
      setReplyKey("karma");
    } else if (text.includes("guia") || text.includes("bienestar") || text.includes("ayuda")) {
      setReplyKey("bienestar");
    } else {
      setReplyKey("no_entiendo");
    }
    
    playResponseAudio();
    animateTalking();
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
          {/* ... (Todo el contenido del bocadillo se mantiene igual) ... */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#1e293b', fontWeight: 600, lineHeight: '1.4' }}>{content.text}</p>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#cbd5e1', fontSize: '24px', cursor: 'pointer', padding: '0 5px' }}>×</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
            {content.showDonationLink && <Link href="/donaciones" style={{ backgroundColor: '#10b981', color: 'white', padding: '10px', borderRadius: '12px', fontSize: '12px', textAlign: 'center', textDecoration: 'none', fontWeight: 700 }}>Ir a Donaciones</Link>}
            {content.showGuideButton && <a href="/docs/guia.pdf" download style={{ backgroundColor: '#0ea5e9', color: 'white', padding: '10px', borderRadius: '12px', fontSize: '12px', textAlign: 'center', textDecoration: 'none', fontWeight: 700 }}>Descargar Guía</a>}
          </div>

          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Dime 'donar' miau..." style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px', fontSize: '13px', outline: 'none' }} />
            <button type="submit" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0 15px', cursor: 'pointer' }}>→</button>
          </form>
          <div style={{ position: 'absolute', bottom: '-8px', right: '30px', width: '16px', height: '16px', backgroundColor: 'white', transform: 'rotate(45deg)', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}></div>
        </div>
      )}

      {/* BOTÓN DEL GATO (SPRITE BLINDADO) */}
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
          overflow: 'hidden', // Importante para recortar la imagen cuadrada
          padding: 0
        }}
      >
        <div 
          className={`gato-sprite gato-${catMood}`} 
          style={{
            // AJUSTE PÍXEL A PÍXEL PARA image_4.png
            width: '100px', // Tamaño de la "ventana" de recorte
            height: '100px',
            backgroundImage: "url('/images/gato_asistente.png')", // ASEGÚRATE DE QUE SEA PNG
            backgroundRepeat: 'no-repeat',
            // La cuadrícula de 4x3 frames de 100px cada uno
            backgroundSize: '400px 300px', 
            imageRendering: 'pixelated', // Mantiene el Pixel Art nítido
            // ESTA LÍNEA ES LA FUERZA BRUTA PARA CENTRAR:
            transform: 'scale(0.8) translateY(5px)' // Encoge al gato y lo centra
          }} 
        />
      </button>

      <style jsx>{`
        /* ANIMACIONES CSS CORREGIDAS PARA TU IMAGEN */
        .gato-reposo { animation: reposo-anim 1s steps(4) infinite; }
        .gato-hablando { animation: hablando-anim 0.4s steps(4) infinite; }
        .gato-feliz { animation: feliz-anim 1s steps(4) infinite; }

        @keyframes reposo-anim { 
          from { background-position: 0px 0px; } 
          to { background-position: -400px 0px; } 
        }
        @keyframes hablando-anim { 
          from { background-position: 0px -100px; } 
          to { background-position: -400px -100px; } 
        }
        @keyframes feliz-anim { 
          from { background-position: 0px -200px; } 
          to { background-position: -400px -200px; } 
        }
      `}</style>
    </div>
  );
                                                                                  }
