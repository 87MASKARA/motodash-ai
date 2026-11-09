/**
 * Catálogo Mundial de Motos Modernas (2024 - 2026)
 * Agrupadas por Marca y Rangos de Cilindrada:
 * - Baja: 125cc - 250cc
 * - Media: 300cc - 650cc
 * - Alta: 700cc - 1390cc
 */

export const MOTO_CATALOG = {
  Yamaha: {
    origin: "Japón",
    colors: [
      { name: "Icon Blue (Racing)", hex: "#0040C1" },
      { name: "Cyan Storm (Hyper Naked)", hex: "#00D2D3" },
      { name: "Tech Black (Midnight)", hex: "#18181B" },
      { name: "Midnight D’or", hex: "#EAB308" }
    ],
    cilindradas: {
      baja: [
        { model: "NMAX 155 Connected", cc: 155, maxRpm: 8500, redlineRpm: 8000, category: "scooter", tankL: 7.1 },
        { model: "MT-15 V2", cc: 155, maxRpm: 10500, redlineRpm: 10000, category: "naked", tankL: 10 },
        { model: "YZF-R15 V4", cc: 155, maxRpm: 11000, redlineRpm: 10500, category: "sport", tankL: 11 }
      ],
      media: [
        { model: "MT-03 (2025)", cc: 321, maxRpm: 12500, redlineRpm: 11500, category: "naked", tankL: 14 },
        { model: "YZF-R3 (2025)", cc: 321, maxRpm: 13000, redlineRpm: 12000, category: "sport", tankL: 14 },
        { model: "MT-07 (Gen 4)", cc: 689, maxRpm: 10500, redlineRpm: 9000, category: "naked", tankL: 14 },
        { model: "YZF-R7", cc: 689, maxRpm: 10500, redlineRpm: 9200, category: "sport", tankL: 13 }
      ],
      alta: [
        { model: "MT-09 SP (Gen 4 2025)", cc: 890, maxRpm: 11500, redlineRpm: 10500, category: "naked", tankL: 14 },
        { model: "Ténéré 700 World Raid", cc: 689, maxRpm: 9500, redlineRpm: 8800, category: "adventure", tankL: 23 },
        { model: "YZF-R1 (Crossplane)", cc: 998, maxRpm: 14500, redlineRpm: 13800, category: "sport", tankL: 17 }
      ]
    }
  },

  KTM: {
    origin: "Austria",
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
        { model: "390 Adventure SW", cc: 373, maxRpm: 10000, redlineRpm: 9000, category: "adventure", tankL: 14.5 }
      ],
      alta: [
        { model: "990 Duke (2025)", cc: 947, maxRpm: 10500, redlineRpm: 9800, category: "naked", tankL: 14.8 },
        { model: "890 Adventure R", cc: 889, maxRpm: 9500, redlineRpm: 8800, category: "adventure", tankL: 20 },
        { model: "1390 Super Duke R Evo (2025)", cc: 1350, maxRpm: 10500, redlineRpm: 9800, category: "naked", tankL: 17.5 }
      ]
    }
  },

  Kawasaki: {
    origin: "Japón",
    colors: [
      { name: "Lime Green Racing", hex: "#52C41A" },
      { name: "Metallic Diablo Black", hex: "#111111" },
      { name: "Pearl Robotic White", hex: "#E5E7EB" },
      { name: "Candy Steel Furnace Orange", hex: "#EA580C" }
    ],
    cilindradas: {
      baja: [
        { model: "KLX 230 S", cc: 233, maxRpm: 8500, redlineRpm: 8000, category: "adventure", tankL: 7.5 },
        { model: "Ninja 125", cc: 125, maxRpm: 11000, redlineRpm: 10000, category: "sport", tankL: 11 }
      ],
      media: [
        { model: "Ninja 500 (2025)", cc: 451, maxRpm: 11500, redlineRpm: 10500, category: "sport", tankL: 14 },
        { model: "Z500 SE", cc: 451, maxRpm: 11500, redlineRpm: 10500, category: "naked", tankL: 14 },
        { model: "Ninja ZX-4RR (4 Cilindros)", cc: 399, maxRpm: 16000, redlineRpm: 15000, category: "sport", tankL: 15 },
        { model: "Versys 650 LT", cc: 649, maxRpm: 9500, redlineRpm: 8500, category: "adventure", tankL: 21 }
      ],
      alta: [
        { model: "Ninja ZX-6R (636 2025)", cc: 636, maxRpm: 16000, redlineRpm: 15000, category: "sport", tankL: 17 },
        { model: "Z900 SE (2025)", cc: 948, maxRpm: 11500, redlineRpm: 10500, category: "naked", tankL: 17 },
        { model: "Ninja ZX-10R KRT", cc: 998, maxRpm: 14500, redlineRpm: 13800, category: "sport", tankL: 17 }
      ]
    }
  },

  Ducati: {
    origin: "Italia",
    colors: [
      { name: "Rosso Corsa (Rojo Pista)", hex: "#DC2626" },
      { name: "Dark Stealth (Negro Mate)", hex: "#171717" },
      { name: "Star White Silk", hex: "#FAFAFA" },
      { name: "Aviator Grey", hex: "#6B7280" }
    ],
    cilindradas: {
      baja: [
        { model: "Scrambler Icon (Next-Gen)", cc: 803, maxRpm: 9500, redlineRpm: 8500, category: "naked", tankL: 13.5 }
      ],
      media: [
        { model: "Hypermotard 698 Mono (2025)", cc: 659, maxRpm: 10250, redlineRpm: 9750, category: "sport", tankL: 12 },
        { model: "Monster 937 Plus", cc: 937, maxRpm: 10000, redlineRpm: 9250, category: "naked", tankL: 14 },
        { model: "DesertX Discovery", cc: 937, maxRpm: 9500, redlineRpm: 8800, category: "adventure", tankL: 21 }
      ],
      alta: [
        { model: "Panigale V4 S (2025 New Aero)", cc: 1103, maxRpm: 15500, redlineRpm: 14800, category: "sport", tankL: 17 },
        { model: "Streetfighter V2", cc: 955, maxRpm: 11500, redlineRpm: 10750, category: "naked", tankL: 16 },
        { model: "Multistrada V4 RS", cc: 1103, maxRpm: 13500, redlineRpm: 12500, category: "touring", tankL: 22 }
      ]
    }
  },

  Honda: {
    origin: "Japón",
    colors: [
      { name: "Grand Prix Red", hex: "#EF4444" },
      { name: "Matte Ballistic Black", hex: "#18181B" },
      { name: "Pearl Glare White", hex: "#FFFFFF" },
      { name: "Matte Jeans Blue", hex: "#1E3A8A" }
    ],
    cilindradas: {
      baja: [
        { model: "PCX 160 ABS", cc: 156, maxRpm: 8500, redlineRpm: 8000, category: "scooter", tankL: 8.1 },
        { model: "CB300F Twister", cc: 293.5, maxRpm: 8500, redlineRpm: 7500, category: "naked", tankL: 14.1 },
        { model: "XR 190L", cc: 184, maxRpm: 8500, redlineRpm: 8000, category: "adventure", tankL: 12 }
      ],
      media: [
        { model: "CB500 Hornet (2025)", cc: 471, maxRpm: 9500, redlineRpm: 8500, category: "naked", tankL: 17.1 },
        { model: "CBR650R E-Clutch (2025)", cc: 649, maxRpm: 13000, redlineRpm: 12000, category: "sport", tankL: 15.4 },
        { model: "XL750 Transalp", cc: 755, maxRpm: 10000, redlineRpm: 9200, category: "adventure", tankL: 16.9 }
      ],
      alta: [
        { model: "CBR1000RR-R Fireblade SP", cc: 1000, maxRpm: 15000, redlineRpm: 14500, category: "sport", tankL: 16.1 },
        { model: "CRF1100L Africa Twin Adventure Sports", cc: 1084, maxRpm: 8500, redlineRpm: 7800, category: "adventure", tankL: 24.8 },
        { model: "CB1000 Hornet SP (2025)", cc: 999, maxRpm: 12500, redlineRpm: 11500, category: "naked", tankL: 17 }
      ]
    }
  },

  BMW: {
    origin: "Alemania",
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
        { model: "F 900 R (2025)", cc: 895, maxRpm: 9500, redlineRpm: 8500, category: "naked", tankL: 13 },
        { model: "F 900 GS Enduro", cc: 895, maxRpm: 9500, redlineRpm: 8500, category: "adventure", tankL: 14.5 }
      ],
      alta: [
        { model: "S 1000 RR (M Package 2025)", cc: 999, maxRpm: 15000, redlineRpm: 14500, category: "sport", tankL: 16.5 },
        { model: "M 1000 R Hyper Naked", cc: 999, maxRpm: 15000, redlineRpm: 14500, category: "naked", tankL: 16.5 },
        { model: "R 1300 GS (Boxer 2025)", cc: 1300, maxRpm: 9000, redlineRpm: 8200, category: "adventure", tankL: 19 }
      ]
    }
  },

  Suzuki: {
    origin: "Japón",
    colors: [
      { name: "Triton Blue Metallic (MotoGP)", hex: "#2563EB" },
      { name: "Glass Sparkle Black", hex: "#171717" },
      { name: "Pearl Brilliant White", hex: "#FAFAFA" },
      { name: "Champion Yellow (RM-Z)", hex: "#EAB308" }
    ],
    cilindradas: {
      baja: [
        { model: "Gixxer 250 FI", cc: 249, maxRpm: 10000, redlineRpm: 9000, category: "naked", tankL: 12 },
        { model: "Gixxer SF 250", cc: 249, maxRpm: 10000, redlineRpm: 9000, category: "sport", tankL: 12 }
      ],
      media: [
        { model: "GSX-8S (2025)", cc: 776, maxRpm: 9500, redlineRpm: 8500, category: "naked", tankL: 14 },
        { model: "GSX-8R Aerodinámica (2025)", cc: 776, maxRpm: 9500, redlineRpm: 8500, category: "sport", tankL: 14 },
        { model: "V-Strom 800DE", cc: 776, maxRpm: 9500, redlineRpm: 8500, category: "adventure", tankL: 20 }
      ],
      alta: [
        { model: "GSX-S1000GX Crossover", cc: 999, maxRpm: 12000, redlineRpm: 11000, category: "touring", tankL: 19 },
        { model: "GSX-R1000R", cc: 999, maxRpm: 14500, redlineRpm: 13800, category: "sport", tankL: 16 },
        { model: "Hayabusa 25th Anniversary", cc: 1340, maxRpm: 11500, redlineRpm: 10500, category: "sport", tankL: 20 }
      ]
    }
  },

  Bajaj: {
    origin: "India",
    colors: [
      { name: "Pulsar Burnt Red", hex: "#B91C1C" },
      { name: "Plasma Blue", hex: "#1D4ED8" },
      { name: "Satin Titanium Black", hex: "#1F2937" },
      { name: "Savanna Green (Dominar)", hex: "#15803D" }
    ],
    cilindradas: {
      baja: [
        { model: "Pulsar N160 Dual ABS", cc: 164.8, maxRpm: 9500, redlineRpm: 8500, category: "naked", tankL: 14 },
        { model: "Pulsar NS200 UG (USD Forks)", cc: 199.5, maxRpm: 11000, redlineRpm: 9500, category: "naked", tankL: 12 }
      ],
      media: [
        { model: "Pulsar N250 (2025)", cc: 249, maxRpm: 9500, redlineRpm: 8500, category: "naked", tankL: 14 },
        { model: "Dominar 400 UG Touring", cc: 373.3, maxRpm: 9500, redlineRpm: 8500, category: "touring", tankL: 13 },
        { model: "Pulsar NS400Z (2025 Flagship)", cc: 373.3, maxRpm: 10000, redlineRpm: 9000, category: "naked", tankL: 12 }
      ],
      alta: []
    }
  },

  TVS: {
    origin: "India",
    colors: [
      { name: "Racing Red (TVS BTR)", hex: "#DC2626" },
      { name: "Lightning Black", hex: "#0F172A" },
      { name: "Fury Yellow", hex: "#EAB308" },
      { name: "Pearl White BTR", hex: "#FFFFFF" }
    ],
    cilindradas: {
      baja: [
        { model: "Apache RTR 160 4V FI", cc: 159.7, maxRpm: 10000, redlineRpm: 9000, category: "naked", tankL: 12 },
        { model: "Apache RTR 200 4V FI (Ride Modes)", cc: 197.75, maxRpm: 10500, redlineRpm: 9200, category: "naked", tankL: 12 }
      ],
      media: [
        { model: "Apache RR 310 BTR (Track)", cc: 312.2, maxRpm: 11000, redlineRpm: 9800, category: "sport", tankL: 11 },
        { model: "Apache RTR 310 Hyper Naked (2025)", cc: 312.2, maxRpm: 11000, redlineRpm: 9800, category: "naked", tankL: 11 }
      ],
      alta: []
    }
  }
};

