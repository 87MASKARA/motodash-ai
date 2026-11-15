import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Volume2, VolumeX, ArrowRight, Bluetooth, ShieldCheck,
  Scale, Wrench, HeartPulse, Users, Gauge
} from 'lucide-react';
import AppLogo from '../Common/AppLogo';
import { useLanguage } from '../../i18n/LanguageContext';

const INTRO_DURATION_MS = 10000; // 10 segundos exactos

export default function VideoIntroSplash({ onFinish }) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const videoRef = useRef(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const diff = Date.now() - startTime;
      if (diff >= INTRO_DURATION_MS) {
        setElapsedMs(INTRO_DURATION_MS);
        clearInterval(interval);
        handleComplete();
      } else {
        setElapsedMs(diff);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const handleComplete = () => {
    setIsClosing(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 420);
  };

  const toggleSound = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted) {
      videoRef.current.play().catch(() => {});
    }
  };

  const progressPct = Math.min(100, Math.round((elapsedMs / INTRO_DURATION_MS) * 100));
  const remainingSec = Math.max(0, ((INTRO_DURATION_MS - elapsedMs) / 1000)).toFixed(1);

  // Fase dinámica de subtítulos durante los 10 segundos
  const phaseIndex = elapsedMs < 3300 ? 0 : elapsedMs < 6700 ? 1 : 2;

  const phases = isEn
    ? [
        {
          badge: 'REALTIME TFT CLUSTER & OBD-II TELEMETRY',
          headline: 'LINK YOUR MOTORCYCLE IN SECONDS',
          sub: '12 Live Parameters • Battery Voltage & Health in Predictive Maintenance • Real Fuel & Ride Modes'
        },
        {
          badge: 'CHECKPOINT SHIELD & AI LEGAL DEFENSE',
          headline: 'PROTECT YOUR BIKE & YOUR WALLET',
          sub: '2-Sided Digital Glovebox with PIN Lock • AI Traffic Lawyer • SIMIT Photo-Ticket Radar & Warranty Guardian'
        },
        {
          badge: 'BIKER CLANS, AI MECHANIC & 24/7 SOS',
          headline: 'THE ULTIMATE BIKER ECOSYSTEM',
          sub: 'Doctor Motor AI Diagnostics • Paramedic SOS & Tow Truck GPS • Private Biker Clans with Custom Logos'
        }
      ]
    : [
        {
          badge: 'TELEMETRÍA TFT SMARTXONNECT & CABLE OBD-II',
          headline: 'CONECTA TU MOTO EN TIEMPO REAL',
          sub: '12 Parámetros en Vivo • Voltaje y Salud de Batería en Mantenimiento Predictivo • Gasolina y Modos de Manejo'
        },
        {
          badge: 'BLINDAJE EN RETENES & DEFENSA VIAL IA',
          headline: 'PROTEGE TU MOTO Y TU BOLSILLO',
          sub: 'Guantera Modo Retén (2 Caras + Bloqueo PIN) • Abogado Vial IA • Radar SIMIT 50% Dto. & Guardián de Garantía'
        },
        {
          badge: 'CLANES MOTEROS, DOCTOR MOTOR IA & SOS 24/7',
          headline: 'EL ECOSISTEMA MOTERO DEFINITIVO',
          sub: 'Diagnóstico Mecánico por IA • SOS Paramédicos y Grúa GPS • Clanes Privados con su Propio Logo Oficial'
        }
      ];

  const activePhase = phases[phaseIndex];

  return (
    <div
      className={`fixed inset-0 z-[200] bg-black flex flex-col justify-between overflow-hidden select-none transition-opacity duration-500 ${
        isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Video de Fondo a Pantalla Completa */}
      <video
        ref={videoRef}
        src="/motodash-intro.mp4"
        autoPlay
        muted={isMuted}
        playsInline
        loop
        className="absolute inset-0 w-full h-full object-cover scale-[1.02] filter brightness-[0.82] contrast-[1.12]"
      />

      {/* Capas Cinematográficas y Viñeta Racing */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/70 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,rgba(0,0,0,0.78)_100%)] pointer-events-none" />

      {/* Top HUD Bar */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-8 pt-5 flex items-center justify-between">
        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md border border-white/15 px-3.5 py-2 rounded-2xl">
          <AppLogo size="sm" />
          <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-widest text-amber-400 border-l border-neutral-700 pl-3">
            SYSTEM IGNITION • V2.5 PRO
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleSound}
            className="px-3.5 py-2 rounded-2xl bg-black/65 hover:bg-neutral-900/90 backdrop-blur-md border border-white/15 text-xs font-mono text-neutral-200 flex items-center gap-1.5 transition"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">{isEn ? 'Enable Audio' : 'Activar Audio'}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">{isEn ? 'Audio On' : 'Sonido Activo'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleComplete}
            className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-racing font-black uppercase tracking-wider text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/30 transition active:scale-95"
          >
            <span>{isEn ? 'Enter App' : 'Entrar a la App'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Centro Cinematográfico: Nombre Oficial y Textos Superpuestos */}
      <div className="relative z-10 max-w-5xl w-full mx-auto px-4 text-center my-auto py-6">
        {/* Badge Superior Animado */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/50 backdrop-blur-md text-amber-300 text-[11px] sm:text-xs font-mono font-bold uppercase tracking-widest mb-4 shadow-lg shadow-amber-500/10">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>{activePhase.badge}</span>
        </div>

        {/* Nombre Principal Gigante encima del Video */}
        <div className="relative">
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black font-racing uppercase tracking-tight leading-none text-white drop-shadow-[0_6px_30px_rgba(0,0,0,0.95)]">
            MOTO<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500">DASH</span>{' '}
            <span className="inline-block px-3 py-0.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-black text-3xl sm:text-5xl md:text-6xl align-middle shadow-2xl shadow-amber-500/40">
              AI
            </span>
          </h1>
          <p className="text-xs sm:text-sm font-mono uppercase tracking-[0.28em] text-amber-300/90 mt-2 font-bold drop-shadow">
            {isEn
              ? 'INTELLIGENT MOTORCYCLE COCKPIT & BIKER SHIELD'
              : 'COCKPIT INTELIGENTE • TELEMETRÍA TFT & BLINDAJE MOTERO'}
          </p>
        </div>

        {/* Tarjeta Dinámica con los Nuevos Módulos de la App */}
        <div className="mt-6 sm:mt-8 max-w-3xl mx-auto p-4 sm:p-6 rounded-3xl bg-black/65 backdrop-blur-xl border border-amber-500/35 shadow-2xl">
          <h2 className="text-lg sm:text-2xl font-black font-racing uppercase tracking-wide text-white mb-1.5">
            {activePhase.headline}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-200 font-sans leading-relaxed">
            {activePhase.sub}
          </p>

          {/* Píldoras de Módulos Integrados */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className="px-2.5 py-1 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-300 flex items-center gap-1">
              <Bluetooth className="w-3 h-3 text-cyan-400" />
              TFT 12 Parámetros + Batería
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-300 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Modo Retén PIN (2 Lados)
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-[10px] font-mono font-bold text-indigo-300 flex items-center gap-1">
              <Scale className="w-3 h-3 text-amber-400" />
              Abogado Vial IA
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-teal-950/80 border border-teal-500/40 text-[10px] font-mono font-bold text-teal-300 flex items-center gap-1">
              <Wrench className="w-3 h-3 text-cyan-400" />
              Doctor Motor IA
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-red-950/80 border border-red-500/40 text-[10px] font-mono font-bold text-red-300 flex items-center gap-1">
              <HeartPulse className="w-3 h-3 text-red-400 animate-pulse" />
              SOS Médicos & Grúa GPS
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-amber-950/80 border border-amber-500/40 text-[10px] font-mono font-bold text-amber-300 flex items-center gap-1">
              <Users className="w-3 h-3 text-amber-400" />
              Clanes Moteros con Logo
            </span>
          </div>
        </div>
      </div>

      {/* Barra Inferior de Ignición (10 Segundos) */}
      <div className="relative z-10 max-w-5xl w-full mx-auto px-4 sm:px-8 pb-6">
        <div className="flex items-center justify-between text-xs font-mono text-neutral-300 mb-2">
          <span className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>
              {isEn ? 'INITIALIZING TELEMETRY & AI MODULES...' : 'INICIANDO TELEMETRÍA TFT Y MÓDULOS IA...'}
            </span>
          </span>
          <span className="text-amber-400 font-bold">
            {progressPct}% • {remainingSec}s
          </span>
        </div>

        <div className="w-full h-2.5 bg-neutral-900/90 rounded-full overflow-hidden border border-white/15 p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 transition-all duration-100 shadow-lg shadow-amber-500/50"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
