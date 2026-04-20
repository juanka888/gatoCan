"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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
  const [dynamicSuggestions, setDynamicSuggestions] = useState<SectionSuggestion[]>([]);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const happyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/sounds/miau.mp3");
    audioRef.current.preload = "auto";

    return () => {
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
      setIsOpen(false);
      setCatMood("quieto");
    }
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
            width: "300
    
