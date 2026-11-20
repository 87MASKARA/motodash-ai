import { supabase } from './supabaseClient';

const STORAGE_KEYS = {
  INFLUENCERS: 'motodash_founder_influencers_v1',
  GIFT_CODES: 'motodash_founder_gift_codes_v1',
  REDEMPTIONS: 'motodash_founder_redemptions_v1',
  MANUAL_GRANTS: 'motodash_founder_manual_grants_v1'
};

export const PLAN_PRICES_USD = {
  solo: { name: 'Rider Solo (1 Moto)', monthly: 1.99, annual: 14.99 },
  pro_monthly: { name: 'Rider PRO (3 Motos + OBD-II + IA)', monthly: 4.99, annual: 39.99 },
  garage: { name: 'Garaje / Taller (15 Motos)', monthly: 9.99, annual: 79.99 },
  b2b_mall: { name: 'Tienda Oficial MotoMall B2B', monthly: 14.99, annual: 149.0 }
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
    type: 'free_subscription', // 'free_subscription' | 'discount'
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

/**
 * Calcula las finanzas de un influencer específico y del sistema global
 */
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

export function computeGlobalFounderSummary(influencers = [], giftCodes = []) {
  let totalReferrals = 0;
  let totalPaidSubs = 0;
  let totalGrossUsd = 0;
  let totalInfluencerCommissionsUsd = 0;
  let totalFounderNetUsd = 0;
  let totalPendingPayoutUsd = 0;

  influencers.forEach((inf) => {
    const m = computeInfluencerMetrics(inf);
    totalReferrals += Number(inf.referralsCount) || 0;
    totalPaidSubs += Number(inf.paidConversions) || 0;
    totalGrossUsd += m.grossMonthlyUsd;
    totalInfluencerCommissionsUsd += m.influencerCutUsd;
    totalFounderNetUsd += m.founderNetUsd;
    totalPendingPayoutUsd += m.pendingPayoutUsd;
  });

  const totalGiftedSubscriptions = giftCodes.reduce((acc, g) => acc + (Number(g.usedCount) || 0), 0);

  return {
    totalInfluencers: influencers.length,
    activeInfluencers: influencers.filter((i) => i.status === 'active').length,
    totalReferrals,
    totalPaidSubs,
    totalGiftedSubscriptions,
    totalGrossUsd: Number(totalGrossUsd.toFixed(2)),
    totalInfluencerCommissionsUsd: Number(totalInfluencerCommissionsUsd.toFixed(2)),
    totalFounderNetUsd: Number(totalFounderNetUsd.toFixed(2)),
    totalPendingPayoutUsd: Number(totalPendingPayoutUsd.toFixed(2)),
    totalFounderNetCop: Math.round(totalFounderNetUsd * 4200)
  };
}

/**
 * Valida y canjea un código de Influencer o Código de Regalo VIP ingresado por un usuario en PaywallModal o ProfileModal
 */
export async function redeemPromoOrGiftCode(rawCode, userProfile = null) {
  const cleanCode = String(rawCode || '').trim().toUpperCase();
  if (!cleanCode) {
    return { success: false, error: 'Escribe un código válido.' };
  }

  const giftCodes = loadGiftCodes();
  const influencers = loadInfluencers();
  const redemptions = loadRedemptions();
  const userEmail = userProfile?.email || 'piloto.invitado@motodash.ai';

  // 1. Buscar primero en Códigos de Regalo Directo / Sorteos
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

  // 2. Buscar en Códigos de Influencers / Creadores de Contenido
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

/**
 * Genera el mensaje listo para enviar por WhatsApp o Instagram DM al Influencer con su propuesta y código
 */
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
