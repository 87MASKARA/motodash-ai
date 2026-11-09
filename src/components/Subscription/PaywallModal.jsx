import React, { useState } from 'react';
import { Crown, Check, X, Shield, ArrowRight, Globe, Smartphone } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

const PLANS = [
  {
    id: 'solo',
    nameKey: 'landing.planBasicName',
    monthly: '1.99',
    annualMonthly: '1.25',
    annualTotal: '14.99',
    features: ['landing.planBasicF1', 'landing.planBasicF2', 'landing.planBasicF3', 'landing.planBasicF4']
  },
  {
    id: 'pro_monthly',
    nameKey: 'landing.planProName',
    popular: true,
    monthly: '4.99',
    annualMonthly: '3.33',
    annualTotal: '39.99',
    features: [
      'landing.planProF1',
      'landing.planProF2',
      'landing.planProF3',
      'landing.planProF4',
      'landing.planProF5'
    ]
  },
  {
    id: 'garage',
    nameKey: 'landing.planGarageName',
    monthly: '9.99',
    annualMonthly: '6.66',
    annualTotal: '79.99',
    features: [
      'landing.planGarageF1',
      'landing.planGarageF2',
      'landing.planGarageF3',
      'landing.planGarageF4'
    ]
  }
];

export default function PaywallModal({ onClose, onUpgradeSuccess, initialPlan = 'pro_monthly' }) {
  const { t } = useLanguage();
  const [selectedPlanId, setSelectedPlanId] = useState(
    ['solo', 'pro_monthly', 'garage'].includes(initialPlan) ? initialPlan : 'pro_monthly'
  );
  const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' | 'annual'

  const activePlan = PLANS.find((p) => p.id === selectedPlanId) || PLANS[1];

  const handleGlobalCheckout = () => {
    const urls = {
      solo: import.meta.env.VITE_LEMONSQUEEZY_SOLO_URL,
      pro_monthly: import.meta.env.VITE_LEMONSQUEEZY_PRO_URL,
      garage: import.meta.env.VITE_LEMONSQUEEZY_GARAGE_URL
    };
    const targetUrl = urls[selectedPlanId];
    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert(
        `✅ Prueba de 7 días activada para ${t(activePlan.nameKey)} ($${
          billingCycle === 'annual' ? activePlan.annualMonthly : activePlan.monthly
        } USD/mes).\n\n(Configura VITE_LEMONSQUEEZY_*_URL en .env.local cuando crees tu cuenta en Lemon Squeezy).`
      );
    }
    if (onUpgradeSuccess) onUpgradeSuccess(selectedPlanId);
  };

  const handleColombiaCheckout = () => {
    const wompiUrl = import.meta.env.VITE_WOMPI_CHECKOUT_URL;
    if (wompiUrl) {
      window.open(wompiUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert(
        `🇨🇴 Redirigiendo a pasarela Colombia (Nequi / PSE / Bancolombia) para ${t(activePlan.nameKey)}.\n\n(Configura VITE_WOMPI_CHECKOUT_URL en .env.local cuando actives tu link de Wompi o Mercado Pago).`
      );
    }
    if (onUpgradeSuccess) onUpgradeSuccess(selectedPlanId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative text-white my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white text-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <img
            src="/logo-emblem.png"
            alt="MotoDash AI"
            className="h-12 w-auto object-contain mx-auto mb-2.5 drop-shadow-[0_0_16px_rgba(245,158,11,0.4)]"
          />
          <span className="inline-block text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-700/50 mb-2">
            {t('landing.trialBadge')}
          </span>
          <h2 className="text-xl sm:text-2xl font-black font-racing uppercase tracking-wider">
            {t('paywall.title')}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">{t('paywall.subtitle')}</p>
        </div>

        {/* Selector Mensual / Anual (-35%) */}
        <div className="flex bg-neutral-950 p-1 rounded-2xl mb-4 border border-neutral-800">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`flex-1 py-2 text-xs font-bold font-racing uppercase rounded-xl transition ${
              billingCycle === 'monthly'
                ? 'bg-neutral-800 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t('landing.billingMonthly')}
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('annual')}
            className={`flex-1 py-2 text-xs font-bold font-racing uppercase rounded-xl transition flex items-center justify-center gap-1.5 ${
              billingCycle === 'annual'
                ? 'bg-amber-500 text-black shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>{t('landing.billingAnnual')}</span>
          </button>
        </div>

        {/* Selector de los 3 Planes */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {PLANS.map((plan) => {
            const isSelected = plan.id === selectedPlanId;
            const displayPrice = billingCycle === 'annual' ? plan.annualMonthly : plan.monthly;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlanId(plan.id)}
                className={`p-3 rounded-2xl border text-left transition relative ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 ring-1 ring-amber-500/60 shadow-lg'
                    : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-2 right-2 bg-amber-500 text-black text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full">
                    TOP
                  </span>
                )}
                <div className="text-[10px] font-racing font-bold uppercase text-neutral-300 truncate">
                  {t(plan.nameKey)}
                </div>
                <div className="text-lg font-black font-telemetry text-amber-400 mt-1">
                  ${displayPrice}
                  <span className="text-[9px] text-neutral-400 font-normal">/mo</span>
                </div>
                <div className="text-[9px] font-mono text-emerald-400 mt-0.5">7d Free</div>
              </button>
            );
          })}
        </div>

        {/* Beneficios del Plan Seleccionado */}
        <div className="p-4 rounded-2xl bg-neutral-950/90 border border-neutral-800 space-y-2 mb-5">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-2">
            <span className="text-xs font-racing font-bold uppercase text-amber-400 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5" />
              {t(activePlan.nameKey)}
            </span>
            <span className="text-xs font-mono text-neutral-300 font-bold">
              ${billingCycle === 'annual' ? activePlan.annualMonthly : activePlan.monthly}{' '}
              {t('landing.planMonth')}
            </span>
          </div>
          {activePlan.features.map((featKey) => (
            <div key={featKey} className="flex items-center gap-2 text-xs text-neutral-200">
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span>{t(featKey).replace(/^✓\s*/, '')}</span>
            </div>
          ))}
        </div>

        {/* Botones de Pasarela Global (Lemon Squeezy) & Colombia (Wompi / Nequi / PSE) */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleGlobalCheckout}
            className="w-full py-3.5 px-4 rounded-2xl font-bold font-racing uppercase tracking-wider text-xs sm:text-sm bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-black shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <Globe className="w-4 h-4" />
            <span>{t('paywall.globalBtn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleColombiaCheckout}
            className="w-full py-3 px-4 rounded-2xl font-bold font-racing uppercase tracking-wider text-xs bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-emerald-500/30 transition flex items-center justify-center gap-2"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>{t('paywall.colombiaBtn')}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-2.5 py-2 px-4 rounded-xl font-mono text-xs text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition text-center"
        >
          {t('paywall.continueTrialBtn')}
        </button>

        <p className="text-[10px] text-neutral-500 text-center mt-3 flex items-center justify-center gap-1">
          <Shield className="w-3 h-3 text-neutral-400 flex-shrink-0" />
          <span>{t('paywall.secureNote')}</span>
        </p>
      </div>
    </div>
  );
}
