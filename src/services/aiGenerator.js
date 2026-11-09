// Base de conocimiento para calibración inmediata + conector IA Gemini seguro
const OEM_DATABASE = {
  yamaha: {
    "mt-09": { maxRpm: 11500, redlineRpm: 10500, cc: 890, fuelL: 14, category: "naked" },
    "mt-07": { maxRpm: 10500, redlineRpm: 9000, cc: 689, fuelL: 14, category: "naked" },
    "r1": { maxRpm: 14500, redlineRpm: 13800, cc: 998, fuelL: 17, category: "sport" },
    "r6": { maxRpm: 16500, redlineRpm: 15500, cc: 599, fuelL: 17, category: "sport" },
    "nmax": { maxRpm: 8500, redlineRpm: 8000, cc: 155, fuelL: 7.1, category: "scooter" },
  },
  ktm: {
    "duke 390": { maxRpm: 10500, redlineRpm: 9500, cc: 399, fuelL: 15, category: "naked" },
    "duke 890": { maxRpm: 10500, redlineRpm: 9800, cc: 889, fuelL: 14, category: "naked" },
    "rc 390": { maxRpm: 10500, redlineRpm: 9500, cc: 373, fuelL: 13.7, category: "sport" },
    "super duke 1290": { maxRpm: 10500, redlineRpm: 9500, cc: 1301, fuelL: 16, category: "naked" }
  },
  kawasaki: {
    "z900": { maxRpm: 11500, redlineRpm: 10500, cc: 948, fuelL: 17, category: "naked" },
    "ninja 400": { maxRpm: 13000, redlineRpm: 12000, cc: 399, fuelL: 14, category: "sport" },
    "zx-6r": { maxRpm: 16000, redlineRpm: 15000, cc: 636, fuelL: 17, category: "sport" },
    "zx-10r": { maxRpm: 14500, redlineRpm: 13800, cc: 998, fuelL: 17, category: "sport" }
  },
  ducati: {
    "panigale v4": { maxRpm: 15000, redlineRpm: 14500, cc: 1103, fuelL: 16, category: "sport" },
    "monster 937": { maxRpm: 10000, redlineRpm: 9250, cc: 937, fuelL: 14, category: "naked" },
    "streetfighter v2": { maxRpm: 11500, redlineRpm: 10750, cc: 955, fuelL: 16, category: "naked" }
  },
  honda: {
    "cbr1000rr-r": { maxRpm: 15000, redlineRpm: 14500, cc: 1000, fuelL: 16.1, category: "sport" },
    "cbr650r": { maxRpm: 13000, redlineRpm: 12000, cc: 649, fuelL: 15.4, category: "sport" },
    "cb500f": { maxRpm: 9500, redlineRpm: 8500, cc: 471, fuelL: 17.1, category: "naked" }
  },
  bajaj: {
    "pulsar ns200": { maxRpm: 11000, redlineRpm: 9500, cc: 199.5, fuelL: 12, category: "naked" },
    "dominar 400": { maxRpm: 9500, redlineRpm: 8500, cc: 373.3, fuelL: 13, category: "touring" }
  },
  bmw: {
    "s1000rr": { maxRpm: 15000, redlineRpm: 14500, cc: 999, fuelL: 16.5, category: "sport" },
    "r1250gs": { maxRpm: 9000, redlineRpm: 8000, cc: 1254, fuelL: 20, category: "adventure" }
  }
};

export function sanitizeHexColor(hex, fallback = "#FF6600") {
  if (typeof hex === "string" && /^#[0-9A-Fa-f]{6}$/.test(hex.trim())) {
    return hex.trim();
  }
  return fallback;
}

// Generador de color de contraste y acento derivado
export function computeAccentGlow(hex) {
  const safeHex = sanitizeHexColor(hex);
  const cleanHex = safeHex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 102;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, 0.35)`;
}

export async function generateDashboardSpecs({ brand, model, year, colorHex, apiKey = null }) {
  const safeBrand = String(brand || "Yamaha").slice(0, 40).trim();
  const safeModel = String(model || "MT-09").slice(0, 60).trim();
  const safeYear = Math.min(2030, Math.max(1950, Number(year) || 2025));
  const safeColor = sanitizeHexColor(colorHex);

  const normBrand = safeBrand.toLowerCase();
  const normModel = safeModel.toLowerCase();

  // Si hay una API Key de Gemini configurada manualmente por el usuario, usar cabecera x-goog-api-key (nunca en query string)
  if (apiKey && typeof apiKey === "string" && apiKey.trim().length > 10) {
    try {
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey.trim()
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Eres un ingeniero experto en telemetría de motos. Devuelve estrictamente un JSON válido para: Marca: ${safeBrand}, Modelo: ${safeModel}, Año: ${safeYear}.
              Formato:
              {
                "maxRpm": number,
                "redlineRpm": number,
                "engineDisplacementCc": number,
                "fuelCapacityLiters": number,
                "category": "sport"|"naked"|"adventure"|"scooter"|"touring",
                "recommendedOilIntervalKm": number,
                "recommendedChainIntervalKm": number
              }`
            }]
          }]
        })
      });
      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const cleaned = rawText.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return formatConfig(safeBrand, safeModel, safeYear, safeColor, parsed);
      }
    } catch (e) {
      console.warn("Usando motor de calibración local de MotoDash AI.");
    }
  }

  // Motor de Calibración Predictiva Local
  const brandData = OEM_DATABASE[normBrand];
  const matchedModel = brandData ? Object.keys(brandData).find(k => normModel.includes(k) || k.includes(normModel)) : null;
  const specs = (brandData && matchedModel) ? brandData[matchedModel] : {
    maxRpm: 10500,
    redlineRpm: 9200,
    cc: 400,
    fuelL: 14,
    category: "naked"
  };

  return formatConfig(safeBrand, safeModel, safeYear, safeColor, {
    maxRpm: specs.maxRpm,
    redlineRpm: specs.redlineRpm,
    engineDisplacementCc: specs.cc,
    fuelCapacityLiters: specs.fuelL,
    category: specs.category,
    recommendedOilIntervalKm: specs.cc > 600 ? 5000 : 3000,
    recommendedChainIntervalKm: 800
  });
}

function formatConfig(brand, model, year, colorHex, data) {
  return {
    bikeIdentity: {
      brand: brand.toUpperCase(),
      model: model.toUpperCase(),
      year: Number(year),
      colorHex: colorHex,
      accentGlow: computeAccentGlow(colorHex),
      category: data.category || "sport"
    },
    telemetrySpecs: {
      maxRpm: Math.min(20000, Math.max(4000, Number(data.maxRpm) || 11000)),
      redlineRpm: Math.min(19000, Math.max(3500, Number(data.redlineRpm) || 9500)),
      speedUnit: "km/h",
      engineCc: Math.min(3000, Math.max(50, Number(data.engineDisplacementCc) || 400)),
      tankCapacityLiters: Math.min(45, Math.max(3, Number(data.fuelCapacityLiters) || 14))
    },
    maintenanceSchedule: [
      { id: "oil", service: "Cambio Aceite y Filtro", intervalKm: Number(data.recommendedOilIntervalKm) || 4000, critical: true },
      { id: "chain", service: "Limpieza y Tensión de Cadena", intervalKm: Number(data.recommendedChainIntervalKm) || 800, critical: false },
      { id: "brakes", service: "Líquido de Frenos y Pastillas", intervalKm: 8000, critical: true },
      { id: "spark", service: "Bujías y Filtro de Aire", intervalKm: 12000, critical: false }
    ]
  };
}
