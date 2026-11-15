import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

const INTRO_DURATION_MS = 10000; // 10 segundos exactos

export default function VideoIntroSplash({ onFinish }) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const videoRef = useRef(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  // Sonido activo por defecto
  const [isMuted, setIsMuted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (videoEl) {
      videoEl.volume = 1.0;
      videoEl.muted = false;
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Si el navegador móvil exige primer toque para liberar el canal de audio,
          // arrancamos el video sin congelarlo y activamos el audio al primer roce de pantalla
          videoEl.muted = true;
          videoEl.play().catch(() => {});
        });
      }
    }

    // Desbloqueo instantáneo de audio al primer toque en celular si el navegador lo retuvo
    const unlockAudioOnTouch = () => {
      if (videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.volume = 1.0;
        videoRef.current.play().catch(() => {});
        setIsMuted(false);
      }
    };

    window.addEventListener('touchstart', unlockAudioOnTouch, { once: true, passive: true });
    window.addEventListener('pointerdown', unlockAudioOnTouch, { once: true, passive: true });

    const startTime = Date.now();
    const interval = setInterval(() => {
      const diff = Date.now() - startTime;
      if (diff >= INTRO_DURATION_MS) {
        setElapsedMs(INTRO_DURATION_MS);
        clearInterval(interval);
        handleComplete();
      } else {
        setElapsedMs(diff);
      }
    }, 50);

    return () => {
      clearInterval(interval);
      window.removeEventListener('touchstart', unlockAudioOnTouch);
      window.removeEventListener('pointerdown', unlockAudioOnTouch);
    };
  }, []);

  const handleComplete = () => {
    setIsClosing(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 400);
  };

  const toggleSound = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    if (!nextMuted) {
      videoRef.current.volume = 1.0;
      videoRef.current.play().catch(() => {});
    }
    setIsMuted(nextMuted);
  };

  const progressPct = Math.min(100, Math.round((elapsedMs / INTRO_DURATION_MS) * 100));

  return (
    <div
      className={`fixed inset-0 z-[200] bg-black flex flex-col justify-between overflow-hidden select-none transition-opacity duration-500 ${
        isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Video Principal Optimizado para Celular Vertical y Desktop */}
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        {/* Fondo ambiental difuminado en móvil para evitar bordes vacíos sin recortar la moto */}
        <video
          src="/motodash-intro.mp4"
          autoPlay
          muted
          playsInline
          loop
          aria-hidden="true"
          className="sm:hidden absolute inset-0 w-full h-full object-cover blur-2xl opacity-45 scale-110 pointer-events-none"
        />

        <video
          ref={videoRef}
          src="/motodash-intro.mp4"
          autoPlay
          playsInline
          loop
          className="relative w-full h-full object-contain sm:object-cover"
        />
      </div>

      {/* Gradiente sutil solo arriba y abajo para dejar el centro del video 100% limpio */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

      {/* Controles Superiores Minimalistas */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-8 pt-4 sm:pt-6 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={toggleSound}
          className="px-3 py-1.5 rounded-full bg-black/60 hover:bg-neutral-900/90 backdrop-blur-md border border-white/15 text-[11px] font-mono text-neutral-200 flex items-center gap-1.5 transition"
        >
          {isMuted ? (
            <>
              <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
              <span>{isEn ? 'Muted' : 'Sin Audio'}</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{isEn ? 'Sound ON' : 'Sonido Activo'}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleComplete}
          className="px-3.5 py-1.5 rounded-full bg-amber-500/90 hover:bg-amber-400 text-black font-racing font-black uppercase tracking-wider text-[11px] flex items-center gap-1 shadow-lg shadow-amber-500/30 transition active:scale-95"
        >
          <span>{isEn ? 'Skip' : 'Entrar'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Únicamente el Título Oficial Premium en la Parte Inferior sin tapar el Video */}
      <div className="relative z-10 max-w-4xl w-full mx-auto px-4 pb-7 sm:pb-10 text-center">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-racing uppercase tracking-tight leading-none text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
          MOTO<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500">DASH</span>{' '}
          <span className="inline-block px-2.5 py-0.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-black text-2xl sm:text-4xl md:text-5xl align-middle shadow-xl shadow-amber-500/40">
            AI
          </span>
        </h1>

        {/* Barra de Progreso Fina y Elegante de 10s */}
        <div className="mt-4 max-w-xs sm:max-w-md mx-auto">
          <div className="w-full h-1 bg-white/15 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 transition-all duration-100"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
