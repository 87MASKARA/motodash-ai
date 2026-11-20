import React, { useState, useEffect } from 'react';
import {
  Crown,
  Users,
  Gift,
  TrendingUp,
  DollarSign,
  Copy,
  Check,
  Plus,
  Trash2,
  X,
  Sparkles,
  Share2,
  ShieldCheck,
  Award,
  PauseCircle,
  PlayCircle
} from 'lucide-react';
import {
  loadInfluencers,
  saveInfluencers,
  loadGiftCodes,
  saveGiftCodes,
  loadRedemptions,
  saveRedemptions,
  computeInfluencerMetrics,
  computeGlobalFounderSummary,
  buildInfluencerPitchMessage,
  PLAN_PRICES_USD
} from '../../services/founderAdminService';
import { isFounderVipEmail } from '../Auth/LoginModal';

const COUNTRY_OPTIONS = [
  { name: 'Colombia', flag: '🇨🇴' },
  { name: 'México', flag: '🇲🇽' },
  { name: 'España', flag: '🇪🇸' },
  { name: 'Brasil', flag: '🇧🇷' },
  { name: 'Estados Unidos', flag: '🇺🇸' },
  { name: 'Argentina', flag: '🇦🇷' },
  { name: 'Chile', flag: '🇨🇱' },
  { name: 'Perú', flag: '🇵🇪' },
  { name: 'Francia', flag: '🇫🇷' },
  { name: 'Italia', flag: '🇮🇹' },
  { name: 'Alemania', flag: '🇩🇪' }
];

export default function FounderAdminModal({ isOpen, onClose, userProfile }) {
  const [activeTab, setActiveTab] = useState('influencers'); // 'overview' | 'influencers' | 'gifts' | 'redemptions'
  const [influencers, setInfluencers] = useState([]);
  const [giftCodes, setGiftCodes] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [copiedId, setCopiedId] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Estado para crear nuevo Influencer
  const [newInf, setNewInf] = useState({
    name: '',
    handle: '',
    platform: 'YouTube / TikTok / IG',
    country: 'Colombia',
    code: '',
    commissionPercent: 30,
    followerDiscountPercent: 20,
    followerFreeDays: 30,
    notes: ''
  });

  // Estado para crear nuevo Código de Regalo / Suscripción Gratis
  const [newGift, setNewGift] = useState({
    code: '',
    planId: 'pro_monthly',
    durationDays: 30,
    maxUses: 1,
    assignedTo: ''
  });

  // Estado para regalar suscripción directa por correo
  const [directEmail, setDirectEmail] = useState('');
  const [directPlan, setDirectPlan] = useState('pro_monthly');
  const [directDays, setDirectDays] = useState(365);

  // Simulador Financiero de Escalabilidad
  const [simCreators, setSimCreators] = useState(10);
  const [simSubsPerCreator, setSimSubsPerCreator] = useState(40);
  const [simPlanId, setSimPlanId] = useState('pro_monthly');
  const [simCommissionPct, setSimCommissionPct] = useState(30);
  const [simFollowerDiscountPct, setSimFollowerDiscountPct] = useState(20);

  useEffect(() => {
    if (isOpen) {
      setInfluencers(loadInfluencers());
      setGiftCodes(loadGiftCodes());
      setRedemptions(loadRedemptions());
    }
  }, [isOpen]);

  const isVip = Boolean(
    userProfile?.plan === 'founder_vip' ||
    userProfile?.isLifetimeVip ||
    isFounderVipEmail(userProfile?.email)
  );

  if (!isOpen || !isVip) return null;

  const summary = computeGlobalFounderSummary(influencers, giftCodes);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  const handleCopyText = (text, idLabel) => {
    navigator.clipboard.writeText(text);
    setCopiedId(idLabel);
    showToast('✅ Copiado al portapapeles listo para pegar en WhatsApp o Instagram.');
    setTimeout(() => setCopiedId(''), 2500);
  };

  // Agregar nuevo Creador de Contenido
  const handleAddInfluencer = (e) => {
    e.preventDefault();
    if (!newInf.name.trim()) return;

    const cleanCode = (newInf.code.trim() || newInf.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) + 'PRO').toUpperCase();
    const countryObj = COUNTRY_OPTIONS.find((c) => c.name === newInf.country) || COUNTRY_OPTIONS[0];

    const created = {
      id: `inf_${Date.now()}`,
      name: newInf.name.trim(),
      handle: newInf.handle.trim() || `@${cleanCode.toLowerCase()}`,
      platform: newInf.platform,
      country: countryObj.name,
      flag: countryObj.flag,
      code: cleanCode,
      commissionPercent: Number(newInf.commissionPercent) || 30,
      followerDiscountPercent: Number(newInf.followerDiscountPercent) || 20,
      followerFreeDays: Number(newInf.followerFreeDays) || 30,
      giftedPlan: 'pro_monthly',
      status: 'active',
      referralsCount: 0,
      paidConversions: 0,
      avgPlanId: 'pro_monthly',
      paidOutUsd: 0,
      notes: newInf.notes.trim() || 'Embajador oficial MotoDash AI'
    };

    const next = [created, ...influencers];
    setInfluencers(next);
    saveInfluencers(next);
    setNewInf({
      name: '',
      handle: '',
      platform: 'YouTube / TikTok / IG',
      country: 'Colombia',
      code: '',
      commissionPercent: 30,
      followerDiscountPercent: 20,
      followerFreeDays: 30,
      notes: ''
    });
    showToast(`🎥 Creador "${created.name}" registrado con código ${created.code} (${created.commissionPercent}% comisión).`);
  };

  const handleUpdateInfluencerField = (id, field, value) => {
    const next = influencers.map((inf) => (inf.id === id ? { ...inf, [field]: value } : inf));
    setInfluencers(next);
    saveInfluencers(next);
  };

  const handleMarkCommissionPaid = (id) => {
    const next = influencers.map((inf) => {
      if (inf.id !== id) return inf;
      const m = computeInfluencerMetrics(inf);
      return { ...inf, paidOutUsd: m.influencerCutUsd };
    });
    setInfluencers(next);
    saveInfluencers(next);
    showToast('💵 Comisión marcada como liquidada y pagada al creador.');
  };

  const handleDeleteInfluencer = (id) => {
    const next = influencers.filter((i) => i.id !== id);
    setInfluencers(next);
    saveInfluencers(next);
  };

  // Crear nuevo Código de Regalo / Suscripción Gratis
  const handleCreateGiftCode = (e) => {
    e.preventDefault();
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const cleanCode = (newGift.code.trim() || `VIPMOTO${randomSuffix}`).toUpperCase().replace(/\s+/g, '');

    const created = {
      id: `gift_${Date.now()}`,
      code: cleanCode,
      type: 'free_subscription',
      planId: newGift.planId,
      durationDays: Number(newGift.durationDays) || 30,
      discountPercent: 100,
      maxUses: Math.max(1, Number(newGift.maxUses) || 1),
      usedCount: 0,
      assignedTo: newGift.assignedTo.trim() || 'Regalo Directo Fundador VIP',
      status: 'active',
      createdAt: new Date().toISOString().slice(0, 10)
    };

    const next = [created, ...giftCodes];
    setGiftCodes(next);
    saveGiftCodes(next);
    setNewGift({
      code: '',
      planId: 'pro_monthly',
      durationDays: 30,
      maxUses: 1,
      assignedTo: ''
    });
    showToast(`🎁 Código de regalo "${created.code}" creado (${created.durationDays} días gratis • ${created.maxUses} cupos).`);
  };

  const handleToggleGiftStatus = (id) => {
    const next = giftCodes.map((g) =>
      g.id === id ? { ...g, status: g.status === 'active' ? 'paused' : 'active' } : g
    );
    setGiftCodes(next);
    saveGiftCodes(next);
  };

  const handleDeleteGiftCode = (id) => {
    const next = giftCodes.filter((g) => g.id !== id);
    setGiftCodes(next);
    saveGiftCodes(next);
  };

  // Asignar suscripción directa por correo electrónico
  const handleDirectGrantByEmail = (e) => {
    e.preventDefault();
    if (!directEmail.trim()) return;
    const autoCode = `VIP-${directEmail.split('@')[0].toUpperCase().slice(0, 6)}-${Math.floor(10 + Math.random() * 89)}`;
    const planLabel = PLAN_PRICES_USD[directPlan]?.name || 'Rider PRO';

    const newGiftEntry = {
      id: `gift_${Date.now()}`,
      code: autoCode,
      type: 'free_subscription',
      planId: directPlan,
      durationDays: Number(directDays) || 365,
      discountPercent: 100,
      maxUses: 1,
      usedCount: 1,
      assignedTo: `Asignado directo a: ${directEmail.trim()}`,
      status: 'active',
      createdAt: new Date().toISOString().slice(0, 10)
    };

    const newRedemption = {
      id: `red_${Date.now()}`,
      code: autoCode,
      userEmail: directEmail.trim(),
      planId: directPlan,
      benefitLabel: `👑 Regalo Directo Fundador: ${planLabel} por ${directDays} días`,
      influencerName: 'Anderson (Fundador VIP)',
      redeemedAt: new Date().toLocaleString()
    };

    const nextGifts = [newGiftEntry, ...giftCodes];
    const nextReds = [newRedemption, ...redemptions];
    setGiftCodes(nextGifts);
    saveGiftCodes(nextGifts);
    setRedemptions(nextReds);
    saveRedemptions(nextReds);

    const inviteMsg = `¡Hola! 🏍️👑 Soy Anderson, fundador de *MotoDash AI*. Te acabo de activar una suscripción *${planLabel} 100% GRATIS por ${directDays} días* para tu cuenta (${directEmail.trim()}).\n\nTu código VIP personal es: *${autoCode}*\nSolo entra a MotoDash AI -> Planes / Perfil -> escribe *${autoCode}* en "Canjear Código VIP" y queda activado al instante.`;
    navigator.clipboard.writeText(inviteMsg);

    setDirectEmail('');
    showToast(`👑 Suscripción creada para ${directEmail} y mensaje con código ${autoCode} copiado a tu portapapeles.`);
  };

  // Cálculos del Simulador ROI en vivo
  const simPlanPrice = PLAN_PRICES_USD[simPlanId]?.monthly || 4.99;
  const simTotalSubs = simCreators * simSubsPerCreator;
  const simEffectivePrice = Number((simPlanPrice * (1 - simFollowerDiscountPct / 100)).toFixed(2));
  const simGrossMonthlyUsd = Number((simTotalSubs * simEffectivePrice).toFixed(2));
  const simInfluencerPayoutUsd = Number(((simGrossMonthlyUsd * simCommissionPct) / 100).toFixed(2));
  const simGatewayFeeUsd = Number((simGrossMonthlyUsd * 0.05 + simTotalSubs * 0.25).toFixed(2));
  const simFounderNetUsd = Number(Math.max(0, simGrossMonthlyUsd - simInfluencerPayoutUsd - simGatewayFeeUsd).toFixed(2));
  const simFounderNetCop = Math.round(simFounderNetUsd * 4200);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-neutral-900 border-2 border-amber-500/40 rounded-3xl max-w-5xl w-full p-5 sm:p-7 shadow-2xl relative text-white my-auto max-h-[94vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1.5 rounded-xl hover:bg-neutral-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado Exclusivo Fundador VIP */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-800 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center text-black shadow-lg shadow-amber-500/20">
              <Crown className="w-6 h-6 fill-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  ACCESO EXCLUSIVO ANDERSON • FUNDADOR VIP
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black font-racing uppercase tracking-wider text-white mt-0.5">
                Panel Maestro de Influencers, Códigos VIP & Suscripciones
              </h2>
            </div>
          </div>
        </div>

        {toastMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* KPIs Globales en Tiempo Real */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5 font-mono">
          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-amber-500/30">
            <span className="text-[10px] text-neutral-400 block">Creadores / Influencers</span>
            <span className="text-xl font-black text-amber-400">{summary.activeInfluencers} Activos</span>
            <span className="text-[10px] text-neutral-400 block">{summary.totalReferrals} pilotos referidos</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-cyan-500/30">
            <span className="text-[10px] text-neutral-400 block">Suscriptores Pagos + Regalos</span>
            <span className="text-xl font-black text-cyan-400">{summary.totalPaidSubs} Pagos</span>
            <span className="text-[10px] text-cyan-300 block">🎁 {summary.totalGiftedSubscriptions} becas/regalos VIP</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-rose-500/30">
            <span className="text-[10px] text-neutral-400 block">Comisiones Influencers</span>
            <span className="text-xl font-black text-rose-400">${summary.totalInfluencerCommissionsUsd} USD</span>
            <span className="text-[10px] text-neutral-400 block">Pendiente pagar: ${summary.totalPendingPayoutUsd} USD</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-neutral-950 border border-emerald-500/50">
            <span className="text-[10px] text-emerald-300 font-bold block">Tu Ganancia Neta Libre</span>
            <span className="text-xl font-black text-emerald-400">${summary.totalFounderNetUsd} USD/mes</span>
            <span className="text-[10px] text-emerald-300 block">≈ ${summary.totalFounderNetCop.toLocaleString('es-CO')} COP/mes</span>
          </div>
        </div>

        {/* Pestañas de Navegación del Dashboard Fundador */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-neutral-950 rounded-2xl border border-neutral-800 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('influencers')}
            className={`py-2.5 px-3 rounded-xl text-xs font-racing font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'influencers'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>1. Creadores & % Comisión</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gifts')}
            className={`py-2.5 px-3 rounded-xl text-xs font-racing font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'gifts'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>2. Regalar Suscripciones</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 px-3 rounded-xl text-xs font-racing font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'overview'
                ? 'bg-cyan-500 text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>3. Simulador Ganancias ROI</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('redemptions')}
            className={`py-2.5 px-3 rounded-xl text-xs font-racing font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'redemptions'
                ? 'bg-purple-500 text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>4. Canjes & Dar por Correo</span>
          </button>
        </div>

        {/* ======================================================================== */}
        {/* PESTAÑA 1: GESTIÓN DE CREADORES DE CONTENIDO, CÓDIGOS Y % DE COMISIÓN     */}
        {/* ======================================================================== */}
        {activeTab === 'influencers' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Formulario para agregar nuevo Creador / Influencer */}
            <form
              onSubmit={handleAddInfluencer}
              className="p-4 rounded-2xl bg-neutral-950 border border-amber-500/40 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-racing font-bold uppercase text-amber-400 flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  Registrar Nuevo Creador de Contenido / Embajador
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  Crea su código único, define qué % gana él y qué regalo da a sus seguidores
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-xs font-mono">
                <div className="sm:col-span-2">
                  <label className="text-[10px] text-neutral-400 block mb-1">Nombre del Creador / Canal *</label>
                  <input
                    type="text"
                    placeholder="Ej: Paisa Motos / Kaleth"
                    value={newInf.name}
                    onChange={(e) => setNewInf({ ...newInf, name: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">País</label>
                  <select
                    value={newInf.country}
                    onChange={(e) => setNewInf({ ...newInf, country: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-2.5 py-2 text-white"
                  >
                    {COUNTRY_OPTIONS.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-amber-300 font-bold block mb-1">Código Influencer *</label>
                  <input
                    type="text"
                    placeholder="Ej: PAISAMOTO"
                    value={newInf.code}
                    onChange={(e) => setNewInf({ ...newInf, code: e.target.value.toUpperCase() })}
                    className="w-full bg-neutral-900 border border-amber-500/60 rounded-xl px-3 py-2 text-amber-300 font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-emerald-300 font-bold block mb-1">% Comisión para Él</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="80"
                      value={newInf.commissionPercent}
                      onChange={(e) => setNewInf({ ...newInf, commissionPercent: Number(e.target.value) })}
                      className="w-full bg-neutral-900 border border-emerald-500/60 rounded-xl px-2.5 py-2 text-emerald-300 font-bold"
                    />
                    <span className="text-emerald-400 font-bold">%</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-cyan-300 font-bold block mb-1">Días PRO a Seguidor</label>
                  <select
                    value={newInf.followerFreeDays}
                    onChange={(e) => setNewInf({ ...newInf, followerFreeDays: Number(e.target.value) })}
                    className="w-full bg-neutral-900 border border-cyan-500/60 rounded-xl px-2 py-2 text-cyan-300 font-bold"
                  >
                    <option value={7}>7 Días Gratis</option>
                    <option value={15}>15 Días Gratis</option>
                    <option value={30}>30 Días (1 Mes)</option>
                    <option value={60}>60 Días (2 Meses)</option>
                    <option value={90}>90 Días (3 Meses)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-3 text-xs font-mono">
                  <label className="text-neutral-400">
                    % Descuento extra a sus seguidores:
                    <input
                      type="number"
                      min="0"
                      max="70"
                      value={newInf.followerDiscountPercent}
                      onChange={(e) => setNewInf({ ...newInf, followerDiscountPercent: Number(e.target.value) })}
                      className="ml-2 w-16 bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 text-white"
                    />
                    % OFF
                  </label>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-racing font-black text-xs uppercase shadow-md transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Creador y Código</span>
                </button>
              </div>
            </form>

            {/* Lista de Creadores con controles en vivo de % de comisión, conversiones y botón de mensaje WhatsApp */}
            <div className="space-y-3">
              {influencers.map((inf) => {
                const metrics = computeInfluencerMetrics(inf);
                return (
                  <div
                    key={inf.id}
                    className="p-4 rounded-2xl bg-neutral-950/90 border border-neutral-800 hover:border-amber-500/40 transition space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{inf.flag || '🏍️'}</span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-black font-racing uppercase text-white">{inf.name}</h4>
                            <span className="px-2.5 py-0.5 rounded-lg bg-amber-500 text-black font-mono font-black text-xs">
                              CÓDIGO: {inf.code}
                            </span>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                                inf.status === 'active'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-red-500/20 text-red-300 border border-red-500/40'
                              }`}
                            >
                              {inf.status === 'active' ? '● ACTIVO' : '● PAUSADO'}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-neutral-400">
                            {inf.country} &bull; {inf.platform} &bull; Regalo a sus seguidores:{' '}
                            <strong className="text-cyan-300">{inf.followerFreeDays} días PRO Gratis</strong> +{' '}
                            <strong className="text-amber-300">{inf.followerDiscountPercent}% OFF</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyText(buildInfluencerPitchMessage(inf), `pitch_${inf.id}`)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 text-[11px] font-mono font-bold flex items-center gap-1 transition"
                          title="Copiar propuesta lista con su código y % para enviársela por WhatsApp o Instagram"
                        >
                          {copiedId === `pitch_${inf.id}` ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                          <span>{copiedId === `pitch_${inf.id}` ? '¡Propuesta Copiada!' : '📲 Copiar Mensaje WhatsApp/DM'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateInfluencerField(
                              inf.id,
                              'status',
                              inf.status === 'active' ? 'paused' : 'active'
                            )
                          }
                          className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300"
                          title={inf.status === 'active' ? 'Pausar Código' : 'Activar Código'}
                        >
                          {inf.status === 'active' ? <PauseCircle className="w-4 h-4 text-amber-400" /> : <PlayCircle className="w-4 h-4 text-emerald-400" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteInfluencer(inf.id)}
                          className="p-1.5 rounded-xl bg-neutral-900 hover:bg-red-950/60 border border-neutral-800 text-red-400"
                          title="Eliminar creador"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Controles ajustables en vivo de Porcentaje de Comisión, Descuento y Métricas */}
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2 border-t border-neutral-800/80 font-mono text-xs">
                      <div className="bg-neutral-900 p-2.5 rounded-xl border border-emerald-500/40">
                        <span className="text-[10px] text-neutral-400 block">% Comisión de Él</span>
                        <div className="flex items-center gap-1 mt-1">
                          <input
                            type="number"
                            min="0"
                            max="80"
                            value={inf.commissionPercent}
                            onChange={(e) =>
                              handleUpdateInfluencerField(inf.id, 'commissionPercent', Number(e.target.value))
                            }
                            className="w-16 bg-neutral-950 border border-emerald-500/50 rounded-lg px-2 py-0.5 text-emerald-300 font-black"
                          />
                          <span className="text-emerald-400 font-bold">%</span>
                        </div>
                      </div>

                      <div className="bg-neutral-900 p-2.5 rounded-xl border border-cyan-500/30">
                        <span className="text-[10px] text-neutral-400 block">Días Gratis Seguidor</span>
                        <div className="flex items-center gap-1 mt-1">
                          <input
                            type="number"
                            min="0"
                            max="365"
                            value={inf.followerFreeDays}
                            onChange={(e) =>
                              handleUpdateInfluencerField(inf.id, 'followerFreeDays', Number(e.target.value))
                            }
                            className="w-16 bg-neutral-950 border border-cyan-500/40 rounded-lg px-2 py-0.5 text-cyan-300 font-black"
                          />
                          <span className="text-[10px] text-cyan-400">días</span>
                        </div>
                      </div>

                      <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-800">
                        <span className="text-[10px] text-neutral-400 block">Suscriptores Pagos</span>
                        <div className="flex items-center gap-1 mt-1">
                          <input
                            type="number"
                            min="0"
                            value={inf.paidConversions}
                            onChange={(e) =>
                              handleUpdateInfluencerField(inf.id, 'paidConversions', Number(e.target.value))
                            }
                            className="w-16 bg-neutral-950 border border-neutral-700 rounded-lg px-2 py-0.5 text-white font-black"
                          />
                          <span className="text-[10px] text-neutral-400">de {inf.referralsCount}</span>
                        </div>
                      </div>

                      <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-800">
                        <span className="text-[10px] text-neutral-400 block">Facturación Código</span>
                        <span className="text-sm font-black text-white block mt-1">
                          ${metrics.grossMonthlyUsd} USD
                        </span>
                        <span className="text-[9px] text-neutral-400">Precio efec: ${metrics.effectiveMonthlyPrice}</span>
                      </div>

                      <div className="bg-neutral-900 p-2.5 rounded-xl border border-rose-500/40">
                        <span className="text-[10px] text-neutral-400 block">Comisión de Él ({inf.commissionPercent}%)</span>
                        <span className="text-sm font-black text-rose-400 block mt-0.5">
                          ${metrics.influencerCutUsd} USD
                        </span>
                        {metrics.pendingPayoutUsd > 0 ? (
                          <button
                            type="button"
                            onClick={() => handleMarkCommissionPaid(inf.id)}
                            className="text-[9px] text-amber-300 underline hover:text-amber-200"
                          >
                            Marcar Pagado (${metrics.pendingPayoutUsd})
                          </button>
                        ) : (
                          <span className="text-[9px] text-emerald-400">✔ Liquidado al día</span>
                        )}
                      </div>

                      <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/40">
                        <span className="text-[10px] text-emerald-300 block">Tu Neto Fundador</span>
                        <span className="text-sm font-black text-emerald-400 block mt-1">
                          +${metrics.founderNetUsd} USD
                        </span>
                        <span className="text-[9px] text-emerald-300">Libre de comisión</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================================== */}
        {/* PESTAÑA 2: REGALAR SUSCRIPCIONES GRATIS & CÓDIGOS DE SORTEO              */}
        {/* ======================================================================== */}
        {activeTab === 'gifts' && (
          <div className="space-y-5 animate-fadeIn">
            <form
              onSubmit={handleCreateGiftCode}
              className="p-4 rounded-2xl bg-neutral-950 border border-emerald-500/40 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-racing font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                  <Gift className="w-4 h-4" />
                  Crear Código de Suscripción 100% Gratis (Para Regalar a Creadores, Amigos o Sorteos)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs font-mono">
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Código a Regalar</label>
                  <input
                    type="text"
                    placeholder="Ej: REGALOPRO"
                    value={newGift.code}
                    onChange={(e) => setNewGift({ ...newGift, code: e.target.value.toUpperCase() })}
                    className="w-full bg-neutral-900 border border-emerald-500/50 rounded-xl px-3 py-2 text-emerald-300 font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Plan que Desbloquea</label>
                  <select
                    value={newGift.planId}
                    onChange={(e) => setNewGift({ ...newGift, planId: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-2.5 py-2 text-white"
                  >
                    <option value="pro_monthly">🔥 Rider PRO (3 Motos + OBD-II + IA)</option>
                    <option value="garage">🏭 Garaje / Taller (15 Motos)</option>
                    <option value="solo">🏍️ Rider Solo (1 Moto)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Tiempo Gratis</label>
                  <select
                    value={newGift.durationDays}
                    onChange={(e) => setNewGift({ ...newGift, durationDays: Number(e.target.value) })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-2.5 py-2 text-amber-300 font-bold"
                  >
                    <option value={7}>7 Días Gratis</option>
                    <option value={30}>1 Mes Gratis (30 Días)</option>
                    <option value={90}>3 Meses Gratis (90 Días)</option>
                    <option value={180}>6 Meses Gratis (180 Días)</option>
                    <option value={365}>1 Año Completo Gratis (365 Días)</option>
                    <option value={3650}>👑 Vitalicio (10 Años Gratis)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Cantidad de Cupos</label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={newGift.maxUses}
                    onChange={(e) => setNewGift({ ...newGift, maxUses: Number(e.target.value) })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">¿Para quién es?</label>
                  <input
                    type="text"
                    placeholder="Ej: Sorteo TikTok / Creador"
                    value={newGift.assignedTo}
                    onChange={(e) => setNewGift({ ...newGift, assignedTo: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-racing font-black text-xs uppercase shadow-md transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generar Código de Suscripción Gratis</span>
                </button>
              </div>
            </form>

            {/* Tarjetas de Códigos de Regalo Creados */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {giftCodes.map((g) => {
                const planTitle = PLAN_PRICES_USD[g.planId]?.name || 'Rider PRO';
                const inviteText = `🎁 ¡Tienes un regalo VIP en *MotoDash AI*!\n\nUsa el código: *${g.code}*\nDesbloquea: *${planTitle} 100% GRATIS por ${g.durationDays} días*.\n\nSolo entra a MotoDash AI -> Planes -> escribe *${g.code}* en la casilla "Canjear Código VIP" y disfrútalo.`;
                return (
                  <div
                    key={g.id}
                    className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-mono font-black text-sm">
                          🎁 {g.code}
                        </span>
                        <span className="text-xs font-mono text-amber-300 font-bold">
                          {g.durationDays >= 3650 ? '👑 VITALICIO' : `${g.durationDays} Días Gratis`}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white mt-2">{planTitle}</p>
                      <p className="text-[11px] font-mono text-neutral-400 mt-0.5">{g.assignedTo}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-neutral-400">
                          Cupos canjeados: <strong className="text-white">{g.usedCount} / {g.maxUses}</strong>
                        </span>
                        <span className={g.status === 'active' ? 'text-emerald-400 font-bold' : 'text-red-400'}>
                          {g.status === 'active' ? '● Activo' : '● Pausado'}
                        </span>
                      </div>

                      <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-400"
                          style={{ width: `${Math.min(100, Math.round((g.usedCount / Math.max(1, g.maxUses)) * 100))}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleCopyText(inviteText, `gift_${g.id}`)}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono font-bold flex items-center justify-center gap-1"
                        >
                          {copiedId === `gift_${g.id}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedId === `gift_${g.id}` ? '¡Copiado!' : 'Copiar Regalo para WhatsApp'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleGiftStatus(g.id)}
                          className="p-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-300"
                        >
                          {g.status === 'active' ? <PauseCircle className="w-4 h-4 text-amber-400" /> : <PlayCircle className="w-4 h-4 text-emerald-400" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteGiftCode(g.id)}
                          className="p-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================================== */}
        {/* PESTAÑA 3: SIMULADOR FINANCIERO DE ESCALABILIDAD CON INFLUENCERS (ROI)   */}
        {/* ======================================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-4 animate-fadeIn font-mono">
            <div className="p-5 rounded-2xl bg-neutral-950 border border-cyan-500/40 space-y-4">
              <div>
                <span className="text-[10px] uppercase text-cyan-400 font-bold block">
                  CALCULADORA DE ESCALABILIDAD FINANCIERA (REVENUE SHARE)
                </span>
                <h3 className="text-sm sm:text-base font-black font-racing uppercase text-white">
                  Simula cuánto ganas tú y cuánto ganan los creadores según sus porcentajes
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                  <label className="text-[10px] text-neutral-400 block mb-1">1. Creadores Activos</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={simCreators}
                    onChange={(e) => setSimCreators(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full bg-neutral-950 border border-cyan-500/50 rounded-lg px-2.5 py-1.5 text-base font-black text-cyan-300"
                  />
                </div>

                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                  <label className="text-[10px] text-neutral-400 block mb-1">2. Suscriptores por Creador</label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={simSubsPerCreator}
                    onChange={(e) => setSimSubsPerCreator(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full bg-neutral-950 border border-cyan-500/50 rounded-lg px-2.5 py-1.5 text-base font-black text-white"
                  />
                </div>

                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                  <label className="text-[10px] text-neutral-400 block mb-1">3. Plan Promedio</label>
                  <select
                    value={simPlanId}
                    onChange={(e) => setSimPlanId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2 py-2 text-amber-300 font-bold"
                  >
                    <option value="solo">Solo ($1.99 USD)</option>
                    <option value="pro_monthly">Rider PRO ($4.99 USD)</option>
                    <option value="garage">Garaje ($9.99 USD)</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                  <label className="text-[10px] text-neutral-400 block mb-1">4. % Comisión al Creador</label>
                  <input
                    type="number"
                    min="0"
                    max="80"
                    value={simCommissionPct}
                    onChange={(e) => setSimCommissionPct(Math.min(80, Math.max(0, Number(e.target.value) || 0)))}
                    className="w-full bg-neutral-950 border border-rose-500/50 rounded-lg px-2.5 py-1.5 text-base font-black text-rose-300"
                  />
                </div>

                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                  <label className="text-[10px] text-neutral-400 block mb-1">5. % Descuento al Seguidor</label>
                  <input
                    type="number"
                    min="0"
                    max="70"
                    value={simFollowerDiscountPct}
                    onChange={(e) => setSimFollowerDiscountPct(Math.min(70, Math.max(0, Number(e.target.value) || 0)))}
                    className="w-full bg-neutral-950 border border-amber-500/50 rounded-lg px-2.5 py-1.5 text-base font-black text-amber-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block">Total Suscriptores Activos</span>
                  <span className="text-2xl font-black text-white">{simTotalSubs.toLocaleString()}</span>
                  <span className="text-[10px] text-neutral-400 block">Pagando ${simEffectivePrice} USD/mes</span>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block">Facturación Bruta Mensual</span>
                  <span className="text-2xl font-black text-amber-400">${simGrossMonthlyUsd.toLocaleString()} USD</span>
                  <span className="text-[10px] text-neutral-400 block">Pasarela (~5%): -${simGatewayFeeUsd} USD</span>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-900 border border-rose-500/40">
                  <span className="text-[10px] text-rose-300 block">Pago Total a los {simCreators} Creadores</span>
                  <span className="text-2xl font-black text-rose-400">${simInfluencerPayoutUsd.toLocaleString()} USD</span>
                  <span className="text-[10px] text-neutral-400 block">
                    Cada creador gana: ${(simInfluencerPayoutUsd / Math.max(1, simCreators)).toFixed(1)} USD/mes
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-950/60 border-2 border-emerald-500/60">
                  <span className="text-[10px] text-emerald-300 font-bold block">TU GANANCIA NETA LIBRE</span>
                  <span className="text-2xl font-black text-emerald-400">${simFounderNetUsd.toLocaleString()} USD/mes</span>
                  <span className="text-[11px] text-emerald-200 font-bold block">
                    ≈ ${simFounderNetCop.toLocaleString('es-CO')} COP / mes
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================== */}
        {/* PESTAÑA 4: HISTORIAL DE CANJES & ACTIVACIÓN DIRECTA POR CORREO           */}
        {/* ======================================================================== */}
        {activeTab === 'redemptions' && (
          <div className="space-y-4 animate-fadeIn">
            <form
              onSubmit={handleDirectGrantByEmail}
              className="p-4 rounded-2xl bg-neutral-950 border border-purple-500/40 space-y-3"
            >
              <span className="text-xs font-racing font-bold uppercase text-purple-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                Otorgar Suscripción Gratis Directamente por Correo Electrónico
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                <div className="sm:col-span-2">
                  <input
                    type="email"
                    placeholder="correo.del.creador@gmail.com"
                    value={directEmail}
                    onChange={(e) => setDirectEmail(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <select
                    value={directPlan}
                    onChange={(e) => setDirectPlan(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-2.5 py-2 text-white"
                  >
                    <option value="pro_monthly">Plan Rider PRO</option>
                    <option value="garage">Plan Garaje (15 Motos)</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <select
                    value={directDays}
                    onChange={(e) => setDirectDays(Number(e.target.value))}
                    className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-2 py-2 text-amber-300 font-bold"
                  >
                    <option value={30}>30 Días</option>
                    <option value={90}>90 Días</option>
                    <option value={365}>1 Año</option>
                    <option value={3650}>Vitalicio</option>
                  </select>
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-black font-racing font-black text-xs uppercase"
                  >
                    Activar
                  </button>
                </div>
              </div>
            </form>

            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5 font-mono text-xs">
              <h4 className="text-xs font-racing uppercase text-neutral-300">
                Bitácora de Códigos Canjeados y Suscripciones Activadas ({redemptions.length})
              </h4>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {redemptions.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-wrap items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[11px]">
                          {r.code}
                        </span>
                        <strong className="text-white">{r.userEmail}</strong>
                      </div>
                      <span className="text-[11px] text-emerald-400 block mt-0.5">{r.benefitLabel}</span>
                    </div>
                    <div className="text-right text-[10px] text-neutral-400">
                      <span className="block text-neutral-300">Ref: {r.influencerName}</span>
                      <span>{r.redeemedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
