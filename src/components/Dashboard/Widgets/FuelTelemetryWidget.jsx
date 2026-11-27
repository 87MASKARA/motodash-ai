import React from 'react';
import { Fuel, TrendingUp, CheckCircle2, Droplets, Bluetooth, Gauge } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { getCountryFuelConfig, litersToGallons } from '../../../services/fuelUnitsService';
import { computeDynamicFuelFromOdometer } from '../../../services/hardwareBridgeService';

export default function FuelTelemetryWidget({
  tankCapacity = 14,
  engineCc = 400,
  tanqueos = [],
  currency = 'COP',
  hardwareTelemetry = null,
  bike = null,
  hojaDeVida = null,
  userProfile = null,
  onOpenOdometerModal,
  onOpenHardwareBridgeModal
}) {
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  // Estimación base por cilindrada o cálculo real si el usuario ha registrado tanqueos o sincronizado con TFT/OBD
  const defaultKmPerLiter = engineCc <= 250 ? 38 : engineCc <= 650 ? 26 : 19;
  const latestRefuel = Array.isArray(tanqueos) && tanqueos.length > 0 ? tanqueos[0] : null;

  // Calcular combustible real respetando el porcentaje explícito del tablero TFT o foto escaneada
  const currentOdo = Number(bike?.odometer || hardwareTelemetry?.odometerKm) || 0;
  const explicitPct =
    hardwareTelemetry && typeof hardwareTelemetry.fuelLevelPercent === 'number'
      ? hardwareTelemetry.fuelLevelPercent
      : null;

  const dynamicFuel = computeDynamicFuelFromOdometer(bike, currentOdo, explicitPct);
  const hasTftFuel = Boolean(hardwareTelemetry || latestRefuel);
  const resolvedFuelPercent = dynamicFuel.fuelLevelPercent;
  const resolvedFuelBars = hardwareTelemetry?.fuelBars ?? dynamicFuel.fuelBars ?? Math.round((resolvedFuelPercent / 100) * 6);

  const kmPerLiter = Number((hardwareTelemetry?.realKmPerLiter || latestRefuel?.kmPerLiter || defaultKmPerLiter).toFixed(1));
  const kmPerGalon = latestRefuel?.kmPerGalon || Math.round(kmPerLiter * 3.78541);

  // Detectar si el país del usuario vende gasolina en GALONES o en LITROS
  const fuelConfig = getCountryFuelConfig({
    bike,
    hojaDeVida: hojaDeVida || bike?.hojaDeVida,
    userProfile,
    currency
  });
  const isGallons = fuelConfig.isGallons;

  const tankGallons = litersToGallons(tankCapacity);
  const remainingLiters = hasTftFuel
    ? Number(((tankCapacity * resolvedFuelPercent) / 100).toFixed(1))
    : tankCapacity;
  const remainingGallons = litersToGallons(remainingLiters);
  const estimatedRangeKm = Math.round(Number(remainingLiters) * kmPerLiter);

  const latestGallons = latestRefuel
    ? latestRefuel.gallons ??
      (!latestRefuel.unitUsed && isGallons && Number(latestRefuel.liters) <= 5.5
        ? Number(latestRefuel.liters)
        : litersToGallons(latestRefuel.liters))
    : null;

  return (
    <div className="cockpit-card rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Fuel className="w-4 h-4 text-neutral-400" />
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-400 font-racing">
            {t('widgets.fuel.title')}
          </span>
          <span
            className="px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-700 text-[10px] font-mono text-amber-300"
            title={`Unidad oficial de estación en ${fuelConfig.country}`}
          >
            {fuelConfig.flag} {isGallons ? (isEn ? 'Gallons' : 'Galones') : (isEn ? 'Liters' : 'Litros')}
          </span>
        </div>

        {hasTftFuel ? (
          <button
            type="button"
            onClick={() => onOpenHardwareBridgeModal && onOpenHardwareBridgeModal()}
            className="px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-300 flex items-center gap-1 hover:bg-cyan-900/60 transition"
          >
            <Bluetooth className="w-3 h-3 text-cyan-400" />
            <span>
              TFT ({resolvedFuelBars}/6) • {resolvedFuelPercent}% (
              {isGallons ? `${remainingGallons} Gal` : `${remainingLiters}L`})
            </span>
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

      {/* Barra de Nivel de Gasolina TFT de 6 Segmentos (idéntica al tablero físico) */}
      {hasTftFuel && (
        <div className="mb-3 p-2.5 rounded-2xl bg-neutral-900/75 border border-cyan-500/25">
          <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
            <span className="text-cyan-300 font-bold flex items-center gap-1">
              <Gauge className="w-3 h-3 text-cyan-400" />
              {isGallons
                ? `Tanque TFT (${resolvedFuelBars}/6 barras): ${resolvedFuelPercent}% (${remainingGallons} Gal / ${tankGallons} Gal)`
                : `Tanque TFT (${resolvedFuelBars}/6 barras): ${resolvedFuelPercent}% (${remainingLiters}L / ${tankCapacity}L)`}
            </span>
            {hardwareTelemetry?.rideMode && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
                MODO {hardwareTelemetry.rideMode}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-mono font-bold text-amber-400">E</span>
            {[1, 2, 3, 4, 5, 6].map((bar) => (
              <div
                key={bar}
                className={`h-2.5 flex-1 rounded-sm transition-all duration-300 ${
                  bar <= resolvedFuelBars
                    ? resolvedFuelBars <= 1
                      ? 'bg-red-500'
                      : 'bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.6)]'
                    : 'bg-neutral-800'
                }`}
              />
            ))}
            <span className="text-[9px] font-mono font-bold text-white">F</span>
          </div>
        </div>
      )}

      {/* Grid de Rendimiento Adaptado al País */}
      <div className="grid grid-cols-2 gap-3 my-auto">
        <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80">
          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-1">
            <span>{latestRefuel?.kmPerLiter ? t('widgets.fuel.measuredConsumption') : t('widgets.fuel.realPerformance')}</span>
            <TrendingUp className="w-3 h-3 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black font-telemetry text-white">
              {isGallons ? kmPerGalon : kmPerLiter}
            </span>
            <span className="text-xs font-mono font-bold text-amber-400">
              {isGallons ? 'KM / GAL' : 'KM / L'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-neutral-500 block mt-0.5">
            {isGallons
              ? `≈ ${kmPerLiter} KM / Litro`
              : `≈ ${kmPerGalon} ${t('widgets.fuel.perGallon')}`}
          </span>
        </div>

        {/* Autonomía Restante Real */}
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
            {isGallons
              ? isEn
                ? `Remaining: ${remainingGallons} of ${tankGallons} Gal`
                : `Restante: ${remainingGallons} de ${tankGallons} Gal (${tankCapacity}L)`
              : t('widgets.fuel.fullTankOf', { liters: tankCapacity })}
          </span>
        </div>
      </div>

      {/* Footer con último tanqueo en la unidad oficial del país */}
      <div className="flex justify-between items-center pt-3 border-t border-neutral-800/80 text-xs">
        <span className="text-neutral-500 font-mono text-[11px] truncate max-w-[62%]">
          {latestRefuel
            ? isGallons
              ? `Último: ${latestGallons} Gal ($${Number(latestRefuel.cost).toLocaleString()} ${currency})`
              : t('widgets.fuel.latestRefuel', {
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
