import React, { useState, useEffect, useRef } from 'react';
import { Timer, Trophy, Zap, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';

export default function SprintTimerWidget({ speed }) {
  const { t } = useLanguage();
  const [targetSpeed, setTargetSpeed] = useState(100); // 60 o 100 km/h
  const [sprintState, setSprintState] = useState('ready'); // 'ready' | 'running' | 'finished'
  const [currentTime, setCurrentTime] = useState(0);
  const [bestTime, setBestTime] = useState(() => {
    const saved = localStorage.getItem(`motodash_best_${targetSpeed}`);
    return saved ? parseFloat(saved) : null;
  });

  const startTimeRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Manejo de la lógica del cronómetro de 0 a X km/h
  useEffect(() => {
    // Si la moto vuelve a detenerse a 0 km/h tras terminar, armar nuevo lanzamiento
    if (speed === 0 && sprintState === 'finished') {
      setSprintState('ready');
      setCurrentTime(0);
      return;
    }

    // Inicio del sprint: de 0 km/h a aceleración positiva
    if (speed > 2 && sprintState === 'ready') {
      setSprintState('running');
      startTimeRef.current = performance.now();

      timerIntervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = (performance.now() - startTimeRef.current) / 1000;
          setCurrentTime(elapsed);
        }
      }, 30);
    }

    // Fin del sprint: alcanzó o superó la velocidad objetivo
    if (speed >= targetSpeed && sprintState === 'running') {
      clearInterval(timerIntervalRef.current);
      const finalTime = (performance.now() - startTimeRef.current) / 1000;
      setCurrentTime(finalTime);
      setSprintState('finished');

      // Actualizar récord personal
      setBestTime((prev) => {
        if (!prev || finalTime < prev) {
          localStorage.setItem(`motodash_best_${targetSpeed}`, finalTime.toFixed(2));
          return finalTime;
        }
        return prev;
      });
    }
  }, [speed, sprintState, targetSpeed]);

  const resetSprint = () => {
    clearInterval(timerIntervalRef.current);
    setSprintState('ready');
    setCurrentTime(0);
  };

  const handleTargetChange = (target) => {
    setTargetSpeed(target);
    setSprintState('ready');
    setCurrentTime(0);
    const saved = localStorage.getItem(`motodash_best_${target}`);
    setBestTime(saved ? parseFloat(saved) : null);
  };

  return (
    <div className="cockpit-card rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-neutral-400" />
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-400 font-racing">
            {t('widgets.sprint.title', { target: targetSpeed })}
          </span>
        </div>

        {/* Selector de modo 0-60 / 0-100 */}
        <div className="flex bg-neutral-900 border border-neutral-800 p-0.5 rounded-xl text-[10px] font-mono">
          <button
            onClick={() => handleTargetChange(60)}
            className={`px-2 py-0.5 rounded-lg font-bold transition ${
              targetSpeed === 60 ? "bg-amber-500 text-black" : "text-neutral-400 hover:text-white"
            }`}
          >
            0-60
          </button>
          <button
            onClick={() => handleTargetChange(100)}
            className={`px-2 py-0.5 rounded-lg font-bold transition ${
              targetSpeed === 100 ? "bg-amber-500 text-black" : "text-neutral-400 hover:text-white"
            }`}
          >
            0-100
          </button>
        </div>
      </div>

      {/* Pantalla del Cronómetro */}
      <div className="my-auto py-2 text-center">
        <div className="flex items-baseline justify-center">
          <span 
            className="text-6xl sm:text-7xl font-black font-telemetry tracking-tight"
            style={{ 
              color: sprintState === 'finished' ? "var(--primary-accent)" : "white",
              textShadow: sprintState === 'finished' ? "0 0 25px var(--accent-glow)" : "none"
            }}
          >
            {currentTime.toFixed(2)}
          </span>
          <span className="text-lg font-bold text-neutral-500 ml-1.5 font-racing">{t('widgets.sprint.sec')}</span>
        </div>

        {/* Estado actual del launch */}
        <div className="mt-2">
          {sprintState === 'ready' && (
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-full animate-pulse">
              {t('widgets.sprint.ready')}
            </span>
          )}
          {sprintState === 'running' && (
            <span className="text-xs font-mono text-amber-400 bg-amber-950/40 border border-amber-800/40 px-3 py-1 rounded-full animate-pulse">
              {t('widgets.sprint.running')}
            </span>
          )}
          {sprintState === 'finished' && (
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-3 py-1 rounded-full">
              {t('widgets.sprint.finished')}
            </span>
          )}
        </div>
      </div>

      {/* Footer con Récord Personal y Reset */}
      <div className="flex justify-between items-center pt-3 border-t border-neutral-800/80 text-xs">
        <div className="flex items-center gap-1.5 text-neutral-400">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>{t('widgets.sprint.bestTime')}</span>
          <strong className="font-mono text-neutral-200">
            {bestTime ? `${bestTime.toFixed(2)}s` : "--.--"}
          </strong>
        </div>

        <button
          onClick={resetSprint}
          className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-lg transition"
        >
          <RotateCcw className="w-3 h-3" />
          <span>{t('widgets.sprint.reset')}</span>
        </button>
      </div>
    </div>
  );
}

