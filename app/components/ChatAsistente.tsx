"use client";

import Link from "next/link";
import { MutableRefObject } from "react";

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
};

type SectionSuggestion = {
  section: string;
  href: string;
};

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

type ChatAsistenteProps = {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  inputValue: string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  isTyping: boolean;
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
  isListening: boolean;
  isSpeechSupported: boolean;
  dynamicSuggestions: SectionSuggestion[];
  setDynamicSuggestions: React.Dispatch<React.SetStateAction<SectionSuggestion[]>>;
  chatEndRef: MutableRefObject<HTMLDivElement | null>;
  lastTranscriptRef: MutableRefObject<string>;
  onClose: () => void;
  onMicToggle: () => void;
  setTalkingState: () => void;
  playMiau: () => void;
  maybeHappyReaction: (text: string) => void;
};

export default function ChatAsistente({
  messages,
  setMessages,
  inputValue,
  setInputValue,
  isTyping,
  setIsTyping,
  isListening,
  isSpeechSupported,
  dynamicSuggestions,
  setDynamicSuggestions,
  chatEndRef,
  lastTranscriptRef,
  onClose,
  onMicToggle,
  setTalkingState,
  playMiau,
  maybeHappyReaction,
}: ChatAsistenteProps) {
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

  return (
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
        <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#333", lineHeight: 1.35 }}>
          Gatito asistente
        </p>
        <button
          onClick={onClose}
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
            style={{ border: "1px solid #e9e9e9", background: "#f8f8ff", color: "#333", borderRadius: "999px", fontSize: "11px", padding: "6px 10px", cursor: "pointer" }}
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
              style={{ border: "1px dashed #d9d9d9", background: "#fff", color: "#6b4ce6", borderRadius: "999px", fontSize: "11px", padding: "5px 10px", textDecoration: "none" }}
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
          style={{ flex: 1, padding: "8px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "12px", outline: "none" }}
        />
        <button
          type="button"
          onClick={onMicToggle}
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
  );
}
