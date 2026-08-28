// --- 1. TIPOS E INTERFACES ---
// Exportamos el tipo para que GaleriaActuaciones pueda usarlo en su estado 'filter'
export type GalleryCategory = "all" | "colonias" | "capturas" | "esterilizaciones" | "actuaciones";

export interface GatoColonia {
  id: number;
  nombre: string;
  colonia: string;
  imagen: string;
  detalles: {
    esterilizacion: string;
    enfermedad: string;
    tratamiento: string;
    edad: string;
    desaparicion: string;
    caracter: string;
  };
}

export interface GalleryImage {
  src: string;
  alt: string;
  category: Exclude<GalleryCategory, "all">; // Evita que una imagen sea categoría "all"
  tag: string;
  caption: string;
}

// --- 2. DATOS DE COLONIAS ---
export const gatosColonia: GatoColonia[] = [
  { id: 1, nombre: "Fina", colonia: "Río Norte", imagen: "/img/fina.jpg", detalles: { esterilizacion: "Hecha ✅", enfermedad: "Enfermedad hepática", tratamiento: "Seguimiento veterinario", edad: "2 años", desaparicion: "No", caracter: "Tranquilo" } },
  { id: 2, nombre: "Arturito", colonia: "Mirador", imagen: "/img/arturito.jpg", detalles: { esterilizacion: "Hecha ✅", enfermedad: "Enfermedad hepática", tratamiento: "Seguimiento veterinario", edad: "2 años", desaparicion: "No", caracter: "Dócil" } },
  { id: 3, nombre: "Blondie", colonia: "Río Norte", imagen: "/img/blondie.jpg", detalles: { esterilizacion: "Hecha ✅", enfermedad: "Ninguna", tratamiento: "Ninguno", edad: "3 años", desaparicion: "No", caracter: "Activo" } },
  { id: 4, nombre: "Cisna", colonia: "Gatos Abandonados", imagen: "/img/cisna.jpg", detalles: { esterilizacion: "Pendiente ⏳", enfermedad: "Ninguna", tratamiento: "Ninguno", edad: "10 meses", desaparicion: "No", caracter: "Juguetón" } },
  { id: 5, nombre: "Txipi", colonia: "Gatos Abandonados", imagen: "/img/txipi.jpg", detalles: { esterilizacion: "Pendiente ⏳", enfermedad: "Ninguna", tratamiento: "Ninguno", edad: "10 meses", desaparicion: "No", caracter: "Activo" } },
  { id: 6, nombre: "Menta", colonia: "Mirador", imagen: "https://images.pexels.com/photos/617278/pexels-photo-617278.jpeg", detalles: { esterilizacion: "Pendiente ⏳", enfermedad: "Ninguna", tratamiento: "Ninguno", edad: "1 año", desaparicion: "No", caracter: "Juguetón" } },
  { id: 7, nombre: "Rayo", colonia: "Fonteboa", imagen: "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg", detalles: { esterilizacion: "Hecha ✅", enfermedad: "Lesión ocular", tratamiento: "Cuidados oculares", edad: "4 años", desaparicion: "No", caracter: "Independiente" } },
  { id: 8, nombre: "Luna", colonia: "Parque Central", imagen: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=500&auto=format&fit=crop", detalles: { esterilizacion: "Hecha ✅", enfermedad: "Ninguna", tratamiento: "Ninguno", edad: "1 año", desaparicion: "No", caracter: "Travieso" } },
  { id: 9, nombre: "Zeus", colonia: "Río Norte", imagen: "https://images.pexels.com/photos/104827/cat-pet-animal-domestic-104827.jpeg", detalles: { esterilizacion: "Pendiente ⏳", enfermedad: "Ronquera", tratamiento: "Observación", edad: "2 años", desaparicion: "No", caracter: "Independiente" } },
  { id: 10, nombre: "Oreo", colonia: "Mirador", imagen: "https://images.pexels.com/photos/208984/pexels-photo-208984.jpeg", detalles: { esterilizacion: "Hecha ✅", enfermedad: "Ninguna", tratamiento: "Ninguno", edad: "1 año", desaparicion: "No", caracter: "Dócil" } },
  { id: 11, nombre: "Misu", colonia: "Río Norte", imagen: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=500&auto=format&fit=crop", detalles: { esterilizacion: "Hecha ✅", enfermedad: "Ninguna", tratamiento: "Ninguno", edad: "3 años", desaparicion: "No", caracter: "Tranquilo" } },
  { id: 12, nombre: "Bigotes", colonia: "Mirador", imagen: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?q=80&w=500&auto=format&fit=crop", detalles: { esterilizacion: "Pendiente ⏳", enfermedad: "Ninguna", tratamiento: "Ninguno", edad: "2 años", desaparicion: "No", caracter: "Juguetón" } },
  { id: 13, nombre: "Nube", colonia: "Río Norte", imagen: "https://images.pexels.com/photos/165775/pexels-photo-165775.jpeg", detalles: { esterilizacion: "Hecha ✅", enfermedad: "Gingivitis leve", tratamiento: "Higiene bucal", edad: "5 años", desaparicion: "No", caracter: "Sociable" } },
];

// --- 3. DATOS DE GALERÍA ---
export const galleryImages: GalleryImage[] = [
  {
    src: "/img/foto-01.jpg",
    alt: "Gato negro en jaula humanitaria",
    category: "capturas",
    tag: "Capturas",
    caption: "Captura segura en jaula humanitaria.",
  },
  {
    src: "/img/foto-02.jpg",
    alt: "Gato en jaula verde de captura",
    category: "capturas",
    tag: "Capturas",
    caption: "Preparación y revisión durante el traslado.",
  },
  {
    src: "/img/foto-03.jpg",
    alt: "Gato en jaula cubierta en clínica",
    category: "capturas",
    tag: "Capturas",
    caption: "Zona de espera para minimizar estrés.",
  },
  {
    src: "/img/foto-04.jpg",
    alt: "Gato en jaula sobre mesa clínica",
    category: "esterilizaciones",
    tag: "Esterilizaciones",
    caption: "Ingreso para revisión previa veterinaria.",
  },
  {
    src: "/img/foto-05.jpg",
    alt: "Gato blanco en jaula de observación",
    category: "colonias",
    tag: "Colonias",
    caption: "Control individualizado por colonia.",
  },
  {
    src: "/img/foto-06.jpg",
    alt: "Gata tricolor en transportín de captura",
    category: "actuaciones",
    tag: "Actuaciones",
    caption: "Actuación coordinada para caso urgente.",
  },
];
