import React from 'react';
import { Fuel, TrendingUp, CheckCircle2, Droplets, Bluetooth, Gauge } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';

export default function FuelTelemetryWidget({ 
  tankCapacity = 14, 
  engineCc = 400,
  tanqueos = [],
  currency = 'COP',
  hardwareTelemetry = null,
  onOpenOdometerModal,
  onOpenHardwareBridgeModal
}) {
  const { t } = useLanguage();
  // Estimación base por cilindrada o cálculo real si el usuario ha registrado tanqueos o sincronizado con TFT/OBD
  const defaultKmPerLiter = engineCc <= 250 ? 38 : engineCc <= 650 ? 26 : 19;
  const latestRefuel = Array.isArray(tanqueos) && tanqueos.length > 0 ? tanqueos[0] : null;
  const hasTftFuel = hardwareTelemetry && typeof hardwareTelemetry.fuelLevelPercent === 'number';
  const kmPerLiter = hardwareTelemetry?.realKmPerLiter || latestRefuel?.kmPerLiter || defaultKmPerLiter;
  const kmPerGalon = Math.round(kmPerLiter * 3.785);
  const estimatedRangeKm = hardwareTelemetry?.estimatedRangeKm || Math.round(tankCapacity * kmPerLiter);

  return (
    <div className="cockpit-card rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Fuel className="w-4 h-4 text-neutral-400" />
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-400 font-racing">
            {t('widgets.fuel.title')}
          </span>
        </div>
        {hasTftFuel ? (
          <button
            type="button"
            onClick={() => onOpenHardwareBridgeModal && onOpenHardwareBridgeModal()}
            className="px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-300 flex items-center gap-1 hover:bg-cyan-900/60 transition"
          >
            <Bluetooth className="w-3 h-3 text-cyan-400" />
            TFT/OBD • {hardwareTelemetry.fuelLevelPercent}% ({hardwareTelemetry.fuelLitersRemaining}L)
          </button>
        ) : (
          <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {latestRefuel
              ? t('widgets.fuel.refuelsCount', { count: tanqueos.length })
              : t('widgets.fuel.optimalFi')}
          </span>
        )}
      </div>

      {/* Barra de Nivel de Gasolina TFT/OBD (cuando se ha sincronizado con el tablero) */}
      {hasTftFuel && (
        <div className="mb-3 p-2.5 rounded-2xl bg-neutral-900/75 border border-cyan-500/25">
          <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
            <span className="text-cyan-300 font-bold flex items-center gap-1">
              <Gauge className="w-3 h-3 text-cyan-400" />
              Tanque TFT: {hardwareTelemetry.fuelLevelPercent}% ({hardwareTelemetry.fuelLitersRemaining}L / {tankCapacity}L)
            </span>
            {hardwareTelemetry.rideMode && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
                MODO {hardwareTelemetry.rideMode}
              </span>
            )}
          </div>
          <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                hardwareTelemetry.fuelLevelPercent <= 20
                  ? 'bg-red-500'
                  : hardwareTelemetry.fuelLevelPercent <= 40
                  ? 'bg-amber-400'
                  : 'bg-cyan-400'
              }`}
              style={{ width: `${Math.max(4, Math.min(100, hardwareTelemetry.fuelLevelPercent))}%` }}
            />
          </div>
        </div>
      )}

      {/* Grid de Rendimiento */}
      <div className="grid grid-cols-2 gap-3 my-auto">
        {/* Rendimiento Km/L */}
        <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80">
          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-1">
            <span>{latestRefuel?.kmPerLiter ? t('widgets.fuel.measuredConsumption') : t('widgets.fuel.realPerformance')}</span>
            <TrendingUp className="w-3 h-3 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black font-telemetry text-white">
              {kmPerLiter}
            </span>
            <span className="text-xs font-mono font-bold text-amber-400">
              KM / L
            </span>
          </div>
          <span className="text-[10px] font-mono text-neutral-500 block mt-0.5">
            ≈ {kmPerGalon} {t('widgets.fuel.perGallon')}
          </span>
        </div>

        {/* Autonomía Proyectada */}
        <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80">
          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-1">
            <span>{t('widgets.fuel.maxRange')}</span>
            <Droplets className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black font-telemetry text-white">
              {estimatedRangeKm}
            </span>
            <span className="text-xs font-mono font-bold text-cyan-400">
              KM
            </span>
          </div>
          <span className="text-[10px] font-mono text-neutral-500 block mt-0.5">
            {t('widgets.fuel.fullTankOf', { liters: tankCapacity })}
          </span>
        </div>
      </div>

      {/* Footer con último tanqueo si existe */}
      <div className="flex justify-between items-center pt-3 border-t border-neutral-800/80 text-xs">
        <span className="text-neutral-500 font-mono text-[11px] truncate max-w-[62%]">
          {latestRefuel
            ? t('widgets.fuel.latestRefuel', {
                liters: latestRefuel.liters,
                cost: Number(latestRefuel.cost).toLocaleString(),
                currency
              })
            : t('widgets.fuel.adaptedToCc', { cc: engineCc })}
        </span>
        <button
          onClick={() => onOpenOdometerModal && onOpenOdometerModal('fuel')}
          className="text-amber-400 hover:text-amber-300 font-mono text-[11px] font-bold whitespace-nowrap"
        >
          {t('widgets.fuel.logRefuel')}
        </button>
      </div>
    </div>
  );
}
