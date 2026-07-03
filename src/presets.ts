import { DesignConfig, LayoutTemplate, FontFamily, TextAlignment } from "./types";

export interface PresetTheme {
  id: string;
  name: string;
  description: string;
  layout: LayoutTemplate;
  bgColor: string;
  textColor: string;
  accentColor: string;
  overlayOpacity: number;
  fontFamily: FontFamily;
  alignment: TextAlignment;
  cardRounded: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  cardShadow: "none" | "sm" | "md" | "lg" | "xl" | "brutalist";
  bgPattern: string; // "none" | "grid" | "dots" | "radial-aurora" | "warm-sunset" | "tech-nodes"
}

export const PRESET_THEMES: PresetTheme[] = [
  {
    id: "modern-tech",
    name: "Aero Tech Grid",
    description: "Modern professional look with clean layout and tech accents",
    layout: "bold-modern",
    bgColor: "#0f172a", // Slate 900
    textColor: "#f8fafc", // Slate 50
    accentColor: "#38bdf8", // Sky 400
    overlayOpacity: 0.35,
    fontFamily: "sans-serif",
    alignment: "left",
    cardRounded: "xl",
    cardShadow: "lg",
    bgPattern: "grid"
  },
  {
    id: "editorial-warm",
    name: "Editorial Cozy",
    description: "High-end serif font paired with earthy warm backgrounds",
    layout: "elegant-editorial",
    bgColor: "#faf7f2", // Cream off-white
    textColor: "#1c1917", // Stone 900
    accentColor: "#c2410c", // Orange 700
    overlayOpacity: 0.2,
    fontFamily: "serif",
    alignment: "center",
    cardRounded: "none",
    cardShadow: "none",
    bgPattern: "warm-sunset"
  },
  {
    id: "raw-brutalist",
    name: "Neo Brutalist",
    description: "Edgy cyber style with thick borders and high-energy contrasts",
    layout: "neo-brutalist",
    bgColor: "#facc15", // Vibrant Yellow
    textColor: "#000000",
    accentColor: "#3b82f6", // Bright Blue
    overlayOpacity: 0.1,
    fontFamily: "monospace",
    alignment: "left",
    cardRounded: "none",
    cardShadow: "brutalist",
    bgPattern: "dots"
  },
  {
    id: "cosmic-cyber",
    name: "Cosmic Neon",
    description: "Futuristic neon-purple vibes with blurred circular glows",
    layout: "cosmic-slate",
    bgColor: "#090514", // Near black violet
    textColor: "#fdfaff",
    accentColor: "#d946ef", // Fuchsia
    overlayOpacity: 0.5,
    fontFamily: "sans-serif",
    alignment: "left",
    cardRounded: "2xl",
    cardShadow: "xl",
    bgPattern: "radial-aurora"
  },
  {
    id: "pure-minimalist",
    name: "Zen Minimal",
    description: "Stripped-back styling focused strictly on content and balance",
    layout: "clean-minimal",
    bgColor: "#ffffff",
    textColor: "#18181b", // Zinc 900
    accentColor: "#71717a", // Zinc 500
    overlayOpacity: 0.15,
    fontFamily: "sans-serif",
    alignment: "center",
    cardRounded: "lg",
    cardShadow: "sm",
    bgPattern: "none"
  },
  {
    id: "retro-film",
    name: "Vintage Film",
    description: "Polaroid aesthetic with warm-toned handwriting",
    layout: "film-retro",
    bgColor: "#e7e5e4", // Warm grey
    textColor: "#292524",
    accentColor: "#ea580c", // Sunset orange
    overlayOpacity: 0.3,
    fontFamily: "handwriting",
    alignment: "left",
    cardRounded: "md",
    cardShadow: "md",
    bgPattern: "tech-nodes"
  }
];

export const FONTS = {
  "sans-serif": {
    name: "Inter & Space Grotesk",
    className: "font-sans",
    cssValue: "'Inter', system-ui, sans-serif"
  },
  "serif": {
    name: "Playfair Display & Lora",
    className: "font-serif",
    cssValue: "'Playfair Display', 'Georgia', serif"
  },
  "monospace": {
    name: "JetBrains Mono",
    className: "font-mono",
    cssValue: "'JetBrains Mono', 'Fira Code', monospace"
  },
  "handwriting": {
    name: "Dancing Script / Vintage",
    className: "font-handwriting",
    cssValue: "'Dancing Script', 'Caveat', cursive"
  }
};

export const COLOR_PALETTES = [
  { name: "Midnight Teal", bg: "#0d1b2a", text: "#e0e1dd", accent: "#415a77" },
  { name: "Nordic Frost", bg: "#eceff1", text: "#263238", accent: "#00acc1" },
  { name: "Sunset Horizon", bg: "#1a0f1a", text: "#fce7f3", accent: "#f43f5e" },
  { name: "Forest Sage", bg: "#f4f6f0", text: "#1c2e24", accent: "#5c715e" },
  { name: "Stark Orange", bg: "#0a0a0a", text: "#ffffff", accent: "#ff6b00" },
  { name: "Neon Matrix", bg: "#040d04", text: "#d1ffd1", accent: "#00ff66" }
];

export const DEFAULT_DESIGN: DesignConfig = {
  layout: "bold-modern",
  headline: "Double Your Output by Saying No",
  mainText: "Focus is not about saying yes to what you want. It's about saying no to the other hundred good ideas. Every time you say yes to a distraction, you say no to your main goal.",
  watermark: "© creative.mindset",
  image: "", // starts empty
  imageFit: "cover",
  imageFilter: "none",
  imageScale: 1.0,
  imageX: 0,
  imageY: 0,
  bgColor: "#1e1b4b", // Deep indigo
  textColor: "#ffffff",
  accentColor: "#fbbf24", // Gold
  overlayOpacity: 0.45,
  fontFamily: "sans-serif",
  alignment: "left",
  aspectRatio: "1:1",
  cardPadding: 1.5,
  cardRounded: "xl",
  cardShadow: "lg",
  watermarkBadge: true,
  watermarkPosition: "bottom-right"
};
