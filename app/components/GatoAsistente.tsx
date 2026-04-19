"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type CatMood = "quieto" | "reposo" | "hablando";
type ReplyKey = "welcome" | "saludo" | "donar" | "karma" | "bienestar" | "agradecimiento" | "no_entiendo";

type ChatItem = {
  text: string;
  showDonationLink?: boolean;
  showGuideButton?: boolean;
};

const CHAT_CONTENT: Record<Exclude<ReplyKey, "saludo">, ChatItem> = {
  welcome: {
    text: "¡Hola! Soy el asistente de Gatocan. ¿En qué puedo ayudarte, miau?",
  },
  donar: {
    text: "Puedes donar por Bizum, PayPal o tarjeta en nuestra web oficial.",
    showDonationLink: true,
  },
  karma: {
    text: "El Karma son puntos que ganas jugando al Runner y ayudando en el foro.",
  },
  bienestar: {
    text: "Aquí tienes la guía de bienestar animal para descargar.",
    showGuideButton: true,
  },
  agradecimiento: {
    text: "¡Miau! Gracias a ti por apoyar a Gatocan 💛",
  },
  no_entiendo: {
    text: "Miau... no te he entendido bien. Prueba con palabras como 'donar', 'karma' o 'guía'.",
  },
};

const GREETINGS = [
  "¡Miauu! Qué alegría verte por aquí 😺",
  "¡Hola! Soy tu gatito asistente, listo para ayudarte.",
  "¡Buenas! Cuéntame y te echo una patita 🐾",
];

const INTENT_KEYWORDS: Record<Exclude<ReplyKey, "welcome" | "saludo" | "no_entiendo">, string[]> = {
  donar: ["donar", "donación", "donaciones", "dinero", "ayuda", "bizum", "paypal", "tarjeta"],
  karma: ["karma", "puntos", "runner", "juego", "jugar"],
  bienestar: ["guia", "guía", "bienestar", "cuidados", "cuidado", "animal"],
  agradecimiento: ["gracias", "te quiero", "genial", "crack"],
};

const GREETING_KEYWORDS = ["hola", "buenas", "miau", "hey", "ey"];

const QUICK_SUGGESTIONS = [
  { label: "🐾 ¿Cómo donar?", trigger: "donar" },
  { label: "🎮 Puntos Karma", trigger: "karma" },
  { label: "🐱 Guía Bienestar", trigger: "guía" },
];

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export default function GatoAsistente() {
  const [isOpen, setIsOpen] = useState(false);
  const [catMood, setCatMood] = useState<CatMood>("quieto");
  const [reply, setReply] = useState<ChatItem>(CHAT_CONTENT.welcome);
  const [inputValue, setInputValue] = useState("");
  const [isHappy, setIsHappy] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const happyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/sounds/miau.mp3");
    audioRef.current.preload = "auto";

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (happyTimeoutRef.current) clearTimeout(happyTimeoutRef.current);
    };
  }, []);

  const playMiau = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {
      // El audio puede bloquearse por autoplay/política del navegador.
    });
  };

  const getIntentFromText = (rawText: string): ReplyKey => {
    const text = normalize(rawText);

    if (GREETING_KEYWORDS.some((keyword) => text.includes(keyword))) return "saludo";

    for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS) as Array<[
      Exclude<ReplyKey, "welcome" | "saludo" | "no_entiendo">,
      string[]
    ]>) {
      if (keywords.some((keyword) => text.includes(normalize(keyword)))) {
        return intent;
      }
    }

    return "no_entiendo";
  };

  const applyReply = (intent: ReplyKey) => {
    if (intent === "saludo") {
      const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
      setReply({ text: greeting });
    } else {
      setReply(CHAT_CONTENT[intent]);
    }

    setCatMood("hablando");
    playMiau();

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCatMood("reposo"), 3000);

    if (intent === "agradecimiento") {
      setIsHappy(true);
      if (happyTimeoutRef.current) clearTimeout(happyTimeoutRef.current);
      happyTimeoutRef.current = setTimeout(() => setIsHappy(false), 2500);
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      setIsOpen(true);
      setCatMood("reposo");
      setReply(CHAT_CONTENT.welcome);
      playMiau();
    } else {
      setIsOpen(false);
      setCatMood("quieto");
    }
  };

  const handleUserMessage = (text: string) => {
    const cleanedText = text.trim();
    if (!cleanedText) return;

    const intent = getIntentFromText(cleanedText);
    applyReply(intent);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    handleUserMessage(inputValue);
    setInputValue("");
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 999999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        pointerEvents: "none",
      }}
    >
      {isOpen && (
        <div
          style={{
            pointerEvents: "auto",
            width: "300px",
            backgroundColor: "white",
            borderRadius: "24px",
            padding: "15px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            marginBottom: "10px",
            position: "relative",
            border: "1px solid #eee",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", gap: "10px" }}>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#333", lineHeight: 1.35 }}>{reply.text}</p>
            <button
              onClick={handleToggle}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#ccc", lineHeight: 1 }}
            >
              ×
            </button>
          </div>

          {reply.showDonationLink && (
            <div style={{ marginBottom: "10px" }}>
              <Link
                href="/donaciones"
                style={{ fontSize: "12px", color: "#6b4ce6", fontWeight: 600, textDecoration: "underline" }}
              >
                Ir a la página de donaciones
              </Link>
            </div>
          )}

          {reply.showGuideButton && (
            <div style={{ marginBottom: "10px" }}>
              <Link
                href="/guia-bienestar.pdf"
                target="_blank"
                style={{ fontSize: "12px", color: "#6b4ce6", fontWeight: 600, textDecoration: "underline" }}
              >
                Abrir guía de bienestar
              </Link>
            </div>
          )}

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
            {QUICK_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion.label}
                type="button"
                onClick={() => handleUserMessage(suggestion.trigger)}
                style={{
                  border: "1px solid #e9e9e9",
                  background: "#f8f8ff",
                  color: "#333",
                  borderRadius: "999px",
                  fontSize: "11px",
                  padding: "6px 10px",
                  cursor: "pointer",
                }}
              >
                {suggestion.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "5px" }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe aquí..."
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                fontSize: "12px",
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{ padding: "8px 12px", borderRadius: "10px", border: "none", backgroundColor: "#eee", cursor: "pointer" }}
            >
              →
            </button>
          </form>
        </div>
      )}

      <button
        onClick={handleToggle}
        style={{
          pointerEvents: "auto",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          backgroundColor: "white",
          border: "4px solid #f9f9f9",
          boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          cursor: "pointer",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
        }}
      >
        <div
          style={{
            width: "128px",
            height: "128px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: "scale(0.85) translateY(5px)",
          }}
        >
          <div
            className={`gato-anim gato-${catMood} ${isHappy ? "gato-feliz" : ""}`}
            style={{
              width: "128px",
              height: "128px",
              backgroundImage: "url('/images/gato_asistente.png')",
              backgroundRepeat: "no-repeat",
              backgroundSize: "512px 512px",
              imageRendering: "pixelated",
            }}
          />
        </div>
      </button>

      <style jsx>{`
        .gato-quieto {
          background-position: 0px 0px;
        }

        .gato-reposo {
          animation: reposo 1.2s steps(4) infinite;
        }

        @keyframes reposo {
          from {
            background-position: 0px 0px;
          }
          to {
            background-position: -512px 0px;
          }
        }

        .gato-hablando {
          animation: hablando 0.4s steps(2) infinite;
        }

        @keyframes hablando {
          from {
            background-position: 0px -128px;
          }
          to {
            background-position: -256px -128px;
          }
        }

        .gato-feliz {
          filter: drop-shadow(0 0 8px rgba(255, 214, 79, 0.95));
        }

        .gato-anim {
          margin-left: -5px;
          transition: filter 0.2s ease;
        }
      `}</style>
    </div>
  );
}
