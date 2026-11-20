import { supabase } from './supabaseClient';

const STORAGE_KEYS = {
  INFLUENCERS: 'motodash_founder_influencers_v1',
  GIFT_CODES: 'motodash_founder_gift_codes_v1',
  REDEMPTIONS: 'motodash_founder_redemptions_v1',
  COUNTRY_SUBS: 'motodash_founder_country_subs_v1',
  API_USAGE: 'motodash_founder_api_usage_v1',
  APP_GOVERNANCE: 'motodash_founder_governance_v1'
};

export const PLAN_PRICES_USD = {
  solo: { name: 'Rider Solo (1 Moto)', monthly: 1.99, annual: 14.99 },
  pro_monthly: { name: 'Rider PRO (3 Motos + OBD-II + IA)', monthly: 4.99, annual: 39.99 },
  garage: { name: 'Garaje / Taller (15 Motos)', monthly: 9.99, annual: 79.99 },
  b2b_mall: { name: 'Tienda Oficial MotoMall B2B', monthly: 14.99, annual: 149.0 }
};

export const DEFAULT_COUNTRY_SUBSCRIPTIONS = [
  { code: 'CO', country: 'Colombia', flag: '🇨🇴', freeUsers: 185, soloSubs: 24, proSubs: 38, garageSubs: 6, b2bStores: 4 },
  { code: 'MX', country: 'México', flag: '🇲🇽', freeUsers: 94, soloSubs: 12, proSubs: 19, garageSubs: 3, b2bStores: 2 },
  { code: 'ES', country: 'España', flag: '🇪🇸', freeUsers: 72, soloSubs: 9, proSubs: 16, garageSubs: 2, b2bStores: 1 },
  { code: 'BR', country: 'Brasil', flag: '🇧🇷', freeUsers: 68, soloSubs: 8, proSubs: 14, garageSubs: 2, b2bStores: 1 },
  { code: 'US', country: 'Estados Unidos', flag: '🇺🇸', freeUsers: 45, soloSubs: 6, proSubs: 12, garageSubs: 3, b2bStores: 1 },
  { code: 'AR', country: 'Argentina', flag: '🇦🇷', freeUsers: 39, soloSubs: 5, proSubs: 7, garageSubs: 1, b2bStores: 1 },
  { code: 'CL', country: 'Chile', flag: '🇨🇱', freeUsers: 34, soloSubs: 4, proSubs: 8, garageSubs: 1, b2bStores: 1 },
  { code: 'PE', country: 'Perú', flag: '🇵🇪', freeUsers: 41, soloSubs: 6, proSubs: 9, garageSubs: 1, b2bStores: 1 },
  { code: 'FR', country: 'Francia', flag: '🇫🇷', freeUsers: 18, soloSubs: 2, proSubs: 5, garageSubs: 1, b2bStores: 0 },
  { code: 'IT', country: 'Italia', flag: '🇮🇹', freeUsers: 22, soloSubs: 3, proSubs: 6, garageSubs: 1, b2bStores: 0 },
  { code: 'DE', country: 'Alemania', flag: '🇩🇪', freeUsers: 16, soloSubs: 2, proSubs: 5, garageSubs: 1, b2bStores: 0 }
];

export const DEFAULT_API_USAGE = {
  callsToday: 28,
  callsThisMonth: 642,
  lawyerAiCalls: 310,
  doctorMotorCalls: 218,
  opticalScannerCalls: 114,
  estimatedTokensMonth: 545700,
  // Configuración de límites y control de gasto
  maxDailyFreeUserCalls: 5,
  maxDailyProUserCalls: 40,
  monthlyBudgetLimitUsd: 15.0,
  economyLocalOnlyMode: false, // Si es true, fuerza respuestas del motor local sin gastar tokens de Gemini
  rateLimitPerMinuteIp: 25,
  lastResetDate: '2026-11-01'
};

export const DEFAULT_APP_GOVERNANCE = {
  announcementActive: false,
  announcementText: '🔥 ¡Lanzamiento Oficial MotoDash AI V3.0! Usa el código MOTOPRO30 para activar 30 días de Plan Rider PRO Gratis.',
  announcementType: 'promo', // 'promo' | 'warning' | 'info'
  allowNewB2bStores: true,
  allowMarketplaceListings: true,
  allowFreeTrial7Days: true,
  requirePinOnGlovebox: true
};

export const DEFAULT_INFLUENCERS = [
  {
    id: 'inf_co_1',
    name: 'Full Gass (Colombia)',
    handle: '@fullgassoficial',
    platform: 'YouTube / Instagram',
    country: 'Colombia',
    flag: '🇨🇴',
    code: 'FULLGASS',
    commissionPercent: 30,
    followerDiscountPercent: 20,
    followerFreeDays: 30,
    giftedPlan: 'founder_vip',
    status: 'active',
    referralsCount: 42,
    paidConversions: 18,
    avgPlanId: 'pro_monthly',
    paidOutUsd: 0,
    notes: 'Embajador principal Colombia • 30% comisión recurrente + 1 mes PRO a seguidores'
  },
  {
    id: 'inf_co_2',
    name: 'Sebas / Medina Motors',
    handle: '@medinamotors',
    platform: 'TikTok / YouTube',
    country: 'Colombia',
    flag: '🇨🇴',
    code: 'MEDINAPRO',
    commissionPercent: 30,
    followerDiscountPercent: 20,
    followerFreeDays: 30,
    giftedPlan: 'pro_monthly',
    status: 'active',
    referralsCount: 27,
    paidConversions: 11,
    avgPlanId: 'pro_monthly',
    paidOutUsd: 0,
    notes: 'Especialista en retenes, mecánica y pruebas de ruta en Colombia'
  },
  {
    id: 'inf_es_1',
    name: 'Majes en Moto',
    handle: '@majesenmoto',
    platform: 'YouTube / Instagram',
    country: 'España',
    flag: '🇪🇸',
    code: 'MAJESMOTO',
    commissionPercent: 35,
    followerDiscountPercent: 20,
    followerFreeDays: 15,
    giftedPlan: 'pro_monthly',
    status: 'active',
    referralsCount: 19,
    paidConversions: 9,
    avgPlanId: 'pro_monthly',
    paidOutUsd: 0,
    notes: 'Creador líder en España • Enfoque ITV, DGT y rutas'
  },
  {
    id: 'inf_mx_1',
    name: 'Velocidad Total / Motos MX',
    handle: '@velocidadtotal',
    platform: 'YouTube / TikTok',
    country: 'México',
    flag: '🇲🇽',
    code: 'VELOCIDADMX',
    commissionPercent: 30,
    followerDiscountPercent: 25,
    followerFreeDays: 30,
    giftedPlan: 'pro_monthly',
    status: 'active',
    referralsCount: 15,
    paidConversions: 6,
    avgPlanId: 'pro_monthly',
    paidOutUsd: 0,
    notes: 'Embajador México • Diagnóstico mecánico y Doctor Motor IA'
  },
  {
    id: 'inf_br_1',
    name: 'Chico Sepúlveda / Motos BR',
    handle: '@chicosepulveda',
    platform: 'YouTube / Instagram',
    country: 'Brasil',
    flag: '🇧🇷',
    code: 'MOTOBR',
    commissionPercent: 30,
    followerDiscountPercent: 20,
    followerFreeDays: 30,
    giftedPlan: 'pro_monthly',
    status: 'active',
    referralsCount: 12,
    paidConversions: 5,
    avgPlanId: 'pro_monthly',
    paidOutUsd: 0,
    notes: 'Embajador Brasil • Defensa CTB SENATRAN y telemetría'
  }
];

export const DEFAULT_GIFT_CODES = [
  {
    id: 'gift_creator_vip',
    code: 'CREADORVIP',
    type: 'free_subscription',
    planId: 'pro_monthly',
    durationDays: 365,
    discountPercent: 100,
    maxUses: 25,
    usedCount: 3,
    assignedTo: 'Creadores de Contenido Invitados (1 Año PRO Gratis)',
    status: 'active',
    createdAt: '2026-11-19'
  },
  {
    id: 'gift_sorteo_pro',
    code: 'MOTOPRO30',
    type: 'free_subscription',
    planId: 'pro_monthly',
    durationDays: 30,
    discountPercent: 100,
    maxUses: 100,
    usedCount: 14,
    assignedTo: 'Sorteo Lanzamiento Beta (30 Días Rider PRO Gratis)',
    status: 'active',
    createdAt: '2026-11-19'
  },
  {
    id: 'gift_taller_b2b',
    code: 'TALLERFUNDADOR',
    type: 'free_subscription',
    planId: 'garage',
    durationDays: 90,
    discountPercent: 100,
    maxUses: 20,
    usedCount: 2,
    assignedTo: 'Talleres y Almacenes Aliados MotoMall (3 Meses Gratis)',
    status: 'active',
    createdAt: '2026-11-19'
  }
];

export function loadInfluencers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INFLUENCERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  localStorage.setItem(STORAGE_KEYS.INFLUENCERS, JSON.stringify(DEFAULT_INFLUENCERS));
  return DEFAULT_INFLUENCERS;
}

export function saveInfluencers(list) {
  try {
    localStorage.setItem(STORAGE_KEYS.INFLUENCERS, JSON.stringify(list));
  } catch {}
  return list;
}

export function loadGiftCodes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GIFT_CODES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  localStorage.setItem(STORAGE_KEYS.GIFT_CODES, JSON.stringify(DEFAULT_GIFT_CODES));
  return DEFAULT_GIFT_CODES;
}

export function saveGiftCodes(list) {
  try {
    localStorage.setItem(STORAGE_KEYS.GIFT_CODES, JSON.stringify(list));
  } catch {}
  return list;
}

export function loadRedemptions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REDEMPTIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  const initial = [
    {
      id: 'red_1',
      code: 'FULLGASS',
      userEmail: 'carlos.rider@gmail.com',
      planId: 'pro_monthly',
      benefitLabel: '30 días PRO Gratis + 20% OFF',
      influencerName: 'Full Gass (Colombia)',
      redeemedAt: '2026-11-19 18:20'
    },
    {
      id: 'red_2',
      code: 'CREADORVIP',
      userEmail: 'sebas.motos@gmail.com',
      planId: 'pro_monthly',
      benefitLabel: 'Regalo Fundador: 365 días Plan PRO Gratis (100% OFF)',
      influencerName: 'Regalo Directo Fundador',
      redeemedAt: '2026-11-19 19:05'
    }
  ];
  localStorage.setItem(STORAGE_KEYS.REDEMPTIONS, JSON.stringify(initial));
  return initial;
}

export function saveRedemptions(list) {
  try {
    localStorage.setItem(STORAGE_KEYS.REDEMPTIONS, JSON.stringify(list));
  } catch {}
  return list;
}

export function loadCountrySubscriptions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COUNTRY_SUBS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  localStorage.setItem(STORAGE_KEYS.COUNTRY_SUBS, JSON.stringify(DEFAULT_COUNTRY_SUBSCRIPTIONS));
  return DEFAULT_COUNTRY_SUBSCRIPTIONS;
}

export function saveCountrySubscriptions(list) {
  try {
    localStorage.setItem(STORAGE_KEYS.COUNTRY_SUBS, JSON.stringify(list));
  } catch {}
  return list;
}

export function loadApiUsageConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.API_USAGE);
    if (raw) {
      return { ...DEFAULT_API_USAGE, ...JSON.parse(raw) };
    }
  } catch {}
  localStorage.setItem(STORAGE_KEYS.API_USAGE, JSON.stringify(DEFAULT_API_USAGE));
  return DEFAULT_API_USAGE;
}

export function saveApiUsageConfig(cfg) {
  const merged = { ...loadApiUsageConfig(), ...cfg };
  try {
    localStorage.setItem(STORAGE_KEYS.API_USAGE, JSON.stringify(merged));
  } catch {}
  return merged;
}

/**
 * Registra cada llamada real a la API de IA (Abogado Vial, Doctor Motor o Escáner Óptico)
 * y verifica si el Fundador activó el Modo Ahorro ($0 tokens) o si se superó el presupuesto.
 */
export function checkAndRecordAiApiCall(moduleType = 'lawyer', estimatedTokens = 850) {
  const usage = loadApiUsageConfig();
  const costUsdSoFar = Number(((usage.estimatedTokensMonth / 1000000) * 0.15).toFixed(4));

  if (usage.economyLocalOnlyMode || costUsdSoFar >= Number(usage.monthlyBudgetLimitUsd || 15)) {
    return {
      allowed: false,
      reason: usage.economyLocalOnlyMode
        ? 'Modo Ahorro Local activo por el Fundador ($0 costo tokens).'
        : 'Tope de presupuesto mensual de API alcanzado.'
    };
  }

  const next = {
    ...usage,
    callsToday: (Number(usage.callsToday) || 0) + 1,
    callsThisMonth: (Number(usage.callsThisMonth) || 0) + 1,
    lawyerAiCalls: moduleType === 'lawyer' ? (Number(usage.lawyerAiCalls) || 0) + 1 : usage.lawyerAiCalls,
    doctorMotorCalls: moduleType === 'doctor' ? (Number(usage.doctorMotorCalls) || 0) + 1 : usage.doctorMotorCalls,
    opticalScannerCalls: moduleType === 'scanner' ? (Number(usage.opticalScannerCalls) || 0) + 1 : usage.opticalScannerCalls,
    estimatedTokensMonth: (Number(usage.estimatedTokensMonth) || 0) + estimatedTokens
  };
  saveApiUsageConfig(next);
  return { allowed: true, usage: next };
}

export function loadAppGovernance() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APP_GOVERNANCE);
    if (raw) {
      return { ...DEFAULT_APP_GOVERNANCE, ...JSON.parse(raw) };
    }
  } catch {}
  localStorage.setItem(STORAGE_KEYS.APP_GOVERNANCE, JSON.stringify(DEFAULT_APP_GOVERNANCE));
  return DEFAULT_APP_GOVERNANCE;
}

export function saveAppGovernance(gov) {
  const merged = { ...loadAppGovernance(), ...gov };
  try {
    localStorage.setItem(STORAGE_KEYS.APP_GOVERNANCE, JSON.stringify(merged));
  } catch {}
  return merged;
}

/**
 * Consulta en vivo el estado real de las tablas de Supabase para el Panel de Control del Fundador
 */
export async function fetchLiveSupabasePlatformStats() {
  const stats = {
    storesCount: 0,
    productsCount: 0,
    listingsCount: 0,
    clansCount: 0,
    stores: [],
    listings: []
  };

  try {
    const [storesRes, prodsRes, listRes, clansRes] = await Promise.all([
      supabase.from('mall_stores').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('mall_products').select('id', { count: 'exact', head: true }),
      supabase.from('marketplace_listings').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('moto_clans').select('id', { count: 'exact', head: true })
    ]);

    if (Array.isArray(storesRes.data)) {
      stats.stores = storesRes.data;
      stats.storesCount = storesRes.data.length;
    }
    if (typeof prodsRes.count === 'number') {
      stats.productsCount = prodsRes.count;
    }
    if (Array.isArray(listRes.data)) {
      stats.listings = listRes.data;
      stats.listingsCount = listRes.data.length;
    }
    if (typeof clansRes.count === 'number') {
      stats.clansCount = clansRes.count;
    }
  } catch {}

  return stats;
}

/**
 * Calcula las métricas de suscripciones totales y por país (11 países)
 */
export function computeCountrySubscriptionsReport(countriesList = []) {
  let grandTotalFree = 0;
  let grandTotalSolo = 0;
  let grandTotalPro = 0;
  let grandTotalGarage = 0;
  let grandTotalB2b = 0;
  let grandTotalPaidSubs = 0;
  let grandTotalMrrUsd = 0;

  const enriched = countriesList.map((c) => {
    const free = Math.max(0, Number(c.freeUsers) || 0);
    const solo = Math.max(0, Number(c.soloSubs) || 0);
    const pro = Math.max(0, Number(c.proSubs) || 0);
    const garage = Math.max(0, Number(c.garageSubs) || 0);
    const b2b = Math.max(0, Number(c.b2bStores) || 0);

    const paidSubs = solo + pro + garage + b2b;
    const mrrUsd = Number(
      (
        solo * PLAN_PRICES_USD.solo.monthly +
        pro * PLAN_PRICES_USD.pro_monthly.monthly +
        garage * PLAN_PRICES_USD.garage.monthly +
        b2b * PLAN_PRICES_USD.b2b_mall.monthly
      ).toFixed(2)
    );

    grandTotalFree += free;
    grandTotalSolo += solo;
    grandTotalPro += pro;
    grandTotalGarage += garage;
    grandTotalB2b += b2b;
    grandTotalPaidSubs += paidSubs;
    grandTotalMrrUsd += mrrUsd;

    return {
      ...c,
      paidSubs,
      totalUsers: free + paidSubs,
      mrrUsd
    };
  });

  const withShares = enriched
    .map((c) => ({
      ...c,
      sharePercent: grandTotalPaidSubs > 0 ? Math.round((c.paidSubs / grandTotalPaidSubs) * 100) : 0
    }))
    .sort((a, b) => b.paidSubs - a.paidSubs);

  return {
    countries: withShares,
    grandTotalFree,
    grandTotalSolo,
    grandTotalPro,
    grandTotalGarage,
    grandTotalB2b,
    grandTotalPaidSubs,
    grandTotalUsers: grandTotalFree + grandTotalPaidSubs,
    grandTotalMrrUsd: Number(grandTotalMrrUsd.toFixed(2)),
    grandTotalMrrCop: Math.round(grandTotalMrrUsd * 4200)
  };
}

export function computeInfluencerMetrics(inf) {
  const planInfo = PLAN_PRICES_USD[inf.avgPlanId || 'pro_monthly'] || PLAN_PRICES_USD.pro_monthly;
  const discountFactor = 1 - Math.min(90, Math.max(0, Number(inf.followerDiscountPercent) || 0)) / 100;
  const effectiveMonthlyPrice = Number((planInfo.monthly * discountFactor).toFixed(2));
  const paidSubs = Math.max(0, Number(inf.paidConversions) || 0);
  const grossMonthlyUsd = Number((paidSubs * effectiveMonthlyPrice).toFixed(2));
  const commPct = Math.min(80, Math.max(0, Number(inf.commissionPercent) || 0));
  const influencerCutUsd = Number(((grossMonthlyUsd * commPct) / 100).toFixed(2));
  const gatewayFeeUsd = Number((grossMonthlyUsd * 0.05 + paidSubs * 0.25).toFixed(2));
  const founderNetUsd = Number(Math.max(0, grossMonthlyUsd - influencerCutUsd - gatewayFeeUsd).toFixed(2));
  const pendingPayoutUsd = Number(Math.max(0, influencerCutUsd - (Number(inf.paidOutUsd) || 0)).toFixed(2));

  return {
    effectiveMonthlyPrice,
    grossMonthlyUsd,
    influencerCutUsd,
    gatewayFeeUsd,
    founderNetUsd,
    pendingPayoutUsd,
    conversionRate:
      inf.referralsCount > 0 ? Math.round((paidSubs / Number(inf.referralsCount)) * 100) : 0
  };
}

export function computeGlobalFounderSummary(influencers = [], giftCodes = [], countriesList = []) {
  let totalReferrals = 0;
  let totalPaidSubsFromInfluencers = 0;
  let totalGrossUsd = 0;
  let totalInfluencerCommissionsUsd = 0;
  let totalFounderNetUsd = 0;
  let totalPendingPayoutUsd = 0;

  influencers.forEach((inf) => {
    const m = computeInfluencerMetrics(inf);
    totalReferrals += Number(inf.referralsCount) || 0;
    totalPaidSubsFromInfluencers += Number(inf.paidConversions) || 0;
    totalGrossUsd += m.grossMonthlyUsd;
    totalInfluencerCommissionsUsd += m.influencerCutUsd;
    totalFounderNetUsd += m.founderNetUsd;
    totalPendingPayoutUsd += m.pendingPayoutUsd;
  });

  const countryReport = computeCountrySubscriptionsReport(
    countriesList.length > 0 ? countriesList : loadCountrySubscriptions()
  );

  const totalGiftedSubscriptions = giftCodes.reduce((acc, g) => acc + (Number(g.usedCount) || 0), 0);

  return {
    totalInfluencers: influencers.length,
    activeInfluencers: influencers.filter((i) => i.status === 'active').length,
    totalReferrals,
    totalPaidSubs: countryReport.grandTotalPaidSubs,
    totalPaidSubsFromInfluencers,
    totalUsersGlobal: countryReport.grandTotalUsers,
    totalGiftedSubscriptions,
    totalGrossUsd: countryReport.grandTotalMrrUsd,
    totalInfluencerCommissionsUsd: Number(totalInfluencerCommissionsUsd.toFixed(2)),
    totalFounderNetUsd: Number(
      Math.max(0, countryReport.grandTotalMrrUsd * 0.94 - totalInfluencerCommissionsUsd).toFixed(2)
    ),
    totalPendingPayoutUsd: Number(totalPendingPayoutUsd.toFixed(2)),
    totalFounderNetCop: Math.round(
      Math.max(0, countryReport.grandTotalMrrUsd * 0.94 - totalInfluencerCommissionsUsd) * 4200
    )
  };
}

export async function redeemPromoOrGiftCode(rawCode, userProfile = null) {
  const cleanCode = String(rawCode || '').trim().toUpperCase();
  if (!cleanCode) {
    return { success: false, error: 'Escribe un código válido.' };
  }

  const giftCodes = loadGiftCodes();
  const influencers = loadInfluencers();
  const redemptions = loadRedemptions();
  const userEmail = userProfile?.email || 'piloto.invitado@motodash.ai';

  const giftIdx = giftCodes.findIndex((g) => String(g.code).toUpperCase() === cleanCode);
  if (giftIdx !== -1) {
    const gift = giftCodes[giftIdx];
    if (gift.status !== 'active') {
      return { success: false, error: 'Este código se encuentra pausado o inactivo.' };
    }
    if (gift.maxUses > 0 && gift.usedCount >= gift.maxUses) {
      return { success: false, error: 'Este código ya alcanzó su límite máximo de cupos.' };
    }

    const updatedGift = { ...gift, usedCount: (Number(gift.usedCount) || 0) + 1 };
    const nextGifts = [...giftCodes];
    nextGifts[giftIdx] = updatedGift;
    saveGiftCodes(nextGifts);

    const isFreeSub = gift.type === 'free_subscription' || Number(gift.discountPercent) >= 100;
    const unlockedPlan = gift.planId || 'pro_monthly';
    const benefitText = isFreeSub
      ? `🎁 Suscripción Gratis Activada: ${PLAN_PRICES_USD[unlockedPlan]?.name || 'Rider PRO'} por ${gift.durationDays} días`
      : `🏷️ Descuento del ${gift.discountPercent}% activado en tu suscripción`;

    const newRedemption = {
      id: `red_${Date.now()}`,
      code: cleanCode,
      userEmail,
      planId: unlockedPlan,
      benefitLabel: benefitText,
      influencerName: gift.assignedTo || 'Código Regalo Fundador',
      redeemedAt: new Date().toLocaleString()
    };
    saveRedemptions([newRedemption, ...redemptions]);

    try {
      await supabase.auth.updateUser({
        data: {
          plan: unlockedPlan,
          is_pro: true,
          redeemed_code: cleanCode,
          gift_expires_days: gift.durationDays
        }
      });
    } catch {}

    return {
      success: true,
      isFullFreeUnlock: isFreeSub,
      unlockedPlanId: unlockedPlan,
      durationDays: gift.durationDays,
      discountPercent: gift.discountPercent || 100,
      message: `🎉 ¡Código ${cleanCode} canjeado con éxito! ${benefitText}.`
    };
  }

  const infIdx = influencers.findIndex((i) => String(i.code).toUpperCase() === cleanCode);
  if (infIdx !== -1) {
    const inf = influencers[infIdx];
    if (inf.status !== 'active') {
      return { success: false, error: 'El código de este creador no está activo actualmente.' };
    }

    const updatedInf = {
      ...inf,
      referralsCount: (Number(inf.referralsCount) || 0) + 1,
      paidConversions: (Number(inf.paidConversions) || 0) + 1
    };
    const nextInfs = [...influencers];
    nextInfs[infIdx] = updatedInf;
    saveInfluencers(nextInfs);

    const freeDays = Number(inf.followerFreeDays) || 30;
    const discPct = Number(inf.followerDiscountPercent) || 20;
    const benefitText = `Embajador ${inf.name}: ${freeDays} días PRO Gratis + ${discPct}% de descuento`;

    const newRedemption = {
      id: `red_${Date.now()}`,
      code: cleanCode,
      userEmail,
      planId: 'pro_monthly',
      benefitLabel: benefitText,
      influencerName: inf.name,
      redeemedAt: new Date().toLocaleString()
    };
    saveRedemptions([newRedemption, ...redemptions]);

    try {
      await supabase.auth.updateUser({
        data: {
          plan: 'pro_monthly',
          is_pro: true,
          referred_by_code: cleanCode,
          referred_by_influencer: inf.name
        }
      });
    } catch {}

    return {
      success: true,
      isFullFreeUnlock: freeDays >= 15,
      unlockedPlanId: 'pro_monthly',
      durationDays: freeDays,
      discountPercent: discPct,
      influencerName: inf.name,
      message: `🔥 ¡Código oficial de ${inf.name} (${cleanCode}) activado! Tienes ${freeDays} días de Plan Rider PRO gratis + ${discPct}% OFF.`
    };
  }

  return {
    success: false,
    error: `El código "${cleanCode}" no existe o ya expiró. Verifica que esté bien escrito.`
  };
}

export function buildInfluencerPitchMessage(inf) {
  const url = typeof window !== 'undefined' ? window.location.origin : 'https://motodash.ai';
  return `¡Hola ${inf.name}! 🏍️🔥 Soy Anderson, creador y fundador de *MotoDash AI* (la primera app todo-en-uno con Telemetría GPS/OBD-II, 17 piezas de Mantenimiento Predictivo, Guantera Modo Retén con bloqueo PIN y Abogado Vial IA anti-inmovilización).

Ya te activé tu cuenta *Embajador VIP Gratis* y creé tu código oficial exclusivo para tu comunidad:

🎟️ *TU CÓDIGO OFICIAL:* *${inf.code}*
🔗 *Link directo para tus seguidores:* ${url}/?ref=${inf.code}

🎁 *Beneficio para tu comunidad:* Al ingresar tu código *${inf.code}*, tus seguidores reciben *${inf.followerFreeDays} días de Plan Rider PRO Gratis* + *${inf.followerDiscountPercent}% de descuento*.
💰 *Tu comisión de socio (Revenue Share):* Te llevas el *${inf.commissionPercent}% recurrente* de cada suscripción generada con tu código, con reporte transparente en tiempo real.

¿Te animas a probar el Modo Retén y el Abogado Vial IA en tu moto esta semana?`;
}
