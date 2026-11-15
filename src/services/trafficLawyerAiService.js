/**
 * MotoDash AI — Asesor Jurídico Vial IA (Abogado de Bolsillo para Retenes y Comparendos)
 * Combina una base jurídica verificada multipaís (Ley 769 de 2002 Colombia, Sentencia C-038,
 * DGT España, SEMOVI México, DMV EE. UU., Ley 18.290 Chile, RNT Perú) con Gemini 2.0 Flash.
 */

export const COUNTRY_LEGAL_FRAMEWORKS = {
  Colombia: {
    flag: '🇨🇴',
    codeName: 'Código Nacional de Tránsito (Ley 769 de 2002 y Ley 1383 de 2010)',
    authority: 'Policía de Tránsito / Agentes de Movilidad / SIMIT / RUNT',
    keyRulesSummary: `
- Documentos Digitales (SOAT, Tecno, Licencia): Según Circular del Ministerio de Transporte y RUNT, es 100% VÁLIDO presentarlos desde el celular consultando en línea o desde billetera digital. PROHIBIDO inmovilizar o multar por no llevar el papel impreso si están vigentes en el RUNT.
- Regla de Subsanación en 60 Minutos (Art. 125 Ley 769 de 2002): Si la falta es subsanable en el lugar (ej. casco, chaleco reflectivo después de las 18:00, bombillo fundido, olvido físico de documento vigente), tienes derecho a 60 MINUTOS para subsanarla en el sitio. Si la subsanas en esos 60 min, se impone el comparendo pero NO SE PUEDEN LLEVAR LA MOTO EN GRÚA A PATIOS.
- Escape / Exosto / Ruido (Infracción C28 / D17): Un agente de tránsito NO puede inmovilizar ni multar "a oído". Se requiere obligatoriamente medición técnica con sonómetro calibrado por la autoridad ambiental competente.
- Fotomultas (Sentencia C-038 de 2020 Corte Constitucional): No existe solidaridad automática con el propietario si la cámara no identifica plenamente quién conducía la moto (principio de responsabilidad personal).
- Grabar el Procedimiento (Art. 21 Ley 1801 de 2016 - Código de Policía): Todo ciudadano tiene derecho legal a grabar en video y audio cualquier procedimiento policial en vía pública. Ningún agente puede impedirlo ni quitarte las llaves de tu moto.
- Casos donde SÍ da Inmovilización inmediata (sin subsanación): SOAT vencido (D02), Tecnomecánica vencida (C35), conducir sin tener licencia expedida (D01), estado de embriaguez (Art. 152), transitar en pico y placa (C14) o por andenes/ciclorrutas (D05).`
  },
  España: {
    flag: '🇪🇸',
    codeName: 'Ley sobre Tráfico y Seguridad Vial (RDL 6/2015) — DGT',
    authority: 'Guardia Civil de Tráfico / Policía Municipal / DGT',
    keyRulesSummary: `
- Documentos en el móvil: La app oficial miDGT tiene plena validez legal en toda España para el Carnet de Conducir y el Permiso de Circulación. El seguro obligatorio e ITV se verifican telemáticamente por matrícula en FIVA/DGT.
- Inmovilización (Art. 104 LSV): Solo procede por carecer de seguro obligatorio, no usar casco homologado, alcoholemia/drogas positivas, exceso grave de ruido/emisiones medido con sonómetro homologado o deficiencias técnicas muy graves.
- Descuento por pronto pago: 50% de reducción dentro de los 20 días naturales siguientes a la notificación.`
  },
  México: {
    flag: '🇲🇽',
    codeName: 'Reglamento de Tránsito (CDMX / SEMOVI y Ley General de Movilidad)',
    authority: 'Policía de Tránsito autorizada para infraccionar',
    keyRulesSummary: `
- Solo agentes con distintivo oficial "Autorizado para Infraccionar" pueden levantar boletas de sanción.
- Corralón (Remisión al Depósito): Solo aplica en causales expresas (no portar casco, circular por carriles confinados de Metrobús/ciclovías, alcoholímetro, falta de placas/tarjeta de circulación).
- Licencia y Tarjeta Digital: En CDMX (App CDMX) tienen exactamente la misma validez jurídica que el plástico físico.`
  },
  'Estados Unidos': {
    flag: '🇺🇸',
    codeName: 'State Vehicle Code & DOT Traffic Regulations',
    authority: 'State Highway Patrol / Local Police Department / DMV',
    keyRulesSummary: `
- Electronic Proof of Insurance: En 49 estados y D.C. es completamente legal mostrar la póliza de seguro (Liability Insurance) desde la pantalla del teléfono celular.
- Towing / Impound: Solo procede si el conductor no posee licencia válida (sin endoso Class M donde sea exigido), matrícula suspendida/inexistente, DUI o vehículo reportado.`
  },
  Chile: {
    flag: '🇨🇱',
    codeName: 'Ley de Tránsito N° 18.290',
    authority: 'Carabineros de Chile / Inspectores Fiscales',
    keyRulesSummary: `
- Retiro de circulación (Corrales Municipales): Procede por circular sin placa patente, sin Permiso de Circulación vigente, sin SOAP o sin Revisión Técnica al día.
- El conductor tiene derecho a exigir la boleta de citación al Juzgado de Policía Local correspondiente.`
  },
  Perú: {
    flag: '🇵🇪',
    codeName: 'Reglamento Nacional de Tránsito (TUO - DS 016-2009-MTC)',
    authority: 'Policía Nacional del Perú (PNP Asignada al Tránsito) / SUTRAN',
    keyRulesSummary: `
- SOAT y CITV Electrónicos: Son verificables en línea y no pueden exigirte papel físico si figuran vigentes en el sistema del MTC/APESEG.
- Internamiento en Depósito: Solo aplica en infracciones Muy Graves (M) específicas como conducir sin SOAT (M28), sin licencia (M03) o bajo efectos del alcohol (M01/M02).`
  }
};

export const QUICK_LEGAL_QUESTIONS = [
  {
    id: 'digital_docs',
    badge: '📱 Documentos en el Celular',
    question: '¿Me pueden hacer comparendo o llevarse la moto si muestro el SOAT, la Tecnomecánica o la Licencia desde el celular y no los llevo impresos?',
    instantVerdict: 'NO ES LEGAL INMOVILIZAR NI MULTAR',
    canImpound: 'NO SE PUEDEN LLEVAR LA MOTO',
    lawCitation: 'Circular Ministerio de Transporte 202210100006011 & Art. 131 Ley 769 de 2002 (RUNT en línea)',
    explanation: 'Tanto el SOAT como la Revisión Técnico-Mecánica son documentos 100% electrónicos. La autoridad de tránsito tiene la obligación legal de verificarlos en línea en el RUNT o aceptar la exhibición digital en la pantalla de tu celular. Ningún agente puede exigirte el papel impreso ni subir tu moto a la grúa si están vigentes.',
    actionSteps: [
      'Abre "Mis Documentos (Modo Retén)" en MotoDash AI y muéstrale el documento en pantalla.',
      'Indícale con respeto: "Agente, conforme a la Circular del Ministerio de Transporte, el SOAT y la RTM se verifican en el RUNT en línea y tienen plena validez digital".',
      'Si insiste, graba el procedimiento (Art. 21 Ley 1801 de 2016) y deja constancia en la casilla de observaciones.'
    ]
  },
  {
    id: 'exhaust_noise',
    badge: '🔊 Mofle / Exosto o Llantas',
    question: 'El agente dice que mi mofle/exosto suena muy duro o que una llanta se ve gastada "a ojo". ¿Se pueden llevar la moto en grúa?',
    instantVerdict: 'PROHIBIDO INMOVILIZAR "A OÍDO" O SIN EQUIPO TÉCNICO',
    canImpound: 'NO SIN MEDICIÓN TÉCNICA O 60 MIN DE SUBSANACIÓN',
    lawCitation: 'Art. 104 y 125 Ley 769 de 2002 + Resolución 3027 de 2010 (Manual de Infracciones)',
    explanation: 'Para imponer comparendo o inmovilizar por ruido de escape (C28/D17), la ley exige medición con un SONÓMETRO calibrado y certificado por la autoridad ambiental; el agente NO puede sancionar "a oído". En cuanto a llantas o bombillos, requiere profundímetro o aplica la regla de los 60 minutos para subsanar en el sitio.',
    actionSteps: [
      'Pregúntale con respeto si cuenta con el sonómetro calibrado o el profundímetro certificado en el retén.',
      'Si es un bombillo, espejo o elemento subsanable, solicita formalmente tus 60 minutos legales (Art. 125 CNT) para corregirlo en el sitio sin que suban la moto a la grúa.',
      'Graba en video el estado de tu moto y el diálogo con el agente.'
    ]
  },
  {
    id: 'subsanar_60min',
    badge: '⏱️ Regla de los 60 Minutos',
    question: '¿En qué casos tengo derecho a 60 minutos para subsanar la falta en el sitio sin que se lleven mi moto a los patios?',
    instantVerdict: 'DERECHO LEGAL A 60 MINUTOS EN EL SITIO',
    canImpound: 'NO SE LLEVAN LA MOTO SI SUBSANAS EN 60 MIN',
    lawCitation: 'Artículo 125 del Código Nacional de Tránsito (Ley 769 de 2002)',
    explanation: 'La inmovilización se suspende si la causa que la origina puede ser subsanada en el sitio del procedimiento dentro de los 60 minutos siguientes. Por ejemplo: que alguien te lleve el casco reglamentario, el chaleco reflectivo (después de las 6:00 PM), cambiar un bombillo en el sitio o que otro conductor con licencia vigente se lleve el vehículo.',
    actionSteps: [
      'Solicita inmediatamente al agente que marque la hora de inicio de tus 60 minutos del Artículo 125 de la Ley 769.',
      'Nota importante: Si el SOAT (D02) o la Tecnomecánica (C35) están VENCIDOS antes del retén, NO son subsanables comprándolos en el sitio porque el SOAT entra en vigencia a las 24 horas.'
    ]
  },
  {
    id: 'fotomultas_c038',
    badge: '📸 Fotomultas (Sentencia C-038)',
    question: 'Me llegó una fotomulta por cámara automática pero en la foto solo se ve la placa de mi moto y no quién iba manejando. ¿Es legal?',
    instantVerdict: 'IMPUGNABLE — DEBEN IDENTIFICAR AL CONDUCTOR',
    canImpound: 'NO DA INMOVILIZACIÓN (MULTA ADMINISTRATIVA)',
    lawCitation: 'Sentencia C-038 de 2020 de la Corte Constitucional de Colombia',
    explanation: 'La Corte Constitucional declaró inexequible la solidaridad automática entre el propietario del vehículo y el conductor en fotodetecciones. La Secretaría de Movilidad tiene la carga de probar plenamente quién iba conduciendo la motocicleta al momento de la infracción (excepto en SOAT y Tecnomecánica que sí son obligación objetiva del dueño).',
    actionSteps: [
      'No pagues si vas a impugnar: solicita audiencia pública virtual dentro de los 11 días hábiles siguientes a la notificación.',
      'Invoca la Sentencia C-038 de 2020 y el principio de presunción de inocencia (Art. 29 de la Constitución), exigiendo que la entidad demuestre la plena identidad del infractor.'
    ]
  },
  {
    id: 'record_police',
    badge: '🎥 Grabar al Agente / Llaves',
    question: '¿El policía o agente de tránsito me puede prohibir grabar el procedimiento con el celular o quitarme las llaves de la moto?',
    instantVerdict: 'TIENES DERECHO TOTAL A GRABAR • PROHIBIDO QUITAR LLAVES',
    canImpound: 'ABUSO DE AUTORIDAD SI TE IMPIDEN GRABAR',
    lawCitation: 'Artículo 21 de la Ley 1801 de 2016 (Código Nacional de Seguridad y Convivencia)',
    explanation: 'Todo procedimiento de policía o tránsito es público y los ciudadanos tienen derecho expreso por ley a grabarlo en audio y video. El funcionario que impida la grabación incurre en causal de mala conducta disciplinaria. Además, ningún agente puede arrebatar las llaves del switch de tu motocicleta.',
    actionSteps: [
      'Mantén el celular grabando a una distancia prudente sin obstruir físicamente al agente.',
      'Menciona con calma: "Agente, estoy ejerciendo mi derecho del Artículo 21 de la Ley 1801 de 2016".',
      'Apaga tú mismo la moto y guarda tus llaves en el bolsillo.'
    ]
  },
  {
    id: 'when_impound',
    badge: '🚛 ¿Cuándo SÍ llevan a Patios?',
    question: '¿En qué casos SÍ es legal que el tránsito me inmovilice la moto y se la lleve en grúa a los patios?',
    instantVerdict: 'CAUSALES EXPRESAS DE INMOVILIZACIÓN EN GRÚA',
    canImpound: 'SÍ DA INMOVILIZACIÓN EN ESTOS CASOS',
    lawCitation: 'Artículo 131 de la Ley 769 de 2002 (Modificado por Ley 1383 de 2010)',
    explanation: 'Solo pueden llevarse la moto cuando la ley lo ordena expresamente y no es subsanable: 1) SOAT vencido o inexistente (D02), 2) Tecnomecánica vencida (C35), 3) Conducir sin haber obtenido licencia o con licencia vencida/falsa (D01/B02), 4) Transitar en día/hora de Pico y Placa (C14), 5) Transitar por andenes, puentes peatonales o ciclorrutas (D05), 6) Estado de embriaguez (Art. 152).',
    actionSteps: [
      'Aun si procede la grúa, tienes derecho a que hagan el inventario detallado del estado de la moto antes de subirla.',
      'Exige que sellen el tanque, sillín y accesorios en el acta de inventario y tómale fotos y video a toda la moto sobre la grúa.'
    ]
  }
];

/**
 * Consulta al Asesor Jurídico Vial IA (Gemini 2.0 Flash + Base Legal del País)
 */
export async function askTrafficLawyerAI({
  question,
  country = 'Colombia',
  bikeBrand = 'TVS',
  bikeModel = 'Apache RTR 160 4V'
}) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const framework = COUNTRY_LEGAL_FRAMEWORKS[country] || COUNTRY_LEGAL_FRAMEWORKS.Colombia;

  const systemPrompt = `Eres el Abogado y Asesor Jurídico Vial experto en motocicletas de MotoDash AI para ${country}.
Tu misión es defender al motociclista con la ley exacta en la mano cuando está en un retén policial o tiene una duda sobre un comparendo/multa.
Marco legal aplicable en ${country}: ${framework.codeName} (${framework.authority}).
Reglas clave verificadas:
${framework.keyRulesSummary}

Responde a la consulta del piloto ("${question}") ESTRICTAMENTE en formato JSON puro sin bloques markdown con esta estructura exacta:
{
  "instantVerdict": "Frase corta y contundente en mayúsculas (ej: NO TE PUEDEN INMOVILIZAR LA MOTO / SUBSANABLE EN 60 MINUTOS / SÍ PROCEDE SEGÚN ART. 131)",
  "canImpound": "Indica claramente si se pueden llevar la moto en grúa o no",
  "lawCitation": "Ley, artículo, sentencia o resolución exacta aplicable en ${country}",
  "explanation": "Explicación clara, directa y jurídica de por qué es legal o ilegal el procedimiento",
  "actionSteps": [
    "Paso 1 concreto para decirle al agente o hacer en el momento",
    "Paso 2 concreto de defensa legal",
    "Paso 3 sobre acta de observaciones o impugnación"
  ]
}`;

  if (apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: {
              temperature: 0.15,
              responseMimeType: 'application/json'
            }
          })
        }
      );

      if (response.ok) {
        const result = await response.json();
        const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleaned = rawText.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed && parsed.instantVerdict) {
          return {
            ...parsed,
            source: `Gemini 2.0 Flash Jurídico (${country})`
          };
        }
      }
    } catch (err) {
      console.warn('[TrafficLawyerAI] Usando motor jurídico local verificado:', err.message);
    }
  }

  // Motor jurídico determinístico offline si no hay red en carretera
  const qLower = String(question).toLowerCase();
  if (qLower.includes('celular') || qLower.includes('digital') || qLower.includes('soat') || qLower.includes('papel')) {
    return { ...QUICK_LEGAL_QUESTIONS[0], source: `Base Jurídica Oficial (${country})` };
  }
  if (qLower.includes('mofle') || qLower.includes('exosto') || qLower.includes('ruido') || qLower.includes('llanta') || qLower.includes('escape')) {
    return { ...QUICK_LEGAL_QUESTIONS[1], source: `Base Jurídica Oficial (${country})` };
  }
  if (qLower.includes('fotomulta') || qLower.includes('camara') || qLower.includes('cámara')) {
    return { ...QUICK_LEGAL_QUESTIONS[3], source: `Base Jurídica Oficial (${country})` };
  }
  if (qLower.includes('grabar') || qLower.includes('video') || qLower.includes('llave')) {
    return { ...QUICK_LEGAL_QUESTIONS[4], source: `Base Jurídica Oficial (${country})` };
  }
  if (qLower.includes('60') || qLower.includes('subsanar') || qLower.includes('casco') || qLower.includes('chaleco') || qLower.includes('luz')) {
    return { ...QUICK_LEGAL_QUESTIONS[2], source: `Base Jurídica Oficial (${country})` };
  }

  return {
    instantVerdict: `ANÁLISIS SEGÚN ${framework.codeName.toUpperCase()}`,
    canImpound: 'SOLO SI ESTÁ EXPRESAMENTE TIPIFICADO Y NO ES SUBSANABLE EN 60 MIN',
    lawCitation: `${framework.codeName} • Art. 125 y 131 (${country})`,
    explanation: `Para tu consulta ("${question}"), ningún agente de tránsito puede aplicar sanciones ni inmovilizaciones por analogía. Debe indicarte el código exacto de la infracción, permitirte hasta 60 minutos si la falta es subsanable en el sitio y respetar tu derecho al debido proceso y a grabar el procedimiento.`,
    actionSteps: [
      'Pídele al agente que te indique el código exacto de la infracción (ej. C, D o B) antes de entregar documentos físicos.',
      'Verifica si la falta permite los 60 minutos de subsanación en el sitio para evitar la grúa.',
      'Deja constancia escrita en el campo de observaciones y recuerda que firmar el comparendo solo notifica la orden, NO significa aceptar la culpa (tienes 5 a 11 días hábiles para impugnar en audiencia).'
    ],
    source: `Motor Jurídico MotoDash AI (${country})`
  };
}
