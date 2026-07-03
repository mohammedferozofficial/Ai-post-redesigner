import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Express
const app = express();
const PORT = 3000;

// Increase request size limits for handling base64 images
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Lazy-initialize Gemini SDK to prevent startup crashes if key is missing
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please add it to your secrets in Settings.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// -----------------------------------------------------------------------------
// API Endpoints
// -----------------------------------------------------------------------------

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "AI Post Redesigner Server is running." });
});

// AI Redesign endpoint: Analyzes image & text and returns layout, style, and copy recommendations
app.post("/api/redesign", async (req, res) => {
  try {
    const { headline, mainText, watermark, imageBase64, imageMimeType, stylePreference } = req.body;
    
    const ai = getGeminiClient();
    
    // Build contents for Gemini
    const parts: any[] = [];
    
    // Add prompt instructions
    let promptText = `
You are a professional Graphic Designer and Copywriter specializing in viral social media cards, editorial blog graphics, and high-impact digital posts.
Analyze the following post details and optional image to redesign the post for maximum visual appeal and messaging power.

Original content to redesign:
- Headline: "${headline || ""}"
- Main Body Text: "${mainText || ""}"
- Watermark/Branding: "${watermark || ""}"
${stylePreference ? `- Style Preference: "${stylePreference}"` : ""}

Task Instructions:
1. IMPROVE COPY: Write a polished, highly engaging headline and core body text that makes the message pop while maintaining the original meaning.
2. SELECT THEME/LAYOUT: Based on the content tone and image style (if provided), choose the most appropriate layout template from these choices:
   - "bold-modern": High contrast, bold fonts, left alignment, colorful accent details. Good for business, tech, announcements, strong quotes.
   - "elegant-editorial": Soft backgrounds, gorgeous serif typography (like Playfair), center aligned, generous white space. Good for poetry, deep thoughts, lifestyle, fashion, high-end content.
   - "neo-brutalist": High-saturation backgrounds (yellow, toxic green, hot orange), thick 4px black borders, offset shadows, monospace fonts. Good for memes, edgy tech, newsletters, raw advice.
   - "cosmic-slate": Smooth glassmorphic dark-slate cards, gradient blurs, subtle glowing borders. Good for futuristic content, developers, tech, astronomy, deep focus.
   - "clean-minimal": Massive white space, very small clean sans-serif typography, understated elegance. Good for minimalist architecture, productivity, design quotes.
   - "film-retro": Polaroid-style framing, warm color cast, handwritten or typewriter headline fonts, offset overlays. Good for travel, memory logs, classic storytelling.
3. SELECT PALETTE: Select a perfect, highly aesthetic cohesive color palette (hex codes) including:
   - background: The dominant backdrop color or gradient start.
   - text: The primary text color (must have exceptional contrast against background/overlay).
   - accent: A beautiful contrasting highlight/accent color for borders, bullet points, or shapes.
   - overlayOpacity: A decimal between 0.1 and 0.9 for the color filter overlay on top of the image (lower means the image is clearer, higher means text is more readable).
4. SUGGEST TYPOGRAPHY: Choose font family type (sans-serif, serif, monospace, handwriting) and alignment (left, center, right).
5. DESIGN EXPLANATION: Write a short, friendly, professional 1-2 sentence description explaining your visual design choices and how they enhance the visual hierarchy.

IMPORTANT: Ensure all recommended hex colors have extremely high accessibility contrast! For dark backgrounds, text must be light (e.g. white or cream). For light backgrounds, text must be dark (e.g. near black, deep navy).
`;

    parts.push({ text: promptText });

    // Add image inline part if base64 data is present
    if (imageBase64) {
      // Remove data url prefix if it exists
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const mime = imageMimeType || "image/jpeg";
      
      parts.push({
        inlineData: {
          mimeType: mime,
          data: cleanBase64
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            improvedHeadline: {
              type: Type.STRING,
              description: "A punchy, optimized, attention-grabbing version of the headline."
            },
            improvedMainText: {
              type: Type.STRING,
              description: "A refined, readable, engaging version of the main body text."
            },
            improvedWatermark: {
              type: Type.STRING,
              description: "An elegant watermark suggestion based on their watermark, such as adding a clean handle symbol or professional logo text."
            },
            recommendedLayout: {
              type: Type.STRING,
              description: "Must be exactly one of: bold-modern, elegant-editorial, neo-brutalist, cosmic-slate, clean-minimal, film-retro."
            },
            colors: {
              type: Type.OBJECT,
              properties: {
                background: {
                  type: Type.STRING,
                  description: "Hex color code for primary background or backing card."
                },
                text: {
                  type: Type.STRING,
                  description: "Hex color code for main typography. Ensure very high contrast!"
                },
                accent: {
                  type: Type.STRING,
                  description: "Hex color code for highlights, badges, or accent borders."
                },
                overlayOpacity: {
                  type: Type.NUMBER,
                  description: "Decimal representing image overlay tint opacity (0.1 to 0.9)."
                }
              },
              required: ["background", "text", "accent", "overlayOpacity"]
            },
            typography: {
              type: Type.OBJECT,
              properties: {
                fontFamily: {
                  type: Type.STRING,
                  description: "Font type recommendation. One of: sans-serif, serif, monospace, handwriting."
                },
                alignment: {
                  type: Type.STRING,
                  description: "One of: left, center, right."
                }
              },
              required: ["fontFamily", "alignment"]
            },
            explanation: {
              type: Type.STRING,
              description: "1-2 sentence explanation of why this design and copy overhaul makes the post look premium."
            },
            suggestedHashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3-4 highly relevant social media hashtags."
            }
          },
          required: [
            "improvedHeadline",
            "improvedMainText",
            "improvedWatermark",
            "recommendedLayout",
            "colors",
            "typography",
            "explanation",
            "suggestedHashtags"
          ]
        }
      }
    });

    const responseText = response.text || "{}";
    const recommendation = JSON.parse(responseText.trim());
    
    res.json({
      success: true,
      recommendation
    });
  } catch (error: any) {
    console.error("Redesign API Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "An error occurred while calling the Gemini API. Please check your API keys."
    });
  }
});

// AI Background Generator endpoint: Uses image generation to create stunning background patterns
app.post("/api/generate-background", async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ success: false, error: "Prompt is required to generate a background." });
    }

    const ai = getGeminiClient();

    // Use gemini-3.1-flash-lite-image as the default image generator
    // Note that the user needs their own API key or configured key for paid model flows,
    // we catch errors nicely if they don't have it enabled.
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-image",
      contents: {
        parts: [
          {
            text: `A beautiful abstract digital background pattern, seamless texture, or aesthetic backdrop. Perfect to use behind text as a graphic post design. Concept: ${prompt}. No text in the image. High-quality wallpaper style, minimal noise, studio lighting, artistic composition.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    let base64Image = "";
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Image = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!base64Image) {
      throw new Error("No image data returned from model. Make sure you have authorized access.");
    }

    res.json({
      success: true,
      imageUrl: base64Image
    });
  } catch (error: any) {
    console.error("Generate Background Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate image. This background generation utilizes a premium model. Please ensure your Gemini API Key is configured with sufficient permissions."
    });
  }
});

// -----------------------------------------------------------------------------
// Dev & Production serving logic
// -----------------------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode using Vite dev server as middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted.");
  } else {
    // Production mode serving compiled files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static server mounted for: " + distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Post Redesigner Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
