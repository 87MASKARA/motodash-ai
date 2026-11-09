import React, { useState, useEffect } from 'react';
import { Play, Pause, Plus, ArrowLeft } from 'lucide-react';
import AppLogo from './components/Common/AppLogo';
import LanguageSwitcher from './components/Common/LanguageSwitcher';
import { BrandLogo } from './components/Common/BrandLogos';
import { useLanguage } from './i18n/LanguageContext';
import LandingPage from './components/Landing/LandingPage';
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
import { useDeviceGps } from './hooks/useDeviceGps';
import { COMPONENTES_DESGASTE_OFICIALES } from './services/maintenanceCatalog';
import { DEMO_GARAGE } from './services/demoGarage';
import { sanitizeHexColor, computeAccentGlow } from './services/aiGenerator';

function isValidBike(bike) {
  return Boolean(
    bike &&
    typeof bike.id === "string" &&
    bike.config &&
    bike.config.bikeIdentity &&
    bike.config.telemetrySpecs
  );
}

function sanitizeBikeEntry(bike) {
  if (!isValidBike(bike)) return null;
  const safeHex = sanitizeHexColor(bike.config.bikeIdentity.colorHex, "#FF6600");
  return {
    ...bike,
    id: String(bike.id).slice(0, 60),
    odometer: Math.max(0, Math.min(2000000, Number(bike.odometer) || 0)),
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

export default function App() {
  const { t } = useLanguage();
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

  // Garaje protegido contra corrupción de datos y sincronizado con el catálogo Demo
  const [garage, setGarage] = useState(() => {
    const saved = localStorage.getItem("motodash_garage");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const validBikes = Array.isArray(parsed)
          ? parsed.map(sanitizeBikeEntry).filter(Boolean)
          : [];
        if (validBikes.length > 0) {
          const existingIds = new Set(validBikes.map((b) => b.id));
          const missingDemos = DEMO_GARAGE.filter((d) => !existingIds.has(d.id));
          return [...validBikes, ...missingDemos];
        }
      } catch (e) {
        console.error("Error cargando garaje de localStorage:", e);
      }
    }
    return DEMO_GARAGE;
  });

  const [activeBikeId, setActiveBikeId] = useState(() => {
    return localStorage.getItem("motodash_active_bike_id") || DEMO_GARAGE[0].id;
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

  // Ajustes Globales
  const [globalSettings, setGlobalSettings] = useState(() => {
    const saved = localStorage.getItem("motodash_settings");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return { unitSystem: 'metric', currency: 'COP', soundEnabled: true, wakeLockEnabled: true };
  });

  // Garantizar que activeBike NUNCA sea undefined
  const activeBike = (
    garage.find((b) => b?.id === activeBikeId && isValidBike(b)) ||
    DEMO_GARAGE.find((b) => b.id === activeBikeId) ||
    garage.find(isValidBike) ||
    DEMO_GARAGE[0]
  );

  const activeOdometer = typeof activeBike?.odometer === "number" ? activeBike.odometer : 14250;

  // Telemetría sincronizada con el límite de RPM de la moto activa y auto-inicio en modo Demo
  const telemetry = useDeviceGps({
    maxRpm: activeBike?.config?.telemetrySpecs?.maxRpm || 11500,
    redlineRpm: activeBike?.config?.telemetrySpecs?.redlineRpm || 10500,
    autoStart: currentView === "cockpit"
  });

  // Guardar persistencia
  useEffect(() => {
    localStorage.setItem("motodash_active_view", currentView);
  }, [currentView]);

  useEffect(() => {
    localStorage.setItem("motodash_garage", JSON.stringify(garage));
  }, [garage]);

  useEffect(() => {
    localStorage.setItem("motodash_active_bike_id", activeBikeId);
  }, [activeBikeId]);

  useEffect(() => {
    if (userProfile) {
      localStorage.setItem("motodash_user_profile", JSON.stringify(userProfile));
    } else {
      localStorage.removeItem("motodash_user_profile");
    }
  }, [userProfile]);

  // Finalizar Onboarding y arrancar en Cockpit
  const handleCompleteOnboarding = (profile, newBike) => {
    const cleanBike = sanitizeBikeEntry(newBike) || newBike;
    setUserProfile(profile);
    setGarage((prev) => [cleanBike, ...prev]);
    setActiveBikeId(cleanBike.id);
    setIsOnboardingOpen(false);
    setCurrentView("cockpit");
    if (telemetry.startSimulation) telemetry.startSimulation();
  };

  // Abrir asistente para agregar o calibrar nueva moto (respetando cupo de membresía o ilimitado para VIP)
  const handleOpenAddBike = () => {
    setIsGarageOpen(false);
    const demoIds = new Set(DEMO_GARAGE.map((d) => d.id));
    const customBikesCount = garage.filter((b) => !demoIds.has(b.id)).length;
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

  // Entrar al Demo en vivo desde Landing: activa simulación inmediatamente
  const handleEnterDemo = (bikeId = "bike_yamaha_mt09") => {
    const targetId = typeof bikeId === "string" ? bikeId : "bike_yamaha_mt09";
    setActiveBikeId(targetId);
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

  const handleSaveOdometer = (payload) => {
    const { km, recordType, date, serviceData, fuelData } = payload;

    setGarage((prev) =>
      prev.map((bike) => {
        if (bike.id !== activeBike.id) return bike;

        const prevOdometer = Number(bike.odometer) || 0;
        const updatedBike = { ...bike, odometer: km };
        const currentHoja = bike.hojaDeVida || { documentos: {}, servicios: [], tanqueos: [] };

        if (recordType === "fuel" && fuelData) {
          const liters = Math.max(0.1, Number(fuelData.liters) || 1);
          const deltaKm = km > prevOdometer ? km - prevOdometer : 0;
          const computedKmPerL = deltaKm > 5 && deltaKm < 1200
            ? Math.min(65, Math.max(8, Math.round(deltaKm / liters)))
            : null;

          const newRefuel = {
            id: `fuel_${Date.now()}`,
            fecha: date,
            km,
            liters,
            cost: Math.max(0, Number(fuelData.cost) || 0),
            isFull: Boolean(fuelData.isFull),
            kmPerLiter: computedKmPerL
          };

          updatedBike.hojaDeVida = {
            ...currentHoja,
            tanqueos: [newRefuel, ...(currentHoja.tanqueos || [])]
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
    setGarage((prev) =>
      prev.map((bike) => (bike.id === activeBike.id ? { ...bike, hojaDeVida: nextHoja } : bike))
    );
  };

  const handleDeleteService = (serviceId) => {
    setGarage((prev) =>
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
    setGarage((prev) =>
      prev.map((bike) => {
        if (bike.id !== activeBike.id) return bike;
        const currentCustom = bike.customComponents || {};
        return {
          ...bike,
          customComponents: {
            ...currentCustom,
            [componentPayload.id]: componentPayload
          }
        };
      })
    );
  };

  const handleDeleteComponent = (compId) => {
    setGarage((prev) =>
      prev.map((bike) => {
        if (bike.id !== activeBike.id) return bike;
        const currentCustom = { ...(bike.customComponents || {}) };
        delete currentCustom[compId];
        return {
          ...bike,
          customComponents: currentCustom
        };
      })
    );
  };

  const handleChangeRidingCondition = (condition) => {
    setGarage((prev) =>
      prev.map((bike) => (bike.id === activeBike.id ? { ...bike, ridingCondition: condition } : bike))
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
      {/* 1. VISTA DE INICIO / LANDING PAGE */}
      {currentView === "landing" && (
        <LandingPage
          onStartOnboarding={(planKey = "pro_monthly") => {
            setOnboardingInitialPlan(typeof planKey === "string" ? planKey : "pro_monthly");
            setIsOnboardingOpen(true);
          }}
          onEnterDemo={handleEnterDemo}
          onOpenLogin={() => setIsLoginModalOpen(true)}
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

              {/* Selector Rápido de las 5 Motos Demo */}
              <div className="flex gap-1.5">
                {DEMO_GARAGE.map((b) => {
                  const isActive = b.id === activeBike.id;
                  const shortLabel = b.config.bikeIdentity.shortModel || b.config.bikeIdentity.model.split(' ')[0];
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setActiveBikeId(b.id);
                        if (telemetry.startSimulation) telemetry.startSimulation();
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
                  title={userProfile ? userProfile.fullName : t('nav.demoMode')}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                  <span className="truncate">{userProfile ? userProfile.fullName : t('nav.demoMode')}</span>
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
            garageCount={garage.length}
            globalSettings={globalSettings}
            userProfile={userProfile}
            onToggleSound={handleToggleSound}
            onOpenSelector={handleOpenAddBike}
            onOpenGarage={() => setIsGarageOpen(true)}
            onOpenPaywall={() => setIsPaywallOpen(true)}
            onOpenOdometerModal={handleOpenOdometerModal}
            onOpenHojaDeVida={() => setIsHojaDeVidaOpen(true)}
            onOpenEditComponentModal={handleOpenEditComponentModal}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onUpdateHojaDeVida={handleUpdateHojaDeVida}
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
        userProfile={userProfile}
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
          garage={garage}
          activeBikeId={activeBike.id}
          onSelectBike={(id) => {
            setActiveBikeId(id);
            setIsGarageOpen(false);
          }}
          onAddNewBike={handleOpenAddBike}
          onDeleteBike={(id) => {
            if (garage.length <= 1) return alert("Debes tener al menos 1 moto.");
            const filtered = garage.filter((b) => b.id !== id);
            setGarage(filtered);
            if (activeBike.id === id) setActiveBikeId(filtered[0].id);
          }}
          onClose={() => setIsGarageOpen(false)}
        />
      )}

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
        onLoginSuccess={(profile) => {
          setUserProfile(profile);
          setCurrentView("cockpit");
          if (telemetry.startSimulation) telemetry.startSimulation();
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
          if (telemetry.stopSimulation) telemetry.stopSimulation();
          setUserProfile(null);
          setIsProfileModalOpen(false);
          setCurrentView("landing");
        }}
      />
    </>
  );
}
