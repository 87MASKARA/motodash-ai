/**
 * Catálogo Oficial de Componentes de Desgaste y Mantenimiento Periódico
 * Basado en manuales de taller internacionales (Yamaha, KTM, Honda, Kawasaki, TVS, Ducati, Suzuki)
 */

export const CATEGORIAS_MANTENIMIENTO = {
  todas: { id: "todas", label: "Todos los Componentes" },
  motor: { id: "motor", label: "Motor & Filtros" },
  frenos: { id: "frenos", label: "Frenos & Suspensión" },
  transmision: { id: "transmision", label: "Transmisión & Cadena" },
  llantas: { id: "llantas", label: "Llantas & Neumáticos" },
};

export const COMPONENTES_DESGASTE_OFICIALES = {
  aceite_motor: {
    id: "aceite_motor",
    label: "Aceite de Motor Sintético",
    shortLabel: "Aceite Motor",
    intervalo: 4000,
    alertaPreventivaKm: 300,
    costoSugerido: 85000,
    categoria: "motor",
    impacto: "Protege pistón, cilindro y embrague de la fricción térmica severa. Reemplazo vital según manual.",
    icono: "Droplet",
    especificacion: "Sintético JASO MA2 / API SN"
  },
  filtro_aceite: {
    id: "filtro_aceite",
    label: "Filtro de Aceite & Tamiz",
    shortLabel: "Filtro Aceite",
    intervalo: 4000,
    alertaPreventivaKm: 300,
    costoSugerido: 22000,
    categoria: "motor",
    impacto: "Retiene micropartículas metálicas del desprendimiento del embrague y limalla del motor.",
    icono: "Filter",
    especificacion: "Elemento de papel microporoso"
  },
  cadena_lubricacion: {
    id: "cadena_lubricacion",
    label: "Tensión y Lubricación de Cadena",
    shortLabel: "Cadena (Holgura)",
    intervalo: 800,
    alertaPreventivaKm: 100,
    costoSugerido: 12000,
    categoria: "transmision",
    impacto: "Mantener holgura oficial (20-25 mm). Evita tirones, latigazos y rotura peligrosa en carretera.",
    icono: "Link",
    especificacion: "Holgura libre 20 - 25 mm"
  },
  filtro_aire: {
    id: "filtro_aire",
    label: "Filtro de Aire (Elemento de Inyección)",
    shortLabel: "Filtro Aire",
    intervalo: 10000,
    alertaPreventivaKm: 1000,
    costoSugerido: 45000,
    categoria: "motor",
    impacto: "El polvo urbano satura el papel. Si se tapa, ahoga la inyección FI y eleva el consumo de combustible.",
    icono: "Wind",
    especificacion: "Filtro de papel plisado viscoso"
  },
  bujia_encendido: {
    id: "bujia_encendido",
    label: "Bujía(s) de Iridio / Láser",
    shortLabel: "Bujía Iridio",
    intervalo: 12000,
    alertaPreventivaKm: 1000,
    costoSugerido: 40000,
    categoria: "motor",
    impacto: "Garantiza chispa exacta y combustión limpia. Calibración entre 0.7 y 0.9 mm.",
    icono: "Flame",
    especificacion: "Calibración 0.7 - 0.9 mm"
  },
  pastillas_delanteras: {
    id: "pastillas_delanteras",
    label: "Pastillas de Freno Delanteras",
    shortLabel: "Pastillas Del.",
    intervalo: 6500,
    alertaPreventivaKm: 500,
    costoSugerido: 65000,
    categoria: "frenos",
    impacto: "Seguridad activa primaria. Monitorear ranura testigo para evitar rayar el disco delantero.",
    icono: "Disc",
    especificacion: "Sinterizadas de alto coeficiente"
  },
  pastillas_traseras: {
    id: "pastillas_traseras",
    label: "Pastillas de Freno Traseras",
    shortLabel: "Pastillas Tras.",
    intervalo: 7500,
    alertaPreventivaKm: 500,
    costoSugerido: 55000,
    categoria: "frenos",
    impacto: "Equilibrio en frenada de emergencia y control de curva.",
    icono: "Disc",
    especificacion: "Semimetálicas / Sinterizadas"
  },
  liquido_frenos: {
    id: "liquido_frenos",
    label: "Líquido de Frenos DOT 4 (Reemplazo Total)",
    shortLabel: "Líquido DOT 4",
    intervalo: 20000,
    alertaPreventivaKm: 1000,
    costoSugerido: 35000,
    categoria: "frenos",
    impacto: "El líquido absorbe humedad con el tiempo. El purgado evita pérdida de presión y leva esponjosa.",
    icono: "Beaker",
    especificacion: "Punto ebullición seco > 230°C"
  },
  llanta_trasera: {
    id: "llanta_trasera",
    label: "Llanta Trasera (Tracción & Labrado TWI)",
    shortLabel: "Llanta Trasera",
    intervalo: 16000,
    alertaPreventivaKm: 1000,
    costoSugerido: 280000,
    categoria: "llantas",
    impacto: "Soporta el torque, peso y aceleración. Revisar testigos TWI de profundidad de ranura (mínimo 1.6 mm).",
    icono: "CircleDot",
    especificacion: "Presión: 28 psi solo / 32 psi con acompañante"
  },
  llanta_delantera: {
    id: "llanta_delantera",
    label: "Llanta Delantera (Dirección & Frenada)",
    shortLabel: "Llanta Delantera",
    intervalo: 20000,
    alertaPreventivaKm: 1000,
    costoSugerido: 210000,
    categoria: "llantas",
    impacto: "Clave para frenadas de emergencia sin bloqueo y agarre en inclinaciones en mojado.",
    icono: "CircleDot",
    especificacion: "Presión: 25 - 28 psi según manual"
  },
  kit_arrastre: {
    id: "kit_arrastre",
    label: "Kit de Arrastre Completo (Cadena, Corona y Piñón)",
    shortLabel: "Kit de Arrastre",
    intervalo: 18000,
    alertaPreventivaKm: 1000,
    costoSugerido: 220000,
    categoria: "transmision",
    impacto: "Los dientes del piñón y corona se afilan por el desgaste. Debe cambiarse el conjunto completo.",
    icono: "Cog",
    especificacion: "Paso 520 / 525 reforzado con O-Ring"
  },
  cauchos_sprocket: {
    id: "cauchos_sprocket",
    label: "Cauchos Porta-Sprocket (Dampers de Rueda)",
    shortLabel: "Cauchos Sprocket",
    intervalo: 12000,
    alertaPreventivaKm: 1000,
    costoSugerido: 45000,
    categoria: "transmision",
    impacto: "Amortiguan el impacto del cambio de marchas al soltar el embrague hacia la rueda trasera.",
    icono: "Layers",
    especificacion: "Goma de alta densidad anti-impacto"
  },
  guaya_embrague: {
    id: "guaya_embrague",
    label: "Guaya de Embrague / Clutch",
    shortLabel: "Guaya Embrague",
    intervalo: 14000,
    alertaPreventivaKm: 1000,
    costoSugerido: 32000,
    categoria: "transmision",
    impacto: "Ajustar juego libre en maneta (8 - 12 mm). Evita patinamiento prematuro de discos de embrague.",
    icono: "GitCommit",
    especificacion: "Juego libre 8 - 12 mm"
  },
  aceite_suspension: {
    id: "aceite_suspension",
    label: "Aceite de Suspensión Delantera (Barras Horquilla)",
    shortLabel: "Aceite Barras",
    intervalo: 20000,
    alertaPreventivaKm: 1000,
    costoSugerido: 95000,
    categoria: "frenos",
    impacto: "Reemplazo de fluido hidráulico de horquillas y retenes. Evita rebotes inestables en frenada.",
    icono: "Activity",
    especificacion: "Aceite para horquillas SAE 10W / 15W"
  },
  cunas_direccion: {
    id: "cunas_direccion",
    label: "Cunas y Rodamientos de Dirección",
    shortLabel: "Cunas Dirección",
    intervalo: 20000,
    alertaPreventivaKm: 1000,
    costoSugerido: 85000,
    categoria: "frenos",
    impacto: "Limpieza, engrase con grasa de litio y ajuste de pista cónica. Elimina juego en el manillar.",
    icono: "Crosshair",
    especificacion: "Rodamientos cónicos sellados"
  },
  refrigerante: {
    id: "refrigerante",
    label: "Líquido Refrigerante / Coolant",
    shortLabel: "Refrigerante",
    intervalo: 20000,
    alertaPreventivaKm: 1000,
    costoSugerido: 45000,
    categoria: "motor",
    impacto: "Evita cavitación de bomba de agua y ebullición del motor en tráfico denso.",
    icono: "Droplets",
    especificacion: "Etilenglicol 50/50 anti-ebullición"
  },
  calibracion_valvulas: {
    id: "calibracion_valvulas",
    label: "Calibración de Holgura de Válvulas",
    shortLabel: "Válvulas (Galgas)",
    intervalo: 15000,
    alertaPreventivaKm: 1000,
    costoSugerido: 70000,
    categoria: "motor",
    impacto: "Inspección de holgura de admisión y escape con galgas. Previene pérdida de compresión y sobrecalentamiento.",
    icono: "Wrench",
    especificacion: "Ajuste milimétrico con motor en frío"
  }
};

