"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";

// --- DEFINICIÓN DE TIPOS (ESTRICTAMENTE ORIGINALES) ---
type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult:
    | ((event: { 
        resultIndex: number; 
        results: ArrayLike<{ isFinal: boolean } & ArrayLike<{ transcript: string }> > 
      }) => void)
    | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

// MEJORA: Añadimos estados de sueño manteniendo los originales
type CatMood = "quieto" | "reposo" | "hablando" | "dormido_quieto" | "dormido_mov";

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
};

type SectionSuggestion = {
  section: string;
  href: string;
};

// --- CONSTANTES ---
const WELCOME_MESSAGE = "¡Hola! Soy el asistente de GatoCan. ¿En qué puedo ayudarte, miau?";

const QUICK_SUGGESTIONS = [
  { label: "🐾 ¿Cómo donar?", trigger: "¿Cómo puedo donar a GatoCan?" },
  { label: "🎮 Puntos Karma", trigger: "¿Cómo consigo puntos Karma en Runner?" },
  { label: "🐱 Guía Bienestar", trigger: "¿Dónde veo la guía de bienestar animal?" },
];

const STATIC_SHORTCUTS: SectionSuggestion[] = [
  { section: "Donaciones", href: "/donaciones" },
  { section: "Foro", href: "/foro" },
  { section: "Noticias", href: "/noticias" },
];

/**
 * Función original: mergeWithoutDuplicateSuffix
 * Mantiene toda la lógica de comparación de palabras y sufijos
 */
const mergeWithoutDuplicateSuffix = (currentText: string, newText: string) => {
  const normalizedCurrent = currentText.replace(/\s+/g, " ").trim();
  const normalizedNew = newText.replace(/\s+/g, " ").trim();

  if (!normalizedCurrent) return normalizedNew;
  if (!normalizedNew) return normalizedCurrent;
  if (normalizedCurrent === normalizedNew || normalizedCurrent.endsWith(normalizedNew)) return normalizedCurrent;

  const currentWords = normalizedCurrent.toLowerCase().split(" ");
  const newWords = normalizedNew.split(" ");
  const loweredNewWords = newWords.map((word) => word.toLowerCase());

  let overlapSize = 0;
  const maxOverlap = Math.min(currentWords.length, loweredNewWords.length);

  for (let size = maxOverlap; size > 0; size -= 1) {
    const currentSuffix = currentWords.slice(-size).join(" ");
    const newPrefix = loweredNewWords.slice(0, size).join(" ");

    if (currentSuffix === newPrefix) {
      overlapSize = size;
      break;
    }
  }

  const uniqueWords = newWords.slice(overlapSize);
  if (uniqueWords.length === 0) return normalizedCurrent;

  return `${normalizedCurrent} ${uniqueWords.join(" ")}`.replace(/\s+/g, " ").trim();
};
export default function GatoAsistente() {
  const [isOpen, setIsOpen] = useState(false);
  const [catMood, setCatMood] = useState<CatMood>("quieto");
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", text: WELCOME_MESSAGE }]);
  const [inputValue, setInputValue] = useState("");
  const [isHappy, setIsHappy] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<SectionSuggestion[]>([]);

  // --- REFS DE CONTROL DE SUEÑO (AÑADIDAS) ---
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sleepCycleRef = useRef<NodeJS.Timeout | null>(null);

  // --- REFS ORIGINALES (MANTENIDAS) ---
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const happyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const shouldKeepListeningRef = useRef(false);
  const lastTranscriptRef = useRef("");

  // --- FUNCIONES DE GESTIÓN DE ESTADOS (NUEVAS) ---
  const startSleepTimer = useCallback(() => {
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    if (sleepCycleRef.current) clearInterval(sleepCycleRef.current);

    if (!isOpen) {
      sleepTimerRef.current = setTimeout(() => {
        setCatMood("dormido_quieto");
        
        // Ciclo de movimiento cada 8 segundos mientras duerme
        sleepCycleRef.current = setInterval(() => {
          setCatMood("dormido_mov");
          setTimeout(() => {
            setCatMood((prev) => (prev === "dormido_mov" ? "dormido_quieto" : prev));
          }, 2000); // El movimiento dura 2 segundos
        }, 8000);
      }, 8000); // Se duerme tras 8 segundos de inactividad
    }
  }, [isOpen]);

  const wakeUp = useCallback(() => {
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    if (sleepCycleRef.current) clearInterval(sleepCycleRef.current);
    if (catMood.includes("dormido")) {
      setCatMood("quieto");
    }
  }, [catMood]);

  // --- EFECTO DE INICIALIZACIÓN (AUDIO Y VOZ) ---
  useEffect(() => {
    audioRef.current = new Audio("/sounds/miau.mp3");
    audioRef.current.preload = "auto";

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "es-ES";

      recognition.onresult = (event) => {
        const finalChunks: string[] = [];

        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i];
          if (result?.isFinal) {
            const chunk = (result[0]?.transcript ?? "").trim();
            if (chunk) finalChunks.push(chunk);
          }
        }

        const finalTranscript = finalChunks.join(" ").replace(/\s+/g, " ").trim();
        if (!finalTranscript) return;

        if (lastTranscriptRef.current.toLowerCase() === finalTranscript.toLowerCase()) {
          return;
        }
        lastTranscriptRef.current = finalTranscript;

        setInputValue((prev) => {
          return mergeWithoutDuplicateSuffix(prev, finalTranscript);
        });
      };

      recognition.onerror = () => {
        shouldKeepListeningRef.current = false;
        setIsListening(false);
      };

      recognition.onend = () => {
        if (shouldKeepListeningRef.current) {
          recognition.start();
          return;
        }
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      setIsSpeechSupported(true);
    }

    startSleepTimer();

    return () => {
      shouldKeepListeningRef.current = false;
      recognitionRef.current?.stop();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (happyTimeoutRef.current) clearTimeout(happyTimeoutRef.current);
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
      if (sleepCycleRef.current) clearInterval(sleepCycleRef.current);
    };
  }, [startSleepTimer]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // --- FUNCIONES DE INTERACCIÓN ---
  const playMiau = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  };

  const setTalkingState = () => {
    wakeUp();
    setCatMood("hablando");

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setCatMood("reposo");
      startSleepTimer();
    }, 3000);
  };

  const maybeHappyReaction = (text: string) => {
    const normalized = text.toLowerCase();
    const isPositive = ["gracias", "genial", "crack", "perfecto", "amor"].some((token) => normalized.includes(token));

    if (isPositive) {
      setIsHappy(true);
      if (happyTimeoutRef.current) clearTimeout(happyTimeoutRef.current);
      happyTimeoutRef.current = setTimeout(() => setIsHappy(false), 2500);
    }
  };
    // --- GESTIÓN DE ENVÍO Y APERTURA ---
  const handleToggle = () => {
    if (!isOpen) {
      wakeUp();
      setIsOpen(true);
      setCatMood("reposo");
      // Mantiene el historial o pone el mensaje de bienvenida
      setMessages((prev) => (prev.length ? prev : [{ role: "assistant", text: WELCOME_MESSAGE }]));
      playMiau();
    } else {
      shouldKeepListeningRef.current = false;
      recognitionRef.current?.stop();
      setIsListening(false);
      setIsOpen(false);
      setCatMood("quieto");
      // Al cerrar, el gato empieza a contar para dormirse
      startSleepTimer();
    }
  };

  const handleMicToggle = () => {
    if (!recognitionRef.current || isTyping) return;
    if (isListening) {
      shouldKeepListeningRef.current = false;
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    shouldKeepListeningRef.current = true;
    recognitionRef.current.start();
    setIsListening(true);
  };

  const askAI = async (text: string, nextHistory: ChatMessage[]) => {
    const recentMessages = nextHistory.slice(-8);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          messages: recentMessages.map((msg) => ({
            role: msg.role,
            content: msg.text,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "No se pudo consultar la IA.");
      }

      const assistantText = (data?.reply as string)?.trim() || "Miau... me quedé sin palabras 😿";
      const aiSuggestions = Array.isArray(data?.suggestions) ? (data.suggestions as SectionSuggestion[]) : [];

      setDynamicSuggestions(aiSuggestions);
      setMessages((prev) => [...prev, { role: "assistant", text: assistantText }]);
      
      setTalkingState();
      playMiau();
      maybeHappyReaction(text);
    } catch (error) {
      const fallback = error instanceof Error ? error.message : "Error inesperado al hablar con la IA.";
      setMessages((prev) => [...prev, { role: "assistant", text: `Ups, tuve un problema: ${fallback}` }]);
      setTalkingState();
    } finally {
      setIsTyping(false);
    }
  };

  const handleUserMessage = async (text: string) => {
    const cleanedText = text.trim();
    if (!cleanedText || isTyping) return;

    const userMessage: ChatMessage = { role: "user", text: cleanedText };
    const nextHistory = [...messages, userMessage];

    setMessages(nextHistory);
    setInputValue("");
    lastTranscriptRef.current = "";
    setIsTyping(true);
    setTalkingState();

    await askAI(cleanedText, nextHistory);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleUserMessage(inputValue);
  };

  // --- RENDERIZADO DEL COMPONENTE ---
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
      {/* VENTANA DE CHAT */}
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
          {/* Cabecera */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", gap: "10px" }}>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#333", lineHeight: 1.35 }}>
              Gatito asistente
            </p>
            <button
              onClick={handleToggle}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#ccc", lineHeight: 1 }}
            >
              ×
            </button>
          </div>

          {/* Mensajes */}
          <div
            style={{
              maxHeight: "200px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginBottom: "10px",
              paddingRight: "3px",
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={`${msg.role}-${idx}`}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "88%",
                  padding: "8px 10px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  lineHeight: 1.35,
                  background: msg.role === "user" ? "#eef2ff" : "#f8f8f8",
                  color: "#333",
                }}
              >
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div style={{ alignSelf: "flex-start", maxWidth: "88%", padding: "8px 10px", borderRadius: "12px", fontSize: "12px", lineHeight: 1.35, background: "#f8f8f8", color: "#777", fontStyle: "italic" }}>
                Escribiendo...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Sugerencias Rápidas */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
            {QUICK_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion.label}
                type="button"
                onClick={() => handleUserMessage(suggestion.trigger)}
                style={{ border: "1px solid #e9e9e9", background: "#f8f8ff", color: "#333", borderRadius: "999px", fontSize: "11px", padding: "6px 10px", cursor: "pointer" }}
              >
                {suggestion.label}
              </button>
            ))}
          </div>

          {/* Accesos Directos */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
            {[...STATIC_SHORTCUTS, ...dynamicSuggestions]
              .filter((item, index, array) => array.findIndex((it) => it.href === item.href) === index)
              .slice(0, 5)
              .map((item) => (
                <Link
                  key={`${item.href}-${item.section}`}
                  href={item.href}
                  style={{ border: "1px dashed #d9d9d9", background: "#fff", color: "#6b4ce6", borderRadius: "999px", fontSize: "11px", padding: "5px 10px", textDecoration: "none" }}
                >
                  Ir a {item.section}
                </Link>
              ))}
          </div>

          {/* Formulario */}
          <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "5px" }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe aquí..."
              style={{ flex: 1, padding: "8px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "12px", outline: "none" }}
            />
            <button
              type="button"
              onClick={handleMicToggle}
              disabled={!isSpeechSupported || isTyping}
              style={{ padding: "8px 10px", borderRadius: "10px", border: "none", backgroundColor: !isSpeechSupported || isTyping ? "#f3f3f3" : isListening ? "#ff4d4f" : "#eee", color: isListening ? "#fff" : "#333", cursor: !isSpeechSupported || isTyping ? "not-allowed" : "pointer" }}
            >
              {isListening ? "⏹️" : "🎤"}
            </button>
            <button
              type="submit"
              disabled={isTyping}
              style={{ padding: "8px 12px", borderRadius: "10px", border: "none", backgroundColor: isTyping ? "#f3f3f3" : "#eee", cursor: isTyping ? "not-allowed" : "pointer" }}
            >
              →
            </button>
          </form>
        </div>
      )}

      {/* BOTÓN DEL GATO (CON ZOOM Y ANIMACIONES) */}
      <button
        onClick={handleToggle}
        className="gato-main-button"
        style={{
          pointerEvents: "auto",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          backgroundColor: "rgba(232, 245, 233, 0.6)", 
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "2px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          cursor: "pointer",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }}
      >
        <div style={{ width: "128px", height: "128px", display: "flex", alignItems: "center", justifyContent: "center", transform: "scale(0.85) translateY(5px)" }}>
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
        /* CRECIMIENTO AL PULSAR/HOVER */
        .gato-main-button:hover, .gato-main-button:active {
          transform: scale(1.1); /* ~8px en PC */
        }
        @media (max-width: 768px) {
          .gato-main-button:hover, .gato-main-button:active {
            transform: scale(1.04); /* ~3px en móvil */
          }
        }

        /* ANIMACIONES ORIGINALES */
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

        /* NUEVAS ANIMACIONES DE SUEÑO */
        .gato-dormido_quieto {
          background-position: -128px -256px;
        }

        .gato-dormido_mov {
          animation: durmiendo_mov 2s steps(4) infinite;
        }

        @keyframes durmiendo_mov {
          from { background-position: -256px -256px; }
          to { background-position: 0px -384px; }
        }

        .gato-feliz { filter: drop-shadow(0 0 8px rgba(255, 214, 79, 0.95)); }
        .gato-anim { margin-left: -5px; transition: filter 0.2s ease; }
      `}</style>
    </div>
  );
      }
            
  
   
