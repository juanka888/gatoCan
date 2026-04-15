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
    void audio.play().catch(() => {
      // Silenciamos el error si el navegador bloquea autoplay.
    });
  };

  const handleOpenChat = () => {
    setIsOpen((prev) => {
      if (!prev) {
        setReplyKey("welcome");
        setCatMood("reposo");
      }
      return true;
    });
  };

  const handleCloseChat = () => {
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
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-[min(88vw,320px)] rounded-xl bg-white p-4 shadow-lg ring-1 ring-black/5 relative">
          <div className="mb-2 flex items-start justify-between gap-2">
            <p className="text-sm leading-relaxed text-slate-800">{content.text}</p>
            <button
              type="button"
              onClick={handleCloseChat}
              className="rounded-md px-2 py-0.5 text-lg leading-none text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Cerrar asistente"
            >
              ×
            </button>
          </div>

          {content.showDonationLink && (
            <Link
              href="/donaciones"
              className="mb-3 inline-flex rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Ir a donaciones
            </Link>
          )}

          {content.showGuideButton && (
            <a
              href="/docs/guia.pdf"
              className="mb-3 inline-flex rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-sky-700"
              download
            >
              Descargar guía
            </a>
          )}

          <div className="grid gap-2 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => handleQuickReply("donar")}
              className="rounded-lg bg-slate-100 px-2 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              ¿Cómo donar?
            </button>
            <button
              type="button"
              onClick={() => handleQuickReply("karma")}
              className="rounded-lg bg-slate-100 px-2 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              ¿Qué es el Karma?
            </button>
            <button
              type="button"
              onClick={() => handleQuickReply("bienestar")}
              className="rounded-lg bg-slate-100 px-2 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              Guía de Bienestar
            </button>
          </div>
          {/* Flechita del bocadillo para que parezca un chat */}
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white rotate-45 border-r border-b border-black/5"></div>
        </div>
      )}

      <button
        type="button"
        onClick={handleOpenChat}
        className="h-14 w-14 flex items-center justify-center transition hover:scale-110 focus:outline-none"
        aria-label="Abrir asistente de GatoCan"
      >
        <span className={`gato-sprite gato-${catMood}`} />
      </button>

      <style jsx>{`
        .gato-sprite {
          display: block;
          width: 50px; /* Tamaño del frame */
          height: 50px;
          background-image: url('/images/gato_asistente.png');
          background-repeat: no-repeat;
          /* La imagen tiene 4 frames horizontalmente y 3 verticalmente */
          background-size: 200px 150px; 
          image-rendering: pixelated;
        }

        .gato-reposo {
          animation: reposo 0.8s steps(4) infinite;
        }

        .gato-hablando {
          animation: hablando 0.4s steps(4) infinite;
        }

        .gato-feliz {
          animation: feliz 1.2s steps(4) infinite;
        }

        @keyframes reposo {
          from { background-position: 0px 0px; }
          to { background-position: -200px 0px; }
        }

        @keyframes hablando {
          from { background-position: 0px -50px; }
          to { background-position: -200px -50px; }
        }

        @keyframes feliz {
          from { background-position: 0px -100px; }
          to { background-position: -200px -100px; }
        }
      `}</style>
    </div>
  );
              }
