export type LayoutTemplate =
  | "bold-modern"
  | "elegant-editorial"
  | "neo-brutalist"
  | "cosmic-slate"
  | "clean-minimal"
  | "film-retro";

export type ImageFilter =
  | "none"
  | "grayscale"
  | "sepia"
  | "contrast"
  | "vintage"
  | "blur"
  | "warm"
  | "cool";

export type FontFamily = "sans-serif" | "serif" | "monospace" | "handwriting";

export type TextAlignment = "left" | "center" | "right";

export type AspectRatio = "1:1" | "16:9" | "9:16";

export interface DesignConfig {
  layout: LayoutTemplate;
  headline: string;
  mainText: string;
  watermark: string;
  image: string; // base64 URL or empty string
  imageFit: "cover" | "contain";
  imageFilter: ImageFilter;
  imageScale: number; // 0.5 to 2.0
  imageX: number; // percentage offset -100 to 100
  imageY: number; // percentage offset -100 to 100
  bgColor: string; // Background card / overlay color
  textColor: string; // Main text color
  accentColor: string; // Badges, highlights, frames color
  overlayOpacity: number; // Opacity of the background color/gradient overlay
  fontFamily: FontFamily;
  alignment: TextAlignment;
  aspectRatio: AspectRatio;
  cardPadding: number; // padding scalar
  cardRounded: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  cardShadow: "none" | "sm" | "md" | "lg" | "xl" | "brutalist";
  watermarkBadge: boolean;
  watermarkPosition: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "bottom-center";
}

export interface AIRecommendation {
  improvedHeadline: string;
  improvedMainText: string;
  improvedWatermark: string;
  recommendedLayout: LayoutTemplate;
  colors: {
    background: string;
    text: string;
    accent: string;
    overlayOpacity: number;
  };
  typography: {
    fontFamily: FontFamily;
    alignment: TextAlignment;
  };
  explanation: string;
  suggestedHashtags: string[];
}
