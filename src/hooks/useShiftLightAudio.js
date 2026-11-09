import { useEffect, useRef } from 'react';

export function useShiftLightAudio(currentRpm, redlineRpm, soundEnabled = true) {
  const audioCtxRef = useRef(null);
  const isPlayingRef = useRef(false);

  const isRedline = currentRpm >= redlineRpm;

  useEffect(() => {
    if (!soundEnabled || !isRedline) {
      isPlayingRef.current = false;
      return;
    }

    // Si ya está sonando en esta ráfaga de RPM, no duplicar
    if (isPlayingRef.current) return;

    try {
      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioContext();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Sintetizador de tono agudo tipo carreras (2400 Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, ctx.currentTime);

      // Pulso rápido de 90ms (beep-beep)
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);

      isPlayingRef.current = true;
    } catch (e) {
      console.warn("Audio Context aún no habilitado por interacción del usuario:", e);
    }
  }, [currentRpm, redlineRpm, isRedline, soundEnabled]);
}

