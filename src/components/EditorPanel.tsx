import React, { useState } from "react";
import { DesignConfig, LayoutTemplate, FontFamily, ImageFilter, TextAlignment, AIRecommendation } from "../types";
import { PRESET_THEMES, COLOR_PALETTES, FONTS } from "../presets";
import { 
  Type, 
  Sparkles, 
  Sliders, 
  Image as ImageIcon, 
  RotateCcw, 
  HelpCircle,
  Hash,
  ArrowRight,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Trash2,
  AlertCircle
} from "lucide-react";

interface EditorPanelProps {
  config: DesignConfig;
  onChange: (newConfig: DesignConfig) => void;
  aiRecommendation: AIRecommendation | null;
  isAiLoading: boolean;
  onTriggerAiRedesign: (stylePreference?: string) => void;
  onApplyAiRecommendation: () => void;
  onResetOriginal: () => void;
  onGenerateBackdrop: (prompt: string) => void;
  isImageGenerating: boolean;
  imageGenError: string | null;
  bgPattern: string;
  setBgPattern: (pattern: string) => void;
  isUsingAiCopy: boolean;
  toggleAiCopyMode: () => void;
}

export default function EditorPanel({
  config,
  onChange,
  aiRecommendation,
  isAiLoading,
  onTriggerAiRedesign,
  onApplyAiRecommendation,
  onResetOriginal,
  onGenerateBackdrop,
  isImageGenerating,
  imageGenError,
  bgPattern,
  setBgPattern,
  isUsingAiCopy,
  toggleAiCopyMode
}: EditorPanelProps) {
  const [activeTab, setActiveTab] = useState<"content" | "style" | "ai" | "backdrop">("content");
  const [backdropPrompt, setBackdropPrompt] = useState("");
  const [aiStylePreference, setAiStylePreference] = useState("");

  const handleTextChange = (field: keyof DesignConfig, value: string) => {
    onChange({ ...config, [field]: value });
  };

  const handleSelectLayout = (layout: LayoutTemplate) => {
    // Some templates default to specific fonts and alignment to look their best
    let updatedFontsAndAlign = {};
    if (layout === "elegant-editorial") {
      updatedFontsAndAlign = { fontFamily: "serif", alignment: "center" };
    } else if (layout === "neo-brutalist") {
      updatedFontsAndAlign = { fontFamily: "monospace", alignment: "left" };
    } else if (layout === "film-retro") {
      updatedFontsAndAlign = { fontFamily: "handwriting", alignment: "center" };
    }

    onChange({ 
      ...config, 
      layout,
      ...updatedFontsAndAlign
    });
  };

  // Image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChange({
            ...config,
            image: event.target.result as string,
            imageScale: 1.0,
            imageX: 0,
            imageY: 0
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    onChange({
      ...config,
      image: ""
    });
  };

  const applyPalette = (palette: { bg: string; text: string; accent: string }) => {
    onChange({
      ...config,
      bgColor: palette.bg,
      textColor: palette.text,
      accentColor: palette.accent
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Tab Select Header */}
      <div className="flex border-b border-neutral-800 bg-neutral-950/80 backdrop-blur select-none">
        <button
          onClick={() => setActiveTab("content")}
          className={`flex-1 py-3.5 px-2 text-xs font-medium border-b-2 flex items-center justify-center gap-2 transition ${
            activeTab === "content" 
              ? "border-amber-500 text-amber-500 bg-neutral-900/50" 
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <Type size={14} />
          <span>Content</span>
        </button>
        <button
          onClick={() => setActiveTab("style")}
          className={`flex-1 py-3.5 px-2 text-xs font-medium border-b-2 flex items-center justify-center gap-2 transition ${
            activeTab === "style" 
              ? "border-amber-500 text-amber-500 bg-neutral-900/50" 
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <Sliders size={14} />
          <span>Styles & FX</span>
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`flex-1 py-3.5 px-2 text-xs font-medium border-b-2 flex items-center justify-center gap-2 transition relative ${
            activeTab === "ai" 
              ? "border-amber-500 text-amber-500 bg-neutral-900/50" 
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <Sparkles size={14} className="text-amber-400" />
          <span>AI Redesign</span>
          {aiRecommendation && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("backdrop")}
          className={`flex-1 py-3.5 px-2 text-xs font-medium border-b-2 flex items-center justify-center gap-2 transition ${
            activeTab === "backdrop" 
              ? "border-amber-500 text-amber-500 bg-neutral-900/50" 
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <ImageIcon size={14} />
          <span>AI Backdrop</span>
        </button>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* ========================================================== */}
        {/* TAB 1: CONTENT */}
        {/* ========================================================== */}
        {activeTab === "content" && (
          <div className="space-y-5 animate-fadeIn">
            {/* Headline */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
                Post Headline
              </label>
              <textarea
                value={config.headline}
                onChange={(e) => handleTextChange("headline", e.target.value)}
                placeholder="Type your catchy headline..."
                className="w-full h-20 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-neutral-200 focus:outline-none focus:border-amber-500/50 resize-none transition"
              />
            </div>

            {/* Main Text */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
                Core Message / Body Text
              </label>
              <textarea
                value={config.mainText}
                onChange={(e) => handleTextChange("mainText", e.target.value)}
                placeholder="Type the main paragraph of your post..."
                className="w-full h-32 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-neutral-200 focus:outline-none focus:border-amber-500/50 resize-none transition"
              />
            </div>

            {/* Watermark / Branding */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
                  Watermark Label
                </label>
                <input
                  type="text"
                  value={config.watermark}
                  onChange={(e) => handleTextChange("watermark", e.target.value)}
                  placeholder="@username or brand"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-neutral-200 focus:outline-none focus:border-amber-500/50 transition"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
                  Watermark Layout
                </label>
                <select
                  value={config.watermarkPosition}
                  onChange={(e: any) => handleTextChange("watermarkPosition", e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-neutral-300 focus:outline-none focus:border-amber-500/50 transition"
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-center">Bottom Center</option>
                  <option value="top-right">Top Right</option>
                  <option value="top-left">Top Left</option>
                </select>
              </div>
            </div>

            {/* Image Upload Area */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
                Background Image / Product Photo
              </label>
              
              {config.image ? (
                <div className="relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={config.image} 
                      alt="Thumbnail" 
                      className="w-12 h-12 rounded object-cover border border-neutral-800"
                    />
                    <div>
                      <p className="text-xs font-medium text-neutral-200">Custom Image Loaded</p>
                      <p className="text-[10px] text-neutral-500">Ready for layout overrides</p>
                    </div>
                  </div>
                  <button 
                    onClick={clearImage}
                    className="p-1.5 hover:bg-neutral-800 text-red-400 hover:text-red-300 rounded-lg transition"
                    title="Remove Image"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <div className="border border-dashed border-neutral-800 bg-neutral-950 hover:bg-neutral-900/50 rounded-xl p-5 text-center transition relative cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <ImageIcon className="mx-auto mb-2 text-neutral-500 group-hover:text-amber-400 transition-all group-hover:scale-110" size={24} />
                  <p className="text-xs font-medium text-neutral-300">
                    Click to upload / drag & drop photo
                  </p>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Supports JPG, PNG, WebP. Local processing.
                  </p>
                </div>
              )}
            </div>

            {/* Preset Themes Quick Bar */}
            <div className="space-y-2 pt-2 border-t border-neutral-800">
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider font-mono flex items-center gap-1">
                <Palette size={12} />
                <span>Quick Style Presets</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      onChange({
                        ...config,
                        layout: theme.layout,
                        bgColor: theme.bgColor,
                        textColor: theme.textColor,
                        accentColor: theme.accentColor,
                        overlayOpacity: theme.overlayOpacity,
                        fontFamily: theme.fontFamily,
                        alignment: theme.alignment,
                        cardRounded: theme.cardRounded,
                        cardShadow: theme.cardShadow,
                      });
                      setBgPattern(theme.bgPattern);
                    }}
                    className="px-2.5 py-2 text-left bg-neutral-950 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900 rounded-xl transition flex flex-col justify-between"
                  >
                    <span className="text-xs font-semibold text-neutral-200">{theme.name}</span>
                    <span className="text-[9px] text-neutral-500 mt-0.5 truncate">{theme.description}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 2: STYLES & OVERRIDES */}
        {/* ========================================================== */}
        {activeTab === "style" && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Visual Redesign Presets */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
                1. Structural Layout Template
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {(["bold-modern", "elegant-editorial", "neo-brutalist", "cosmic-slate", "clean-minimal", "film-retro"] as LayoutTemplate[]).map((layout) => (
                  <button
                    key={layout}
                    onClick={() => handleSelectLayout(layout)}
                    className={`py-2 px-2 border rounded-xl text-xs font-medium text-center capitalize transition flex flex-col items-center justify-center gap-1 ${
                      config.layout === layout 
                        ? "border-amber-500 bg-amber-500/10 text-amber-400" 
                        : "border-neutral-800 bg-neutral-950 hover:bg-neutral-900 text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    <span className="truncate">{layout.replace("-", " ")}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Colors Swatches & Custom Pickers */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
                2. Theme & Custom Colors
              </h3>
              
              {/* Preset Palettes */}
              <div className="grid grid-cols-6 gap-2">
                {COLOR_PALETTES.map((palette, idx) => (
                  <button
                    key={idx}
                    onClick={() => applyPalette(palette)}
                    className="h-7 w-full rounded-lg overflow-hidden border border-neutral-800 flex flex-col relative group"
                    title={palette.name}
                  >
                    <div className="flex-1 flex">
                      <div className="w-1/2 h-full" style={{ backgroundColor: palette.bg }} />
                      <div className="w-1/4 h-full" style={{ backgroundColor: palette.text }} />
                      <div className="w-1/4 h-full" style={{ backgroundColor: palette.accent }} />
                    </div>
                  </button>
                ))}
              </div>

              {/* Color Hex Selectors */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-neutral-400">Backdrop</span>
                  <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded-lg p-1.5">
                    <input 
                      type="color" 
                      value={config.bgColor} 
                      onChange={(e) => handleTextChange("bgColor", e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-[10px] font-mono select-all text-neutral-300">{config.bgColor.toUpperCase()}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-neutral-400">Typography</span>
                  <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded-lg p-1.5">
                    <input 
                      type="color" 
                      value={config.textColor} 
                      onChange={(e) => handleTextChange("textColor", e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-[10px] font-mono select-all text-neutral-300">{config.textColor.toUpperCase()}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-neutral-400">Accent</span>
                  <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded-lg p-1.5">
                    <input 
                      type="color" 
                      value={config.accentColor} 
                      onChange={(e) => handleTextChange("accentColor", e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-[10px] font-mono select-all text-neutral-300">{config.accentColor.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Typography Family & Alignment */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
                  3. Font Family
                </label>
                <select
                  value={config.fontFamily}
                  onChange={(e: any) => handleTextChange("fontFamily", e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-2 text-xs text-neutral-300 focus:outline-none focus:border-amber-500/50"
                >
                  {Object.entries(FONTS).map(([key, item]) => (
                    <option key={key} value={key}>{item.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
                  4. Text Align
                </label>
                <div className="flex bg-neutral-950 rounded-xl p-1 border border-neutral-800">
                  {(["left", "center", "right"] as TextAlignment[]).map((align) => (
                    <button
                      key={align}
                      onClick={() => handleTextChange("alignment", align)}
                      className={`flex-1 py-1 px-1 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-200 transition ${
                        config.alignment === align ? "bg-neutral-800 text-amber-500" : ""
                      }`}
                    >
                      {align === "left" && <AlignLeft size={14} />}
                      {align === "center" && <AlignCenter size={14} />}
                      {align === "right" && <AlignRight size={14} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Background Procedural Patterns (Mesh/Dots) */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
                5. Canvas Procedural Pattern
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "none", name: "Solid Fill" },
                  { id: "grid", name: "Aero Grid" },
                  { id: "dots", name: "Classic Dots" },
                  { id: "radial-aurora", name: "Aurora Glow" },
                  { id: "warm-sunset", name: "Warm Blend" },
                  { id: "tech-nodes", name: "Tech Rings" },
                ].map((pattern) => (
                  <button
                    key={pattern.id}
                    onClick={() => setBgPattern(pattern.id)}
                    className={`py-1.5 px-1 border rounded-lg text-xs font-medium text-center transition ${
                      bgPattern === pattern.id 
                        ? "border-amber-500 bg-amber-500/5 text-amber-400" 
                        : "border-neutral-800 bg-neutral-950 hover:bg-neutral-900 text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    {pattern.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider Attributes */}
            <div className="space-y-4 pt-4 border-t border-neutral-800">
              <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
                6. Density & Composition sliders
              </h3>

              {/* Tint Overlay Opacity */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs text-neutral-400">
                  <span>Overlay Color Opacity</span>
                  <span className="font-mono text-neutral-300">{Math.round(config.overlayOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="0.9"
                  step="0.05"
                  value={config.overlayOpacity}
                  onChange={(e) => handleTextChange("overlayOpacity", parseFloat(e.target.value).toString())}
                  className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Card Padding */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs text-neutral-400">
                  <span>Layout Padding Margin</span>
                  <span className="font-mono text-neutral-300">{config.cardPadding.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="2.5"
                  step="0.1"
                  value={config.cardPadding}
                  onChange={(e) => handleTextChange("cardPadding", parseFloat(e.target.value).toString())}
                  className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Watermark Details */}
              <div className="flex items-center justify-between p-3 bg-neutral-950 border border-neutral-800 rounded-xl">
                <div>
                  <h4 className="text-xs font-semibold text-neutral-200">Watermark Frame Badge</h4>
                  <p className="text-[10px] text-neutral-500">Add styled container backing</p>
                </div>
                <button
                  onClick={() => handleTextChange("watermarkBadge", (!config.watermarkBadge).toString())}
                  className={`w-10 h-6 rounded-full p-1 transition ${
                    config.watermarkBadge ? "bg-amber-500" : "bg-neutral-800"
                  }`}
                >
                  <div className={`bg-neutral-950 w-4 h-4 rounded-full transition transform ${
                    config.watermarkBadge ? "translate-x-4" : "translate-x-0"
                  }`} />
                </button>
              </div>
            </div>

            {/* Image Custom Fit & Scale (only shown if custom image exists) */}
            {config.image && (
              <div className="space-y-4 pt-4 border-t border-neutral-800">
                <h3 className="text-xs font-semibold text-amber-500 uppercase tracking-wider font-mono flex items-center gap-1">
                  <ImageIcon size={12} />
                  <span>7. Background Image Filters & Scaling</span>
                </h3>

                {/* Filters */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-neutral-400">Visual Filter Effects</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(["none", "grayscale", "sepia", "contrast", "vintage", "blur", "warm", "cool"] as ImageFilter[]).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => handleTextChange("imageFilter", filter)}
                        className={`py-1 rounded-md text-[10px] font-medium capitalize border transition ${
                          config.imageFilter === filter
                            ? "border-amber-500 bg-amber-500/10 text-amber-400"
                            : "border-neutral-800 bg-neutral-950 text-neutral-400"
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Aspect Fit Option */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-neutral-400">Scaling Sizing Fit</span>
                    <select
                      value={config.imageFit}
                      onChange={(e: any) => handleTextChange("imageFit", e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1.5 text-xs text-neutral-300 focus:outline-none"
                    >
                      <option value="cover">Crop Fill (Cover)</option>
                      <option value="contain">Fit Entire (Contain)</option>
                    </select>
                  </div>

                  {/* Image Scale */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400">
                      <span>Zoom Scale</span>
                      <span>{Math.round(config.imageScale * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.5"
                      step="0.05"
                      value={config.imageScale}
                      onChange={(e) => handleTextChange("imageScale", parseFloat(e.target.value).toString())}
                      className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500 mt-2"
                    />
                  </div>
                </div>

                {/* Offsets (X / Y) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400">
                      <span>Horizontal Offset</span>
                      <span>{config.imageX}%</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={config.imageX}
                      onChange={(e) => handleTextChange("imageX", parseInt(e.target.value).toString())}
                      className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500 mt-1"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400">
                      <span>Vertical Offset</span>
                      <span>{config.imageY}%</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={config.imageY}
                      onChange={(e) => handleTextChange("imageY", parseInt(e.target.value).toString())}
                      className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500 mt-1"
                    />
                  </div>
                </div>

                {/* Reset offsets */}
                <button
                  onClick={() => {
                    onChange({
                      ...config,
                      imageScale: 1.0,
                      imageX: 0,
                      imageY: 0
                    });
                  }}
                  className="w-full py-1.5 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-[11px] font-medium rounded-lg text-neutral-400 flex items-center justify-center gap-1 transition"
                >
                  <RotateCcw size={12} />
                  <span>Reset Image Zoom & Alignment Offsets</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 3: AI REDESIGN ASSISTANT */}
        {/* ========================================================== */}
        {activeTab === "ai" && (
          <div className="space-y-5 animate-fadeIn">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                  <Sparkles size={18} className="fill-amber-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-amber-400">Gemini-Powered Redesigner</h4>
                  <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                    Let Gemini analyze your current photo layout and text content to build an optimal matching post layout, custom palette, and polished copy!
                  </p>
                </div>
              </div>

              {/* Quick style keyword preference */}
              <div className="pt-2">
                <label className="block text-[10px] font-mono text-neutral-400 mb-1 uppercase tracking-wider">
                  Optional Mood/Style Direction
                </label>
                <input
                  type="text"
                  placeholder="e.g. 'viral growth, minimalist slate, retro memories'"
                  value={aiStylePreference}
                  onChange={(e) => setAiStylePreference(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-amber-500/30 transition"
                />
              </div>

              <button
                disabled={isAiLoading}
                onClick={() => onTriggerAiRedesign(aiStylePreference)}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-neutral-800 disabled:text-neutral-500 text-neutral-950 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-amber-500/10"
              >
                {isAiLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                    <span>Gemini is redesigning...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="fill-neutral-950" />
                    <span>Redesign My Post with Gemini AI</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Results Output */}
            {aiRecommendation ? (
              <div className="space-y-4 animate-slideUp">
                <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                  <span className="text-xs font-bold text-neutral-200">Redesign Proposal</span>
                  <div className="flex gap-2">
                    <button
                      onClick={onResetOriginal}
                      className="px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-[10px] font-medium rounded-lg text-neutral-400 flex items-center gap-1 transition"
                    >
                      <RotateCcw size={10} />
                      <span>Original</span>
                    </button>
                    <button
                      onClick={onApplyAiRecommendation}
                      className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-[10px] font-semibold rounded-lg flex items-center gap-1 transition shadow-lg shadow-amber-500/5"
                    >
                      <span>Apply Redesign</span>
                      <ArrowRight size={10} />
                    </button>
                  </div>
                </div>

                {/* Explanation */}
                <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono text-amber-500">DESIGNER EXPLANATION</span>
                  <p className="text-xs text-neutral-300 leading-relaxed italic">
                    "{aiRecommendation.explanation}"
                  </p>
                </div>

                {/* layout & details pills */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl">
                    <span className="block text-[9px] font-mono text-neutral-500 uppercase">Recommended Layout</span>
                    <span className="text-xs font-semibold text-neutral-200 capitalize mt-0.5 block">{aiRecommendation.recommendedLayout.replace("-", " ")}</span>
                  </div>
                  <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl">
                    <span className="block text-[9px] font-mono text-neutral-500 uppercase">Recommended Font</span>
                    <span className="text-xs font-semibold text-neutral-200 capitalize mt-0.5 block">{aiRecommendation.typography.fontFamily}</span>
                  </div>
                </div>

                {/* Color Scheme suggestions preview */}
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                  <span className="block text-[10px] font-mono text-neutral-400 uppercase">AI Color Match Palette</span>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-6 h-6 rounded border border-neutral-800" style={{ backgroundColor: aiRecommendation.colors.background }} title="Background" />
                      <div className="w-6 h-6 rounded border border-neutral-800" style={{ backgroundColor: aiRecommendation.colors.text }} title="Text" />
                      <div className="w-6 h-6 rounded border border-neutral-800" style={{ backgroundColor: aiRecommendation.colors.accent }} title="Accent" />
                    </div>
                    <p className="text-[10px] text-neutral-500">
                      Cohesive contrast matching the visual theme
                    </p>
                  </div>
                </div>

                {/* Text Content Toggles */}
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] font-mono text-neutral-400 uppercase">Optimized Headlines & Copy</span>
                      <p className="text-[10px] text-neutral-500">Toggle whether to render original or AI copy</p>
                    </div>
                    <button
                      onClick={toggleAiCopyMode}
                      className={`px-3 py-1 text-[10px] font-semibold rounded-lg transition ${
                        isUsingAiCopy 
                          ? "bg-amber-500 text-neutral-950" 
                          : "bg-neutral-800 text-neutral-400 hover:text-neutral-200"
                      }`}
                    >
                      {isUsingAiCopy ? "Using AI Copy" : "Using Original"}
                    </button>
                  </div>

                  <div className="space-y-2 border-t border-neutral-900 pt-2.5">
                    <div>
                      <span className="text-[9px] font-mono text-neutral-500 block">AI Headline:</span>
                      <p className="text-xs font-medium text-neutral-200 mt-0.5">{aiRecommendation.improvedHeadline}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-neutral-500 block">AI Body text:</span>
                      <p className="text-xs text-neutral-300 mt-0.5 leading-relaxed">{aiRecommendation.improvedMainText}</p>
                    </div>
                  </div>
                </div>

                {/* Hashtags */}
                {aiRecommendation.suggestedHashtags && aiRecommendation.suggestedHashtags.length > 0 && (
                  <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-1.5">
                    <span className="block text-[10px] font-mono text-neutral-400 uppercase flex items-center gap-1">
                      <Hash size={10} />
                      <span>Suggested Hashtags</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {aiRecommendation.suggestedHashtags.map((tag) => (
                        <span key={tag} className="text-[10px] font-mono bg-neutral-900 text-amber-400 px-2 py-0.5 rounded border border-neutral-800">
                          {tag.startsWith("#") ? tag : `#${tag}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-neutral-800 bg-neutral-950/40 rounded-2xl select-none">
                <HelpCircle className="mx-auto mb-2 text-neutral-600" size={20} />
                <p className="text-xs font-medium text-neutral-400">No recommendation generated yet</p>
                <p className="text-[10px] text-neutral-600 mt-0.5 px-6">
                  Input headline & text then click "Redesign" to trigger Gemini.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 4: BACKDROP GENERATION */}
        {/* ========================================================== */}
        {activeTab === "backdrop" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-neutral-800 text-amber-400 rounded-xl">
                  <ImageIcon size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-neutral-200">AI Background Generator</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Generate customizable, high-fidelity backdrops for your graphic card using a text prompt.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-neutral-400 uppercase">
                  Describe what background you want:
                </label>
                <textarea
                  placeholder="e.g., 'Abstract holographic glass spheres, floating in space with colorful neon pink reflections' or 'Cream watercolor texture with subtle gold foil cracks'"
                  value={backdropPrompt}
                  onChange={(e) => setBackdropPrompt(e.target.value)}
                  className="w-full h-20 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-amber-500/30 resize-none transition"
                />
              </div>

              <button
                disabled={isImageGenerating || !backdropPrompt.trim()}
                onClick={() => onGenerateBackdrop(backdropPrompt)}
                className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-600 text-neutral-950 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
              >
                {isImageGenerating ? (
                  <>
                    <span className="w-3 h-3 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                    <span>Generating Backdrop...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={12} className="fill-neutral-950" />
                    <span>Generate & Set Backdrop</span>
                  </>
                )}
              </button>
            </div>

            {imageGenError && (
              <div className="p-3 bg-red-950/20 border border-red-900/50 text-red-400 rounded-xl text-xs flex items-start gap-2 leading-relaxed animate-fadeIn">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <p>{imageGenError}</p>
              </div>
            )}

            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-500 text-[11px] font-mono leading-normal">
              <span className="text-neutral-400 font-semibold block mb-1">PRO-TIPS FOR BACKDROPS</span>
              <ul className="list-disc list-inside space-y-1">
                <li>Specify textures like "watercolor", "grid pattern", "oil paint".</li>
                <li>Avoid prompts with human figures, faces or text.</li>
                <li>Use adjectives like "minimalist", "aesthetic", "vibrant".</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
