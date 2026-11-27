/**
 * Catálogo Mundial Oficial de las 19 Marcas de Motos Más Vendidas (2024 - 2026)
 * Incluye los modelos récord en ventas de los 11 países de MotoDash AI:
 * Colombia, México, Brasil, Argentina, Chile, Perú, EE. UU., España, Francia, Italia y Alemania.
 * Agrupadas por Marca y Rangos de Cilindrada:
 * - Baja: 100cc - 250cc
 * - Media: 250cc - 660cc
 * - Alta: 675cc - 1923cc
 */

export const MOTO_CATALOG = {
  Yamaha: {
    origin: "Japón • Top Ventas Global",
    colors: [
      { name: "Icon Blue (Racing)", hex: "#0040C1" },
      { name: "Cyan Storm (Hyper Naked)", hex: "#00D2D3" },
      { name: "Tech Black (Midnight)", hex: "#18181B" },
      { name: "Midnight D’or", hex: "#EAB308" }
    ],
    cilindradas: {
      baja: [
        { model: "Crypton FI 115", cc: 114, maxRpm: 8500, redlineRpm: 7800, category: "scooter", tankL: 4.2 },
        { model: "YBR 125Z / Factor 125i", cc: 125, maxRpm: 9000, redlineRpm: 8000, category: "naked", tankL: 13 },
        { model: "FZ-S FI V3.0 / V4.0 ABS", cc: 149, maxRpm: 9500, redlineRpm: 8500, category: "naked", tankL: 13 },
        { model: "XTZ 150 Crosser FI", cc: 149, maxRpm: 9000, redlineRpm: 8000, category: "adventure", tankL: 12 },
        { model: "NMAX 155 Connected", cc: 155, maxRpm: 8500, redlineRpm: 8000, category: "scooter", tankL: 7.1 },
        { model: "MT-15 V2", cc: 155, maxRpm: 10500, redlineRpm: 10000, category: "naked", tankL: 10 },
        { model: "YZF-R15 V4", cc: 155, maxRpm: 11000, redlineRpm: 10500, category: "sport", tankL: 11 },
        { model: "FZ25 / Fazer 250 ABS", cc: 249, maxRpm: 9500, redlineRpm: 8500, category: "naked", tankL: 14 },
        { model: "XTZ 250 Lander ABS", cc: 249, maxRpm: 9500, redlineRpm: 8500, category: "adventure", tankL: 13.6 }
      ],
      media: [
        { model: "MT-03 (2025)", cc: 321, maxRpm: 12500, redlineRpm: 11500, category: "naked", tankL: 14 },
        { model: "YZF-R3 (2025)", cc: 321, maxRpm: 13000, redlineRpm: 12000, category: "sport", tankL: 14 },
        { model: "XMAX 300 Tech MAX", cc: 292, maxRpm: 8500, redlineRpm: 7800, category: "scooter", tankL: 13 },
        { model: "TMAX 560 Tech MAX", cc: 562, maxRpm: 8500, redlineRpm: 7800, category: "scooter", tankL: 15 },
        { model: "MT-07 (Gen 4)", cc: 689, maxRpm: 10500, redlineRpm: 9000, category: "naked", tankL: 14 },
        { model: "YZF-R7", cc: 689, maxRpm: 10500, redlineRpm: 9200, category: "sport", tankL: 13 }
      ],
      alta: [
        { model: "MT-09 SP (Gen 4 2025)", cc: 890, maxRpm: 11500, redlineRpm: 10500, category: "naked", tankL: 14 },
        { model: "Ténéré 700 World Raid", cc: 689, maxRpm: 9500, redlineRpm: 8800, category: "adventure", tankL: 23 },
        { model: "Tracer 9 GT+", cc: 890, maxRpm: 11500, redlineRpm: 10500, category: "touring", tankL: 19 },
        { model: "YZF-R1 (Crossplane)", cc: 998, maxRpm: 14500, redlineRpm: 13800, category: "sport", tankL: 17 }
      ]
    }
  },

  Honda: {
    origin: "Japón • #1 Mundial y Brasil",
    colors: [
      { name: "Grand Prix Red", hex: "#EF4444" },
      { name: "Matte Ballistic Black", hex: "#18181B" },
      { name: "Pearl Glare White", hex: "#FFFFFF" },
      { name: "Matte Jeans Blue", hex: "#1E3A8A" }
    ],
    cilindradas: {
      baja: [
        { model: "Wave 110S / Biz 125", cc: 110, maxRpm: 8500, redlineRpm: 7500, category: "scooter", tankL: 5.1 },
        { model: "CB 125F Twister / GL 125", cc: 124.7, maxRpm: 9000, redlineRpm: 8000, category: "naked", tankL: 10.1 },
        { model: "CG 160 Titan / Fan (Récord Brasil)", cc: 162.7, maxRpm: 9500, redlineRpm: 8500, category: "naked", tankL: 16.1 },
        { model: "NXR 160 Bros / XR 150L", cc: 162.7, maxRpm: 9000, redlineRpm: 8000, category: "adventure", tankL: 12 },
        { model: "XR 190L FI", cc: 184, maxRpm: 8500, redlineRpm: 8000, category: "adventure", tankL: 12 },
        { model: "PCX 160 ABS", cc: 156, maxRpm: 8500, redlineRpm: 8000, category: "scooter", tankL: 8.1 },
        { model: "XRE 190 / X-Blade 160", cc: 184, maxRpm: 9000, redlineRpm: 8200, category: "adventure", tankL: 13.5 },
        { model: "XR 250 Tornado / XR 300L Tornado", cc: 249, maxRpm: 9500, redlineRpm: 8500, category: "adventure", tankL: 11.5 },
        { model: "CB300F Twister ABS", cc: 293.5, maxRpm: 8500, redlineRpm: 7500, category: "naked", tankL: 14.1 }
      ],
      media: [
        { model: "Sahara 300 / XRE 300 ABS", cc: 293.5, maxRpm: 9000, redlineRpm: 8000, category: "adventure", tankL: 13.8 },
        { model: "Forza 350 / ADV 350", cc: 330, maxRpm: 8500, redlineRpm: 7800, category: "scooter", tankL: 11.7 },
        { model: "NX500 / CB500X", cc: 471, maxRpm: 9500, redlineRpm: 8500, category: "adventure", tankL: 17.5 },
        { model: "CB500 Hornet (2025)", cc: 471, maxRpm: 9500, redlineRpm: 8500, category: "naked", tankL: 17.1 },
        { model: "CBR650R E-Clutch (2025)", cc: 649, maxRpm: 13000, redlineRpm: 12000, category: "sport", tankL: 15.4 }
      ],
      alta: [
        { model: "X-ADV 750 DCT", cc: 745, maxRpm: 7500, redlineRpm: 6800, category: "adventure", tankL: 13.2 },
        { model: "XL750 Transalp", cc: 755, maxRpm: 10000, redlineRpm: 9200, category: "adventure", tankL: 16.9 },
        { model: "CB750 Hornet", cc: 755, maxRpm: 10500, redlineRpm: 9500, category: "naked", tankL: 15.2 },
        { model: "CB1000 Hornet SP (2025)", cc: 999, maxRpm: 12500, redlineRpm: 11500, category: "naked", tankL: 17 },
        { model: "CBR1000RR-R Fireblade SP", cc: 1000, maxRpm: 15000, redlineRpm: 14500, category: "sport", tankL: 16.1 },
        { model: "CRF1100L Africa Twin Adventure Sports", cc: 1084, maxRpm: 8500, redlineRpm: 7800, category: "adventure", tankL: 24.8 }
      ]
    }
  },

  Suzuki: {
    origin: "Japón • Top Ventas LATAM",
    colors: [
      { name: "Triton Blue Metallic (MotoGP)", hex: "#2563EB" },
      { name: "Glass Sparkle Black", hex: "#171717" },
      { name: "Pearl Brilliant White", hex: "#FAFAFA" },
      { name: "Champion Yellow (RM-Z)", hex: "#EAB308" }
    ],
    cilindradas: {
      baja: [
        { model: "GN 125 F (Clásica Indestructible)", cc: 124, maxRpm: 10000, redlineRpm: 9000, category: "naked", tankL: 10.3 },
        { model: "AX4 115 Evolution", cc: 113, maxRpm: 9000, redlineRpm: 8000, category: "naked", tankL: 9.2 },
        { model: "Address 125 / Burgman 125 FI", cc: 124, maxRpm: 8500, redlineRpm: 7500, category: "scooter", tankL: 5.5 },
        { model: "DR 150 FI ABS (Top Ventas CO)", cc: 149, maxRpm: 9500, redlineRpm: 8500, category: "adventure", tankL: 12.5 },
        { model: "Gixxer 150 FI ABS", cc: 155, maxRpm: 10000, redlineRpm: 9000, category: "naked", tankL: 12 },
        { model: "Gixxer 250 FI ABS", cc: 249, maxRpm: 10000, redlineRpm: 9000, category: "naked", tankL: 12 },
        { model: "Gixxer SF 250", cc: 249, maxRpm: 10000, redlineRpm: 9000, category: "sport", tankL: 12 },
        { model: "V-Strom 250 SX", cc: 249, maxRpm: 10000, redlineRpm: 9000, category: "adventure", tankL: 12 }
      ],
      media: [
        { model: "DR 650 SE", cc: 644, maxRpm: 8000, redlineRpm: 7200, category: "adventure", tankL: 13 },
        { model: "V-Strom 650 XT", cc: 645, maxRpm: 10500, redlineRpm: 9500, category: "adventure", tankL: 20 },
        { model: "GSX-8S (2025)", cc: 776, maxRpm: 9500, redlineRpm: 8500, category: "naked", tankL: 14 },
        { model: "GSX-8R Aerodinámica (2025)", cc: 776, maxRpm: 9500, redlineRpm: 8500, category: "sport", tankL: 14 }
      ],
      alta: [
        { model: "V-Strom 800DE / Touring", cc: 776, maxRpm: 9500, redlineRpm: 8500, category: "adventure", tankL: 20 },
        { model: "V-Strom 1050DE", cc: 1037, maxRpm: 9500, redlineRpm: 8800, category: "adventure", tankL: 20 },
        { model: "GSX-S1000GX Crossover", cc: 999, maxRpm: 12000, redlineRpm: 11000, category: "touring", tankL: 19 },
        { model: "GSX-R1000R", cc: 999, maxRpm: 14500, redlineRpm: 13800, category: "sport", tankL: 16 },
        { model: "Hayabusa 1340", cc: 1340, maxRpm: 11500, redlineRpm: 10500, category: "sport", tankL: 20 }
      ]
    }
  },

  Bajaj: {
    origin: "India • Grupo UMA Top Ventas",
    colors: [
      { name: "Pulsar Burnt Red", hex: "#B91C1C" },
      { name: "Plasma Blue", hex: "#1D4ED8" },
      { name: "Satin Titanium Black", hex: "#1F2937" },
      { name: "Savanna Green (Dominar)", hex: "#15803D" }
    ],
    cilindradas: {
      baja: [
        { model: "Boxer CT100 KS / ES (Reina del Trabajo)", cc: 102, maxRpm: 8500, redlineRpm: 7500, category: "naked", tankL: 10.5 },
        { model: "Boxer S / Boxer 150X Cross", cc: 144.8, maxRpm: 8500, redlineRpm: 7500, category: "adventure", tankL: 11 },
        { model: "Discover 125 ST-R", cc: 124.5, maxRpm: 9500, redlineRpm: 8500, category: "naked", tankL: 10 },
        { model: "Pulsar NS 125 / 150 Fi", cc: 124.4, maxRpm: 10000, redlineRpm: 9000, category: "naked", tankL: 12 },
        { model: "Pulsar N160 Dual ABS", cc: 164.8, maxRpm: 9500, redlineRpm: 8500, category: "naked", tankL: 14 },
        { model: "Pulsar 180 Fi Neon", cc: 178.6, maxRpm: 10000, redlineRpm: 9000, category: "naked", tankL: 15 },
        { model: "Pulsar NS200 FI ABS / UG (Rouser)", cc: 199.5, maxRpm: 11000, redlineRpm: 9500, category: "naked", tankL: 12 }
      ],
      media: [
        { model: "Pulsar N250 FI ABS (2025)", cc: 249, maxRpm: 9500, redlineRpm: 8500, category: "naked", tankL: 14 },
        { model: "Dominar 250 Dual ABS", cc: 248.7, maxRpm: 9500, redlineRpm: 8800, category: "touring", tankL: 13 },
        { model: "Dominar 400 UG Touring", cc: 373.3, maxRpm: 9500, redlineRpm: 8500, category: "touring", tankL: 13 },
        { model: "Pulsar NS400Z (2025 Flagship)", cc: 373.3, maxRpm: 10000, redlineRpm: 9000, category: "naked", tankL: 12 }
      ],
      alta: []
    }
  },

  AKT: {
    origin: "Colombia • #1 en Ventas NKD 125",
    colors: [
      { name: "NKD Matte Black / Red", hex: "#EF4444" },
      { name: "AKT Racing Blue", hex: "#2563EB" },
      { name: "Adventour Sand / Gold", hex: "#F59E0B" },
      { name: "Pearl White Classic", hex: "#F8FAFC" }
    ],
    cilindradas: {
      baja: [
        { model: "NKD 125 Classic / EX74 (#1 en Colombia)", cc: 124, maxRpm: 9500, redlineRpm: 8500, category: "naked", tankL: 10 },
        { model: "Special 110X / AK125 Flex", cc: 107, maxRpm: 8500, redlineRpm: 7500, category: "scooter", tankL: 3.7 },
        { model: "Dynamic Pro 125 CBS", cc: 124.6, maxRpm: 8500, redlineRpm: 7500, category: "scooter", tankL: 4.5 },
        { model: "CR4 125 / CR4 162", cc: 162, maxRpm: 9500, redlineRpm: 8500, category: "naked", tankL: 12.1 },
        { model: "CR4 200 Pro FI", cc: 197, maxRpm: 9500, redlineRpm: 8500, category: "naked", tankL: 12.1 },
        { model: "TTR 125 / TTR 200 Enduro", cc: 197, maxRpm: 9500, redlineRpm: 8500, category: "adventure", tankL: 11 },
        { model: "TT Dual Sport 200", cc: 197, maxRpm: 9500, redlineRpm: 8500, category: "adventure", tankL: 11 },
        { model: "TT 250 Adventour FI", cc: 249.6, maxRpm: 10000, redlineRpm: 9000, category: "adventure", tankL: 15 }
      ],
      media: [
        { model: "Voge 300DS Touring", cc: 292, maxRpm: 9500, redlineRpm: 8500, category: "adventure", tankL: 16 },
        { model: "Voge 300AC / 300 Rally", cc: 292, maxRpm: 9500, redlineRpm: 8500, category: "adventure", tankL: 15 },
        { model: "Voge 525DSX Adventure", cc: 494, maxRpm: 9500, redlineRpm: 8500, category: "adventure", tankL: 18 }
      ],
      alta: []
    }
  },

  TVS: {
    origin: "India • Auteco SmartXonnect",
    colors: [
      { name: "Racing Red (TVS BTR)", hex: "#DC2626" },
      { name: "Lightning Black", hex: "#0F172A" },
      { name: "Fury Yellow", hex: "#EAB308" },
      { name: "Pearl White BTR", hex: "#FFFFFF" }
    ],
    cilindradas: {
      baja: [
        { model: "Sport 100 ELS / Stryker 125", cc: 99.7, maxRpm: 8500, redlineRpm: 7500, category: "naked", tankL: 10 },
        { model: "Raider 125 FI SmartXonnect", cc: 124.8, maxRpm: 10000, redlineRpm: 9000, category: "naked", tankL: 10 },
        { model: "Ntorq 125 Race XP FI", cc: 124.8, maxRpm: 9500, redlineRpm: 8500, category: "scooter", tankL: 5.8 },
        { model: "Apache RTR 160 2V / 4V Carb", cc: 159.7, maxRpm: 10000, redlineRpm: 9000, category: "naked", tankL: 12 },
        { model: "Apache RTR 160 4V FI ABS (NG)", cc: 159.7, maxRpm: 10000, redlineRpm: 9000, category: "naked", tankL: 12 },
        { model: "Apache RTR 200 4V FI (Ride Modes)", cc: 197.75, maxRpm: 10500, redlineRpm: 9200, category: "naked", tankL: 12 },
        { model: "Ronin 225 TD SmartXonnect", cc: 225.9, maxRpm: 9500, redlineRpm: 8500, category: "naked", tankL: 14 }
      ],
      media: [
        { model: "Apache RR 310 BTR (Track)", cc: 312.2, maxRpm: 11000, redlineRpm: 9800, category: "sport", tankL: 11 },
        { model: "Apache RTR 310 Hyper Naked (2025)", cc: 312.2, maxRpm: 11000, redlineRpm: 9800, category: "naked", tankL: 11 }
      ],
      alta: []
    }
  },

  Italika: {
    origin: "México • #1 en Ventas México & LATAM",
    colors: [
      { name: "Italika Cyan / Blue", hex: "#38BDF8" },
      { name: "Vort-X Racing Red", hex: "#EF4444" },
      { name: "DM Enduro Orange / Green", hex: "#F97316" },
      { name: "Z-Series Black / Neon", hex: "#84CC16" }
    ],
    cilindradas: {
      baja: [
        { model: "FT150 GTS / FT150 Trabajo (#1 México)", cc: 149, maxRpm: 9000, redlineRpm: 8000, category: "naked", tankL: 14 },
        { model: "D150 / WS150 Sport", cc: 149.6, maxRpm: 8500, redlineRpm: 7500, category: "scooter", tankL: 6 },
        { model: "150Z / 200Z", cc: 196, maxRpm: 9500, redlineRpm: 8500, category: "naked", tankL: 14 },
        { model: "DM 200 / DM 250X Doble Propósito", cc: 250, maxRpm: 9500, redlineRpm: 8500, category: "adventure", tankL: 11 },
        { model: "250Z Negra / 280Z", cc: 250, maxRpm: 9500, redlineRpm: 8500, category: "naked", tankL: 11 },
        { model: "Vort-X 250", cc: 250, maxRpm: 9500, redlineRpm: 8500, category: "naked", tankL: 15 }
      ],
      media: [
        { model: "Vort-X 300 / Vort-X 300R", cc: 292, maxRpm: 10000, redlineRpm: 9000, category: "sport", tankL: 15 },
        { model: "VX250 Adventure", cc: 249.6, maxRpm: 9500, redlineRpm: 8500, category: "adventure", tankL: 15 },
        { model: "Vort-X 650", cc: 652, maxRpm: 8500, redlineRpm: 7500, category: "naked", tankL: 15 }
      ],
      alta: []
    }
  },

  Hero: {
    origin: "India • #1 Mundial en Volumen",
    colors: [
      { name: "Hero Racing Red", hex: "#E11D48" },
      { name: "XPulse Rally White / Blue", hex: "#2563EB" },
      { name: "Hunk Matte Black", hex: "#18181B" },
      { name: "Electric Lime", hex: "#84CC16" }
    ],
    cilindradas: {
      baja: [
        { model: "Eco 100 / Eco Deluxe / Eco T", cc: 97.2, maxRpm: 8500, redlineRpm: 7500, category: "naked", tankL: 11 },
        { model: "Ignitor 125 5V / Xtec", cc: 124.7, maxRpm: 9000, redlineRpm: 8000, category: "naked", tankL: 11 },
        { model: "Dash 125 FI / Xoom 110", cc: 124.6, maxRpm: 8500, redlineRpm: 7500, category: "scooter", tankL: 5.5 },
        { model: "Hunk 150 / Thriller 150", cc: 149.2, maxRpm: 9000, redlineRpm: 8000, category: "naked", tankL: 12.4 },
        { model: "Hunk 160R 4V FI ABS", cc: 163, maxRpm: 10000, redlineRpm: 9000, category: "naked", tankL: 12 },
        { model: "XPulse 200 4V FI / Rally Edition", cc: 199.6, maxRpm: 9500, redlineRpm: 8500, category: "adventure", tankL: 13 }
      ],
      media: [
        { model: "Karizma XMR 210 / Hunk 250R", cc: 210, maxRpm: 10500, redlineRpm: 9500, category: "sport", tankL: 11 },
        { model: "Mavrick 440 Roadster", cc: 440, maxRpm: 7500, redlineRpm: 6500, category: "naked", tankL: 13.5 }
      ],
      alta: []
    }
  },

  Victory: {
    origin: "Colombia • Auteco Mobility Top Ventas",
    colors: [
      { name: "Victory Cyan Neon", hex: "#06B6D4" },
      { name: "Arizona Sand / Gold", hex: "#F59E0B" },
      { name: "Venom Crimson Red", hex: "#EF4444" },
      { name: "Stealth Matte Black", hex: "#1F2937" }
    ],
    cilindradas: {
      baja: [
        { model: "One ST 100 / Advance R 110", cc: 99, maxRpm: 8500, redlineRpm: 7500, category: "scooter", tankL: 4 },
        { model: "Life 125 / Black 170 FI", cc: 168.9, maxRpm: 8500, redlineRpm: 7800, category: "scooter", tankL: 6.5 },
        { model: "Switch 150 / Bomber 150", cc: 149, maxRpm: 9500, redlineRpm: 8500, category: "naked", tankL: 12 },
        { model: "MRX 125 / MRX 150 Enduro", cc: 149, maxRpm: 9500, redlineRpm: 8500, category: "adventure", tankL: 11 },
        { model: "MRX 200 / MRX 200 Arizona FI", cc: 199, maxRpm: 9500, redlineRpm: 8500, category: "adventure", tankL: 13 },
        { model: "Venom 14 / Venom 18 / Venom 250", cc: 249, maxRpm: 9500, redlineRpm: 8500, category: "naked", tankL: 14 }
      ],
      media: [
        { model: "Venom 400 Twin", cc: 378, maxRpm: 10000, redlineRpm: 9000, category: "naked", tankL: 15 },
        { model: "Zontes 350T Adventure / 350R", cc: 348, maxRpm: 10500, redlineRpm: 9500, category: "adventure", tankL: 19 }
      ],
      alta: []
    }
  },

  KTM: {
    origin: "Austria • Ready to Race",
    colors: [
      { name: "Ready to Race Orange", hex: "#FF6600" },
      { name: "Electronic Orange", hex: "#F97316" },
      { name: "Factory Ceramic White", hex: "#F4F4F5" },
      { name: "Dark Shadow Matt", hex: "#1C1917" }
    ],
    cilindradas: {
      baja: [
        { model: "200 Duke NG", cc: 199.5, maxRpm: 10500, redlineRpm: 9500, category: "naked", tankL: 13.4 },
        { model: "250 Duke (Gen 3)", cc: 249, maxRpm: 10500, redlineRpm: 9500, category: "naked", tankL: 15 }
      ],
      media: [
        { model: "390 Duke (Gen 3 2024-2026)", cc: 399, maxRpm: 10500, redlineRpm: 9500, category: "naked", tankL: 15 },
        { model: "RC 390 (Track Focused)", cc: 373, maxRpm: 10500, redlineRpm: 9500, category: "sport", tankL: 13.7 },
        { model: "390 Adventure SW / R", cc: 399, maxRpm: 10000, redlineRpm: 9000, category: "adventure", tankL: 14.5 }
      ],
      alta: [
        { model: "790 / 890 Adventure R", cc: 889, maxRpm: 9500, redlineRpm: 8800, category: "adventure", tankL: 20 },
        { model: "990 Duke (2025)", cc: 947, maxRpm: 10500, redlineRpm: 9800, category: "naked", tankL: 14.8 },
        { model: "1390 Super Duke R Evo (2025)", cc: 1350, maxRpm: 10500, redlineRpm: 9800, category: "naked", tankL: 17.5 }
      ]
    }
  },

  Kawasaki: {
    origin: "Japón • Team Green",
    colors: [
      { name: "Lime Green Racing", hex: "#52C41A" },
      { name: "Metallic Diablo Black", hex: "#111111" },
      { name: "Pearl Robotic White", hex: "#E5E7EB" },
      { name: "Candy Steel Furnace Orange", hex: "#EA580C" }
    ],
    cilindradas: {
      baja: [
        { model: "KLX 150 / KLX 230 S", cc: 233, maxRpm: 8500, redlineRpm: 8000, category: "adventure", tankL: 7.5 },
        { model: "Versys-X 300", cc: 296, maxRpm: 13000, redlineRpm: 12000, category: "adventure", tankL: 17 }
      ],
      media: [
        { model: "Ninja 400 / Ninja 500 (2025)", cc: 451, maxRpm: 11500, redlineRpm: 10500, category: "sport", tankL: 14 },
        { model: "Z400 / Z500 SE", cc: 451, maxRpm: 11500, redlineRpm: 10500, category: "naked", tankL: 14 },
        { model: "Ninja ZX-4RR (4 Cilindros)", cc: 399, maxRpm: 16000, redlineRpm: 15000, category: "sport", tankL: 15 },
        { model: "KLR 650 Adventure", cc: 652, maxRpm: 7500, redlineRpm: 6800, category: "adventure", tankL: 23 },
        { model: "Versys 650 LT", cc: 649, maxRpm: 9500, redlineRpm: 8500, category: "adventure", tankL: 21 }
      ],
      alta: [
        { model: "Ninja ZX-6R (636 2025)", cc: 636, maxRpm: 16000, redlineRpm: 15000, category: "sport", tankL: 17 },
        { model: "Z900 SE (2025)", cc: 948, maxRpm: 11500, redlineRpm: 10500, category: "naked", tankL: 17 },
        { model: "Ninja ZX-10R KRT", cc: 998, maxRpm: 14500, redlineRpm: 13800, category: "sport", tankL: 17 }
      ]
    }
  },

  "Royal Enfield": {
    origin: "Reino Unido / India • Top Mid-Size",
    colors: [
      { name: "Kamet White / Himalayan Gold", hex: "#F59E0B" },
      { name: "Rebel Red / Halcyon Green", hex: "#DC2626" },
      { name: "Dapper Grey / Black", hex: "#334155" },
      { name: "British Racing Green", hex: "#15803D" }
    ],
    cilindradas: {
      baja: [],
      media: [
        { model: "Hunter 350 Rebel", cc: 349, maxRpm: 7500, redlineRpm: 6500, category: "naked", tankL: 13 },
        { model: "Meteor 350 / Classic 350", cc: 349, maxRpm: 7500, redlineRpm: 6500, category: "touring", tankL: 15 },
        { model: "Himalayan 411 Scram", cc: 411, maxRpm: 7500, redlineRpm: 6500, category: "adventure", tankL: 15 },
        { model: "Himalayan 450 (Sherpa 452 TFT)", cc: 452, maxRpm: 9000, redlineRpm: 8000, category: "adventure", tankL: 17 },
        { model: "Guerrilla 450 Roadster", cc: 452, maxRpm: 9000, redlineRpm: 8000, category: "naked", tankL: 11 },
        { model: "Interceptor 650 / Continental GT 650", cc: 648, maxRpm: 8000, redlineRpm: 7250, category: "naked", tankL: 13.7 },
        { model: "Super Meteor 650 / Shotgun 650", cc: 648, maxRpm: 8000, redlineRpm: 7250, category: "touring", tankL: 15.7 }
      ],
      alta: []
    }
  },

  CFMOTO: {
    origin: "Global • Sensación Racing & Trail",
    colors: [
      { name: "Zircon Black / Nebula Cyan", hex: "#00D4FF" },
      { name: "Zephyr Blue", hex: "#2563EB" },
      { name: "Nebula White / Red", hex: "#EF4444" },
      { name: "Tundra Grey", hex: "#64748B" }
    ],
    cilindradas: {
      baja: [
        { model: "250NK / 250SR", cc: 249, maxRpm: 10500, redlineRpm: 9500, category: "sport", tankL: 12.5 }
      ],
      media: [
        { model: "300NK / 300SR", cc: 292, maxRpm: 10500, redlineRpm: 9500, category: "sport", tankL: 12.5 },
        { model: "450SR / 450SR-S (50 HP)", cc: 449.5, maxRpm: 12000, redlineRpm: 11000, category: "sport", tankL: 14 },
        { model: "450NK / 450CL-C", cc: 449.5, maxRpm: 11500, redlineRpm: 10500, category: "naked", tankL: 14 },
        { model: "450MT Adventure (2025)", cc: 449.5, maxRpm: 11000, redlineRpm: 10000, category: "adventure", tankL: 17.5 }
      ],
      alta: [
        { model: "675SR-R / 675NK (3 Cilindros)", cc: 675, maxRpm: 12500, redlineRpm: 11500, category: "sport", tankL: 15 },
        { model: "700CL-X Sport / Heritage", cc: 693, maxRpm: 10000, redlineRpm: 9000, category: "naked", tankL: 13 },
        { model: "800NK Advanced / 800MT Explore", cc: 799, maxRpm: 10500, redlineRpm: 9500, category: "adventure", tankL: 19 }
      ]
    }
  },

  BMW: {
    origin: "Alemania • #1 Europa Alta Gama",
    colors: [
      { name: "M Motorsport Tricolor", hex: "#2563EB" },
      { name: "Racing Red", hex: "#DC2626" },
      { name: "Black Storm Metallic", hex: "#111827" },
      { name: "Aurelius Green Metallic", hex: "#15803D" }
    ],
    cilindradas: {
      baja: [
        { model: "G 310 R", cc: 313, maxRpm: 10500, redlineRpm: 9500, category: "naked", tankL: 11 },
        { model: "G 310 GS", cc: 313, maxRpm: 10500, redlineRpm: 9500, category: "adventure", tankL: 11.5 }
      ],
      media: [
        { model: "C 400 X / C 400 GT", cc: 350, maxRpm: 8500, redlineRpm: 7800, category: "scooter", tankL: 12.8 },
        { model: "F 800 GS / F 900 R (2025)", cc: 895, maxRpm: 9500, redlineRpm: 8500, category: "naked", tankL: 13 },
        { model: "F 900 GS Enduro", cc: 895, maxRpm: 9500, redlineRpm: 8500, category: "adventure", tankL: 14.5 }
      ],
      alta: [
        { model: "S 1000 RR (M Package 2025)", cc: 999, maxRpm: 15000, redlineRpm: 14500, category: "sport", tankL: 16.5 },
        { model: "M 1000 R / S 1000 XR", cc: 999, maxRpm: 15000, redlineRpm: 14500, category: "naked", tankL: 16.5 },
        { model: "R 1250 GS / R 1300 GS Adventure", cc: 1300, maxRpm: 9000, redlineRpm: 8200, category: "adventure", tankL: 19 }
      ]
    }
  },

  Ducati: {
    origin: "Italia • Borgo Panigale",
    colors: [
      { name: "Rosso Corsa (Rojo Pista)", hex: "#DC2626" },
      { name: "Dark Stealth (Negro Mate)", hex: "#171717" },
      { name: "Star White Silk", hex: "#FAFAFA" },
      { name: "Aviator Grey", hex: "#6B7280" }
    ],
    cilindradas: {
      baja: [],
      media: [
        { model: "Scrambler Icon / Full Throttle", cc: 803, maxRpm: 9500, redlineRpm: 8500, category: "naked", tankL: 13.5 },
        { model: "Hypermotard 698 Mono (2025)", cc: 659, maxRpm: 10250, redlineRpm: 9750, category: "sport", tankL: 12 },
        { model: "Monster 937 Plus", cc: 937, maxRpm: 10000, redlineRpm: 9250, category: "naked", tankL: 14 },
        { model: "DesertX Discovery", cc: 937, maxRpm: 9500, redlineRpm: 8800, category: "adventure", tankL: 21 }
      ],
      alta: [
        { model: "Panigale V2 / Streetfighter V2", cc: 955, maxRpm: 11500, redlineRpm: 10750, category: "sport", tankL: 16 },
        { model: "Panigale V4 S (2025 New Aero)", cc: 1103, maxRpm: 15500, redlineRpm: 14800, category: "sport", tankL: 17 },
        { model: "Multistrada V4 S / V4 RS", cc: 1103, maxRpm: 13500, redlineRpm: 12500, category: "touring", tankL: 22 }
      ]
    }
  },

  Triumph: {
    origin: "Reino Unido • Hinckley Racing",
    colors: [
      { name: "Carnival Red / Phantom Black", hex: "#DC2626" },
      { name: "Cosmic Yellow (Street Triple RS)", hex: "#EAB308" },
      { name: "Caspian Blue", hex: "#2563EB" },
      { name: "Matt Khaki Green", hex: "#15803D" }
    ],
    cilindradas: {
      baja: [],
      media: [
        { model: "Speed 400 (TR-Series)", cc: 398, maxRpm: 10000, redlineRpm: 9200, category: "naked", tankL: 13 },
        { model: "Scrambler 400 X", cc: 398, maxRpm: 10000, redlineRpm: 9200, category: "adventure", tankL: 13 },
        { model: "Trident 660 / Daytona 660", cc: 660, maxRpm: 12000, redlineRpm: 11250, category: "naked", tankL: 14 },
        { model: "Tiger Sport 660 / 800", cc: 660, maxRpm: 11500, redlineRpm: 10500, category: "touring", tankL: 17.2 }
      ],
      alta: [
        { model: "Street Triple 765 R / RS", cc: 765, maxRpm: 13500, redlineRpm: 12650, category: "naked", tankL: 15 },
        { model: "Tiger 900 GT Pro / Rally Pro", cc: 888, maxRpm: 10500, redlineRpm: 9500, category: "adventure", tankL: 20 },
        { model: "Tiger 1200 GT Explorer", cc: 1160, maxRpm: 10000, redlineRpm: 9500, category: "adventure", tankL: 30 },
        { model: "Speed Triple 1200 RS / Rocket 3", cc: 1160, maxRpm: 11500, redlineRpm: 11150, category: "naked", tankL: 15.5 }
      ]
    }
  },

  "Harley-Davidson": {
    origin: "EE. UU. • #1 en Estados Unidos",
    colors: [
      { name: "Harley Racing Orange", hex: "#F97316" },
      { name: "Vivid Black", hex: "#171717" },
      { name: "Billiard Grey / Chrome", hex: "#64748B" },
      { name: "Red Rock / Whiskey Fire", hex: "#B91C1C" }
    ],
    cilindradas: {
      baja: [],
      media: [
        { model: "X 350 / X 440 Roadster", cc: 440, maxRpm: 7500, redlineRpm: 6500, category: "naked", tankL: 13.5 }
      ],
      alta: [
        { model: "Iron 883 / Nightster 975 Special", cc: 975, maxRpm: 9500, redlineRpm: 9000, category: "touring", tankL: 11.7 },
        { model: "Sportster S 1250 Revolution Max", cc: 1252, maxRpm: 9500, redlineRpm: 9000, category: "naked", tankL: 11.8 },
        { model: "Pan America 1250 Special", cc: 1252, maxRpm: 9500, redlineRpm: 9000, category: "adventure", tankL: 21.2 },
        { model: "Fat Boy 114 / Breakout 117", cc: 1923, maxRpm: 6000, redlineRpm: 5500, category: "touring", tankL: 18.9 },
        { model: "Street Glide / Road Glide 117 (2025)", cc: 1923, maxRpm: 6000, redlineRpm: 5500, category: "touring", tankL: 22.7 }
      ]
    }
  },

  Aprilia: {
    origin: "Italia • Noale Racing",
    colors: [
      { name: "Aprilia Racing Red / Purple", hex: "#DC2626" },
      { name: "Acid Gold", hex: "#EAB308" },
      { name: "Apex Black", hex: "#18181B" },
      { name: "Atreides Black / Green", hex: "#16A34A" }
    ],
    cilindradas: {
      baja: [
        { model: "SR GT 200 Replica", cc: 174, maxRpm: 9500, redlineRpm: 8500, category: "scooter", tankL: 9 }
      ],
      media: [
        { model: "RS 457 Twin (2025)", cc: 457, maxRpm: 11500, redlineRpm: 10500, category: "sport", tankL: 13 },
        { model: "RS 660 / RS 660 Extrema", cc: 659, maxRpm: 12000, redlineRpm: 11500, category: "sport", tankL: 15 },
        { model: "Tuono 660 Factory", cc: 659, maxRpm: 12000, redlineRpm: 11500, category: "naked", tankL: 15 },
        { model: "Tuareg 660 Rally", cc: 659, maxRpm: 10500, redlineRpm: 9500, category: "adventure", tankL: 18 }
      ],
      alta: [
        { model: "Tuono V4 Factory 1100", cc: 1077, maxRpm: 13000, redlineRpm: 12500, category: "naked", tankL: 17.9 },
        { model: "RSV4 Factory 1100", cc: 1099, maxRpm: 14500, redlineRpm: 13600, category: "sport", tankL: 17.9 }
      ]
    }
  },

  Benelli: {
    origin: "Italia • Pesaro (#1 Trail Italia/AR)",
    colors: [
      { name: "Benelli Verde Green", hex: "#16A34A" },
      { name: "TRK Adventure Grey / Red", hex: "#EF4444" },
      { name: "Dune Sea Sand", hex: "#F59E0B" },
      { name: "Jet Black", hex: "#18181B" }
    ],
    cilindradas: {
      baja: [
        { model: "TNT 150i / 180S", cc: 175.3, maxRpm: 10000, redlineRpm: 9000, category: "naked", tankL: 10 },
        { model: "251S / TRK 251", cc: 249, maxRpm: 10000, redlineRpm: 9200, category: "adventure", tankL: 18 }
      ],
      media: [
        { model: "302S / Tornado 302R", cc: 300, maxRpm: 12000, redlineRpm: 11000, category: "naked", tankL: 16 },
        { model: "Leoncino 500 Trail", cc: 500, maxRpm: 9500, redlineRpm: 8500, category: "naked", tankL: 12.7 },
        { model: "TRK 502 / TRK 502 X Adventure", cc: 500, maxRpm: 9500, redlineRpm: 8500, category: "adventure", tankL: 20 }
      ],
      alta: [
        { model: "TRK 702 / TRK 702 X (2025)", cc: 698, maxRpm: 9500, redlineRpm: 8800, category: "adventure", tankL: 20 },
        { model: "752S / Leoncino 800 Trail", cc: 754, maxRpm: 9500, redlineRpm: 8800, category: "naked", tankL: 14.5 }
      ]
    }
  }
};
