import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

// Lazy initialization of Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "alynshir-platform",
        },
      },
    });
  }
  return genAIClient;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "ALYN SHIR Marine Expeditions API" });
  });

  // AI Concierge Endpoint
  app.post("/api/ai/concierge", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required." });
      }

      const ai = getGenAI();
      if (!ai) {
        // Fallback intelligent concierge reply if API key isn't provided
        const lower = message.toLowerCase();
        let fallbackResponse = "";

        if (lower.includes("coron") || lower.includes("wreck") || lower.includes("kayangan")) {
          fallbackResponse = "For Coron, Palawan: We highly recommend our 4D3N Ultimate Coron Expedition featuring Kayangan Lake, Barracuda Lake, and WWII Shipwreck snorkeling. Best time to visit is November through May for calm turquoise waters. Remember to pack reef-safe sunscreen, dry bags, and aqua shoes!";
        } else if (lower.includes("el nido") || lower.includes("bacuit")) {
          fallbackResponse = "El Nido's Bacuit Bay is best explored with our Exclusive Big Lagoon & Secret Lagoon luxury banca catamaran. Tides are ideal in early morning (7:30 AM departure) to avoid peak tourist swells. We supply dry bags, snorkeling masks, and DOT-certified life vests.";
        } else if (lower.includes("siargao") || lower.includes("surf") || lower.includes("sohoton")) {
          fallbackResponse = "Siargao Island: Surfing peak is September to November at Cloud 9, while island hopping to Naked, Daku, and Guyam islands plus Sohoton Cove is magical year-round. Don't miss Sugba Lagoon stand-up paddleboarding!";
        } else if (lower.includes("cebu") || lower.includes("bohol") || lower.includes("oslob") || lower.includes("tarsier")) {
          fallbackResponse = "Central Visayas Expedition: Our 5D4N Cebu & Bohol Heritage combo includes Moalboal sardine run, Badian canyoneering, Bohol Chocolate Hills, Loboc River cruise, and the Tarsier sanctuary. DOT accreditation DOT-ACCR-RO7-2026-8819 guarantees certified local guides and Coast Guard compliant speedboats.";
        } else if (lower.includes("batanes") || lower.includes("weather") || lower.includes("season")) {
          fallbackResponse = "Batanes Archipelago: Known as the Home of the Winds. The best weather window is December through April when northern trade winds create cool, crisp rolling hills and clear blue seas. Due to maritime regulations, we strictly monitor PCG seaworthiness clearances.";
        } else if (lower.includes("pack") || lower.includes("wear") || lower.includes("bring")) {
          fallbackResponse = "Essential Philippine Expedition Packing Checklist:\n1. 20L-30L Waterproof Dry Bag\n2. Mineral, reef-safe sunscreen (SPF 50+)\n3. Breathable UV rashguards & aqua shoes\n4. Waterproof phone pouch & powerbank\n5. Valid government ID for Philippine Coast Guard manifest verification.";
        } else {
          fallbackResponse = `Mabuhay! Welcome to ALYN SHIR Island Concierge. I am your expert Philippine expedition planner (DOT-ACCR-RO7-2026-8819). Whether you are dreaming of Coron's underwater shipwrecks, El Nido's limestone lagoons, Siargao's azure breaks, or Bohol's heritage hills, I can tailor the perfect itinerary and check sea weather conditions for you. Where would you like to explore?`;
        }

        return res.json({ reply: fallbackResponse });
      }

      // Format conversation contents for Gemini
      const systemInstruction = `You are the Lead Island Concierge for 'ALYN SHIR Marine Expeditions & Luxury Charters Inc' (DOT Accreditation No. DOT-ACCR-RO7-2026-8819), an ultra-luxury and adventure expedition operator across the Philippine Archipelago (Palawan, El Nido, Coron, Cebu, Bohol, Siargao, Batanes, Boracay). 
Provide warm, editorial, concise, and deeply knowledgeable recommendations. Emphasize maritime safety, Philippine Coast Guard (PCG) compliance, seasonal weather, optimal tide windows, local cultural etiquette, and packing necessities. Keep responses engaging and structured with bullet points where appropriate.`;

      // Build contents array
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
      if (Array.isArray(history)) {
        for (const item of history.slice(-6)) {
          if (item.sender === "user") {
            contents.push({ role: "user", parts: [{ text: item.text }] });
          } else if (item.sender === "concierge") {
            contents.push({ role: "model", parts: [{ text: item.text }] });
          }
        }
      }
      contents.push({ role: "user", parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: contents,
        config: {
          systemInstruction,
        },
      });

      const reply = response.text || "Thank you for inquiring with ALYN SHIR. Our team is ready to curate your Philippine journey.";
      return res.json({ reply });
    } catch (err: any) {
      console.error("Concierge API error:", err);
      return res.status(500).json({
        error: "Failed to generate expedition advice",
        fallback: "Mabuhay! Our Expeditions Concierge is currently checking tidal charts. You can browse our curated packages below or contact our operations tower.",
      });
    }
  });

  // Vite middleware for development vs Static in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
