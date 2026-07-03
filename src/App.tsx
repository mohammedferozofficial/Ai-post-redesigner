import React, { useState, useRef } from "react";
import { DesignConfig, AIRecommendation, LayoutTemplate, ImageFilter } from "./types";
import { DEFAULT_DESIGN, PRESET_THEMES } from "./presets";
import PreviewCanvas from "./components/PreviewCanvas";
import EditorPanel from "./components/EditorPanel";
import { 
  Sparkles, 
  Download, 
  RefreshCw, 
  Layout, 
  Maximize, 
  Image as ImageIcon,
  CheckCircle,
  Clock,
  Heart,
  Share2,
  FileDown,
  Info
} from "lucide-react";

export default function App() {
  const [config, setConfig] = useState<DesignConfig>(DEFAULT_DESIGN);
  const [originalConfig, setOriginalConfig] = useState<DesignConfig | null>(null);
  const [bgPattern, setBgPattern] = useState<string>("grid");
  const [aiRecommendation, setAiRecommendation] = useState<AIRecommendation | null>(null);
  
  // Loading states
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [isImageGenerating, setIsImageGenerating] = useState<boolean>(false);
  const [imageGenError, setImageGenError] = useState<string | null>(null);
  const [aiResponseSuccessMessage, setAiResponseSuccessMessage] = useState<string | null>(null);
  
  // Toggle modes
  const [isUsingAiCopy, setIsUsingAiCopy] = useState<boolean>(false);
  const [exportedDataUrl, setExportedDataUrl] = useState<string>("");

  // References
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger base64 compilation for AI Redesign payload
  const handleTriggerAiRedesign = async (stylePreference?: string) => {
    setIsAiLoading(true);
    setAiResponseSuccessMessage(null);
    
    // Save current backup to original so user can revert
    if (!originalConfig) {
      setOriginalConfig({ ...config });
    }

    try {
      const payload = {
        headline: config.headline,
        mainText: config.mainText,
        watermark: config.watermark,
        stylePreference: stylePreference || "",
        imageBase64: config.image || null,
        imageMimeType: config.image ? (config.image.match(/data:([^;]+);/)?.[1] || "image/jpeg") : null
      };

      const res = await fetch("/api/redesign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      
      if (data.success && data.recommendation) {
        setAiRecommendation(data.recommendation);
        setIsUsingAiCopy(true); // turn on upgraded copy automatically to showcase AI power
        setAiResponseSuccessMessage("Gemini redesign proposal ready! Check out the redesigned tabs.");
      } else {
        throw new Error(data.error || "Failed to parse Gemini response.");
      }
    } catch (err: any) {
      console.error(err);
      alert("AI Redesign Error: " + (err.message || "Ensure your Gemini API Key is configured in Secrets."));
    } finally {
      setIsAiLoading(false);
    }
  };

  // Apply the theme modifications recommended by Gemini
  const handleApplyAiRecommendation = () => {
    if (!aiRecommendation) return;

    const recommendation = aiRecommendation;
    
    // Apply layout, colors, typography aligning, keeping other image positions
    setConfig(prev => ({
      ...prev,
      layout: recommendation.recommendedLayout,
      bgColor: recommendation.colors.background,
      textColor: recommendation.colors.text,
      accentColor: recommendation.colors.accent,
      overlayOpacity: recommendation.colors.overlayOpacity,
      fontFamily: recommendation.typography.fontFamily,
      alignment: recommendation.typography.alignment,
      // If user toggled to use the AI text, copy them directly to primary config
      ...(isUsingAiCopy ? {
        headline: recommendation.improvedHeadline,
        mainText: recommendation.improvedMainText,
        watermark: recommendation.improvedWatermark
      } : {})
    }));

    setAiResponseSuccessMessage("AI layout style & color recommendations applied to canvas!");
  };

  // Revert back to their manual backups
  const handleResetOriginal = () => {
    if (originalConfig) {
      setConfig({ ...originalConfig });
      setIsUsingAiCopy(false);
      setAiResponseSuccessMessage("Restored your original styling overrides.");
    }
  };

  // Toggle between improved AI Copy and user's original raw text on preview
  const handleToggleAiCopyMode = () => {
    const nextMode = !isUsingAiCopy;
    setIsUsingAiCopy(nextMode);

    if (aiRecommendation) {
      if (nextMode) {
        // Overlay copy values on active preview
        setConfig(prev => ({
          ...prev,
          headline: aiRecommendation.improvedHeadline,
          mainText: aiRecommendation.improvedMainText,
          watermark: aiRecommendation.improvedWatermark
        }));
      } else if (originalConfig) {
        // Restore previous text values
        setConfig(prev => ({
          ...prev,
          headline: originalConfig.headline,
          mainText: originalConfig.mainText,
          watermark: originalConfig.watermark
        }));
      }
    }
  };

  // Call the background generator API
  const handleGenerateBackdrop = async (promptText: string) => {
    setIsImageGenerating(true);
    setImageGenError(null);

    try {
      const res = await fetch("/api/generate-background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText })
      });

      const data = await res.json();
      
      if (data.success && data.imageUrl) {
        setConfig(prev => ({
          ...prev,
          image: data.imageUrl,
          imageScale: 1.0,
          imageX: 0,
          imageY: 0
        }));
      } else {
        throw new Error(data.error || "Could not retrieve background image from server.");
      }
    } catch (err: any) {
      console.error(err);
      setImageGenError(err.message || "Failed to generate visual background. Check your API permissions.");
    } finally {
      setIsImageGenerating(false);
    }
  };

  // Handles downloading the canvas image
  const downloadPngExport = () => {
    if (!exportedDataUrl) {
      alert("Canvas is still loading. Please wait a second and try again.");
      return;
    }

    const aspectLabel = config.aspectRatio === "16:9" ? "1600x900" : (config.aspectRatio === "9:16" ? "1080x1920" : "1200x1200");
    const link = document.createElement("a");
    link.download = `redesigned_post_${config.layout}_${aspectLabel}.png`;
    link.href = exportedDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Aspect ratio fast-changer
  const handleAspectRatioChange = (ratio: "1:1" | "16:9" | "9:16") => {
    setConfig(prev => ({ ...prev, aspectRatio: ratio }));
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-neutral-100 flex flex-col font-sans select-none antialiased">
      
      {/* 1. Header Banner */}
      <header className="border-b border-neutral-800 bg-[#0c0c11] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl relative">
            <Sparkles size={20} className="fill-amber-500 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
          </div>
          <div>
            <h1 className="text-md sm:text-lg font-bold tracking-tight text-neutral-100 flex items-center gap-1.5 font-sans">
              AI Post Redesigner
              <span className="text-[10px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded font-mono font-normal">v1.2</span>
            </h1>
            <p className="text-xs text-neutral-500">Redesign headings, backgrounds, and styling with Gemini AI intelligence</p>
          </div>
        </div>

        {/* Global Export & Info */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Aspect ratio switchers */}
          <div className="flex bg-neutral-950 border border-neutral-800 rounded-xl p-1 text-xs w-full sm:w-auto">
            {(["1:1", "16:9", "9:16"] as ("1:1" | "16:9" | "9:16")[]).map((ratio) => (
              <button
                key={ratio}
                onClick={() => handleAspectRatioChange(ratio)}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg font-semibold font-mono text-[11px] transition ${
                  config.aspectRatio === ratio
                    ? "bg-neutral-800 text-amber-500"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                {ratio === "1:1" ? "Square" : ratio === "16:9" ? "Banner" : "Story"}
              </button>
            ))}
          </div>

          <button
            onClick={downloadPngExport}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/10 transition shrink-0"
          >
            <Download size={14} />
            <span>Export PNG</span>
          </button>
        </div>
      </header>

      {/* 2. Main Content Dashboard Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Left Side: Live Visual Preview and Stats (7 cols) */}
        <section className="lg:col-span-7 bg-[#09090d] p-5 sm:p-8 flex flex-col items-center justify-center border-r border-neutral-800 relative min-h-[350px] overflow-y-auto">
          
          {/* Toast notifications */}
          {aiResponseSuccessMessage && (
            <div className="absolute top-4 left-4 right-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between shadow-xl z-50 animate-slideUp">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="fill-amber-500 text-neutral-950" />
                <span className="font-medium">{aiResponseSuccessMessage}</span>
              </div>
              <button 
                onClick={() => setAiResponseSuccessMessage(null)}
                className="text-[10px] font-mono hover:underline pl-3"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Interactive Live Preview Canvas */}
          <div className="w-full max-w-lg">
            <PreviewCanvas 
              config={config} 
              onExport={setExportedDataUrl} 
              bgPattern={bgPattern}
              showAiBadges={isUsingAiCopy}
            />
          </div>

          {/* Canvas details / Meta indicators below */}
          <div className="w-full max-w-lg mt-6 flex justify-between items-center bg-[#0c0c11] border border-neutral-900 rounded-xl p-3 text-[11px] text-neutral-400 font-mono">
            <div className="flex items-center gap-1.5">
              <Layout size={12} className="text-amber-500" />
              <span className="capitalize">Layout: {config.layout.replace("-", " ")}</span>
            </div>
            <div>
              <span>
                {config.aspectRatio === "1:1" ? "Resolution: 1200 x 1200 px" : 
                 config.aspectRatio === "16:9" ? "Resolution: 1600 x 900 px" : 
                 "Resolution: 1080 x 1920 px"}
              </span>
            </div>
          </div>
        </section>

        {/* Right Side: Tabbed Customization Panel (5 cols) */}
        <section className="lg:col-span-5 bg-[#0a0a0f] p-4 sm:p-6 overflow-y-auto h-full flex flex-col justify-between">
          <div className="flex-1 min-h-0">
            <EditorPanel
              config={config}
              onChange={setConfig}
              aiRecommendation={aiRecommendation}
              isAiLoading={isAiLoading}
              onTriggerAiRedesign={handleTriggerAiRedesign}
              onApplyAiRecommendation={handleApplyAiRecommendation}
              onResetOriginal={handleResetOriginal}
              onGenerateBackdrop={handleGenerateBackdrop}
              isImageGenerating={isImageGenerating}
              imageGenError={imageGenError}
              bgPattern={bgPattern}
              setBgPattern={setBgPattern}
              isUsingAiCopy={isUsingAiCopy}
              toggleAiCopyMode={handleToggleAiCopyMode}
            />
          </div>

          {/* Footer of controls with minor help details */}
          <div className="mt-4 pt-3 border-t border-neutral-900 text-[10px] text-neutral-500 flex justify-between items-center font-mono">
            <span>Powered by Gemini 3.5-flash</span>
            <span className="flex items-center gap-0.5 text-neutral-600">
              Made for AI Studio Build
            </span>
          </div>
        </section>

      </main>
    </div>
  );
}
