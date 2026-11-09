import React, { useState } from 'react';
import {
  Play, Pause, Crown, Volume2, VolumeX, Maximize2, Minimize2,
  Warehouse, Eye, FileText, Gauge, Settings
} from 'lucide-react';
import { BrandLogo } from '../Common/BrandLogos';
import SpeedometerWidget from './Widgets/SpeedometerWidget';
import RpmWidget from './Widgets/RpmWidget';
import TelemetryWidget from './Widgets/TelemetryWidget';
import MaintenanceWidget from './Widgets/MaintenanceWidget';
import RouteWidget from './Widgets/RouteWidget';
import SprintTimerWidget from './Widgets/SprintTimerWidget';
import FuelTelemetryWidget from './Widgets/FuelTelemetryWidget';
import CriticalAlertBanner from './Widgets/CriticalAlertBanner';
import { useShiftLightAudio } from '../../hooks/useShiftLightAudio';
import { useWakeLock } from '../../hooks/useWakeLock';
import { useLanguage } from '../../i18n/LanguageContext';
import { isFounderVipEmail } from '../Auth/LoginModal';

export default function DynamicDashboard({
  config = {},
  telemetry = {},
  odometer = 0,
  hojaDeVida = {},
  customComponents = {},
  ridingCondition = 'normal',
  onChangeRidingCondition,
  garageCount = 1,
  globalSettings = {},
  userProfile = null,
  onToggleSound,
  onOpenSelector,
  onOpenGarage,
  onOpenPaywall,
  onOpenOdometerModal,
  onOpenHojaDeVida,
  onOpenEditComponentModal,
  onOpenSettings
}) {
  const { t } = useLanguage();
  const isVip = Boolean(
    userProfile?.plan === 'founder_vip' ||
    userProfile?.isLifetimeVip ||
    isFounderVipEmail(userProfile?.email)
  );
  const isProOrGarage = Boolean(
    userProfile?.isPro ||
    userProfile?.plan === 'pro_monthly' ||
    userProfile?.plan === 'garage'
  );
  const bikeIdentity = config.bikeIdentity || {
    brand: "YAMAHA",
    model: "MT-09 SP",
    year: 2025,
    colorHex: "#00D2D3",
    accentGlow: "rgba(0, 210, 211, 0.4)",
    category: "naked"
  };

  const telemetrySpecs = config.telemetrySpecs || {
    maxRpm: 11500,
    redlineRpm: 10500,
    speedUnit: "km/h",
    engineCc: 890,
    tankCapacityLiters: 14
  };

  const [localSoundEnabled, setLocalSoundEnabled] = useState(true);
  const soundEnabled = typeof globalSettings.soundEnabled === 'boolean'
    ? globalSettings.soundEnabled
    : localSoundEnabled;

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Mantener la pantalla encendida siempre que esté habilitado (Screen Wake Lock)
  const isWakeLocked = useWakeLock(globalSettings.wakeLockEnabled !== false);

  // Activa el pitido agudo de corte de RPM cuando entra en redline
  useShiftLightAudio(telemetry.rpm || 0, telemetrySpecs.redlineRpm || 10500, soundEnabled);

  const handleSoundClick = () => {
    if (onToggleSound) {
      onToggleSound(!soundEnabled);
    } else {
      setLocalSoundEnabled(!soundEnabled);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => console.log(e));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((e) => console.log(e));
      setIsFullscreen(false);
    }
  };

  const isImperial = globalSettings.unitSystem === 'imperial';
  const displaySpeed = isImperial ? Math.round((telemetry.speed || 0) * 0.621371) : (telemetry.speed || 0);
  const displayMaxSpeed = isImperial ? Math.round((telemetry.maxSpeed || 0) * 0.621371) : (telemetry.maxSpeed || 0);
  const displayUnit = isImperial ? 'mph' : (telemetrySpecs.speedUnit || 'km/h');

  const dashboardStyle = {
    '--primary-accent': bikeIdentity.colorHex || '#FF6600',
    '--secondary-accent': bikeIdentity.accentGlow || bikeIdentity.colorHex || '#FF8533',
    '--accent-glow': bikeIdentity.accentGlow || 'rgba(255, 102, 0, 0.35)'
  };

  return (
    <div 
      style={dashboardStyle}
      className="min-h-screen bg-neutral-950 text-white flex flex-col transition-colors duration-700"
    >
      {/* Barra Superior Cockpit */}
      <header className="border-b border-neutral-800/80 bg-neutral-900/60 backdrop-blur-xl px-4 sm:px-8 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Identidad de la Moto con el Logo Oficial de su Marca */}
          <div className="flex items-center gap-3">
            <div 
              className="w-11 h-11 rounded-2xl bg-neutral-900/95 flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition flex-shrink-0 p-1.5 border"
              style={{
                borderColor: "var(--primary-accent)",
                boxShadow: "0 0 18px var(--accent-glow)"
              }}
              onClick={onOpenGarage}
              title={`${bikeIdentity.brand} • Abrir Mi Garaje`}
            >
              <BrandLogo
                brand={bikeIdentity.brand}
                accentColor={bikeIdentity.colorHex}
                className="w-full h-full drop-shadow"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-xl font-black font-racing uppercase tracking-wider text-white">
                  {bikeIdentity.brand} <span style={{ color: "var(--primary-accent)" }}>{bikeIdentity.model}</span>
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700">
                  {bikeIdentity.year}
                </span>
                {isWakeLocked && (
                  <span className="hidden sm:flex items-center gap-1 text-[9px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                    <Eye className="w-2.5 h-2.5" />
                    {t('dashboard.wakeLockActive')}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400 font-mono">
                {telemetrySpecs.engineCc}cc • {(bikeIdentity.category || 'sport').toUpperCase()} •{' '}
                <span
                  onClick={() => onOpenOdometerModal && onOpenOdometerModal()}
                  className="text-amber-400 cursor-pointer hover:underline font-bold"
                >
                  {Number(odometer).toLocaleString()} km
                </span>
              </p>
            </div>
          </div>

          {/* Botonera de Control */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* Hoja de Vida de la Moto */}
            <button
              onClick={onOpenHojaDeVida}
              className="px-3 py-1.5 rounded-xl text-xs font-racing font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 flex items-center gap-1.5 transition"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{t('dashboard.logbook')}</span>
            </button>

            {/* Calibrar Odómetro Manual */}
            <button
              onClick={() => onOpenOdometerModal && onOpenOdometerModal()}
              className="px-3 py-1.5 rounded-xl text-xs font-racing font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 flex items-center gap-1.5 transition"
            >
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">{t('dashboard.adjustKm')}</span>
            </button>

            {/* Audio Shift Light */}
            <button
              onClick={handleSoundClick}
              className={`p-2 rounded-xl text-xs border transition ${
                soundEnabled 
                  ? "bg-neutral-800 text-neutral-200 border-neutral-700" 
                  : "bg-red-950/40 text-red-400 border-red-800/40"
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Pantalla Completa */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Simulación Aceleración Demo */}
            <button
              onClick={telemetry.toggleSimulation}
              className={`px-3 py-1.5 rounded-xl text-xs font-racing font-bold flex items-center gap-1.5 border transition ${
                telemetry.isSimulating 
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-sm shadow-amber-500/10" 
                  : "bg-neutral-800/80 text-neutral-300 border-neutral-700 hover:text-white"
              }`}
            >
              {telemetry.isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{telemetry.isSimulating ? t('dashboard.pauseDemo') : t('dashboard.simulate')}</span>
            </button>

            {/* Mi Garaje */}
            <button
              onClick={onOpenGarage}
              className="px-3 py-1.5 rounded-xl text-xs font-racing font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 flex items-center gap-1.5 transition"
            >
              <Warehouse className="w-3.5 h-3.5 text-neutral-400" />
              <span className="hidden sm:inline">{t('dashboard.garage')}</span>
              <span className="text-[10px] bg-neutral-700 text-neutral-300 px-1.5 rounded-full font-mono">
                {garageCount}
              </span>
            </button>

            {/* Ajustes Globales */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition"
              title="Configuración de Unidades, Moneda y Respaldo"
            >
              <Settings className="w-4 h-4 text-neutral-400 hover:text-white" />
            </button>

            {/* Suscripción Pro / VIP */}
            {isVip ? (
              <div
                className="px-3 py-1.5 rounded-xl text-xs font-racing font-bold bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black flex items-center gap-1.5 shadow-md shadow-amber-500/30 border border-yellow-300/40 select-none cursor-default"
                title="Cuenta Fundador VIP Oficial • Acceso Ilimitado De Por Vida"
              >
                <Crown className="w-3.5 h-3.5 fill-black" />
                <span>VIP</span>
              </div>
            ) : isProOrGarage ? (
              <div
                className="px-3 py-1.5 rounded-xl text-xs font-racing font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 select-none cursor-default"
                title={userProfile?.plan === 'garage' ? 'Plan Garaje Activo (hasta 15 motos)' : 'Plan Pro Activo (hasta 3 motos)'}
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>{userProfile?.plan === 'garage' ? 'Garaje' : 'Pro'}</span>
              </div>
            ) : (
              <button
                onClick={onOpenPaywall}
                className="px-3 py-1.5 rounded-xl text-xs font-racing font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:opacity-90 flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Pro</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Banner de Alerta Crítica (si hay mantenimiento urgente o documento por vencer) */}
      <CriticalAlertBanner 
        currentOdometer={odometer}
        customComponents={customComponents}
        docs={hojaDeVida.documentos || {}}
        onOpenOdometerModal={onOpenOdometerModal}
        onOpenHojaDeVida={onOpenHojaDeVida}
      />

      {/* Grid Principal de Widgets */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {/* Fila 1: Velocímetro & Tacómetro */}
          <SpeedometerWidget 
            speed={displaySpeed}
            maxSpeed={displayMaxSpeed}
            gear={telemetry.gear || 'N'}
            unit={displayUnit}
            isGpsActive={telemetry.isGpsActive}
            isSimulating={telemetry.isSimulating}
          />

          <RpmWidget 
            currentRpm={telemetry.rpm || 1300}
            maxRpm={telemetrySpecs.maxRpm}
            redlineRpm={telemetrySpecs.redlineRpm}
          />

          {/* Fila 2: Cronómetro 0-100 & Radar de Ruta */}
          <SprintTimerWidget 
            speed={telemetry.speed || 0}
          />

          <RouteWidget 
            speed={telemetry.speed || 0}
            heading={telemetry.heading || 0}
            isSimulating={telemetry.isSimulating}
            tripDistanceKm={telemetry.tripDistanceKm}
            tripSeconds={telemetry.tripSeconds}
            avgSpeed={telemetry.avgSpeed}
          />

          {/* Fila 3: Telemetría de Chasis & Odómetro Clickeable */}
          <TelemetryWidget 
            leanAngle={telemetry.leanAngle || 0}
            altitude={telemetry.altitude || 120}
            odometer={odometer}
            tankCapacity={telemetrySpecs.tankCapacityLiters}
            onOpenOdometerModal={onOpenOdometerModal}
          />

          {/* Fila 4: Telemetría de Combustible & Consumo */}
          <FuelTelemetryWidget 
            tankCapacity={telemetrySpecs.tankCapacityLiters}
            engineCc={telemetrySpecs.engineCc}
            tanqueos={hojaDeVida.tanqueos || []}
            currency={globalSettings.currency || 'COP'}
            onOpenOdometerModal={onOpenOdometerModal}
          />

          {/* Fila 5: Mantenimiento Preventivo con Componentes Editables Individualmente */}
          <div className="lg:col-span-2">
            <MaintenanceWidget 
              currentOdometer={odometer}
              customComponents={customComponents}
              ridingCondition={ridingCondition}
              onChangeRidingCondition={onChangeRidingCondition}
              onOpenOdometerModal={onOpenOdometerModal}
              onOpenEditComponentModal={onOpenEditComponentModal}
            />
          </div>
        </div>
      </main>

      {/* Footer Minimalista */}
      <footer className="border-t border-neutral-900 py-4 px-6 text-center text-xs text-neutral-600 font-mono">
        {t('dashboard.footer')} • <a href="https://motodashai.com" target="_blank" rel="noreferrer" className="text-neutral-500 hover:text-neutral-400">motodashai.com</a>
      </footer>
    </div>
  );
}
