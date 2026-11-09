// Catálogo Demo Oficial con 5 Marcas Mundiales para Probar Inmediatamente
export const DEMO_GARAGE = [
  {
    id: "bike_yamaha_mt09",
    odometer: 14250,
    hojaDeVida: {
      documentos: {
        placa: "MT09-SP",
        vinChasis: "9FJYAM09X5K123456",
        engineNumber: "MTR-MT09-987654",
        soatVencimiento: "2027-02-15",
        tecnoVencimiento: "2027-03-20",
        seguroNombre: "Seguro Todo Riesgo SURA",
        seguroPoliza: "900001688138",
        seguroVencimiento: "2027-09-10",
        impuestoVencimiento: "2027-06-30"
      },
      servicios: [
        {
          id: "srv_mt09_1",
          fecha: "2026-10-15",
          km: 12000,
          servicio: "Cambio de Aceite & Filtro Yamalube",
          marcaRepuesto: "Yamalube 4T 10W-40 100% Sintético",
          taller: "Centro Especializado Yamaha",
          costo: 92000,
          notas: "Cambio arandela y revisión de bujías"
        },
        {
          id: "srv_mt09_2",
          fecha: "2026-08-10",
          km: 9500,
          servicio: "Pastillas de Freno & Líquido DOT 4",
          marcaRepuesto: "Brembo Sinterizadas",
          taller: "Motos & Frenos Pro",
          costo: 145000,
          notas: "Purgado y limpieza de cáliper"
        }
      ]
    },
    config: {
      bikeIdentity: {
        brand: "YAMAHA",
        model: "MT-09 SP (GEN 4)",
        shortModel: "MT-09 SP",
        year: 2025,
        colorHex: "#00D2D3",
        accentGlow: "rgba(0, 210, 211, 0.4)",
        category: "naked"
      },
      telemetrySpecs: {
        maxRpm: 11500,
        redlineRpm: 10500,
        speedUnit: "km/h",
        engineCc: 890,
        tankCapacityLiters: 14
      },
      maintenanceSchedule: [
        { id: "oil", service: "Aceite Sintético Yamalube 10W-40 & Filtro", intervalKm: 5000 },
        { id: "chain", service: "Limpieza y Tensión Cadena DID 525", intervalKm: 800 },
        { id: "brakes", service: "Líquido Frenos DOT 4 & Pastillas", intervalKm: 10000 },
        { id: "spark", service: "Bujías NGK Láser Iridium", intervalKm: 20000 }
      ]
    }
  },
  {
    id: "bike_ktm_duke390",
    odometer: 8400,
    hojaDeVida: {
      documentos: {
        placa: "KTM39E",
        vinChasis: "VBKDUKE390M567890",
        engineNumber: "MTR-KTM390-112233",
        soatVencimiento: "2027-05-10",
        tecnoVencimiento: "2027-06-15",
        seguroNombre: "Seguro Todo Riesgo Allianz",
        seguroPoliza: "884210921",
        seguroVencimiento: "2027-08-20",
        impuestoVencimiento: "2027-06-30"
      },
      servicios: [
        {
          id: "srv_ktm_1",
          fecha: "2026-09-20",
          km: 7500,
          servicio: "Mantenimiento Preventivo Motorex",
          marcaRepuesto: "Motorex Formula 4T 15W-50",
          taller: "KTM Ready to Race Service",
          costo: 110000,
          notas: "Cambio de filtro de aire y de aceite"
        }
      ]
    },
    config: {
      bikeIdentity: {
        brand: "KTM",
        model: "390 DUKE (GEN 3)",
        shortModel: "390 DUKE",
        year: 2025,
        colorHex: "#FF6600",
        accentGlow: "rgba(255, 102, 0, 0.4)",
        category: "naked"
      },
      telemetrySpecs: {
        maxRpm: 10500,
        redlineRpm: 9500,
        speedUnit: "km/h",
        engineCc: 399,
        tankCapacityLiters: 15
      },
      maintenanceSchedule: [
        { id: "oil", service: "Motorex Formula 4T 15W-50 & Filtro", intervalKm: 7500 },
        { id: "chain", service: "Limpieza y Tensión Cadena X-Ring", intervalKm: 1000 },
        { id: "valves", service: "Calibración de Válvulas", intervalKm: 15000 }
      ]
    }
  },
  {
    id: "bike_kawasaki_zx6r",
    odometer: 6200,
    hojaDeVida: {
      documentos: {
        placa: "KWK636",
        vinChasis: "JKAZX636KRT987654",
        engineNumber: "MTR-ZX636-445566",
        soatVencimiento: "2027-04-12",
        tecnoVencimiento: "2027-05-18",
        seguroNombre: "Seguro Todo Riesgo Mapfre",
        seguroPoliza: "554433221",
        seguroVencimiento: "2027-07-15",
        impuestoVencimiento: "2027-06-30"
      },
      servicios: [
        {
          id: "srv_kawa_1",
          fecha: "2026-09-01",
          km: 5000,
          servicio: "Aceite Sintético Kawasaki Racing 10W-40",
          marcaRepuesto: "Motul 300V Factory Line",
          taller: "Kawasaki Team Green Taller",
          costo: 135000,
          notas: "Revisión de bujías y holgura de cadena"
        }
      ]
    },
    config: {
      bikeIdentity: {
        brand: "KAWASAKI",
        model: "NINJA ZX-6R (636)",
        shortModel: "ZX-6R",
        year: 2025,
        colorHex: "#52C41A",
        accentGlow: "rgba(82, 196, 26, 0.4)",
        category: "sport"
      },
      telemetrySpecs: {
        maxRpm: 16000,
        redlineRpm: 15000,
        speedUnit: "km/h",
        engineCc: 636,
        tankCapacityLiters: 17
      },
      maintenanceSchedule: [
        { id: "oil", service: "Aceite Sintético & Filtro", intervalKm: 6000 },
        { id: "chain", service: "Tensión Cadena Paso 520", intervalKm: 800 },
        { id: "brakes", service: "Pastillas Sinterizadas Nissin", intervalKm: 8000 }
      ]
    }
  },
  {
    id: "bike_ducati_panigale",
    odometer: 4800,
    hojaDeVida: {
      documentos: {
        placa: "DUC04V",
        vinChasis: "ZDM1103V4R999888",
        engineNumber: "MTR-V4S-778899",
        soatVencimiento: "2027-08-10",
        tecnoVencimiento: "2027-09-01",
        seguroNombre: "Seguro Todo Riesgo SURA Élite",
        seguroPoliza: "9900112233",
        seguroVencimiento: "2027-11-20",
        impuestoVencimiento: "2027-06-30"
      },
      servicios: [
        {
          id: "srv_ducati_1",
          fecha: "2026-08-15",
          km: 4000,
          servicio: "Servicio Ducati Desmo Check Oficial",
          marcaRepuesto: "Shell Advance Ducati 15W-50",
          taller: "Ducati Official Dealer",
          costo: 280000,
          notas: "Alineación de cadena y diagnóstico DTC"
        }
      ]
    },
    config: {
      bikeIdentity: {
        brand: "DUCATI",
        model: "PANIGALE V4 S (2025)",
        shortModel: "PANIGALE V4",
        year: 2025,
        colorHex: "#DC2626",
        accentGlow: "rgba(220, 38, 38, 0.4)",
        category: "sport"
      },
      telemetrySpecs: {
        maxRpm: 15500,
        redlineRpm: 14800,
        speedUnit: "km/h",
        engineCc: 1103,
        tankCapacityLiters: 17
      },
      maintenanceSchedule: [
        { id: "oil", service: "Shell Advance 15W-50 & Filtro", intervalKm: 7500 },
        { id: "chain", service: "Lubricación Cadena Regina", intervalKm: 600 },
        { id: "brakes", service: "Brembo Stylema Pastillas", intervalKm: 6000 }
      ]
    }
  },
  {
    id: "bike_bmw_s1000rr",
    odometer: 5300,
    hojaDeVida: {
      documentos: {
        placa: "BMW10R",
        vinChasis: "WB10E2105R774411",
        engineNumber: "MTR-S1000RR-2025",
        soatVencimiento: "2027-07-18",
        tecnoVencimiento: "2027-08-05",
        seguroNombre: "Seguro Todo Riesgo Bolívar",
        seguroPoliza: "771122990",
        seguroVencimiento: "2027-10-12",
        impuestoVencimiento: "2027-06-30"
      },
      servicios: [
        {
          id: "srv_bmw_1",
          fecha: "2026-09-28",
          km: 5000,
          servicio: "Servicio BMW Motorrad M Performance",
          marcaRepuesto: "Advantec Ultimate 5W-40",
          taller: "Autogermana BMW Motorrad",
          costo: 260000,
          notas: "Inspección ShiftCam y calibración electrónica Dynamic Pro"
        }
      ]
    },
    config: {
      bikeIdentity: {
        brand: "BMW",
        model: "S 1000 RR (M PACKAGE)",
        shortModel: "S 1000 RR",
        year: 2025,
        colorHex: "#2563EB",
        accentGlow: "rgba(37, 99, 235, 0.4)",
        category: "sport"
      },
      telemetrySpecs: {
        maxRpm: 15000,
        redlineRpm: 14500,
        speedUnit: "km/h",
        engineCc: 999,
        tankCapacityLiters: 16.5
      },
      maintenanceSchedule: [
        { id: "oil", service: "Advantec Ultimate 5W-40 & Filtro", intervalKm: 8000 },
        { id: "chain", service: "Cadena M Endurance Lubricación", intervalKm: 1000 },
        { id: "brakes", service: "Pastillas M Caliper Nissin", intervalKm: 7500 }
      ]
    }
  },
  {
    id: "bike_tvs_apache160",
    odometer: 0,
    hojaDeVida: {
      documentos: {
        placa: "OFU22I",
        modelo: 2027,
        linea: "APACHE RTR 160 4V FI - MT 160CC ABS (NG)",
        vinChasis: "9FL37GE57VKH23086",
        engineNumber: "HE5AV26A2047",
        codigoFasecolda: "29517027",
        valorFasecolda: 11499999,
        propietario: "ANDERSON ARLES ACEVEDO OSPINA",
        cedulaPropietario: "1128416305",
        telefonoContacto: "3215357042",
        ciudadCirculacion: "MEDELLIN",
        soatVencimiento: "2027-02-15",
        tecnoVencimiento: "2027-03-20",
        seguroNombre: "Seguros SURA • Plan Motos Todo Riesgo",
        seguroPoliza: "900001688138",
        seguroVencimiento: "2027-09-10",
        seguroCuotas: "11 cuotas mensuales de $74.478 COP (Total $819.253 COP)",
        seguroCoberturas: "RCE $840M ($0 Deducible) | Hurto/Daños 10% PT | Asistencia Motos SURA",
        impuestoVencimiento: "2027-06-30"
      },
      garantia: {
        enabled: true,
        distribuidor: "AUTECO / DISMERCA",
        distribuidorCorto: "Dismerca",
        mesesGarantia: 36,
        kmGarantia: 36000,
        toleranciaKm: 100,
        ritmoKmDia: 65,
        completadas: [1, 2]
      },
      servicios: [
        {
          id: "srv_apache_2",
          fecha: "2026-08-14",
          km: 5000,
          servicio: "2ª Revisión Obligatoria de Garantía (5.000 KM)",
          marcaRepuesto: "TVS TRU4 Synthetic 10W-30 (1.200 ml)",
          taller: "Auteco Dismerca Autorizado",
          costo: 0,
          notas: "Mano de obra GRATIS. Cambio de aceite, filtro de papel, limpieza de tamiz, calibración de válvulas y tensión de cadena (20-25 mm).",
          esRevisionGarantia: true,
          revisionNumero: 2
        },
        {
          id: "srv_apache_1",
          fecha: "2026-06-10",
          km: 1000,
          servicio: "1ª Revisión Obligatoria de Garantía (1.000 KM)",
          marcaRepuesto: "TVS TRU4 Synthetic Blend 10W-30",
          taller: "Auteco Dismerca Autorizado",
          costo: 0,
          notas: "Fin período de despegue. Mano de obra GRATIS. Cambio aceite y filtro, holgura válvulas, inspección bujía (0.8 mm) y reinicio llave de servicio en TFT.",
          esRevisionGarantia: true,
          revisionNumero: 1
        },
        {
          id: "srv_apache_sura",
          fecha: "2026-09-10",
          km: 6800,
          servicio: "Expedición Póliza Todo Riesgo SURA Nº 900001688138",
          marcaRepuesto: "Seguros Generales Suramericana S.A.",
          taller: "SURA Plan Motos",
          costo: 74478,
          notas: "Póliza Todo Riesgo vinculada a OFU22I. RCE $840M sin deducible, amparo patrimonial y asistencia grúa 24/7."
        }
      ]
    },
    config: {
      bikeIdentity: {
        brand: "TVS",
        model: "APACHE RTR 160 4V FI NG",
        shortModel: "APACHE 160 FI NG",
        year: 2025,
        colorHex: "#DC2626",
        accentGlow: "rgba(220, 38, 38, 0.4)",
        category: "naked"
      },
      telemetrySpecs: {
        maxRpm: 11500,
        redlineRpm: 10500,
        speedUnit: "km/h",
        engineCc: 160,
        tankCapacityLiters: 12
      },
      maintenanceSchedule: [
        { id: "oil", service: "Aceite TVS Tru4 SYNTHETIC 10W-30 (1.2L)", intervalKm: 2500 },
        { id: "chain", service: "Limpieza y Tensión Cadena (holgura 20-25mm)", intervalKm: 800 },
        { id: "brakes", service: "Pastillas de Freno Roto Petal", intervalKm: 6000 },
        { id: "spark", service: "Bujía BOSCH UR4KE / RG8MC5 (0.7-0.9mm)", intervalKm: 10000 },
        { id: "air_filter", service: "Filtro de Aire Oficial", intervalKm: 10000 },
        { id: "sprocket_rubber", service: "Cauchos Sprocket Rueda Trasera", intervalKm: 10000 }
      ]
    }
  }
];

export const ANDERSON_OFFICIAL_APACHE = DEMO_GARAGE[5];
export const DEMO_PREVIEW_IDS = [
  "bike_yamaha_mt09", 
  "bike_ktm_duke390", 
  "bike_kawasaki_zx6r", 
  "bike_ducati_panigale", 
  "bike_bmw_s1000rr"
];

