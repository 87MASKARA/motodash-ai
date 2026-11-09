/**
 * Catálogo Oficial de Políticas de Garantía por Marca y Ensambladora
 * Incorpora los datos oficiales y manuales de taller de:
 * TVS Auteco Dismerca (Apache RTR 160/200/310), Incolmotos Yamaha, KTM, etc.
 */

export const CHECKLIST_DIARIO_ITEMS = [
  { id: "aceite", label: "Nivel de Aceite Motor", detalle: "Varilla entre mín y máx con la moto en soporte central sobre piso plano", icono: "Droplet" },
  { id: "presion_llantas", label: "Presión de Llantas en Frío", detalle: "Delantera: 25 psi | Trasera: 28 psi (solo) o 32 psi (con carga/pasajero)", icono: "CircleDot" },
  { id: "frenos", label: "Frenos Delantero & Trasero", detalle: "Nivel de líquido en visor y tacto firme sin esponjosidad", icono: "Disc" },
  { id: "cadena", label: "Cadena de Transmisión", detalle: "Holgura correcta de 20 a 25 mm y lubricación adecuada", icono: "Link" },
  { id: "combustible", label: "Nivel de Gasolina", detalle: "Suficiente para la jornada (no llenar por encima del cuello del tanque)", icono: "Fuel" },
  { id: "luces_pito", label: "Luces, DRL & Pito", detalle: "Funcionamiento de farola proyector LED, stop, direccionales y doble bocina", icono: "Sun" },
  { id: "acelerador_embrague", label: "Mandos & Guayas", detalle: "Juego libre del acelerador: 2-3 mm | Juego libre de leva embrague: 8-13 mm", icono: "GitCommit" },
  { id: "espejos", label: "Espejos Retrovisores", detalle: "Correcta orientación y visibilidad sin vibraciones", icono: "Eye" },
];

export const OFFICIAL_WARRANTY_POLICIES = {
  // TVS / AUTECO (Apache RTR 160, 200, RR 310, Ronin, Ntorq)
  TVS: {
    distribuidor: "AUTECO / DISMERCA",
    distribuidorCorto: "Dismerca",
    mesesGarantia: 36,
    kmGarantia: 36000,
    toleranciaKm: 100,
    toleranciaDias: 15,
    descripcionReglas: "Tolerancia estricta de +/- 100 km o 15 días calendario. No modificar cableado eléctrico ni instalar accesorios no homologados.",
    reglasDeOro: [
      {
        id: "tolerancia_kilometraje",
        titulo: "Respetar la Ventana de Kilometraje (+/- 100 KM)",
        nivel: "critico",
        detalle: "Dismerca establece que la moto debe ingresar desde 100 km antes o hasta 100 km después de cada revisión oficial. Pasarse o faltar a una revisión invalida automáticamente la garantía sobre las piezas intervenidas."
      },
      {
        id: "lavado_presion",
        titulo: "Prohibido Lavar con Agua a Presión o Vapor",
        nivel: "critico",
        detalle: "El manual prohíbe lavar la moto con hidrolavadoras de alta presión, con vapor o estando el motor caliente. Esto daña sellos eléctricos, el módulo ABS (HECU) y rodamientos, exonerando a Auteco de garantía."
      },
      {
        id: "modificaciones_electricas",
        titulo: "Cero Modificaciones Eléctricas o al Motor",
        nivel: "critico",
        detalle: "No instales alarmas, GPS con corte de corriente no homologado, luces exploradoras sin arnés certificado ni cortes de cables. Cualquier alteración eléctrica o al motor anula la garantía de fábrica."
      },
      {
        id: "aceite_especificado",
        titulo: "Uso Exclusivo de Aceite TVS Tru4 SYNTHETIC 10W30 (1.2L)",
        nivel: "critico",
        detalle: "Debe cumplir estrictamente la norma API-SL y JASO MA2 Sintético con capacidad de 1.200 ml. Usar aceites minerales, de viscosidad no aprobada (ej. 20W50) o no cambiar el filtro de aceite causa desgaste prematuro sin cobertura."
      },
      {
        id: "despegue_inicial",
        titulo: "Despegue durante los Primeros 1.000 KM",
        nivel: "advertencia",
        detalle: "Velocidad máxima recomendada de 50 km/h durante los primeros 1.000 km. Calentar el motor por al menos 1 minuto en ralentí antes de arrancar y bombear la leva de embrague 3 veces para lubricar discos."
      },
      {
        id: "garantias_reducidas",
        titulo: "Garantía de Batería, Llantas y Accesorios (6 meses / 6.000 KM)",
        nivel: "info",
        detalle: "La batería, llantas, bombillería y accesorios de fábrica cuentan únicamente con 6 meses o 6.000 km de garantía legal, sin cobertura suplementaria."
      },
      {
        id: "partes_desgaste",
        titulo: "Exclusiones Taxativas por Desgaste Natural",
        nivel: "info",
        detalle: "No están cubiertas por garantía las partes de desgaste natural: bujías, pastillas de freno, kit de arrastre (cadena/sprocket/piñón), discos de embrague, guayas, filtros, cunas de dirección y lubricantes."
      }
    ],
    revisiones: [
      {
        numero: 1,
        km: 1000,
        manoDeObra: "GRATIS",
        tiempoEstHoras: 1.5,
        descripcion: "1ª Revisión (1.000 KM) • Fin del período de despegue",
        descripcionManoObra: "Servicio GRATUITO de mano de obra (usuario solo paga aceite TVS 10W30 e insumos)",
        chequeos: [
          "Cambio obligatorio de aceite de motor TVS Tru4 SYNTHETIC 10W30 (1.200 ml)",
          "Limpieza de tamiz y cambio de filtro de aceite de papel",
          "Verificación y calibración de holgura de válvulas de motor",
          "Limpieza e inspección de bujía (tolerancia 0.7 - 0.9 mm)",
          "Limpieza y revisión de elemento de filtro de aire",
          "Limpieza, lubricación y ajuste de tensión de cadena (holgura 20-25 mm)",
          "Revisión y calibración de frenos (delantero 270mm / trasero 240mm)",
          "Verificación de presión de llantas (25 psi del / 28 psi tras) y apriete de rines",
          "Verificación de dirección suave y apriete de tornillería general",
          "Ajuste de guayas (embrague 8-13mm, acelerador 2-3mm) y ralentí 1300-1700 rpm",
          "Reinicio de la llave indicadora de servicio en tablero TFT"
        ],
        cambiosObligatorios: ["Aceite TVS Tru4 10W30 (1.2L)", "Filtro de Aceite"]
      },
      {
        numero: 2,
        km: 5000,
        manoDeObra: "GRATIS",
        tiempoEstHoras: 1.5,
        descripcion: "2ª Revisión (5.000 KM) • Consolidación de tren motriz",
        descripcionManoObra: "Servicio GRATUITO de mano de obra (usuario solo paga aceite e insumos)",
        chequeos: [
          "Cambio de aceite TVS Tru4 SYNTHETIC 10W30 (1.200 ml)",
          "Limpieza de tamiz y cambio de filtro de aceite",
          "Calibración e inspección de válvulas",
          "Limpieza del filtro de aire y revisión de bujía",
          "Limpieza, lubricación y tensión de cadena (20-25 mm)",
          "Revisión de pastillas de freno y nivel de líquido",
          "Inspección de guayas, ralentí, batería y apriete de tornillos",
          "Reinicio de la llave de servicio en tablero TFT"
        ],
        cambiosObligatorios: ["Aceite TVS Tru4 10W30 (1.2L)", "Filtro de Aceite"]
      },
      {
        numero: 3,
        km: 10000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2.0,
        descripcion: "3ª Revisión (10.000 KM) • Cambio de afinación y cauchos",
        descripcionManoObra: "Revisión pagada por el usuario (aceite, filtros, repuestos de desgaste y mano de obra)",
        chequeos: [
          "Reemplazo OBLIGATORIO de bujía (BOSCH UR4KE / CHAMPION RG8MC5)",
          "Reemplazo OBLIGATORIO de filtro de aire",
          "Reemplazo OBLIGATORIO de cauchos del sprocket de rueda trasera",
          "Desmontar y reemplazar pastillas de frenos si están en límite",
          "Cambio de aceite de motor TVS Tru4 10W30 y filtro de aceite",
          "Calibración de holgura de válvulas",
          "Tensión y lubricación de cadena de transmisión",
          "Inspección de guayas, dirección y reapriete de tornillería",
          "Reinicio de llave indicadora de servicio"
        ],
        cambiosObligatorios: ["Bujía", "Filtro de Aire", "Cauchos Sprocket", "Aceite TVS Tru4 10W30", "Filtro de Aceite"]
      },
      {
        numero: 4,
        km: 15000,
        manoDeObra: "GRATIS",
        tiempoEstHoras: 1.5,
        descripcion: "4ª Revisión (15.000 KM) • Mano de obra GRATIS por fidelidad",
        descripcionManoObra: "Servicio GRATUITO de mano de obra (si asistió oportunamente a todas las anteriores)",
        chequeos: [
          "¡Beneficio Auteco!: Mano de obra gratuita por cumplimiento de revisiones previas",
          "Cambio de aceite de motor 10W30 y filtro de aceite",
          "Calibración y verificación de válvulas",
          "Revisión de tubos y mangueras del enfriador de aceite",
          "Limpieza de filtro de aire y revisión de cadena",
          "Inspección de desgaste del kit de arrastre (piñón, sprocket y cadena)",
          "Revisión de frenos, dirección y reinicio de llave en tablero"
        ],
        cambiosObligatorios: ["Aceite TVS Tru4 10W30 (1.2L)", "Filtro de Aceite"]
      },
      {
        numero: 5,
        km: 20000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 3.0,
        descripcion: "5ª Revisión (20.000 KM) • Gran Servicio Mayor de Barras & Líquidos",
        descripcionManoObra: "Revisión mayor pagada por el usuario (tiempo taller aprox 3 horas)",
        chequeos: [
          "Cambio OBLIGATORIO de líquido de frenos (DOT 4 del/tras)",
          "Cambio OBLIGATORIO de aceite de suspensión invertida (340cc izq / 390cc der)",
          "Limpieza, lubricación y ajuste de cunas de dirección",
          "Reemplazo de bujía y filtro de aire",
          "Reemplazo de cauchos del sprocket y pastillas de freno",
          "Revisión/reemplazo de discos de embrague y mangueras de combustible",
          "Cambio de aceite 10W30, filtro de aceite y calibración de válvulas",
          "Reinicio de indicador de mantenimiento"
        ],
        cambiosObligatorios: ["Líquido Frenos DOT 4", "Aceite Suspensión (340/390cc)", "Bujía", "Filtro Aire", "Cauchos Sprocket", "Aceite 10W30", "Filtro Aceite"]
      },
      {
        numero: 6,
        km: 25000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 1.0,
        descripcion: "6ª Revisión (25.000 KM) • Control de inyección & combustible",
        descripcionManoObra: "Revisión pagada por el usuario (tiempo taller aprox 1 hora)",
        chequeos: [
          "Revisión y reemplazo de filtro de gasolina y abrazaderas (24.000 - 25.000 km)",
          "Cambio de aceite de motor y filtro de aceite",
          "Calibración de válvulas y ralentí",
          "Limpieza de filtro de aire y tensión de cadena",
          "Inspección de desgaste de llantas y rodamientos",
          "Reinicio de llave de mantenimiento en tablero"
        ],
        cambiosObligatorios: ["Filtro de Gasolina", "Aceite TVS Tru4 10W30", "Filtro de Aceite"]
      },
      {
        numero: 7,
        km: 30000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2.0,
        descripcion: "7ª Revisión (30.000 KM) • Reemplazo cauchos HECU ABS & afinación",
        descripcionManoObra: "Revisión pagada por el usuario (tiempo taller aprox 2 horas)",
        chequeos: [
          "Reemplazo OBLIGATORIO de cauchos de montaje del módulo ABS (HECU)",
          "Reemplazo de bujía de ignición y filtro de aire",
          "Reemplazo de cauchos del sprocket y pastillas de freno",
          "Cambio de aceite de motor y filtro de aceite",
          "Calibración de válvulas y chequeo del sistema eléctrico/inyección",
          "Reinicio de indicador de mantenimiento"
        ],
        cambiosObligatorios: ["Cauchos Montaje HECU ABS", "Bujía", "Filtro Aire", "Cauchos Sprocket", "Aceite 10W30", "Filtro Aceite"]
      },
      {
        numero: 8,
        km: 35000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 1.0,
        descripcion: "8ª Revisión (35.000 KM) • Cierre de ciclo de garantía 36k km",
        descripcionManoObra: "Revisión pagada por el usuario (tiempo taller aprox 1 hora)",
        chequeos: [
          "Última revisión obligatoria del ciclo de garantía suplementaria de 36.000 km",
          "Cambio de aceite de motor y filtro de aceite",
          "Calibración e inspección de válvulas",
          "Revisión integral de seguridad: chasis, rodamientos basculante, frenos",
          "Diagnóstico computarizado por escáner de la ECU de inyección",
          "Reinicio de testigo en odómetro"
        ],
        cambiosObligatorios: ["Aceite TVS Tru4 10W30", "Filtro de Aceite"]
      }
    ]
  },

  // YAMAHA (Incolmotos Yamaha)
  YAMAHA: {
    distribuidor: "INCOLMOTOS YAMAHA",
    distribuidorCorto: "Incolmotos",
    mesesGarantia: 24,
    kmGarantia: 24000,
    toleranciaKm: 200,
    toleranciaDias: 20,
    descripcionReglas: "Tolerancia de +/- 200 km. Utilizar lubricante Yamalube oficial y registrar revisiones en la red autorizada.",
    reglasDeOro: [
      {
        id: "tolerancia_yamaha",
        titulo: "Ventana de Tolerancia (+/- 200 KM)",
        nivel: "critico",
        detalle: "Ingresar dentro del margen establecido de +/- 200 km en cada revisión periódica."
      },
      {
        id: "lubricante_yamalube",
        titulo: "Uso Exclusivo de Aceite Yamalube 4T",
        nivel: "critico",
        detalle: "Uso exclusivo de lubricante Yamalube certificado por fábrica para no perder la garantía del motor."
      },
      {
        id: "sellado_ecu",
        titulo: "Mantener Sellada la ECU y Arnés Original",
        nivel: "critico",
        detalle: "No instalar dispositivos que alteren las RPM o el corte de encendido."
      }
    ],
    revisiones: [
      {
        numero: 1,
        km: 1000,
        manoDeObra: "GRATIS",
        tiempoEstHoras: 1.5,
        descripcion: "1ª Revisión (1.000 KM) • Rodaje inicial y cambio Yamalube",
        descripcionManoObra: "Mano de obra gratuita de asentamiento de motor",
        chequeos: ["Cambio de aceite Yamalube", "Cambio filtro de aceite", "Torque general de pernos", "Ajuste de embrague y acelerador"],
        cambiosObligatorios: ["Aceite Yamalube 4T", "Filtro de Aceite"]
      },
      {
        numero: 2,
        km: 5000,
        manoDeObra: "GRATIS",
        tiempoEstHoras: 1.5,
        descripcion: "2ª Revisión (5.000 KM) • Consolidación y frenos",
        descripcionManoObra: "Mano de obra gratuita",
        chequeos: ["Cambio aceite Yamalube", "Chequeo bujía", "Inspección de pastillas de freno", "Lubricación de cadena"],
        cambiosObligatorios: ["Aceite Yamalube 4T"]
      },
      {
        numero: 3,
        km: 10000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2.0,
        descripcion: "3ª Revisión (10.000 KM) • Servicio intermedio y bujía",
        descripcionManoObra: "Revisión pagada",
        chequeos: ["Cambio aceite y filtro", "Reemplazo de bujía", "Reemplazo filtro de aire", "Diagnóstico con herramienta YDT"],
        cambiosObligatorios: ["Bujía", "Filtro de Aire", "Aceite Yamalube", "Filtro de Aceite"]
      },
      {
        numero: 4,
        km: 15000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2.0,
        descripcion: "4ª Revisión (15.000 KM) • Mantenimiento de transmisión",
        descripcionManoObra: "Revisión pagada",
        chequeos: ["Cambio aceite", "Purgado líquido de frenos DOT 4", "Inspección kit de arrastre"],
        cambiosObligatorios: ["Aceite Yamalube", "Líquido Frenos DOT 4"]
      },
      {
        numero: 5,
        km: 20000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2.5,
        descripcion: "5ª Revisión (20.000 KM) • Servicio mayor y cierre",
        descripcionManoObra: "Revisión mayor de garantía",
        chequeos: ["Inspección holgura de válvulas", "Cambio bujía", "Revisión completa de chasis y suspensión"],
        cambiosObligatorios: ["Bujía", "Filtro Aire", "Aceite Yamalube", "Filtro Aceite"]
      }
    ]
  },

  // KTM (Auteco SAS / Ready To Race)
  KTM: {
    distribuidor: "AUTECO SAS / KTM FACTORY",
    distribuidorCorto: "KTM Service",
    mesesGarantia: 24,
    kmGarantia: 24000,
    toleranciaKm: 250,
    toleranciaDias: 20,
    descripcionReglas: "Tolerancia de +/- 250 km. Uso mandatorio de aceite Motorex y diagnóstico mediante KTM XC-2.",
    reglasDeOro: [
      {
        id: "motorex_obligatorio",
        titulo: "Uso Mandatorio de Aceite Motorex Formula 4T",
        nivel: "critico",
        detalle: "KTM exige lubricantes Motorex 15W-50 con certificación oficial en cada revisión."
      },
      {
        id: "actualizaciones_xc2",
        titulo: "Conexión a Scanner Oficial KTM XC-2",
        nivel: "critico",
        detalle: "Validación y carga de mapas oficiales sin alterar el software del sensor de oxígeno."
      }
    ],
    revisiones: [
      {
        numero: 1,
        km: 1000,
        manoDeObra: "GRATIS",
        tiempoEstHoras: 1.5,
        descripcion: "1ª Revisión (1.000 KM) • Rodaje KTM & Desbloqueo RPM",
        descripcionManoObra: "Mano de obra gratis",
        chequeos: ["Cambio aceite Motorex", "Filtro de aceite y tamices", "Revisión juego libre de embrague", "Lectura de códigos KTM XC-2"],
        cambiosObligatorios: ["Aceite Motorex 15W-50", "Filtro Aceite KTM"]
      },
      {
        numero: 2,
        km: 7500,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2.0,
        descripcion: "2ª Revisión (7.500 KM) • Servicio intermedio Motorex",
        descripcionManoObra: "Revisión pagada",
        chequeos: ["Cambio aceite Motorex", "Filtro de aire", "Inspección de pastillas y discos", "Revisión de holgura de cadena"],
        cambiosObligatorios: ["Aceite Motorex 15W-50", "Filtro Aceite", "Filtro Aire"]
      },
      {
        numero: 3,
        km: 15000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 3.0,
        descripcion: "3ª Revisión (15.000 KM) • Servicio mayor y válvulas",
        descripcionManoObra: "Servicio mayor pagado",
        chequeos: ["Comprobación juego de válvulas", "Cambio de bujía", "Reemplazo líquido de frenos", "Inspección suspensión WP"],
        cambiosObligatorios: ["Bujía Iridium", "Líquido Frenos DOT 4", "Aceite Motorex", "Filtro Aceite"]
      },
      {
        numero: 4,
        km: 22500,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2.0,
        descripcion: "4ª Revisión (22.500 KM) • Diagnóstico final de garantía",
        descripcionManoObra: "Cierre de garantía",
        chequeos: ["Cambio de aceite Motorex", "Inspección integral de chasis y basculante"],
        cambiosObligatorios: ["Aceite Motorex 15W-50", "Filtro Aceite"]
      }
    ]
  },

  // BAJAJ (Grupo UMA - Pulsar, Dominar)
  BAJAJ: {
    distribuidor: "GRUPO UMA / BAJAJ",
    distribuidorCorto: "Grupo UMA",
    mesesGarantia: 12,
    kmGarantia: 20000,
    toleranciaKm: 150,
    toleranciaDias: 15,
    descripcionReglas: "Tolerancia de +/- 150 km. Revisiones a los 500 km, 5.000 km, 10.000 km, 15.000 km y 20.000 km.",
    reglasDeOro: [
      {
        id: "tolerancia_uma",
        titulo: "Ventana Estricta de +/- 150 KM",
        nivel: "critico",
        detalle: "Ingresar al taller dentro de la ventana de 150 km."
      }
    ],
    revisiones: [
      {
        numero: 1,
        km: 500,
        manoDeObra: "GRATIS",
        tiempoEstHoras: 1.5,
        descripcion: "1ª Revisión (500 KM) • Asentamiento inicial",
        descripcionManoObra: "Mano de obra gratis",
        chequeos: ["Cambio aceite", "Limpieza filtro tamiz", "Calibración de juego de válvulas", "Torque de tuercas de culata"],
        cambiosObligatorios: ["Aceite Bajaj DTS-i 20W-50", "Filtro Aceite"]
      },
      {
        numero: 2,
        km: 5000,
        manoDeObra: "GRATIS",
        tiempoEstHoras: 1.5,
        descripcion: "2ª Revisión (5.000 KM) • Mantenimiento preventivo",
        descripcionManoObra: "Mano de obra gratis",
        chequeos: ["Cambio de aceite y filtro", "Limpieza de bujías", "Ajuste de cadena"],
        cambiosObligatorios: ["Aceite Bajaj DTS-i"]
      },
      {
        numero: 3,
        km: 10000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2.0,
        descripcion: "3ª Revisión (10.000 KM) • Afinación general",
        descripcionManoObra: "Revisión pagada",
        chequeos: ["Cambio de aceite", "Reemplazo de bujías", "Reemplazo de filtro de aire"],
        cambiosObligatorios: ["Bujías DTS-i (3 unidades)", "Filtro Aire", "Aceite"]
      },
      {
        numero: 4,
        km: 15000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2.0,
        descripcion: "4ª Revisión (15.000 KM) • Frenos y fluidos",
        descripcionManoObra: "Revisión pagada",
        chequeos: ["Cambio de aceite", "Pastillas de freno", "Líquido de frenos"],
        cambiosObligatorios: ["Aceite", "Líquido Frenos"]
      },
      {
        numero: 5,
        km: 20000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2.5,
        descripcion: "5ª Revisión (20.000 KM) • Cierre de garantía",
        descripcionManoObra: "Cierre de garantía UMA",
        chequeos: ["Calibración de válvulas", "Diagnóstico integral", "Revisión de kit de arrastre"],
        cambiosObligatorios: ["Aceite", "Filtros"]
      }
    ]
  },

  // HONDA (Fanalca Honda)
  HONDA: {
    distribuidor: "HONDA FANALCA",
    distribuidorCorto: "Fanalca",
    mesesGarantia: 12,
    kmGarantia: 20000,
    toleranciaKm: 200,
    toleranciaDias: 15,
    descripcionReglas: "Tolerancia de +/- 200 km. Revisiones cada 4.000 km tras el primer servicio de los 1.000 km.",
    reglasDeOro: [
      {
        id: "aceite_honda_pro",
        titulo: "Uso de Aceite Honda Pro 10W-30",
        nivel: "critico",
        detalle: "Cumplimiento del lubricante oficial Honda Pro 10W-30."
      }
    ],
    revisiones: [
      {
        numero: 1,
        km: 1000,
        manoDeObra: "GRATIS",
        tiempoEstHoras: 1.5,
        descripcion: "1ª Revisión (1.000 KM) • Cambio de aceite y ajuste",
        descripcionManoObra: "Mano de obra gratis",
        chequeos: ["Cambio aceite Honda", "Ajuste de válvulas", "Limpieza tamiz centrífugo", "Tensión cadena"],
        cambiosObligatorios: ["Aceite Honda Pro 10W-30"]
      },
      {
        numero: 2,
        km: 4000,
        manoDeObra: "GRATIS",
        tiempoEstHoras: 1.5,
        descripcion: "2ª Revisión (4.000 KM) • Preventivo e inspección",
        descripcionManoObra: "Mano de obra gratis",
        chequeos: ["Cambio aceite", "Inspección de bujía", "Revisión de frenos"],
        cambiosObligatorios: ["Aceite Honda Pro 10W-30"]
      },
      {
        numero: 3,
        km: 8000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2.0,
        descripcion: "3ª Revisión (8.000 KM) • Afinación y bujía",
        descripcionManoObra: "Revisión pagada",
        chequeos: ["Cambio aceite", "Reemplazo de bujía", "Limpieza de filtro de aire"],
        cambiosObligatorios: ["Bujía", "Aceite"]
      },
      {
        numero: 4,
        km: 12000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2.0,
        descripcion: "4ª Revisión (12.000 KM) • Servicio intermedio",
        descripcionManoObra: "Revisión pagada",
        chequeos: ["Cambio aceite", "Líquido de frenos", "Inspección de embrague"],
        cambiosObligatorios: ["Aceite", "Filtro Aire"]
      },
      {
        numero: 5,
        km: 16000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2.0,
        descripcion: "5ª Revisión (16.000 KM) • Mantenimiento integral",
        descripcionManoObra: "Revisión pagada",
        chequeos: ["Cambio aceite", "Inspección de kit de arrastre", "Bujía"],
        cambiosObligatorios: ["Aceite", "Bujía"]
      },
      {
        numero: 6,
        km: 20000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2.5,
        descripcion: "6ª Revisión (20.000 KM) • Cierre de garantía oficial",
        descripcionManoObra: "Cierre de garantía Fanalca",
        chequeos: ["Inspección válvulas", "Prueba con scanner HDS", "Revisión final de garantía"],
        cambiosObligatorios: ["Aceite", "Filtros"]
      }
    ]
  },

  // BMW MOTORRAD (Autogermana)
  BMW: {
    distribuidor: "AUTOGERMANA / BMW MOTORRAD",
    distribuidorCorto: "BMW Motorrad",
    mesesGarantia: 36,
    kmGarantia: 999999,
    toleranciaKm: 500,
    toleranciaDias: 30,
    descripcionReglas: "Garantía de 36 meses sin límite de kilometraje. Revisiones anuales o cada 10.000 km.",
    reglasDeOro: [
      {
        id: "bmw_advantec",
        titulo: "Aceite Oficial BMW Advantec Ultimate",
        nivel: "critico",
        detalle: "Lubricante oficial de fábrica certificado."
      }
    ],
    revisiones: [
      {
        numero: 1,
        km: 1000,
        manoDeObra: "GRATIS",
        tiempoEstHoras: 1.5,
        descripcion: "1ª Revisión (1.000 KM) • Rodaje oficial y desbloqueo",
        descripcionManoObra: "Servicio de rodaje inicial",
        chequeos: ["Cambio aceite Advantec", "Cambio filtro", "Actualización software BMW", "Chequeo de pernos"],
        cambiosObligatorios: ["Aceite Advantec 5W-40", "Filtro Aceite BMW"]
      },
      {
        numero: 2,
        km: 10000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2.0,
        descripcion: "2ª Revisión (10.000 KM) • Servicio anual / 10k",
        descripcionManoObra: "Servicio oficial",
        chequeos: ["Cambio aceite y filtro", "Diagnóstico BMW MOSS", "Inspección de transmisión por cardán o cadena"],
        cambiosObligatorios: ["Aceite Advantec", "Filtro Aceite"]
      },
      {
        numero: 3,
        km: 20000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 3.0,
        descripcion: "3ª Revisión (20.000 KM) • Servicio mayor ShiftCam",
        descripcionManoObra: "Servicio mayor oficial",
        chequeos: ["Revisión holgura de válvulas", "Reemplazo de bujías", "Filtro de aire", "Líquido de frenos"],
        cambiosObligatorios: ["Bujías", "Filtro Aire", "Líquido Frenos", "Aceite"]
      }
    ]
  }
};

/**
 * Resuelve la política oficial según la marca y modelo de la moto.
 */
export function getOfficialWarrantyPolicy(brand = "TVS") {
  const normalized = String(brand || "").trim().toUpperCase();

  if (OFFICIAL_WARRANTY_POLICIES[normalized]) {
    return OFFICIAL_WARRANTY_POLICIES[normalized];
  }

  for (const [key, policy] of Object.entries(OFFICIAL_WARRANTY_POLICIES)) {
    if (normalized.includes(key)) {
      return policy;
    }
  }

  // Plantilla estándar por defecto
  return {
    distribuidor: `${normalized} CONCESIONARIO AUTORIZADO`,
    distribuidorCorto: normalized,
    mesesGarantia: 12,
    kmGarantia: 20000,
    toleranciaKm: 200,
    toleranciaDias: 15,
    descripcionReglas: "Tolerancia de +/- 200 km. Mantener las revisiones periódicas selladas en la red autorizada.",
    reglasDeOro: [
      {
        id: "tolerancia_general",
        titulo: "Ventana de Tolerancia (+/- 200 KM)",
        nivel: "critico",
        detalle: "Acudir al taller dentro del margen estipulado por el fabricante."
      },
      {
        id: "repuestos_originales",
        titulo: "Uso de Repuestos Originales Homologados",
        nivel: "critico",
        detalle: "Garantiza el correcto funcionamiento y no invalida la garantía de componentes."
      }
    ],
    revisiones: [
      {
        numero: 1,
        km: 1000,
        manoDeObra: "GRATIS",
        tiempoEstHoras: 1.5,
        descripcion: "1ª Revisión (1.000 KM) • Rodaje inicial",
        descripcionManoObra: "Mano de obra gratis",
        chequeos: ["Cambio de aceite de motor", "Filtro de aceite", "Torque general", "Ajuste de cadena"],
        cambiosObligatorios: ["Aceite de Motor", "Filtro de Aceite"]
      },
      {
        numero: 2,
        km: 5000,
        manoDeObra: "GRATIS",
        tiempoEstHoras: 1.5,
        descripcion: "2ª Revisión (5.000 KM) • Preventivo",
        descripcionManoObra: "Mano de obra gratis",
        chequeos: ["Cambio de aceite", "Inspección de bujía", "Revisión de frenos"],
        cambiosObligatorios: ["Aceite de Motor"]
      },
      {
        numero: 3,
        km: 10000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2.0,
        descripcion: "3ª Revisión (10.000 KM) • Afinación general",
        descripcionManoObra: "Revisión pagada",
        chequeos: ["Cambio de aceite y filtro", "Reemplazo de bujía", "Filtro de aire"],
        cambiosObligatorios: ["Bujía", "Filtro Aire", "Aceite"]
      },
      {
        numero: 4,
        km: 15000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2.0,
        descripcion: "4ª Revisión (15.000 KM) • Frenos y fluidos",
        descripcionManoObra: "Revisión pagada",
        chequeos: ["Líquido de frenos", "Pastillas de freno", "Inspección de suspensión"],
        cambiosObligatorios: ["Aceite", "Líquido Frenos"]
      },
      {
        numero: 5,
        km: 20000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2.5,
        descripcion: "5ª Revisión (20.000 KM) • Cierre de garantía",
        descripcionManoObra: "Cierre de garantía",
        chequeos: ["Inspección de válvulas", "Diagnóstico general", "Reporte final"],
        cambiosObligatorios: ["Aceite", "Filtros"]
      }
    ]
  };
}

/**
 * Computa el estado en tiempo real del Guardián de Garantía para una moto y odómetro dado.
 */
export function computeWarrantyState(bike, currentOdometer = 0) {
  const brand = bike?.config?.bikeIdentity?.brand || "TVS";
  const defaultPolicy = getOfficialWarrantyPolicy(brand);

  const customGarantia = bike?.hojaDeVida?.garantia || {};
  const isEnabled = customGarantia.enabled !== false;

  const distribuidor = customGarantia.distribuidor || defaultPolicy.distribuidor;
  const distribuidorCorto = customGarantia.distribuidorCorto || defaultPolicy.distribuidorCorto;
  const mesesGarantia = Number(customGarantia.mesesGarantia) || defaultPolicy.mesesGarantia;
  const kmGarantia = Number(customGarantia.kmGarantia) || defaultPolicy.kmGarantia;
  const toleranciaKm = Number(customGarantia.toleranciaKm) || defaultPolicy.toleranciaKm;
  const ritmoKmDia = Number(customGarantia.ritmoKmDia) || 65;

  const revisionesConfig = (Array.isArray(customGarantia.revisiones) && customGarantia.revisiones.length > 0)
    ? customGarantia.revisiones
    : defaultPolicy.revisiones;

  const completedNumbers = new Set(customGarantia.completadas || []);

  revisionesConfig.forEach((rev) => {
    if (currentOdometer >= rev.km + toleranciaKm) {
      completedNumbers.add(rev.numero);
    }
  });

  const totalRevisiones = revisionesConfig.length;
  const completadasCount = completedNumbers.size;

  const nextRev = revisionesConfig.find((r) => !completedNumbers.has(r.numero)) || null;

  let status = "PROGRAMADA";
  let distanciaRestante = 0;
  let diasRestantes = 0;
  let ventanaMin = 0;
  let ventanaMax = 0;
  let fechaEstimada = "";
  let isPeligroVencida = false;
  let isEnVentana = false;

  const isKmExceeded = kmGarantia < 900000 && currentOdometer > kmGarantia;

  if (!isEnabled) {
    status = "DESACTIVADA";
  } else if (!nextRev || completadasCount === totalRevisiones) {
    status = "COMPLETADA";
  } else if (isKmExceeded) {
    status = "VENCIDA_KILOMETRAJE";
  } else {
    ventanaMin = Math.max(0, nextRev.km - toleranciaKm);
    ventanaMax = nextRev.km + toleranciaKm;
    distanciaRestante = Math.max(0, nextRev.km - currentOdometer);

    diasRestantes = Math.max(0, Math.ceil(distanciaRestante / ritmoKmDia));
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + diasRestantes);
    fechaEstimada = targetDate.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });

    if (currentOdometer > ventanaMax) {
      status = "EN_RIESGO";
      isPeligroVencida = true;
    } else if (currentOdometer >= ventanaMin && currentOdometer <= ventanaMax) {
      status = "EN_VENTANA";
      isEnVentana = true;
    } else if (distanciaRestante <= 350) {
      status = "URGENTE";
    } else {
      status = "PROGRAMADA";
    }
  }

  return {
    isEnabled,
    distribuidor,
    distribuidorCorto,
    mesesGarantia,
    kmGarantia,
    toleranciaKm,
    ritmoKmDia,
    reglasDeOro: defaultPolicy.reglasDeOro,
    descripcionReglas: defaultPolicy.descripcionReglas,
    revisiones: revisionesConfig,
    completedNumbers: Array.from(completedNumbers),
    completadasCount,
    totalRevisiones,
    nextRev,
    status,
    isPeligroVencida,
    isEnVentana,
    distanciaRestante,
    diasRestantes,
    fechaEstimada,
    ventanaMin,
    ventanaMax
  };
}
