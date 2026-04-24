"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";

/**
 * --- SECCIÓN DE DEFINICIÓN DE TIPOS ---
 * Mantenemos todas las interfaces de la Web Speech API de forma explícita
 * para asegurar la robustez del sistema de reconocimiento de voz.
 */
interface SpeechRecognitionResult {
  isFinal: boolean;
  [key: number]: {
    transcript: string;
  };
  length: number;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [key: number]: SpeechRecognitionResult;
    length: number;
  };
}

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
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

/**
 * --- ESTADOS DE ÁNIMO DEL GATO ---
 * quieto: Estado inicial.
 * reposo: Animación de respiración.
 * hablando: Animación de maullido.
 * dormido_quieto: El gato hecho un ovillo sin moverse.
 * dormido_mov: El gato moviéndose ligeramente mientras duerme.
 */
type CatMood = "quieto" | "reposo" | "hablando" | "dormido_quieto" | "dormido_mov";

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
};

type SectionSuggestion = {
  section: string;
  href: string;
};

// Mensajes y sugerencias predefinidas
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
 * Lógica de comparación de palabras para evitar duplicados en el reconocimiento de voz.
 * Esta versión mantiene cada paso de validación y limpieza de espacios.
 */
const mergeWithoutDuplicateSuffix = (currentText: string, newText: string): string => {
  // Paso 1: Normalizar espacios y limpiar extremos
  const normalizedCurrent = currentText.replace(/\s+/g, " ").trim();
  const normalizedNew = newText.replace(/\s+/g, " ").trim();

  // Paso 2: Validar si alguno de los textos está vacío
  if (!normalizedCurrent) return normalizedNew;
  if (!normalizedNew) return normalizedCurrent;
  
  // Paso 3: Comprobar si el texto nuevo ya está contenido al final
  if (normalizedCurrent === normalizedNew || normalizedCurrent.endsWith(normalizedNew)) {
    return normalizedCurrent;
  }

  // Paso 4: Fragmentar en palabras para buscar solapamientos exactos
  const currentWords = normalizedCurrent.toLowerCase().split(" ");
  const newWords = normalizedNew.split(" ");
  const loweredNewWords = newWords.map((word) => word.toLowerCase());

  let overlapSize = 0;
  const maxOverlap = Math.min(currentWords.length, loweredNewWords.length);

  // Paso 5: Algoritmo de ventana deslizante para detectar el prefijo común
  for (let size = maxOverlap; size > 0; size -= 1) {
    const currentSuffix = currentWords.slice(-size).join(" ");
    const newPrefix = loweredNewWords.slice(0, size).join(" ");

    if (currentSuffix === newPrefix) {
      overlapSize = size;
      break;
    }
  }

  // Paso 6: Concatenar solo la parte única del nuevo texto
  const uniqueWords = newWords.slice(overlapSize);
  
  if (uniqueWords.length === 0) {
    return normalizedCurrent;
  }

  const result = `${normalizedCurrent} ${uniqueWords.join(" ")}`;
  
  // Paso 7: Limpieza final de seguridad
  return result.replace(/\s+/g, " ").trim();
};
export default function GatoAsistente() {
  // --- ESTADOS ---
  const [isOpen, setIsOpen] = useState(false);
  const [catMood, setCatMood] = useState<CatMood>("quieto");
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", text: WELCOME_MESSAGE }]);
  const [inputValue, setInputValue] = useState("");
  const [isHappy, setIsHappy] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<SectionSuggestion[]>([]);

  // --- REFERENCIAS (CONTROL TOTAL) ---
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sleepCycleRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const happyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const shouldKeepListeningRef = useRef(false);
  const lastTranscriptRef = useRef("");

  // --- LÓGICA DE SUEÑO (8 SEGUNDOS) ---
  const startSleepTimer = useCallback(() => {
    // Limpiamos intervalos existentes antes de iniciar uno nuevo
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    if (sleepCycleRef.current) clearInterval(sleepCycleRef.current);

    // El gato solo inicia el proceso de sueño si el chat está cerrado
    if (!isOpen) {
      sleepTimerRef.current = setTimeout(() => {
        // Fase 1: Ovillo quieto
        setCatMood("dormido_quieto");
        
        // Fase 2: Ciclo de movimiento profundo cada 10 segundos
        sleepCycleRef.current = setInterval(() => {
          setCatMood("dormido_mov");
          
          // El movimiento dura 3 segundos y vuelve a quietud
          setTimeout(() => {
            setCatMood((prev) => {
              if (prev === "dormido_mov") return "dormido_quieto";
              return prev;
            });
          }, 3000); 
        }, 10000);
      }, 8000); 
    }
  }, [isOpen]);

  const wakeUp = useCallback(() => {
    // Cancelar todos los procesos de sueño inmediatamente
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    if (sleepCycleRef.current) clearInterval(sleepCycleRef.current);
    
    if (catMood === "dormido_quieto" || catMood === "dormido_mov") {
      setCatMood("quieto");
    }
  }, [catMood]);

  // --- EFECTO DE INICIALIZACIÓN: VOZ Y AUDIO ---
  useEffect(() => {
    // Carga del audio miau
    audioRef.current = new Audio("/sounds/miau.mp3");
    audioRef.current.preload = "auto";

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "es-ES";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = "";
        
        // Procesamos los resultados finales acumulados
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          }
        }

        if (finalTranscript.trim()) {
          setInputValue((prev) => {
            const merged = mergeWithoutDuplicateSuffix(prev, finalTranscript);
            return merged;
          });
        }
      };

      recognition.onerror = (err) => {
        console.error("Error en Speech Recognition:", err);
        setIsListening(false);
      };

      recognition.onend = () => {
        // Reinicio automático si el micro sigue activado por el usuario
        if (shouldKeepListeningRef.current) {
          recognition.start();
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      setIsSpeechSupported(true);
    }

    startSleepTimer();

    return () => {
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
      if (sleepCycleRef.current) clearInterval(sleepCycleRef.current);
      recognitionRef.current?.stop();
    };
  }, [startSleepTimer]);

  // --- MANEJADORES DE ESTADO DEL GATO ---
  const playMiau = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
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

  const handleToggleChat = () => {
    if (!isOpen) {
      wakeUp();
      setIsOpen(true);
      setCatMood("reposo");
      playMiau();
    } else {
      setIsOpen(false);
      shouldKeepListeningRef.current = false;
      recognitionRef.current?.stop();
      setIsListening(false);
      startSleepTimer();
    }
  };
  const handleUserMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMsg: ChatMessage = { role: "user", text: trimmed };
    const newHistory = [...messages, userMsg];

    setMessages(newHistory);
    setInputValue("");
    setIsTyping(true);
    setTalkingState();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          messages: newHistory.map(m => ({ role: m.role, content: m.text }))
        }),
      });

      const data = await response.json();
      if (data.reply) {
        setMessages(prev => [...prev, { role: "assistant", text: data.reply }]);
        setDynamicSuggestions(data.suggestions || []);
        playMiau();
        setTalkingState();
      }
    } catch (error) {
      console.error("Error API Chat:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 999999, display: "flex", flexDirection: "column", alignItems: "flex-end", pointerEvents: "none" }}>
      
      {/* CAJA DE CHAT: Recuperamos el diseño original con flechas internas */}
      {isOpen && (
        <div style={{ pointerEvents: "auto", width: "320px", backgroundColor: "white", borderRadius: "24px", padding: "18px", boxShadow: "0 15px 50px rgba(0,0,0,0.2)", marginBottom: "12px", border: "1px solid #f0f0f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", alignItems: "center" }}>
            <span style={{ fontWeight: "bold", color: "#333", fontSize: "14px" }}>Asistente GatoCan</span>
            <button onClick={handleToggleChat} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "22px", color: "#ddd" }}>×</button>
          </div>

          <div style={{ maxHeight: "250px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "15px", paddingRight: "5px" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ alignSelf: msg.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%", padding: "10px 14px", borderRadius: "18px", fontSize: "13px", background: msg.role === "user" ? "#f7f7f7" : "#ffffff", border: msg.role === "assistant" ? "1px solid #eee" : "none", color: "#444" }}>
                {msg.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "15px" }}>
            {QUICK_SUGGESTIONS.map((s) => (
              <button key={s.label} onClick={() => handleUserMessage(s.trigger)} style={{ border: "1px solid #eee", background: "#fff", borderRadius: "10px", fontSize: "11px", padding: "5px 10px", cursor: "pointer" }}>{s.label}</button>
            ))}
            {STATIC_SHORTCUTS.map((link) => (
              <Link key={link.href} href={link.href} style={{ border: "1px dashed #ddd", background: "#fafafa", borderRadius: "10px", fontSize: "11px", padding: "5px 10px", textDecoration: "none", color: "#555" }}>
                {link.section} →
              </Link>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleUserMessage(inputValue); }} style={{ display: "flex", gap: "8px" }}>
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Miau..." style={{ flex: 1, padding: "10px", borderRadius: "12px", border: "1px solid #eee", fontSize: "13px", outline: "none" }} />
            <button type="submit" style={{ padding: "10px 15px", borderRadius: "12px", border: "none", backgroundColor: "#f0f0f0", cursor: "pointer" }}>→</button>
          </form>
        </div>
      )}

      {/* BOTÓN DEL GATO: GLASSMORPHISM VERDOSO + ZOOM 15% */}
      <button
        onClick={handleToggleChat}
        className="gato-button-trigger"
        style={{
          pointerEvents: "auto",
          width: "90px",
          height: "90px",
          borderRadius: "50%",
          backgroundColor: "rgba(232, 245, 233, 0.6)", // Tono verdoso transparente
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "2px solid rgba(255, 255, 255, 0.5)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          cursor: "pointer",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          position: "relative"
        }}
      >
        <div style={{ transform: "scale(0.9) translateY(4px)" }}>
          <div
            className={`gato-sprite-sheet gato-state-${catMood} ${isHappy ? "gato-is-happy" : ""}`}
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

      <style jsx>{`
        /* EFECTO ZOOM 15% */
        .gato-button-trigger {
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), background-color 0.3s ease;
        }
        .gato-button-trigger:hover, .gato-button-trigger:active {
          transform: scale(1.15);
          background-color: rgba(232, 245, 233, 0.8);
        }

        /* ANIMACIONES */
        .gato-state-quieto { background-position: 0px 0px; }
        
        .gato-state-reposo { animation: anim-reposo 1.2s steps(4) infinite; }
        @keyframes anim-reposo {
          from { background-position: 0px 0px; }
          to { background-position: -512px 0px; }
        }

        .gato-state-hablando { animation: anim-habla 0.4s steps(2) infinite; }
        @keyframes anim-habla {
          from { background-position: 0px -128px; }
          to { background-position: -256px -128px; }
        }

        /* SUEÑO: Fila 3. Ovillo quieto y movimiento profundo */
        .gato-state-dormido_quieto { background-position: 0px -256px; }

        .gato-state-dormido_mov { animation: anim-sueno 2.5s steps(4) infinite; }
        @keyframes anim-sueno {
          from { background-position: 0px -256px; }
          to { background-position: -512px -256px; }
        }

        .gato-is-happy { filter: drop-shadow(0 0 12px rgba(255, 223, 0, 0.9)); }
      `}</style>
    </div>
  );
}
