import React from 'react';
import { Gauge } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';

export default function SpeedometerWidget({ speed, maxSpeed, gear = 'N', unit = "km/h", isGpsActive, isSimulating }) {
  const { t } = useLanguage();
  return (
    <div className="cockpit-card rounded-3xl p-6 relative flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-300">
      {/* Luz ambiental de fondo */}
      <div 
        className="absolute -right-16 -top-16 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: "var(--primary-accent)" }}
      />

      {/* Header del Widget */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-neutral-400" />
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-400 font-racing">
            {t('widgets.speedometer.title')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-0.5 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-racing font-black flex items-center gap-1">
            <span className="text-neutral-500 text-[9px]">GEAR</span>
            <span style={{ color: gear === 'N' ? '#34d399' : 'var(--primary-accent)' }}>{gear}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900/80 border border-neutral-800 text-[11px]">
            <span className={`w-2 h-2 rounded-full ${isGpsActive ? "bg-emerald-500 animate-pulse" : "bg-neutral-600"}`} />
            <span className="text-neutral-300 font-mono text-[10px]">
              {isSimulating
                ? t('widgets.speedometer.demoTelemetry')
                : isGpsActive
                ? t('widgets.speedometer.gpsLive')
                : t('widgets.speedometer.searchingGps')}
            </span>
          </div>
        </div>
      </div>

      {/* Número Central Gigante */}
      <div className="my-6 text-center z-10">
        <div className="flex items-baseline justify-center">
          <span 
            className="text-8xl sm:text-9xl font-black font-racing tracking-tight transition-all duration-100 tabular-nums"
            style={{ 
              color: "var(--primary-accent)",
              textShadow: "0 0 35px var(--accent-glow)"
            }}
          >
            {speed}
          </span>
          <span className="text-xl sm:text-2xl font-bold text-neutral-400 font-racing uppercase ml-2">
            {unit}
          </span>
        </div>
      </div>

      {/* Footer con Top Speed del viaje */}
      <div className="flex justify-between items-center z-10 pt-4 border-t border-neutral-800/80 text-xs">
        <span className="text-neutral-500 font-medium">{t('widgets.speedometer.maxSessionSpeed')}</span>
        <span className="font-mono font-bold text-neutral-200">
          {maxSpeed} <span className="text-neutral-500 font-normal">{unit}</span>
        </span>
      </div>
    </div>
  );
}
