/**
 * MotoDash AI — Doctor Motor IA (Diagnóstico Mecánico por Síntoma, Sonido o Sensación)
 * Ayuda al motero a saber exactamente qué tiene su moto, si es peligroso seguir rodando
 * y cuánto es el precio justo de reparación para evitar cobros abusivos en talleres.
 */

export const QUICK_MECHANICAL_SYMPTOMS = [
  {
    id: 'valve_chain_rattle',
    badge: '🔊 Cascabeleo / Taqueo en el Motor',
    symptom: 'Suena un cascabeleo o tic-tic metálico en el cilindro/culata en frío o alrededor de las 3.000 a 5.000 RPM.',
    diagnosisTitle: 'Holgura de Válvulas Descalibrada o Tensor Automático de Cadenilla de Distribución',
    urgencyLevel: 'PRECAUCIÓN MEDIA — CALIBRAR PRONTO',
    canRideSafely: 'PUEDES RODAR A BAJAS RPM HASTA EL TALLER',
    estimatedCostCOP: '$65.000 – $140.000 COP (US$16 – US$35)',
    technicalExplanation: 'En motores 4 Válvulas (como TVS Apache RTR 160/200 4V, Pulsar NS, KTMs), un "tic-tic" en la parte alta de la culata suele deberse a holgura excesiva en balancines/válvulas (admisión 0.06 mm / escape 0.08 mm) o desgaste en el tensor automático de la cadenilla de distribución.',
    mechanicChecklist: [
      'Pide en el taller medir holgura de las 4 válvulas con galgas calibradas con el motor 100% frío.',
      'Revisa el resorte y trinquete del tensor de cadenilla antes de dejar que te cambien la cadenilla completa sin necesidad.',
      'Verifica el nivel y viscosidad del aceite (10W-40 o 10W-30 Sintético).'
    ]
  },
  {
    id: 'hard_gearbox',
    badge: '⚙️ Caja Dura / No Entra Neutro',
    symptom: 'La palanca de cambios se siente muy dura al pasar de 1ª a 2ª o cuesta encontrar el Neutro cuando la moto está caliente en un semáforo.',
    diagnosisTitle: 'Tensión Incorrecta de Guaya de Clutch o Aceite Degradado por Temperatura',
    urgencyLevel: 'RIESGO BAJO-MEDIO — AJUSTE RÁPIDO',
    canRideSafely: 'SÍ PUEDES RODAR • AJUSTA JUEGO LIBRE DE CLUTCH',
    estimatedCostCOP: '$15.000 – $85.000 COP (US$4 – US$22)',
    technicalExplanation: 'El 85% de las veces NO es un daño interno de la caja ni de los discos de clutch: ocurre porque la guaya del embrague tiene demasiado juego libre (debe ser de 10 mm a 15 mm en la manigueta) y no alcanza a separar bien la prensa cuando el motor dilata por calor, o porque el aceite ya perdió propiedades.',
    mechanicChecklist: [
      'Gradúa el tensor de la manigueta de clutch dejando solo 1 cm de juego libre.',
      'Lubrica la guaya de clutch y verifica que no esté deshilachada.',
      'Si el aceite tiene más de 2.500 - 3.000 km, cámbialo junto con el filtro de papel.'
    ]
  },
  {
    id: 'power_loss_jerk',
    badge: '⚡ Jaloneo o Pérdida de Fuerza',
    symptom: 'La moto se ahoga, tironea al acelerar fuerte o pierde fuerza en subidas y altas revoluciones.',
    diagnosisTitle: 'Filtro de Combustible/Aire Obstruido, Bujía Desgastada o Inyector Sucio',
    urgencyLevel: 'PRECAUCIÓN MEDIA — REVISIÓN DE INYECCIÓN FI',
    canRideSafely: 'EVITA ADELANTAMIENTOS EXIGENTES HASTA REVISAR',
    estimatedCostCOP: '$45.000 – $130.000 COP (US$12 – US$32)',
    technicalExplanation: 'En motos Fuel Injection (FI), el tironeo al abrir el acelerador suele originarse por caída de presión en la bomba de gasolina, bujía con electrodo abierto (>0.9 mm), capuchón de bujía sulfatado o cuerpo de aceleración sucio.',
    mechanicChecklist: [
      'Revisa primero el estado y calibración de la bujía (Iridium o Bosch original) y el filtro de aire.',
      'Solicita limpieza de cuerpo de aceleración e inyector por ultrasonido sin desprogramar el sensor TPS.',
      'No cambies la bomba de gasolina completa sin antes medir la presión con manómetro.'
    ]
  },
  {
    id: 'brake_squeal_vibe',
    badge: '🛑 Chillido o Vibración al Frenar',
    symptom: 'Los frenos de disco chillan fuerte o siento una pulsación/vibración en la manigueta al frenar.',
    diagnosisTitle: 'Pastillas Cristalizadas / Agotadas o Disco con Alabeo Térmico',
    urgencyLevel: 'PRIORIDAD ALTA — SEGURIDAD ACTIVA DE FRENADO',
    canRideSafely: 'REVISA EL GROSOR DE PASTILLAS ANTES DE SALIR A RUTA',
    estimatedCostCOP: '$40.000 – $120.000 COP (US$10 – US$30)',
    technicalExplanation: 'Si el chillido es agudo pero frena parejo, las pastillas están cristalizadas o sucias con polvo metálico. Si sientes que el metal roza o que la manigueta bombea/vibra, las pastillas llegaron al límite de 1.5 mm o los pasadores de la mordaza (caliper) requieren grasa siliconada.',
    mechanicChecklist: [
      'Inspecciona visualmente la ranura testigo de las pastillas delanteras y traseras.',
      'Pide limpieza de mordaza y lubricación de pines deslizantes + cambio de líquido de frenos DOT 4 si está oscuro.'
    ]
  },
  {
    id: 'chain_clunk',
    badge: '⛓️ Traqueteo en Kit de Arrastre',
    symptom: 'Siento un golpe o traqueteo debajo de los posapiés al soltar el acelerador o pasar por baches.',
    diagnosisTitle: 'Cadena Destemplada con Eslabones Rígidos o Cauchos de Porta-Sprocket (Camping) Gastados',
    urgencyLevel: 'PRECAUCIÓN ALTA — RIESGO DE SALIDA DE CADENA',
    canRideSafely: 'TENSIONA Y LUBRICA ANTES DE RODAR A ALTA VELOCIDAD',
    estimatedCostCOP: '$20.000 – $60.000 COP (US$5 – US$15)',
    technicalExplanation: 'Cuando la cadena supera los 30-35 mm de holgura o los cauchos amortiguadores de la campana trasera (dampers) tienen juego, se siente un golpe seco al acelerar/desacelerar.',
    mechanicChecklist: [
      'Ajusta la holgura de la cadena entre 20 mm y 25 mm verificando que las marcas del tijeral queden exactamente iguales a ambos lados.',
      'Revisa los cauchos del porta-sprocket trasero (cuestan muy poco y eliminan el golpe al meter cambios).'
    ]
  },
  {
    id: 'weak_battery_start',
    badge: '🔋 Arranque Débil / Testigo Batería',
    symptom: 'En las mañanas el arranque eléctrico gira lento, el tablero TFT parpadea al dar start o cuesta prender.',
    diagnosisTitle: 'Batería con Voltaje en Reposo Bajo (<12.2V) o Regulador/Estator',
    urgencyLevel: 'PRECAUCIÓN MEDIA — RIESGO DE QUEDAR VARADO',
    canRideSafely: 'MIDE VOLTAJE CON MULTÍMETRO (13.8V A 14.4V EN MARCHA)',
    estimatedCostCOP: '$140.000 – $260.000 COP si requiere batería nueva',
    technicalExplanation: 'Las motos con tablero TFT, ABS e inyección electrónica requieren al menos 12.4V en reposo. Si al acelerar a 4.000 RPM el voltaje sube entre 13.8V y 14.4V, el sistema de carga (estator y regulador) está perfecto y solo es la batería agotada o bornes sulfatados.',
    mechanicChecklist: [
      'Antes de comprar batería nueva, pide medir con multímetro: 1) Voltaje apagada (>12.4V) y 2) Voltaje a 4.000 RPM (13.8V - 14.4V).',
      'Aprieta y limpia los bornes de la batería y el relé de arranque (cochinito).'
    ]
  }
];

export async function diagnoseMechanicalSymptomAI({
  symptom,
  bikeBrand = 'TVS',
  bikeModel = 'Apache RTR 160 4V FI NG',
  odometer = 5000,
  lang = 'es'
}) {
  const isEn = lang === 'en';
  const prompt = isEn
    ? `You are "Doctor Motor AI", the master motorcycle mechanic of MotoDash AI specialized in ${bikeBrand} ${bikeModel} (${odometer} km).
Analyze the rider's mechanical symptom or noise: "${symptom}".
Return STRICTLY pure JSON without markdown blocks using this schema:
{
  "diagnosisTitle": "Exact likely mechanical cause",
  "urgencyLevel": "LOW RISK / MEDIUM CAUTION / CRITICAL — DO NOT RIDE",
  "canRideSafely": "Clear instruction on whether it is safe to ride to the shop",
  "estimatedCostCOP": "Fair repair price range in USD and COP so the rider doesn't get overcharged",
  "technicalExplanation": "Clear mechanical explanation for ${bikeBrand} ${bikeModel}",
  "mechanicChecklist": [
    "Step 1 to tell the mechanic or verify first",
    "Step 2 to avoid unnecessary part replacements",
    "Step 3 preventive tip"
  ]
}`
    : `Eres "Doctor Motor IA", el jefe de taller e ingeniero mecánico experto de MotoDash AI especializado en ${bikeBrand} ${bikeModel} (${odometer} km).
Analiza el síntoma, ruido o falla que describe el piloto: "${symptom}".
Responde ESTRICTAMENTE en JSON puro sin bloques markdown con esta estructura:
{
  "diagnosisTitle": "Causa mecánica más probable y exacta",
  "urgencyLevel": "RIESGO BAJO / PRECAUCIÓN MEDIA / CRÍTICO — NO RODAR",
  "canRideSafely": "Indica claramente si puede seguir rodando hasta el taller o si debe pedir grúa",
  "estimatedCostCOP": "Rango de precio justo estimado en COP y USD para que no lo engañen en el taller",
  "technicalExplanation": "Explicación técnica clara adaptada a la ${bikeBrand} ${bikeModel}",
  "mechanicChecklist": [
    "Paso 1 exacto para pedirle al mecánico que revise primero",
    "Paso 2 para evitar que le cobren repuestos innecesarios",
    "Paso 3 de mantenimiento preventivo"
  ]
}`;

  // 1. Intentar primero el AI Gateway seguro del servidor (/api/ai-gateway)
  try {
    const gatewayRes = await fetch('/api/ai-gateway', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, temperature: 0.2 })
    });
    if (gatewayRes.ok) {
      const payload = await gatewayRes.json();
      if (payload?.data?.diagnosisTitle) {
        return {
          ...payload.data,
          source: `Doctor Motor IA • Servidor Seguro (${bikeBrand} ${bikeModel})`
        };
      }
    }
  } catch {}

  // 2. Fallback directo si hay llave pública en entorno dev o motor mecánico determinístico
  const sLower = String(symptom).toLowerCase();
  if (sLower.includes('cascabel') || sLower.includes('valvul') || sLower.includes('válvul') || sLower.includes('cadenilla') || sLower.includes('tic')) {
    return { ...QUICK_MECHANICAL_SYMPTOMS[0], source: `Base Mecánica Oficial (${bikeBrand} ${bikeModel})` };
  }
  if (sLower.includes('caja') || sLower.includes('cambio') || sLower.includes('neutro') || sLower.includes('clutch') || sLower.includes('embrague')) {
    return { ...QUICK_MECHANICAL_SYMPTOMS[1], source: `Base Mecánica Oficial (${bikeBrand} ${bikeModel})` };
  }
  if (sLower.includes('ahoga') || sLower.includes('jalon') || sLower.includes('fuerza') || sLower.includes('inyector') || sLower.includes('bujia')) {
    return { ...QUICK_MECHANICAL_SYMPTOMS[2], source: `Base Mecánica Oficial (${bikeBrand} ${bikeModel})` };
  }
  if (sLower.includes('freno') || sLower.includes('chilla') || sLower.includes('pastilla') || sLower.includes('disco')) {
    return { ...QUICK_MECHANICAL_SYMPTOMS[3], source: `Base Mecánica Oficial (${bikeBrand} ${bikeModel})` };
  }
  if (sLower.includes('cadena') || sLower.includes('arrastre') || sLower.includes('sprocket') || sLower.includes('traqueteo')) {
    return { ...QUICK_MECHANICAL_SYMPTOMS[4], source: `Base Mecánica Oficial (${bikeBrand} ${bikeModel})` };
  }
  if (sLower.includes('bateria') || sLower.includes('batería') || sLower.includes('arranque') || sLower.includes('prende')) {
    return { ...QUICK_MECHANICAL_SYMPTOMS[5], source: `Base Mecánica Oficial (${bikeBrand} ${bikeModel})` };
  }

  return {
    diagnosisTitle: `Inspección Electromecánica Sugerida para ${bikeBrand} ${bikeModel}`,
    urgencyLevel: 'PRECAUCIÓN MEDIA — VERIFICAR ANTES DE RUTA LARGA',
    canRideSafely: 'SI NO HAY TESTIGO ROJO DE PRESIÓN DE ACEITE NI BLOQUEO, LLEVA AL TALLER A BAJAS RPM',
    estimatedCostCOP: '$45.000 – $150.000 COP (Diagnóstico y ajuste estándar)',
    technicalExplanation: `Para el síntoma reportado ("${symptom}") en tu ${bikeBrand} ${bikeModel} con ${odometer.toLocaleString()} km, se recomienda revisar primero los puntos de ajuste externo (tensión, lubricación, conectores eléctricos y nivel de aceite) antes de autorizar el desarme de componentes internos.`,
    mechanicChecklist: [
      'Pide diagnóstico con escáner o revisión visual frente a ti antes de autorizar cambio de piezas.',
      'Verifica que el nivel de aceite esté entre las marcas Mín y Máx con la moto vertical.',
      'Exige que te entreguen los repuestos reemplazados para conservar tu historial en MotoDash AI.'
    ],
    source: `Motor Experto Doctor Motor IA (${bikeBrand})`
  };
}
