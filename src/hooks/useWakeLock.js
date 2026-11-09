import { useState, useEffect, useRef } from 'react';

/**
 * Hook para mantener la pantalla del teléfono encendida sin apagarse
 * indispensable cuando el piloto monta el móvil en el manillar de la moto.
 */
export function useWakeLock(enabled = true) {
  const [isLocked, setIsLocked] = useState(false);
  const wakeLockRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
        setIsLocked(false);
      }
      return;
    }

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          setIsLocked(true);

          wakeLockRef.current.addEventListener('release', () => {
            setIsLocked(false);
          });
        }
      } catch (err) {
        console.warn('Wake Lock no disponible o permiso denegado:', err.message);
        setIsLocked(false);
      }
    };

    requestWakeLock();

    // Re-solicitar si el usuario minimiza y vuelve a la app
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, [enabled]);

  return isLocked;
}

