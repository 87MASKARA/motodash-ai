import React, { useState } from 'react';
import {
  Play, Pause, Crown, Volume2, VolumeX, Maximize2, Minimize2,
  Warehouse, Eye, FileText, Gauge, Settings, Shield, Radar, Bluetooth
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
import WarrantyGuardianWidget from './Widgets/WarrantyGuardianWidget';
import TrafficFinesRadarCard from './Widgets/TrafficFinesRadarCard';
import WarrantyRulesModal from '../Modals/WarrantyRulesModal';
import RegisterWarrantyRevisionModal from '../Modals/RegisterWarrantyRevisionModal';
import TrafficFinesModal from '../Modals/TrafficFinesModal';
import HardwareBridgeModal from '../Modals/HardwareBridgeModal';
import { computeWarrantyState } from '../../services/warrantyCatalog';
import { computeFinesRadarState } from '../../services/trafficFinesService';
import { useShiftLightAudio } from '../../hooks/useShiftLightAudio';
import { useWakeLock } from '../../hooks/useWakeLock';
import { useLanguage } from '../../i18n/LanguageContext';
import { isFounderVipEmail } from '../Auth/LoginModal';

export default function DynamicDashboard({
  bike = null,
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
  onOpenSettings,
  onUpdateHojaDeVida,
  onSyncHardwareOdometer
}) {
  const { t } = useLanguage();
  const [isHardwareBridgeOpen, setIsHardwareBridgeOpen] = useState(false);
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

  const effectiveBike = bike || { config, hojaDeVida, odometer };
  const warrantyState = computeWarrantyState(effectiveBike, odometer);

  const [isWarrantyRulesOpen, setIsWarrantyRulesOpen] = useState(false);
  const [selectedRevisionForRules, setSelectedRevisionForRules] = useState(null);
  const [isRegisterWarrantyModalOpen, setIsRegisterWarrantyModalOpen] = useState(false);
  const [selectedRevisionForRegister, setSelectedRevisionForRegister] = useState(null);

  const handleOpenWarrantyRules = (revNum = null) => {
    setSelectedRevisionForRules(revNum);
    setIsWarrantyRulesOpen(true);
  };

  const handleOpenRegisterRevision = (rev) => {
    setSelectedRevisionForRegister(rev || warrantyState.nextRev);
    setIsRegisterWarrantyModalOpen(true);
  };

  const handleConfirmRevision = (data) => {
    const currentHoja = hojaDeVida || { documentos: {}, servicios: [], tanqueos: [], garantia: {} };
    const currentGarantia = currentHoja.garantia || {};
    const existingCompletadas = new Set(currentGarantia.completadas || []);
    existingCompletadas.add(data.revisionNumero);

    const newServiceRecord = {
      id: `srv_garantia_${data.revisionNumero}_${Date.now()}`,
      fecha: data.fecha,
      km: data.kmReal,
      servicio: data.servicioTitulo,
      marcaRepuesto: data.repuestos,
      taller: data.taller,
      costo: data.costo,
      notas: data.notas,
      esRevisionGarantia: true,
      revisionNumero: data.revisionNumero
    };

    const nextHoja = {
      ...currentHoja,
      servicios: [newServiceRecord, ...(currentHoja.servicios || [])],
      garantia: {
        ...currentGarantia,
        completadas: Array.from(existingCompletadas)
      }
    };

    if (onUpdateHojaDeVida) {
      onUpdateHojaDeVida(nextHoja);
    }
  };

  const handleUnmarkRevision = (revisionNumero) => {
    const revNum = Number(revisionNumero);
    const currentHoja = hojaDeVida || { documentos: {}, servicios: [], tanqueos: [], garantia: {} };
    const currentGarantia = currentHoja.garantia || {};
    const existingCompletadas = new Set(
      Array.isArray(currentGarantia.completadas) ? currentGarantia.completadas.map(Number) : []
    );
    existingCompletadas.delete(revNum);

    // Remover también el registro de servicio automático de la bitácora si existe
    const updatedServicios = Array.isArray(currentHoja.servicios)
      ? currentHoja.servicios.filter(
          (s) => !(s.esRevisionGarantia && Number(s.revisionNumero) === revNum)
        )
      : [];

    const nextHoja = {
      ...currentHoja,
      servicios: updatedServicios,
      garantia: {
        ...currentGarantia,
        completadas: Array.from(existingCompletadas).sort((a, b) => a - b)
      }
    };

    if (onUpdateHojaDeVida) {
      onUpdateHojaDeVida(nextHoja);
    }
  };

  const handleResetAllRevisions = () => {
    const currentHoja = hojaDeVida || { documentos: {}, servicios: [], tanqueos: [], garantia: {} };
    const currentGarantia = currentHoja.garantia || {};

    const updatedServicios = Array.isArray(currentHoja.servicios)
      ? currentHoja.servicios.filter((s) => !s.esRevisionGarantia)
      : [];

    const nextHoja = {
      ...currentHoja,
      servicios: updatedServicios,
      garantia: {
        ...currentGarantia,
        completadas: []
      }
    };

    if (onUpdateHojaDeVida) {
      onUpdateHojaDeVida(nextHoja);
    }
  };

  const handleSaveCustomWarranty = (customSettings) => {
    const currentHoja = hojaDeVida || { documentos: {}, servicios: [], tanqueos: [], garantia: {} };
    const currentGarantia = currentHoja.garantia || {};

    const nextHoja = {
      ...currentHoja,
      garantia: {
        ...currentGarantia,
        ...customSettings
      }
    };

    if (onUpdateHojaDeVida) {
      onUpdateHojaDeVida(nextHoja);
    }
  };

  // Estado del Radar de Multas y Comparendos (Opción A + C)
  const finesRadarState = computeFinesRadarState(effectiveBike, userProfile);
  const [isFinesModalOpen, setIsFinesModalOpen] = useState(false);
  const [finesModalTab, setFinesModalTab] = useState('multas');

  const handleOpenFinesModal = (tab = 'multas') => {
    setFinesModalTab(typeof tab === 'string' ? tab : 'multas');
    setIsFinesModalOpen(true);
  };

  const handleSaveTrafficSettings = (settings) => {
    const currentHoja = hojaDeVida || { documentos: {}, servicios: [], tanqueos: [], multas: {} };
    const currentMultas = currentHoja.multas || {};

    const nextHoja = {
      ...currentHoja,
      multas: {
        ...currentMultas,
        ...settings
      }
    };

    if (onUpdateHojaDeVida) {
      onUpdateHojaDeVida(nextHoja);
    }
  };

  const handleClearFine = () => {
    const currentHoja = hojaDeVida || { documentos: {}, servicios: [], tanqueos: [], multas: {} };
    const currentMultas = currentHoja.multas || {};

    const nextHoja = {
      ...currentHoja,
      multas: {
        ...currentMultas,
        alertasActivas: []
      }
    };

    if (onUpdateHojaDeVida) {
      onUpdateHojaDeVida(nextHoja);
    }
  };
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

            {/* Pill de Garantía Oficial en el Header */}
            {warrantyState.isEnabled && (
              <button
                type="button"
                onClick={() => handleOpenWarrantyRules(warrantyState.nextRev?.numero)}
                className="px-2.5 py-1.5 rounded-xl text-xs font-racing font-bold bg-blue-950/60 hover:bg-blue-900/60 border border-blue-500/40 text-blue-300 flex items-center gap-1.5 transition shadow-sm"
                title={`Guardián de Garantía ${warrantyState.distribuidorCorto}`}
              >
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Garantía</span>
                <span className="text-cyan-300">{warrantyState.nextRev ? `${warrantyState.nextRev.numero}ª` : '100%'}</span>
              </button>
            )}

            {/* Pill Radar de Fotomultas en el Header */}
            <button
              type="button"
              onClick={() => handleOpenFinesModal('multas')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-racing font-bold flex items-center gap-1.5 transition shadow-sm border ${
                finesRadarState.tieneMultas
                  ? "bg-red-950/80 hover:bg-red-900 border-red-500/60 text-red-300 animate-pulse shadow-md shadow-red-500/20"
                  : "bg-neutral-900/80 hover:bg-neutral-800 border-neutral-700 text-neutral-300"
              }`}
              title={`Radar de Tránsito ${finesRadarState.portal.entidadCorta}`}
            >
              <Radar className={`w-3.5 h-3.5 ${finesRadarState.tieneMultas ? "text-red-400" : "text-emerald-400"}`} />
              <span className="hidden sm:inline">{finesRadarState.portal.entidadCorta}</span>
              <span className={finesRadarState.tieneMultas ? "text-red-300 font-bold" : "text-emerald-400"}>
                {finesRadarState.tieneMultas ? `${finesRadarState.totalMultas} Multa` : 'Al Día'}
              </span>
            </button>

            {/* Pill Conectar Tablero TFT (BLE) o Cable OBD-II */}
            <button
              type="button"
              onClick={() => setIsHardwareBridgeOpen(true)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-racing font-bold flex items-center gap-1.5 transition shadow-sm border bg-neutral-900/90 hover:bg-neutral-800 border-neutral-700 text-neutral-300"
              title="Vincular Tablero TFT SmartXonnect (Gratis) o Escáner OBD-II (PRO)"
            >
              <Bluetooth className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Vincular</span>
              <span className="sm:hidden">TFT</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold">
                TFT/OBD
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

      {/* Banner de Alerta Crítica (si hay fotomulta con descuento, mantenimiento urgente o documento por vencer) */}
      <CriticalAlertBanner 
        currentOdometer={odometer}
        customComponents={customComponents}
        docs={hojaDeVida.documentos || {}}
        urgentFine={finesRadarState.multaUrgente}
        onOpenOdometerModal={onOpenOdometerModal}
        onOpenHojaDeVida={onOpenHojaDeVida}
        onOpenFinesModal={() => handleOpenFinesModal('multas')}
      />

      {/* Grid Principal de Widgets */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          
          {/* MÓDULO GUARDIÁN DE GARANTÍA OFICIAL */}
          <div className="lg:col-span-2">
            <WarrantyGuardianWidget
              bike={effectiveBike}
              currentOdometer={odometer}
              onOpenRulesModal={handleOpenWarrantyRules}
              onOpenRegisterRevisionModal={handleOpenRegisterRevision}
              onUnmarkRevision={handleUnmarkRevision}
            />
          </div>

          {/* MÓDULO RADAR DE FOTOMULTAS & COMPARENDOS MULTIPAÍS */}
          <div className="lg:col-span-2">
            <TrafficFinesRadarCard
              bike={effectiveBike}
              userProfile={userProfile}
              onOpenFinesModal={handleOpenFinesModal}
              onUpdateHojaDeVida={onUpdateHojaDeVida}
            />
          </div>

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

      {/* MODAL REGLAS & MANUAL DE GARANTÍA */}
      <WarrantyRulesModal
        isOpen={isWarrantyRulesOpen}
        onClose={() => {
          setIsWarrantyRulesOpen(false);
          setSelectedRevisionForRules(null);
        }}
        warrantyState={warrantyState}
        initialRevisionNumero={selectedRevisionForRules}
        onSaveCustomWarranty={handleSaveCustomWarranty}
        onUnmarkRevision={handleUnmarkRevision}
        onRegisterRevision={handleOpenRegisterRevision}
        onResetAllRevisions={handleResetAllRevisions}
        bikeName={`${bikeIdentity.brand} ${bikeIdentity.model}`}
      />

      {/* MODAL REGISTRAR REVISIÓN DE GARANTÍA */}
      <RegisterWarrantyRevisionModal
        isOpen={isRegisterWarrantyModalOpen}
        onClose={() => {
          setIsRegisterWarrantyModalOpen(false);
          setSelectedRevisionForRegister(null);
        }}
        revision={selectedRevisionForRegister || warrantyState.nextRev}
        currentOdometer={odometer}
        distribuidor={warrantyState.distribuidor}
        currency={globalSettings.currency || 'COP'}
        onConfirmRevision={handleConfirmRevision}
      />

      {/* MODAL RADAR DE FOTOMULTAS & TRÁNSITO */}
      <TrafficFinesModal
        isOpen={isFinesModalOpen}
        onClose={() => setIsFinesModalOpen(false)}
        radarState={finesRadarState}
        initialTab={finesModalTab}
        onSaveTrafficSettings={handleSaveTrafficSettings}
        onClearFine={handleClearFine}
        bikeName={`${bikeIdentity.brand} ${bikeIdentity.model}`}
      />

      {/* MODAL VINCULAR HARDWARE: CLÚSTER TFT O CABLE OBD-II */}
      <HardwareBridgeModal
        isOpen={isHardwareBridgeOpen}
        onClose={() => setIsHardwareBridgeOpen(false)}
        bike={effectiveBike}
        userProfile={userProfile}
        onSyncOdometer={(km, source) => {
          if (onSyncHardwareOdometer) {
            onSyncHardwareOdometer(km, source);
          }
        }}
        onOpenPaywall={onOpenPaywall}
      />
    </div>
  );
}
