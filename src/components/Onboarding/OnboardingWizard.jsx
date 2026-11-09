import React, { useState } from 'react';
import { 
  Sparkles, Bike, Shield, Crown, Check, ArrowRight, ArrowLeft, 
  User, Mail, Phone, MapPin, Gauge, Key, Palette, Car, FileText, CheckCircle2, X
} from 'lucide-react';
import { BRAND_LOGOS } from '../Common/BrandLogos';
import { MOTO_CATALOG } from '../../services/motoCatalog';
import { isFounderVipEmail } from '../Auth/LoginModal';

export default function OnboardingWizard({ 
  userProfile = null,
  onCompleteOnboarding, 
  onCancel, 
  initialPlan = 'pro_monthly' 
}) {
  const hasExistingProfile = Boolean(userProfile && (userProfile.email || userProfile.fullName));
  const isVip = Boolean(
    userProfile?.plan === 'founder_vip' || 
    userProfile?.isLifetimeVip || 
    isFounderVipEmail(userProfile?.email)
  );

  // Si el usuario ya tiene cuenta (Founder VIP, Pro, etc.), arranca directo en el Paso 3 (Ficha Técnica de la Moto)
  const [step, setStep] = useState(hasExistingProfile ? 3 : 1);

  // Paso 1: Plan de Suscripción (Todos con 7 días de prueba gratis)
  const [selectedPlan, setSelectedPlan] = useState(
    userProfile?.plan || (['solo', 'pro_monthly', 'garage', 'founder_vip'].includes(initialPlan) ? initialPlan : 'pro_monthly')
  );

  // Paso 2: Datos del Piloto
  const [pilotData, setPilotData] = useState({
    fullName: userProfile?.fullName || "",
    email: userProfile?.email || "",
    phone: userProfile?.phone || "",
    city: userProfile?.city || "Medellín",
    country: userProfile?.country || "Colombia"
  });

  // Paso 3: Datos de la Moto (Hoja de Vida Completa)
  const [selectedBrand, setSelectedBrand] = useState("Yamaha");
  const [displacementRange, setDisplacementRange] = useState("alta"); // 'baja' | 'media' | 'alta'
  const [selectedModel, setSelectedModel] = useState("MT-09 SP (Gen 4 2025)");
  const [customModel, setCustomModel] = useState("");
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [year, setYear] = useState(2025);
  const [plate, setPlate] = useState("");
  const [vinChasis, setVinChasis] = useState("");
  const [engineNumber, setEngineNumber] = useState("");
  const [odometerKm, setOdometerKm] = useState(12500);
  const [selectedColor, setSelectedColor] = useState(MOTO_CATALOG["Yamaha"].colors[0].hex);
  const [isCustomColor, setIsCustomColor] = useState(false);

  // Documentación Inicial
  const [soatDate, setSoatDate] = useState("2027-02-15");
  const [tecnoDate, setTecnoDate] = useState("2027-03-20");
  const [insuranceName, setInsuranceName] = useState("Seguro Todo Riesgo SURA");

  const brandData = MOTO_CATALOG[selectedBrand] || MOTO_CATALOG["Yamaha"];
  const availableModels = brandData.cilindradas[displacementRange] || [];

  const handleBrandSelect = (brandName) => {
    setSelectedBrand(brandName);
    const newBrandData = MOTO_CATALOG[brandName];
    // Escoger el primer modelo disponible
    const firstDispl = Object.keys(newBrandData.cilindradas).find(k => newBrandData.cilindradas[k].length > 0) || "media";
    setDisplacementRange(firstDispl);
    const firstModel = newBrandData.cilindradas[firstDispl]?.[0]?.model || "";
    setSelectedModel(firstModel);
    setSelectedColor(newBrandData.colors[0].hex);
    setIsCustomColor(false);
    setIsCustomModel(false);
  };

  const handleModelSelect = (modelName) => {
    setSelectedModel(modelName);
    setIsCustomModel(false);
  };

  const handleFinish = () => {
    setStep(4); // Calibrando con IA

    setTimeout(() => {
      // Buscar especificaciones técnicas del catálogo
      let matchedSpec = null;
      Object.values(brandData.cilindradas).forEach(list => {
        const found = list.find(m => m.model === selectedModel);
        if (found) matchedSpec = found;
      });

      const effectiveModel = isCustomModel && customModel.trim() ? customModel.trim() : selectedModel;
      const cc = matchedSpec?.cc || (displacementRange === 'baja' ? 160 : displacementRange === 'media' ? 400 : 900);
      const maxRpm = matchedSpec?.maxRpm || (cc > 600 ? 12000 : 10500);
      const redlineRpm = matchedSpec?.redlineRpm || (maxRpm - 1000);
      const category = matchedSpec?.category || "naked";
      const tankL = matchedSpec?.tankL || 14;

      const newBikeEntry = {
        id: `bike_${Date.now()}`,
        odometer: Number(odometerKm) || 0,
        hojaDeVida: {
          documentos: {
            placa: plate.trim().toUpperCase() || "SIN PLACA",
            vinChasis: vinChasis.trim().toUpperCase() || "NO REGISTRADO",
            engineNumber: engineNumber.trim().toUpperCase() || "NO REGISTRADO",
            soatVencimiento: soatDate,
            tecnoVencimiento: tecnoDate,
            seguroNombre: insuranceName,
            seguroPoliza: "NO REGISTRADO",
            seguroVencimiento: "2027-09-10",
            impuestoVencimiento: "2027-06-30"
          },
          servicios: [
            {
              id: `srv_init_${Date.now()}`,
              fecha: new Date().toISOString().slice(0, 10),
              km: Number(odometerKm) || 0,
              servicio: "Apertura de Hoja de Vida & Calibración Inicial",
              marcaRepuesto: "Inspección General MotoDash AI",
              taller: "Registro Inicial",
              costo: 0,
              notas: `Registro de inicio con odómetro en ${Number(odometerKm).toLocaleString()} km.`
            }
          ]
        },
        config: {
          bikeIdentity: {
            brand: selectedBrand.toUpperCase(),
            model: effectiveModel.toUpperCase(),
            year: Number(year),
            colorHex: selectedColor,
            accentGlow: `rgba(255, 102, 0, 0.4)`,
            category
          },
          telemetrySpecs: {
            maxRpm,
            redlineRpm,
            speedUnit: "km/h",
            engineCc: cc,
            tankCapacityLiters: tankL,
          },
          maintenanceSchedule: [
            { id: "oil", service: "Aceite Sintético & Filtro", intervalKm: cc > 600 ? 5000 : 3000 },
            { id: "chain", service: "Tensión y Limpieza Cadena", intervalKm: 800 },
            { id: "brakes", service: "Pastillas de Freno", intervalKm: 7000 }
          ]
        }
      };

      const effectiveEmail = pilotData.email || userProfile?.email || "";
      const isAccountVip = isVip || isFounderVipEmail(effectiveEmail);

      const finalProfile = hasExistingProfile
        ? {
            ...userProfile,
            ...pilotData,
            plan: isAccountVip ? 'founder_vip' : userProfile.plan || selectedPlan,
            isPro: isAccountVip ? true : userProfile.isPro !== false,
            isLifetimeVip: isAccountVip
          }
        : {
            ...pilotData,
            plan: isAccountVip ? 'founder_vip' : selectedPlan,
            isPro: isAccountVip ? true : selectedPlan !== 'solo',
            isLifetimeVip: isAccountVip,
            trialEndsAt: isAccountVip
              ? '2099-12-31T23:59:59.000Z'
              : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            registrationDate: new Date().toISOString()
          };

      onCompleteOnboarding(finalProfile, newBikeEntry);
    }, 2400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative text-white my-auto">
        
        {/* Barra de Progreso Superior */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <img
              src="/logo-emblem.png"
              alt="MotoDash AI"
              className="h-10 w-auto object-contain flex-shrink-0 drop-shadow-[0_0_12px_rgba(245,158,11,0.35)]"
            />
            <div>
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-black">
                ONBOARDING MOTODASH AI
              </span>
              <h2 className="text-base sm:text-lg font-black font-racing uppercase tracking-wider text-white">
                {step === 1 && "Paso 1: Elige tu Membresía"}
                {step === 2 && "Paso 2: Datos del Piloto"}
                {step === 3 && (hasExistingProfile ? "Calibrar Nueva Moto para tu Garaje" : "Paso 3: Ficha Técnica & Hoja de Vida")}
                {step === 4 && "Sintonizando Cockpit..."}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-neutral-400">
              {hasExistingProfile ? "Nueva Moto" : `Paso ${step} de 3`}
            </span>
            {onCancel && (
              <button 
                type="button" 
                onClick={onCancel}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                title="Salir de la ventana"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* ========================================================
            PASO 1: PLANES DE SUSCRIPCIÓN (7 DÍAS GRATIS EN TODOS)
           ======================================================== */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-xs text-neutral-400">
              Todos los planes incluyen <strong className="text-emerald-400">7 días de prueba gratis ($0 hoy)</strong>. Cancela o cambia de plan cuando quieras.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Plan 1: Rider Solo (1 Moto) */}
              <div 
                onClick={() => setSelectedPlan('solo')}
                className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                  selectedPlan === 'solo' 
                    ? "bg-neutral-800 border-emerald-400 ring-2 ring-emerald-400" 
                    : "bg-neutral-950 border-neutral-800 hover:border-neutral-700"
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 block">1 Motocicleta</span>
                  <h4 className="text-sm font-bold font-racing uppercase text-white mt-1">Rider Solo</h4>
                  <div className="text-xl font-black font-telemetry mt-2 text-white">$1.99 <span className="text-xs text-neutral-500 font-normal">USD/mes</span></div>
                  <ul className="text-[11px] text-neutral-300 space-y-1.5 mt-3">
                    <li>✓ 1 Moto en Garaje</li>
                    <li>✓ Velocímetro GPS & Tacómetro</li>
                    <li>✓ 17 Partes editables</li>
                    <li>✓ Alertas SOAT y Tecno</li>
                  </ul>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-800 text-[10px] text-emerald-400 font-mono font-bold">
                  🎁 Prueba 7 días gratis
                </div>
              </div>

              {/* Plan 2: Rider Pro (Recomendado) */}
              <div 
                onClick={() => setSelectedPlan('pro_monthly')}
                className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between relative overflow-hidden ${
                  selectedPlan === 'pro_monthly' 
                    ? "bg-amber-950/40 border-amber-500 ring-2 ring-amber-500 shadow-xl shadow-amber-950/30" 
                    : "bg-neutral-950 border-neutral-800 hover:border-neutral-700"
                }`}
              >
                <div className="absolute top-2 right-2 bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">
                  Popular
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-400 block flex items-center gap-1">
                    <Crown className="w-3 h-3" /> Pro Pass
                  </span>
                  <h4 className="text-sm font-bold font-racing uppercase text-white mt-1">Rider Pro</h4>
                  <div className="text-xl font-black font-telemetry mt-2 text-amber-400">$4.99 <span className="text-xs text-neutral-400 font-normal">USD/mes</span></div>
                  <ul className="text-[11px] text-neutral-300 space-y-1.5 mt-3">
                    <li>✓ Hasta 3 Motos simultáneas</li>
                    <li>✓ Tacómetro Redline & Shift Beep</li>
                    <li>✓ Cronómetro 0-100 km/h</li>
                    <li>✓ Certificado PDF de Reventa</li>
                  </ul>
                </div>
                <div className="mt-4 pt-3 border-t border-amber-500/30 text-[10px] text-amber-400 font-mono font-bold">
                  🎁 Prueba 7 días gratis
                </div>
              </div>

              {/* Plan 3: Garage / Taller Pro */}
              <div 
                onClick={() => setSelectedPlan('garage')}
                className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                  selectedPlan === 'garage' 
                    ? "bg-neutral-800 border-cyan-400 ring-2 ring-cyan-400" 
                    : "bg-neutral-950 border-neutral-800 hover:border-neutral-700"
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 block">Talleres & Flotas</span>
                  <h4 className="text-sm font-bold font-racing uppercase text-white mt-1">Garaje Pro</h4>
                  <div className="text-xl font-black font-telemetry mt-2 text-cyan-400">$9.99 <span className="text-xs text-neutral-400 font-normal">USD/mes</span></div>
                  <ul className="text-[11px] text-neutral-300 space-y-1.5 mt-3">
                    <li>✓ Hasta 15 Motos activas</li>
                    <li>✓ Peritajes y PDFs ilimitados</li>
                    <li>✓ Gestión para talleres</li>
                    <li>✓ Respaldo multi-dispositivo</li>
                  </ul>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-800 text-[10px] text-cyan-400 font-mono font-bold">
                  🎁 Prueba 7 días gratis
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-neutral-800/80 mt-5">
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs font-mono text-neutral-400 hover:text-white hover:bg-neutral-800 transition flex items-center justify-center gap-1.5 order-2 sm:order-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Salir por ahora / Volver al inicio</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full sm:w-auto py-3 px-6 rounded-xl font-bold font-racing uppercase tracking-wider text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/20 hover:opacity-90 flex items-center justify-center gap-1.5 transition order-1 sm:order-2"
              >
                <span>Activar 7 Días Gratis & Continuar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            PASO 2: DATOS DEL PILOTO
           ======================================================== */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-xs text-neutral-400">
              Tu información personal para emitir los certificados oficiales de mantenimiento y alertas a tu celular.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-mono text-neutral-300 block mb-1">Nombre Completo del Piloto / Propietario</label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Ej: Daniel Gómez"
                    value={pilotData.fullName}
                    onChange={(e) => setPilotData({ ...pilotData, fullName: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-neutral-300 block mb-1">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    placeholder="motero@gmail.com"
                    value={pilotData.email}
                    onChange={(e) => setPilotData({ ...pilotData, email: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-neutral-300 block mb-1">WhatsApp / Celular (Alertas SOAT)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    placeholder="+57 300 123 4567"
                    value={pilotData.phone}
                    onChange={(e) => setPilotData({ ...pilotData, phone: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-neutral-300 block mb-1">Ciudad</label>
                <input
                  type="text"
                  placeholder="Medellín / Bogotá / Madrid / Miami"
                  value={pilotData.city}
                  onChange={(e) => setPilotData({ ...pilotData, city: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-neutral-300 block mb-1">País</label>
                <input
                  type="text"
                  value={pilotData.country}
                  onChange={(e) => setPilotData({ ...pilotData, country: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-5 rounded-xl font-bold font-racing uppercase tracking-wider text-xs bg-neutral-800 text-neutral-300 hover:bg-neutral-700 flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="py-3 px-6 rounded-xl font-bold font-racing uppercase tracking-wider text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/20 hover:opacity-90 flex items-center gap-1.5 transition"
              >
                <span>Continuar a Ficha Técnica</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            PASO 3: FICHA TÉCNICA DE LA MOTO & HOJA DE VIDA
           ======================================================== */}
        {step === 3 && (
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            <p className="text-xs text-neutral-400">
              Registra tu primera máquina. Estos datos quedarán grabados en la Hoja de Vida oficial y calibrarán los sensores.
            </p>

            {/* 1. Selector de Marca con Logos */}
            <div>
              <label className="text-xs font-racing uppercase tracking-wider text-neutral-300 block mb-2">
                1. Marca de la Motocicleta
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {Object.keys(MOTO_CATALOG).map((brandKey) => {
                  const LogoComp = BRAND_LOGOS[brandKey];
                  const isSelected = selectedBrand === brandKey;

                  return (
                    <button
                      key={brandKey}
                      type="button"
                      onClick={() => handleBrandSelect(brandKey)}
                      className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition ${
                        isSelected 
                          ? "bg-amber-500/20 border-amber-500 shadow-md ring-1 ring-amber-500/50" 
                          : "bg-neutral-950 border-neutral-800 hover:border-neutral-700"
                      }`}
                    >
                      {LogoComp && <LogoComp className="w-7 h-7" />}
                      <span className={`text-[11px] font-racing font-bold ${isSelected ? "text-amber-400" : "text-neutral-400"}`}>
                        {brandKey}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Filtro de Cilindrada & Modelo Moderno */}
            <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800/80">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-racing uppercase tracking-wider text-neutral-300">
                  2. Cilindrada & Modelos Modernos (2024 - 2026)
                </label>
                {/* Rango de Cilindrada */}
                <div className="flex bg-neutral-900 border border-neutral-800 p-0.5 rounded-xl text-[10px] font-mono">
                  {Object.keys(brandData.cilindradas).map((range) => (
                    <button
                      key={range}
                      type="button"
                      onClick={() => {
                        setDisplacementRange(range);
                        const first = brandData.cilindradas[range]?.[0]?.model || "";
                        setSelectedModel(first);
                        setIsCustomModel(false);
                      }}
                      className={`px-2 py-0.5 rounded-lg capitalize font-bold transition ${
                        displacementRange === range ? "bg-amber-500 text-black" : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista de Modelos del Rango */}
              {!isCustomModel ? (
                <div>
                  <select
                    value={selectedModel}
                    onChange={(e) => handleModelSelect(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-sans focus:outline-none focus:border-amber-500"
                  >
                    {availableModels.map((m) => (
                      <option key={m.model} value={m.model}>
                        {m.model} ({m.cc}cc • {m.category.toUpperCase()} • Redline: {m.redlineRpm.toLocaleString()} RPM)
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsCustomModel(true)}
                    className="text-[10px] text-amber-400 hover:underline mt-1.5 block font-mono"
                  >
                    ¿Tu modelo no aparece en la lista? Haz clic aquí para escribirlo manualmente
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    placeholder="Escribe el modelo exacto de tu moto..."
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomModel(false)}
                    className="text-[10px] text-neutral-400 hover:underline mt-1.5 block font-mono"
                  >
                    ← Volver a los modelos preestablecidos de {selectedBrand}
                  </button>
                </div>
              )}
            </div>

            {/* 3. Datos de Identificación (Hoja de Vida) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">Placa / Matrícula</label>
                <input
                  type="text"
                  placeholder="ABC-12D"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono font-bold uppercase focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">Año Modelo</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  min="1990"
                  max="2027"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">Odómetro Actual (KM en Tablero)</label>
                <input
                  type="number"
                  value={odometerKm}
                  onChange={(e) => setOdometerKm(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono font-black focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            {/* Chasis & Motor (Esencial para Hoja de Vida y Peritajes) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">Número de Chasis / VIN (Opcional)</label>
                <input
                  type="text"
                  placeholder="9FJ1234567890ABCD"
                  value={vinChasis}
                  onChange={(e) => setVinChasis(e.target.value.toUpperCase())}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">Número de Motor (Opcional)</label>
                <input
                  type="text"
                  placeholder="MTR-987654321"
                  value={engineNumber}
                  onChange={(e) => setEngineNumber(e.target.value.toUpperCase())}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Color Oficial de Fábrica */}
            <div>
              <label className="text-xs font-racing uppercase tracking-wider text-neutral-300 block mb-1.5">
                Pintura de Fábrica / Color Principal
              </label>
              <div className="flex items-center gap-2.5">
                {brandData.colors.map((c) => {
                  const isAct = selectedColor === c.hex && !isCustomColor;
                  return (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => { setSelectedColor(c.hex); setIsCustomColor(false); }}
                      title={c.name}
                      className={`w-9 h-9 rounded-2xl border-2 flex items-center justify-center transition ${
                        isAct ? "border-white scale-110 shadow-lg" : "border-neutral-700 hover:scale-105"
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {isAct && <Check className="w-4 h-4 text-white drop-shadow" />}
                    </button>
                  );
                })}

                {/* Color personalizado */}
                <label 
                  className={`w-9 h-9 rounded-2xl border-2 flex items-center justify-center cursor-pointer transition ${
                    isCustomColor ? "border-white scale-110 shadow-lg" : "border-neutral-700 hover:scale-105"
                  }`}
                  style={{ backgroundColor: isCustomColor ? selectedColor : "#262626" }}
                  title="Color personalizado"
                >
                  <input
                    type="color"
                    className="opacity-0 w-0 h-0"
                    onChange={(e) => {
                      setSelectedColor(e.target.value);
                      setIsCustomColor(true);
                    }}
                  />
                  {!isCustomColor && <span className="text-neutral-400 text-xs font-bold">+</span>}
                </label>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => {
                  if (hasExistingProfile) {
                    if (onCancel) onCancel();
                  } else {
                    setStep(2);
                  }
                }}
                className="py-3 px-5 rounded-xl font-bold font-racing uppercase tracking-wider text-xs bg-neutral-800 text-neutral-300 hover:bg-neutral-700 flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{hasExistingProfile ? "Cancelar" : "Volver"}</span>
              </button>

              <button
                type="button"
                onClick={handleFinish}
                className="py-3 px-6 rounded-xl font-bold font-racing uppercase tracking-wider text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/20 hover:opacity-90 flex items-center gap-1.5 transition"
              >
                <Sparkles className="w-4 h-4 text-black" />
                <span>Crear Hoja de Vida & Dashboard</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            PASO 4: CALIBRANDO CON IA (PANTALLA DE CARGA)
           ======================================================== */}
        {step === 4 && (
          <div className="py-12 text-center space-y-4 animate-fadeIn">
            <img
              src="/logo-full.png"
              alt="MotoDash AI"
              className="h-28 w-auto object-contain mx-auto drop-shadow-[0_0_24px_rgba(245,158,11,0.45)] animate-pulse"
            />
            <h3 className="text-xl font-black font-racing uppercase tracking-wider text-white">
              Sintonizando Cockpit con Inteligencia Artificial...
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto font-mono">
              Inyectando línea roja oficial de {selectedBrand}, calibrando los 17 componentes de desgaste del manual y generando Hoja de Vida.
            </p>
            <div className="w-48 bg-neutral-800 h-1.5 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-amber-500 animate-[pulse_1s_infinite] w-full" />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

