import React, { useState } from 'react';
import {
  Play, Pause, Crown, Volume2, VolumeX, Maximize2, Minimize2,
  Warehouse, Eye, FileText, Gauge, Settings, Shield, Radar, Bluetooth,
  ShieldCheck, Users, Award, Bell, Scale, HeartPulse, Wrench, Flame, Moon, Monitor, Store,
  Menu, ChevronRight, ChevronLeft, X
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
import DigitalGloveboxModal from '../Modals/DigitalGloveboxModal';
import AlertsCenterModal from '../Modals/AlertsCenterModal';
import CommunityChatModal from '../Modals/CommunityChatModal';
import CertifiedMarketplaceModal from '../Modals/CertifiedMarketplaceModal';
import TrafficLawyerModal from '../Modals/TrafficLawyerModal';
import SosEmergencyModal from '../Modals/SosEmergencyModal';
import DoctorMotorModal from '../Modals/DoctorMotorModal';
import CarPlayHudModal from '../Modals/CarPlayHudModal';
import MotoMallModal from '../Modals/MotoMallModal';
import FounderAdminModal from '../Modals/FounderAdminModal';
import { loadAppGovernance } from '../../services/founderAdminService';
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
  onSyncHardwareOdometer,
  onOpenLegal
}) {
  const { t, lang, setLang } = useLanguage();
  const isEn = lang === 'en';
  const [isHardwareBridgeOpen, setIsHardwareBridgeOpen] = useState(false);
  const [isGloveboxOpen, setIsGloveboxOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);
  const [isLawyerModalOpen, setIsLawyerModalOpen] = useState(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [isCarPlayHudOpen, setIsCarPlayHudOpen] = useState(false);
  const [isMotoMallOpen, setIsMotoMallOpen] = useState(false);
  const [isFounderAdminOpen, setIsFounderAdminOpen] = useState(false);
  const [appGovernance, setAppGovernance] = useState(() => loadAppGovernance());
  const [motoMallCompId, setMotoMallCompId] = useState(null);
  const [motoMallInitialTab, setMotoMallInitialTab] = useState('catalog');
  const [tftTheme, setTftTheme] = useState('street'); // 'street' | 'track' | 'stealth'
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false);
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
    const codeToCountry = {
      CO: 'Colombia',
      ES: 'España',
      MX: 'México',
      US: 'Estados Unidos',
      AR: 'Argentina',
      CL: 'Chile',
      PE: 'Perú',
      BR: 'Brasil',
      FR: 'Francia',
      IT: 'Italia',
      DE: 'Alemania'
    };
    const codeToLang = {
      CO: 'es',
      ES: 'es',
      MX: 'es',
      AR: 'es',
      CL: 'es',
      PE: 'es',
      US: 'en',
      UK: 'en',
      BR: 'pt',
      FR: 'fr',
      IT: 'it',
      DE: 'de'
    };
    const nextCountryName = codeToCountry[settings?.pais] || currentHoja.country || 'Colombia';

    if (setLang && settings?.pais) {
      setLang(codeToLang[settings.pais] || 'es');
    }

    const nextHoja = {
      ...currentHoja,
      country: nextCountryName,
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
  const hwTelemetry = hojaDeVida?.hardwareTelemetry || {};
  const rawSpeedKmh = telemetry.isSimulating || telemetry.isGpsActive
    ? (telemetry.speed || 0)
    : (Number(hwTelemetry.speedKmh) || telemetry.speed || 0);
  const rawMaxSpeedKmh = telemetry.isSimulating
    ? (telemetry.maxSpeed || 0)
    : Math.max(Number(telemetry.maxSpeed) || 0, Number(hwTelemetry.topSpeedRecorded) || 0);
  const effectiveRpm = telemetry.isSimulating || (telemetry.isGpsActive && telemetry.rpm > 0)
    ? (telemetry.rpm || 1300)
    : (Number(hwTelemetry.rpmIdle) || telemetry.rpm || 1300);
  const effectiveGear = telemetry.isSimulating || (telemetry.isGpsActive && telemetry.speed > 0)
    ? (telemetry.gear || 'N')
    : (hwTelemetry.gear || telemetry.gear || 'N');
  const effectiveTripKm = telemetry.isSimulating || (telemetry.tripDistanceKm > 0)
    ? telemetry.tripDistanceKm
    : (Number(hwTelemetry.tripAKm) || 0);
  const effectiveAvgSpeed = telemetry.isSimulating || (telemetry.avgSpeed > 0)
    ? telemetry.avgSpeed
    : (Number(hwTelemetry.avgSpeed) || 0);

  const displaySpeed = isImperial ? Math.round(rawSpeedKmh * 0.621371) : rawSpeedKmh;
  const displayMaxSpeed = isImperial ? Math.round(rawMaxSpeedKmh * 0.621371) : rawMaxSpeedKmh;
  const displayUnit = isImperial ? 'mph' : (telemetrySpecs.speedUnit || 'km/h');

  const themeColors = {
    street: {
      primary: bikeIdentity.colorHex || '#FF6600',
      secondary: bikeIdentity.accentGlow || bikeIdentity.colorHex || '#FF8533',
      glow: bikeIdentity.accentGlow || 'rgba(255, 102, 0, 0.35)'
    },
    track: {
      primary: '#FF1E56',
      secondary: '#00F5D4',
      glow: 'rgba(255, 30, 86, 0.45)'
    },
    stealth: {
      primary: '#10B981',
      secondary: '#06B6D4',
      glow: 'rgba(16, 185, 129, 0.38)'
    }
  };
  const activeTheme = themeColors[tftTheme] || themeColors.street;

  const dashboardStyle = {
    '--primary-accent': activeTheme.primary,
    '--secondary-accent': activeTheme.secondary,
    '--accent-glow': activeTheme.glow
  };

  return (
    <div 
      style={dashboardStyle}
      className="min-h-screen bg-neutral-950 text-white flex flex-col transition-colors duration-700 pb-16 sm:pb-0"
    >
      {/* Pestaña Lateral Flotante en el Borde Izquierdo para Abrir el Menú en Cualquier Momento */}
      {!isLeftMenuOpen && (
        <button
          type="button"
          onClick={() => setIsLeftMenuOpen(true)}
          className="fixed left-0 top-24 z-40 py-3 px-2 rounded-r-2xl bg-neutral-900/95 hover:bg-neutral-800 border border-l-0 border-amber-500/50 text-amber-400 shadow-[4px_0_20px_rgba(0,0,0,0.8)] flex flex-col items-center gap-1.5 transition hover:pl-3 group"
          title="Desplegar Menú Lateral Izquierdo de Herramientas"
        >
          <Menu className="w-4 h-4 text-amber-400" />
          <span className="text-[9px] font-racing font-black uppercase tracking-wider [writing-mode:vertical-rl] rotate-180 text-neutral-200 group-hover:text-amber-300">
            {isEn ? 'MENU' : 'MENÚ'}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
        </button>
      )}

      {/* Menú Lateral Desplegable al Lado Izquierdo (Slide-Out Drawer con Todos los Módulos) */}
      {isLeftMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop Oscuro para Cerrar al Tocar Fuera */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setIsLeftMenuOpen(false)}
          />

          {/* Panel Lateral Izquierdo */}
          <aside className="relative z-10 w-72 sm:w-80 max-w-[86vw] h-full bg-neutral-950/98 border-r-2 border-amber-500/40 shadow-[12px_0_45px_rgba(0,0,0,0.9)] flex flex-col justify-between overflow-y-auto p-4">
            <div>
              {/* Cabecera del Menú Izquierdo */}
              <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-xl bg-neutral-900 flex items-center justify-center p-1.5 border flex-shrink-0"
                    style={{ borderColor: "var(--primary-accent)" }}
                  >
                    <BrandLogo
                      brand={bikeIdentity.brand}
                      accentColor={bikeIdentity.colorHex}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-amber-400 block font-bold">
                      MENÚ DEL COCKPIT
                    </span>
                    <h3 className="text-xs font-black font-racing uppercase text-white truncate">
                      {bikeIdentity.brand} {bikeIdentity.model}
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLeftMenuOpen(false)}
                  className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition flex items-center gap-1 text-xs font-mono"
                  title="Ocultar menú izquierdo"
                >
                  <ChevronLeft className="w-4 h-4 text-amber-400" />
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* SECCIÓN 1: TELEMETRÍA, TABLERO & GARAJE */}
              <div className="mb-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 block mb-2 px-1">
                  1. Tablero & Telemetría
                </span>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLeftMenuOpen(false);
                      if (onOpenHojaDeVida) onOpenHojaDeVida();
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-racing font-bold bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 flex items-center justify-between transition"
                  >
                    <span className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span>{t('dashboard.logbook')}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsLeftMenuOpen(false);
                      if (onOpenOdometerModal) onOpenOdometerModal();
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-racing font-bold bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 flex items-center justify-between transition"
                  >
                    <span className="flex items-center gap-2.5">
                      <Gauge className="w-4 h-4 text-cyan-400" />
                      <span>{t('dashboard.adjustKm')}</span>
                    </span>
                    <span className="text-[10px] font-mono text-amber-400 font-bold">
                      {Number(odometer).toLocaleString()} km
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (telemetry.toggleSimulation) telemetry.toggleSimulation();
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-racing font-bold flex items-center justify-between border transition ${
                      telemetry.isSimulating
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-neutral-900 text-neutral-200 border-neutral-800 hover:bg-neutral-800'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      {telemetry.isSimulating ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-amber-400" />}
                      <span>{telemetry.isSimulating ? t('dashboard.pauseDemo') : t('dashboard.simulate')}</span>
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/40">
                      {telemetry.isSimulating ? 'ON' : 'OFF'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsLeftMenuOpen(false);
                      if (onOpenGarage) onOpenGarage();
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-racing font-bold bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 flex items-center justify-between transition"
                  >
                    <span className="flex items-center gap-2.5">
                      <Warehouse className="w-4 h-4 text-neutral-400" />
                      <span>{t('dashboard.garage')}</span>
                    </span>
                    <span className="text-[10px] bg-neutral-800 text-amber-400 px-2 py-0.5 rounded-full font-mono font-bold border border-neutral-700">
                      {garageCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsLeftMenuOpen(false);
                      setIsHardwareBridgeOpen(true);
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-racing font-bold flex items-center justify-between transition border ${
                      hojaDeVida.hardwareTelemetry
                        ? 'bg-emerald-950/75 hover:bg-emerald-900/75 border-emerald-500/50 text-emerald-300'
                        : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-200'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Bluetooth className={`w-4 h-4 ${hojaDeVida.hardwareTelemetry ? 'text-emerald-400' : 'text-amber-400'}`} />
                      <span>{hojaDeVida.hardwareTelemetry ? (isEn ? 'TFT Synced' : 'TFT Activo') : (isEn ? 'Connect TFT/OBD' : 'Vincular TFT / OBD')}</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {hojaDeVida.hardwareTelemetry?.batteryVoltage ? `${hojaDeVida.hardwareTelemetry.batteryVoltage}V` : 'TFT/OBD'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsLeftMenuOpen(false);
                      setIsCarPlayHudOpen(true);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-racing font-bold flex items-center justify-between transition border bg-amber-500/20 hover:bg-amber-500/30 border-amber-400/60 text-amber-200"
                  >
                    <span className="flex items-center gap-2.5">
                      <Monitor className="w-4 h-4 text-amber-400" />
                      <span>CarPlay HUD</span>
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500 text-black font-mono font-black">
                      3.6″•5″•7″
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setTftTheme((prev) =>
                        prev === 'street' ? 'track' : prev === 'track' ? 'stealth' : 'street'
                      )
                    }
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-racing font-bold flex items-center justify-between transition border bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-200"
                  >
                    <span className="flex items-center gap-2.5">
                      {tftTheme === 'track' ? (
                        <Flame className="w-4 h-4 text-rose-500" />
                      ) : tftTheme === 'stealth' ? (
                        <Moon className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Gauge className="w-4 h-4 text-amber-400" />
                      )}
                      <span>Carátula Tablero</span>
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-800 text-amber-300">
                      TFT: {tftTheme}
                    </span>
                  </button>
                </div>
              </div>

              {/* SECCIÓN 2: LEGAL, DOCUMENTOS & GARANTÍA */}
              <div className="mb-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 block mb-2 px-1">
                  2. Documentos, Retenes & Garantía
                </span>
                <div className="space-y-1.5">
                  {warrantyState.isEnabled && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsLeftMenuOpen(false);
                        handleOpenWarrantyRules(warrantyState.nextRev?.numero);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl text-xs font-racing font-bold bg-blue-950/60 hover:bg-blue-900/60 border border-blue-500/40 text-blue-300 flex items-center justify-between transition"
                    >
                      <span className="flex items-center gap-2.5">
                        <Shield className="w-4 h-4 text-cyan-400" />
                        <span>{isEn ? 'Factory Warranty' : 'Garantía Oficial'}</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-cyan-300">
                        {warrantyState.nextRev ? `${warrantyState.nextRev.numero}ª Rev.` : '100%'}
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsLeftMenuOpen(false);
                      handleOpenFinesModal('multas');
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-racing font-bold flex items-center justify-between transition border ${
                      finesRadarState.tieneMultas
                        ? 'bg-red-950/80 hover:bg-red-900 border-red-500/60 text-red-300 animate-pulse'
                        : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-200'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Radar className={`w-4 h-4 ${finesRadarState.tieneMultas ? 'text-red-400' : 'text-emerald-400'}`} />
                      <span>{finesRadarState.portal.entidadCorta}</span>
                    </span>
                    <span className={`text-[10px] font-mono font-bold ${finesRadarState.tieneMultas ? 'text-red-300' : 'text-emerald-400'}`}>
                      {finesRadarState.tieneMultas
                        ? `${finesRadarState.totalMultas} ${isEn ? 'Ticket' : 'Multa'}`
                        : (isEn ? 'Clear' : 'Al Día')}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsLeftMenuOpen(false);
                      setIsGloveboxOpen(true);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-racing font-bold flex items-center justify-between transition border bg-emerald-950/70 hover:bg-emerald-900/70 border-emerald-500/50 text-emerald-300"
                  >
                    <span className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>{isEn ? 'My Documents' : 'Mis Documentos'}</span>
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      PIN 2 LADOS
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsLeftMenuOpen(false);
                      setIsLawyerModalOpen(true);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-racing font-bold flex items-center justify-between transition border bg-indigo-950/80 hover:bg-indigo-900/80 border-indigo-500/50 text-indigo-300"
                  >
                    <span className="flex items-center gap-2.5">
                      <Scale className="w-4 h-4 text-amber-400" />
                      <span>{isEn ? 'AI Traffic Lawyer' : 'Abogado IA'}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
                  </button>
                </div>
              </div>

              {/* SECCIÓN 3: MECÁNICA IA, COMUNIDAD & COMERCIO */}
              <div className="mb-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 block mb-2 px-1">
                  3. Mecánica IA, Comunidad & Mall
                </span>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLeftMenuOpen(false);
                      setIsDoctorModalOpen(true);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-racing font-bold flex items-center justify-between transition border bg-teal-950/80 hover:bg-teal-900/80 border-teal-500/50 text-teal-300"
                  >
                    <span className="flex items-center gap-2.5">
                      <Wrench className="w-4 h-4 text-cyan-400" />
                      <span>{isEn ? 'Doctor AI' : 'Doctor IA'}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-teal-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsLeftMenuOpen(false);
                      setIsSosModalOpen(true);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-racing font-bold flex items-center justify-between transition border bg-red-950/90 hover:bg-red-900 border-red-500/60 text-red-200"
                  >
                    <span className="flex items-center gap-2.5">
                      <HeartPulse className="w-4 h-4 text-red-400 animate-pulse" />
                      <span>SOS Emergencia & Grúa 24/7</span>
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-500/30 text-white font-bold">
                      GPS
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsLeftMenuOpen(false);
                      setIsAlertsModalOpen(true);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-racing font-bold flex items-center justify-between transition border bg-rose-950/70 hover:bg-rose-900/70 border-rose-500/50 text-rose-300"
                  >
                    <span className="flex items-center gap-2.5">
                      <Bell className="w-4 h-4 text-rose-400" />
                      <span>{isEn ? 'Alerts Center' : 'Alertas'}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-rose-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsLeftMenuOpen(false);
                      setIsCommunityOpen(true);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-racing font-bold flex items-center justify-between transition border bg-amber-950/60 hover:bg-amber-900/60 border-amber-500/40 text-amber-300"
                  >
                    <span className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-amber-400" />
                      <span>{isEn ? 'Community & Clans' : 'Comunidad & Clanes'}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsLeftMenuOpen(false);
                      setMotoMallCompId(null);
                      setMotoMallInitialTab('home');
                      setIsMotoMallOpen(true);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-racing font-bold flex items-center justify-between transition border bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500/50 text-emerald-300"
                  >
                    <span className="flex items-center gap-2.5">
                      <Store className="w-4 h-4 text-amber-400" />
                      <span>MotoMall Oficial</span>
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      B2B2C
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsLeftMenuOpen(false);
                      setIsMarketplaceOpen(true);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-racing font-bold flex items-center justify-between transition border bg-cyan-950/60 hover:bg-cyan-900/60 border-cyan-500/40 text-cyan-300"
                  >
                    <span className="flex items-center gap-2.5">
                      <Award className="w-4 h-4 text-cyan-400" />
                      <span>{isEn ? 'Sell Bike' : 'Poner en Venta'}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* PIE DEL MENÚ LATERAL: AJUSTES & PANEL FUNDADOR / PRO */}
            <div className="pt-3 border-t border-neutral-800 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsLeftMenuOpen(false);
                  if (onOpenSettings) onOpenSettings();
                }}
                className="w-full px-3 py-2.5 rounded-xl text-xs font-racing font-bold bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 flex items-center justify-between transition"
              >
                <span className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 text-neutral-400" />
                  <span>{isEn ? 'Global Settings' : 'Ajustes Globales'}</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
              </button>

              {isVip ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsLeftMenuOpen(false);
                    setIsFounderAdminOpen(true);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl text-xs font-racing font-bold bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:opacity-95 text-black flex items-center justify-center gap-2 shadow-md shadow-amber-500/30 border border-yellow-300/40 cursor-pointer transition"
                >
                  <Crown className="w-4 h-4 fill-black" />
                  <span>👑 Panel Fundador</span>
                </button>
              ) : !isProOrGarage ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsLeftMenuOpen(false);
                    if (onOpenPaywall) onOpenPaywall();
                  }}
                  className="w-full px-3 py-2.5 rounded-xl text-xs font-racing font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:opacity-90 flex items-center justify-center gap-2 shadow-md transition"
                >
                  <Crown className="w-4 h-4" />
                  <span>Activar Plan Pro</span>
                </button>
              ) : null}
            </div>
          </aside>
        </div>
      )}

      {/* Barra Superior Cockpit (Limpia y con Botón Desplegable a la Izquierda) */}
      <header className="border-b border-neutral-800/80 bg-neutral-900/60 backdrop-blur-xl px-4 sm:px-8 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Botón Desplegable Izquierdo + Identidad de la Moto */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsLeftMenuOpen(true)}
              className="px-3 py-2.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border-2 border-amber-500/60 hover:border-amber-400 text-amber-400 flex items-center gap-2 shadow-lg shadow-amber-500/10 transition active:scale-95 cursor-pointer"
              title="Abrir Menú Lateral Izquierdo con Todos los Botones"
            >
              <Menu className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-racing font-black uppercase tracking-wider text-white hidden sm:inline">
                {isEn ? 'Menu' : 'Menú'}
              </span>
            </button>

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

          {/* Controles Rápidos Esenciales en el Header (Todo lo demás está en el Menú Izquierdo Desplegable) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
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
              <span className="hidden sm:inline">{telemetry.isSimulating ? t('dashboard.pauseDemo') : t('dashboard.simulate')}</span>
            </button>

            {/* Pill SOS Emergencia Rápida */}
            <button
              type="button"
              onClick={() => setIsSosModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-racing font-bold flex items-center gap-1.5 transition shadow-sm border bg-red-950/90 hover:bg-red-900 border-red-500/60 text-red-200"
              title="SOS Emergencia: Ficha Médica para Paramédicos, Grúa 24/7 y Alerta GPS al Clan"
            >
              <HeartPulse className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span>SOS</span>
            </button>

            {/* Suscripción Pro / VIP */}
            {isVip ? (
              <button
                type="button"
                onClick={() => setIsFounderAdminOpen(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-racing font-bold bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:opacity-95 text-black flex items-center gap-1.5 shadow-md shadow-amber-500/30 border border-yellow-300/40 cursor-pointer transition"
                title="Abrir Panel Maestro Fundador VIP"
              >
                <Crown className="w-3.5 h-3.5 fill-black" />
                <span className="hidden sm:inline">👑 Panel Fundador</span>
              </button>
            ) : isProOrGarage ? (
              <div
                className="px-3 py-1.5 rounded-xl text-xs font-racing font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 select-none cursor-default"
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

      {/* Banner Oficial del Megáfono del Fundador (cuando está activo en el Panel Fundador) */}
      {appGovernance?.announcementActive && appGovernance?.announcementText && (
        <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black px-4 py-2 text-xs font-racing font-black uppercase tracking-wide text-center shadow-md flex items-center justify-center gap-2">
          <span>📢 {appGovernance.announcementText}</span>
        </div>
      )}

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
            gear={effectiveGear}
            unit={displayUnit}
            isGpsActive={telemetry.isGpsActive}
            isSimulating={telemetry.isSimulating}
          />

          <RpmWidget 
            currentRpm={effectiveRpm}
            maxRpm={telemetrySpecs.maxRpm}
            redlineRpm={telemetrySpecs.redlineRpm}
          />

          {/* Fila 2: Cronómetro 0-100 & Radar de Ruta */}
          <SprintTimerWidget 
            speed={rawSpeedKmh}
          />

          <RouteWidget 
            speed={rawSpeedKmh}
            heading={telemetry.heading || 0}
            isSimulating={telemetry.isSimulating}
            tripDistanceKm={effectiveTripKm}
            tripSeconds={telemetry.tripSeconds}
            avgSpeed={effectiveAvgSpeed}
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
            hardwareTelemetry={hojaDeVida.hardwareTelemetry || null}
            bike={effectiveBike}
            hojaDeVida={hojaDeVida}
            userProfile={userProfile}
            onOpenOdometerModal={onOpenOdometerModal}
            onOpenHardwareBridgeModal={() => setIsHardwareBridgeOpen(true)}
          />

          {/* Fila 5: Mantenimiento Preventivo con Componentes Editables Individualmente */}
          <div className="lg:col-span-2">
            <MaintenanceWidget 
              currentOdometer={odometer}
              customComponents={customComponents}
              hardwareTelemetry={hojaDeVida.hardwareTelemetry || null}
              ridingCondition={ridingCondition}
              onChangeRidingCondition={onChangeRidingCondition}
              onOpenOdometerModal={onOpenOdometerModal}
              onOpenEditComponentModal={onOpenEditComponentModal}
              onOpenHardwareBridgeModal={() => setIsHardwareBridgeOpen(true)}
              onOpenMotoMall={(compId) => {
                setMotoMallCompId(compId);
                setMotoMallInitialTab('catalog');
                setIsMotoMallOpen(true);
              }}
            />
          </div>
        </div>
      </main>

      {/* Footer Minimalista con Enlaces Legales */}
      <footer className="border-t border-neutral-900 py-4 px-6 pb-20 sm:pb-5 text-center text-xs text-neutral-600 font-mono flex flex-col sm:flex-row items-center justify-between max-w-7xl w-full mx-auto gap-2">
        <div>
          {t('dashboard.footer')} • <a href="https://motodashai.com" target="_blank" rel="noreferrer" className="text-neutral-500 hover:text-neutral-400">motodashai.com</a>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <button
            type="button"
            onClick={() => onOpenLegal && onOpenLegal('privacy')}
            className="text-neutral-500 hover:text-amber-400 underline underline-offset-4 transition"
          >
            {isEn ? 'Privacy Policy (Habeas Data)' : 'Política de Privacidad (Habeas Data)'}
          </button>
          <button
            type="button"
            onClick={() => onOpenLegal && onOpenLegal('terms')}
            className="text-neutral-500 hover:text-amber-400 underline underline-offset-4 transition"
          >
            {isEn ? 'Terms & Conditions' : 'Términos y Condiciones'}
          </button>
        </div>
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
        telemetry={telemetry}
        userProfile={userProfile}
        onSyncOdometer={(km, source, fullTelemetry) => {
          if (onSyncHardwareOdometer) {
            onSyncHardwareOdometer(km, source, fullTelemetry);
          }
        }}
        onOpenPaywall={onOpenPaywall}
      />

      {/* MODAL GUANTERA DIGITAL PARA RETENES + EXTRACCIÓN IA (GEMINI VISION) */}
      <DigitalGloveboxModal
        isOpen={isGloveboxOpen}
        onClose={() => setIsGloveboxOpen(false)}
        bike={effectiveBike}
        hojaDeVida={hojaDeVida}
        userProfile={userProfile}
        onUpdateHojaDeVida={onUpdateHojaDeVida}
        onOpenLawyer={() => {
          setIsGloveboxOpen(false);
          setIsLawyerModalOpen(true);
        }}
      />

      {/* MODAL ASESOR JURÍDICO VIAL IA (ABOGADO DE TRÁNSITO POR PAÍS) */}
      <TrafficLawyerModal
        isOpen={isLawyerModalOpen}
        onClose={() => setIsLawyerModalOpen(false)}
        bike={effectiveBike}
        hojaDeVida={hojaDeVida}
        userProfile={userProfile}
        onUpdateHojaDeVida={onUpdateHojaDeVida}
      />

      {/* MODAL CENTRO DE ALERTAS INDEPENDIENTE (PUSH/WHATSAPP 30-15-5D + RADAR RETENES) */}
      <AlertsCenterModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        bike={effectiveBike}
        hojaDeVida={hojaDeVida}
        userProfile={userProfile}
      />

      {/* MODAL COMUNIDAD Y CHAT EN TIEMPO REAL (SUPABASE REALTIME) */}
      <CommunityChatModal
        isOpen={isCommunityOpen}
        onClose={() => setIsCommunityOpen(false)}
        bike={effectiveBike}
        userProfile={userProfile}
      />

      {/* MODAL COMPRA/VENTA CON HISTORIAL CERTIFICADO */}
      <CertifiedMarketplaceModal
        isOpen={isMarketplaceOpen}
        onClose={() => setIsMarketplaceOpen(false)}
        bike={effectiveBike}
        hojaDeVida={hojaDeVida}
        odometer={odometer}
        userProfile={userProfile}
        onOpenHojaDeVida={onOpenHojaDeVida}
        onUpdateHojaDeVida={onUpdateHojaDeVida}
      />

      {/* MODAL SOS EMERGENCIA MÉDICA PARA PARAMÉDICOS, GRÚA Y ALERTA GPS AL CLAN */}
      <SosEmergencyModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        bike={effectiveBike}
        hojaDeVida={hojaDeVida}
        userProfile={userProfile}
        onUpdateHojaDeVida={onUpdateHojaDeVida}
        onOpenClanChat={() => {
          setIsSosModalOpen(false);
          setIsCommunityOpen(true);
        }}
      />

      {/* MODAL DOCTOR MOTOR IA (DIAGNÓSTICO MECÁNICO POR SONIDO O SÍNTOMA) */}
      <DoctorMotorModal
        isOpen={isDoctorModalOpen}
        onClose={() => setIsDoctorModalOpen(false)}
        bike={effectiveBike}
        odometer={odometer}
      />

      {/* MODAL CARPLAY / ANDROID AUTO MULTI-TAMAÑO (3.6", 5.0", 7.0" + ALTO CONTRASTE SOLAR) */}
      <CarPlayHudModal
        isOpen={isCarPlayHudOpen}
        onClose={() => setIsCarPlayHudOpen(false)}
        bike={effectiveBike}
        telemetry={telemetry}
        odometer={odometer}
        hojaDeVida={hojaDeVida}
        displayUnit={displayUnit}
        onOpenGlovebox={() => setIsGloveboxOpen(true)}
        onOpenLawyer={() => setIsLawyerModalOpen(true)}
        onOpenSos={() => setIsSosModalOpen(true)}
        onOpenDoctor={() => setIsDoctorModalOpen(true)}
        onOpenCommunity={() => setIsCommunityOpen(true)}
        onOpenHardwareBridge={() => setIsHardwareBridgeOpen(true)}
      />

      {/* MODAL MOTOMALL OFICIAL B2B2C: TIENDAS DE REPUESTOS, CONCESIONARIOS Y PORTAL EMPRESAS */}
      <MotoMallModal
        isOpen={isMotoMallOpen}
        onClose={() => setIsMotoMallOpen(false)}
        bike={effectiveBike}
        userProfile={userProfile}
        initialComponentId={motoMallCompId}
        initialTab={motoMallInitialTab}
      />

      {/* PANEL MAESTRO EXCLUSIVO FUNDADOR VIP: INFLUENCERS, CÓDIGOS, PORCENTAJES Y SUSCRIPCIONES */}
      <FounderAdminModal
        isOpen={isFounderAdminOpen}
        onClose={() => setIsFounderAdminOpen(false)}
        userProfile={userProfile}
        onGovernanceChange={(nextGov) => setAppGovernance(nextGov)}
      />

      {/* DOCK INFERIOR FIJO PARA CELULAR Y SOPORTE DE MANUBRIO (CON GUANTES) */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-neutral-950/95 backdrop-blur-xl border-t border-neutral-800 px-2 py-1.5 grid grid-cols-5 gap-1">
        <button
          type="button"
          onClick={() => setIsGloveboxOpen(true)}
          className="flex flex-col items-center justify-center py-1 rounded-xl text-emerald-400 hover:bg-neutral-900"
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[10px] font-racing font-bold uppercase mt-0.5">
            {isEn ? 'Docs' : 'Retén'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setIsLawyerModalOpen(true)}
          className="flex flex-col items-center justify-center py-1 rounded-xl text-indigo-400 hover:bg-neutral-900"
        >
          <Scale className="w-5 h-5" />
          <span className="text-[10px] font-racing font-bold uppercase mt-0.5">
            {isEn ? 'Lawyer' : 'Abogado'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setIsSosModalOpen(true)}
          className="flex flex-col items-center justify-center py-1 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400"
        >
          <HeartPulse className="w-5 h-5 animate-pulse" />
          <span className="text-[10px] font-racing font-black uppercase mt-0.5">
            SOS
          </span>
        </button>

        <button
          type="button"
          onClick={() => setIsDoctorModalOpen(true)}
          className="flex flex-col items-center justify-center py-1 rounded-xl text-cyan-400 hover:bg-neutral-900"
        >
          <Wrench className="w-5 h-5" />
          <span className="text-[10px] font-racing font-bold uppercase mt-0.5">
            {isEn ? 'Doctor' : 'Taller IA'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setIsCommunityOpen(true)}
          className="flex flex-col items-center justify-center py-1 rounded-xl text-amber-400 hover:bg-neutral-900"
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-racing font-bold uppercase mt-0.5">
            {isEn ? 'Clans' : 'Clanes'}
          </span>
        </button>
      </nav>
    </div>
  );
}
