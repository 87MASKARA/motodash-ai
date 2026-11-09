import React from 'react';
import { Navigation2, Compass } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';

export default function RouteWidget({
  speed = 0,
  heading = 0,
  isSimulating = false,
  tripDistanceKm = 18.4,
  tripSeconds = 1452,
  avgSpeed = 58
}) {
  const { t } = useLanguage();
  // Conversión de grados de rumbo a dirección cardinal
  const getCardinal = (angle = 0) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    let normalized = angle % 360;
    if (normalized < 0) normalized += 360;
    const index = Math.round(normalized / 45) % 8;
    return directions[index];
  };

  const formatTripTime = (totalSec = 0) => {
    const mins = Math.floor(totalSec / 60);
    const secs = Math.floor(totalSec % 60);
    return `${mins}m ${String(secs).padStart(2, '0')}s`;
  };

  return (
    <div className="cockpit-card rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Navigation2 className="w-4 h-4 text-neutral-400" />
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-400 font-racing">
            {t('widgets.route.title')}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-400">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>{getCardinal(heading)} ({Math.round(heading)}°)</span>
        </div>
      </div>

      {/* Radar de Navegación / Canvas Representativo */}
      <div className="my-auto relative h-36 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 overflow-hidden flex items-center justify-center">
        {/* Cuadrícula de radar */}
        <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
        
        {/* Círculos concéntricos de radar */}
        <div className="absolute w-28 h-28 rounded-full border border-neutral-700/40" />
        <div className="absolute w-16 h-16 rounded-full border border-neutral-700/60" />
        
        {/* Aguja / Marcador del Piloto */}
        <div 
          className="relative z-10 flex flex-col items-center justify-center transition-transform duration-300"
          style={{ transform: `rotate(${heading}deg)` }}
        >
          <div 
            className="w-4 h-4 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
            style={{ backgroundColor: "var(--primary-accent)" }}
          >
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>
          <div 
            className="w-0.5 h-6 opacity-80"
            style={{ backgroundColor: "var(--primary-accent)" }}
          />
        </div>

        {/* Indicador de Estado */}
        <div className="absolute bottom-2 left-3 text-[10px] font-mono text-neutral-500 flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isSimulating || speed > 0 ? "bg-emerald-400 animate-ping" : "bg-neutral-600"}`} />
          <span>{isSimulating ? t('widgets.route.liveSim') : t('widgets.route.gnssActive')}</span>
        </div>
      </div>

      {/* Estadísticas de Viaje Rápido */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-neutral-800/80 text-center">
        <div>
          <span className="text-[10px] text-neutral-500 block uppercase">{t('widgets.route.tripDistance')}</span>
          <span className="text-xs font-bold font-telemetry text-neutral-200">{Number(tripDistanceKm).toFixed(1)} km</span>
        </div>
        <div>
          <span className="text-[10px] text-neutral-500 block uppercase">{t('widgets.route.movingTime')}</span>
          <span className="text-xs font-bold font-telemetry text-neutral-200">{formatTripTime(tripSeconds)}</span>
        </div>
        <div>
          <span className="text-[10px] text-neutral-500 block uppercase">{t('widgets.route.avgSpeed')}</span>
          <span className="text-xs font-bold font-telemetry text-neutral-200">{avgSpeed} km/h</span>
        </div>
      </div>
    </div>
  );
}
