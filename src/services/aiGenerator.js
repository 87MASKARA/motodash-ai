// Base de conocimiento OEM para las 19 marcas más vendidas + conector IA Gemini seguro
const OEM_DATABASE = {
  yamaha: {
    "crypton": { maxRpm: 8500, redlineRpm: 7800, cc: 114, fuelL: 4.2, category: "scooter" },
    "ybr 125": { maxRpm: 9000, redlineRpm: 8000, cc: 125, fuelL: 13, category: "naked" },
    "fz": { maxRpm: 9500, redlineRpm: 8500, cc: 149, fuelL: 13, category: "naked" },
    "fz25": { maxRpm: 9500, redlineRpm: 8500, cc: 249, fuelL: 14, category: "naked" },
    "xtz 150": { maxRpm: 9000, redlineRpm: 8000, cc: 149, fuelL: 12, category: "adventure" },
    "xtz 250": { maxRpm: 9500, redlineRpm: 8500, cc: 249, fuelL: 13.6, category: "adventure" },
    "nmax": { maxRpm: 8500, redlineRpm: 8000, cc: 155, fuelL: 7.1, category: "scooter" },
    "mt-15": { maxRpm: 10500, redlineRpm: 10000, cc: 155, fuelL: 10, category: "naked" },
    "r15": { maxRpm: 11000, redlineRpm: 10500, cc: 155, fuelL: 11, category: "sport" },
    "mt-03": { maxRpm: 12500, redlineRpm: 11500, cc: 321, fuelL: 14, category: "naked" },
    "r3": { maxRpm: 13000, redlineRpm: 12000, cc: 321, fuelL: 14, category: "sport" },
    "tmax": { maxRpm: 8500, redlineRpm: 7800, cc: 562, fuelL: 15, category: "scooter" },
    "mt-07": { maxRpm: 10500, redlineRpm: 9000, cc: 689, fuelL: 14, category: "naked" },
    "mt-09": { maxRpm: 11500, redlineRpm: 10500, cc: 890, fuelL: 14, category: "naked" },
    "r1": { maxRpm: 14500, redlineRpm: 13800, cc: 998, fuelL: 17, category: "sport" },
    "r6": { maxRpm: 16500, redlineRpm: 15500, cc: 599, fuelL: 17, category: "sport" }
  },
  honda: {
    "wave 110": { maxRpm: 8500, redlineRpm: 7500, cc: 110, fuelL: 5.1, category: "scooter" },
    "cb 125": { maxRpm: 9000, redlineRpm: 8000, cc: 125, fuelL: 10.1, category: "naked" },
    "cg 160": { maxRpm: 9500, redlineRpm: 8500, cc: 162.7, fuelL: 16.1, category: "naked" },
    "bros 160": { maxRpm: 9000, redlineRpm: 8000, cc: 162.7, fuelL: 12, category: "adventure" },
    "xr 150": { maxRpm: 9000, redlineRpm: 8000, cc: 149, fuelL: 12, category: "adventure" },
    "xr 190": { maxRpm: 8500, redlineRpm: 8000, cc: 184, fuelL: 12, category: "adventure" },
    "xr 250": { maxRpm: 9500, redlineRpm: 8500, cc: 249, fuelL: 11.5, category: "adventure" },
    "cb300f": { maxRpm: 8500, redlineRpm: 7500, cc: 293.5, fuelL: 14.1, category: "naked" },
    "xre 300": { maxRpm: 9000, redlineRpm: 8000, cc: 293.5, fuelL: 13.8, category: "adventure" },
    "cb500": { maxRpm: 9500, redlineRpm: 8500, cc: 471, fuelL: 17.1, category: "naked" },
    "cbr650r": { maxRpm: 13000, redlineRpm: 12000, cc: 649, fuelL: 15.4, category: "sport" },
    "x-adv": { maxRpm: 7500, redlineRpm: 6800, cc: 745, fuelL: 13.2, category: "adventure" },
    "transalp": { maxRpm: 10000, redlineRpm: 9200, cc: 755, fuelL: 16.9, category: "adventure" },
    "cbr1000rr-r": { maxRpm: 15000, redlineRpm: 14500, cc: 1000, fuelL: 16.1, category: "sport" }
  },
  suzuki: {
    "gn 125": { maxRpm: 10000, redlineRpm: 9000, cc: 124, fuelL: 10.3, category: "naked" },
    "dr 150": { maxRpm: 9500, redlineRpm: 8500, cc: 149, fuelL: 12.5, category: "adventure" },
    "gixxer 150": { maxRpm: 10000, redlineRpm: 9000, cc: 155, fuelL: 12, category: "naked" },
    "gixxer 250": { maxRpm: 10000, redlineRpm: 9000, cc: 249, fuelL: 12, category: "naked" },
    "v-strom 250": { maxRpm: 10000, redlineRpm: 9000, cc: 249, fuelL: 12, category: "adventure" },
    "v-strom 650": { maxRpm: 10500, redlineRpm: 9500, cc: 645, fuelL: 20, category: "adventure" },
    "gsx-8s": { maxRpm: 9500, redlineRpm: 8500, cc: 776, fuelL: 14, category: "naked" },
    "hayabusa": { maxRpm: 11500, redlineRpm: 10500, cc: 1340, fuelL: 20, category: "sport" }
  },
  bajaj: {
    "boxer": { maxRpm: 8500, redlineRpm: 7500, cc: 102, fuelL: 10.5, category: "naked" },
    "discover": { maxRpm: 9500, redlineRpm: 8500, cc: 124.5, fuelL: 10, category: "naked" },
    "pulsar n160": { maxRpm: 9500, redlineRpm: 8500, cc: 164.8, fuelL: 14, category: "naked" },
    "pulsar 180": { maxRpm: 10000, redlineRpm: 9000, cc: 178.6, fuelL: 15, category: "naked" },
    "pulsar ns200": { maxRpm: 11000, redlineRpm: 9500, cc: 199.5, fuelL: 12, category: "naked" },
    "pulsar n250": { maxRpm: 9500, redlineRpm: 8500, cc: 249, fuelL: 14, category: "naked" },
    "dominar 250": { maxRpm: 9500, redlineRpm: 8800, cc: 248.7, fuelL: 13, category: "touring" },
    "dominar 400": { maxRpm: 9500, redlineRpm: 8500, cc: 373.3, fuelL: 13, category: "touring" },
    "pulsar ns400": { maxRpm: 10000, redlineRpm: 9000, cc: 373.3, fuelL: 12, category: "naked" }
  },
  akt: {
    "nkd 125": { maxRpm: 9500, redlineRpm: 8500, cc: 124, fuelL: 10, category: "naked" },
    "special 110": { maxRpm: 8500, redlineRpm: 7500, cc: 107, fuelL: 3.7, category: "scooter" },
    "dynamic": { maxRpm: 8500, redlineRpm: 7500, cc: 125, fuelL: 4.5, category: "scooter" },
    "cr4 162": { maxRpm: 9500, redlineRpm: 8500, cc: 162, fuelL: 12.1, category: "naked" },
    "cr4 200": { maxRpm: 9500, redlineRpm: 8500, cc: 197, fuelL: 12.1, category: "naked" },
    "ttr 200": { maxRpm: 9500, redlineRpm: 8500, cc: 197, fuelL: 11, category: "adventure" },
    "tt 250": { maxRpm: 10000, redlineRpm: 9000, cc: 250, fuelL: 15, category: "adventure" },
    "voge 300": { maxRpm: 9500, redlineRpm: 8500, cc: 292, fuelL: 16, category: "adventure" },
    "voge 525": { maxRpm: 9500, redlineRpm: 8500, cc: 494, fuelL: 18, category: "adventure" }
  },
  tvs: {
    "raider 125": { maxRpm: 10000, redlineRpm: 9000, cc: 124.8, fuelL: 10, category: "naked" },
    "ntorq 125": { maxRpm: 9500, redlineRpm: 8500, cc: 124.8, fuelL: 5.8, category: "scooter" },
    "apache rtr 160": { maxRpm: 10000, redlineRpm: 9000, cc: 159.7, fuelL: 12, category: "naked" },
    "apache rtr 200": { maxRpm: 10500, redlineRpm: 9200, cc: 197.75, fuelL: 12, category: "naked" },
    "ronin 225": { maxRpm: 9500, redlineRpm: 8500, cc: 225.9, fuelL: 14, category: "naked" },
    "apache rr 310": { maxRpm: 11000, redlineRpm: 9800, cc: 312.2, fuelL: 11, category: "sport" },
    "apache rtr 310": { maxRpm: 11000, redlineRpm: 9800, cc: 312.2, fuelL: 11, category: "naked" }
  },
  italika: {
    "ft150": { maxRpm: 9000, redlineRpm: 8000, cc: 149, fuelL: 14, category: "naked" },
    "ws150": { maxRpm: 8500, redlineRpm: 7500, cc: 149.6, fuelL: 6, category: "scooter" },
    "dm 200": { maxRpm: 9500, redlineRpm: 8500, cc: 198, fuelL: 11, category: "adventure" },
    "dm 250": { maxRpm: 9500, redlineRpm: 8500, cc: 250, fuelL: 11, category: "adventure" },
    "250z": { maxRpm: 9500, redlineRpm: 8500, cc: 250, fuelL: 11, category: "naked" },
    "vort-x 250": { maxRpm: 9500, redlineRpm: 8500, cc: 250, fuelL: 15, category: "naked" },
    "vort-x 300": { maxRpm: 10000, redlineRpm: 9000, cc: 292, fuelL: 15, category: "sport" },
    "vort-x 650": { maxRpm: 8500, redlineRpm: 7500, cc: 652, fuelL: 15, category: "naked" }
  },
  hero: {
    "eco 100": { maxRpm: 8500, redlineRpm: 7500, cc: 97.2, fuelL: 11, category: "naked" },
    "ignitor 125": { maxRpm: 9000, redlineRpm: 8000, cc: 124.7, fuelL: 11, category: "naked" },
    "hunk 160r": { maxRpm: 10000, redlineRpm: 9000, cc: 163, fuelL: 12, category: "naked" },
    "xpulse 200": { maxRpm: 9500, redlineRpm: 8500, cc: 199.6, fuelL: 13, category: "adventure" },
    "karizma": { maxRpm: 10500, redlineRpm: 9500, cc: 210, fuelL: 11, category: "sport" },
    "mavrick 440": { maxRpm: 7500, redlineRpm: 6500, cc: 440, fuelL: 13.5, category: "naked" }
  },
  victory: {
    "black 170": { maxRpm: 8500, redlineRpm: 7800, cc: 168.9, fuelL: 6.5, category: "scooter" },
    "mrx 150": { maxRpm: 9500, redlineRpm: 8500, cc: 149, fuelL: 11, category: "adventure" },
    "mrx 200": { maxRpm: 9500, redlineRpm: 8500, cc: 199, fuelL: 13, category: "adventure" },
    "venom 250": { maxRpm: 9500, redlineRpm: 8500, cc: 249, fuelL: 14, category: "naked" },
    "venom 400": { maxRpm: 10000, redlineRpm: 9000, cc: 378, fuelL: 15, category: "naked" },
    "zontes 350": { maxRpm: 10500, redlineRpm: 9500, cc: 348, fuelL: 19, category: "adventure" }
  },
  ktm: {
    "duke 200": { maxRpm: 10500, redlineRpm: 9500, cc: 199.5, fuelL: 13.4, category: "naked" },
    "duke 250": { maxRpm: 10500, redlineRpm: 9500, cc: 249, fuelL: 15, category: "naked" },
    "duke 390": { maxRpm: 10500, redlineRpm: 9500, cc: 399, fuelL: 15, category: "naked" },
    "rc 390": { maxRpm: 10500, redlineRpm: 9500, cc: 373, fuelL: 13.7, category: "sport" },
    "duke 890": { maxRpm: 10500, redlineRpm: 9800, cc: 889, fuelL: 14, category: "naked" },
    "super duke": { maxRpm: 10500, redlineRpm: 9500, cc: 1350, fuelL: 17.5, category: "naked" }
  },
  kawasaki: {
    "klx": { maxRpm: 8500, redlineRpm: 8000, cc: 233, fuelL: 7.5, category: "adventure" },
    "ninja 400": { maxRpm: 13000, redlineRpm: 12000, cc: 399, fuelL: 14, category: "sport" },
    "ninja 500": { maxRpm: 11500, redlineRpm: 10500, cc: 451, fuelL: 14, category: "sport" },
    "z900": { maxRpm: 11500, redlineRpm: 10500, cc: 948, fuelL: 17, category: "naked" },
    "zx-6r": { maxRpm: 16000, redlineRpm: 15000, cc: 636, fuelL: 17, category: "sport" },
    "zx-10r": { maxRpm: 14500, redlineRpm: 13800, cc: 998, fuelL: 17, category: "sport" }
  },
  "royal enfield": {
    "hunter 350": { maxRpm: 7500, redlineRpm: 6500, cc: 349, fuelL: 13, category: "naked" },
    "meteor 350": { maxRpm: 7500, redlineRpm: 6500, cc: 349, fuelL: 15, category: "touring" },
    "himalayan 450": { maxRpm: 9000, redlineRpm: 8000, cc: 452, fuelL: 17, category: "adventure" },
    "guerrilla 450": { maxRpm: 9000, redlineRpm: 8000, cc: 452, fuelL: 11, category: "naked" },
    "interceptor 650": { maxRpm: 8000, redlineRpm: 7250, cc: 648, fuelL: 13.7, category: "naked" }
  },
  cfmoto: {
    "250nk": { maxRpm: 10500, redlineRpm: 9500, cc: 249, fuelL: 12.5, category: "naked" },
    "300sr": { maxRpm: 10500, redlineRpm: 9500, cc: 292, fuelL: 12.5, category: "sport" },
    "450sr": { maxRpm: 12000, redlineRpm: 11000, cc: 449.5, fuelL: 14, category: "sport" },
    "450nk": { maxRpm: 11500, redlineRpm: 10500, cc: 449.5, fuelL: 14, category: "naked" },
    "450mt": { maxRpm: 11000, redlineRpm: 10000, cc: 449.5, fuelL: 17.5, category: "adventure" },
    "800mt": { maxRpm: 10500, redlineRpm: 9500, cc: 799, fuelL: 19, category: "adventure" }
  },
  bmw: {
    "g 310": { maxRpm: 10500, redlineRpm: 9500, cc: 313, fuelL: 11, category: "naked" },
    "f 900": { maxRpm: 9500, redlineRpm: 8500, cc: 895, fuelL: 14, category: "adventure" },
    "s 1000 rr": { maxRpm: 15000, redlineRpm: 14500, cc: 999, fuelL: 16.5, category: "sport" },
    "s1000rr": { maxRpm: 15000, redlineRpm: 14500, cc: 999, fuelL: 16.5, category: "sport" },
    "r 1300 gs": { maxRpm: 9000, redlineRpm: 8200, cc: 1300, fuelL: 19, category: "adventure" },
    "r1250gs": { maxRpm: 9000, redlineRpm: 8000, cc: 1254, fuelL: 20, category: "adventure" }
  },
  ducati: {
    "panigale v4": { maxRpm: 15500, redlineRpm: 14800, cc: 1103, fuelL: 17, category: "sport" },
    "monster": { maxRpm: 10000, redlineRpm: 9250, cc: 937, fuelL: 14, category: "naked" },
    "streetfighter": { maxRpm: 11500, redlineRpm: 10750, cc: 955, fuelL: 16, category: "naked" },
    "multistrada": { maxRpm: 13500, redlineRpm: 12500, cc: 1103, fuelL: 22, category: "touring" }
  },
  triumph: {
    "speed 400": { maxRpm: 10000, redlineRpm: 9200, cc: 398, fuelL: 13, category: "naked" },
    "scrambler 400": { maxRpm: 10000, redlineRpm: 9200, cc: 398, fuelL: 13, category: "adventure" },
    "trident 660": { maxRpm: 12000, redlineRpm: 11250, cc: 660, fuelL: 14, category: "naked" },
    "street triple 765": { maxRpm: 13500, redlineRpm: 12650, cc: 765, fuelL: 15, category: "naked" },
    "tiger 900": { maxRpm: 10500, redlineRpm: 9500, cc: 888, fuelL: 20, category: "adventure" }
  },
  "harley-davidson": {
    "sportster s": { maxRpm: 9500, redlineRpm: 9000, cc: 1252, fuelL: 11.8, category: "naked" },
    "pan america": { maxRpm: 9500, redlineRpm: 9000, cc: 1252, fuelL: 21.2, category: "adventure" },
    "street glide": { maxRpm: 6000, redlineRpm: 5500, cc: 1923, fuelL: 22.7, category: "touring" }
  },
  aprilia: {
    "rs 457": { maxRpm: 11500, redlineRpm: 10500, cc: 457, fuelL: 13, category: "sport" },
    "rs 660": { maxRpm: 12000, redlineRpm: 11500, cc: 659, fuelL: 15, category: "sport" },
    "tuareg 660": { maxRpm: 10500, redlineRpm: 9500, cc: 659, fuelL: 18, category: "adventure" },
    "rsv4": { maxRpm: 14500, redlineRpm: 13600, cc: 1099, fuelL: 17.9, category: "sport" }
  },
  benelli: {
    "tnt 150": { maxRpm: 10000, redlineRpm: 9000, cc: 150, fuelL: 10, category: "naked" },
    "trk 502": { maxRpm: 9500, redlineRpm: 8500, cc: 500, fuelL: 20, category: "adventure" },
    "trk 702": { maxRpm: 9500, redlineRpm: 8800, cc: 698, fuelL: 20, category: "adventure" }
  }
};

export function sanitizeHexColor(hex, fallback = "#FF6600") {
  if (typeof hex === "string" && /^#[0-9A-Fa-f]{6}$/.test(hex.trim())) {
    return hex.trim();
  }
  return fallback;
}

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

  const brandData = OEM_DATABASE[normBrand];
  const matchedModel = brandData ? Object.keys(brandData).find(k => normModel.includes(k) || k.includes(normModel)) : null;
  const specs = (brandData && matchedModel) ? brandData[matchedModel] : {
    maxRpm: 10500,
    redlineRpm: 9200,
    cc: 200,
    fuelL: 13,
    category: "naked"
  };

  return formatConfig(safeBrand, safeModel, safeYear, safeColor, {
    maxRpm: specs.maxRpm,
    redlineRpm: specs.redlineRpm,
    engineDisplacementCc: specs.cc,
    fuelCapacityLiters: specs.fuelL,
    category: specs.category,
    recommendedOilIntervalKm: specs.cc > 500 ? 5000 : 3000,
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
      engineCc: Math.min(3000, Math.max(50, Number(data.engineDisplacementCc) || 200)),
      tankCapacityLiters: Math.min(45, Math.max(3, Number(data.fuelCapacityLiters) || 13))
    },
    maintenanceSchedule: [
      { id: "oil", service: "Cambio Aceite y Filtro", intervalKm: Number(data.recommendedOilIntervalKm) || 3500, critical: true },
      { id: "chain", service: "Limpieza y Tensión de Cadena", intervalKm: Number(data.recommendedChainIntervalKm) || 800, critical: false },
      { id: "brakes", service: "Líquido de Frenos y Pastillas", intervalKm: 7500, critical: true },
      { id: "spark", service: "Bujías y Filtro de Aire", intervalKm: 10000, critical: false }
    ]
  };
}
