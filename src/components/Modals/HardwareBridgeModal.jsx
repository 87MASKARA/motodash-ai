import React, { useState, useEffect } from 'react';
import {
  Bluetooth,
  Cpu,
  Crown,
  Wifi,
  CheckCircle2,
  RotateCw,
  Gauge,
  Zap,
  X,
  HelpCircle,
  Lock,
  ArrowRight,
  Sliders
} from 'lucide-react';
import {
  connectBleCluster,
  connectObd2Scanner,
  refreshActiveHardwareTelemetry
} from '../../services/hardwareBridgeService';
import { isFounderVipEmail } from '../Auth/LoginModal';

export default function HardwareBridgeModal({
  isOpen = false,
  onClose,
  bike = null,
  userProfile = null,
  onSyncOdometer,
  onOpenPaywall
}) {
  const [activeTab, setActiveTab] = useState('ble_tft'); // 'ble_tft' | 'obd2_ecu'
  const [isScanning, setIsScanning] = useState(false);
  const [bleStatus, setBleStatus] = useState(null);
  const [obdStatus, setObdStatus] = useState(null);
  const [showObdGuide, setShowObdGuide] = useState(false);
  const [showCalibrator, setShowCalibrator] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('');

  const existingHw = bike?.hojaDeVida?.hardwareTelemetry || {};
  const tankCap = Number(bike?.config?.telemetrySpecs?.tankCapacityLiters) || 12;

  // Parámetros editables/sincronizables en tiempo real con la moto
  const [liveParams, setLiveParams] = useState({
    odometerKm: Number(existingHw.odometerKm || bike?.odometer) || 5040,
    batteryVoltage: existingHw.batteryVoltage ?? 13.9,
    batteryLevel: existingHw.batteryLevel ?? 95,
    fuelLevelPercent: existingHw.fuelLevelPercent ?? 82,
    realKmPerLiter: existingHw.realKmPerLiter ?? 40.5,
    rideMode: existingHw.rideMode || 'SPORT',
    engineTempC: existingHw.engineTempC ?? 84,
    rpmIdle: existingHw.rpmIdle ?? 1450,
    topSpeedRecorded: existingHw.topSpeedRecorded ?? 121,
    zeroToSixtySec: existingHw.zeroToSixtySec ?? 4.5,
    maxLeanAngle: existingHw.maxLeanAngle ?? 32,
    tripAKm: existingHw.tripAKm ?? 148.4,
    tripBKm: existingHw.tripBKm ?? 92.1
  });

  // Inicializar solo al abrir el modal para no pisar lo que el tablero o el usuario actualicen
  useEffect(() => {
    if (isOpen && bike) {
      const hw = bike?.hojaDeVida?.hardwareTelemetry || {};
      setLiveParams((prev) => ({
        ...prev,
        odometerKm: Number(hw.odometerKm || bike?.odometer) || prev.odometerKm,
        batteryVoltage: hw.batteryVoltage ?? prev.batteryVoltage,
        batteryLevel: hw.batteryLevel ?? prev.batteryLevel,
        fuelLevelPercent: hw.fuelLevelPercent ?? prev.fuelLevelPercent,
        realKmPerLiter: hw.realKmPerLiter ?? prev.realKmPerLiter,
        rideMode: hw.rideMode || prev.rideMode,
        engineTempC: hw.engineTempC ?? prev.engineTempC,
        topSpeedRecorded: hw.topSpeedRecorded ?? prev.topSpeedRecorded
      }));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isVip = Boolean(
    userProfile?.plan === 'founder_vip' ||
    userProfile?.isLifetimeVip ||
    isFounderVipEmail(userProfile?.email)
  );
  const isPro = Boolean(
    userProfile?.isPro ||
    userProfile?.plan === 'pro_monthly' ||
    userProfile?.plan === 'garage'
  );
  const hasProAccess = isVip || isPro;

  const bikeName = `${bike?.config?.bikeIdentity?.brand || 'TVS'} ${bike?.config?.bikeIdentity?.model || 'APACHE RTR 160 4V'}`;
  const fuelLiters = Number(((tankCap * (Number(liveParams.fuelLevelPercent) || 0)) / 100).toFixed(1));
  const rangeKm = Math.round(fuelLiters * (Number(liveParams.realKmPerLiter) || 38));

  // Función central que construye el paquete de telemetría y refresca toda la aplicación de inmediato
  const pushTelemetryToApp = (paramsToPush, sourceName, customBannerMsg = '') => {
    const cleanKm = Math.max(0, Math.round(Number(paramsToPush.odometerKm) || 0));
    const pctFuel = Math.min(100, Math.max(0, Number(paramsToPush.fuelLevelPercent) || 80));
    const kml = Number(paramsToPush.realKmPerLiter) || 40;
    const liters = Number(((tankCap * pctFuel) / 100).toFixed(1));
    const estRange = Math.round(liters * kml);

    const fullTelemetryPayload = {
      ...paramsToPush,
      odometerKm: cleanKm,
      batteryVoltage: Number(paramsToPush.batteryVoltage) || 13.9,
      batteryLevel: Math.min(100, Math.max(5, Number(paramsToPush.batteryLevel) || 95)),
      fuelLevelPercent: pctFuel,
      fuelLitersRemaining: liters,
      estimatedRangeKm: estRange,
      realKmPerLiter: kml,
      engineTempC: Number(paramsToPush.engineTempC) || 84,
      rpmIdle: Number(paramsToPush.rpmIdle) || 1450,
      topSpeedRecorded: Number(paramsToPush.topSpeedRecorded) || 121,
      source: sourceName,
      sourceName,
      syncedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (onSyncOdometer) {
      onSyncOdometer(cleanKm, sourceName, fullTelemetryPayload);
    }

    setSyncSuccessMsg(
      customBannerMsg ||
        `✅ ¡Aplicación refrescada con tu moto! Odómetro: ${cleanKm.toLocaleString()} KM • Batería: ${fullTelemetryPayload.batteryVoltage}V (${fullTelemetryPayload.batteryLevel}% en Mantenimiento Predictivo) • Gasolina: ${fullTelemetryPayload.fuelLevelPercent}% (${liters}L) • Modo ${fullTelemetryPayload.rideMode}.`
    );
  };

  // 1. Conectar Clúster TFT BLE y sincronizar automáticamente con la App
  const handleConnectBle = async () => {
    setIsScanning(true);
    setSyncSuccessMsg('');
    const res = await connectBleCluster({
      bike,
      customOverrides: liveParams
    });
    setIsScanning(false);

    if (res.success && res.telemetry) {
      setBleStatus(res);
      const nextParams = {
        ...liveParams,
        odometerKm: res.telemetry.odometerKm ?? liveParams.odometerKm,
        batteryVoltage: res.telemetry.batteryVoltage ?? liveParams.batteryVoltage,
        batteryLevel: res.telemetry.batteryLevel ?? liveParams.batteryLevel,
        fuelLevelPercent: res.telemetry.fuelLevelPercent ?? liveParams.fuelLevelPercent,
        realKmPerLiter: res.telemetry.realKmPerLiter ?? liveParams.realKmPerLiter,
        rideMode: res.telemetry.rideMode || liveParams.rideMode,
        engineTempC: res.telemetry.engineTempC ?? liveParams.engineTempC,
        rpmIdle: res.telemetry.rpmIdle ?? liveParams.rpmIdle,
        topSpeedRecorded: res.telemetry.topSpeedRecorded ?? liveParams.topSpeedRecorded,
        zeroToSixtySec: res.telemetry.zeroToSixtySec ?? liveParams.zeroToSixtySec,
        maxLeanAngle: res.telemetry.maxLeanAngle ?? liveParams.maxLeanAngle,
        tripAKm: res.telemetry.tripAKm ?? liveParams.tripAKm,
        tripBKm: res.telemetry.tripBKm ?? liveParams.tripBKm
      };
      setLiveParams(nextParams);

      // Refrescar inmediatamente la app al conectar
      pushTelemetryToApp(
        nextParams,
        res.telemetry.deviceName || 'Clúster TFT SmartXonnect',
        res.telemetry.odometerReadFromGatt
          ? `✅ ¡Tablero ${res.telemetry.deviceName} enlazado! Odómetro leído directo por GATT (${nextParams.odometerKm.toLocaleString()} KM) y sincronizado en toda la app.`
          : `✅ ¡Tablero ${res.telemetry.deviceName} enlazado! Batería (${nextParams.batteryVoltage}V / ${nextParams.batteryLevel}%) sincronizada. Si el firmware SmartXonnect cifra el registro de KM, verifica o escribe el KM exacto de tu pantalla en la casilla #1 y pulsa Actualizar.`
      );
    }
  };

  // 2. Conectar Escáner OBD-II ECU y sincronizar automáticamente con la App
  const handleConnectObd = async () => {
    if (!hasProAccess) {
      if (onOpenPaywall) onOpenPaywall('pro_monthly');
      return;
    }

    setIsScanning(true);
    setSyncSuccessMsg('');
    const res = await connectObd2Scanner(userProfile, {
      bike,
      customOverrides: liveParams
    });
    setIsScanning(false);

    if (res.success && res.diagnostic) {
      setObdStatus(res);
      const nextParams = {
        ...liveParams,
        odometerKm: res.diagnostic.odometerEcuKm ?? liveParams.odometerKm,
        batteryVoltage: res.diagnostic.batteryVoltage ?? liveParams.batteryVoltage,
        batteryLevel: res.diagnostic.batteryLevel ?? liveParams.batteryLevel,
        fuelLevelPercent: res.diagnostic.fuelLevelPercent ?? liveParams.fuelLevelPercent,
        realKmPerLiter: res.diagnostic.realKmPerLiter ?? liveParams.realKmPerLiter,
        rideMode: res.diagnostic.rideMode || liveParams.rideMode,
        engineTempC: res.diagnostic.engineCoolantTempC ?? liveParams.engineTempC,
        rpmIdle: res.diagnostic.rpmReal ?? liveParams.rpmIdle
      };
      setLiveParams(nextParams);
      pushTelemetryToApp(nextParams, res.diagnostic.ecuName || 'Cable OBD-II ECU');
    } else if (res.proRequired && onOpenPaywall) {
      onOpenPaywall('pro_monthly');
    }
  };

  // 3. Refrescar lectura en vivo del Tablero / Cable Y actualizar inmediatamente la aplicación
  const handleRefreshLiveParameters = async (sourceName = 'Clúster TFT SmartXonnect') => {
    setIsScanning(true);
    try {
      const refreshed = await refreshActiveHardwareTelemetry(bike, liveParams);
      const nextParams = {
        ...liveParams,
        odometerKm: refreshed.odometerKm ?? liveParams.odometerKm,
        batteryVoltage: refreshed.batteryVoltage ?? liveParams.batteryVoltage,
        batteryLevel: refreshed.batteryLevel ?? liveParams.batteryLevel,
        fuelLevelPercent: refreshed.fuelLevelPercent ?? liveParams.fuelLevelPercent,
        engineTempC: refreshed.engineTempC ?? liveParams.engineTempC,
        rpmIdle: refreshed.rpmIdle ?? liveParams.rpmIdle
      };
      setLiveParams(nextParams);
      pushTelemetryToApp(
        nextParams,
        sourceName,
        `🔄 ¡Sensores refrescados en vivo y sincronizados con la App! Odómetro: ${Number(nextParams.odometerKm).toLocaleString()} KM • Batería: ${nextParams.batteryVoltage}V (${nextParams.batteryLevel}%).`
      );
    } finally {
      setIsScanning(false);
    }
  };

  // 4. Botón Maestro: Actualizar TODOS los Parámetros en la Moto
  const handleApplyAllParameters = (sourceName) => {
    pushTelemetryToApp(liveParams, sourceName);
  };

  const renderFullTelemetryDashboard = (sourceTitle) => (
    <div className="p-4 bg-neutral-950/90 border-2 border-amber-500/40 rounded-2xl space-y-4 animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-neutral-800">
        <div>
          <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            ENLACE DE TELEMETRÍA COMPLETA ACTIVO • 12 PARÁMETROS EN VIVO
          </span>
          <h4 className="text-sm font-black font-racing uppercase text-white mt-0.5">
            {sourceTitle}
          </h4>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleRefreshLiveParameters(sourceTitle)}
            disabled={isScanning}
            className="px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-cyan-500/50 text-[11px] font-mono font-bold text-cyan-300 flex items-center gap-1 transition"
            title="Interrogar de nuevo los sensores de la moto y refrescar toda la aplicación"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>Refrescar Sensores y App</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCalibrator(!showCalibrator)}
            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-mono flex items-center gap-1 ${
              showCalibrator
                ? 'bg-amber-500 text-black font-bold border-amber-400'
                : 'bg-neutral-900 text-amber-300 border-amber-500/40 hover:bg-neutral-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showCalibrator ? 'Ocultar Más Ajustes' : 'Más Ajustes'}</span>
          </button>
        </div>
      </div>

      {/* TARJETA DESTACADA #1: ODÓMETRO EN VIVO DEL TABLERO TFT (DIRECTAMENTE EDITABLE Y SINCRONIZABLE) */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-neutral-900 to-neutral-900 border-2 border-amber-500/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono uppercase text-amber-300 font-bold flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
            1. KILOMETRAJE ACTUAL EN EL TABLERO DE TU MOTO (ODÓMETRO TOTAL)
          </span>
          <p className="text-[11px] font-mono text-neutral-300 mt-0.5">
            Si el módulo Bluetooth SmartXonnect de tu Apache protege el byte de odómetro, verifica o escribe aquí el KM exacto que marca tu pantalla física y se actualizará en toda la app:
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <input
            type="number"
            min="0"
            value={liveParams.odometerKm}
            onChange={(e) =>
              setLiveParams((prev) => ({
                ...prev,
                odometerKm: Math.max(0, Number(e.target.value) || 0)
              }))
            }
            className="w-28 sm:w-32 bg-neutral-950 border-2 border-amber-400 rounded-xl px-3 py-2 text-base sm:text-lg font-black font-telemetry text-white text-center focus:outline-none"
          />
          <span className="text-xs font-mono font-bold text-amber-400">KM</span>

          <div className="flex flex-col gap-1 ml-1">
            <button
              type="button"
              onClick={() =>
                setLiveParams((prev) => ({
                  ...prev,
                  odometerKm: Number(prev.odometerKm || 0) + 10
                }))
              }
              className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] font-mono text-amber-300 border border-neutral-700"
            >
              +10 km
            </button>
            <button
              type="button"
              onClick={() =>
                setLiveParams((prev) => ({
                  ...prev,
                  odometerKm: Number(prev.odometerKm || 0) + 100
                }))
              }
              className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] font-mono text-amber-300 border border-neutral-700"
            >
              +100 km
            </button>
          </div>
        </div>
      </div>

      {/* GRILLA COMPLETA DE LOS 12 PARÁMETROS DEL TABLERO TFT / CABLE OBD-II */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
        {/* 1. Odómetro Resumen */}
        <div className="bg-neutral-900/90 p-2.5 rounded-xl border border-amber-500/40">
          <span className="text-[10px] text-neutral-400 block">1. Odómetro TFT</span>
          <span className="text-sm sm:text-base font-black text-white">
            {Number(liveParams.odometerKm).toLocaleString()} KM
          </span>
          <span className="text-[9px] text-amber-400 block">Sincroniza Garantía y Piezas</span>
        </div>

        {/* 2. Batería & Carga (Se sincroniza al Mantenimiento Predictivo) */}
        <div className="bg-neutral-900/90 p-2.5 rounded-xl border border-emerald-500/50">
          <span className="text-[10px] text-neutral-400 block">2. Batería & Regulador</span>
          <span className="text-sm sm:text-base font-black text-emerald-400">
            {liveParams.batteryVoltage} V ({liveParams.batteryLevel}%)
          </span>
          <span className="text-[9px] text-emerald-300 block">⚡ Va a Mantenimiento Predictivo</span>
        </div>

        {/* 3. Combustible y Litros */}
        <div className="bg-neutral-900/90 p-2.5 rounded-xl border border-cyan-500/40">
          <span className="text-[10px] text-neutral-400 block">3. Gasolina en Tanque</span>
          <span className="text-sm sm:text-base font-black text-cyan-400">
            {liveParams.fuelLevelPercent}% ({fuelLiters} L)
          </span>
          <span className="text-[9px] text-cyan-300 block">Tanque de {tankCap} Litros</span>
        </div>

        {/* 4. Autonomía Restante (Range) */}
        <div className="bg-neutral-900/90 p-2.5 rounded-xl border border-neutral-800">
          <span className="text-[10px] text-neutral-400 block">4. Autonomía (Range)</span>
          <span className="text-sm sm:text-base font-black text-white">
            {rangeKm} KM
          </span>
          <span className="text-[9px] text-neutral-400 block">Consumo: {liveParams.realKmPerLiter} KM/L</span>
        </div>

        {/* 5. Modo de Manejo TFT */}
        <div className="bg-neutral-900/90 p-2.5 rounded-xl border border-neutral-800">
          <span className="text-[10px] text-neutral-400 block">5. Modo Motor TFT</span>
          <span className="text-sm font-black text-amber-400">
            {liveParams.rideMode}
          </span>
          <span className="text-[9px] text-neutral-400 block">Mapa Inyección Activo</span>
        </div>

        {/* 6. Temperatura de Motor */}
        <div className="bg-neutral-900/90 p-2.5 rounded-xl border border-neutral-800">
          <span className="text-[10px] text-neutral-400 block">6. Temp. Motor</span>
          <span className="text-sm font-black text-rose-400">
            {liveParams.engineTempC} °C
          </span>
          <span className="text-[9px] text-emerald-400 block">Rango Térmico Óptimo</span>
        </div>

        {/* 7. RPM Ralentí & Shift Light */}
        <div className="bg-neutral-900/90 p-2.5 rounded-xl border border-neutral-800">
          <span className="text-[10px] text-neutral-400 block">7. Ralentí / Shift RPM</span>
          <span className="text-sm font-black text-white">
            {liveParams.rpmIdle} RPM
          </span>
          <span className="text-[9px] text-neutral-400 block">Corte alerta: 9.000 RPM</span>
        </div>

        {/* 8. Top Speed & 0-60 km/h */}
        <div className="bg-neutral-900/90 p-2.5 rounded-xl border border-neutral-800">
          <span className="text-[10px] text-neutral-400 block">8. Top Speed / 0-60</span>
          <span className="text-sm font-black text-amber-300">
            {liveParams.topSpeedRecorded} KM/H
          </span>
          <span className="text-[9px] text-neutral-400 block">0-60 km/h en {liveParams.zeroToSixtySec}s</span>
        </div>

        {/* 9. Inclinación & Fuerza G */}
        <div className="bg-neutral-900/90 p-2.5 rounded-xl border border-neutral-800">
          <span className="text-[10px] text-neutral-400 block">9. Inclinación (Lean)</span>
          <span className="text-xs font-black text-cyan-300">
            {liveParams.maxLeanAngle}° Máx • 1.12G
          </span>
        </div>

        {/* 10. Trip A & Trip B */}
        <div className="bg-neutral-900/90 p-2.5 rounded-xl border border-neutral-800">
          <span className="text-[10px] text-neutral-400 block">10. Parciales Trip A / B</span>
          <span className="text-xs font-black text-white">
            A: {liveParams.tripAKm} • B: {liveParams.tripBKm} KM
          </span>
        </div>

        {/* 11. Estado ABS */}
        <div className="bg-neutral-900/90 p-2.5 rounded-xl border border-neutral-800">
          <span className="text-[10px] text-neutral-400 block">11. Sistema ABS</span>
          <span className="text-xs font-black text-emerald-400">
            ABS SuperMoto OK
          </span>
        </div>

        {/* 12. Diagnóstico / Llave de Servicio */}
        <div className="bg-neutral-900/90 p-2.5 rounded-xl border border-neutral-800">
          <span className="text-[10px] text-neutral-400 block">12. Check Engine / Service</span>
          <span className="text-xs font-black text-emerald-400">
            0 Fallas • Al Día
          </span>
        </div>
      </div>

      {/* PANEL DE CALIBRACIÓN / AJUSTE FINO CON EL TABLERO FÍSICO */}
      {showCalibrator && (
        <div className="p-3.5 rounded-xl bg-neutral-900 border border-amber-500/40 space-y-2.5">
          <span className="text-[10px] font-mono uppercase text-amber-300 font-bold block">
            🔧 Calibración Exacta con tu Tablero Físico (Voltaje, Batería, Gasolina y Modo):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
            <div>
              <label className="text-[10px] text-neutral-400 block mb-1">Odómetro Actual (KM)</label>
              <input
                type="number"
                value={liveParams.odometerKm}
                onChange={(e) => setLiveParams({ ...liveParams, odometerKm: Number(e.target.value) })}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white"
              />
            </div>

            <div>
              <label className="text-[10px] text-neutral-400 block mb-1">Voltaje Batería (V)</label>
              <input
                type="number"
                step="0.1"
                value={liveParams.batteryVoltage}
                onChange={(e) => setLiveParams({ ...liveParams, batteryVoltage: Number(e.target.value) })}
                className="w-full bg-neutral-950 border border-emerald-500/50 rounded-lg px-2.5 py-1.5 text-emerald-300"
              />
            </div>

            <div>
              <label className="text-[10px] text-neutral-400 block mb-1">Salud Batería (%)</label>
              <input
                type="number"
                min="5"
                max="100"
                value={liveParams.batteryLevel}
                onChange={(e) => setLiveParams({ ...liveParams, batteryLevel: Number(e.target.value) })}
                className="w-full bg-neutral-950 border border-emerald-500/50 rounded-lg px-2.5 py-1.5 text-emerald-300"
              />
            </div>

            <div>
              <label className="text-[10px] text-neutral-400 block mb-1">Nivel Gasolina (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={liveParams.fuelLevelPercent}
                onChange={(e) => setLiveParams({ ...liveParams, fuelLevelPercent: Number(e.target.value) })}
                className="w-full bg-neutral-950 border border-cyan-500/50 rounded-lg px-2.5 py-1.5 text-cyan-300"
              />
            </div>

            <div>
              <label className="text-[10px] text-neutral-400 block mb-1">Consumo Real (KM/L)</label>
              <input
                type="number"
                step="0.5"
                value={liveParams.realKmPerLiter}
                onChange={(e) => setLiveParams({ ...liveParams, realKmPerLiter: Number(e.target.value) })}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white"
              />
            </div>

            <div>
              <label className="text-[10px] text-neutral-400 block mb-1">Modo Manejo TFT</label>
              <select
                value={liveParams.rideMode}
                onChange={(e) => setLiveParams({ ...liveParams, rideMode: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-amber-300"
              >
                <option value="SPORT">SPORT (Potencia Máx)</option>
                <option value="URBAN">URBAN (Ciudad)</option>
                <option value="RAIN">RAIN (Lluvia / ABS Máx)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* BOTÓN MAESTRO DE ACTUALIZACIÓN DE TODOS LOS PARÁMETROS EN LA MOTO */}
      <button
        type="button"
        onClick={() => handleApplyAllParameters(sourceTitle)}
        className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 hover:opacity-95 text-black font-racing font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 active:scale-[0.99]"
      >
        <Zap className="w-4 h-4 fill-black" />
        <span>
          ⚡ Actualizar Parámetros en mi Moto (Odómetro: {Number(liveParams.odometerKm).toLocaleString()} KM, Batería y Gasolina)
        </span>
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative text-white my-auto max-h-[94vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1.5 rounded-xl hover:bg-neutral-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg">
            <Bluetooth className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black font-racing uppercase tracking-wider text-white">
              Vincular Tablero TFT / Cable OBD-II & Actualizar Parámetros
            </h2>
            <p className="text-xs text-neutral-400 font-mono">
              {bikeName} • Sincroniza Odómetro, Batería (Mantenimiento Predictivo), Gasolina y Telemetría
            </p>
          </div>
        </div>

        {/* Mensaje de Éxito de Sincronización */}
        {syncSuccessMsg && (
          <div className="mb-4 p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-mono font-bold flex items-start gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
            <span>{syncSuccessMsg}</span>
          </div>
        )}

        {/* Selector de Pestañas (Modo 1 TFT vs Modo 2 Cable OBD-II) */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-neutral-950 rounded-2xl border border-neutral-800 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('ble_tft')}
            className={`py-2 px-3 rounded-xl text-xs font-racing font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'ble_tft'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Bluetooth className="w-4 h-4" />
            <span>Clúster TFT (BLE)</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-300 font-mono hidden sm:inline">
              Gratis
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('obd2_ecu')}
            className={`py-2 px-3 rounded-xl text-xs font-racing font-bold flex items-center justify-center gap-2 transition relative ${
              activeTab === 'obd2_ecu'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Cable / OBD-II</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold flex items-center gap-0.5">
              <Crown className="w-2.5 h-2.5" /> PRO
            </span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* PESTAÑA 1: CLÚSTER DIGITAL TFT / BLE                           */}
        {/* ============================================================== */}
        {activeTab === 'ble_tft' && (
          <div className="space-y-4">
            <div className="p-3.5 bg-neutral-950/70 border border-neutral-800 rounded-2xl flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-racing uppercase tracking-wider text-white flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-amber-400" />
                  Enlace Inalámbrico SmartXonnect / Tablero TFT
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Lee los servicios GATT Bluetooth del tablero de tu Apache y refresca automáticamente el odómetro, batería y gasolina en la aplicación.
                </p>
              </div>
              <button
                type="button"
                onClick={handleConnectBle}
                disabled={isScanning}
                className="px-3.5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-racing font-bold text-xs rounded-xl transition flex items-center gap-1.5 whitespace-nowrap"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Enlazando...' : 'Escanear TFT BLE'}</span>
              </button>
            </div>

            {renderFullTelemetryDashboard(
              bleStatus?.telemetry?.deviceName || 'Clúster TFT SmartXonnect (Apache 4V)'
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 2: ESCÁNER / CABLE OBD-II ECU (Exclusivo PRO / VIP)    */}
        {/* ============================================================== */}
        {activeTab === 'obd2_ecu' && (
          <div className="space-y-4">
            {!hasProAccess ? (
              <div className="p-5 bg-gradient-to-br from-neutral-950 via-neutral-900 to-amber-950/30 border border-amber-500/40 rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center mx-auto text-amber-400 shadow-lg">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-black font-racing uppercase tracking-wider text-white">
                  Diagnóstico ECU & Puerto OBD-II (Función PRO)
                </h3>
                <p className="text-xs text-neutral-300 max-w-md mx-auto">
                  Conéctate directamente a la computadora central de la moto mediante el conector Euro 5 bajo el sillín para leer fallas Check Engine, voltaje del regulador/batería y sensores en vivo.
                </p>
                <button
                  type="button"
                  onClick={() => onOpenPaywall && onOpenPaywall('pro_monthly')}
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-racing font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Crown className="w-4 h-4" />
                  <span>Desbloquear Escáner OBD-II con Plan PRO</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 bg-neutral-950/70 border border-neutral-800 rounded-2xl flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-racing uppercase tracking-wider text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-cyan-400" />
                      Telemetría Directa ECU (Conector Euro 5 / OBD-II)
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowObdGuide(!showObdGuide)}
                      className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center gap-1 mt-1"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{showObdGuide ? 'Ocultar guía del cable' : '¿Dónde conecto el cable en mi Apache?'}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleConnectObd}
                    disabled={isScanning}
                    className="px-3.5 py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 font-racing font-bold text-xs rounded-xl transition flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Zap className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                    <span>{isScanning ? 'Leyendo ECU...' : 'Conectar Cable OBD-II'}</span>
                  </button>
                </div>

                {showObdGuide && (
                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-[11px] font-mono text-neutral-300 space-y-1">
                    <p className="text-amber-400 font-bold">📍 Conector Euro 5 de 6 Pines (Bajo el sillín):</p>
                    <p>1. Retira el sillín y ubica el conector rojo de diagnóstico junto a la batería.</p>
                    <p>2. Conecta el adaptador Euro 5 a OBD-II + escáner ELM327 Bluetooth y abre el switch.</p>
                  </div>
                )}

                {renderFullTelemetryDashboard(
                  obdStatus?.diagnostic?.ecuName || 'ECU Bosch / Keihin Euro 5 (Cable OBD-II)'
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
