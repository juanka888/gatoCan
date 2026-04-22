"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult:
    | ((event: { resultIndex: number; results: ArrayLike<{ isFinal: boolean } & ArrayLike<{ transcript: string }> > }) => void)
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

type CatMood = "quieto" | "reposo" | "hablando";

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
};

type SectionSuggestion = {
  section: string;
  href: string;
};

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

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const happyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const shouldKeepListeningRef = useRef(false);

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
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0]?.transcript ?? "";
          }
        }

        const cleanTranscript = finalTranscript.trim();
        if (!cleanTranscript) return;

        setInputValue((prev) => `${prev} ${cleanTranscript}`.trim());
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

    return () => {
      shouldKeepListeningRef.current = false;
      recognitionRef.current?.stop();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (happyTimeoutRef.current) clearTimeout(happyTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const playMiau = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {
      // El audio puede bloquearse por autoplay/política del navegador.
    });
  };

  const setTalkingState = () => {
    setCatMood("hablando");

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCatMood("reposo"), 3000);
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

  const handleToggle = () => {
    if (!isOpen) {
      setIsOpen(true);
      setCatMood("reposo");
      setMessages((prev) => (prev.length ? prev : [{ role: "assistant", text: WELCOME_MESSAGE }]));
      playMiau();
    } else {
      shouldKeepListeningRef.current = false;
      recognitionRef.current?.stop();
      setIsListening(false);
      setIsOpen(false);
      setCatMood("quieto");
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
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          messages: nextHistory.map((msg) => ({ role: msg.role, content: msg.text })),
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
    setIsTyping(true);
    setTalkingState();

    await askAI(cleanedText, nextHistory);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleUserMessage(inputValue);
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
            <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#333", lineHeight: 1.35 }}>Gatito asistente</p>
            <button
              onClick={handleToggle}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#ccc", lineHeight: 1 }}
            >
              ×
            </button>
          </div>

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
              <div
                style={{
                  alignSelf: "flex-start",
                  maxWidth: "88%",
                  padding: "8px 10px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  lineHeight: 1.35,
                  background: "#f8f8f8",
                  color: "#777",
                  fontStyle: "italic",
                }}
              >
                Escribiendo...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

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

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
            {[...STATIC_SHORTCUTS, ...dynamicSuggestions]
              .filter((item, index, array) => array.findIndex((it) => it.href === item.href) === index)
              .slice(0, 5)
              .map((item) => (
                <Link
                  key={`${item.href}-${item.section}`}
                  href={item.href}
                  style={{
                    border: "1px dashed #d9d9d9",
                    background: "#fff",
                    color: "#6b4ce6",
                    borderRadius: "999px",
                    fontSize: "11px",
                    padding: "5px 10px",
                    textDecoration: "none",
                  }}
                >
                  Ir a {item.section}
                </Link>
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
              type="button"
              onClick={handleMicToggle}
              disabled={!isSpeechSupported || isTyping}
              aria-label={isListening ? "Detener reconocimiento de voz" : "Iniciar reconocimiento de voz"}
              title={isSpeechSupported ? "Micrófono" : "Reconocimiento de voz no disponible"}
              className={isListening ? "animate-pulse" : ""}
              style={{
                padding: "8px 10px",
                borderRadius: "10px",
                border: "none",
                backgroundColor: !isSpeechSupported || isTyping ? "#f3f3f3" : isListening ? "#ff4d4f" : "#eee",
                color: isListening ? "#fff" : "#333",
                cursor: !isSpeechSupported || isTyping ? "not-allowed" : "pointer",
              }}
            >
              {isListening ? "⏹️" : "🎤"}
            </button>
            <button
              type="submit"
              disabled={isTyping}
              style={{
                padding: "8px 12px",
                borderRadius: "10px",
                border: "none",
                backgroundColor: isTyping ? "#f3f3f3" : "#eee",
                cursor: isTyping ? "not-allowed" : "pointer",
              }}
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
