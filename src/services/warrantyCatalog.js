/**
 * Catálogo Oficial de Políticas de Garantía por Marca y Ensambladora
 * Define los términos de garantía de fábrica, tolerancias de kilometraje y
 * el roadmap de revisiones periódicas obligatorias para no perder la garantía.
 */

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
      "Acudir al taller dentro del rango de tolerancia (+/- 100 km o 15 días).",
      "Utilizar únicamente aceite y repuestos originales TVS TRU4 recomendados.",
      "No cortar, pelar ni alterar el arnés eléctrico de fábrica (corta-corrientes, exploradoras no certificadas anulan garantía de ECU).",
      "Exigir el sellado y registro digital de cada revisión en la plataforma oficial Auteco/Dismerca.",
      "El desprendimiento de sellos del motor o manipulación por talleres no autorizados anula la garantía de inmediato."
    ],
    revisiones: [
      {
        numero: 1,
        km: 1000,
        manoDeObra: "GRATIS",
        tiempoEstHoras: 1.5,
        descripcion: "1ª Revisión (1.000 KM) • Cambio aceite inicial, filtro, ajuste de torque de chasis y calibración de válvulas de rodaje.",
        chequeos: [
          "Drenaje y cambio de aceite de motor y filtro de aceite",
          "Inspección y calibración de holgura de válvulas en frío",
          "Ajuste y lubricación de cadena de transmisión",
          "Torque general de pernos de chasis y motor",
          "Verificación de ralentí y diagnóstico electrónico básico"
        ]
      },
      {
        numero: 2,
        km: 5000,
        manoDeObra: "GRATIS",
        tiempoEstHoras: 1.5,
        descripcion: "2ª Revisión (5.000 KM) • Cambio de aceite, limpieza de filtro de aire, bujía y chequeo de frenos.",
        chequeos: [
          "Cambio de aceite de motor",
          "Limpieza o sopleteado de filtro de aire",
          "Inspección y limpieza de bujía",
          "Ajuste de tensión de embrague y acelerador",
          "Inspección de desgaste de pastillas y nivel de líquido de frenos"
        ]
      },
      {
        numero: 3,
        km: 10000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2,
        descripcion: "3ª Revisión (10.000 KM) • Afinación general, cambio de bujía, filtro de aire y cauchos de arrastre.",
        chequeos: [
          "Cambio de aceite motor y filtro de aceite",
          "Reemplazo de bujía",
          "Reemplazo de filtro de aire",
          "Revisión de cauchos de amortiguación de rueda trasera (sprocket)",
          "Alineación y engrase de rodamientos de dirección"
        ]
      },
      {
        numero: 4,
        km: 15000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2,
        descripcion: "4ª Revisión (15.000 KM) • Mantenimiento preventivo intermedio y diagnóstico OBD.",
        chequeos: [
          "Cambio de aceite motor",
          "Inspección de sistema de inyección electrónica con scanner",
          "Revisión de líquido de frenos DOT 4",
          "Chequeo de suspensión delantera (retenedores y fuga de aceite)"
        ]
      },
      {
        numero: 5,
        km: 20000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2.5,
        descripcion: "5ª Revisión (20.000 KM) • Servicio mayor: calibración de válvulas, bujía, fluidos y kit de arrastre.",
        chequeos: [
          "Calibración de holgura de válvulas",
          "Cambio de aceite de motor y filtro",
          "Inspección completa del kit de arrastre (cadena, piñón y catalina)",
          "Reemplazo de bujía y filtro de combustible"
        ]
      },
      {
        numero: 6,
        km: 25000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2,
        descripcion: "6ª Revisión (25.000 KM) • Mantenimiento preventivo y chequeo de sistema de carga.",
        chequeos: [
          "Cambio de aceite motor",
          "Medición de voltaje de batería y regulador",
          "Inspección de guayas y comandos"
        ]
      },
      {
        numero: 7,
        km: 30000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2.5,
        descripcion: "7ª Revisión (30.000 KM) • Servicio mayor de dirección, suspensión y frenos.",
        chequeos: [
          "Reemplazo de líquido de frenos",
          "Cambio de aceite de suspensión delantera si aplica",
          "Limpieza del cuerpo de aceleración"
        ]
      },
      {
        numero: 8,
        km: 35000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2,
        descripcion: "8ª Revisión (35.000 KM) • Última revisión obligatoria antes del cierre de garantía a los 36.000 KM.",
        chequeos: [
          "Inspección general de garantía para reporte final",
          "Prueba de compresión de motor",
          "Diagnóstico final con scanner oficial"
        ]
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
      "Acudir a la red de Concesionarios Autorizados Yamaha.",
      "Uso exclusivo de lubricante Yamalube 4T certificado.",
      "Mantener sellado el sistema Y-Connect / ECU original.",
      "No instalar modificaciones que alteren las RPM o el corte de encendido."
    ],
    revisiones: [
      {
        numero: 1,
        km: 1000,
        manoDeObra: "GRATIS",
        tiempoEstHoras: 1.5,
        descripcion: "1ª Revisión (1.000 KM) • Rodaje inicial, cambio aceite Yamalube y filtro, chequeo general.",
        chequeos: ["Cambio de aceite Yamalube", "Cambio filtro de aceite", "Torque general de pernos", "Ajuste de embrague y acelerador"]
      },
      {
        numero: 2,
        km: 5000,
        manoDeObra: "GRATIS",
        tiempoEstHoras: 1.5,
        descripcion: "2ª Revisión (5.000 KM) • Cambio de aceite Yamalube, limpieza de filtro de aire e inspección de bujía.",
        chequeos: ["Cambio aceite Yamalube", "Chequeo bujía", "Inspección de pastillas de freno", "Lubricación de cadena"]
      },
      {
        numero: 3,
        km: 10000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2,
        descripcion: "3ª Revisión (10.000 KM) • Servicio intermedio: bujía nueva, filtro de aire y scanner Yamaha.",
        chequeos: ["Cambio aceite y filtro", "Reemplazo de bujía", "Reemplazo filtro de aire", "Diagnóstico con herramienta YDT"]
      },
      {
        numero: 4,
        km: 15000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2,
        descripcion: "4ª Revisión (15.000 KM) • Mantenimiento preventivo de frenos y transmisión.",
        chequeos: ["Cambio aceite", "Purgado líquido de frenos DOT 4", "Inspección kit de arrastre"]
      },
      {
        numero: 5,
        km: 20000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2.5,
        descripcion: "5ª Revisión (20.000 KM) • Servicio mayor previo al cierre de garantía.",
        chequeos: ["Inspección holgura de válvulas", "Cambio bujía", "Revisión completa de chasis y suspensión"]
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
      "Uso exclusivo de lubricante Motorex 15W-50 recomendado por fábrica.",
      "No remover el sensor de pata lateral ni alterar el sensor de oxígeno.",
      "Validación de campaña de actualización de software KTM en cada visita."
    ],
    revisiones: [
      {
        numero: 1,
        km: 1000,
        manoDeObra: "GRATIS",
        tiempoEstHoras: 1.5,
        descripcion: "1ª Revisión (1.000 KM) • Servicio de rodaje KTM, cambio aceite Motorex y desbloqueo de RPM.",
        chequeos: ["Cambio aceite Motorex", "Filtro de aceite y tamices", "Revisión juego libre de embrague", "Lectura de códigos KTM XC-2"]
      },
      {
        numero: 2,
        km: 7500,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2,
        descripcion: "2ª Revisión (7.500 KM) • Servicio intermedio Motorex, bujía y filtro de aire.",
        chequeos: ["Cambio aceite Motorex", "Filtro de aire", "Inspección de pastillas y discos", "Revisión de holgura de cadena"]
      },
      {
        numero: 3,
        km: 15000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 3,
        descripcion: "3ª Revisión (15.000 KM) • Servicio mayor KTM: holgura de válvulas y bujía Iridium.",
        chequeos: ["Comprobación juego de válvulas", "Cambio de bujía", "Reemplazo líquido de frenos", "Inspección suspensión WP"]
      },
      {
        numero: 4,
        km: 22500,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2,
        descripcion: "4ª Revisión (22.500 KM) • Servicio preventivo y diagnóstico final de garantía.",
        chequeos: ["Cambio de aceite Motorex", "Inspección integral de chasis y basculante"]
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
      "Acudir al taller dentro del margen estricto de 150 km.",
      "Uso de lubricante Bajaj DTS-i o Motul equivalente.",
      "Mantenimiento al día de las 3 bujías en modelos DTS-i."
    ],
    revisiones: [
      {
        numero: 1,
        km: 500,
        manoDeObra: "GRATIS",
        tiempoEstHoras: 1.5,
        descripcion: "1ª Revisión (500 KM) • Asentamiento inicial, cambio de aceite y filtro.",
        chequeos: ["Cambio aceite", "Limpieza filtro tamiz", "Calibración de juego de válvulas", "Torque de tuercas de culata"]
      },
      {
        numero: 2,
        km: 5000,
        manoDeObra: "GRATIS",
        tiempoEstHoras: 1.5,
        descripcion: "2ª Revisión (5.000 KM) • Cambio de aceite y filtro, revisión de bujías.",
        chequeos: ["Cambio de aceite y filtro", "Limpieza de bujías", "Ajuste de cadena"]
      },
      {
        numero: 3,
        km: 10000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2,
        descripcion: "3ª Revisión (10.000 KM) • Afinación general y filtro de aire.",
        chequeos: ["Cambio de aceite", "Reemplazo de bujías", "Reemplazo de filtro de aire"]
      },
      {
        numero: 4,
        km: 15000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2,
        descripcion: "4ª Revisión (15.000 KM) • Mantenimiento preventivo y frenos.",
        chequeos: ["Cambio de aceite", "Pastillas de freno", "Líquido de frenos"]
      },
      {
        numero: 5,
        km: 20000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2.5,
        descripcion: "5ª Revisión (20.000 KM) • Cierre de garantía oficial.",
        chequeos: ["Calibración de válvulas", "Diagnóstico integral", "Revisión de kit de arrastre"]
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
      "Uso de aceite genuino Honda Pro 10W-30.",
      "Registro en el libro de garantía Fanalca.",
      "No perforar el escape original ni alterar sensores PGM-FI."
    ],
    revisiones: [
      {
        numero: 1,
        km: 1000,
        manoDeObra: "GRATIS",
        tiempoEstHoras: 1.5,
        descripcion: "1ª Revisión (1.000 KM) • Cambio de aceite Honda Pro y ajuste general.",
        chequeos: ["Cambio aceite Honda", "Ajuste de válvulas", "Limpieza tamiz centrífugo", "Tensión cadena"]
      },
      {
        numero: 2,
        km: 4000,
        manoDeObra: "GRATIS",
        tiempoEstHoras: 1.5,
        descripcion: "2ª Revisión (4.000 KM) • Mantenimiento preventivo e inspección de bujía.",
        chequeos: ["Cambio aceite", "Inspección de bujía", "Revisión de frenos"]
      },
      {
        numero: 3,
        km: 8000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2,
        descripcion: "3ª Revisión (8.000 KM) • Afinación, bujía y filtro de aire.",
        chequeos: ["Cambio aceite", "Reemplazo de bujía", "Limpieza de filtro de aire"]
      },
      {
        numero: 4,
        km: 12000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2,
        descripcion: "4ª Revisión (12.000 KM) • Servicio intermedio y fluidos.",
        chequeos: ["Cambio aceite", "Líquido de frenos", "Inspección de embrague"]
      },
      {
        numero: 5,
        km: 16000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2,
        descripcion: "5ª Revisión (16.000 KM) • Mantenimiento integral.",
        chequeos: ["Cambio aceite", "Inspección de kit de arrastre", "Bujía"]
      },
      {
        numero: 6,
        km: 20000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2.5,
        descripcion: "6ª Revisión (20.000 KM) • Cierre de garantía oficial Honda.",
        chequeos: ["Inspección válvulas", "Prueba con scanner HDS", "Revisión final de garantía"]
      }
    ]
  },

  // SUZUKI (Suzuki Motor de Colombia)
  SUZUKI: {
    distribuidor: "SUZUKI MOTOR DE COLOMBIA",
    distribuidorCorto: "Suzuki",
    mesesGarantia: 12,
    kmGarantia: 20000,
    toleranciaKm: 200,
    toleranciaDias: 15,
    descripcionReglas: "Tolerancia de +/- 200 km. Revisiones oficiales en centros autorizados Suzuki.",
    reglasDeOro: [
      "Aceite Ecstar oficial Suzuki 10W-40.",
      "Registro en la libreta de servicio digital.",
      "No alterar el CDI/ECM ni la sonda lambda."
    ],
    revisiones: [
      {
        numero: 1,
        km: 1000,
        manoDeObra: "GRATIS",
        tiempoEstHoras: 1.5,
        descripcion: "1ª Revisión (1.000 KM) • Asentamiento, cambio aceite Ecstar y filtro.",
        chequeos: ["Cambio aceite Ecstar", "Cambio filtro de aceite", "Torque general de pernos", "Ajuste de ralentí"]
      },
      {
        numero: 2,
        km: 5000,
        manoDeObra: "GRATIS",
        tiempoEstHoras: 1.5,
        descripcion: "2ª Revisión (5.000 KM) • Cambio de aceite y chequeo de frenos.",
        chequeos: ["Cambio aceite Ecstar", "Limpieza filtro de aire", "Ajuste de cadena"]
      },
      {
        numero: 3,
        km: 10000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2,
        descripcion: "3ª Revisión (10.000 KM) • Servicio intermedio y bujía.",
        chequeos: ["Cambio aceite y filtro", "Reemplazo de bujía", "Filtro de aire nuevo"]
      },
      {
        numero: 4,
        km: 15000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2,
        descripcion: "4ª Revisión (15.000 KM) • Revisión de frenos y fluidos.",
        chequeos: ["Cambio aceite", "Líquido de frenos", "Inspección de embrague"]
      },
      {
        numero: 5,
        km: 20000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2.5,
        descripcion: "5ª Revisión (20.000 KM) • Cierre de garantía oficial Suzuki.",
        chequeos: ["Revisión de válvulas", "Diagnóstico SDS Suzuki", "Inspección general de motor"]
      }
    ]
  },

  // KAWASAKI (Auteco SAS)
  KAWASAKI: {
    distribuidor: "AUTECO SAS / KAWASAKI",
    distribuidorCorto: "Kawasaki Service",
    mesesGarantia: 12,
    kmGarantia: 20000,
    toleranciaKm: 200,
    toleranciaDias: 20,
    descripcionReglas: "Tolerancia de +/- 200 km. Revisiones cada 6.000 km con diagnóstico KDS.",
    reglasDeOro: [
      "Aceite sintético Kawasaki Racing o Motul 7100.",
      "Diagnóstico KDS oficial en cada revisión.",
      "No instalar escapes directos sin remapeo homologado."
    ],
    revisiones: [
      {
        numero: 1,
        km: 1000,
        manoDeObra: "GRATIS",
        tiempoEstHoras: 1.5,
        descripcion: "1ª Revisión (1.000 KM) • Rodaje de fábrica, aceite y filtro.",
        chequeos: ["Cambio aceite y filtro", "Torque de chasis", "Ajuste de cables", "Inspección fugas"]
      },
      {
        numero: 2,
        km: 6000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2,
        descripcion: "2ª Revisión (6.000 KM) • Mantenimiento preventivo e inspección de bujías.",
        chequeos: ["Cambio aceite y filtro", "Inspección de bujías", "Filtro de aire", "Líquido refrigerante"]
      },
      {
        numero: 3,
        km: 12000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2.5,
        descripcion: "3ª Revisión (12.000 KM) • Servicio mayor y bujías Iridium.",
        chequeos: ["Reemplazo de bujías", "Cambio líquido de frenos", "Sincronización de cuerpos de aceleración"]
      },
      {
        numero: 4,
        km: 18000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2,
        descripcion: "4ª Revisión (18.000 KM) • Servicio de cierre de garantía.",
        chequeos: ["Cambio aceite y filtro", "Diagnóstico KDS completo", "Inspección integral de chasis"]
      }
    ]
  },

  // BMW MOTORRAD (Autogermana)
  BMW: {
    distribuidor: "AUTOGERMANA / BMW MOTORRAD",
    distribuidorCorto: "BMW Motorrad",
    mesesGarantia: 36,
    kmGarantia: 999999, // Kilometraje Ilimitado
    toleranciaKm: 500,
    toleranciaDias: 30,
    descripcionReglas: "Garantía de 36 meses sin límite de kilometraje. Revisiones anuales o cada 10.000 km.",
    reglasDeOro: [
      "Aceite oficial BMW Advantec Ultimate.",
      "Registro en el historial digital BMW ConnectedDrive.",
      "Actualizaciones oficiales de software de fábrica."
    ],
    revisiones: [
      {
        numero: 1,
        km: 1000,
        manoDeObra: "GRATIS",
        tiempoEstHoras: 1.5,
        descripcion: "1ª Revisión (1.000 KM) • Servicio inicial de rodaje BMW y desbloqueo de software.",
        chequeos: ["Cambio aceite Advantec", "Cambio filtro", "Actualización software BMW", "Chequeo de pernos"]
      },
      {
        numero: 2,
        km: 10000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2,
        descripcion: "2ª Revisión (10.000 KM) • Servicio anual / 10k km.",
        chequeos: ["Cambio aceite y filtro", "Diagnóstico BMW MOSS", "Inspección de transmisión por cardán o cadena"]
      },
      {
        numero: 3,
        km: 20000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 3,
        descripcion: "3ª Revisión (20.000 KM) • Servicio mayor con bujías y holgura de válvulas.",
        chequeos: ["Revisión holgura de válvulas", "Reemplazo de bujías", "Filtro de aire", "Líquido de frenos"]
      },
      {
        numero: 4,
        km: 30000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2,
        descripcion: "4ª Revisión (30.000 KM) • Servicio de mantenimiento intermedio.",
        chequeos: ["Cambio aceite y filtro", "Inspección suspensión electrónica Dynamic ESA"]
      }
    ]
  },

  // DUCATI (Ducati Colombia)
  DUCATI: {
    distribuidor: "DUCATI COLOMBIA OFICIAL",
    distribuidorCorto: "Ducati Service",
    mesesGarantia: 24,
    kmGarantia: 999999, // Kilometraje Ilimitado
    toleranciaKm: 400,
    toleranciaDias: 30,
    descripcionReglas: "Garantía oficial de 24 meses sin límite de km. Oil Service y Desmo Service.",
    reglasDeOro: [
      "Aceite Shell Advance Ducati 15W-50.",
      "Desmo Service obligatorio en red oficial con registro digital.",
      "Uso de recambios originales Ducati Performance."
    ],
    revisiones: [
      {
        numero: 1,
        km: 1000,
        manoDeObra: "GRATIS",
        tiempoEstHoras: 1.5,
        descripcion: "1ª Revisión (1.000 KM) • Oil Service inicial de rodaje y reseteo de testigo.",
        chequeos: ["Cambio aceite Shell Advance", "Cambio filtro", "Diagnóstico Ducati DDS", "Comprobación de pernos"]
      },
      {
        numero: 2,
        km: 15000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2.5,
        descripcion: "2ª Revisión (15.000 KM) • Oil Service intermedio y chequeos electrónicos.",
        chequeos: ["Cambio de aceite y filtro", "Filtro de aire", "Líquido de frenos y embrague", "Actualización DDS"]
      },
      {
        numero: 3,
        km: 30000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 4,
        descripcion: "3ª Revisión (30.000 KM) • Desmo Service oficial: correas y holgura de válvulas.",
        chequeos: ["Comprobación juego desmodrómico", "Reemplazo de correas o tensor de cadena", "Bujías nuevas"]
      }
    ]
  }
};

/**
 * Resuelve la política oficial según la marca y modelo de la moto.
 * Si la marca no está en el catálogo, genera una plantilla estándar de 12 meses / 20.000 km.
 */
export function getOfficialWarrantyPolicy(brand = "YAMAHA") {
  const normalized = String(brand || "").trim().toUpperCase();

  // Buscar coincidencia directa
  if (OFFICIAL_WARRANTY_POLICIES[normalized]) {
    return OFFICIAL_WARRANTY_POLICIES[normalized];
  }

  // Buscar coincidencias comunes (ej. "TVS APACHE", "YAMAHA RACING")
  for (const [key, policy] of Object.entries(OFFICIAL_WARRANTY_POLICIES)) {
    if (normalized.includes(key)) {
      return policy;
    }
  }

  // Plantilla estándar por defecto para marcas no catalogadas
  return {
    distribuidor: `${normalized} CONCESIONARIO AUTORIZADO`,
    distribuidorCorto: normalized,
    mesesGarantia: 12,
    kmGarantia: 20000,
    toleranciaKm: 200,
    toleranciaDias: 15,
    descripcionReglas: "Tolerancia de +/- 200 km. Mantener las revisiones periódicas selladas en la red autorizada.",
    reglasDeOro: [
      "Acudir al taller dentro del rango de tolerancia establecido.",
      "Uso de repuestos y lubricantes certificados por el fabricante.",
      "No alterar el sistema eléctrico original ni instalar piezas no homologadas."
    ],
    revisiones: [
      {
        numero: 1,
        km: 1000,
        manoDeObra: "GRATIS",
        tiempoEstHoras: 1.5,
        descripcion: "1ª Revisión (1.000 KM) • Rodaje inicial y cambio de aceite.",
        chequeos: ["Cambio de aceite de motor", "Filtro de aceite", "Torque general", "Ajuste de cadena"]
      },
      {
        numero: 2,
        km: 5000,
        manoDeObra: "GRATIS",
        tiempoEstHoras: 1.5,
        descripcion: "2ª Revisión (5.000 KM) • Mantenimiento preventivo.",
        chequeos: ["Cambio de aceite", "Inspección de bujía", "Revisión de frenos"]
      },
      {
        numero: 3,
        km: 10000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2,
        descripcion: "3ª Revisión (10.000 KM) • Afinación y filtros.",
        chequeos: ["Cambio de aceite y filtro", "Reemplazo de bujía", "Filtro de aire"]
      },
      {
        numero: 4,
        km: 15000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2,
        descripcion: "4ª Revisión (15.000 KM) • Servicio de frenos y fluidos.",
        chequeos: ["Líquido de frenos", "Pastillas de freno", "Inspección de suspensión"]
      },
      {
        numero: 5,
        km: 20000,
        manoDeObra: "PAGADA",
        tiempoEstHoras: 2.5,
        descripcion: "5ª Revisión (20.000 KM) • Cierre de garantía.",
        chequeos: ["Inspección de válvulas", "Diagnóstico general", "Reporte final"]
      }
    ]
  };
}

/**
 * Computa el estado en tiempo real del Guardián de Garantía para una moto y odómetro dado.
 */
export function computeWarrantyState(bike, currentOdometer = 0) {
  const brand = bike?.config?.bikeIdentity?.brand || "YAMAHA";
  const defaultPolicy = getOfficialWarrantyPolicy(brand);

  // Permitir personalizaciones guardadas en bike.hojaDeVida.garantia
  const customGarantia = bike?.hojaDeVida?.garantia || {};
  const isEnabled = customGarantia.enabled !== false; // Activo por defecto

  const distribuidor = customGarantia.distribuidor || defaultPolicy.distribuidor;
  const distribuidorCorto = customGarantia.distribuidorCorto || defaultPolicy.distribuidorCorto;
  const mesesGarantia = Number(customGarantia.mesesGarantia) || defaultPolicy.mesesGarantia;
  const kmGarantia = Number(customGarantia.kmGarantia) || defaultPolicy.kmGarantia;
  const toleranciaKm = Number(customGarantia.toleranciaKm) || defaultPolicy.toleranciaKm;
  const ritmoKmDia = Number(customGarantia.ritmoKmDia) || 65; // Ritmo diario estimado en km

  const revisionesConfig = (Array.isArray(customGarantia.revisiones) && customGarantia.revisiones.length > 0)
    ? customGarantia.revisiones
    : defaultPolicy.revisiones;

  // Revisiones completadas: registradas en customGarantia.completadas o con km menor al odómetro en servicios
  const completedNumbers = new Set(customGarantia.completadas || []);

  // Si no hay completadas registradas manualmente, deducir de las revisiones cuyo kilometraje ya se superó holgadamente
  revisionesConfig.forEach((rev) => {
    if (currentOdometer >= rev.km + toleranciaKm) {
      completedNumbers.add(rev.numero);
    }
  });

  const totalRevisiones = revisionesConfig.length;
  const completadasCount = completedNumbers.size;

  // Encontrar la próxima revisión pendiente
  const nextRev = revisionesConfig.find((r) => !completedNumbers.has(r.numero)) || null;

  let status = "PROGRAMADA"; // 'PROGRAMADA' | 'EN_VENTANA' | 'URGENTE' | 'EN_RIESGO' | 'COMPLETADA' | 'VENCIDA'
  let distanciaRestante = 0;
  let diasRestantes = 0;
  let ventanaMin = 0;
  let ventanaMax = 0;
  let fechaEstimada = "";

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
      status = "EN_RIESGO"; // Pasó el límite de tolerancia!
    } else if (currentOdometer >= ventanaMin && currentOdometer <= ventanaMax) {
      status = "EN_VENTANA"; // Está dentro de la ventana oficial del taller
    } else if (distanciaRestante <= 350) {
      status = "URGENTE"; // A menos de 350 km de entrar a la ventana
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
    distanciaRestante,
    diasRestantes,
    fechaEstimada,
    ventanaMin,
    ventanaMax
  };
}
