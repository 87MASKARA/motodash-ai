import React, { useState } from 'react';
import { 
  Bluetooth, Cpu, Shield, Crown, Wifi, CheckCircle2, AlertTriangle, 
  RotateCw, Gauge, Battery, Activity, Zap, X, HelpCircle, Lock, ArrowRight, Wrench
} from 'lucide-react';
import { 
  connectBleCluster, 
  connectObd2Scanner, 
  isWebBluetoothSupported, 
  HARDWARE_MODES 
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
  const [bleStatus, setBleStatus] = useState(null); // { connected, telemetry }
  const [obdStatus, setObdStatus] = useState(null); // { connected, diagnostic }
  const [showObdGuide, setShowObdGuide] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('');

  if (!isOpen) return null;

  const isVip = Boolean(
    userProfile?.plan === 'founder_vip' ||
    userProfile?.isLifetimeVip ||
    isFounderVipEmail(userProfile?.email)
  );
  const isPro = Boolean(userProfile?.isPro || userProfile?.plan === 'pro_monthly' || userProfile?.plan === 'garage');
  const hasProAccess = isVip || isPro;

  const currentKm = Number(bike?.odometer) || 0;
  const bikeName = `${bike?.config?.bikeIdentity?.brand || 'MOTO'} ${bike?.config?.bikeIdentity?.model || ''}`;

  // 1. Conectar Clúster TFT BLE
  const handleConnectBle = async () => {
    setIsScanning(true);
    setSyncSuccessMsg('');
    const res = await connectBleCluster({ bike });
    setIsScanning(false);
    if (res.success) {
      setBleStatus(res);
    }
  };

  // 2. Conectar Escáner OBD-II ECU
  const handleConnectObd = async () => {
    if (!hasProAccess) {
      if (onOpenPaywall) onOpenPaywall('pro_monthly');
      return;
    }

    setIsScanning(true);
    setSyncSuccessMsg('');
    const res = await connectObd2Scanner(userProfile, { bike });
    setIsScanning(false);
    if (res.success) {
      setObdStatus(res);
    } else if (res.proRequired && onOpenPaywall) {
      onOpenPaywall('pro_monthly');
    }
  };

  // 3. Aplicar Odómetro Leído al Garaje y a Supabase
  const handleApplyOdometer = (newKm, sourceName) => {
    if (typeof newKm === 'number' && onSyncOdometer) {
      onSyncOdometer(newKm, sourceName);
      setSyncSuccessMsg(`¡Odómetro actualizado exitosamente a ${newKm.toLocaleString()} KM desde ${sourceName}!`);
      setTimeout(() => setSyncSuccessMsg(''), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl relative text-white my-6">
        
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-xl hover:bg-neutral-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg">
            <Bluetooth className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black font-racing uppercase tracking-wider text-white">
              Vincular Moto • Hardware Link
            </h2>
            <p className="text-xs text-neutral-400 font-mono">
              {bikeName} • Actualización de odómetro en tiempo real
            </p>
          </div>
        </div>

        {/* Mensaje de Éxito de Sincronización */}
        {syncSuccessMsg && (
          <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-mono font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{syncSuccessMsg}</span>
          </div>
        )}

        {/* Selector de Pestañas (Modo 1 vs Modo 2) */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-neutral-950 rounded-2xl border border-neutral-800 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('ble_tft')}
            className={`py-2 px-3 rounded-xl text-xs font-racing font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'ble_tft'
                ? "bg-amber-500 text-black shadow-md"
                : "text-neutral-400 hover:text-white"
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
                ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-md"
                : "text-neutral-400 hover:text-white"
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
        {/* PESTAÑA 1: CLÚSTER DIGITAL TFT / BLE (Gratis para todos)        */}
        {/* ============================================================== */}
        {activeTab === 'ble_tft' && (
          <div className="space-y-4">
            <div className="p-4 bg-neutral-950/70 border border-neutral-800 rounded-2xl">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-xs font-racing uppercase tracking-wider text-white flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-amber-400" />
                    Conexión SmartXonnect / TFT Digital
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Conéctate de forma inalámbrica a la pantalla digital de tu Apache o moto compatible para sincronizar kilómetros y odómetro de ruta.
                  </p>
                </div>
                {bleStatus?.telemetry?.connected ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Conectado
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 text-[10px] font-mono">
                    En espera
                  </span>
                )}
              </div>

              {/* Guía rápida */}
              <div className="bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800/80 text-[11px] font-mono text-neutral-400 space-y-1">
                <p>1. Gira la llave y enciende el switch de tu moto.</p>
                <p>2. Verifica que el icono Bluetooth parpadee en el tablero TFT.</p>
                <p>3. Pulsa "Escanear Tablero" y selecciona tu moto.</p>
              </div>
            </div>

            {/* Telemetría Leída del TFT */}
            {bleStatus?.telemetry && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3 animate-fadeIn">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-neutral-400">Dispositivo detectado:</span>
                  <span className="font-bold text-amber-400">{bleStatus.telemetry.deviceName}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center font-mono">
                  <div className="bg-neutral-900/80 p-2 rounded-xl border border-neutral-800">
                    <span className="text-[10px] text-neutral-400 block">Odómetro Tablero</span>
                    <span className="text-sm font-black text-white">
                      {bleStatus.telemetry.odometerKm.toLocaleString()} KM
                    </span>
                  </div>
                  <div className="bg-neutral-900/80 p-2 rounded-xl border border-neutral-800">
                    <span className="text-[10px] text-neutral-400 block">Combustible</span>
                    <span className="text-sm font-black text-cyan-400">
                      {bleStatus.telemetry.fuelLevelPercent}%
                    </span>
                  </div>
                  <div className="bg-neutral-900/80 p-2 rounded-xl border border-neutral-800 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-neutral-400 block">Batería Clúster</span>
                    <span className="text-sm font-black text-emerald-400">
                      {bleStatus.telemetry.batteryLevel}%
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleApplyOdometer(bleStatus.telemetry.odometerKm, 'Clúster TFT Bluetooth')}
                  className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-black font-racing font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sincronizar {bleStatus.telemetry.odometerKm.toLocaleString()} KM a mi Hoja de Vida</span>
                </button>
              </div>
            )}

            {/* Botón de Escaneo */}
            <button
              type="button"
              onClick={handleConnectBle}
              disabled={isScanning}
              className="w-full py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-white font-racing font-bold text-xs rounded-2xl border border-neutral-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RotateCw className={`w-4 h-4 text-amber-400 ${isScanning ? "animate-spin" : ""}`} />
              <span>{isScanning ? "Buscando Baliza Bluetooth..." : "Escanear Tablero TFT (SmartXonnect / BLE)"}</span>
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 2: ESCÁNER / CABLE OBD-II ECU (Exclusivo PRO / VIP)    */}
        {/* ============================================================== */}
        {activeTab === 'obd2_ecu' && (
          <div className="space-y-4">
            {/* Si el usuario NO tiene plan PRO */}
            {!hasProAccess ? (
              <div className="p-5 bg-gradient-to-br from-neutral-950 via-neutral-900 to-amber-950/30 border border-amber-500/40 rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center mx-auto text-amber-400 shadow-lg">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-black font-racing uppercase tracking-wider text-white">
                  Diagnóstico ECU & Puerto OBD-II (Función PRO)
                </h3>
                <p className="text-xs text-neutral-300 max-w-md mx-auto">
                  Conéctate directamente a la computadora central de la moto mediante el conector Euro 5 y un escáner ELM327 Bluetooth para leer fallas *Check Engine*, odómetro oficial y telemetría de inyección.
                </p>

                <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800 text-left text-[11px] font-mono text-neutral-300 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Lectura y borrado de códigos DTC (Check Engine)</span>
                  </div>
                  <div className="flex items-center gap-2 text-cyan-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Odómetro directo de la ECU (infalsificable para peritajes)</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Voltaje exacto del alternador y temperatura de motor</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenPaywall && onOpenPaywall('pro_monthly')}
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-racing font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Crown className="w-4 h-4" />
                  <span>Desbloquear Escáner OBD-II con Plan PRO (7 Días Gratis)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Si el usuario SÍ tiene PRO o es Fundador VIP */
              <div className="space-y-4">
                <div className="p-4 bg-neutral-950/70 border border-neutral-800 rounded-2xl">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-xs font-racing uppercase tracking-wider text-white flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-cyan-400" />
                        Telemetría Computadora ECU (Bosch / Keihin Euro 5)
                      </h3>
                      <p className="text-[11px] text-neutral-400 mt-1">
                        Lectura de sensor a sensor a través del puerto OBD-II bajo el sillín.
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                      <Crown className="w-2.5 h-2.5" /> Acceso VIP
                    </span>
                  </div>

                  {/* Botón para ver guía física del conector */}
                  <button
                    type="button"
                    onClick={() => setShowObdGuide(!showObdGuide)}
                    className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center gap-1 mt-2"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showObdGuide ? "Ocultar guía de conexión física" : "¿Dónde conecto el cable en mi moto?"}</span>
                  </button>

                  {showObdGuide && (
                    <div className="mt-3 p-3 bg-neutral-900 rounded-xl border border-neutral-800 text-[11px] font-mono text-neutral-300 space-y-2 animate-fadeIn">
                      <p className="text-amber-400 font-bold">📍 Ubicación en TVS Apache 160 4V FI NG & Motos Modernas:</p>
                      <p>1. Retira el sillín con la llave de encendido.</p>
                      <p>2. Cerca a la batería encontrarás un <strong>conector rojo de 6 pines Euro 5</strong> con tapa protectora negra.</p>
                      <p>3. Conecta el cable adaptador (Euro 5 a OBD2 16 pines) y enchufa el mini escáner Bluetooth ELM327.</p>
                      <p>4. Abre el switch de la moto (no es necesario encender el motor).</p>
                    </div>
                  )}
                </div>

                {/* Panel de Diagnóstico en Vivo */}
                {obdStatus?.diagnostic && (
                  <div className="p-4 bg-cyan-950/20 border border-cyan-500/40 rounded-2xl space-y-3 animate-fadeIn">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-neutral-400">ECU Enlace:</span>
                      <span className="font-bold text-cyan-400">{obdStatus.diagnostic.ecuName}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
                      <div className="bg-neutral-900/90 p-2 rounded-xl border border-neutral-800">
                        <span className="text-[10px] text-neutral-400 block">Odómetro ECU</span>
                        <span className="text-xs font-black text-white">
                          {obdStatus.diagnostic.odometerEcuKm.toLocaleString()} KM
                        </span>
                      </div>
                      <div className="bg-neutral-900/90 p-2 rounded-xl border border-neutral-800">
                        <span className="text-[10px] text-neutral-400 block">RPM Ralentí</span>
                        <span className="text-xs font-black text-amber-400">
                          {obdStatus.diagnostic.rpmReal} RPM
                        </span>
                      </div>
                      <div className="bg-neutral-900/90 p-2 rounded-xl border border-neutral-800">
                        <span className="text-[10px] text-neutral-400 block">Batería</span>
                        <span className="text-xs font-black text-emerald-400">
                          {obdStatus.diagnostic.batteryVoltage} V
                        </span>
                      </div>
                      <div className="bg-neutral-900/90 p-2 rounded-xl border border-neutral-800">
                        <span className="text-[10px] text-neutral-400 block">Temp. Motor</span>
                        <span className="text-xs font-black text-cyan-300">
                          {obdStatus.diagnostic.engineCoolantTempC} °C
                        </span>
                      </div>
                    </div>

                    {/* Escaneo Check Engine */}
                    <div className="p-2.5 bg-neutral-900/80 rounded-xl border border-neutral-800 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        <span className="text-neutral-300">Check Engine (DTC):</span>
                      </div>
                      <span className="font-bold text-emerald-400">
                        {obdStatus.diagnostic.checkEngineStatus}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplyOdometer(obdStatus.diagnostic.odometerEcuKm, 'Escáner ECU OBD-II')}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-racing font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Sincronizar Odómetro Oficial ({obdStatus.diagnostic.odometerEcuKm.toLocaleString()} KM)</span>
                    </button>
                  </div>
                )}

                {/* Botón de Escaneo OBD-II */}
                <button
                  type="button"
                  onClick={handleConnectObd}
                  disabled={isScanning}
                  className="w-full py-3 px-4 bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 font-racing font-bold text-xs rounded-2xl border border-cyan-500/40 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RotateCw className={`w-4 h-4 text-cyan-400 ${isScanning ? "animate-spin" : ""}`} />
                  <span>{isScanning ? "Interrogando Computadora ECU..." : "Escanear Adaptador OBD-II (ELM327 Bluetooth)"}</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
