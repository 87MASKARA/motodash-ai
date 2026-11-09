import React from 'react';
import { Compass, Mountain, Activity, Fuel, Gauge, Edit3 } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';

export default function TelemetryWidget({ leanAngle, altitude, odometer, tankCapacity, onOpenOdometerModal }) {
  const { t } = useLanguage();
  const absLean = Math.abs(leanAngle);

  return (
    <div className="cockpit-card rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-neutral-400" />
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-400 font-racing">
            {t('widgets.telemetry.title')}
          </span>
        </div>
        <span className="text-[10px] font-mono text-neutral-500 uppercase">{t('widgets.telemetry.subtitle')}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-auto">
        {/* Ángulo de Inclinación (Lean Angle) */}
        <div className="bg-neutral-900/60 border border-neutral-800/80 p-3.5 rounded-2xl text-center">
          <span className="text-[10px] font-medium text-neutral-400 uppercase block mb-1">{t('widgets.telemetry.leanAngle')}</span>
          <div className="flex items-center justify-center gap-0.5">
            <span 
              className="text-2xl font-black font-racing"
              style={{ color: absLean > 35 ? "#ef4444" : "var(--primary-accent)" }}
            >
              {absLean}°
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              {leanAngle < 0 ? "L" : leanAngle > 0 ? "R" : "C"}
            </span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full transition-all duration-100"
              style={{ 
                width: `${Math.min((absLean / 50) * 100, 100)}%`,
                backgroundColor: "var(--primary-accent)"
              }}
            />
          </div>
        </div>

        {/* Altitud Satelital */}
        <div className="bg-neutral-900/60 border border-neutral-800/80 p-3.5 rounded-2xl text-center">
          <span className="text-[10px] font-medium text-neutral-400 uppercase block mb-1">{t('widgets.telemetry.altitude')}</span>
          <div className="flex items-center justify-center gap-1">
            <Mountain className="w-4 h-4 text-neutral-500" />
            <span className="text-2xl font-black font-racing text-neutral-100">{altitude}</span>
          </div>
          <span className="text-[10px] font-mono text-neutral-500">{t('widgets.telemetry.altitudeUnit')}</span>
        </div>

        {/* Odómetro Total Clickeable para Calibrar */}
        <div 
          onClick={() => onOpenOdometerModal && onOpenOdometerModal()}
          className="bg-neutral-900/60 border border-neutral-800/80 hover:border-amber-500/60 p-3.5 rounded-2xl text-center cursor-pointer transition-all group relative"
        >
          <div className="flex items-center justify-center gap-1 mb-1">
            <span className="text-[10px] font-medium text-neutral-400 uppercase">{t('widgets.telemetry.bikeOdometer')}</span>
            <Edit3 className="w-2.5 h-2.5 text-neutral-500 group-hover:text-amber-400 transition" />
          </div>
          <span className="text-xl sm:text-2xl font-black font-telemetry text-neutral-100 block group-hover:text-amber-400 transition">
            {odometer.toLocaleString()}
          </span>
          <span className="text-[10px] font-mono text-amber-400/90 group-hover:underline">
            {t('widgets.telemetry.editRealKm')}
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-neutral-800/80 flex justify-between items-center text-xs text-neutral-400">
        <span className="flex items-center gap-1.5">
          <Fuel className="w-3.5 h-3.5" />
          {t('widgets.telemetry.tank')} <strong className="text-neutral-200">{tankCapacity} L</strong>
        </span>
        <button 
          onClick={() => onOpenOdometerModal && onOpenOdometerModal()}
          className="text-[11px] text-amber-400 hover:text-amber-300 font-medium font-mono"
        >
          {t('widgets.telemetry.logRefuelKm')}
        </button>
      </div>
    </div>
  );
}
