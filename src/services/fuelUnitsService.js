/**
 * MotoDash AI — Servicio Oficial de Unidades de Combustible por País
 *
 * En estaciones de servicio:
 * - GALONES (1 Galón US = 3.78541 Litros):
 *   Colombia, Estados Unidos, Perú, Ecuador, Panamá, Guatemala, El Salvador,
 *   Honduras, Nicaragua, República Dominicana, Puerto Rico.
 * - LITROS (L):
 *   México, España, Chile, Argentina, Brasil, Reino Unido, Costa Rica,
 *   Uruguay, Paraguay, Bolivia, Venezuela, Canadá y resto de Europa.
 */

export const LITERS_PER_US_GALLON = 3.78541;

export const COUNTRY_FUEL_UNITS = {
  // === PAÍSES EN GALONES (US GALLON = 3.78541 L) ===
  Colombia: {
    country: 'Colombia',
    iso: 'CO',
    flag: '🇨🇴',
    unit: 'gal',
    isGallons: true,
    unitLabelEs: 'Galones',
    unitLabelEn: 'Gallons',
    unitShort: 'Gal',
    efficiencyLabel: 'KM / GAL',
    secondaryEfficiencyLabel: 'KM / L',
    defaultRefuelAmount: 2.2, // ~8.3 Litros
    defaultRefuelCost: 34000
  },
  'Estados Unidos': {
    country: 'Estados Unidos',
    iso: 'US',
    flag: '🇺🇸',
    unit: 'gal',
    isGallons: true,
    unitLabelEs: 'Galones',
    unitLabelEn: 'Gallons',
    unitShort: 'Gal',
    efficiencyLabel: 'KM / GAL',
    secondaryEfficiencyLabel: 'KM / L',
    defaultRefuelAmount: 2.5,
    defaultRefuelCost: 10
  },
  Perú: {
    country: 'Perú',
    iso: 'PE',
    flag: '🇵🇪',
    unit: 'gal',
    isGallons: true,
    unitLabelEs: 'Galones',
    unitLabelEn: 'Gallons',
    unitShort: 'Gal',
    efficiencyLabel: 'KM / GAL',
    secondaryEfficiencyLabel: 'KM / L',
    defaultRefuelAmount: 2.2,
    defaultRefuelCost: 38
  },
  Ecuador: {
    country: 'Ecuador',
    iso: 'EC',
    flag: '🇪🇨',
    unit: 'gal',
    isGallons: true,
    unitLabelEs: 'Galones',
    unitLabelEn: 'Gallons',
    unitShort: 'Gal',
    efficiencyLabel: 'KM / GAL',
    secondaryEfficiencyLabel: 'KM / L',
    defaultRefuelAmount: 2.2,
    defaultRefuelCost: 6
  },
  Panamá: {
    country: 'Panamá',
    iso: 'PA',
    flag: '🇵🇦',
    unit: 'gal',
    isGallons: true,
    unitLabelEs: 'Galones',
    unitLabelEn: 'Gallons',
    unitShort: 'Gal',
    efficiencyLabel: 'KM / GAL',
    secondaryEfficiencyLabel: 'KM / L',
    defaultRefuelAmount: 2.2,
    defaultRefuelCost: 8
  },
  Guatemala: {
    country: 'Guatemala',
    iso: 'GT',
    flag: '🇬🇹',
    unit: 'gal',
    isGallons: true,
    unitLabelEs: 'Galones',
    unitLabelEn: 'Gallons',
    unitShort: 'Gal',
    efficiencyLabel: 'KM / GAL',
    secondaryEfficiencyLabel: 'KM / L',
    defaultRefuelAmount: 2.2,
    defaultRefuelCost: 75
  },
  'El Salvador': {
    country: 'El Salvador',
    iso: 'SV',
    flag: '🇸🇻',
    unit: 'gal',
    isGallons: true,
    unitLabelEs: 'Galones',
    unitLabelEn: 'Gallons',
    unitShort: 'Gal',
    efficiencyLabel: 'KM / GAL',
    secondaryEfficiencyLabel: 'KM / L',
    defaultRefuelAmount: 2.2,
    defaultRefuelCost: 9
  },
  Honduras: {
    country: 'Honduras',
    iso: 'HN',
    flag: '🇭🇳',
    unit: 'gal',
    isGallons: true,
    unitLabelEs: 'Galones',
    unitLabelEn: 'Gallons',
    unitShort: 'Gal',
    efficiencyLabel: 'KM / GAL',
    secondaryEfficiencyLabel: 'KM / L',
    defaultRefuelAmount: 2.2,
    defaultRefuelCost: 220
  },
  Nicaragua: {
    country: 'Nicaragua',
    iso: 'NI',
    flag: '🇳🇮',
    unit: 'gal',
    isGallons: true,
    unitLabelEs: 'Galones',
    unitLabelEn: 'Gallons',
    unitShort: 'Gal',
    efficiencyLabel: 'KM / GAL',
    secondaryEfficiencyLabel: 'KM / L',
    defaultRefuelAmount: 2.2,
    defaultRefuelCost: 380
  },
  'República Dominicana': {
    country: 'República Dominicana',
    iso: 'DO',
    flag: '🇩🇴',
    unit: 'gal',
    isGallons: true,
    unitLabelEs: 'Galones',
    unitLabelEn: 'Gallons',
    unitShort: 'Gal',
    efficiencyLabel: 'KM / GAL',
    secondaryEfficiencyLabel: 'KM / L',
    defaultRefuelAmount: 2.2,
    defaultRefuelCost: 640
  },

  // === PAÍSES EN LITROS (L) ===
  México: {
    country: 'México',
    iso: 'MX',
    flag: '🇲🇽',
    unit: 'L',
    isGallons: false,
    unitLabelEs: 'Litros',
    unitLabelEn: 'Liters',
    unitShort: 'L',
    efficiencyLabel: 'KM / L',
    secondaryEfficiencyLabel: 'KM / GAL',
    defaultRefuelAmount: 8.5,
    defaultRefuelCost: 210
  },
  España: {
    country: 'España',
    iso: 'ES',
    flag: '🇪🇸',
    unit: 'L',
    isGallons: false,
    unitLabelEs: 'Litros',
    unitLabelEn: 'Liters',
    unitShort: 'L',
    efficiencyLabel: 'KM / L',
    secondaryEfficiencyLabel: 'KM / GAL',
    defaultRefuelAmount: 8.5,
    defaultRefuelCost: 14
  },
  Chile: {
    country: 'Chile',
    iso: 'CL',
    flag: '🇨🇱',
    unit: 'L',
    isGallons: false,
    unitLabelEs: 'Litros',
    unitLabelEn: 'Liters',
    unitShort: 'L',
    efficiencyLabel: 'KM / L',
    secondaryEfficiencyLabel: 'KM / GAL',
    defaultRefuelAmount: 8.5,
    defaultRefuelCost: 11000
  },
  Argentina: {
    country: 'Argentina',
    iso: 'AR',
    flag: '🇦🇷',
    unit: 'L',
    isGallons: false,
    unitLabelEs: 'Litros',
    unitLabelEn: 'Liters',
    unitShort: 'L',
    efficiencyLabel: 'KM / L',
    secondaryEfficiencyLabel: 'KM / GAL',
    defaultRefuelAmount: 8.5,
    defaultRefuelCost: 9500
  },
  Brasil: {
    country: 'Brasil',
    iso: 'BR',
    flag: '🇧🇷',
    unit: 'L',
    isGallons: false,
    unitLabelEs: 'Litros',
    unitLabelEn: 'Liters',
    unitShort: 'L',
    efficiencyLabel: 'KM / L',
    secondaryEfficiencyLabel: 'KM / GAL',
    defaultRefuelAmount: 8.5,
    defaultRefuelCost: 50
  },
  'Reino Unido': {
    country: 'Reino Unido',
    iso: 'UK',
    flag: '🇬🇧',
    unit: 'L',
    isGallons: false,
    unitLabelEs: 'Litros',
    unitLabelEn: 'Liters',
    unitShort: 'L',
    efficiencyLabel: 'KM / L',
    secondaryEfficiencyLabel: 'KM / GAL',
    defaultRefuelAmount: 8.5,
    defaultRefuelCost: 13
  },
  'Costa Rica': {
    country: 'Costa Rica',
    iso: 'CR',
    flag: '🇨🇷',
    unit: 'L',
    isGallons: false,
    unitLabelEs: 'Litros',
    unitLabelEn: 'Liters',
    unitShort: 'L',
    efficiencyLabel: 'KM / L',
    secondaryEfficiencyLabel: 'KM / GAL',
    defaultRefuelAmount: 8.5,
    defaultRefuelCost: 6000
  },
  Uruguay: {
    country: 'Uruguay',
    iso: 'UY',
    flag: '🇺🇾',
    unit: 'L',
    isGallons: false,
    unitLabelEs: 'Litros',
    unitLabelEn: 'Liters',
    unitShort: 'L',
    efficiencyLabel: 'KM / L',
    secondaryEfficiencyLabel: 'KM / GAL',
    defaultRefuelAmount: 8.5,
    defaultRefuelCost: 650
  },
  Venezuela: {
    country: 'Venezuela',
    iso: 'VE',
    flag: '🇻🇪',
    unit: 'L',
    isGallons: false,
    unitLabelEs: 'Litros',
    unitLabelEn: 'Liters',
    unitShort: 'L',
    efficiencyLabel: 'KM / L',
    secondaryEfficiencyLabel: 'KM / GAL',
    defaultRefuelAmount: 8.5,
    defaultRefuelCost: 4.5
  }
};

const ISO_TO_COUNTRY = {
  CO: 'Colombia',
  US: 'Estados Unidos',
  PE: 'Perú',
  EC: 'Ecuador',
  PA: 'Panamá',
  GT: 'Guatemala',
  SV: 'El Salvador',
  HN: 'Honduras',
  NI: 'Nicaragua',
  DO: 'República Dominicana',
  MX: 'México',
  ES: 'España',
  CL: 'Chile',
  AR: 'Argentina',
  BR: 'Brasil',
  UK: 'Reino Unido',
  CR: 'Costa Rica',
  UY: 'Uruguay',
  VE: 'Venezuela'
};

export function litersToGallons(liters) {
  const l = Number(liters) || 0;
  return Number((l / LITERS_PER_US_GALLON).toFixed(2));
}

export function gallonsToLiters(gallons) {
  const g = Number(gallons) || 0;
  return Number((g * LITERS_PER_US_GALLON).toFixed(2));
}

export function resolveActiveCountry({ bike = null, hojaDeVida = null, userProfile = null, currency = 'COP' } = {}) {
  const hoja = hojaDeVida || bike?.hojaDeVida || {};
  const rawCountry =
    hoja?.country ||
    ISO_TO_COUNTRY[hoja?.multas?.pais] ||
    userProfile?.country ||
    null;

  if (rawCountry) {
    const normalized = String(rawCountry).trim();
    if (COUNTRY_FUEL_UNITS[normalized]) return normalized;
    if (ISO_TO_COUNTRY[normalized.toUpperCase()]) return ISO_TO_COUNTRY[normalized.toUpperCase()];

    const lower = normalized.toLowerCase();
    if (lower.includes('colombia')) return 'Colombia';
    if (lower.includes('estados unidos') || lower.includes('usa') || lower.includes('united states')) return 'Estados Unidos';
    if (lower.includes('peru') || lower.includes('perú')) return 'Perú';
    if (lower.includes('ecuador')) return 'Ecuador';
    if (lower.includes('panam')) return 'Panamá';
    if (lower.includes('guatemala')) return 'Guatemala';
    if (lower.includes('salvador')) return 'El Salvador';
    if (lower.includes('honduras')) return 'Honduras';
    if (lower.includes('nicaragua')) return 'Nicaragua';
    if (lower.includes('dominicana')) return 'República Dominicana';
    if (lower.includes('mexic') || lower.includes('méxic')) return 'México';
    if (lower.includes('espa')) return 'España';
    if (lower.includes('chile')) return 'Chile';
    if (lower.includes('argentina')) return 'Argentina';
    if (lower.includes('brasil') || lower.includes('brazil')) return 'Brasil';
    if (lower.includes('costa rica')) return 'Costa Rica';
    if (lower.includes('uruguay')) return 'Uruguay';
    if (lower.includes('venezuela')) return 'Venezuela';
  }

  // Fallback por moneda si no se definió país explícito
  if (currency === 'MXN') return 'México';
  if (currency === 'EUR') return 'España';
  if (currency === 'BRL') return 'Brasil';
  return 'Colombia';
}

export function getCountryFuelConfig(options = {}) {
  const countryName = resolveActiveCountry(options);
  return COUNTRY_FUEL_UNITS[countryName] || COUNTRY_FUEL_UNITS.Colombia;
}
