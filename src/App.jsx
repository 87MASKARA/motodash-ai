import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Plus, ArrowLeft } from 'lucide-react';
import AppLogo from './components/Common/AppLogo';
import LanguageSwitcher from './components/Common/LanguageSwitcher';
import { BrandLogo } from './components/Common/BrandLogos';
import { useLanguage } from './i18n/LanguageContext';
import LandingPage from './components/Landing/LandingPage';
import VideoIntroSplash from './components/Landing/VideoIntroSplash';
import OnboardingWizard from './components/Onboarding/OnboardingWizard';
import DynamicDashboard from './components/Dashboard/DynamicDashboard';
import GarageDrawer from './components/Garage/GarageDrawer';
import PaywallModal from './components/Subscription/PaywallModal';
import OdometerModal from './components/Modals/OdometerModal';
import HojaDeVidaModal from './components/HojaDeVida/HojaDeVidaModal';
import EditComponentModal from './components/Modals/EditComponentModal';
import SettingsModal from './components/Modals/SettingsModal';
import LoginModal, { isFounderVipEmail } from './components/Auth/LoginModal';
import ProfileModal from './components/Profile/ProfileModal';
import CertifiedMarketplaceModal from './components/Modals/CertifiedMarketplaceModal';
import LegalTermsModal from './components/Modals/LegalTermsModal';
import MotoMallModal from './components/Modals/MotoMallModal';
import { useDeviceGps } from './hooks/useDeviceGps';
import { COMPONENTES_DESGASTE_OFICIALES } from './services/maintenanceCatalog';
import { DEMO_GARAGE, DEMO_PREVIEW_IDS } from './services/demoGarage';
import { sanitizeHexColor, computeAccentGlow } from './services/aiGenerator';
import { loadPilotGarage, savePilotGarage, subscribeToGarageChanges, supabase } from './services/supabaseClient';

function isValidBike(bike) {
  return Boolean(
    bike &&
    typeof bike.id === "string" &&
    bike.config &&
    bike.config.bikeIdentity &&
    bike.config.telemetrySpecs
  );
}

function loadSavedCustomComponentsMap() {
  try {
    const raw = localStorage.getItem("motodash_custom_components_by_bike");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCustomComponentsForBike(bikeId, customComponents) {
  if (!bikeId || !customComponents || typeof customComponents !== "object") return;
  try {
    const map = loadSavedCustomComponentsMap();
    map[bikeId] = customComponents;
    localStorage.setItem("motodash_custom_components_by_bike", JSON.stringify(map));
  } catch {}
}

function sanitizeBikeEntry(bike) {
  if (!isValidBike(bike)) return null;
  const safeHex = sanitizeHexColor(bike.config.bikeIdentity.colorHex, "#FF6600");
  const rawOdo = Math.max(0, Math.min(2000000, Number(bike.odometer) || 0));
  const prevHw = bike?.hojaDeVida?.hardwareTelemetry || {};

  const needsTftCalibration =
    !bike.isDemo &&
    (rawOdo === 5212 ||
      (rawOdo >= 5000 && rawOdo < 5427.7 && (prevHw.topSpeedRecorded === 134 || prevHw.fuelLevelPercent === 100)));

  const calibratedOdo = needsTftCalibration ? 5427.7 : Number(rawOdo.toFixed(1));
  const tankCap = Number(bike?.config?.telemetrySpecs?.tankCapacityLiters) || 12;
  const nextHoja = bike.hojaDeVida ? { ...bike.hojaDeVida } : {};
  const savedComponentsMap = loadSavedCustomComponentsMap();
  const bikeId = String(bike.id).slice(0, 60);
  const mergedCustomComponents = {
    ...(savedComponentsMap[bikeId] || {}),
    ...(bike.customComponents && typeof bike.customComponents === "object" ? bike.customComponents : {})
  };

  if (needsTftCalibration || prevHw.topSpeedRecorded === 134) {
    const kml = Number(prevHw.realKmPerLiter) || 36.0;
    const fuelPct = needsTftCalibration ? 50 : (prevHw.fuelLevelPercent ?? 50);
    const litersLeft = Number(((tankCap * fuelPct) / 100).toFixed(1));
    nextHoja.hardwareTelemetry = {
      ...prevHw,
      odometerKm: calibratedOdo,
      fuelBars: 3,
      fuelLevelPercent: fuelPct,
      fuelLitersRemaining: litersLeft,
      estimatedRangeKm: Math.round(litersLeft * kml),
      realKmPerLiter: kml,
      rideMode: prevHw.rideMode || "SPORT",
      tempBars: 3,
      engineTempC: 85,
      rpmIdle: 1800,
      topSpeedRecorded: 112,
      avgSpeed: 33
    };
  }

  return {
    ...bike,
    id: bikeId,
    odometer: calibratedOdo,
    hojaDeVida: nextHoja,
    customComponents: mergedCustomComponents,
    config: {
      ...bike.config,
      bikeIdentity: {
        ...bike.config.bikeIdentity,
        brand: String(bike.config.bikeIdentity.brand || "YAMAHA").slice(0, 40),
        model: String(bike.config.bikeIdentity.model || "MT-09").slice(0, 60),
        year: Math.min(2030, Math.max(1950, Number(bike.config.bikeIdentity.year) || 2025)),
        colorHex: safeHex,
        accentGlow: computeAccentGlow(safeHex)
      }
    }
  };
}

function mergeRemoteWithLocalGarage(remoteBikes = [], localBikes = []) {
  const localById = new Map((Array.isArray(localBikes) ? localBikes : []).map((b) => [b.id, b]));
  const savedComponentsMap = loadSavedCustomComponentsMap();

  return remoteBikes.map((remoteBike) => {
    const localBike = localById.get(remoteBike.id);
    const backupCustom = savedComponentsMap[remoteBike.id] || {};
    const localCustom = localBike?.customComponents || {};
    const remoteCustom = remoteBike?.customComponents || {};

    // Combinar cada componente priorizando el que fue calibrado más recientemente (updatedAt) o el local
    const allCompKeys = new Set([
      ...Object.keys(backupCustom),
      ...Object.keys(remoteCustom),
      ...Object.keys(localCustom)
    ]);
    const mergedCustom = {};
    allCompKeys.forEach((key) => {
      const rComp = remoteCustom[key];
      const lComp = localCustom[key] || backupCustom[key];
      if (rComp && lComp) {
        mergedCustom[key] = (Number(lComp.updatedAt) || 0) >= (Number(rComp.updatedAt) || 0) ? lComp : rComp;
      } else {
        mergedCustom[key] = lComp || rComp;
      }
    });

    const localHw = localBike?.hojaDeVida?.hardwareTelemetry;
    const remoteHw = remoteBike?.hojaDeVida?.hardwareTelemetry;
    const localHwTime = localHw?.updatedAt ? new Date(localHw.updatedAt).getTime() : 0;
    const remoteHwTime = remoteHw?.updatedAt ? new Date(remoteHw.updatedAt).getTime() : 0;
    const preferLocalHw = localHw && localHwTime >= remoteHwTime;

    const mergedOdometer = preferLocalHw && Number(localBike?.odometer) > 0
      ? Number(localBike.odometer)
      : Math.max(Number(remoteBike.odometer) || 0, Number(localBike?.odometer) || 0);

    return sanitizeBikeEntry({
      ...remoteBike,
      odometer: mergedOdometer,
      customComponents: mergedCustom,
      hojaDeVida: {
        ...(remoteBike.hojaDeVida || {}),
        ...(preferLocalHw ? { hardwareTelemetry: localHw } : {})
      }
    });
  }).filter(Boolean);
}

export default function App() {
  const { t } = useLanguage();
  const [showIntroSplash, setShowIntroSplash] = useState(true);
  const [currentView, setCurrentView] = useState(() => {
    const savedView = localStorage.getItem("motodash_active_view");
    return savedView === "cockpit" ? "cockpit" : "landing";
  });

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [onboardingInitialPlan, setOnboardingInitialPlan] = useState('pro_monthly');

  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem("motodash_user_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && isFounderVipEmail(parsed.email)) {
          return {
            ...parsed,
            plan: 'founder_vip',
            isPro: true,
            isLifetimeVip: true
          };
        }
        return parsed;
      } catch (e) {}
    }
    return null;
  });

  const createCleanDemoBikes = () => {
    const savedComponentsMap = loadSavedCustomComponentsMap();
    let savedDemoList = null;
    try {
      const rawDemo = localStorage.getItem("motodash_demo_garage");
      if (rawDemo) {
        const parsed = JSON.parse(rawDemo);
        if (Array.isArray(parsed) && parsed.length > 0) savedDemoList = parsed;
      }
    } catch {}

    return DEMO_GARAGE.map((b) => {
      const savedDemoBike = savedDemoList?.find((d) => d.id === b.id);
      const baseCustom = b.customComponents ? JSON.parse(JSON.stringify(b.customComponents)) : {};
      const savedCustom = savedDemoBike?.customComponents || {};
      const mapCustom = savedComponentsMap[b.id] || {};
      return {
        ...b,
        ...(savedDemoBike ? { odometer: savedDemoBike.odometer ?? b.odometer } : {}),
        isDemo: true,
        hojaDeVida: savedDemoBike?.hojaDeVida
          ? JSON.parse(JSON.stringify(savedDemoBike.hojaDeVida))
          : (b.hojaDeVida ? JSON.parse(JSON.stringify(b.hojaDeVida)) : {}),
        customComponents: {
          ...baseCustom,
          ...savedCustom,
          ...mapCustom
        }
      };
    });
  };

  // Garaje protegido: en modo demo carga DEMO_GARAGE neutro. Si hay perfil activo, carga sus motos guardadas y sincroniza con Supabase
  const [garage, setGarage] = useState(() => {
    const saved = localStorage.getItem("motodash_garage");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const validBikes = Array.isArray(parsed)
          ? parsed.map(sanitizeBikeEntry).filter(Boolean)
          : [];
        if (validBikes.length > 0) {
          return validBikes;
        }
      } catch (e) {
        console.error("Error cargando garaje de localStorage:", e);
      }
    }
    return [];
  });

  const [isDemoSession, setIsDemoSession] = useState(() => {
    try {
      const savedProfile = localStorage.getItem("motodash_user_profile");
      if (!savedProfile) return true;
      const parsed = JSON.parse(savedProfile);
      if (!parsed?.email || parsed?.email === "demo@motodash.com") return true;
      return localStorage.getItem("motodash_demo_session") === "true";
    } catch {
      return true;
    }
  });
  const [demoBikes, setDemoBikes] = useState(() => createCleanDemoBikes());
  const [demoBikeId, setDemoBikeId] = useState(DEMO_GARAGE[0].id);

  const [activeBikeId, setActiveBikeId] = useState(() => {
    const savedId = localStorage.getItem("motodash_active_bike_id");
    return savedId || "";
  });

  // Modales
  const [isGarageOpen, setIsGarageOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isOdometerModalOpen, setIsOdometerModalOpen] = useState(false);
  const [initialComponentKey, setInitialComponentKey] = useState(null);
  const [isHojaDeVidaOpen, setIsHojaDeVidaOpen] = useState(false);
  const [isEditComponentModalOpen, setIsEditComponentModalOpen] = useState(false);
  const [selectedComponentToEdit, setSelectedComponentToEdit] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState('privacy');
  const [isGlobalMallOpen, setIsGlobalMallOpen] = useState(false);
  const [globalMallTab, setGlobalMallTab] = useState('catalog');

  const handleOpenLegal = (tab = 'privacy') => {
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  };

  const handleOpenGlobalMall = (tab = 'catalog') => {
    setGlobalMallTab(tab);
    setIsGlobalMallOpen(true);
  };

  // Ajustes Globales
  const [globalSettings, setGlobalSettings] = useState(() => {
    const saved = localStorage.getItem("motodash_settings");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return { unitSystem: 'metric', currency: 'COP', soundEnabled: true, wakeLockEnabled: true };
  });

  const activeIsDemo = Boolean(
    isDemoSession ||
    !userProfile?.id ||
    !userProfile?.email ||
    userProfile?.email === "demo@motodash.com"
  );

  // Moto activa: estrictamente aislada entre Bóveda Demo neutra y Garaje Privado real
  const activeBike = activeIsDemo
    ? (demoBikes.find((b) => b.id === demoBikeId) || demoBikes[0])
    : (
        garage.find((b) => b?.id === activeBikeId && isValidBike(b)) ||
        garage.find(isValidBike) ||
        demoBikes[0]
      );

  const activeOdometer = typeof activeBike?.odometer === "number" ? activeBike.odometer : 0;

  // Telemetría sincronizada: en cuenta real usa GPS + Sensores Reales por defecto; en Demo inicia simulación
  const telemetry = useDeviceGps({
    maxRpm: activeBike?.config?.telemetrySpecs?.maxRpm || 11500,
    redlineRpm: activeBike?.config?.telemetrySpecs?.redlineRpm || 10500,
    autoStart: currentView === "cockpit" && activeIsDemo,
    onRealDistanceMilestone: (addedKm, snap) => {
      if (activeIsDemo || !addedKm || addedKm <= 0) return;
      setGarage((prev) =>
        prev.map((bike) => {
          if (bike.id !== activeBike?.id) return bike;
          const nextOdo = Math.round((Number(bike.odometer) || 0) + addedKm);
          const currentHoja = bike.hojaDeVida || {};
          const prevHw = currentHoja.hardwareTelemetry || {};
          const tankCap = Number(bike?.config?.telemetrySpecs?.tankCapacityLiters) || 12;
          const kml = Number(prevHw.realKmPerLiter) || 40.5;
          const prevFuel = Number(prevHw.fuelLevelPercent ?? 82);
          const burnedPct = ((addedKm / kml) / tankCap) * 100;
          const nextFuel = Math.max(5, Math.round(prevFuel - burnedPct));
          const nextLiters = Number(((tankCap * nextFuel) / 100).toFixed(1));

          return {
            ...bike,
            odometer: nextOdo,
            hojaDeVida: {
              ...currentHoja,
              hardwareTelemetry: {
                ...prevHw,
                odometerKm: nextOdo,
                fuelLevelPercent: nextFuel,
                fuelLitersRemaining: nextLiters,
                estimatedRangeKm: Math.round(nextLiters * kml),
                tripAKm: Number(((Number(prevHw.tripAKm) || 0) + addedKm).toFixed(1)),
                topSpeedRecorded: Math.max(Number(prevHw.topSpeedRecorded) || 0, Number(snap?.speed) || 0),
                syncedAt: new Date().toISOString(),
                sourceName: prevHw.sourceName || 'Telemetría GPS + Hardware en Vivo'
              }
            }
          };
        })
      );
    }
  });

  // Guardar persistencia
  useEffect(() => {
    localStorage.setItem("motodash_active_view", currentView);
  }, [currentView]);

  useEffect(() => {
    localStorage.setItem("motodash_demo_session", isDemoSession ? "true" : "false");
  }, [isDemoSession]);

  useEffect(() => {
    if (Array.isArray(garage) && garage.length > 0) {
      localStorage.setItem("motodash_garage", JSON.stringify(garage));
    }
  }, [garage]);

  useEffect(() => {
    if (Array.isArray(demoBikes) && demoBikes.length > 0) {
      try {
        localStorage.setItem("motodash_demo_garage", JSON.stringify(demoBikes));
      } catch {}
    }
  }, [demoBikes]);

  useEffect(() => {
    if (!activeIsDemo && activeBikeId) {
      localStorage.setItem("motodash_active_bike_id", activeBikeId);
    }
  }, [activeBikeId, activeIsDemo]);

  useEffect(() => {
    if (userProfile) {
      localStorage.setItem("motodash_user_profile", JSON.stringify(userProfile));
    } else {
      localStorage.removeItem("motodash_user_profile");
    }
  }, [userProfile]);

  // Detectar enlace de recuperación de contraseña de Supabase Auth
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setShowIntroSplash(false);
        setIsLoginModalOpen(true);
      }
    });
    return () => subscription?.unsubscribe();
  }, []);

  // Bandera de sincronización: impide que el estado inicial local sobreescriba Supabase por accidente
  const hasLoadedRemoteRef = useRef(false);

  // 1. Cargar garaje y perfil desde Supabase en la nube (Sincronización PC <-> Celular bajo RLS auth.uid())
  useEffect(() => {
    const effectiveUserId = userProfile?.id || null;

    // Verificar sesión autenticada activa en Supabase Auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && session.user.id !== userProfile?.id) {
        const isVip = isFounderVipEmail(session.user.email);
        setUserProfile((prev) => ({
          ...(prev || {}),
          id: session.user.id,
          email: session.user.email,
          fullName: prev?.fullName || session.user.user_metadata?.full_name || (isVip ? 'Anderson • Fundador VIP' : 'Piloto'),
          plan: isVip ? 'founder_vip' : (prev?.plan || session.user.user_metadata?.plan || 'solo'),
          isPro: isVip || Boolean(prev?.isPro || session.user.user_metadata?.is_pro),
          isLifetimeVip: isVip
        }));
      }
    });

    if (!effectiveUserId) return;

    // Cargar garaje remoto del usuario autenticado desde Supabase fusionando calibraciones locales
    loadPilotGarage(effectiveUserId).then((remoteData) => {
      hasLoadedRemoteRef.current = true;
      if (remoteData && Array.isArray(remoteData.bikes) && remoteData.bikes.length > 0) {
        setGarage((prevLocal) => {
          const merged = mergeRemoteWithLocalGarage(remoteData.bikes, prevLocal);
          if (merged.length > 0) {
            try {
              localStorage.setItem("motodash_garage", JSON.stringify(merged));
            } catch {}
            return merged;
          }
          return prevLocal;
        });
        if (remoteData.activeBikeId && remoteData.bikes.some((b) => b.id === remoteData.activeBikeId)) {
          setActiveBikeId(remoteData.activeBikeId);
        }
      }
    });

    // Suscripción en tiempo real: cualquier cambio en PC se refleja en el celular al instante sin borrar calibraciones locales recientes
    const unsubscribe = subscribeToGarageChanges(effectiveUserId, (remoteData) => {
      if (remoteData && Array.isArray(remoteData.bikes) && remoteData.bikes.length > 0) {
        setGarage((prevLocal) => {
          const merged = mergeRemoteWithLocalGarage(remoteData.bikes, prevLocal);
          return merged.length > 0 ? merged : prevLocal;
        });
        if (remoteData.activeBikeId) {
          setActiveBikeId(remoteData.activeBikeId);
        }
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [userProfile?.id, userProfile?.email]);

  // 2. Guardar en Supabase en la nube con debounce para persistir automáticamente cualquier cambio
  useEffect(() => {
    const effectiveUserId = userProfile?.id || null;
    // IMPORTANTE: Solo guardar si el garaje remoto oficial ya fue cargado previamente (evita que demos o estado local desactualizado pisen la base de datos)
    if (!effectiveUserId || !hasLoadedRemoteRef.current || !Array.isArray(garage) || garage.length === 0) return;

    const timer = setTimeout(() => {
      savePilotGarage(effectiveUserId, garage, activeBikeId);
    }, 1500);

    return () => clearTimeout(timer);
  }, [garage, activeBikeId, userProfile?.id]);

  // Finalizar Onboarding y arrancar en Cockpit
  const handleCompleteOnboarding = (profile, newBike) => {
    hasLoadedRemoteRef.current = true;
    const cleanBike = sanitizeBikeEntry(newBike) || newBike;
    setUserProfile(profile);
    setIsDemoSession(false);
    setGarage((prev) => [cleanBike, ...prev]);
    setActiveBikeId(cleanBike.id);
    setIsOnboardingOpen(false);
    setCurrentView("cockpit");
    if (telemetry.startSimulation) telemetry.startSimulation();
  };

  // Abrir asistente para agregar o calibrar nueva moto (respetando cupo de membresía o ilimitado para VIP)
  const handleOpenAddBike = () => {
    setIsGarageOpen(false);
    const customBikesCount = garage.filter((b) => !b?.isDemo && !DEMO_PREVIEW_IDS.includes(b?.id)).length;
    const isVip = Boolean(
      userProfile?.plan === "founder_vip" || 
      userProfile?.isLifetimeVip || 
      isFounderVipEmail(userProfile?.email)
    );
    const maxAllowed = isVip
      ? 999
      : userProfile?.plan === "garage"
      ? 15
      : (userProfile?.plan === "pro_monthly" || userProfile?.isPro)
      ? 3
      : 1;

    // Solo si el usuario está registrado, NO es VIP y ya alcanzó o superó el cupo de motos de su plan
    if (userProfile && !isVip && customBikesCount >= maxAllowed) {
      setIsPaywallOpen(true);
      return;
    }

    setOnboardingInitialPlan(userProfile?.plan || "pro_monthly");
    setIsOnboardingOpen(true);
  };

  // Entrar al Demo en vivo desde Landing: activa simulación inmediatamente en caja de arena aislada
  const handleEnterDemo = (bikeId = "bike_tvs_apache160") => {
    const targetId = typeof bikeId === "string" ? bikeId : "bike_tvs_apache160";
    setDemoBikes(createCleanDemoBikes());
    setDemoBikeId(targetId);
    setIsDemoSession(true);
    setCurrentView("cockpit");
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (telemetry.startSimulation) {
      telemetry.startSimulation();
    }
  };

  const handleExitToLanding = () => {
    if (telemetry.stopSimulation) {
      telemetry.stopSimulation();
    }
    setCurrentView("landing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenOdometerModal = (compKey = null) => {
    setInitialComponentKey(typeof compKey === "string" ? compKey : null);
    setIsOdometerModalOpen(true);
  };

  const handleOpenEditComponentModal = (comp = null) => {
    setSelectedComponentToEdit(comp && typeof comp === "object" && comp.id ? comp : null);
    setIsEditComponentModalOpen(true);
  };

  // Persistencia garantizada tanto en Garaje Real (localStorage + Supabase) como en Modo Demo
  const updateActiveGarage = (updater) => {
    setDemoBikes((prevDemo) => {
      const nextDemo = updater(prevDemo);
      try {
        localStorage.setItem("motodash_demo_garage", JSON.stringify(nextDemo));
      } catch {}
      return nextDemo;
    });

    if (!activeIsDemo) {
      setGarage((prev) => {
        const baseList =
          Array.isArray(prev) && prev.some((b) => b.id === activeBike?.id)
            ? prev
            : activeBike
            ? [{ ...activeBike, isDemo: false }, ...(Array.isArray(prev) ? prev : [])]
            : prev;
        const nextGarage = updater(baseList);
        try {
          localStorage.setItem("motodash_garage", JSON.stringify(nextGarage));
        } catch {}
        if (userProfile?.id) {
          hasLoadedRemoteRef.current = true;
          savePilotGarage(userProfile.id, nextGarage, activeBikeId || activeBike?.id);
        }
        return nextGarage;
      });
    }
  };

  const handleSaveOdometer = (payload) => {
    const { km, recordType, date, serviceData, fuelData, scannedTelemetry } = payload;

    if (scannedTelemetry && telemetry?.isSimulating && typeof telemetry.stopSimulation === "function") {
      telemetry.stopSimulation();
    }

    updateActiveGarage((prev) =>
      prev.map((bike) => {
        if (bike.id !== activeBike.id) return bike;

        const prevOdometer = Number(bike.odometer) || 0;
        const updatedBike = { ...bike, odometer: km };
        let currentHoja = bike.hojaDeVida || { documentos: {}, servicios: [], tanqueos: [] };

        if (scannedTelemetry && typeof scannedTelemetry === "object") {
          currentHoja = {
            ...currentHoja,
            hardwareTelemetry: {
              ...(currentHoja.hardwareTelemetry || {}),
              ...scannedTelemetry,
              odometerKm: km,
              updatedAt: new Date().toISOString()
            }
          };
          updatedBike.hojaDeVida = currentHoja;
        }

        if (recordType === "fuel" && fuelData) {
          const liters = Math.max(0.1, Number(fuelData.liters) || 1);
          const gallons = Number((fuelData.gallons || (liters / 3.78541)).toFixed(2));
          const deltaKm = km > prevOdometer ? km - prevOdometer : 0;
          const computedKmPerL = deltaKm > 5 && deltaKm < 1200
            ? Math.min(65, Math.max(8, Number((deltaKm / liters).toFixed(1))))
            : null;
          const computedKmPerGal = computedKmPerL
            ? Math.round(computedKmPerL * 3.78541)
            : null;

          const newRefuel = {
            id: `fuel_${Date.now()}`,
            fecha: date,
            km,
            liters,
            gallons,
            unitUsed: fuelData.unitUsed || "gal",
            country: fuelData.country || currentHoja.country || "Colombia",
            cost: Math.max(0, Number(fuelData.cost) || 0),
            isFull: Boolean(fuelData.isFull),
            kmPerLiter: computedKmPerL,
            kmPerGalon: computedKmPerGal
          };

          const tankCap = Number(bike?.config?.telemetrySpecs?.tankCapacityLiters) || 12;
          const prevHw = currentHoja.hardwareTelemetry || {};
          const nextKml = computedKmPerL || prevHw.realKmPerLiter || 40.5;
          const nextFuelPct = fuelData.isFull ? 100 : (prevHw.fuelLevelPercent ?? 82);
          const nextLitersLeft = Number(((tankCap * nextFuelPct) / 100).toFixed(1));

          updatedBike.hojaDeVida = {
            ...currentHoja,
            country: fuelData.country || currentHoja.country || "Colombia",
            tanqueos: [newRefuel, ...(currentHoja.tanqueos || [])],
            hardwareTelemetry: {
              ...prevHw,
              odometerKm: km,
              fuelLevelPercent: nextFuelPct,
              fuelLitersRemaining: nextLitersLeft,
              realKmPerLiter: nextKml,
              estimatedRangeKm: Math.round(nextLitersLeft * nextKml)
            }
          };
        }

        if (recordType === "service" && serviceData) {
          const newService = {
            id: `srv_${Date.now()}`,
            fecha: date,
            km: km,
            servicio: serviceData.service,
            marcaRepuesto: serviceData.sparePartBrand,
            taller: serviceData.workshop,
            costo: serviceData.cost,
            notas: serviceData.notes
          };

          updatedBike.hojaDeVida = {
            ...currentHoja,
            servicios: [newService, ...(currentHoja.servicios || [])]
          };

          // Reiniciar ciclo de vida del componente cambiado
          if (serviceData.componentKey) {
            const currentCustom = bike.customComponents || {};
            const baseComp = currentCustom[serviceData.componentKey] || COMPONENTES_DESGASTE_OFICIALES[serviceData.componentKey] || {};
            updatedBike.customComponents = {
              ...currentCustom,
              [serviceData.componentKey]: {
                ...baseComp,
                id: serviceData.componentKey,
                ultimoCambioKm: km
              }
            };
          }
        }

        return updatedBike;
      })
    );
  };

  const handleUpdateHojaDeVida = (nextHoja) => {
    updateActiveGarage((prev) =>
      prev.map((bike) => (bike.id === activeBike.id ? { ...bike, hojaDeVida: nextHoja } : bike))
    );
  };

  const handleDeleteService = (serviceId) => {
    updateActiveGarage((prev) =>
      prev.map((bike) => {
        if (bike.id !== activeBike.id) return bike;
        const currentHoja = bike.hojaDeVida || { documentos: {}, servicios: [] };
        return {
          ...bike,
          hojaDeVida: {
            ...currentHoja,
            servicios: (currentHoja.servicios || []).filter((s) => s.id !== serviceId)
          }
        };
      })
    );
  };

  const handleSaveComponent = (componentPayload) => {
    const stampedPayload = {
      ...componentPayload,
      intervalo: Number(componentPayload.intervalo) || 4000,
      baseIntervalo: Number(componentPayload.baseIntervalo || componentPayload.intervalo) || 4000,
      updatedAt: Date.now()
    };

    if (activeBike?.id) {
      const nextCustomForActive = {
        ...(activeBike.customComponents || {}),
        [stampedPayload.id]: stampedPayload
      };
      saveCustomComponentsForBike(activeBike.id, nextCustomForActive);
    }

    updateActiveGarage((prev) =>
      prev.map((bike) => {
        if (bike.id !== activeBike.id) return bike;
        const currentCustom = bike.customComponents || {};
        const nextCustom = {
          ...currentCustom,
          [stampedPayload.id]: stampedPayload
        };
        saveCustomComponentsForBike(bike.id, nextCustom);
        return {
          ...bike,
          customComponents: nextCustom
        };
      })
    );
  };

  const handleDeleteComponent = (compId) => {
    updateActiveGarage((prev) =>
      prev.map((bike) => {
        if (bike.id !== activeBike.id) return bike;
        const currentCustom = { ...(bike.customComponents || {}) };
        delete currentCustom[compId];
        saveCustomComponentsForBike(bike.id, currentCustom);
        return {
          ...bike,
          customComponents: currentCustom
        };
      })
    );
  };

  const handleChangeRidingCondition = (condition) => {
    updateActiveGarage((prev) =>
      prev.map((bike) => (bike.id === activeBike.id ? { ...bike, ridingCondition: condition } : bike))
    );
  };

  const handleSyncHardwareOdometer = (newKm, sourceName = 'Hardware Link', fullTelemetry = null) => {
    updateActiveGarage((prev) =>
      prev.map((bike) => {
        if (bike.id !== activeBike.id) return bike;
        const cleanOdometer = Number(newKm) || bike.odometer;
        const currentHoja = bike.hojaDeVida || {};
        const currentCustom = { ...(bike.customComponents || {}) };

        if (fullTelemetry && typeof fullTelemetry === 'object') {
          const existingBattery = currentCustom.bateria_sistema_carga || {};
          const syncedVoltage = fullTelemetry.batteryVoltage ?? existingBattery.batteryVoltage ?? '12.8';
          const syncedLevel = fullTelemetry.batteryLevel ?? existingBattery.batteryLevel ?? 92;

          currentCustom.bateria_sistema_carga = {
            ...existingBattery,
            id: 'bateria_sistema_carga',
            batteryVoltage: syncedVoltage,
            batteryLevel: syncedLevel,
            syncedSource: sourceName,
            syncedAt: fullTelemetry.syncedAt || new Date().toISOString(),
            especificacion: `${syncedVoltage}V (${syncedLevel}% Salud) • Sincronizado con ${sourceName}`
          };

          const existingCheckEngine = currentCustom.check_engine_service_ecu || {};
          const syncedCheckStatus = fullTelemetry.checkEngineStatus || existingCheckEngine.checkEngineStatus || '0 Fallas • Al Día';
          currentCustom.check_engine_service_ecu = {
            ...existingCheckEngine,
            id: 'check_engine_service_ecu',
            checkEngineStatus: syncedCheckStatus,
            syncedSource: sourceName,
            syncedAt: fullTelemetry.syncedAt || new Date().toISOString(),
            especificacion: `${syncedCheckStatus} • Sincronizado con ${sourceName}`
          };
        }

        return {
          ...bike,
          odometer: cleanOdometer,
          customComponents: currentCustom,
          hojaDeVida: fullTelemetry
            ? {
                ...currentHoja,
                hardwareTelemetry: {
                  ...(currentHoja.hardwareTelemetry || {}),
                  ...fullTelemetry,
                  odometerKm: cleanOdometer,
                  sourceName
                }
              }
            : currentHoja
        };
      })
    );
  };

  const handleSaveSettings = (newSettings) => {
    setGlobalSettings(newSettings);
    localStorage.setItem("motodash_settings", JSON.stringify(newSettings));
  };

  const handleToggleSound = (nextSound) => {
    handleSaveSettings({ ...globalSettings, soundEnabled: nextSound });
  };

  const handleExportBackup = () => {
    const data = {
      version: "2.0",
      exportDate: new Date().toISOString(),
      userProfile,
      garage,
      activeBikeId,
      globalSettings
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `motodash_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (importedData) => {
    if (importedData && Array.isArray(importedData.garage)) {
      const valid = importedData.garage.slice(0, 25).map(sanitizeBikeEntry).filter(Boolean);
      if (valid.length > 0) setGarage(valid);
      if (typeof importedData.activeBikeId === "string") {
        setActiveBikeId(importedData.activeBikeId.slice(0, 60));
      }
      if (importedData.userProfile && typeof importedData.userProfile === "object") {
        setUserProfile({
          fullName: String(importedData.userProfile.fullName || "Piloto").slice(0, 80),
          email: String(importedData.userProfile.email || "").slice(0, 100),
          phone: String(importedData.userProfile.phone || "").slice(0, 30),
          city: String(importedData.userProfile.city || "").slice(0, 50),
          country: String(importedData.userProfile.country || "").slice(0, 50),
          plan: ["solo", "pro_monthly", "garage", "founder_vip"].includes(importedData.userProfile.plan)
            ? importedData.userProfile.plan
            : "solo",
          isPro: Boolean(importedData.userProfile.isPro),
          isLifetimeVip: Boolean(importedData.userProfile.isLifetimeVip || importedData.userProfile.plan === "founder_vip")
        });
      }
      if (importedData.globalSettings && typeof importedData.globalSettings === "object") {
        setGlobalSettings({
          unitSystem: importedData.globalSettings.unitSystem === "imperial" ? "imperial" : "metric",
          currency: ["USD", "COP", "EUR", "MXN", "BRL"].includes(importedData.globalSettings.currency)
            ? importedData.globalSettings.currency
            : "COP",
          soundEnabled: importedData.globalSettings.soundEnabled !== false,
          wakeLockEnabled: importedData.globalSettings.wakeLockEnabled !== false
        });
      }
    }
  };

  const handleResetFactory = () => {
    localStorage.clear();
    setGarage(DEMO_GARAGE);
    setActiveBikeId(DEMO_GARAGE[0].id);
    setUserProfile(null);
    setCurrentView("landing");
    window.location.reload();
  };

  return (
    <>
      {/* 0. VIDEO INTRO CINEMATOGRÁFICO DE 10 SEGUNDOS AL INICIAR LA APP */}
      {showIntroSplash && (
        <VideoIntroSplash onFinish={() => setShowIntroSplash(false)} />
      )}

      {/* 1. VISTA DE INICIO / LANDING PAGE */}
      {currentView === "landing" && (
        <LandingPage
          onStartOnboarding={(planKey = "pro_monthly") => {
            setOnboardingInitialPlan(typeof planKey === "string" ? planKey : "pro_monthly");
            setIsOnboardingOpen(true);
          }}
          onEnterDemo={handleEnterDemo}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onReplayIntro={() => setShowIntroSplash(true)}
          onOpenLegal={handleOpenLegal}
          onOpenMotoMall={handleOpenGlobalMall}
        />
      )}

      {/* 2. VISTA DE COCKPIT ACTIVO & BARRA DE DEMO ORGANIZADA */}
      {currentView === "cockpit" && activeBike && (
        <div className="relative">
          {/* BARRA SUPERIOR DE CONTROL INTERACTIVO DEL DEMO */}
          <div className="bg-neutral-950 border-b border-neutral-800/90 px-3 sm:px-6 py-2.5 flex flex-col lg:flex-row justify-between items-center gap-2.5 text-xs font-mono">
            <div className="flex items-center gap-2.5 overflow-x-auto max-w-full pb-1 lg:pb-0">
              <div
                onClick={handleExitToLanding}
                className="cursor-pointer flex-shrink-0 hover:opacity-90 transition"
                title="MotoDash AI • Volver al Inicio"
              >
                <AppLogo size="sm" showText={false} />
              </div>

              <button
                type="button"
                onClick={telemetry.toggleSimulation}
                className={`text-[10px] px-2.5 py-1 rounded-full font-bold whitespace-nowrap flex items-center gap-1.5 border transition ${
                  telemetry.isSimulating
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/50"
                    : "bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-white"
                }`}
              >
                {telemetry.isSimulating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{telemetry.isSimulating ? t('nav.liveDemoBadge') : t('nav.pausedDemoBadge')}</span>
              </button>

              {/* Selector Rápido de las 5 Motos Demo / Garaje */}
              <div className="flex gap-1.5">
                {DEMO_GARAGE.map((b) => {
                  const ownedMatch =
                    userProfile?.email &&
                    userProfile?.email !== "demo@motodash.com" &&
                    garage.find(
                      (g) =>
                        g.id === b.id ||
                        (g?.config?.bikeIdentity?.brand === b.config.bikeIdentity.brand &&
                          g?.config?.bikeIdentity?.model === b.config.bikeIdentity.model)
                    );
                  const isActive = ownedMatch
                    ? (!activeIsDemo && activeBike.id === ownedMatch.id)
                    : (activeIsDemo && b.id === activeBike.id);
                  const shortLabel = b.config.bikeIdentity.shortModel || b.config.bikeIdentity.model.split(' ')[0];
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        if (ownedMatch) {
                          setIsDemoSession(false);
                          setActiveBikeId(ownedMatch.id);
                        } else {
                          setIsDemoSession(true);
                          setDemoBikeId(b.id);
                          if (telemetry.startSimulation) telemetry.startSimulation();
                        }
                      }}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-racing font-bold flex items-center gap-1.5 border transition whitespace-nowrap ${
                        isActive
                          ? "bg-white text-black border-white shadow-md"
                          : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700"
                      }`}
                    >
                      <BrandLogo
                        brand={b.config.bikeIdentity.brand}
                        accentColor={b.config.bikeIdentity.colorHex}
                        className="w-4 h-4 flex-shrink-0"
                      />
                      <span>{b.config.bikeIdentity.brand} {shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2.5 w-full lg:w-auto justify-between lg:justify-end flex-wrap sm:flex-nowrap">
              {userProfile?.id && userProfile?.email !== "demo@motodash.com" && activeIsDemo && garage.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsDemoSession(false)}
                  className="px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-racing font-bold text-[10px] flex items-center gap-1 transition whitespace-nowrap"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Volver a Mi Garaje</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleOpenAddBike}
                className="px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 font-racing font-bold text-[10px] flex items-center gap-1 transition whitespace-nowrap"
              >
                <Plus className="w-3 h-3" />
                <span className="hidden sm:inline">{t('nav.registerBike')}</span>
                <span className="sm:hidden">+ Mi Moto</span>
              </button>

              <div className="flex items-center gap-1.5 sm:gap-2.5">
                <LanguageSwitcher compact />

                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="text-neutral-400 hover:text-white transition flex items-center gap-1 text-[11px] max-w-[100px] sm:max-w-none truncate"
                  title={userProfile && !activeIsDemo ? userProfile.fullName : t('nav.demoMode')}
                >
                  <span className={`w-2 h-2 rounded-full animate-pulse flex-shrink-0 ${activeIsDemo ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  <span className="truncate">{userProfile && !activeIsDemo ? userProfile.fullName : t('nav.demoMode')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExitToLanding}
                  className="text-neutral-300 hover:text-amber-400 font-bold flex items-center gap-1 text-[11px] transition whitespace-nowrap"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('nav.backHome')}</span>
                </button>
              </div>
            </div>
          </div>

          <DynamicDashboard
            bike={activeBike}
            config={activeBike.config}
            telemetry={telemetry}
            odometer={activeOdometer}
            hojaDeVida={activeBike?.hojaDeVida || {}}
            customComponents={activeBike?.customComponents || {}}
            ridingCondition={activeBike?.ridingCondition || 'normal'}
            onChangeRidingCondition={handleChangeRidingCondition}
            garageCount={activeIsDemo ? demoBikes.length : garage.length}
            globalSettings={globalSettings}
            userProfile={activeIsDemo ? null : userProfile}
            onToggleSound={handleToggleSound}
            onOpenSelector={handleOpenAddBike}
            onOpenGarage={() => setIsGarageOpen(true)}
            onOpenPaywall={() => setIsPaywallOpen(true)}
            onOpenOdometerModal={handleOpenOdometerModal}
            onOpenHojaDeVida={() => setIsHojaDeVidaOpen(true)}
            onOpenEditComponentModal={handleOpenEditComponentModal}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onUpdateHojaDeVida={handleUpdateHojaDeVida}
            onSyncHardwareOdometer={handleSyncHardwareOdometer}
            onOpenLegal={handleOpenLegal}
          />
        </div>
      )}

      {/* MODAL DE REGISTRO & ONBOARDING MULTI-PASO */}
      {isOnboardingOpen && (
        <OnboardingWizard
          userProfile={userProfile}
          initialPlan={onboardingInitialPlan}
          onCompleteOnboarding={handleCompleteOnboarding}
          onCancel={() => setIsOnboardingOpen(false)}
        />
      )}

      {/* MODAL AJUSTAR ODÓMETRO MANUAL */}
      <OdometerModal
        isOpen={isOdometerModalOpen}
        onClose={() => {
          setIsOdometerModalOpen(false);
          setInitialComponentKey(null);
        }}
        currentKm={activeOdometer}
        initialComponentKey={initialComponentKey}
        onSaveOdometer={handleSaveOdometer}
        bikeName={`${activeBike?.config?.bikeIdentity?.brand} ${activeBike?.config?.bikeIdentity?.model}`}
        bike={activeBike}
        userProfile={activeIsDemo ? null : userProfile}
        currency={globalSettings.currency || 'COP'}
      />

      {/* MODAL CALIBRAR INTERVALO DE CADA PARTE */}
      <EditComponentModal
        isOpen={isEditComponentModalOpen}
        onClose={() => {
          setIsEditComponentModalOpen(false);
          setSelectedComponentToEdit(null);
        }}
        component={selectedComponentToEdit}
        currentOdometer={activeOdometer}
        onSaveComponent={handleSaveComponent}
        onDeleteComponent={handleDeleteComponent}
        bikeName={`${activeBike?.config?.bikeIdentity?.brand} ${activeBike?.config?.bikeIdentity?.model}`}
      />

      {/* MODAL HOJA DE VIDA & CERTIFICADO PDF */}
      <HojaDeVidaModal
        isOpen={isHojaDeVidaOpen}
        onClose={() => setIsHojaDeVidaOpen(false)}
        bikeConfig={activeBike?.config}
        bike={activeBike}
        userProfile={activeIsDemo ? null : userProfile}
        hojaDeVida={activeBike?.hojaDeVida || {}}
        odometer={activeOdometer}
        currency={globalSettings.currency || 'COP'}
        onUpdateHojaDeVida={handleUpdateHojaDeVida}
        onDeleteService={handleDeleteService}
        onOpenOdometerModal={(compKey) => {
          setIsHojaDeVidaOpen(false);
          handleOpenOdometerModal(compKey);
        }}
      />

      {/* DRAWER DEL GARAJE */}
      {isGarageOpen && (
        <GarageDrawer
          garage={activeIsDemo ? demoBikes : (garage.length > 0 ? garage : demoBikes)}
          activeBikeId={activeBike.id}
          onSelectBike={(id) => {
            if (activeIsDemo && demoBikes.some((d) => d.id === id) && !garage.some((g) => g.id === id)) {
              setDemoBikeId(id);
            } else {
              setIsDemoSession(false);
              setActiveBikeId(id);
            }
            setIsGarageOpen(false);
          }}
          onAddNewBike={handleOpenAddBike}
          onDeleteBike={(id) => {
            if (activeIsDemo) return alert("Las motos de demostración no se pueden eliminar.");
            if (garage.length <= 1) return alert("Debes tener al menos 1 moto en tu garaje.");
            const filtered = garage.filter((b) => b.id !== id);
            setGarage(filtered);
            if (activeBike.id === id) {
              setActiveBikeId(filtered[0]?.id || "");
            }
          }}
          onCleanDemoBikes={() => {
            setGarage((prev) => {
              const demoIdSet = new Set(DEMO_PREVIEW_IDS);
              return prev.filter((b) => !demoIdSet.has(b.id) && !b.isDemo);
            });
          }}
          onSellBike={() => {
            setIsGarageOpen(false);
            setIsSellModalOpen(true);
          }}
          onClose={() => setIsGarageOpen(false)}
        />
      )}

      {/* MODAL COMPRA/VENTA CON HISTORIAL CERTIFICADO DESDE EL GARAJE */}
      <CertifiedMarketplaceModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        bike={activeBike}
        hojaDeVida={activeBike?.hojaDeVida || {}}
        odometer={activeOdometer}
        userProfile={activeIsDemo ? null : userProfile}
        onOpenHojaDeVida={() => setIsHojaDeVidaOpen(true)}
        onUpdateHojaDeVida={handleUpdateHojaDeVida}
      />

      {/* MODAL SUSCRIPCIÓN PRO */}
      {isPaywallOpen && (
        <PaywallModal
          initialPlan={userProfile?.plan || "pro_monthly"}
          onClose={() => setIsPaywallOpen(false)}
          onUpgradeSuccess={(nextPlan = "pro_monthly") => {
            if (userProfile) {
              setUserProfile({
                ...userProfile,
                isPro: nextPlan !== "solo",
                plan: nextPlan
              });
            }
            setIsPaywallOpen(false);
          }}
        />
      )}

      {/* MODAL DE AJUSTES GLOBALES */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        globalSettings={globalSettings}
        onSaveSettings={handleSaveSettings}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onResetFactory={handleResetFactory}
      />

      {/* MODAL DE INICIAR SESIÓN */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onOpenLegal={handleOpenLegal}
        onLoginSuccess={(profile) => {
          setUserProfile(profile);
          setIsDemoSession(false);
          const effectiveUserId = profile?.id || null;
          if (effectiveUserId) {
            loadPilotGarage(effectiveUserId).then((remoteData) => {
              hasLoadedRemoteRef.current = true;
              if (remoteData && Array.isArray(remoteData.bikes) && remoteData.bikes.length > 0) {
                setGarage((prevLocal) => {
                  const merged = mergeRemoteWithLocalGarage(remoteData.bikes, prevLocal);
                  if (merged.length > 0) {
                    try {
                      localStorage.setItem("motodash_garage", JSON.stringify(merged));
                    } catch {}
                    return merged;
                  }
                  return prevLocal;
                });
                if (remoteData.activeBikeId && remoteData.bikes.some((b) => b.id === remoteData.activeBikeId)) {
                  setActiveBikeId(remoteData.activeBikeId);
                } else {
                  setActiveBikeId(remoteData.bikes[0].id);
                }
              }
            });
          }
          setCurrentView("cockpit");
          if (telemetry.stopSimulation) telemetry.stopSimulation();
        }}
      />

      {/* MODAL DE PERFIL DEL PILOTO */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        garageCount={garage.length}
        onUpdateProfile={(updated) => setUserProfile(updated)}
        onOpenPaywall={() => {
          setIsProfileModalOpen(false);
          setIsPaywallOpen(true);
        }}
        onLogout={() => {
          hasLoadedRemoteRef.current = false;
          if (telemetry.stopSimulation) telemetry.stopSimulation();
          supabase.auth.signOut().catch(() => {});
          setUserProfile(null);
          localStorage.removeItem("motodash_user_profile");
          localStorage.removeItem("motodash_garage");
          localStorage.removeItem("motodash_active_bike_id");
          setGarage([]);
          setActiveBikeId("");
          setDemoBikes(createCleanDemoBikes());
          setDemoBikeId(DEMO_GARAGE[0].id);
          setIsDemoSession(true);
          setIsProfileModalOpen(false);
          setCurrentView("landing");
        }}
      />

      {/* MODAL CENTRO LEGAL: POLÍTICA DE PRIVACIDAD (HABEAS DATA) Y TÉRMINOS Y CONDICIONES */}
      <LegalTermsModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        initialTab={legalModalTab}
      />

      {/* MODAL MOTOMALL GLOBAL DESDE LA PÁGINA DE INICIO */}
      <MotoMallModal
        isOpen={isGlobalMallOpen}
        onClose={() => setIsGlobalMallOpen(false)}
        bike={activeBike}
        userProfile={userProfile}
        initialTab={globalMallTab}
      />
    </>
  );
}
