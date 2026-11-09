import React, { useState } from 'react';
import AppLogo from '../Common/AppLogo';
import LanguageSwitcher from '../Common/LanguageSwitcher';
import { 
  Sparkles, Crown, Gauge, ArrowRight, CheckCircle2, 
  FileText, Wrench, Play, LogIn, ShieldCheck, Radar, Scale
} from 'lucide-react';
import { BRAND_LOGOS, BrandLogo } from '../Common/BrandLogos';
import { MOTO_CATALOG } from '../../services/motoCatalog';
import { useLanguage } from '../../i18n/LanguageContext';

const QUICK_DEMO_BIKES = [
  { id: "bike_tvs_apache160", brand: "TVS", model: "APACHE 160", spec: "160cc • 10.0k RPM", color: "#DC2626" },
  { id: "bike_yamaha_mt09", brand: "YAMAHA", model: "MT-09 SP", spec: "890cc • 11.5k RPM", color: "#00D2D3" },
  { id: "bike_ktm_duke390", brand: "KTM", model: "390 DUKE", spec: "399cc • 10.5k RPM", color: "#FF6600" },
  { id: "bike_kawasaki_zx6r", brand: "KAWASAKI", model: "ZX-6R 636", spec: "636cc • 16.0k RPM", color: "#52C41A" },
  { id: "bike_ducati_panigale", brand: "DUCATI", model: "PANIGALE V4 S", spec: "1103cc • 15.5k RPM", color: "#DC2626" },
  { id: "bike_bmw_s1000rr", brand: "BMW", model: "S 1000 RR", spec: "999cc • 15.0k RPM", color: "#2563EB" }
];

export default function LandingPage({ onStartOnboarding, onEnterDemo, onOpenLogin }) {
  const { t } = useLanguage();
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'

  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-amber-500 selection:text-black font-sans relative overflow-x-hidden">
      
      {/* Luz Ambiental de Fondo Neón */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-amber-600/20 via-orange-600/10 to-transparent blur-[140px] pointer-events-none" />

      {/* 1. Header / Barra de Navegación Superior Responsiva para Móvil y Desktop */}
      <nav className="border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-xl sticky top-0 z-50 px-3 sm:px-8 py-2.5 sm:py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Logo Central de la App */}
          <AppLogo size="md" />

          {/* Botones de Acción + Selector Global de Idioma */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            <LanguageSwitcher compact />

            <button
              onClick={onOpenLogin}
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-racing font-bold text-neutral-300 hover:text-white bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 flex items-center gap-1.5 transition"
              title={t('nav.login')}
            >
              <LogIn className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">{t('nav.login')}</span>
            </button>

            <button
              onClick={() => onEnterDemo("bike_tvs_apache160")}
              className="flex px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-racing font-bold text-amber-400 hover:text-white bg-neutral-900 border border-amber-500/40 hover:border-amber-400 items-center gap-1 sm:gap-1.5 transition shadow-sm whitespace-nowrap"
            >
              <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 fill-amber-400/20" />
              <span className="sm:hidden">{t('nav.demoShort')}</span>
              <span className="hidden sm:inline">{t('nav.demoLive')}</span>
            </button>

            <button
              onClick={() => onStartOnboarding('pro_monthly')}
              className="hidden sm:flex px-3.5 sm:px-4 py-2 rounded-xl text-xs font-racing font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-black shadow-lg shadow-amber-500/20 items-center gap-1.5 transition active:scale-95 whitespace-nowrap"
            >
              <span>{t('nav.start')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section Principal */}
      <section className="pt-14 pb-16 px-4 sm:px-6 max-w-6xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300 mb-6 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{t('landing.badge')}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-racing uppercase tracking-tight text-white max-w-4xl mx-auto leading-[1.08]">
          {t('landing.heroTitle1')} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500">
            {t('landing.heroTitleHighlight')}
          </span>{' '}
          {t('landing.heroTitle2')}
        </h1>

        <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto mt-6 font-sans leading-relaxed">
          {t('landing.heroDesc')}
        </p>

        {/* Botones de Conversión Hero */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-8">
          <button
            onClick={() => onStartOnboarding('pro_monthly')}
            className="w-full sm:w-auto py-3.5 px-8 rounded-2xl font-black font-racing uppercase tracking-wider text-sm bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-black shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <span>{t('landing.ctaPrimary')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onEnterDemo("bike_tvs_apache160")}
            className="w-full sm:w-auto py-3.5 px-6 rounded-2xl font-bold font-racing uppercase tracking-wider text-sm bg-neutral-900 hover:bg-neutral-800 text-white border border-amber-500/40 hover:border-amber-400 shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Play className="w-4 h-4 text-amber-400 fill-amber-400/30" />
            <span>{t('landing.ctaDemo')}</span>
          </button>
        </div>

        {/* Selector Directo de Motos Demo en 1 Clic */}
        <div className="mt-10 max-w-4xl mx-auto p-4 sm:p-5 rounded-3xl bg-neutral-900/50 border border-neutral-800/90 backdrop-blur-md">
          <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-amber-400 uppercase tracking-widest mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{t('landing.demoStripTitle')}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {QUICK_DEMO_BIKES.map((bike) => (
              <button
                key={bike.id}
                type="button"
                onClick={() => onEnterDemo(bike.id)}
                className="group p-3 rounded-2xl bg-neutral-950/90 hover:bg-neutral-800/90 border border-neutral-800 hover:border-neutral-600 text-left transition-all hover:-translate-y-0.5 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <BrandLogo brand={bike.brand} accentColor={bike.color} className="w-6 h-6" />
                  <Play className="w-3 h-3 text-neutral-600 group-hover:text-amber-400 transition" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 block leading-none">{bike.brand}</span>
                  <span className="text-xs font-racing font-black text-white group-hover:text-amber-300 transition block mt-0.5 truncate">
                    {bike.model}
                  </span>
                  <span className="text-[9px] font-mono text-neutral-500 block mt-1">{bike.spec}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Píldoras de Confianza */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 mt-8 text-xs font-mono text-neutral-400">
          <span className="flex items-center gap-1.5 bg-neutral-900/80 border border-neutral-800 px-3 py-1.5 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> {t('landing.trust1')}
          </span>
          <span className="flex items-center gap-1.5 bg-neutral-900/80 border border-neutral-800 px-3 py-1.5 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> {t('landing.trust2')}
          </span>
          <span className="flex items-center gap-1.5 bg-neutral-900/80 border border-neutral-800 px-3 py-1.5 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> {t('landing.trust3')}
          </span>
          <span className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3 py-1.5 rounded-xl font-bold">
            <Radar className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" /> {t('landing.trust4')}
          </span>
          <span className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-300 px-3 py-1.5 rounded-xl font-bold">
            <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0" /> {t('landing.trust5')}
          </span>
        </div>
      </section>

      {/* 3. Franja de Marcas Mundiales con Logos Vectoriales */}
      <section className="py-8 border-y border-neutral-900 bg-neutral-950/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4">
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 text-center block mb-5">
            {t('landing.brandsBanner')}
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-9 gap-4 items-center justify-center opacity-80 hover:opacity-100 transition">
            {Object.keys(MOTO_CATALOG).map((brand) => {
              const LogoComp = BRAND_LOGOS[brand];
              return (
                <div key={brand} className="flex flex-col items-center gap-1">
                  {LogoComp && <LogoComp className="w-8 h-8 filter grayscale hover:grayscale-0 transition" />}
                  <span className="text-[10px] font-racing font-bold text-neutral-400">{brand}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Funcionalidades Principales */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-mono text-amber-500 font-bold uppercase tracking-widest block mb-2">
            {t('landing.featuresTag')}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black font-racing uppercase tracking-tight text-white">
            {t('landing.featuresTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Card 1: Tacómetro */}
          <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 relative overflow-hidden hover:border-neutral-700 transition">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/20">
              <Gauge className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-racing uppercase text-white mb-2">
              {t('landing.feat1Title')}
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              {t('landing.feat1Desc')}
            </p>
          </div>

          {/* Card 2: Hoja de Vida */}
          <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 relative overflow-hidden hover:border-neutral-700 transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-racing uppercase text-white mb-2">
              {t('landing.feat2Title')}
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              {t('landing.feat2Desc')}
            </p>
          </div>

          {/* Card 3: 17 Componentes */}
          <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 relative overflow-hidden hover:border-neutral-700 transition">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 border border-cyan-500/20">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-racing uppercase text-white mb-2">
              {t('landing.feat3Title')}
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              {t('landing.feat3Desc')}
            </p>
          </div>
        </div>

        {/* Fila 2 Destacada: Radar Legal & Guardián de Garantía */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 4: Radar de Fotomultas & SIMIT Global */}
          <div className="p-7 rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-amber-950/20 border-2 border-amber-500/40 hover:border-amber-500 transition shadow-xl relative overflow-hidden group">
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono font-bold text-amber-300">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>AHORRO 50% DESCUENTO</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/30">
              <Radar className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-racing uppercase text-white mb-2 flex items-center gap-2">
              <span>{t('landing.feat4Title')}</span>
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed font-sans mb-4">
              {t('landing.feat4Desc')}
            </p>
            <div className="flex flex-wrap gap-2 text-[10px] font-mono text-neutral-400">
              <span className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-amber-400">
                🇨🇴 SIMIT / FCFM
              </span>
              <span className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-amber-400">
                🇪🇸 DGT España
              </span>
              <span className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-amber-400">
                🇲🇽 CDMX / Gob
              </span>
              <span className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-amber-400">
                🇺🇸 DMV Violations
              </span>
              <span className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-emerald-400">
                ⚖️ Sentencias C-038 & C-321
              </span>
            </div>
          </div>

          {/* Card 5: Guardián de Garantía Oficial */}
          <div className="p-7 rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-blue-950/20 border-2 border-blue-500/40 hover:border-blue-500 transition shadow-xl relative overflow-hidden group">
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-[10px] font-mono font-bold text-blue-300">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>TOLERANCIA ESTRICTA +/- 100 KM</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4 border border-blue-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-racing uppercase text-white mb-2 flex items-center gap-2">
              <span>{t('landing.feat5Title')}</span>
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed font-sans mb-4">
              {t('landing.feat5Desc')}
            </p>
            <div className="flex flex-wrap gap-2 text-[10px] font-mono text-neutral-400">
              <span className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-blue-400">
                Auteco / Dismerca
              </span>
              <span className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-blue-400">
                Yamaha Incolmotos
              </span>
              <span className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-blue-400">
                Bajaj / UMA
              </span>
              <span className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-blue-400">
                Honda / Suzuki / KTM
              </span>
              <span className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-emerald-400">
                🛡️ Roadmap 8 Revisiones
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Planes de Suscripción (7 Días Gratis en Todos los Planes) */}
      <section className="py-16 px-4 bg-neutral-950 border-t border-neutral-900">
        <div className="max-w-5xl mx-auto text-center mb-10">
          <span className="text-xs font-mono text-amber-500 font-bold uppercase tracking-widest block mb-2">
            {t('landing.pricingTag')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black font-racing uppercase text-white">
            {t('landing.pricingTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-xl mx-auto">
            {t('landing.pricingSubtitle')}
          </p>

          {/* Selector Mensual / Anual (-35%) */}
          <div className="inline-flex bg-neutral-900 border border-neutral-800 p-1 rounded-2xl mt-6">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-xl text-xs font-racing font-bold uppercase transition ${
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
              className={`px-4 py-2 rounded-xl text-xs font-racing font-bold uppercase transition flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-amber-500 text-black shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>{t('landing.billingAnnual')}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Plan 1: Rider Solo (1 Moto) */}
          <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 flex flex-col justify-between transition">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-mono uppercase text-neutral-300 font-bold">
                  {t('landing.planBasicName')}
                </span>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-400 border border-emerald-700/40">
                  {t('landing.trialBadge')}
                </span>
              </div>

              <div className="text-3xl font-black font-telemetry mt-2 text-white">
                ${billingCycle === 'annual' ? '1.25' : '1.99'}{' '}
                <span className="text-xs text-neutral-500 font-normal">{t('landing.planMonth')}</span>
              </div>
              {billingCycle === 'annual' && (
                <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">
                  {t('landing.billedAnnually', { total: '14.99' })}
                </span>
              )}

              <p className="text-xs text-neutral-400 mt-2">{t('landing.planBasicDesc')}</p>
              <ul className="text-xs text-neutral-300 space-y-2.5 mt-5">
                <li>{t('landing.planBasicF1')}</li>
                <li>{t('landing.planBasicF2')}</li>
                <li>{t('landing.planBasicF3')}</li>
                <li>{t('landing.planBasicF4')}</li>
                <li className="text-amber-400 font-bold">{t('landing.planBasicF5')}</li>
                <li className="text-emerald-400 font-bold">{t('landing.planBasicF6')}</li>
              </ul>
            </div>
            <button
              onClick={() => onStartOnboarding('solo')}
              className="mt-6 w-full py-3 rounded-xl font-racing font-bold text-xs bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 transition"
            >
              {t('landing.planBasicBtn')}
            </button>
          </div>

          {/* Plan 2: Rider Pro (3 Motos - Más Popular) */}
          <div className="p-6 rounded-3xl bg-neutral-900 border-2 border-amber-500 shadow-2xl shadow-amber-950/40 flex flex-col justify-between relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full">
              {t('landing.planPopularBadge')}
            </div>
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-mono uppercase text-amber-400 font-bold flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" /> {t('landing.planProName')}
                </span>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {t('landing.trialBadge')}
                </span>
              </div>

              <div className="text-3xl font-black font-telemetry mt-2 text-amber-400">
                ${billingCycle === 'annual' ? '3.33' : '4.99'}{' '}
                <span className="text-xs text-neutral-400 font-normal">{t('landing.planMonth')}</span>
              </div>
              {billingCycle === 'annual' && (
                <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">
                  {t('landing.billedAnnually', { total: '39.99' })}
                </span>
              )}

              <p className="text-xs text-neutral-300 mt-2">{t('landing.planProDesc')}</p>
              <ul className="text-xs text-neutral-200 space-y-2.5 mt-5">
                <li>{t('landing.planProF1')}</li>
                <li>{t('landing.planProF2')}</li>
                <li>{t('landing.planProF3')}</li>
                <li>{t('landing.planProF4')}</li>
                <li>{t('landing.planProF5')}</li>
                <li className="text-amber-300 font-bold">{t('landing.planProF6')}</li>
                <li className="text-blue-300 font-bold">{t('landing.planProF7')}</li>
                <li className="text-cyan-300 font-bold">{t('landing.planProF8')}</li>
              </ul>
            </div>
            <button
              onClick={() => onStartOnboarding('pro_monthly')}
              className="mt-6 w-full py-3 rounded-xl font-racing font-bold text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/20 hover:opacity-90 transition"
            >
              {t('landing.planProBtn')}
            </button>
          </div>

          {/* Plan 3: Garaje / Taller Pro (15 Motos) */}
          <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 flex flex-col justify-between transition">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-mono uppercase text-cyan-400 font-bold">
                  {t('landing.planGarageName')}
                </span>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950/70 text-cyan-400 border border-cyan-700/40">
                  {t('landing.trialBadge')}
                </span>
              </div>

              <div className="text-3xl font-black font-telemetry mt-2 text-cyan-400">
                ${billingCycle === 'annual' ? '6.66' : '9.99'}{' '}
                <span className="text-xs text-neutral-500 font-normal">{t('landing.planMonth')}</span>
              </div>
              {billingCycle === 'annual' && (
                <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">
                  {t('landing.billedAnnually', { total: '79.99' })}
                </span>
              )}

              <p className="text-xs text-neutral-400 mt-2">{t('landing.planGarageDesc')}</p>
              <ul className="text-xs text-neutral-300 space-y-2.5 mt-5">
                <li>{t('landing.planGarageF1')}</li>
                <li>{t('landing.planGarageF2')}</li>
                <li>{t('landing.planGarageF3')}</li>
                <li>{t('landing.planGarageF4')}</li>
                <li className="text-cyan-300 font-bold">{t('landing.planGarageF5')}</li>
                <li className="text-cyan-300 font-bold">{t('landing.planGarageF6')}</li>
                <li className="text-amber-300 font-bold">{t('landing.planGarageF7')}</li>
              </ul>
            </div>
            <button
              onClick={() => onStartOnboarding('garage')}
              className="mt-6 w-full py-3 rounded-xl font-racing font-bold text-xs bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 transition"
            >
              {t('landing.planGarageBtn')}
            </button>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="border-t border-neutral-900 py-8 px-4 text-center text-xs text-neutral-500 font-mono">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AppLogo size="sm" showText={false} />
            <span>{t('landing.footerTagline')}</span>
          </div>
          <div>
            Yamaha • KTM • Kawasaki • Ducati • Honda • BMW • Suzuki • Bajaj • TVS
          </div>
        </div>
      </footer>
    </div>
  );
}
