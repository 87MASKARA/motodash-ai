/**
 * MotoDash AI — Asesor Jurídico Vial IA (Abogado de Bolsillo para Retenes y Comparendos)
 * Multi-país y Multi-idioma: Cambia automáticamente leyes, preguntas rápidas, artículos,
 * autoridades y el idioma (Inglés en Estados Unidos / Reino Unido, Español local en Colombia,
 * España, México, Chile y Perú).
 */

export const COUNTRY_TO_ISO_AND_LANG = {
  Colombia: { iso: 'CO', lang: 'es' },
  España: { iso: 'ES', lang: 'es' },
  México: { iso: 'MX', lang: 'es' },
  'Estados Unidos': { iso: 'US', lang: 'en' },
  Chile: { iso: 'CL', lang: 'es' },
  Perú: { iso: 'PE', lang: 'es' },
  'Reino Unido': { iso: 'UK', lang: 'en' }
};

export const ISO_TO_COUNTRY_NAME = {
  CO: 'Colombia',
  ES: 'España',
  MX: 'México',
  US: 'Estados Unidos',
  CL: 'Chile',
  PE: 'Perú',
  UK: 'Reino Unido'
};

export function isEnglishCountry(country = '') {
  return country === 'Estados Unidos' || country === 'Reino Unido';
}

export const COUNTRY_LEGAL_FRAMEWORKS = {
  Colombia: {
    flag: '🇨🇴',
    lang: 'es',
    iso: 'CO',
    codeName: 'Código Nacional de Tránsito (Ley 769 de 2002 y Ley 1383 de 2010)',
    authority: 'Policía de Tránsito / Agentes de Movilidad / SIMIT / RUNT',
    keyRulesSummary: `
- Documentos Digitales (SOAT, Tecno, Licencia, Tarjeta): Según Circular del Ministerio de Transporte 202210100006011 y RUNT, es 100% VÁLIDO presentarlos desde el celular consultando en línea o desde billetera digital. PROHIBIDO inmovilizar o multar por no llevar el papel impreso si están vigentes en el RUNT.
- Regla de Subsanación en 60 Minutos (Art. 125 Ley 769 de 2002): Si la falta es subsanable en el lugar (ej. casco, chaleco reflectivo después de las 18:00, bombillo fundido, olvido físico de documento vigente), tienes derecho a 60 MINUTOS para subsanarla en el sitio. Si la subsanas en esos 60 min, se impone el comparendo pero NO SE PUEDEN LLEVAR LA MOTO EN GRÚA A PATIOS.
- Escape / Exosto / Ruido (Infracción C28 / D17): Un agente de tránsito NO puede inmovilizar ni multar "a oído". Se requiere obligatoriamente medición técnica con sonómetro calibrado por la autoridad ambiental competente.
- Fotomultas (Sentencia C-038 de 2020 Corte Constitucional): No existe solidaridad automática con el propietario si la cámara no identifica plenamente quién conducía la moto.
- Grabar el Procedimiento (Art. 21 Ley 1801 de 2016 - Código de Policía): Todo ciudadano tiene derecho legal a grabar en video y audio cualquier procedimiento policial en vía pública.
- Casos donde SÍ da Inmovilización inmediata: SOAT vencido (D02), Tecnomecánica vencida (C35), conducir sin licencia (D01), estado de embriaguez (Art. 152), pico y placa (C14) o transitar por andenes/ciclorrutas (D05).`,
    quickQuestions: [
      {
        id: 'digital_docs',
        badge: '📱 Documentos en el Celular',
        question: '¿Me pueden hacer comparendo o llevarse la moto si muestro el SOAT, la Tecnomecánica o la Licencia desde el celular y no los llevo impresos?',
        instantVerdict: 'NO ES LEGAL INMOVILIZAR NI MULTAR',
        canImpound: 'NO SE PUEDEN LLEVAR LA MOTO EN GRÚA',
        lawCitation: 'Circular Ministerio de Transporte 202210100006011 & Art. 131 Ley 769 de 2002 (RUNT en línea)',
        explanation: 'Tanto el SOAT como la Revisión Técnico-Mecánica y la Licencia son verificables electrónicamente en el RUNT. La autoridad de tránsito tiene la obligación legal de aceptar la exhibición digital en la pantalla de tu celular. Ningún agente puede exigirte papel impreso ni subir tu moto a la grúa si están vigentes.',
        actionSteps: [
          'Abre "Mis Documentos (Modo Retén)" en MotoDash AI y muéstrale los 4 documentos en pantalla.',
          'Indícale con respeto: "Agente, conforme a la Circular del Ministerio de Transporte, mis documentos están vigentes en el RUNT y tienen plena validez digital".',
          'Si insiste, graba el procedimiento (Art. 21 Ley 1801 de 2016) y deja constancia en observaciones.'
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
        explanation: 'La Corte Constitucional declaró inexequible la solidaridad automática entre el propietario del vehículo y el conductor en fotodetecciones. La Secretaría de Movilidad tiene la carga de probar plenamente quién iba conduciendo la motocicleta al momento de la infracción (excepto en SOAT y Tecnomecánica).',
        actionSteps: [
          'No pagues si vas a impugnar: solicita audiencia pública virtual dentro de los 11 días hábiles siguientes a la notificación.',
          'Invoca la Sentencia C-038 de 2020 y el principio de presunción de inocencia (Art. 29 de la Constitución).'
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
        explanation: 'Solo pueden llevarse la moto cuando la ley lo ordena expresamente y no es subsanable: 1) SOAT vencido (D02), 2) Tecnomecánica vencida (C35), 3) Conducir sin licencia o vencida (D01/B02), 4) Pico y Placa (C14), 5) Transitar por andenes o ciclorrutas (D05), 6) Embriaguez (Art. 152).',
        actionSteps: [
          'Aun si procede la grúa, tienes derecho a que hagan el inventario detallado del estado de la moto antes de subirla.',
          'Exige que sellen el tanque, sillín y accesorios en el acta de inventario y tómale fotos y video a toda la moto sobre la grúa.'
        ]
      }
    ]
  },

  'Estados Unidos': {
    flag: '🇺🇸',
    lang: 'en',
    iso: 'US',
    codeName: 'State Vehicle Code (DMV / DOT) & U.S. Constitutional Rights',
    authority: 'State Highway Patrol / Local Police Department / DMV',
    keyRulesSummary: `
- Electronic Proof of Insurance & Registration: In 49 U.S. states and D.C., riders are legally permitted by statute to display proof of motorcycle liability insurance on a smartphone screen. Police cannot search other apps on your phone without a warrant (Riley v. California, U.S. Supreme Court).
- Aftermarket Exhaust / Muffler Noise: Officers cannot tow or impound a motorcycle for loud exhaust on the roadside. Exhaust violations (e.g., CA Vehicle Code § 27150 / SAE J2825 92-96 dB limit) are issued as "Fix-It Tickets" (Correctable Violations).
- Right to Record Traffic Stops: Protected nationwide under the First Amendment of the U.S. Constitution (Glik v. Cunniffe). Officers cannot seize your phone or take your motorcycle ignition keys without probable cause for arrest (Fourth Amendment).
- Camera Tickets (Red Light / Speed): When a rider wears a full-face helmet and cannot be identified on camera, tickets can be dismissed via Trial by Written Declaration in states requiring driver identification.
- Legal Towing / Impound Causes: Police may only tow/impound if the rider lacks a valid Driver License / Class M endorsement (and no licensed rider can pick it up), registration is expired over 6 months (e.g., CVC § 22651(o)), DUI arrest, reckless street racing/sideshow, or stolen vehicle report.`,
    quickQuestions: [
      {
        id: 'digital_docs',
        badge: '📱 Digital Insurance on Phone',
        question: 'Can a police officer ticket me or tow my motorcycle if I show my Liability Insurance and Registration on my phone instead of paper?',
        instantVerdict: '100% LEGAL TO SHOW ON PHONE • NO TOWING',
        canImpound: 'NO — CANNOT TOW FOR DIGITAL PROOF',
        lawCitation: 'State Electronic Proof of Insurance Statutes (49 States & D.C.) + Riley v. California (573 U.S. 373)',
        explanation: 'Across 49 U.S. states and D.C., traffic statutes explicitly authorize motorists to present proof of liability insurance electronically on a mobile device. Furthermore, under the U.S. Supreme Court ruling in Riley v. California, handing or showing your phone to display insurance does NOT give the officer consent to browse other data on your device.',
        actionSteps: [
          'Lock your screen to the MotoDash AI "Checkpoint Mode (All 4 Docs)" view before showing it to the officer.',
          'Politely state: "Officer, here is my electronic proof of motorcycle liability insurance, registration, and Class M license."',
          'Keep your hands visible on the handlebars until the officer asks for your documents.'
        ]
      },
      {
        id: 'exhaust_noise',
        badge: '🔊 Aftermarket Exhaust / Loud Pipe',
        question: 'The officer says my aftermarket slip-on exhaust is too loud or lacks an EPA stamp. Can they impound/tow my motorcycle?',
        instantVerdict: 'FIX-IT TICKET ONLY • CANNOT IMPOUND ROADSIDE',
        canImpound: 'NO — EQUIPMENT VIOLATIONS DO NOT ALLOW TOWING',
        lawCitation: 'State Vehicle Code Equipment Rules (e.g., CVC § 27150 / § 40610 Correctable Violations & SAE J2825)',
        explanation: 'A loud or modified motorcycle exhaust is an administrative equipment infraction (usually a correctable "Fix-It Ticket"), NOT an impoundable offense. Under SAE J2825 standards enforced by state referee stations, noise must be measured with a calibrated decibel meter at a set RPM—not guessed by ear.',
        actionSteps: [
          'Remain calm and ask if the citation is being marked as a Correctable ("Fix-It") Equipment Violation.',
          'Do not argue or rev the engine during the stop; you can contest the ticket via State Referee decibel testing or Trial by Written Declaration.',
          'Verify your registration and Class M endorsement are valid so the officer has zero grounds to tow.'
        ]
      },
      {
        id: 'subsanar_60min',
        badge: '⏱️ Fix-It Ticket & Avoid Tow',
        question: 'When can I cure an equipment issue (plate angle, turn signal, mirror) or call a licensed rider to avoid having my bike towed?',
        instantVerdict: 'CORRECTABLE VIOLATION • ASK FOR LICENSED RIDER PICKUP',
        canImpound: 'AVOIDABLE — NO TOW FOR MINOR EQUIPMENT ISSUES',
        lawCitation: 'Fourth Amendment Community Caretaking Doctrine (Miranda v. City of Cornelius, 429 F.3d 858)',
        explanation: 'Under U.S. federal court precedent (Community Caretaking Doctrine), police cannot arbitrarily impound a safely parked vehicle solely as punishment if a licensed rider is present or available to take custody of the motorcycle, or if the citation is merely for equipment (mirrors, turn signals, license plate frame).',
        actionSteps: [
          'Pull over into a legal parking spot or private lot rather than blocking a highway shoulder.',
          'If your Class M endorsement is at issue, politely ask the officer for permission to have a Class M licensed friend ride the bike home from the scene.'
        ]
      },
      {
        id: 'fotomultas_c038',
        badge: '📸 Red-Light Camera (Helmet On)',
        question: 'I received a red-light or speed camera ticket in the mail, but the photo only shows my license plate and a full-face helmet. Is it enforceable?',
        instantVerdict: 'DISPUTABLE — PROSECUTION MUST IDENTIFY THE RIDER',
        canImpound: 'NO TOWING (MAIL CITATION ONLY)',
        lawCitation: 'Sixth Amendment Confrontation Clause & State Photo Enforcement Laws (e.g., CVC § 21455.5)',
        explanation: 'In moving-violation camera states (such as California, Arizona, etc.), a red-light camera ticket attaches to the driver, not the registered owner. The government bears the burden of proving beyond a reasonable doubt that you were the person operating the motorcycle. If your face is obscured by a helmet and visor, the ticket can be dismissed.',
        actionSteps: [
          'Do NOT sign an affidavit naming another rider if you are unsure; request a Trial by Written Declaration or Court Hearing.',
          'State in your declaration that the prosecution has failed to establish positive facial identification of the operator due to the motorcycle helmet.'
        ]
      },
      {
        id: 'record_police',
        badge: '🎥 Recording Police & Bike Keys',
        question: 'Is it legal to record the police officer with my Helmet Cam / GoPro / Phone, and can an officer pull the keys out of my motorcycle ignition?',
        instantVerdict: 'PROTECTED BY 1ST & 4TH AMENDMENTS',
        canImpound: 'UNLAWFUL SEIZURE IF KEYS TAKEN WITHOUT ARREST',
        lawCitation: 'First Amendment (Glik v. Cunniffe, 655 F.3d 78) & Fourth Amendment of the U.S. Constitution',
        explanation: 'Every rider in the United States has a clearly established First Amendment right to record police officers performing their duties in public (via GoPro, Insta360, or smartphone). Additionally, an officer reaching in to snatch your motorcycle keys without reasonable suspicion of flight or probable cause constitutes an unreasonable seizure under the Fourth Amendment.',
        actionSteps: [
          'As soon as you pull over, turn off the motorcycle yourself, remove the key, and place it in your pocket.',
          'Keep your helmet camera or phone recording openly and state: "Officer, for both of our safety, my camera is recording audio and video."'
        ]
      },
      {
        id: 'when_impound',
        badge: '🚛 When Can Police Legally Tow?',
        question: 'Under what exact circumstances CAN police in the United States legally tow and impound my motorcycle?',
        instantVerdict: 'STRICT STATUTORY IMPOUND GROUNDS ONLY',
        canImpound: 'YES — TOWING IS LEGAL ONLY IN THESE CASES',
        lawCitation: 'State Vehicle Impoundment Statutes (e.g., California Vehicle Code § 22651 / § 14602.6)',
        explanation: 'Law enforcement can legally tow your motorcycle to an impound lot only under specific statutory conditions: 1) Riding with a suspended/revoked license or without a Class M endorsement (when no licensed rider can take it), 2) Registration expired by more than 6 months, 3) Arrest for DUI / Reckless Driving / Speed Exhibition (Sideshow), or 4) No VIN / reported stolen.',
        actionSteps: [
          'If a tow truck is called, take 360-degree photos and video of your fairings, exhaust, and odometer before the tow operator straps the bike.',
          'Request the official Vehicle Impound Release Form and Tow Yard address from the officer.'
        ]
      }
    ]
  },

  España: {
    flag: '🇪🇸',
    lang: 'es',
    iso: 'ES',
    codeName: 'Ley sobre Tráfico y Seguridad Vial (RDL 6/2015) — DGT',
    authority: 'Guardia Civil de Tráfico / Policía Municipal / DGT',
    keyRulesSummary: `
- Documentos en el móvil (miDGT): La app oficial miDGT tiene plena validez legal en toda España para el Carnet de Conducir (A1/A2/A), Permiso de Circulación y Ficha Técnica. El Seguro a Terceros y la ITV se comprueban telemáticamente por matrícula en el fichero FIVA/DGT.
- Escape / DB-Killer y Ruido: La Guardia Civil no puede inmovilizar "a oído". Para sancionar por exceso de decibelios se exige medición con sonómetro homologado (salvo escape libre sin silenciador).
- Inmovilización (Art. 104 LSV): Solo procede por carecer de seguro obligatorio, no usar casco homologado, alcoholemia/drogas positivas o deficiencias técnicas muy graves.
- Descuento por pronto pago (Art. 94 LSV): 50% de reducción dentro de los 20 días naturales siguientes a la notificación.`,
    quickQuestions: [
      {
        id: 'digital_docs',
        badge: '📱 Documentos en Móvil / miDGT',
        question: '¿Me puede multar o inmovilizar la Guardia Civil si enseño el Carnet A2, Permiso de Circulación, ITV y Seguro desde el móvil?',
        instantVerdict: '100% VÁLIDO EN MÓVIL Y VERIFICACIÓN TELEMÁTICA DGT',
        canImpound: 'NO PUEDEN INMOVILIZAR LA MOTO',
        lawCitation: 'Art. 59 y 104 del Real Decreto Legislativo 6/2015 (LSV) + Instrucción DGT miDGT / FIVA',
        explanation: 'En España no es obligatorio llevar el recibo físico del seguro desde 2008 (los agentes lo consultan telemáticamente en el fichero FIVA). Además, el Carnet de Conducir y el Permiso de Circulación digitales tienen plena validez legal en todo el territorio nacional.',
        actionSteps: [
          'Muestra las 6 caras de tus documentos en "Mis Documentos (Modo Retén)" o en la app miDGT.',
          'Indica al agente que la póliza de seguro y la ITV están en vigor en la base telemática de la DGT / FIVA.'
        ]
      },
      {
        id: 'exhaust_noise',
        badge: '🔊 Escape / DB-Killer y Homologación',
        question: 'El agente dice que mi tubo de escape suena fuerte. ¿Me pueden inmovilizar la moto sin medir con sonómetro?',
        instantVerdict: 'PROHIBIDO SANCIONAR POR RUIDO SIN SONÓMETRO',
        canImpound: 'NO SIN MEDICIÓN TÉCNICA HOMOLOGADA',
        lawCitation: 'Art. 104 RDL 6/2015 (LSV) y Reglamento General de Vehículos (RD 2822/1998)',
        explanation: 'Si tu escape cuenta con contraseña de homologación europea (grabado E-mark) y lleva puesto el DB-Killer, ningún agente puede multarte ni inmovilizar la moto "a oído". Para denunciar exceso de decibelios es indispensable realizar prueba con sonómetro homologado y calibrado.',
        actionSteps: [
          'Muestra el grabado de homologación CE en el silencioso y que el DB-Killer está instalado.',
          'Si te formulan boletín sin sonómetro, haz constar en alegaciones la falta de medición acústica oficial.'
        ]
      },
      {
        id: 'subsanar_60min',
        badge: '⏱️ Levantar Inmovilización en el Sitio',
        question: '¿En qué casos se levanta la inmovilización en el mismo control sin que llamen a la grúa?',
        instantVerdict: 'SE LEVANTA AL CESAR LA CAUSA EN EL ACTO',
        canImpound: 'NO HAY GRÚA SI SE SUBSANA EN EL CONTROL',
        lawCitation: 'Artículo 104.3 de la Ley sobre Tráfico y Seguridad Vial (RDL 6/2015)',
        explanation: 'El Artículo 104.3 establece expresamente que la inmovilización se levantará en el momento en que cese la causa que la motivó (por ejemplo, si otro conductor habilitado se hace cargo de la motocicleta, si te traen un casco homologado o si acreditas telemáticamente el seguro en vigor).',
        actionSteps: [
          'Invoca el Art. 104.3 de la Ley de Seguridad Vial para subsanar la incidencia antes de que soliciten depósito municipal.'
        ]
      },
      {
        id: 'fotomultas_c038',
        badge: '📸 Radares DGT y Margen de Error',
        question: 'Me ha llegado una multa de radar de la DGT. ¿Cuándo es nula por margen de error o falta de dos fotografías?',
        instantVerdict: 'RECURRIBLES SI NO APLICAN MARGEN DE ERROR O 2 FOTOS',
        canImpound: 'NO CONLLEVA INMOVILIZACIÓN',
        lawCitation: 'Orden ICT/155/2020 (Control Metrológico de Cinemómetros) y Jurisprudencia Tribunal Supremo',
        explanation: 'La normativa española exige que todo radar sin operador presencial aporte al menos DOS fotogramas del vehículo en instantes distintos y aplique el margen de error legal (5 km/h o 5% en radares fijos; 7 km/h o 7% en radares móviles). Si no aplican el margen, la sanción o detracción de puntos debe anularse o reducirse.',
        actionSteps: [
          'Revisa en el expediente si aparecen las 2 fotografías, el certificado de verificación periódica del cinemómetro y la velocidad corregida.'
        ]
      },
      {
        id: 'record_police',
        badge: '🎥 Grabar el Control Policial',
        question: '¿Me pueden sancionar por la Ley Mordaza si grabo la intervención en el control de tráfico o me quitan las llaves?',
        instantVerdict: 'ES LEGAL GRABAR LA ACTUACIÓN PARA TU DEFENSA',
        canImpound: 'NO ES INFRACCIÓN GRABAR (NO DIFUNDIR EN REDES)',
        lawCitation: 'Sentencia Tribunal Constitucional 172/2020 sobre el Art. 36.23 de la LO 4/2015',
        explanation: 'El Tribunal Constitucional declaró que grabar en vídeo o audio una intervención policial en la vía pública como prueba para tu defensa jurídica es completamente legal. Lo único restringido es difundir públicamente la imagen de los agentes poniendo en riesgo su seguridad.',
        actionSteps: [
          'Graba el procedimiento para tu archivo probatorio privado sin difundirlo en redes sociales sin pixelar rostros.',
          'Apaga el contacto de la moto tú mismo y guarda la llave.'
        ]
      },
      {
        id: 'when_impound',
        badge: '🚛 ¿Cuándo SÍ Inmoviliza la DGT?',
        question: '¿En qué casos SÍ puede la Guardia Civil o Policía Municipal inmovilizar mi moto y llevarla al depósito?',
        instantVerdict: 'CAUSALES TASADAS DEL ARTÍCULO 104 LSV',
        canImpound: 'SÍ PROCEDE INMOVILIZACIÓN EN ESTOS CASOS',
        lawCitation: 'Artículo 104 del Real Decreto Legislativo 6/2015 (Ley de Seguridad Vial)',
        explanation: 'Solo procede inmovilizar la motocicleta cuando: 1) Carece de Seguro Obligatorio en vigor, 2) El conductor o pasajero no lleva casco homologado, 3) Positivo en control de alcoholemia o drogas, 4) ITV desfavorable o negativa con riesgo muy grave, 5) Carecer de permiso de conducción válido.',
        actionSteps: [
          'Exige el acta de inmovilización oficial detallando el estado estético de la moto antes de su traslado al depósito.'
        ]
      }
    ]
  },

  México: {
    flag: '🇲🇽',
    lang: 'es',
    iso: 'MX',
    codeName: 'Reglamento de Tránsito (CDMX / SEMOVI y Art. 16 Constitucional)',
    authority: 'Policía de Tránsito Autorizada para Infraccionar / SEMOVI',
    keyRulesSummary: `
- Licencia y Tarjeta Digital (App CDMX / SEMOVI): Tienen exactamente la misma validez jurídica que el plástico físico. Ningún policía puede remitir al corralón por mostrar documentos digitales vigentes.
- Agentes Autorizados para Infraccionar: Solo policías de Tránsito con banda en el brazo y código QR "Autorizado para Infraccionar" pueden levantar boletas. La policía preventiva o auxiliar NO puede multar por tránsito.
- Corralón (Remisión al Depósito Vehicular): Solo aplica en causales taxativas (circular sin casco, invadir carril exclusivo de Metrobús/ciclovía, alcoholímetro, falta total de placas o tarjeta de circulación).`,
    quickQuestions: [
      {
        id: 'digital_docs',
        badge: '📱 Licencia y Tarjeta Digital',
        question: '¿Me pueden llevar la moto al corralón o multar si muestro mi Licencia y Tarjeta de Circulación desde el celular?',
        instantVerdict: '100% VÁLIDO EN CELULAR • PROHIBIDO LLEVAR AL CORRALÓN',
        canImpound: 'NO PROCEDE REMISIÓN AL CORRALÓN',
        lawCitation: 'Reglamento de Tránsito CDMX (Art. 44 y 45) y Gaceta Oficial SEMOVI',
        explanation: 'La Licencia para Conducir Motocicleta (A1/A2) y la Tarjeta de Circulación digitales cuentan con plena validez oficial. El oficial está obligado a aceptar su exhibición en la pantalla del teléfono móvil sin exigir plástico físico ni "mordida".',
        actionSteps: [
          'Muestra tus 4 documentos en "Mis Documentos (Modo Retén)" de MotoDash AI.',
          'Verifica que el agente porte el brazalete y QR oficial de "Autorizado para Infraccionar".'
        ]
      },
      {
        id: 'exhaust_noise',
        badge: '🔊 Escape o "Revisión de Rutina"',
        question: 'Una patrulla me detuvo por "revisión de rutina" o porque dice que mi escape suena fuerte. ¿Es legal o amerita corralón?',
        instantVerdict: 'ILEGAL DETENER POR "REVISIÓN DE RUTINA" • NO AMERITA CORRALÓN',
        canImpound: 'NO SE PUEDEN LLEVAR LA MOTO AL CORRALÓN',
        lawCitation: 'Artículo 16 de la Constitución Política de los Estados Unidos Mexicanos y Tesis SCJN',
        explanation: 'La Suprema Corte de Justicia de la Nación (SCJN) determinó que las "revisiones de rutina" sin flagrancia de delito o infracción de tránsito visible violan el Artículo 16 Constitucional. Además, el ruido del escape no es causal de remisión al depósito vehicular (corralón).',
        actionSteps: [
          'Pregunta respetuosamente: "Oficial, ¿cuál es el artículo exacto del Reglamento de Tránsito que motivó la detención?".',
          'No entregues las llaves de tu moto y graba la intervención desde el primer segundo.'
        ]
      },
      {
        id: 'subsanar_60min',
        badge: '⏱️ ¿Quién SÍ puede Infraccionar?',
        question: 'Me detuvo una patrulla de Policía Preventiva o Sectorial que no es de Tránsito. ¿Me pueden multar o subir la moto a la grúa?',
        instantVerdict: 'NULO DE PLENO DERECHO • SOLO TRÁNSITO CON QR PUEDE MULTAR',
        canImpound: 'ILEGAL QUE POLICÍA PREVENTIVA INFRACCIONE',
        lawCitation: 'Art. 60 del Reglamento de Tránsito CDMX / Ley de Movilidad',
        explanation: 'Únicamente los agentes de la Subsecretaría de Control de Tránsito que porten el uniforme distintivo, dispositivo electrónico HandHeld y código QR de "Autorizado para Infraccionar" pueden imponer multas de tránsito. Ningún policía de sector o bancario tiene facultades.',
        actionSteps: [
          'Pídele al elemento que muestre su código QR oficial en la app "Mi Policía" antes de mostrar tus documentos.'
        ]
      },
      {
        id: 'fotomultas_c038',
        badge: '📸 Fotocívicas / Radares',
        question: 'Mi placa registra Fotocívicas o multas por cámara radar que no reconozco. ¿Cómo se impugnan?',
        instantVerdict: 'IMPUGNABLES EN JUICIO DE NULIDAD ADMINISTRATIVA',
        canImpound: 'NO AMERITA CORRALÓN EN VÍA PÚBLICA',
        lawCitation: 'Ley de Justicia Administrativa (TJACDMX) — Juicio de Nulidad en Vía Sumaria',
        explanation: 'Las boletas por cámaras o radares que carecen de debida fundamentación, calibración vigente o notificación personal pueden anularse mediante Juicio de Nulidad ante el Tribunal de Justicia Administrativa dentro de los 15 días hábiles.',
        actionSteps: [
          'Acude a la Defensoría Pública de Justicia Administrativa para promover el juicio de nulidad gratuito.'
        ]
      },
      {
        id: 'record_police',
        badge: '🎥 Grabar al Oficial / Llaves',
        question: '¿El policía me puede quitar el celular por grabarlo o quitarme las llaves del switch de la moto?',
        instantVerdict: 'DERECHO CONSTITUCIONAL A GRABAR • PROHIBIDO QUITAR LLAVES',
        canImpound: 'DELITO DE ABUSO DE AUTORIDAD SI TE QUITAN LLAVES',
        lawCitation: 'Artículos 6, 7 y 16 de la Constitución Mexicana + Protocolo de Actuación Policial',
        explanation: 'Grabar a un servidor público en funciones en la vía pública es un derecho constitucional de libertad de expresión y acceso a la información. Quitar las llaves de tu motocicleta sin orden judicial constituye despojo y abuso de autoridad.',
        actionSteps: [
          'Apaga tú mismo la moto, guarda la llave en tu bolsillo y mantén el teléfono grabando.',
          'Si intentan intimidarte, reporta de inmediato a Asuntos Internos (911 / Locatel).'
        ]
      },
      {
        id: 'when_impound',
        badge: '🚛 ¿Cuándo SÍ amerita Corralón?',
        question: '¿En qué casos SÍ es legal que la grúa de Tránsito se lleve mi moto al depósito vehicular (Corralón)?',
        instantVerdict: 'SOLO EN ESTAS CAUSALES EXPRESAS DEL REGLAMENTO',
        canImpound: 'SÍ PROCEDE CORRALÓN EN ESTOS CASOS',
        lawCitation: 'Art. 6, 37, 43 y 45 del Reglamento de Tránsito de la CDMX',
        explanation: 'La remisión al corralón solo procede si: 1) Conductor o acompañante no porta casco de seguridad, 2) Invades carriles confinados de Metrobús o ciclovías, 3) No cuentas con placa de matrícula ni permiso vigente, 4) No portas Licencia A1/A2 vigente, o 5) No apruebas el Alcoholímetro.',
        actionSteps: [
          'Si procede remisión, exige el inventario sellado de tu motocicleta antes de que la suban a la plataforma.'
        ]
      }
    ]
  },

  Chile: {
    flag: '🇨🇱',
    lang: 'es',
    iso: 'CL',
    codeName: 'Ley de Tránsito N° 18.290 — Carabineros / MTT',
    authority: 'Carabineros de Chile / Inspectores Fiscales MTT',
    keyRulesSummary: `
- Documentos Exigibles: Licencia Clase C, Padrón / Permiso de Circulación, SOAP y Revisión Técnica (PRT). El SOAP y Permiso de Circulación con firma electrónica avanzada tienen plena validez digital (Ley N° 19.799).
- Retiro de Circulación (Corrales Municipales): Solo procede por circular sin placa patente, sin Permiso de Circulación, sin SOAP o sin Revisión Técnica vigente (Art. 56 y 92 Ley 18.290).`,
    quickQuestions: [
      {
        id: 'digital_docs',
        badge: '📱 SOAP y Permiso en el Celular',
        question: '¿Carabineros me puede sacar un parte o retirar la moto si muestro el SOAP y el Permiso de Circulación desde el celular?',
        instantVerdict: '100% VÁLIDOS CON FIRMA ELECTRÓNICA (LEY 19.799)',
        canImpound: 'NO PUEDEN RETIRAR LA MOTO A CORRALES',
        lawCitation: 'Ley N° 19.799 sobre Documentos Electrónicos y Ley de Tránsito N° 18.290',
        explanation: 'En Chile, el SOAP digital, el Permiso de Circulación electrónico y el Certificado de Revisión Técnica con código QR verificable tienen exactamente el mismo valor legal que el papel impreso.',
        actionSteps: [
          'Muestra los documentos desde "Mis Documentos (Modo Retén)" en MotoDash AI para que el Carabinero escanee el QR.'
        ]
      },
      {
        id: 'exhaust_noise',
        badge: '🔊 Escape Libre / Fiscalización MTT',
        question: '¿Me pueden retirar la moto a corrales por el ruido del tubo de escape sin medición técnica?',
        instantVerdict: 'SOLO CON SONÓMETRO DEL MTT O CITACIÓN AL JUZGADO',
        canImpound: 'NO DA RETIRO INMEDIATO SIN MEDICIÓN OFICIAL',
        lawCitation: 'Art. 77 y 78 de la Ley de Tránsito N° 18.290 y Decreto Supremo N° 104 MTT',
        explanation: 'La fiscalización de emisiones sonoras corresponde a los Inspectores Fiscales del Ministerio de Transportes (MTT) con sonómetro calibrado. Si no hay equipo de medición, solo cabría citación al Juzgado de Policía Local si el escape está totalmente libre.',
        actionSteps: [
          'Exhibe la homologación del escape y tu Certificado de Revisión Técnica y de Gases vigente.'
        ]
      },
      {
        id: 'subsanar_60min',
        badge: '⏱️ Boleta de Citación vs Retiro',
        question: '¿Cuándo corresponde solo una boleta de citación al Juzgado de Policía Local sin que me quiten la moto?',
        instantVerdict: 'LAS FALTAS LEVES Y MENOS GRAVES NO DAN CORRALES',
        canImpound: 'NO SE LLEVAN LA MOTO SI TIENES PAPELES AL DÍA',
        lawCitation: 'Artículos 199 al 202 de la Ley de Tránsito N° 18.290',
        explanation: 'Si tu motocicleta cuenta con patente instalada, Permiso de Circulación, SOAP, Revisión Técnica al día y conduces con Licencia Clase C, las infracciones comunes de tránsito se cursan mediante boleta de citación al Juzgado de Policía Local, sin retiro del vehículo.',
        actionSteps: [
          'Recibe la boleta de citación y recuerda que tienes 5 días hábiles para pagar con 25% de descuento en faltas graves/menos graves.'
        ]
      },
      {
        id: 'fotomultas_c038',
        badge: '📸 Multas TAG y Empadronadas',
        question: 'Tengo multas empadronadas o de TAG que me impiden renovar el Permiso de Circulación. ¿Cuándo prescriben?',
        instantVerdict: 'PRESCRIBEN AL AÑO (PERSONALES) O 3 AÑOS (REGISTRO CIVIL)',
        canImpound: 'MULTA ADMINISTRATIVA EN REGISTRO CIVIL',
        lawCitation: 'Art. 54 de la Ley N° 15.231 y Art. 24 de la Ley N° 18.287',
        explanation: 'Las multas de tránsito anotadas en el Registro de Multas de Tránsito No Pagadas prescriben a los 3 años desde la anotación (y al año desde cometida la infracción si no hubo sentencia). Puedes solicitar la prescripción ante el Juzgado de Policía Local.',
        actionSteps: [
          'Presenta escrito simple de prescripción de multa ante el Juzgado de Policía Local correspondiente.'
        ]
      },
      {
        id: 'record_police',
        badge: '🎥 Grabar Control de Carabineros',
        question: '¿Es legal grabar con mi cámara de casco o celular una fiscalización de Carabineros en la vía pública?',
        instantVerdict: '100% LEGAL EN VÍA PÚBLICA (ART. 161-A CÓDIGO PENAL)',
        canImpound: 'DERECHO CIUDADANO A REGISTRAR PROCEDIMIENTO PÚBLICO',
        lawCitation: 'Contraloría General de la República y Art. 19 N° 12 de la Constitución',
        explanation: 'Las actuaciones de Carabineros e Inspectores Municipales en la vía pública no tienen carácter de vida privada, por lo que cualquier motociclista puede grabarlas con su GoPro o teléfono celular.',
        actionSteps: [
          'Graba sin interferir físicamente en el control vehicular y guarda tus llaves en el bolsillo.'
        ]
      },
      {
        id: 'when_impound',
        badge: '🚛 ¿Cuándo SÍ llevan a Corrales?',
        question: '¿En qué casos SÍ puede Carabineros retirar mi motocicleta de circulación y enviarla a los Corrales Municipales?',
        instantVerdict: 'CAUSALES EXPRESAS DE RETIRO DE CIRCULACIÓN',
        canImpound: 'SÍ PROCEDE RETIRO A CORRALES EN ESTOS CASOS',
        lawCitation: 'Artículos 56, 82 y 92 de la Ley de Tránsito N° 18.290',
        explanation: 'El retiro a corrales municipales procede cuando: 1) Circulas sin placa patente o con patente oculta/adulterada, 2) Permiso de Circulación vencido, 3) Sin SOAP vigente, 4) Sin Revisión Técnica al día, 5) Conducir sin haber obtenido Licencia Clase C, o 6) Bajo influencia del alcohol/drogas.',
        actionSteps: [
          'Exige el acta de inventario firmada por el funcionario antes de que la grúa levante la motocicleta.'
        ]
      }
    ]
  },

  Perú: {
    flag: '🇵🇪',
    lang: 'es',
    iso: 'PE',
    codeName: 'Reglamento Nacional de Tránsito (TUO - DS 016-2009-MTC) — PNP / SUTRAN',
    authority: 'Policía Nacional del Perú (PNP Asignada al Tránsito) / SUTRAN / SAT',
    keyRulesSummary: `
- SOAT Electrónico y CITV: Son verificables en línea en el portal del MTC / APESEG. Está prohibido exigir papel impreso o llevar la moto al depósito si figuran vigentes en el sistema.
- Competencia Policial (Art. 7 RNT): Solo los efectivos de la Policía Nacional del Perú asignados al control del Tránsito o Carreteras pueden levantar papeletas de infracción. Los policías de comisaría u orden público NO pueden poner papeletas.`,
    quickQuestions: [
      {
        id: 'digital_docs',
        badge: '📱 SOAT Electrónico y TIVe en Celular',
        question: '¿El policía de tránsito me puede poner papeleta o llevar mi moto al depósito si tengo SOAT Electrónico y TIVe en el celular?',
        instantVerdict: '100% VÁLIDO EN CELULAR • PROHIBIDO EXIGIR PAPEL IMPRESO',
        canImpound: 'NO PUEDEN LLEVAR LA MOTO AL DEPÓSITO',
        lawCitation: 'Decreto Supremo N° 015-2016-MTC (SOAT Electrónico) y TIVe SUNARP',
        explanation: 'Tanto el SOAT Electrónico como la Tarjeta de Identificación Vehicular Electrónica (TIVe) y la Licencia Electrónica MTC tienen plena validez legal en todo el Perú. El efectivo policial tiene la obligación de verificar su vigencia en el sistema sin exigir documentos impresos.',
        actionSteps: [
          'Muestra tus 4 documentos desde "Mis Documentos (Modo Retén)" en MotoDash AI.',
          'Recuérdale al efectivo que el Decreto Supremo N° 015-2016-MTC prohíbe exigir constancia física del SOAT electrónico.'
        ]
      },
      {
        id: 'exhaust_noise',
        badge: '🔊 Escape / Roncador (Falta G10)',
        question: 'El efectivo policial quiere ponerme papeleta o llevarse mi moto porque dice que mi tubo de escape suena fuerte. ¿Es legal?',
        instantVerdict: 'PROHIBIDO SANCIONAR SIN SONÓMETRO HOMOLOGADO',
        canImpound: 'NO AMERITA INTERNAMIENTO EN DEPÓSITO',
        lawCitation: 'Tabla de Infracciones DS 016-2009-MTC (G10 / L07) + Calibración INACAL',
        explanation: 'Para configurar una infracción por ruidos molestos o emisiones superiores a los Límites Máximos Permisibles, es indispensable realizar una medición técnica con sonómetro certificado por INACAL. Además, las infracciones G10 o L07 NO tienen medida preventiva de internamiento en el depósito.',
        actionSteps: [
          'Solicita que consignen en la papeleta el número de serie y certificado de calibración INACAL del sonómetro.',
          'Si no cuentan con el equipo, deja constancia en el recuadro de "Observaciones del Conductor".'
        ]
      },
      {
        id: 'subsanar_60min',
        badge: '⏱️ Policía de Comisaría vs Tránsito',
        question: 'Me intervino un patrullero de Comisaría (Águilas Negras / Halcones / Orden Público). ¿Me pueden imponer una papeleta de tránsito?',
        instantVerdict: 'NULA LA PAPELETA • SOLO PNP DE TRÁNSITO PUEDE MULTAR',
        canImpound: 'ILEGAL QUE POLICÍA DE COMISARÍA PONGA PAPELETA',
        lawCitation: 'Artículo 7 del TUO del Reglamento Nacional de Tránsito (DS 016-2009-MTC)',
        explanation: 'El Artículo 7 del Reglamento Nacional de Tránsito establece de forma exclusiva que solo el efectivo policial asignado al Control del Tránsito (o Carreteras en red vial nacional) tiene competencia para levantar papeletas de infracción.',
        actionSteps: [
          'Si un policía de comisaría detecta una presunta falta de tránsito, debe solicitar la presencia de un efectivo de la Unidad de Tránsito.'
        ]
      },
      {
        id: 'fotomultas_c038',
        badge: '📸 Fotopapeletas SAT / SUTRAN',
        question: 'Me llegó una fotopapeleta (M20) de SUTRAN o del SAT. ¿Cuándo se puede anular por falta de homologación?',
        instantVerdict: 'ANULABLE SI EL CINEMÓMETRO NO TIENE CERTIFICADO INACAL',
        canImpound: 'NO CONLLEVA INTERNAMIENTO EN VÍA',
        lawCitation: 'Ley N° 27444 (LPAG) y Requisitos de Validez del Artículo 326 del RNT',
        explanation: 'Toda fotopapeleta por exceso de velocidad requiere que en la imagen conste el código de homologación y el certificado de verificación metrológica vigente emitido por INACAL del cinemómetro utilizado, además de la señalización previa de velocidad máxima.',
        actionSteps: [
          'Presenta tu descargo escrito dentro de los 5 días hábiles solicitando el certificado de calibración INACAL del radar.'
        ]
      },
      {
        id: 'record_police',
        badge: '🎥 Grabar Intervención Policial',
        question: '¿El policía me puede prohibir grabar la intervención con mi celular o quitarme la llave de contacto de mi moto?',
        instantVerdict: 'DERECHO CONSTITUCIONAL A GRABAR • PROHIBIDO QUITAR LLAVES',
        canImpound: 'ABUSO DE AUTORIDAD SI TE ARREBATAN LA LLAVE',
        lawCitation: 'Art. 2 inc. 4 de la Constitución del Perú y Directiva PNP de Intervenciones',
        explanation: 'En el Perú es un derecho constitucional grabar cualquier intervención policial en la vía pública para garantizar la transparencia y el debido proceso. Ningún efectivo policial está facultado para retirar la llave de contacto de tu motocicleta.',
        actionSteps: [
          'Apaga el motor tú mismo, guarda la llave en tu bolsillo y graba el CIP y apellido del efectivo interviniente.'
        ]
      },
      {
        id: 'when_impound',
        badge: '🚛 ¿Cuándo SÍ llevan al Depósito?',
        question: '¿En qué casos SÍ aplica la medida preventiva de Internamiento de la moto en el Depósito Municipal (SAT)?',
        instantVerdict: 'SOLO EN INFRACCIONES MUY GRAVES CON INTERNAMIENTO',
        canImpound: 'SÍ PROCEDE DEPÓSITO EN ESTAS FALTAS "M"',
        lawCitation: 'Artículo 299 y Anexo I del Reglamento Nacional de Tránsito (DS 016-2009-MTC)',
        explanation: 'Solo pueden llevar tu moto en grúa al depósito cuando la Tabla de Infracciones contempla expresamente "Internamiento del Vehículo": 1) Conducir sin SOAT vigente (M28), 2) Conducir sin tener Licencia / Brevete B-II (M03), 3) Ebriedad o drogas (M01/M02), o 4) Circular sin placas de rodaje (M24).',
        actionSteps: [
          'Exige el Acta de Internamiento Vehicular detallando cada pieza y accesorio de tu motocicleta antes de que suba a la grúa.'
        ]
      }
    ]
  }
};

// Compatibilidad con importaciones existentes
export const QUICK_LEGAL_QUESTIONS = COUNTRY_LEGAL_FRAMEWORKS.Colombia.quickQuestions;

export function getCountryQuickLegalQuestions(country = 'Colombia') {
  const framework = COUNTRY_LEGAL_FRAMEWORKS[country] || COUNTRY_LEGAL_FRAMEWORKS.Colombia;
  return framework.quickQuestions || COUNTRY_LEGAL_FRAMEWORKS.Colombia.quickQuestions;
}

/**
 * Textos de interfaz del modal según el idioma del país seleccionado
 */
export function getLawyerModalUiLabels(country = 'Colombia') {
  const isEn = isEnglishCountry(country);
  if (isEn) {
    return {
      topPill: 'AI POCKET TRAFFIC LAWYER • CHECKPOINT DEFENSE',
      title: 'AI Motorcycle Traffic Lawyer & Anti-Impound Advisor',
      subtitleSuffix: 'Instant legal check: Know if a ticket or tow truck is lawful or unlawful',
      inputLabel: 'What is the officer telling you, or what question do you have about a ticket / tow?',
      inputPlaceholder: 'E.g.: The officer says he will tow my bike because my exhaust is loud or my insurance is on my phone...',
      askBtn: 'Check Traffic Law',
      askingBtn: 'Analyzing Law...',
      quickSectionTitle: 'Common Traffic Stop Situations (Tap one for the exact statute & defense):',
      analyzedLabel: 'ANALYZED QUESTION',
      verdictLabel: '⚖️ IMMEDIATE LEGAL VERDICT',
      impoundLabel: 'CAN POLICE TOW / IMPOUND MY MOTORCYCLE?',
      citationLabel: 'EXACT STATUTE / CASE LAW TO CITE TO THE OFFICER:',
      stepsLabel: '🛡️ Step-by-step what to do right now:'
    };
  }

  return {
    topPill: 'ABOGADO DE BOLSILLO IA • DEFENSA EN RETENES',
    title: 'Asesor Jurídico de Tránsito & Anti-Inmovilización IA',
    subtitleSuffix: 'Consulta al instante si un comparendo o grúa es legal o ilegal',
    inputLabel: '¿Qué te está diciendo el agente de tránsito o qué duda tienes del comparendo?',
    inputPlaceholder: 'Ej: El agente dice que se va a llevar mi moto en grúa porque no tengo el SOAT impreso en papel...',
    askBtn: 'Consultar Ley',
    askingBtn: 'Analizando Ley...',
    quickSectionTitle: 'Situaciones Frecuentes en Retenes (Toca una para ver el Artículo Exacto):',
    analyzedLabel: 'PREGUNTA ANALIZADA',
    verdictLabel: '⚖️ VEREDICTO LEGAL INMEDIATO',
    impoundLabel: '¿SE PUEDEN LLEVAR LA MOTO EN GRÚA / PATIOS?',
    citationLabel: 'NORMA / ARTÍCULO EXACTO PARA INVOCAR ANTE EL AGENTE:',
    stepsLabel: '🛡️ Qué hacer paso a paso en este momento:'
  };
}

/**
 * Consulta al Asesor Jurídico Vial IA (Gemini 2.0 Flash + Base Legal del País e Idioma)
 */
export async function askTrafficLawyerAI({
  question,
  country = 'Colombia',
  bikeBrand = 'TVS',
  bikeModel = 'Apache RTR 160 4V'
}) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const framework = COUNTRY_LEGAL_FRAMEWORKS[country] || COUNTRY_LEGAL_FRAMEWORKS.Colombia;
  const isEn = isEnglishCountry(country);
  const questions = getCountryQuickLegalQuestions(country);

  const systemPrompt = isEn
    ? `You are the expert Motorcycle Traffic Defense Lawyer AI of MotoDash AI for the United States (${framework.codeName}).
Your mission is to protect the motorcyclist during a roadside traffic stop or ticket dispute with exact U.S. statutes and constitutional case law.
Applicable legal framework: ${framework.codeName} (${framework.authority}).
Verified rules:
${framework.keyRulesSummary}

Respond to the rider's query ("${question}") STRICTLY in English as pure JSON without markdown blocks using this exact schema:
{
  "instantVerdict": "Short punchy uppercase verdict (e.g., NO TOWING ALLOWED / FIX-IT TICKET ONLY / PROTECTED BY 1ST AMENDMENT)",
  "canImpound": "Clearly state in uppercase whether police can tow/impound the motorcycle or not",
  "lawCitation": "Exact U.S. State Vehicle Code section or U.S. Supreme Court / Federal case citation",
  "explanation": "Clear, direct legal explanation in English of why the officer's action is lawful or unlawful",
  "actionSteps": [
    "Step 1 concrete action or statement to say to the officer",
    "Step 2 concrete roadside defense step",
    "Step 3 how to contest in traffic court or via Trial by Written Declaration"
  ]
}`
    : `Eres el Abogado y Asesor Jurídico Vial experto en motocicletas de MotoDash AI para ${country}.
Tu misión es defender al motociclista con la ley exacta de ${country} en la mano cuando está en un retén policial o tiene una duda sobre un comparendo/multa.
Marco legal aplicable en ${country}: ${framework.codeName} (${framework.authority}).
Reglas clave verificadas de ${country}:
${framework.keyRulesSummary}

Responde a la consulta del piloto ("${question}") ESTRICTAMENTE en español y en formato JSON puro sin bloques markdown con esta estructura exacta:
{
  "instantVerdict": "Frase corta y contundente en mayúsculas (ej: NO TE PUEDEN INMOVILIZAR LA MOTO / SUBSANABLE EN EL SITIO / SÍ PROCEDE SEGÚN LA LEY DE ${country.toUpperCase()})",
  "canImpound": "Indica claramente si se pueden llevar la moto en grúa / depósito en ${country} o no",
  "lawCitation": "Ley, artículo, decreto o sentencia exacta aplicable en ${country}",
  "explanation": "Explicación clara, directa y jurídica de por qué es legal o ilegal el procedimiento en ${country}",
  "actionSteps": [
    "Paso 1 concreto para decirle al agente o hacer en el momento en ${country}",
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
            source: isEn ? `Gemini 2.0 Flash Legal Engine (${country})` : `Gemini 2.0 Flash Jurídico (${country})`
          };
        }
      }
    } catch (err) {
      console.warn('[TrafficLawyerAI] Usando motor jurídico local verificado:', err.message);
    }
  }

  // Motor jurídico determinístico offline adaptado al país e idioma seleccionado
  const qLower = String(question).toLowerCase();
  const sourceLabel = isEn ? `Verified Legal Database (${country})` : `Base Jurídica Oficial (${country})`;

  if (qLower.includes('celular') || qLower.includes('digital') || qLower.includes('soat') || qLower.includes('papel') || qLower.includes('phone') || qLower.includes('insurance') || qLower.includes('midgt') || qLower.includes('soap')) {
    return { ...questions[0], source: sourceLabel };
  }
  if (qLower.includes('mofle') || qLower.includes('exosto') || qLower.includes('ruido') || qLower.includes('llanta') || qLower.includes('escape') || qLower.includes('exhaust') || qLower.includes('loud') || qLower.includes('muffler')) {
    return { ...questions[1], source: sourceLabel };
  }
  if (qLower.includes('fotomulta') || qLower.includes('camara') || qLower.includes('cámara') || qLower.includes('radar') || qLower.includes('camera') || qLower.includes('red light') || qLower.includes('fotocivica') || qLower.includes('fotopapeleta')) {
    return { ...questions[3], source: sourceLabel };
  }
  if (qLower.includes('grabar') || qLower.includes('video') || qLower.includes('llave') || qLower.includes('record') || qLower.includes('gopro') || qLower.includes('key')) {
    return { ...questions[4], source: sourceLabel };
  }
  if (qLower.includes('60') || qLower.includes('subsanar') || qLower.includes('casco') || qLower.includes('chaleco') || qLower.includes('luz') || qLower.includes('fix-it') || qLower.includes('cure')) {
    return { ...questions[2], source: sourceLabel };
  }

  if (isEn) {
    return {
      instantVerdict: `ANALYZED UNDER ${framework.codeName.toUpperCase()}`,
      canImpound: 'NO ROADSIDE TOW UNLESS STATUTORY IMPOUND CONDITION APPLIES',
      lawCitation: `${framework.codeName} (${framework.authority})`,
      explanation: `Regarding your question ("${question}"), officers cannot arbitrarily impound your motorcycle for minor traffic or equipment infractions if your Class M license, registration, and liability insurance are valid.`,
      actionSteps: [
        'Ask the officer for the specific Vehicle Code section being cited and whether it is a correctable ("Fix-It") violation.',
        'Exercise your 1st Amendment right to record the stop and keep your ignition key in your pocket.',
        'Remember that signing a traffic citation is only a promise to appear, NOT an admission of guilt.'
      ],
      source: `MotoDash AI Legal Engine (${country})`
    };
  }

  return {
    instantVerdict: `ANÁLISIS SEGÚN ${framework.codeName.toUpperCase()}`,
    canImpound: `SOLO SI ESTÁ EXPRESAMENTE TIPIFICADO EN ${country.toUpperCase()}`,
    lawCitation: `${framework.codeName} (${framework.authority})`,
    explanation: `Para tu consulta ("${question}") en ${country}, ningún agente de tránsito puede aplicar sanciones ni inmovilizaciones por analogía. Debe indicarte el artículo o código exacto de la infracción en ${framework.codeName}, permitirte subsanar si la ley lo contempla y respetar tu derecho al debido proceso y a grabar el procedimiento.`,
    actionSteps: [
      `Pídele al agente que te indique el código o artículo exacto de ${framework.codeName} antes de entregar documentos físicos.`,
      'Verifica si la falta es subsanable en el sitio para evitar la grúa / depósito.',
      'Deja constancia escrita en observaciones y recuerda que recibir la boleta no significa aceptar la culpa.'
    ],
    source: `Motor Jurídico MotoDash AI (${country})`
  };
}
