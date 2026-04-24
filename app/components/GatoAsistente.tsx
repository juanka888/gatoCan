"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";

/**
 * --- SECCIÓN DE TIPOS Y DEFINICIONES ---
 * Mantenemos todas las interfaces detalladas para asegurar
 * la compatibilidad con la API de SpeechRecognition.
 */

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

// Estados de ánimo del gato: Quieto, Reposo, Hablando y los nuevos de Sueño
type CatMood = "quieto" | "reposo" | "hablando" | "dormido_quieto" | "dormido_mov";

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
};

type SectionSuggestion = {
  section: string;
  href: string;
};

/**
 * --- CONSTANTES DE TEXTO ---
 * Mensajes de bienvenida y sugerencias predefinidas.
 */
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
 * Función: mergeWithoutDuplicateSuffix
 * ESTA ES LA LÓGICA ORIGINAL COMPLETA. 
 * No se ha simplificado para mantener la precisión en el dictado por voz.
 */
const mergeWithoutDuplicateSuffix = (currentText: string, newText: string) => {
  // 1. Normalización inicial de los textos
  const normalizedCurrent = currentText.replace(/\s+/g, " ").trim();
  const normalizedNew = newText.replace(/\s+/g, " ").trim();

  // 2. Casos base: si uno de los dos está vacío
  if (!normalizedCurrent) {
    return normalizedNew;
  }
  if (!normalizedNew) {
    return normalizedCurrent;
  }

  // 3. Si el nuevo texto ya está incluido al final, no hacemos nada
  if (normalizedCurrent === normalizedNew || normalizedCurrent.endsWith(normalizedNew)) {
    return normalizedCurrent;
  }

  // 4. Desglose en palabras para buscar solapamientos
  const currentWords = normalizedCurrent.toLowerCase().split(" ");
  const newWords = normalizedNew.split(" ");
  const loweredNewWords = newWords.map((word) => word.toLowerCase());

  let overlapSize = 0;
  const maxOverlap = Math.min(currentWords.length, loweredNewWords.length);

  // 5. Bucle de búsqueda de coincidencia de sufijo-prefijo
  for (let size = maxOverlap; size > 0; size -= 1) {
    const currentSuffix = currentWords.slice(-size).join(" ");
    const newPrefix = loweredNewWords.slice(0, size).join(" ");

    if (currentSuffix === newPrefix) {
      overlapSize = size;
      break;
    }
  }

  // 6. Extraer solo las palabras que no se solapan
  const uniqueWords = newWords.slice(overlapSize);

  if (uniqueWords.length === 0) {
    return normalizedCurrent;
  }

  // 7. Unión final y limpieza de espacios dobles
  const combined = `${normalizedCurrent} ${uniqueWords.join(" ")}`;
  const finalResult = combined.replace(/\s+/g, " ").trim();

  return finalResult;
};
export default function GatoAsistente() {
  // --- ESTADOS INICIALES ---
  const [isOpen, setIsOpen] = useState(false);
  const [catMood, setCatMood] = useState<CatMood>("quieto");
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", text: WELCOME_MESSAGE }]);
  const [inputValue, setInputValue] = useState("");
  const [isHappy, setIsHappy] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<SectionSuggestion[]>([]);

  // --- REFS DE CONTROL (SUEÑO Y ANIMACIÓN) ---
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sleepCycleRef = useRef<NodeJS.Timeout | null>(null);

  // --- REFS ORIGINALES DE LÓGICA ---
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const happyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const shouldKeepListeningRef = useRef(false);
  const lastTranscriptRef = useRef("");

  // --- GESTIÓN DEL SUEÑO (8 SEGUNDOS) ---
  const startSleepTimer = useCallback(() => {
    // Limpiamos cualquier temporizador previo para evitar duplicados
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
    }
    if (sleepCycleRef.current) {
      clearInterval(sleepCycleRef.current);
    }

    // El gato solo se duerme si el chat está cerrado y no hay actividad
    if (!isOpen) {
      sleepTimerRef.current = setTimeout(() => {
        setCatMood("dormido_quieto");
        
        // Iniciamos el ciclo de "respiración/movimiento" cada 8 segundos
        sleepCycleRef.current = setInterval(() => {
          setCatMood("dormido_mov");
          
          // El movimiento dura 2 segundos y vuelve a quietud dormida
          setTimeout(() => {
            setCatMood((prev) => {
              if (prev === "dormido_mov") return "dormido_quieto";
              return prev;
            });
          }, 2000);
        }, 8000);
      }, 8000); 
    }
  }, [isOpen]);

  // Función para despertar al gato inmediatamente
  const wakeUp = useCallback(() => {
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
    }
    if (sleepCycleRef.current) {
      clearInterval(sleepCycleRef.current);
    }
    
    // Si estaba dormido, lo pasamos a quieto/despierto
    if (catMood === "dormido_quieto" || catMood === "dormido_mov") {
      setCatMood("quieto");
    }
  }, [catMood]);

  // --- EFECTO DE CONFIGURACIÓN DE VOZ Y AUDIO ---
  useEffect(() => {
    // Configuración del sonido miau
    audioRef.current = new Audio("/sounds/miau.mp3");
    audioRef.current.preload = "auto";

    // Detección de compatibilidad con Web Speech API
    const SpeechRecognitionClass = 
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "es-ES";

      // Lógica de procesamiento de resultados de voz
      recognition.onresult = (event: any) => {
        const finalChunks: string[] = [];

        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i];
          if (result?.isFinal) {
            const chunk = (result[0]?.transcript ?? "").trim();
            if (chunk) {
              finalChunks.push(chunk);
            }
          }
        }

        const finalTranscript = finalChunks.join(" ").replace(/\s+/g, " ").trim();
        
        if (!finalTranscript) return;
        
        // Evitar duplicados exactos en el historial reciente
        if (lastTranscriptRef.current.toLowerCase() === finalTranscript.toLowerCase()) {
          return;
        }
        
        lastTranscriptRef.current = finalTranscript;

        // Mezclamos con el texto que ya hubiera en el input
        setInputValue((prev) => {
          const merged = mergeWithoutDuplicateSuffix(prev, finalTranscript);
          return merged;
        });
      };

      recognition.onerror = (event: any) => {
        console.error("Error en reconocimiento de voz:", event.error);
        shouldKeepListeningRef.current = false;
        setIsListening(false);
      };

      recognition.onend = () => {
        // Reiniciar automáticamente si el usuario no lo ha detenido
        if (shouldKeepListeningRef.current) {
          recognition.start();
          return;
        }
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      setIsSpeechSupported(true);
    }

    // Iniciamos el contador de sueño al montar
    startSleepTimer();

    // Limpieza al desmontar el componente
    return () => {
      shouldKeepListeningRef.current = false;
      recognitionRef.current?.stop();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (happyTimeoutRef.current) clearTimeout(happyTimeoutRef.current);
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
      if (sleepCycleRef.current) clearInterval(sleepCycleRef.current);
    };
  }, [startSleepTimer]);

  // Efecto para auto-scroll al final del chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Funciones auxiliares de comportamiento
  const playMiau = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch((e) => console.warn("Audio bloqueado:", e));
  };

  const setTalkingState = () => {
    wakeUp();
    setCatMood("hablando");
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setCatMood("reposo");
      startSleepTimer();
    }, 3000);
  };

  const maybeHappyReaction = (text: string) => {
    const normalized = text.toLowerCase();
    const positiveWords = ["gracias", "genial", "crack", "perfecto", "amor", "lindo", "bueno", "vale"];
    const isPositive = positiveWords.some((word) => normalized.includes(word));
    
    if (isPositive) {
      setIsHappy(true);
      if (happyTimeoutRef.current) {
        clearTimeout(happyTimeoutRef.current);
      }
      happyTimeoutRef.current = setTimeout(() => {
        setIsHappy(false);
      }, 2500);
    }
  };
  // --- MANEJADORES DE EVENTOS ---
  const handleToggle = () => {
    if (!isOpen) {
      wakeUp();
      setIsOpen(true);
      setCatMood("reposo");
      // Mantenemos mensajes previos si existen
      setMessages((prev) => (prev.length ? prev : [{ role: "assistant", text: WELCOME_MESSAGE }]));
      playMiau();
    } else {
      // Al cerrar, detenemos el micro y activamos temporizador de sueño
      shouldKeepListeningRef.current = false;
      recognitionRef.current?.stop();
      setIsListening(false);
      setIsOpen(false);
      setCatMood("quieto");
      startSleepTimer();
    }
  };

  const handleMicToggle = () => {
    if (!recognitionRef.current || isTyping) return;
    
    if (isListening) {
      shouldKeepListeningRef.current = false;
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      shouldKeepListeningRef.current = true;
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const askAI = async (text: string, nextHistory: ChatMessage[]) => {
    // Solo enviamos los últimos 8 mensajes para ahorrar capacidad de la API
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
        throw new Error(data?.error || "Fallo en la comunicación con la IA.");
      }

      const assistantReply = (data?.reply as string)?.trim() || "Miau... no sé qué decir.";
      const aiSuggestions = Array.isArray(data?.suggestions) ? (data.suggestions as SectionSuggestion[]) : [];

      setDynamicSuggestions(aiSuggestions);
      setMessages((prev) => [...prev, { role: "assistant", text: assistantReply }]);
      
      setTalkingState();
      playMiau();
      maybeHappyReaction(text);
      
    } catch (error: any) {
      console.error("Error IA:", error);
      setMessages((prev) => [...prev, { role: "assistant", text: "Miau... parece que algo falló en mi cabecita." }]);
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

  return (
    <div 
      className="gato-wrapper"
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
      {/* CONTENEDOR DEL CHAT */}
      {isOpen && (
        <div 
          className="chat-container"
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "14px", fontWeight: "bold", color: "#333" }}>Asistente GatoCan</span>
            <button onClick={handleToggle} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: "20px" }}>×</button>
          </div>

          {/* Historial */}
          <div 
            style={{
              maxHeight: "220px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              marginBottom: "12px",
              paddingRight: "4px"
            }}
          >
            {messages.map((msg, idx) => (
              <div 
                key={`${msg.role}-${idx}`}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  padding: "10px 12px",
                  borderRadius: "16px",
                  fontSize: "12.5px",
                  lineHeight: "1.4",
                  background: msg.role === "user" ? "#4f46e5" : "#f3f4f6",
                  color: msg.role === "user" ? "white" : "#374151"
                }}
              >
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div style={{ alignSelf: "flex-start", fontSize: "11px", color: "#9ca3af", fontStyle: "italic" }}>Gatito escribiendo...</div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Sugerencias Rápidas */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
            {QUICK_SUGGESTIONS.map((q) => (
              <button 
                key={q.label}
                onClick={() => handleUserMessage(q.trigger)}
                style={{ padding: "5px 10px", borderRadius: "20px", border: "1px solid #e5e7eb", background: "white", fontSize: "11px", cursor: "pointer", color: "#4b5563" }}
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Enlaces dinámicos */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
            {[...STATIC_SHORTCUTS, ...dynamicSuggestions].filter((v,i,a)=>a.findIndex(t=>(t.href===v.href))===i).slice(0,4).map((link) => (
              <Link key={link.href} href={link.href} style={{ fontSize: "11px", color: "#4f46e5", textDecoration: "underline" }}>
                {link.section}
              </Link>
            ))}
          </div>

          {/* Formulario de entrada */}
          <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "6px" }}>
            <input 
              type="text" 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Pregúntame algo..."
              style={{ flex: 1, padding: "10px", borderRadius: "12px", border: "1px solid #d1d5db", fontSize: "12.5px", outline: "none" }}
            />
            <button 
              type="button" 
              onClick={handleMicToggle}
              style={{ padding: "10px", borderRadius: "12px", border: "none", backgroundColor: isListening ? "#ef4444" : "#f3f4f6", cursor: "pointer" }}
            >
              {isListening ? "⏹️" : "🎤"}
            </button>
            <button 
              type="submit" 
              style={{ padding: "10px 14px", borderRadius: "12px", border: "none", backgroundColor: "#4f46e5", color: "white", cursor: "pointer" }}
            >
              →
            </button>
          </form>
        </div>
      )}

      {/* BOTÓN CIRCULAR DEL GATO (CON ZOOM DINÁMICO) */}
      <button
        onClick={handleToggle}
        className="gato-trigger-button"
        style={{
          pointerEvents: "auto",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          backgroundColor: "white",
          boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
          border: "2px solid #e5e7eb",
          cursor: "pointer",
          overflow: "hidden", // Crucial para que el gato no se salga al moverse
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
        }}
      >
        <div style={{ transform: "scale(0.85) translateY(5px)" }}>
          <div
            className={`gato-sprite gato-${catMood} ${isHappy ? "gato-happy" : ""}`}
            style={{
              width: "128px",
              height: "128px",
              backgroundImage: "url('/images/gato_asistente.png')",
              backgroundSize: "512px 512px",
              imageRendering: "pixelated"
            }}
          />
        </div>
      </button>

      {/* ESTILOS CSS CON LAS MEJORAS DE ZOOM Y ANIMACIÓN */}
      <style jsx>{`
        /* Efecto Zoom en PC: +8px aprox */
        .gato-trigger-button:hover {
          transform: scale(1.1);
        }

        /* Efecto Zoom en Móvil: +3px aprox */
        @media (max-width: 768px) {
          .gato-trigger-button:hover {
            transform: scale(1.04);
          }
        }

        /* Animaciones del Sprite */
        .gato-quieto { background-position: 0px 0px; }
        
        .gato-reposo { animation: reposo-anim 1.2s steps(4) infinite; }
        @keyframes reposo-anim {
          from { background-position: 0px 0px; }
          to { background-position: -512px 0px; }
        }

        .gato-hablando { animation: hablando-anim 0.4s steps(2) infinite; }
        @keyframes hablando-anim {
          from { background-position: 0px -128px; }
          to { background-position: -256px -128px; }
        }

        /* SUEÑO: Fila 3 corregida (-256px en Y) */
        .gato-dormido_quieto { background-position: 0px -256px; }

        .gato-dormido_mov { animation: sueno-mov-anim 2s steps(4) infinite; }
        @keyframes sueno-mov-anim {
          from { background-position: 0px -256px; }
          to { background-position: -512px -256px; }
        }

        .gato-happy { filter: drop-shadow(0 0 10px #fcd34d); }
        .gato-sprite { transition: filter 0.3s ease; }
      `}</style>
    </div>
  );
}
