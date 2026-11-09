import React from 'react';
import { Zap, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';

export default function RpmWidget({ currentRpm, maxRpm, redlineRpm }) {
  const { t } = useLanguage();
  const percentage = Math.min((currentRpm / maxRpm) * 100, 100);
  const redlinePercentage = (redlineRpm / maxRpm) * 100;
  const isRedline = currentRpm >= redlineRpm;
  const isShiftWarning = currentRpm >= (redlineRpm - 800);

  // Generar marcas de escala (cada 1000 o 2000 RPM)
  const step = maxRpm > 12000 ? 2000 : 1000;
  const tickCount = Math.floor(maxRpm / step);
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => i * step);

  return (
    <div className={`cockpit-card rounded-3xl p-6 relative overflow-hidden shadow-2xl transition-all duration-200 ${
      isRedline ? "ring-2 ring-red-500/80 bg-red-950/20" : ""
    }`}>
      {/* Shift Light de Alerta */}
      {isShiftWarning && (
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${isRedline ? "bg-red-500 animate-pulse" : "bg-amber-400"}`} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-neutral-400" />
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-400 font-racing">
            {t('widgets.rpm.title')}
          </span>
        </div>
        {isRedline ? (
          <div className="flex items-center gap-1 text-red-500 text-xs font-bold animate-bounce font-racing">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>SHIFT!</span>
          </div>
        ) : (
          <span className="text-[11px] font-mono text-neutral-500">
            {t('widgets.rpm.redlineCut')} {redlineRpm.toLocaleString()} RPM
          </span>
        )}
      </div>

      {/* Lectura numérica central */}
      <div className="flex items-baseline justify-between my-2">
        <div>
          <span className={`text-5xl sm:text-6xl font-black font-racing tracking-tight transition-colors ${
            isRedline ? "text-red-500" : "text-white"
          }`}>
            {currentRpm.toLocaleString()}
          </span>
          <span className="text-sm font-bold text-neutral-500 ml-2 font-racing">RPM</span>
        </div>
        <div className="text-right">
          <span className="text-xs text-neutral-500 font-mono block">{t('widgets.rpm.engineLimit')}</span>
          <span className="text-sm font-mono font-bold text-neutral-300">{maxRpm.toLocaleString()}</span>
        </div>
      </div>

      {/* Barra de RPM Segmentada tipo F1 / Moto2 */}
      <div className="relative mt-5 mb-2">
        <div className="w-full bg-neutral-900 border border-neutral-800 h-6 rounded-xl overflow-hidden p-0.5 flex relative">
          {/* Marca de Redline */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-red-600/90 z-20 shadow-sm"
            style={{ left: `${redlinePercentage}%` }}
          />

          {/* Barra de progreso con gradiente inyectado */}
          <div 
            className="h-full rounded-lg transition-all duration-75"
            style={{ 
              width: `${percentage}%`,
              backgroundColor: isRedline ? "#ef4444" : "var(--primary-accent)",
              boxShadow: isRedline ? "0 0 20px #ef4444" : "0 0 15px var(--accent-glow)"
            }}
          />
        </div>

        {/* Marcas de escala numérica inferior */}
        <div className="flex justify-between text-[10px] text-neutral-500 font-mono mt-1.5 px-1">
          {ticks.map((t) => (
            <span key={t} className={t >= redlineRpm ? "text-red-400 font-bold" : ""}>
              {t / 1000}k
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

