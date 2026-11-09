/**
 * Servicio Global de Radar de Fotomultas, Comparendos & Alertas Legales
 * Soporta conexión multisede: SIMIT (Colombia), DGT (España), CDMX/Jalisco (México),
 * DMV (USA), SINAT (Argentina), Registro Civil (Chile), SAT (Perú).
 */

export const TRAFFIC_PORTALS = {
  CO: {
    pais: "Colombia",
    bandera: "🇨🇴",
    moneda: "COP",
    entidad: "SIMIT (Federación Colombiana de Municipios) & RUNT",
    entidadCorta: "SIMIT Colombia",
    portalUrl: "https://www.fcm.org.co/simit/#/estado-cuenta",
    documentoLabel: "Cédula de Ciudadanía / NIT",
    documentoTipo: "CC",
    descuentoLey: "50% de descuento en los primeros 11 días hábiles (Fotomultas) o 5 días (en vía) con curso pedagógico.",
    diasDescuentoMax: 11,
    porcentajeDescuento: 50,
    reglasImpugnacion: [
      "Notificación Indebida: La fotomulta debe notificarse por correo certificado dentro de los 3 días hábiles siguientes a la validación del comparendo (Sentencia C-038/20).",
      "Identificación del Conductor: La Corte Constitucional (Sentencia C-321/22) prohíbe sancionar automáticamente al propietario sin demostrar quién iba conduciendo la moto.",
      "Caducidad y Prescripción: Los comparendos caducan al año si no hay resolución sancionatoria, y prescriben a los 3 años de no iniciarse cobro coactivo.",
      "Calibración de la Cámara: La cámara salvavidas debe tener permiso vigente del Ministerio de Transporte y calibración metrológica al día."
    ],
    infraccionesComunes: [
      { codigo: "C29", nombre: "Exceso de velocidad permitido", baseCOP: 650000 },
      { codigo: "C02", nombre: "No portar SOAT vigente", baseCOP: 1300000 },
      { codigo: "C35", nombre: "No realizar la revisión técnico-mecánica", baseCOP: 650000 },
      { codigo: "D02", nombre: "Conducir sin portar licencia o vencida", baseCOP: 1300000 },
      { codigo: "C14", nombre: "Transitar en sitios u horas restringidas (Pico y Placa)", baseCOP: 650000 }
    ]
  },

  ES: {
    pais: "España",
    bandera: "🇪🇸",
    moneda: "EUR",
    entidad: "DGT (Dirección General de Tráfico) - TESTRA / DEV",
    entidadCorta: "DGT España",
    portalUrl: "https://sede.dgt.gob.es/es/multas/",
    documentoLabel: "DNI / NIE del Titular",
    documentoTipo: "DNI",
    descuentoLey: "50% de bonificación si se abona en periodo voluntario dentro de los primeros 20 días naturales.",
    diasDescuentoMax: 20,
    porcentajeDescuento: 50,
    reglasImpugnacion: [
      "Plazo de Alegaciones: 20 días naturales desde la notificación formal.",
      "Margen de Error del Radar: Los cinemómetros deben aplicar un margen de tolerancia (3 km/h o 5%).",
      "Identificación de Conductor: Obligación de identificar al conductor si la infracción detrae puntos."
    ],
    infraccionesComunes: [
      { codigo: "VEL-1", nombre: "Exceso de velocidad en autopista", baseCOP: 100 },
      { codigo: "ITV-1", nombre: "ITV caducada o desfavorable", baseCOP: 200 },
      { codigo: "CAS-1", nombre: "No uso de casco homologado", baseCOP: 200 }
    ]
  },

  MX: {
    pais: "México",
    bandera: "🇲🇽",
    moneda: "MXN",
    entidad: "Sistema de Infracciones de Tránsito (CDMX / Edomex / Jalisco)",
    entidadCorta: "Infracciones México",
    portalUrl: "https://infracciones.cdmx.gob.mx/",
    documentoLabel: "Número de Serie (VIN / NIV)",
    documentoTipo: "VIN",
    descuentoLey: "Hasta 80% o 50% de descuento durante los primeros 10 a 15 días naturales según la entidad.",
    diasDescuentoMax: 15,
    porcentajeDescuento: 50,
    reglasImpugnacion: [
      "Juicio de Nulidad ante el Tribunal de Justicia Administrativa dentro de 15 días.",
      "Falta de fundamentación y motivación en la boleta digital.",
      "Calibración de cinemómetros y cámaras fotocívicas."
    ],
    infraccionesComunes: [
      { codigo: "FOT-01", nombre: "Exceso de velocidad en vías primarias", baseCOP: 1200 },
      { codigo: "CAS-02", nombre: "Circular sin casco protector certificado", baseCOP: 1500 },
      { codigo: "VER-03", nombre: "Falta de verificación vehicular", baseCOP: 2000 }
    ]
  },

  US: {
    pais: "Estados Unidos",
    bandera: "🇺🇸",
    moneda: "USD",
    entidad: "DMV & County Traffic Ticket Records",
    entidadCorta: "USA Traffic Portal",
    portalUrl: "https://www.dmv.org/traffic-tickets.php",
    documentoLabel: "Driver License / VIN",
    documentoTipo: "DL",
    descuentoLey: "Opción de Escuela de Tráfico (Traffic School) para exonerar puntos y evitar aumento del seguro.",
    diasDescuentoMax: 30,
    porcentajeDescuento: 30,
    reglasImpugnacion: [
      "Trial by Written Declaration (Disputa por escrito sin comparecer ante corte).",
      "Solicitud de calibración del dispositivo Lidar/Radar del oficial.",
      "Reducción de multa por dificultad económica ante el juez."
    ],
    infraccionesComunes: [
      { codigo: "SPD-22349", nombre: "Speeding over maximum limit", baseCOP: 238 },
      { codigo: "RED-21453", nombre: "Red light photo camera violation", baseCOP: 490 },
      { codigo: "REG-4000", nombre: "Expired registration tags", baseCOP: 195 }
    ]
  },

  AR: {
    pais: "Argentina",
    bandera: "🇦🇷",
    moneda: "ARS",
    entidad: "SINAT / Consulta Infracciones CABA & PBA",
    entidadCorta: "Infracciones Argentina",
    portalUrl: "https://buenosaires.gob.ar/tramites/consulta-de-infracciones",
    documentoLabel: "DNI del Propietario",
    documentoTipo: "DNI",
    descuentoLey: "50% de descuento por pago voluntario dentro del término de la notificación.",
    diasDescuentoMax: 15,
    porcentajeDescuento: 50,
    reglasImpugnacion: [
      "Descargo online ante la Unidad Administrativa de Control de Faltas.",
      "Falta de homologación por el INTI de la cámara fotomulta.",
      "Prescripción de faltas de tránsito a los 2 o 5 años según jurisdicción."
    ],
    infraccionesComunes: [
      { codigo: "EXC-VEL", nombre: "Exceso de velocidad fiscalizado", baseCOP: 35000 },
      { codigo: "VTV-CAD", nombre: "VTV vencida o ausente", baseCOP: 28000 }
    ]
  },

  CL: {
    pais: "Chile",
    bandera: "🇨🇱",
    moneda: "CLP",
    entidad: "Registro Civil - Multas de Tránsito No Pagadas",
    entidadCorta: "Registro Civil Chile",
    portalUrl: "https://www.registrocivil.cl/",
    documentoLabel: "RUT del Propietario",
    documentoTipo: "RUT",
    descuentoLey: "25% de rebaja en Juzgado de Policía Local por pago oportuno.",
    diasDescuentoMax: 15,
    porcentajeDescuento: 25,
    reglasImpugnacion: [
      "Comparecencia ante el Juzgado de Policía Local para solicitar reconsideración o rebaja.",
      "Prescripción de la multa anotada en el registro tras 3 años."
    ],
    infraccionesComunes: [
      { codigo: "TAG-01", nombre: "Transitar sin TAG o pase diario habilitado", baseCOP: 65000 },
      { codigo: "VEL-02", nombre: "Exceso de velocidad en zona urbana", baseCOP: 95000 }
    ]
  },

  PE: {
    pais: "Perú",
    bandera: "🇵🇪",
    moneda: "PEN",
    entidad: "SAT (Servicio de Administración Tributaria de Lima)",
    entidadCorta: "SAT Perú",
    portalUrl: "https://www.sat.gob.pe/",
    documentoLabel: "DNI / RUC",
    documentoTipo: "DNI",
    descuentoLey: "Hasta 83% de descuento cancelando dentro de los primeros 5 días hábiles.",
    diasDescuentoMax: 5,
    porcentajeDescuento: 83,
    reglasImpugnacion: [
      "Recurso de apelación dentro de 15 días hábiles.",
      "Falta de resolución de sanción debidamente fundamentada."
    ],
    infraccionesComunes: [
      { codigo: "G47", nombre: "Exceso de velocidad con cinemómetro", baseCOP: 396 },
      { codigo: "M01", nombre: "Conducir sin SOAT vigente", baseCOP: 594 }
    ]
  }
};

/**
 * Obtiene la configuración de portal de tránsito para un país dado (o Colombia por defecto).
 */
export function getCountryTrafficPortal(countryCode = "CO") {
  const code = String(countryCode || "CO").trim().toUpperCase();
  return TRAFFIC_PORTALS[code] || TRAFFIC_PORTALS.CO;
}

/**
 * Calcula el estado del Radar de Multas para la moto activa.
 */
export function computeFinesRadarState(bike, userProfile = null) {
  const countryCode = userProfile?.countryCode || bike?.hojaDeVida?.multas?.pais || "CO";
  const portal = getCountryTrafficPortal(countryCode);
  const placa = bike?.hojaDeVida?.documentos?.placa || "OFU22I";
  const docTitular = bike?.hojaDeVida?.multas?.documentoTitular || userProfile?.documentId || "1020405060";

  const multasData = bike?.hojaDeVida?.multas || {};
  const alertasActivas = Array.isArray(multasData.alertasActivas) ? multasData.alertasActivas : [];
  const ultimaVerificacion = multasData.ultimaVerificacion || new Date().toISOString();

  // Filtrar multas pendientes
  const multasPendientes = alertasActivas.filter((m) => m.estado !== "PAGADO" && m.estado !== "EXONERADO");

  // Calcular si hay alguna con descuento urgente por vencer
  const multaUrgente = multasPendientes.find((m) => {
    if (!m.fechaLimiteDescuento) return false;
    const target = new Date(m.fechaLimiteDescuento);
    const today = new Date();
    const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  }) || null;

  const totalMultas = multasPendientes.length;
  const tieneMultas = totalMultas > 0;

  let totalDeudaOriginal = 0;
  let totalDeudaConDescuento = 0;

  multasPendientes.forEach((m) => {
    totalDeudaOriginal += Number(m.valorOriginal) || 0;
    totalDeudaConDescuento += Number(m.valorConDescuento || m.valorOriginal) || 0;
  });

  const ahorroPotencial = Math.max(0, totalDeudaOriginal - totalDeudaConDescuento);

  // Formato de días desde la última verificación
  const diffHours = Math.max(0, Math.round((Date.now() - new Date(ultimaVerificacion).getTime()) / (1000 * 60 * 60)));
  const tiempoDesdeVerificacion = diffHours < 1
    ? "Hace unos momentos"
    : diffHours < 24
    ? `Hace ${diffHours} horas`
    : `Hace ${Math.floor(diffHours / 24)} días`;

  return {
    portal,
    countryCode,
    placa,
    docTitular,
    tieneMultas,
    totalMultas,
    multasPendientes,
    multaUrgente,
    totalDeudaOriginal,
    totalDeudaConDescuento,
    ahorroPotencial,
    ultimaVerificacion,
    tiempoDesdeVerificacion,
    estadoGeneral: tieneMultas ? (multaUrgente ? "DESCUENTO_URGENTE" : "INFRACCION_DETECTADA") : "AL_DIA"
  };
}

/**
 * Simulación de verificación con el backend de tránsito (Opción A / Supabase Edge Function)
 */
export async function verifyTrafficFinesBackend({ countryCode = "CO", plate, docNumber, vin }) {
  // Simular llamada de red a la Edge Function de Supabase
  await new Promise((resolve) => setTimeout(resolve, 1400));

  const portal = getCountryTrafficPortal(countryCode);
  const now = new Date();

  // Si la placa termina en "F" (como APC16F) o es la moto de demo con multa activa
  const isDemoFine = String(plate).toUpperCase().includes("FOT") || String(plate).toUpperCase().includes("MUL");

  if (isDemoFine) {
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() + 5);

    return {
      success: true,
      hasFines: true,
      timestamp: now.toISOString(),
      fines: [
        {
          id: `fine_${Date.now()}`,
          codigoInfraccion: "C29",
          descripcion: "Conducir a velocidad superior a la máxima permitida (Fotomulta por radar)",
          fechaComparendo: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          lugar: "Autopista Norte Km 14 - Cámara Salvavidas 04",
          entidadTransito: "Secretaría de Movilidad",
          valorOriginal: 650000,
          valorConDescuento: 325000,
          porcentajeDescuento: 50,
          fechaLimiteDescuento: limitDate.toISOString().slice(0, 10),
          diasRestantesDescuento: 5,
          estado: "PENDIENTE_PAGO",
          cursoPedagogicoRequerido: true,
          enlaceOficialPago: portal.portalUrl
        }
      ]
    };
  }

  return {
    success: true,
    hasFines: false,
    timestamp: now.toISOString(),
    fines: []
  };
}

