import React, { useState } from 'react';
import AppLogo from '../Common/AppLogo';
import LanguageSwitcher from '../Common/LanguageSwitcher';
import { 
  Sparkles, Crown, Gauge, ArrowRight, CheckCircle2, 
  FileText, Wrench, Play, LogIn, ShieldCheck, Radar, Scale,
  Bluetooth, HeartPulse, Users, Lock, Zap, Film, Store, Building2
} from 'lucide-react';
import { BRAND_LOGOS, BrandLogo } from '../Common/BrandLogos';
import { MOTO_CATALOG } from '../../services/motoCatalog';
import { useLanguage } from '../../i18n/LanguageContext';

const QUICK_DEMO_BIKES = [
  { id: "bike_tvs_apache160", brand: "TVS", model: "APACHE 160 4V TFT", spec: "160cc • SmartXonnect", color: "#DC2626" },
  { id: "bike_yamaha_mt09", brand: "YAMAHA", model: "MT-09 SP", spec: "890cc • 11.5k RPM", color: "#00D2D3" },
  { id: "bike_ktm_duke390", brand: "KTM", model: "390 DUKE", spec: "399cc • 10.5k RPM", color: "#FF6600" },
  { id: "bike_kawasaki_zx6r", brand: "KAWASAKI", model: "ZX-6R 636", spec: "636cc • 16.0k RPM", color: "#52C41A" },
  { id: "bike_ducati_panigale", brand: "DUCATI", model: "PANIGALE V4 S", spec: "1103cc • 15.5k RPM", color: "#DC2626" },
  { id: "bike_bmw_s1000rr", brand: "BMW", model: "S 1000 RR", spec: "999cc • 15.0k RPM", color: "#2563EB" }
];

export default function LandingPage({ onStartOnboarding, onEnterDemo, onOpenLogin, onReplayIntro, onOpenLegal, onOpenMotoMall }) {
  const { t, language } = useLanguage();
  const isEn = language === 'en';
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'

  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-amber-500 selection:text-black font-sans relative overflow-x-hidden">
      
      {/* Luz Ambiental de Fondo Neón */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[680px] h-[380px] bg-gradient-to-b from-amber-600/20 via-orange-600/10 to-transparent blur-[140px] pointer-events-none" />

      {/* 1. Header / Barra de Navegación Superior Responsiva para Móvil y Desktop */}
      <nav className="border-b border-neutral-800/80 bg-neutral-950/85 backdrop-blur-xl sticky top-0 z-50 px-3 sm:px-8 py-2.5 sm:py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Logo Central de la App */}
          <AppLogo size="md" />

          {/* Botones de Acción + Selector Global de Idioma */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            <LanguageSwitcher compact />

            {onReplayIntro && (
              <button
                type="button"
                onClick={onReplayIntro}
                className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-racing font-bold text-amber-300 hover:text-white bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/40 flex items-center gap-1.5 transition"
                title={isEn ? 'Replay 10s Intro Video' : 'Repetir Video Intro de 10s'}
              >
                <Film className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden lg:inline">{isEn ? 'Intro Video' : 'Video Intro'}</span>
              </button>
            )}

            {onOpenMotoMall && (
              <button
                type="button"
                onClick={() => onOpenMotoMall('home')}
                className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-racing font-bold text-emerald-300 hover:text-white bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 flex items-center gap-1.5 transition"
                title="Abrir MotoMall Oficial (Inicio, Suscripciones B2B, Repuestos y Concesionarios)"
              >
                <Store className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">MotoMall</span>
              </button>
            )}

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

      {/* 2. Hero Section Principal con Showcase de Video & Nuevos Módulos */}
      <section className="pt-10 sm:pt-14 pb-16 px-4 sm:px-6 max-w-6xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-amber-500/40 text-xs font-mono text-amber-300 mb-6 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {isEn
              ? 'NEW V2.5 PRO • TFT 12-PARAM SYNC • AI TRAFFIC LAWYER • DOCTOR MOTOR AI • BIKER CLANS'
              : 'NUEVO V2.5 PRO • ENLACE TFT 12 PARÁMETROS • ABOGADO VIAL IA • DOCTOR MOTOR IA • CLANES MOTEROS'}
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-racing uppercase tracking-tight text-white max-w-4xl mx-auto leading-[1.06]">
          {t('landing.heroTitle1')} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500">
            {t('landing.heroTitleHighlight')}
          </span>{' '}
          {t('landing.heroTitle2')}
        </h1>

        <p className="text-sm sm:text-base text-neutral-300 max-w-3xl mx-auto mt-5 font-sans leading-relaxed">
          {isEn
            ? 'Link your Apache TFT cluster or OBD-II cable to update Odometer, Fuel, and Battery Health in Predictive Maintenance. Defend yourself at checkpoints with the 2-sided PIN-locked Digital Glovebox and AI Traffic Lawyer, diagnose mechanical noises with Doctor Motor AI, and ride with Private Biker Clans.'
            : 'Enlaza el tablero TFT de tu moto o cable OBD-II para actualizar Kilometraje, Gasolina y Salud de Batería en el Mantenimiento Predictivo. Defiéndete en retenes con la Guantera Digital de 2 lados con bloqueo PIN y el Abogado Vial IA, diagnostica fallas con Doctor Motor IA y crea tu Clan Motero con logo propio.'}
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

          {onReplayIntro && (
            <button
              type="button"
              onClick={onReplayIntro}
              className="w-full sm:w-auto py-3.5 px-5 rounded-2xl font-bold font-racing uppercase tracking-wider text-sm bg-neutral-950 hover:bg-neutral-900 text-amber-300 border border-neutral-800 hover:border-amber-500/50 flex items-center justify-center gap-2 transition"
            >
              <Film className="w-4 h-4 text-amber-400" />
              <span>{isEn ? 'Watch 10s Intro' : 'Ver Intro (10s)'}</span>
            </button>
          )}
        </div>

        {/* Banner Cinematográfico en Vivo del Video Oficial en el Inicio */}
        <div className="mt-10 max-w-4xl mx-auto rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-2xl shadow-amber-500/15 relative group bg-black aspect-video">
          <video
            src="/motodash-intro.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-contain sm:object-cover group-hover:scale-[1.01] transition-transform duration-700"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end justify-between p-4 sm:p-6 text-left">
            <h2 className="text-xl sm:text-3xl font-black font-racing uppercase tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
              MOTO<span className="text-amber-400">DASH</span> AI
            </h2>
            {onReplayIntro && (
              <button
                type="button"
                onClick={onReplayIntro}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-racing font-black uppercase text-[11px] sm:text-xs flex items-center gap-1.5 transition shadow-lg"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>{isEn ? 'Play with Sound (10s)' : 'Ver con Sonido (10s)'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Selector Directo de Motos Demo en 1 Clic */}
        <div className="mt-8 max-w-4xl mx-auto p-4 sm:p-5 rounded-3xl bg-neutral-900/50 border border-neutral-800/90 backdrop-blur-md">
          <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-amber-400 uppercase tracking-widest mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{t('landing.demoStripTitle')}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {QUICK_DEMO_BIKES.map((bike) => (
              <button
                key={bike.id}
                type="button"
                onClick={() => onEnterDemo(bike.id)}
                className="group p-3 rounded-2xl bg-neutral-950/90 hover:bg-neutral-800/90 border border-neutral-800 hover:border-amber-500/50 text-left transition-all hover:-translate-y-0.5 flex flex-col justify-between"
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

        {/* Píldoras de Confianza Actualizadas con todas las Novedades */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-8 text-xs font-mono text-neutral-300">
          <span className="flex items-center gap-1.5 bg-cyan-950/50 border border-cyan-500/40 text-cyan-300 px-3 py-1.5 rounded-xl font-bold">
            <Bluetooth className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            {isEn ? 'TFT 12-Param Sync + Battery Health' : 'Enlace TFT 12 Parámetros + Batería en Vivo'}
          </span>
          <span className="flex items-center gap-1.5 bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-xl font-bold">
            <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            {isEn ? '2-Sided Docs + Police PIN Lock' : 'Modo Retén (2 Lados) + Bloqueo PIN'}
          </span>
          <span className="flex items-center gap-1.5 bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 px-3 py-1.5 rounded-xl font-bold">
            <Scale className="w-4 h-4 text-amber-400 flex-shrink-0" />
            {isEn ? 'Multi-Country AI Traffic Lawyer' : 'Abogado Vial IA Multipaís'}
          </span>
          <span className="flex items-center gap-1.5 bg-teal-950/60 border border-teal-500/40 text-teal-300 px-3 py-1.5 rounded-xl font-bold">
            <Wrench className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            {isEn ? 'Doctor Motor AI + Fair Repair Price' : 'Doctor Motor IA + Precio Justo Taller'}
          </span>
          <span className="flex items-center gap-1.5 bg-red-950/60 border border-red-500/40 text-red-300 px-3 py-1.5 rounded-xl font-bold">
            <HeartPulse className="w-4 h-4 text-red-400 flex-shrink-0 animate-pulse" />
            {isEn ? '24/7 Paramedic SOS & Live GPS Tow' : 'SOS Paramédicos 24/7 y Grúa GPS'}
          </span>
          <span className="flex items-center gap-1.5 bg-amber-950/60 border border-amber-500/40 text-amber-300 px-3 py-1.5 rounded-xl font-bold">
            <Users className="w-4 h-4 text-amber-400 flex-shrink-0" />
            {isEn ? 'Private Biker Clans with Custom Logos' : 'Clanes Moteros con Logo Propio'}
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

      {/* 4. Ecosistema Completo: Todas las Nuevas Funcionalidades */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-mono text-amber-500 font-bold uppercase tracking-widest block mb-2">
            {isEn ? 'COMPLETE BIKER ECOSYSTEM V2.5' : 'ECOSISTEMA MOTERO COMPLETO V2.5'}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black font-racing uppercase tracking-tight text-white">
            {isEn
              ? 'EVERYTHING WE BUILT FOR YOUR MOTORCYCLE'
              : 'TODO LO QUE TU MOTO NECESITA EN UN SOLO COCKPIT'}
          </h2>
        </div>

        {/* Fila 1: Las 3 Joyas Nuevas (TFT 12 Parámetros + Batería, Guantera Modo Retén 2 Lados + PIN, Abogado Vial IA) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Card Nueva 1: Enlace TFT SmartXonnect & Cable OBD-II + Batería en Mantenimiento Predictivo */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900/95 to-cyan-950/30 border-2 border-cyan-500/40 hover:border-cyan-400 transition relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <Bluetooth className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-300">
                12 PARÁMETROS + BATERÍA
              </span>
            </div>
            <h3 className="text-lg font-bold font-racing uppercase text-white mb-2">
              {isEn
                ? 'TFT Cluster & OBD-II Sync + Predictive Battery'
                : 'Enlace Tablero TFT & Cable OBD-II + Batería Predictiva'}
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed font-sans mb-3">
              {isEn
                ? 'Link your Apache SmartXonnect TFT or OBD-II scanner. With one tap on "Update Parameters", sync Odometer, Fuel %, Range, Ride Mode, Lean Angle, Top Speed, and live Battery Voltage (V) & Health (%) directly into Predictive Maintenance.'
                : 'Enlaza el tablero TFT de tu Apache o cable OBD-II. Con el botón «⚡ Actualizar Parámetros» sincronizas Odómetro, % de Gasolina, Autonomía, Modo Sport/Urban/Rain, Inclinación y el Voltaje (V) + Salud (%) de la Batería directamente en el Mantenimiento Predictivo.'}
            </p>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-mono text-cyan-300">
              <span className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800">⚡ 12.8V / 14.1V Live</span>
              <span className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800">⛽ Nivel Tanque TFT</span>
              <span className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800">🏁 3 Carátulas TFT</span>
            </div>
          </div>

          {/* Card Nueva 2: Guantera Digital Modo Retén (Ambos Lados + Bloqueo PIN + Offline) */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900/95 to-emerald-950/30 border-2 border-emerald-500/40 hover:border-emerald-400 transition relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-300">
                2 CARAS + PIN POLICIAL
              </span>
            </div>
            <h3 className="text-lg font-bold font-racing uppercase text-white mb-2">
              {isEn
                ? 'Checkpoint Glovebox (Front & Back + PIN Lock)'
                : 'Guantera Modo Retén (Ambos Lados + Bloqueo PIN)'}
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed font-sans mb-3">
              {isEn
                ? 'Store high-res photos of both sides (Front & Back) of your Driver License and Ownership Card, plus SOAT and Technical Inspection. Lock the screen with a 4-digit PIN before handing your phone to an officer, with 100% Offline cache.'
                : 'Guarda fotos HD por ambos lados (Frente y Reverso) del Pase de Conducción y la Tarjeta de Propiedad, más SOAT y Tecnomecánica. Activa el Bloqueo con PIN de 4 dígitos para entregar el celular al agente sin que salga de los documentos, incluso sin internet.'}
            </p>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-mono text-emerald-300">
              <span className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800">🪪 Pase Frente/Reverso</span>
              <span className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800">💳 Tarjeta 2 Caras</span>
              <span className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800">🔒 Bloqueo PIN + Offline</span>
            </div>
          </div>

          {/* Card Nueva 3: Asesor Jurídico Vial IA (Abogado de Bolsillo por País) */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900/95 to-indigo-950/30 border-2 border-indigo-500/40 hover:border-indigo-400 transition relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-amber-400 flex items-center justify-center border border-indigo-500/30">
                <Scale className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-[10px] font-mono font-bold text-indigo-300">
                8 PAÍSES • ES / EN
              </span>
            </div>
            <h3 className="text-lg font-bold font-racing uppercase text-white mb-2">
              {isEn
                ? 'AI Traffic Lawyer (Anti-Impound & Checkpoint Defense)'
                : 'Abogado Vial IA (Defensa en Retenes y Grúa)'}
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed font-sans mb-3">
              {isEn
                ? 'Ask in real time if a ticket or tow-truck impound is legal in Colombia (Law 769), USA (English), Mexico, Spain, Argentina, Chile, Peru, or Ecuador. Gives you the exact legal article, whether you have 60 minutes to fix the issue, and what to say to the officer.'
                : 'Pregunta en pleno retén si un comparendo o llevarse tu moto en grúa es legal según el código de Colombia (Ley 769), EE. UU. (en inglés), México, España, Argentina, Chile, Perú o Ecuador. Te da el artículo exacto, si tienes 60 minutos para subsanar y qué decirle al agente.'}
            </p>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-mono text-indigo-300">
              <span className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800">⚖️ ¿Es Legal la Grúa?</span>
              <span className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800">⏱️ Regla 60 Minutos</span>
              <span className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800">🌎 8 Jurisdicciones</span>
            </div>
          </div>
        </div>

        {/* Fila 2: Doctor Motor IA, Clanes Moteros con Logo Propio, SOS Emergencia Médica y Grúa GPS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Card Nueva 4: Doctor Motor IA */}
          <div className="p-6 rounded-3xl bg-neutral-900/70 border border-teal-500/35 hover:border-teal-400 transition relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/15 text-cyan-400 flex items-center justify-center mb-4 border border-teal-500/30">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-racing uppercase text-white mb-2">
              {isEn
                ? 'Doctor Motor AI & Fair Workshop Price'
                : 'Doctor Motor IA & Precio Justo de Taller'}
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              {isEn
                ? 'Describe any strange noise, vibration, or failure. Doctor Motor AI diagnoses the root cause for your exact model, tells you if it is safe to keep riding, and estimates fair parts + labor costs so workshops never overcharge you.'
                : 'Describe cualquier ruido, jaloneo o falla eléctrica. El Doctor Motor IA diagnostica la causa exacta para tu modelo y kilometraje, te dice si es seguro seguir rodando y calcula el rango de precio justo de repuestos y mano de obra.'}
            </p>
          </div>

          {/* Card Nueva 5: Clanes Moteros Privados con su Propio Logo */}
          <div className="p-6 rounded-3xl bg-neutral-900/70 border border-amber-500/35 hover:border-amber-400 transition relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/30">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-racing uppercase text-white mb-2">
              {isEn
                ? 'Private Biker Clans with Custom Logos'
                : 'Clanes Moteros Privados con su Propio Logo'}
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              {isEn
                ? 'Create your own Biker Clan with a custom emblem or uploaded photo, secret invite code, private realtime chat, route planner, and live Waze-style checkpoint alerts — backed by official Founder VIP governance.'
                : 'Crea tu propio Clan Motero subiendo el escudo o logo de tu grupo, con código de invitación privado, chat en tiempo real exclusivo del clan, convocatorias de rodadas y alertas Waze Motero.'}
            </p>
          </div>

          {/* Card Nueva 6: SOS Emergencia Médica & Grúa GPS 24/7 */}
          <div className="p-6 rounded-3xl bg-neutral-900/70 border border-red-500/35 hover:border-red-400 transition relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-red-500/15 text-red-400 flex items-center justify-center mb-4 border border-red-500/30">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold font-racing uppercase text-white mb-2">
              {isEn
                ? '24/7 Paramedic Medical Card & Live GPS Tow'
                : 'Ficha Médica Paramédicos & Grúa GPS 24/7'}
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              {isEn
                ? 'High-contrast emergency medical card (Blood Type RH, allergies, EPS/insurance, emergency contact) plus 1-tap GPS coordinates for tow trucks and instant SOS broadcast to the biker community.'
                : 'Ficha médica de alto contraste para paramédicos (Tipo de Sangre Factor RH, alergias, EPS/ARL y contacto de emergencia), solicitud de grúa 24/7 con coordenadas GPS exactas y botón SOS al clan.'}
            </p>
          </div>
        </div>

        {/* Fila 3 Destacada: Radar Legal SIMIT & Guardián de Garantía */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 7: Radar de Fotomultas & SIMIT Global */}
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

          {/* Card 8: Guardián de Garantía Oficial */}
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
                Auteco / TVS / KTM
              </span>
              <span className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-blue-400">
                Yamaha Incolmotos
              </span>
              <span className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-blue-400">
                Bajaj / Grupo UMA
              </span>
              <span className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-blue-400">
                Honda / Suzuki / BMW
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
                <li className="text-cyan-400 font-bold">✓ Enlace Bluetooth Tablero TFT (12 Parámetros + Batería)</li>
                <li className="text-emerald-400 font-bold">✓ Guantera Modo Retén (2 Caras + PIN) & SOS 24/7</li>
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
                <li className="text-cyan-300 font-bold">✓ Enlace TFT + Escáner Cable OBD-II CAN-Bus Completo</li>
                <li className="text-indigo-300 font-bold">✓ Abogado Vial IA Multipaís + Doctor Motor IA Ilimitado</li>
                <li className="text-amber-300 font-bold">✓ Creación de Clanes Moteros Privados con Logo Propio</li>
                <li className="text-emerald-300 font-bold">✓ Alertas WhatsApp 30-15-5d + Radar Fotomultas SIMIT</li>
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

      {/* 5B. SECCIÓN OFICIAL B2B2C: MOTOMALL PARA TIENDAS DE REPUESTOS Y CONCESIONARIOS */}
      <section className="py-12 px-4 bg-gradient-to-b from-neutral-950 to-black border-t border-neutral-900">
        <div className="max-w-5xl mx-auto p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950/35 via-neutral-900 to-emerald-950/30 border-2 border-amber-500/40 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="text-left space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-[11px] font-mono font-bold text-amber-300">
              <Store className="w-3.5 h-3.5 text-amber-400" />
              NUEVO ECOSISTEMA COMERCIAL B2B2C • MOTOMALL OFICIAL
            </span>
            <h3 className="text-2xl sm:text-3xl font-black font-racing uppercase text-white">
              ¿Tienes un Almacén de Repuestos, Boutique o Concesionario?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Regístrate en el <strong>Portal Empresas (B2B)</strong> con tu NIT y el logo de tu negocio. Tus repuestos, aceites, baterías y motos 0 KM aparecerán conectados directamente con el <strong>Mantenimiento Predictivo</strong> de los pilotos cuando necesiten cambiar una pieza.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-shrink-0">
            <button
              type="button"
              onClick={() => onOpenMotoMall && onOpenMotoMall('home')}
              className="px-5 py-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-emerald-500/50 text-emerald-300 font-racing font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition"
            >
              <Store className="w-4 h-4 text-emerald-400" />
              <span>🏪 Inicio & Planes MotoMall</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenMotoMall && onOpenMotoMall('merchant_portal')}
              className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-racing font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition"
            >
              <Building2 className="w-4 h-4" />
              <span>🏢 Registrar Mi Tienda / Concesionario</span>
            </button>
          </div>
        </div>
      </section>

      {/* 6. Footer con Enlaces Legales Oficiales (Política de Privacidad, Habeas Data y Términos) */}
      <footer className="border-t border-neutral-900 py-8 px-4 text-center text-xs text-neutral-500 font-mono bg-neutral-950">
        <div className="max-w-6xl mx-auto flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AppLogo size="sm" showText={false} />
              <span>{t('landing.footerTagline')}</span>
            </div>
            <div>
              Yamaha • KTM • Kawasaki • Ducati • Honda • BMW • Suzuki • Bajaj • TVS
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-900/90 flex flex-wrap items-center justify-center sm:justify-between gap-3 text-[11px]">
            <span className="text-neutral-500">
              © {new Date().getFullYear()} MotoDash AI • {isEn ? 'All Rights Reserved' : 'Todos los derechos reservados'}
            </span>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => onOpenLegal && onOpenLegal('privacy')}
                className="text-neutral-400 hover:text-amber-400 underline underline-offset-4 transition flex items-center gap-1"
              >
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>{isEn ? 'Privacy Policy (Habeas Data)' : 'Política de Privacidad (Habeas Data)'}</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenLegal && onOpenLegal('terms')}
                className="text-neutral-400 hover:text-amber-400 underline underline-offset-4 transition flex items-center gap-1"
              >
                <Scale className="w-3 h-3 text-amber-400" />
                <span>{isEn ? 'Terms & Conditions' : 'Términos y Condiciones'}</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenLegal && onOpenLegal('clans')}
                className="text-neutral-400 hover:text-amber-400 underline underline-offset-4 transition flex items-center gap-1"
              >
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                <span>{isEn ? 'Clan & AI Governance' : 'Política de Clanes e IA'}</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
