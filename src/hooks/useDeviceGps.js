import { useState, useEffect, useRef, useCallback } from 'react';

// Fórmula de Haversine para calcular distancia real en kilómetros entre dos coordenadas GPS
function computeHaversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useDeviceGps({ maxRpm = 11500, redlineRpm = 10500, autoStart = false } = {}) {
  const [isSimulating, setIsSimulating] = useState(Boolean(autoStart));
  const simStartRef = useRef(performance.now());
  const lastCoordsRef = useRef(null);
  const specsRef = useRef({ maxRpm, redlineRpm });

  useEffect(() => {
    specsRef.current = { maxRpm, redlineRpm };
  }, [maxRpm, redlineRpm]);

  const [telemetry, setTelemetry] = useState({
    speed: 0,
    maxSpeed: 0,
    rpm: 1300,
    gear: 1,
    odometer: 14250,
    heading: 42,
    altitude: 1480,
    isGpsActive: Boolean(autoStart),
    leanAngle: 0,
    tripDistanceKm: 18.4,
    tripSeconds: 1452,
    avgSpeed: 58
  });

  // Giroscopio Real del Dispositivo (DeviceOrientation API) para medir ángulo de inclinación en curva
  useEffect(() => {
    if (isSimulating || typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      return;
    }

    const handleOrientation = (event) => {
      if (typeof event.gamma === 'number') {
        const clampedLean = Math.max(-50, Math.min(50, Math.round(event.gamma)));
        setTelemetry((prev) => ({ ...prev, leanAngle: clampedLean }));
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, true);
    return () => window.removeEventListener('deviceorientation', handleOrientation, true);
  }, [isSimulating]);

  // Modo Real: Geolocation API del dispositivo con acumulación de distancia Haversine
  useEffect(() => {
    if (isSimulating) return;

    if (!('geolocation' in navigator)) {
      return;
    }

    let watchId;
    try {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const currentSpeed = pos.coords.speed !== null && pos.coords.speed > 0
            ? Math.round(pos.coords.speed * 3.6)
            : 0;

          // Calcular distancia incremental entre puntos GPS válidos
          let deltaKm = 0;
          const { latitude, longitude } = pos.coords;
          if (typeof latitude === 'number' && typeof longitude === 'number') {
            if (lastCoordsRef.current) {
              const dist = computeHaversineKm(
                lastCoordsRef.current.lat,
                lastCoordsRef.current.lon,
                latitude,
                longitude
              );
              // Filtrar saltos de ruido GPS (< 0.5 km por lectura)
              if (dist > 0.002 && dist < 0.5) {
                deltaKm = dist;
              }
            }
            lastCoordsRef.current = { lat: latitude, lon: longitude };
          }

          const { redlineRpm: redline } = specsRef.current;
          const idleRpm = 1300;
          const estimatedRpm = currentSpeed === 0
            ? idleRpm
            : Math.min(redline, Math.round(idleRpm + ((currentSpeed % 38) / 38) * (redline - idleRpm - 800) + currentSpeed * 18));

          setTelemetry((prev) => ({
            ...prev,
            speed: currentSpeed,
            maxSpeed: Math.max(prev.maxSpeed, currentSpeed),
            rpm: estimatedRpm,
            gear: currentSpeed === 0 ? 'N' : Math.min(6, Math.max(1, Math.ceil(currentSpeed / 30))),
            heading: pos.coords.heading ? Math.round(pos.coords.heading) : prev.heading,
            altitude: pos.coords.altitude ? Math.round(pos.coords.altitude) : prev.altitude,
            tripDistanceKm: Number((prev.tripDistanceKm + deltaKm).toFixed(2)),
            isGpsActive: true
          }));
        },
        () => {
          setTelemetry((prev) => ({ ...prev, isGpsActive: false }));
        },
        { enableHighAccuracy: true, maximumAge: 500, timeout: 5000 }
      );
    } catch (e) {
      console.warn("No se pudo iniciar el GPS:", e);
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isSimulating]);

  // Modo Simulación / Demo Realista (marchas 1ª a 6ª, corte de RPM, inclinación y ruta)
  useEffect(() => {
    if (!isSimulating) return;

    simStartRef.current = performance.now();

    const interval = setInterval(() => {
      const elapsedSec = (performance.now() - simStartRef.current) / 1000;
      const cycleDuration = 26;
      const t = elapsedSec % cycleDuration;

      const { maxRpm: currentMaxRpm, redlineRpm: currentRedline } = specsRef.current;
      const idleRpm = 1350;

      let speed = 0;
      let rpm = idleRpm;
      let gear = 'N';
      let lean = 0;

      if (t < 1.4) {
        speed = 0;
        gear = 1;
        rpm = Math.round(idleRpm + Math.sin(t * 14) * 250 + (t > 0.8 ? 1800 : 0));
        lean = 0;
      } else if (t < 12.4) {
        const accelT = (t - 1.4) / 11.0;
        const eased = 1 - Math.pow(1 - accelT, 1.85);
        speed = Math.round(eased * 184);

        const shiftSpeeds = [0, 44, 78, 110, 140, 166, 200];
        let g = 1;
        for (let i = 1; i <= 6; i++) {
          if (speed >= shiftSpeeds[i - 1]) g = i;
        }
        gear = g;

        const lowSpeed = shiftSpeeds[g - 1];
        const highSpeed = shiftSpeeds[g];
        const gearProgress = Math.min(1, Math.max(0, (speed - lowSpeed) / (highSpeed - lowSpeed)));
        const baseGearRpm = g === 1 ? idleRpm + 800 : Math.round(currentRedline * 0.64);
        const peakTarget = Math.min(currentMaxRpm - 150, currentRedline + 250);
        rpm = Math.round(baseGearRpm + gearProgress * (peakTarget - baseGearRpm));
        lean = Math.round(Math.sin((t - 1.4) * 0.9) * 18);
      } else if (t < 20.5) {
        const cornerT = t - 12.4;
        speed = Math.round(132 + Math.sin(cornerT * 1.1) * 28);
        gear = speed > 145 ? 5 : 4;
        const rpmWave = 0.72 + 0.24 * Math.sin(cornerT * 1.5);
        rpm = Math.round(Math.min(currentMaxRpm - 200, currentRedline * rpmWave));
        lean = Math.round(Math.sin(cornerT * 1.35) * 38);
      } else {
        const brakeProgress = (t - 20.5) / (cycleDuration - 20.5);
        speed = Math.max(0, Math.round(115 * (1 - brakeProgress)));
        gear = speed === 0 ? 'N' : Math.max(1, Math.ceil(speed / 28));
        rpm = speed === 0
          ? idleRpm
          : Math.round(idleRpm + 1400 + ((speed % 28) / 28) * (currentRedline * 0.45));
        lean = Math.round((1 - brakeProgress) * 10 * Math.sin(t * 2));
      }

      setTelemetry((prev) => {
        const deltaHours = 0.08 / 3600;
        const addedKm = speed * deltaHours;
        const nextTripKm = Number((prev.tripDistanceKm + addedKm).toFixed(2));
        const nextHeading = (Math.round(42 + elapsedSec * 6 + Math.sin(elapsedSec * 0.5) * 25) % 360 + 360) % 360;
        const nextAltitude = Math.round(1480 + Math.sin(elapsedSec * 0.15) * 35);

        return {
          ...prev,
          speed,
          maxSpeed: Math.max(prev.maxSpeed, speed),
          rpm,
          gear,
          leanAngle: lean,
          heading: nextHeading,
          altitude: nextAltitude,
          tripDistanceKm: nextTripKm,
          tripSeconds: prev.tripSeconds + 0.08,
          avgSpeed: Math.max(42, Math.round((prev.avgSpeed * 0.98) + (Math.max(speed, 35) * 0.02))),
          isGpsActive: true
        };
      });
    }, 80);

    return () => clearInterval(interval);
  }, [isSimulating]);

  const toggleSimulation = useCallback(() => {
    setIsSimulating((prev) => !prev);
  }, []);

  const startSimulation = useCallback(() => {
    simStartRef.current = performance.now();
    setTelemetry((prev) => ({
      ...prev,
      speed: 0,
      maxSpeed: 0,
      rpm: 1350,
      gear: 1,
      leanAngle: 0,
      isGpsActive: true
    }));
    setIsSimulating(true);
  }, []);

  const stopSimulation = useCallback(() => {
    setIsSimulating(false);
    setTelemetry((prev) => ({
      ...prev,
      speed: 0,
      rpm: 1300,
      gear: 'N',
      leanAngle: 0
    }));
  }, []);

  return {
    ...telemetry,
    isSimulating,
    toggleSimulation,
    startSimulation,
    stopSimulation
  };
}
