"use client";
import { useState, useEffect } from 'react';

// WHITE_LIST: Prioridad para bienestar animal y noticias locales de Galicia/Ourense
const WHITE_LIST = [
  "gato", "bienestar animal", "protectora", "ley animal", 
  "colonias felinas", "CER", "mascotas", "animales", 
  "veterinario", "adopción", "Galicia", "Ourense", 
  "Trives", "San Xoán de Río", "Xunta", "abandono"
];

// FEEDS: Combinación de medios locales gallegos y nacionales especializados
const FEEDS = [
  'https://www.lavozdegalicia.es/sociedad/index.xml', // Local Galicia
  'https://www.farodevigo.es/rss/section/1',         // Local / Regional
  'https://www.20minutos.es/rss/animales/',          // Especializado Animales
  'https://www.europapress.es/rss/rss.aspx?ch=00066', // Sociedad General
  'https://www.efe.com/efe/espana/efeverde/rss'       // Medio Ambiente
];

export default function NoticiasGatocan() {
  const [news, setNews] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllNews() {
      try {
        // Consultamos todas las fuentes a la vez
        const allResponses = await Promise.all(
          FEEDS.map(url => 
            fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(url))
              .then(r => r.json())
          )
        );

        let combinedItems: any[] = [];
        const parser = new DOMParser();

        allResponses.forEach(res => {
          const xmlDoc = parser.parseFromString(res.contents, "text/xml");
          const items = Array.from(xmlDoc.querySelectorAll("item"));
          combined
          
