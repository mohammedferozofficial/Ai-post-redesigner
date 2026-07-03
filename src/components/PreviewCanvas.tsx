import React, { useRef, useEffect, useState } from "react";
import { DesignConfig, ImageFilter } from "../types";
import { FONTS } from "../presets";
import { Download, Sparkles, Image as ImageIcon } from "lucide-react";

interface PreviewCanvasProps {
  config: DesignConfig;
  onExport: (dataUrl: string) => void;
  bgPattern: string; // From presets
  showAiBadges?: boolean;
}

export default function PreviewCanvas({ config, onExport, bgPattern, showAiBadges = false }: PreviewCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Helper to map filters to CSS classes
  const getFilterClass = (filter: ImageFilter) => {
    switch (filter) {
      case "grayscale": return "filter-grayscale";
      case "sepia": return "filter-sepia";
      case "contrast": return "filter-contrast";
      case "vintage": return "filter-vintage";
      case "blur": return "filter-blur";
      case "warm": return "filter-warm";
      case "cool": return "filter-cool";
      default: return "";
    }
  };

  // Helper to determine aspect ratio Tailwind classes
  const getAspectRatioClass = () => {
    switch (config.aspectRatio) {
      case "16:9": return "aspect-[16/9]";
      case "9:16": return "aspect-[9/16]";
      default: return "aspect-square";
    }
  };

  // Render decorative background patterns based on selection
  const renderBackgroundPattern = () => {
    switch (bgPattern) {
      case "grid":
        return (
          <div className="absolute inset-0 pointer-events-none opacity-15" 
               style={{ 
                 backgroundImage: `linear-gradient(${config.accentColor} 1px, transparent 1px), linear-gradient(90deg, ${config.accentColor} 1px, transparent 1px)`,
                 backgroundSize: '24px 24px'
               }} 
          />
        );
      case "dots":
        return (
          <div className="absolute inset-0 pointer-events-none opacity-20" 
               style={{ 
                 backgroundImage: `radial-gradient(${config.accentColor} 1.5px, transparent 1.5px)`,
                 backgroundSize: '16px 16px'
               }} 
          />
        );
      case "radial-aurora":
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 rounded-full blur-[80px]" style={{ background: `${config.accentColor}33` }} />
            <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 rounded-full blur-[80px]" style={{ background: `${config.bgColor}44` }} />
          </div>
        );
      case "warm-sunset":
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden"
               style={{
                 background: `linear-gradient(135deg, ${config.bgColor} 0%, ${config.accentColor}22 60%, ${config.bgColor} 100%)`
               }}
          />
        );
      case "tech-nodes":
        return (
          <div className="absolute inset-0 pointer-events-none opacity-10 flex flex-wrap justify-around p-4">
            <div className="w-12 h-12 border rounded-full" style={{ borderColor: config.accentColor }} />
            <div className="w-24 h-24 border rounded-full mt-10" style={{ borderColor: config.accentColor }} />
            <div className="w-16 h-16 border rounded-full mt-4" style={{ borderColor: config.accentColor }} />
          </div>
        );
      default:
        return null;
    }
  };

  // Canvas Drawing Logic for Exporting high-res files
  const drawAndExport = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsExporting(true);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsExporting(false);
      return;
    }

    // Set high-res dimensions depending on aspect ratio
    let width = 1200;
    let height = 1200;
    if (config.aspectRatio === "16:9") {
      width = 1600;
      height = 900;
    } else if (config.aspectRatio === "9:16") {
      width = 1080;
      height = 1920;
    }

    canvas.width = width;
    canvas.height = height;

    // Clear Canvas
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Background Solid color
    ctx.fillStyle = config.bgColor;
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Procedural patterns if configured
    if (bgPattern === "grid") {
      ctx.strokeStyle = `${config.accentColor}30`;
      ctx.lineWidth = 2;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    } else if (bgPattern === "dots") {
      ctx.fillStyle = `${config.accentColor}40`;
      const dotSpacing = 30;
      for (let x = dotSpacing/2; x < width; x += dotSpacing) {
        for (let y = dotSpacing/2; y < height; y += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (bgPattern === "radial-aurora") {
      // Draw smooth background gradient
      const grad = ctx.createRadialGradient(width * 0.2, height * 0.2, 50, width * 0.3, height * 0.3, width * 0.8);
      grad.addColorStop(0, `${config.accentColor}35`);
      grad.addColorStop(0.5, `${config.bgColor}`);
      grad.addColorStop(1, `${config.bgColor}`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      const grad2 = ctx.createRadialGradient(width * 0.8, height * 0.8, 50, width * 0.7, height * 0.7, width * 0.6);
      grad2.addColorStop(0, `${config.accentColor}25`);
      grad2.addColorStop(1, "transparent");
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);
    } else if (bgPattern === "warm-sunset") {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, config.bgColor);
      grad.addColorStop(0.5, `${config.accentColor}20`);
      grad.addColorStop(1, config.bgColor);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    // 3. Draw Image (if uploaded) with scaling, fitting, offsets, filters
    if (config.image) {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.save();
          
          // Fit & Scale calculations
          let drawWidth = width;
          let drawHeight = height;
          let drawX = 0;
          let drawY = 0;

          const imgRatio = img.width / img.height;
          const canvasRatio = width / height;

          if (config.imageFit === "cover") {
            if (imgRatio > canvasRatio) {
              drawWidth = height * imgRatio;
              drawHeight = height;
              drawX = (width - drawWidth) / 2;
            } else {
              drawWidth = width;
              drawHeight = width / imgRatio;
              drawY = (height - drawHeight) / 2;
            }
          } else { // contain
            if (imgRatio > canvasRatio) {
              drawWidth = width;
              drawHeight = width / imgRatio;
              drawY = (height - drawHeight) / 2;
            } else {
              drawWidth = height * imgRatio;
              drawHeight = height;
              drawX = (width - drawWidth) / 2;
            }
          }

          // Apply scale zoom and manual offsets
          const zoomWidth = drawWidth * config.imageScale;
          const zoomHeight = drawHeight * config.imageScale;
          const zoomX = drawX + (width * (config.imageX / 100)) - (zoomWidth - drawWidth) / 2;
          const zoomY = drawY + (height * (config.imageY / 100)) - (zoomHeight - drawHeight) / 2;

          // Apply image filters manually on canvas
          let filterString = "";
          if (config.imageFilter === "grayscale") filterString += "grayscale(100%) ";
          if (config.imageFilter === "sepia") filterString += "sepia(100%) ";
          if (config.imageFilter === "contrast") filterString += "contrast(150%) ";
          if (config.imageFilter === "vintage") filterString += "sepia(50%) contrast(120%) saturate(80%) ";
          if (config.imageFilter === "blur") filterString += "blur(10px) ";
          if (config.imageFilter === "warm") filterString += "sepia(20%) saturate(130%) ";
          if (config.imageFilter === "cool") filterString += "saturate(110%) hue-rotate(15deg) ";
          
          if (filterString) {
            ctx.filter = filterString.trim();
          }

          ctx.drawImage(img, zoomX, zoomY, zoomWidth, zoomHeight);
          ctx.restore();
          resolve();
        };
        img.onerror = () => {
          console.error("Canvas export failed to load the image.");
          resolve(); // Resolve anyway so build continues
        };
        img.src = config.image;
      });
    }

    // 4. Draw Overlay Color Mask
    if (config.overlayOpacity > 0) {
      ctx.fillStyle = config.bgColor;
      ctx.globalAlpha = config.overlayOpacity;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1.0; // reset
    }

    // 5. Draw Layout specific visuals (Frames, Shapes, Borders)
    const padding = width * 0.08 * config.cardPadding;
    const cardWidth = width - padding * 2;
    const font = FONTS[config.fontFamily];
    
    // Draw layout accents
    if (config.layout === "neo-brutalist") {
      // Stark box layout
      const brutalPadding = width * 0.06;
      const cardX = brutalPadding;
      const cardY = brutalPadding;
      const cardW = width - brutalPadding * 2;
      const cardH = height - brutalPadding * 2;

      // Draw shadow
      ctx.fillStyle = "#000000";
      ctx.fillRect(cardX + 16, cardY + 16, cardW, cardH);

      // Draw primary background card
      ctx.fillStyle = config.bgColor;
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 8;
      ctx.fillRect(cardX, cardY, cardW, cardH);
      ctx.strokeRect(cardX, cardY, cardW, cardH);

      // Accent border
      ctx.strokeStyle = config.accentColor;
      ctx.lineWidth = 4;
      ctx.strokeRect(cardX + 12, cardY + 12, cardW - 24, cardH - 24);
    } 
    else if (config.layout === "cosmic-slate") {
      // Glassmorphic central card
      ctx.save();
      const glassPadding = width * 0.06;
      const gX = glassPadding;
      const gY = glassPadding;
      const gW = width - glassPadding * 2;
      const gH = height - glassPadding * 2;
      const gRadius = 40;

      // Soft white border glow
      ctx.shadowColor = `${config.accentColor}40`;
      ctx.shadowBlur = 30;

      // Card fill gradient
      const glassGrad = ctx.createLinearGradient(gX, gY, gX + gW, gY + gH);
      glassGrad.addColorStop(0, "rgba(15, 23, 42, 0.75)");
      glassGrad.addColorStop(1, "rgba(9, 5, 20, 0.9)");
      ctx.fillStyle = glassGrad;

      // Draw rounded rectangle
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(gX, gY, gW, gH, gRadius) : ctx.rect(gX, gY, gW, gH);
      ctx.fill();

      // Border stroke
      ctx.shadowBlur = 0; // reset shadow
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(gX, gY, gW, gH, gRadius) : ctx.rect(gX, gY, gW, gH);
      ctx.stroke();

      // Draw mini neon accent line
      ctx.fillStyle = config.accentColor;
      ctx.fillRect(gX + 40, gY + 40, 60, 6);

      ctx.restore();
    }
    else if (config.layout === "film-retro") {
      // Draw classic Polaroid border
      const pBorder = width * 0.05;
      const pBottom = width * 0.18;
      
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0,0,0,0.15)";
      ctx.shadowBlur = 20;
      
      ctx.fillRect(pBorder, pBorder, width - pBorder * 2, height - pBorder * 2);
      ctx.shadowBlur = 0; // reset
      
      // Draw inner photo area placeholder/backing if image is cover/contain
      ctx.fillStyle = "#f3f4f6";
      ctx.fillRect(pBorder * 1.5, pBorder * 1.5, width - pBorder * 3, height - pBorder * 2 - pBottom);
    }
    else if (config.layout === "bold-modern") {
      // Bottom accent bar
      ctx.fillStyle = config.accentColor;
      ctx.fillRect(padding, height - padding - 20, 100, 10);
    }

    // 6. Draw Headline
    ctx.fillStyle = config.textColor;
    ctx.textAlign = config.alignment;

    // Font setting helper
    const getFontFamilyString = (type: string, size: number, weight: string = "bold") => {
      if (type === "serif") return `${weight} ${size}px 'Playfair Display', serif`;
      if (type === "monospace") return `${weight} ${size}px 'JetBrains Mono', monospace`;
      if (type === "handwriting") return `${weight} ${size}px 'Dancing Script', cursive`;
      return `${weight} ${size}px 'Space Grotesk', 'Inter', sans-serif`;
    };

    // Calculate layout boundaries
    let textX = padding;
    if (config.alignment === "center") textX = width / 2;
    if (config.alignment === "right") textX = width - padding;

    let contentY = padding * 1.5;

    // Adjust content positioning for custom layouts
    if (config.layout === "neo-brutalist") {
      const offset = width * 0.08;
      textX = config.alignment === "center" ? width / 2 : (config.alignment === "right" ? width - offset : offset);
      contentY = offset * 1.5;
    } else if (config.layout === "cosmic-slate") {
      const offset = width * 0.11;
      textX = config.alignment === "center" ? width / 2 : (config.alignment === "right" ? width - offset : offset);
      contentY = offset * 1.6;
    } else if (config.layout === "film-retro") {
      const offset = width * 0.08;
      textX = config.alignment === "center" ? width / 2 : (config.alignment === "right" ? width - offset : offset);
      contentY = height - width * 0.18; // Write in polaroid footer
    }

    // Draw Headline Text
    if (config.headline && config.layout !== "film-retro") {
      ctx.font = getFontFamilyString(config.fontFamily, width * 0.052, "bold");
      const maxTextWidth = config.layout === "neo-brutalist" || config.layout === "cosmic-slate" 
        ? width - (width * 0.22) 
        : width - padding * 2;

      const words = config.headline.split(" ");
      let line = "";
      const lines: string[] = [];
      const hLineHeight = width * 0.065;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const testWidth = ctx.measureText(testLine).width;
        if (testWidth > maxTextWidth && n > 0) {
          lines.push(line);
          line = words[n] + " ";
        } else {
          line = testLine;
        }
      }
      lines.push(line);

      lines.forEach((l, idx) => {
        ctx.fillText(l.trim(), textX, contentY + idx * hLineHeight);
      });

      contentY += lines.length * hLineHeight + 25;
    }

    // 7. Draw Main Body Text (if present and not film-retro)
    if (config.mainText && config.layout !== "film-retro") {
      ctx.font = getFontFamilyString(config.fontFamily, width * 0.026, "normal");
      ctx.fillStyle = `${config.textColor}dd`; // Slightly transparent body text

      const maxTextWidth = config.layout === "neo-brutalist" || config.layout === "cosmic-slate"
        ? width - (width * 0.22)
        : width - padding * 2;

      const bodyWords = config.mainText.split(" ");
      let bodyLine = "";
      const bodyLines: string[] = [];
      const bLineHeight = width * 0.038;

      for (let n = 0; n < bodyWords.length; n++) {
        const testLine = bodyLine + bodyWords[n] + " ";
        const testWidth = ctx.measureText(testLine).width;
        if (testWidth > maxTextWidth && n > 0) {
          bodyLines.push(bodyLine);
          bodyLine = bodyWords[n] + " ";
        } else {
          bodyLine = testLine;
        }
      }
      bodyLines.push(bodyLine);

      bodyLines.forEach((l, idx) => {
        ctx.fillText(l.trim(), textX, contentY + idx * bLineHeight);
      });
    }

    // Draw for Film-Retro specific Polaroid Captions
    if (config.layout === "film-retro") {
      // Headline
      ctx.fillStyle = "#1c1917"; // Ink dark color
      ctx.font = getFontFamilyString("handwriting", width * 0.045, "normal");
      ctx.textAlign = "center";
      ctx.fillText(config.headline, width / 2, height - width * 0.13);

      // Sub-watermark or date inside polaroid
      ctx.fillStyle = "#6b7280";
      ctx.font = getFontFamilyString("monospace", width * 0.018, "normal");
      ctx.fillText(config.watermark || "MEMORIES", width / 2, height - width * 0.06);
    }

    // 8. Draw Watermark (for non film-retro templates)
    if (config.watermark && config.layout !== "film-retro") {
      ctx.save();
      ctx.font = getFontFamilyString("monospace", width * 0.02, "normal");
      
      const wText = config.watermark;
      const wWidth = ctx.measureText(wText).width;
      const wHeight = width * 0.04;
      
      let wX = padding;
      let wY = height - padding - wHeight / 2;

      // Handle positions
      if (config.watermarkPosition === "bottom-right") {
        wX = width - padding - wWidth - 16;
      } else if (config.watermarkPosition === "bottom-center") {
        wX = width / 2 - wWidth / 2 - 8;
      } else if (config.watermarkPosition === "top-right") {
        wX = width - padding - wWidth - 16;
        wY = padding + 16;
      } else if (config.watermarkPosition === "top-left") {
        wX = padding + 8;
        wY = padding + 16;
      } else if (config.watermarkPosition === "bottom-left") {
        wX = padding + 8;
      }

      // Special offset layouts adjustments
      if (config.layout === "neo-brutalist") {
        const borderDist = width * 0.08;
        if (config.watermarkPosition === "bottom-right") wX = width - borderDist - wWidth - 24;
        else if (config.watermarkPosition === "bottom-left") wX = borderDist + 16;
        wY = height - borderDist - 24;
      } else if (config.layout === "cosmic-slate") {
        const borderDist = width * 0.1;
        if (config.watermarkPosition === "bottom-right") wX = width - borderDist - wWidth - 24;
        else if (config.watermarkPosition === "bottom-left") wX = borderDist + 16;
        wY = height - borderDist - 24;
      }

      // Draw Badge backing if toggled
      if (config.watermarkBadge) {
        ctx.fillStyle = `${config.accentColor}25`;
        ctx.strokeStyle = `${config.accentColor}60`;
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(wX - 8, wY - 14, wWidth + 16, wHeight, 10) : ctx.rect(wX - 8, wY - 14, wWidth + 16, wHeight);
        ctx.fill();
        ctx.stroke();
      }

      ctx.fillStyle = config.textColor;
      ctx.fillText(wText, wX, wY + 12);
      ctx.restore();
    }

    // 9. Generate final image data URL
    const dataUrl = canvas.toDataURL("image/png");
    onExport(dataUrl);
    setIsExporting(false);
  };

  // Trigger export automatically when design details change to keep data url up-to-date
  useEffect(() => {
    const timer = setTimeout(() => {
      drawAndExport();
    }, 500); // debounce canvas drawing
    return () => clearTimeout(timer);
  }, [config, bgPattern]);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      {/* Visual Live HTML Card Frame */}
      <div 
        id="redesigned-post-card"
        ref={containerRef}
        className={`relative w-full max-w-lg overflow-hidden shadow-2xl transition-all duration-500 ease-out border border-white/10 ${getAspectRatioClass()}`}
        style={{
          backgroundColor: config.bgColor,
          borderRadius: 
            config.cardRounded === "none" ? "0px" :
            config.cardRounded === "sm" ? "4px" :
            config.cardRounded === "md" ? "8px" :
            config.cardRounded === "lg" ? "12px" :
            config.cardRounded === "xl" ? "20px" : "32px",
          boxShadow:
            config.cardShadow === "none" ? "none" :
            config.cardShadow === "sm" ? "0 1px 2px 0 rgb(0 0 0 / 0.05)" :
            config.cardShadow === "md" ? "0 4px 6px -1px rgb(0 0 0 / 0.1)" :
            config.cardShadow === "lg" ? "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" :
            config.cardShadow === "xl" ? "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" :
            `6px 6px 0px 0px #000000` // Brutalist shadow
        }}
      >
        {/* Render Image background if uploaded */}
        {config.image && (
          <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <img
              src={config.image}
              alt="Background"
              className={`w-full h-full object-${config.imageFit} origin-center transition-all ${getFilterClass(config.imageFilter)}`}
              style={{
                transform: `scale(${config.imageScale}) translate(${config.imageX}%, ${config.imageY}%)`,
              }}
            />
          </div>
        )}

        {/* Dynamic Pattern Overlay */}
        {renderBackgroundPattern()}

        {/* Color Mask Overlay Tint */}
        <div 
          className="absolute inset-0 z-5 pointer-events-none"
          style={{
            backgroundColor: config.bgColor,
            opacity: config.overlayOpacity
          }}
        />

        {/* Interactive Content Layout Overlay */}
        <div 
          className="absolute inset-0 flex flex-col justify-between z-10 p-8 h-full"
          style={{
            padding: `${config.cardPadding * 1.7}rem`,
            textAlign: config.alignment,
            color: config.textColor,
            fontFamily: FONTS[config.fontFamily].cssValue
          }}
        >
          {/* Top Section */}
          <div className="w-full flex justify-between items-start">
            {/* Top watermarks or accents */}
            {(config.watermark && (config.watermarkPosition === "top-left" || config.watermarkPosition === "top-right") && config.layout !== "film-retro") ? (
              <span 
                className={`text-[10px] sm:text-xs tracking-wider px-2 py-1 rounded font-mono ${config.watermarkPosition === "top-right" ? "ml-auto" : "mr-auto"}`}
                style={{
                  backgroundColor: config.watermarkBadge ? `${config.accentColor}25` : 'transparent',
                  border: config.watermarkBadge ? `1px solid ${config.accentColor}50` : 'none',
                  color: config.textColor
                }}
              >
                {config.watermark}
              </span>
            ) : <div />}
          </div>

          {/* Central content frame */}
          <div className="my-auto w-full flex flex-col justify-center">
            {config.layout === "cosmic-slate" && (
              <div 
                className="w-full h-full rounded-2xl glass-panel text-left p-6 sm:p-8 border border-white/10 relative"
                style={{
                  textAlign: config.alignment
                }}
              >
                {/* Neon accent bar */}
                <div className="w-12 h-1 rounded-full mb-6" style={{ backgroundColor: config.accentColor }} />
                
                {config.headline && (
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight mb-4" style={{ color: config.textColor }}>
                    {config.headline}
                  </h1>
                )}
                {config.mainText && (
                  <p className="text-xs sm:text-sm leading-relaxed opacity-85" style={{ color: `${config.textColor}dd` }}>
                    {config.mainText}
                  </p>
                )}
              </div>
            )}

            {config.layout === "neo-brutalist" && (
              <div 
                className="w-full p-6 text-left border-[3px] border-black bg-white text-black relative"
                style={{
                  boxShadow: `4px 4px 0px 0px #000000`,
                  textAlign: config.alignment,
                  backgroundColor: config.bgColor,
                  color: config.textColor
                }}
              >
                {/* Secondary inner neon border */}
                <div className="absolute inset-1 border border-dashed pointer-events-none opacity-40" style={{ borderColor: config.accentColor }} />
                
                {config.headline && (
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold uppercase tracking-wide mb-4">
                    {config.headline}
                  </h1>
                )}
                {config.mainText && (
                  <p className="text-xs sm:text-sm font-mono leading-relaxed">
                    {config.mainText}
                  </p>
                )}
              </div>
            )}

            {config.layout === "film-retro" && (
              <div className="absolute inset-[5%] bg-white p-3 shadow-lg flex flex-col justify-between items-center text-center">
                {/* Photo backing inside the film slot */}
                <div className="w-full aspect-square bg-neutral-100 overflow-hidden relative border border-neutral-200">
                  {config.image ? (
                    <img
                      src={config.image}
                      alt="Retro content"
                      className={`w-full h-full object-${config.imageFit} ${getFilterClass(config.imageFilter)}`}
                      style={{
                        transform: `scale(${config.imageScale}) translate(${config.imageX}%, ${config.imageY}%)`,
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 gap-1 font-mono text-xs">
                      <ImageIcon size={20} className="stroke-1" />
                      <span>Photo Slot</span>
                    </div>
                  )}
                  {config.overlayOpacity > 0 && (
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundColor: config.bgColor,
                        opacity: config.overlayOpacity * 0.5
                      }}
                    />
                  )}
                </div>

                {/* Polaroid Bottom Caption area */}
                <div className="w-full py-3 flex flex-col justify-center items-center font-handwriting select-none">
                  <h3 className="text-stone-800 text-lg sm:text-xl font-medium tracking-wide">
                    {config.headline || "Unforgettable Moments"}
                  </h3>
                  <span className="text-[10px] font-mono text-neutral-400 mt-1 uppercase tracking-wider">
                    {config.watermark || "MEMORIES"}
                  </span>
                </div>
              </div>
            )}

            {/* Standard templates (bold-modern, elegant-editorial, clean-minimal) */}
            {config.layout !== "cosmic-slate" && config.layout !== "neo-brutalist" && config.layout !== "film-retro" && (
              <div className="w-full">
                {config.headline && (
                  <h1 
                    className={`text-xl sm:text-2xl md:text-3xl font-bold tracking-tight mb-4`}
                    style={{ 
                      color: config.textColor,
                      fontFamily: FONTS[config.fontFamily].cssValue 
                    }}
                  >
                    {config.headline}
                  </h1>
                )}
                {config.mainText && (
                  <p 
                    className="text-xs sm:text-sm leading-relaxed"
                    style={{ 
                      color: `${config.textColor}dd`,
                      fontFamily: FONTS[config.fontFamily].cssValue 
                    }}
                  >
                    {config.mainText}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Bottom Section */}
          <div className="w-full flex justify-between items-end">
            {config.layout === "bold-modern" && (
              <div className="h-1.5 w-12 rounded-full" style={{ backgroundColor: config.accentColor }} />
            )}

            {/* Watermark position handler */}
            {(config.watermark && (config.watermarkPosition === "bottom-left" || config.watermarkPosition === "bottom-right" || config.watermarkPosition === "bottom-center") && config.layout !== "film-retro") ? (
              <span 
                className={`text-[10px] tracking-wider px-2.5 py-1 rounded font-mono ${
                  config.watermarkPosition === "bottom-right" ? "ml-auto" : 
                  config.watermarkPosition === "bottom-center" ? "mx-auto" : "mr-auto"
                }`}
                style={{
                  backgroundColor: config.watermarkBadge ? `${config.accentColor}25` : 'transparent',
                  border: config.watermarkBadge ? `1px solid ${config.accentColor}50` : 'none',
                  color: config.textColor
                }}
              >
                {config.watermark}
              </span>
            ) : <div />}
          </div>
        </div>

        {/* AI Touch Indicator */}
        {showAiBadges && (
          <div className="absolute top-3 left-3 bg-amber-500/90 text-neutral-950 font-sans text-[10px] font-bold px-1.5 py-0.5 rounded shadow z-40 flex items-center gap-1 select-none">
            <Sparkles size={10} className="fill-neutral-950" />
            <span>AI DESIGNED</span>
          </div>
        )}
      </div>

      {/* Hidden Export Canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Mini Hint */}
      <p className="text-[11px] text-neutral-400 mt-3 font-mono text-center max-w-xs">
        {isExporting ? "Re-drawing high-res canvas..." : "Canvas synced perfectly. Output ready for high-res PNG export."}
      </p>
    </div>
  );
}
