import React, { useState } from 'react';
import { 
  Wrench, CheckCircle2, AlertTriangle, AlertCircle, Droplet, Filter, 
  Link, Cog, Disc, Beaker, GitCommit, Wind, Flame, Crosshair, 
  CircleDot, Activity, Layers, Droplets, Settings, Plus, Sparkles,
  Zap, Battery, Bluetooth
} from 'lucide-react';
import { COMPONENTES_DESGASTE_OFICIALES, CATEGORIAS_MANTENIMIENTO } from '../../../services/maintenanceCatalog';
import { useLanguage } from '../../../i18n/LanguageContext';

// Mapeo dinámico de iconos
const ICONS_MAP = {
  Droplet,
  Filter,
  Link,
  Cog,
  Disc,
  Beaker,
  GitCommit,
  Wind,
  Flame,
  Crosshair,
  CircleDot,
  Wrench,
  Activity,
  Layers,
  Droplets,
  Zap,
  Battery
};

export default function MaintenanceWidget({ 
  currentOdometer, 
  customComponents = {}, 
  hardwareTelemetry = null,
  ridingCondition = 'normal', // 'ciudad' | 'normal' | 'carretera'
  onChangeRidingCondition,
  onOpenOdometerModal,
  onOpenEditComponentModal,
  onOpenHardwareBridgeModal
}) {
  const { t } = useLanguage();
  const [categoriaActiva, setCategoriaActiva] = useState("todas");

  // Factor multiplicador según condición de manejo
  // Ciudad severa acorta intervalos un 15% (aceite y frenos sufren más)
  const conditionMultiplier = ridingCondition === 'ciudad' ? 0.85 : ridingCondition === 'carretera' ? 1.15 : 1.0;

  // Unificar catálogo oficial con los componentes personalizados o editados por el usuario
  const allComponentEntries = {
    ...COMPONENTES_DESGASTE_OFICIALES,
    ...customComponents
  };

  const listaComponentes = Object.values(allComponentEntries).map((comp) => {
    // Aplicar personalizaciones si existen
    const custom = customComponents[comp.id] || {};
    const baseIntervalo = custom.intervalo || comp.intervalo;
    const effectiveIntervalo = Math.round(baseIntervalo * conditionMultiplier);
    const ultimoCambioKm = typeof custom.ultimoCambioKm === 'number' ? custom.ultimoCambioKm : 0;

    // Si tiene registrado un último cambio explícito
    let kmRestantes;
    if (ultimoCambioKm > 0 && currentOdometer >= ultimoCambioKm) {
      const kmDesdeUltimo = currentOdometer - ultimoCambioKm;
      kmRestantes = Math.max(0, effectiveIntervalo - kmDesdeUltimo);
    } else {
      // Ciclo periódico por defecto
      const kmEnCiclo = currentOdometer % effectiveIntervalo;
      kmRestantes = Math.max(0, effectiveIntervalo - kmEnCiclo);
    }

    let vidaPorcentaje = Math.max(0, Math.min(100, Math.round((kmRestantes / effectiveIntervalo) * 100)));
    const alertaMargin = custom.alertaPreventivaKm || comp.alertaPreventivaKm || 300;

    // Sincronización Especial en Vivo para Batería y Check Engine / Service desde Tablero TFT / Cable OBD-II
    const isBatteryComp = comp.id === 'bateria_sistema_carga';
    const isCheckEngineComp = comp.id === 'check_engine_service_ecu';
    const syncedBatteryLevel = isBatteryComp
      ? (hardwareTelemetry?.batteryLevel ?? custom.batteryLevel ?? null)
      : null;
    const syncedBatteryVoltage = isBatteryComp
      ? (hardwareTelemetry?.batteryVoltage ?? custom.batteryVoltage ?? null)
      : null;
    const syncedCheckStatus = isCheckEngineComp
      ? (hardwareTelemetry?.checkEngineStatus || custom.checkEngineStatus || '0 Fallas • Al Día')
      : null;
    const syncedSource = (isBatteryComp || isCheckEngineComp)
      ? (hardwareTelemetry?.sourceName ?? custom.syncedSource ?? null)
      : null;

    if (isBatteryComp && syncedBatteryLevel !== null && !Number.isNaN(Number(syncedBatteryLevel))) {
      vidaPorcentaje = Math.max(0, Math.min(100, Math.round(Number(syncedBatteryLevel))));
      kmRestantes = Math.round((effectiveIntervalo * vidaPorcentaje) / 100);
    }

    if (isCheckEngineComp && syncedCheckStatus) {
      if (String(syncedCheckStatus).includes('Alerta')) {
        vidaPorcentaje = 15;
        kmRestantes = 0;
      } else if (String(syncedCheckStatus).includes('Service')) {
        vidaPorcentaje = 50;
        kmRestantes = 400;
      } else {
        vidaPorcentaje = 100;
        kmRestantes = effectiveIntervalo;
      }
    }

    const isCritico = isCheckEngineComp && syncedCheckStatus
      ? String(syncedCheckStatus).includes('Alerta')
      : isBatteryComp && syncedBatteryVoltage !== null
      ? (Number(syncedBatteryVoltage) < 12.1 || vidaPorcentaje <= 35 || kmRestantes <= alertaMargin)
      : (kmRestantes <= alertaMargin);
    const isPreventivo = isCheckEngineComp && syncedCheckStatus
      ? (!isCritico && String(syncedCheckStatus).includes('Service'))
      : isBatteryComp && syncedBatteryVoltage !== null
      ? (!isCritico && (Number(syncedBatteryVoltage) < 12.5 || vidaPorcentaje <= 65 || kmRestantes <= alertaMargin * 2))
      : (kmRestantes <= alertaMargin * 2 && !isCritico);
    const isOptimo = !isCritico && !isPreventivo;

    return {
      ...comp,
      ...custom,
      intervalo: effectiveIntervalo,
      baseIntervalo,
      ultimoCambioKm,
      kmRestantes,
      vidaPorcentaje,
      isCritico,
      isPreventivo,
      isOptimo,
      isBatteryComp,
      isCheckEngineComp,
      syncedBatteryLevel,
      syncedBatteryVoltage,
      syncedCheckStatus,
      syncedSource
    };
  });

  // Filtrar por categoría
  const componentesFiltrados = listaComponentes.filter((comp) => {
    if (categoriaActiva === "todas") return true;
    return comp.categoria === categoriaActiva;
  });

  const criticosCount = listaComponentes.filter(c => c.isCritico).length;
  const preventivosCount = listaComponentes.filter(c => c.isPreventivo).length;
  const optimosCount = listaComponentes.filter(c => c.isOptimo).length;

  return (
    <div className="cockpit-card rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
      {/* Header Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold tracking-wider uppercase text-white font-racing">
              {t('widgets.maintenance.title')}
            </h3>
            <span className="text-[10px] font-mono text-neutral-400">
              {t('widgets.maintenance.subtitle', { count: listaComponentes.length })}
            </span>
          </div>
        </div>

        {/* Selector de Severidad de Manejo & Añadir Pieza */}
        <div className="flex items-center gap-2">
          {/* Selector de Condición de Uso */}
          <div className="flex bg-neutral-900 border border-neutral-800 p-0.5 rounded-xl text-[10px] font-mono">
            <button
              onClick={() => onChangeRidingCondition && onChangeRidingCondition('ciudad')}
              className={`px-2 py-0.5 rounded-lg transition ${
                ridingCondition === 'ciudad' ? "bg-amber-500 text-black font-bold" : "text-neutral-400 hover:text-white"
              }`}
            >
              {t('widgets.maintenance.city')}
            </button>
            <button
              onClick={() => onChangeRidingCondition && onChangeRidingCondition('normal')}
              className={`px-2 py-0.5 rounded-lg transition ${
                ridingCondition === 'normal' ? "bg-amber-500 text-black font-bold" : "text-neutral-400 hover:text-white"
              }`}
            >
              {t('widgets.maintenance.standard')}
            </button>
            <button
              onClick={() => onChangeRidingCondition && onChangeRidingCondition('carretera')}
              className={`px-2 py-0.5 rounded-lg transition ${
                ridingCondition === 'carretera' ? "bg-amber-500 text-black font-bold" : "text-neutral-400 hover:text-white"
              }`}
            >
              {t('widgets.maintenance.highway')}
            </button>
          </div>

          {/* Botón Agregar Pieza Personalizada */}
          <button
            onClick={() => onOpenEditComponentModal && onOpenEditComponentModal(null)}
            className="py-1 px-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-neutral-700 text-xs font-racing font-bold flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('widgets.maintenance.addPart')}</span>
          </button>
        </div>
      </div>

      {/* BARRA PRINCIPAL DE TELEMETRÍA EN VIVO TFT / OBD-II (CHECK ENGINE / SERVICE & BATERÍA) */}
      <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900/95 to-emerald-950/25 border border-emerald-500/35 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1 font-mono">
          {/* 1. Check Engine / Service ECU */}
          <div className="p-2.5 rounded-xl bg-neutral-950/90 border border-emerald-500/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase text-neutral-400 block">
                  CHECK ENGINE / SERVICE
                </span>
                <span className={`text-xs font-black ${
                  String(hardwareTelemetry?.checkEngineStatus || customComponents?.check_engine_service_ecu?.checkEngineStatus || '').includes('Alerta')
                    ? 'text-red-400 animate-pulse'
                    : String(hardwareTelemetry?.checkEngineStatus || customComponents?.check_engine_service_ecu?.checkEngineStatus || '').includes('Service')
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}>
                  {hardwareTelemetry?.checkEngineStatus || customComponents?.check_engine_service_ecu?.checkEngineStatus || '0 Fallas • Al Día'}
                </span>
              </div>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          </div>

          {/* 2. Batería & Regulador TFT */}
          <div className="p-2.5 rounded-xl bg-neutral-950/90 border border-cyan-500/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase text-neutral-400 block">
                  BATERÍA & REGULADOR TFT
                </span>
                <span className="text-xs font-black text-cyan-300">
                  {hardwareTelemetry?.batteryVoltage ?? customComponents?.bateria_sistema_carga?.batteryVoltage ?? '13.9'}V •{' '}
                  {hardwareTelemetry?.batteryLevel ?? customComponents?.bateria_sistema_carga?.batteryLevel ?? 95}% Salud
                </span>
              </div>
            </div>
          </div>

          {/* 3. Sistema ABS & Temperatura Motor */}
          <div className="p-2.5 rounded-xl bg-neutral-950/90 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Disc className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase text-neutral-400 block">
                  SISTEMA ABS & MOTOR
                </span>
                <span className="text-xs font-black text-white">
                  {hardwareTelemetry?.absStatus || 'ABS SuperMoto OK'} • {hardwareTelemetry?.engineTempC || 84}°C
                </span>
              </div>
            </div>
          </div>
        </div>

        {onOpenHardwareBridgeModal && (
          <button
            type="button"
            onClick={onOpenHardwareBridgeModal}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 font-racing font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 whitespace-nowrap transition"
          >
            <Bluetooth className="w-3.5 h-3.5 text-emerald-400" />
            <span>Actualizar con TFT / Cable</span>
          </button>
        )}
      </div>

      {/* Selector de Categorías (Pestañas) */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 border-b border-neutral-800">
        {Object.values(CATEGORIAS_MANTENIMIENTO).map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoriaActiva(cat.id)}
            className={`py-1.5 px-3 rounded-xl text-xs font-racing font-bold transition whitespace-nowrap ${
              categoriaActiva === cat.id
                ? "bg-amber-500 text-black shadow-md"
                : "bg-neutral-900/60 border border-neutral-800 text-neutral-400 hover:text-white"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid de Componentes con Botón Editable ⚙️ en cada tarjeta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
        {componentesFiltrados.map((comp) => {
          const IconComponent = ICONS_MAP[comp.icono] || Wrench;

          return (
            <div 
              key={comp.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                comp.isCritico
                  ? "bg-red-950/30 border-red-500/60 shadow-lg shadow-red-950/30"
                  : comp.isPreventivo
                  ? "bg-amber-950/20 border-amber-500/40"
                  : "bg-neutral-900/50 border-neutral-800/80 hover:border-neutral-700"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg border ${
                    comp.isCritico
                      ? "bg-red-950 border-red-500 text-red-400 animate-pulse"
                      : comp.isPreventivo
                      ? "bg-amber-950 border-amber-500 text-amber-400"
                      : "bg-neutral-800 border-neutral-700 text-neutral-300"
                  }`}>
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-200 flex items-center flex-wrap gap-1.5">
                      {comp.label}
                      {comp.isCustom && (
                        <span className="text-[9px] bg-neutral-800 text-amber-400 border border-neutral-700 px-1.5 rounded font-mono">
                          CUSTOM
                        </span>
                      )}
                      {comp.isBatteryComp && comp.syncedBatteryVoltage && (
                        <span className="text-[9px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                          <Zap className="w-2.5 h-2.5 text-emerald-400" />
                          {comp.syncedBatteryVoltage}V • {comp.vidaPorcentaje}% TFT/OBD
                        </span>
                      )}
                      {comp.isCheckEngineComp && comp.syncedCheckStatus && (
                        <span className="text-[9px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                          <Activity className="w-2.5 h-2.5 text-emerald-400" />
                          {comp.syncedCheckStatus}
                        </span>
                      )}
                    </h4>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {(comp.isBatteryComp || comp.isCheckEngineComp) && comp.syncedSource ? (
                        <span className="text-cyan-400">
                          Sincronizado con <strong>{comp.syncedSource}</strong> ({comp.intervalo.toLocaleString()} km ciclo)
                        </span>
                      ) : (
                        <>
                          {t('widgets.maintenance.intervalEvery')} <strong className="text-neutral-200">{comp.intervalo.toLocaleString()} km</strong>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-mono font-bold ${
                    comp.isCritico 
                      ? "text-red-400 animate-pulse" 
                      : comp.isPreventivo 
                      ? "text-amber-400" 
                      : "text-neutral-200"
                  }`}>
                    {comp.isCheckEngineComp && comp.syncedCheckStatus
                      ? comp.syncedCheckStatus
                      : comp.isBatteryComp && comp.syncedBatteryVoltage
                      ? `${comp.syncedBatteryVoltage}V • ${comp.vidaPorcentaje}%`
                      : `${comp.kmRestantes.toLocaleString()} km`}
                  </span>
                  <span className="text-[9px] text-neutral-500 block">
                    {comp.isCheckEngineComp
                      ? 'Escaneo ECU Activo'
                      : comp.isBatteryComp && comp.syncedBatteryVoltage
                      ? `≈ ${comp.kmRestantes.toLocaleString()} km est.`
                      : `${comp.vidaPorcentaje}% ${t('widgets.maintenance.remaining')}`}
                  </span>
                </div>
              </div>

              {/* Barra de Desgaste */}
              <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mb-2">
                <div 
                  className={`h-full transition-all duration-300 ${
                    comp.isCritico
                      ? "bg-red-500"
                      : comp.isPreventivo
                      ? "bg-amber-400"
                      : "bg-emerald-400"
                  }`}
                  style={{ width: `${comp.vidaPorcentaje}%` }}
                />
              </div>

              {/* Pie de Tarjeta con Botón Editable ⚙️ y Registrar Cambio ✎ */}
              <div className="flex justify-between items-center text-[10px] text-neutral-400 font-mono pt-1.5 border-t border-neutral-800/40">
                <span className="text-neutral-500 truncate max-w-[145px]" title={comp.especificacion}>
                  {comp.ultimoCambioKm > 0 ? `${t('widgets.maintenance.lastChange')} ${comp.ultimoCambioKm.toLocaleString()} km` : comp.especificacion}
                </span>

                <div className="flex items-center gap-1.5">
                  {(comp.isBatteryComp || comp.isCheckEngineComp) && onOpenHardwareBridgeModal && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenHardwareBridgeModal();
                      }}
                      className="flex items-center gap-1 text-cyan-300 hover:text-white bg-cyan-950/60 hover:bg-cyan-900/70 px-2 py-0.5 rounded-lg border border-cyan-500/40 transition font-bold"
                      title="Actualizar desde el Tablero TFT o Cable OBD-II"
                    >
                      <Bluetooth className="w-3 h-3 text-cyan-400" />
                      <span>TFT/OBD</span>
                    </button>
                  )}
                  {/* Botón Editable para Ajustar Intervalo en Su Moto */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenEditComponentModal(comp);
                    }}
                    className="flex items-center gap-1 text-neutral-400 hover:text-white bg-neutral-800/80 hover:bg-neutral-700 px-2 py-0.5 rounded-lg border border-neutral-700/60 transition"
                  >
                    <Settings className="w-3 h-3 text-amber-400" />
                    <span>{t('widgets.maintenance.calibrateKm')}</span>
                  </button>

                  {/* Botón Registrar Servicio */}
                  <button
                    type="button"
                    onClick={() => onOpenOdometerModal(comp.id)}
                    className="flex items-center gap-1 text-black font-bold bg-amber-500 hover:bg-amber-400 px-2 py-0.5 rounded-lg transition"
                  >
                    <span>{t('widgets.maintenance.changeBtn')}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Informativo */}
      <div className="flex justify-between items-center pt-3 border-t border-neutral-800 text-xs text-neutral-500 mt-4">
        <span>{t('widgets.maintenance.footerNote')}</span>
        <button
          onClick={() => onOpenEditComponentModal && onOpenEditComponentModal(null)}
          className="text-amber-400 hover:text-amber-300 font-bold font-racing uppercase tracking-wider text-[11px] flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('widgets.maintenance.addCustomPart')}</span>
        </button>
      </div>
    </div>
  );
}
