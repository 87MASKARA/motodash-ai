import React, { useState, useEffect } from 'react';
import {
  Gauge,
  ShieldCheck,
  Scale,
  HeartPulse,
  Wrench,
  Users,
  Bluetooth,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  Compass,
  Battery,
  Fuel,
  Monitor,
  Smartphone,
  Tablet,
  Navigation,
  X
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export const CARPLAY_SCREEN_PRESETS = [
  {
    id: '3.6',
    label: '3.6" Portátil',
    resolution: '640×1080 / Compact',
    desc: 'Ideal para pantallas portátiles de 3.6" (V851S). Números gigantes y botones extra grandes para guantes.',
    speedFontClass: 'text-6xl sm:text-7xl',
    buttonGridClass: 'grid-cols-2 sm:grid-cols-3 gap-2.5',
    buttonPaddingClass: 'p-3.5 sm:p-4',
    compactMode: true
  },
  {
    id: '5.0',
    label: '5.0" Estándar Moto',
    resolution: '800×480 / 720p',
    desc: 'Optimizado para pantallas impermeables de 5 pulgadas en soporte de manubrio.',
    speedFontClass: 'text-6xl sm:text-8xl',
    buttonGridClass: 'grid-cols-3 gap-3',
    buttonPaddingClass: 'p-4',
    compactMode: false
  },
  {
    id: '7.0',
    label: '6.2" – 7.0" Touring',
    resolution: '1024×600 / Split-View',
    desc: 'Vista panorámica dividida para pantallas grandes de 6.2" a 7": Velocímetro + Mapa GPS + Botones.',
    speedFontClass: 'text-7xl sm:text-8xl',
    buttonGridClass: 'grid-cols-3 gap-3.5',
    buttonPaddingClass: 'p-4 sm:p-5',
    compactMode: false
  },
  {
    id: 'auto',
    label: 'Auto-Adaptable',
    resolution: 'Smart Fit',
    desc: 'Se ajusta automáticamente a cualquier resolución horizontal o vertical de CarPlay / Android Auto.',
    speedFontClass: 'text-6xl sm:text-8xl',
    buttonGridClass: 'grid-cols-2 sm:grid-cols-3 gap-3',
    buttonPaddingClass: 'p-4',
    compactMode: false
  }
];

export default function CarPlayHudModal({
  isOpen,
  onClose,
  bike,
  telemetry = {},
  odometer = 0,
  hojaDeVida = {},
  displayUnit = 'KM/H',
  onOpenGlovebox,
  onOpenLawyer,
  onOpenSos,
  onOpenDoctor,
  onOpenCommunity,
  onOpenHardwareBridge
}) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const [screenSizePreset, setScreenSizePreset] = useState(() => {
    try {
      return localStorage.getItem('motodash_carplay_size') || '3.6';
    } catch {
      return '3.6';
    }
  });

  // Alto contraste solar para lectura bajo sol directo
  const [sunlightBoost, setSunlightBoost] = useState(() => {
    try {
      return localStorage.getItem('motodash_carplay_sunlight') === 'true';
    } catch {
      return true;
    }
  });

  // Vista activa dentro del CarPlay: 'split' (Velocímetro + Botones), 'map' (Velocímetro + Mapa GPS en Vivo)
  const [hudViewMode, setHudViewMode] = useState('split');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gpsCoords, setGpsCoords] = useState(() => {
    try {
      const saved = localStorage.getItem('motodash_last_verified_gps');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!isOpen) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const next = {
            lat: pos.coords.latitude.toFixed(5),
            lng: pos.coords.longitude.toFixed(5)
          };
          setGpsCoords(next);
        },
        () => {},
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const activePreset =
    CARPLAY_SCREEN_PRESETS.find((p) => p.id === screenSizePreset) ||
    CARPLAY_SCREEN_PRESETS[0];

  const handleSelectSize = (sizeId) => {
    setScreenSizePreset(sizeId);
    try {
      localStorage.setItem('motodash_carplay_size', sizeId);
    } catch {}
  };

  const handleToggleSunlight = () => {
    const next = !sunlightBoost;
    setSunlightBoost(next);
    try {
      localStorage.setItem('motodash_carplay_sunlight', String(next));
    } catch {}
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const identity = bike?.config?.bikeIdentity || {};
  const specs = bike?.config?.telemetrySpecs || {};
  const hw = hojaDeVida?.hardwareTelemetry || {};

  const currentSpeed = Math.round(telemetry.speed || 0);
  const currentRpm = Math.round(telemetry.rpm || 1350);
  const maxRpm = specs.maxRpm || 11500;
  const rpmPct = Math.min(100, Math.max(8, Math.round((currentRpm / maxRpm) * 100)));
  const currentGear = telemetry.gear || (currentSpeed === 0 ? 'N' : '1');

  const batteryVolt = hw.batteryVoltage || '12.8';
  const batteryPct = hw.batteryLevel ?? 92;
  const fuelPct = hw.fuelLevelPercent ?? 75;
  const rideMode = hw.rideMode || 'SPORT';

  const osmMapUrl = gpsCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${(Number(gpsCoords.lng) - 0.006).toFixed(5)}%2C${(Number(gpsCoords.lat) - 0.004).toFixed(5)}%2C${(Number(gpsCoords.lng) + 0.006).toFixed(5)}%2C${(Number(gpsCoords.lat) + 0.004).toFixed(5)}&layer=mapnik&marker=${gpsCoords.lat}%2C${gpsCoords.lng}`
    : null;

  return (
    <div
      className={`fixed inset-0 z-[45] flex flex-col justify-between overflow-y-auto select-none transition-colors ${
        sunlightBoost
          ? 'bg-black text-white contrast-125'
          : 'bg-[#07080a] text-white'
      }`}
    >
      {/* BARRA SUPERIOR CARPLAY / ANDROID AUTO (SELECTOR DE PULGADAS + BRILLO SOLAR) */}
      <div className="px-3 sm:px-5 py-2.5 border-b border-neutral-800 bg-neutral-950/95 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-black font-racing font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5" />
            <span>CARPLAY / ANDROID AUTO HUD</span>
          </span>

          {/* Selector Rápido de Tamaño de Pantalla (3.6", 5.0", 7.0", Auto) */}
          <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
            {CARPLAY_SCREEN_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectSize(preset.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-racing font-bold uppercase transition whitespace-nowrap ${
                  screenSizePreset === preset.id
                    ? 'bg-amber-500 text-black shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title={preset.desc}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Botones de Vista Mapa / Alto Contraste Solar / Pantalla Completa / Cerrar */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setHudViewMode(hudViewMode === 'split' ? 'map' : 'split')}
            className={`px-3 py-1.5 rounded-xl text-xs font-racing font-bold uppercase border flex items-center gap-1.5 transition ${
              hudViewMode === 'map'
                ? 'bg-cyan-500 text-black border-cyan-400'
                : 'bg-neutral-900 text-cyan-300 border-cyan-500/40'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{hudViewMode === 'map' ? 'Ver Botones HUD' : 'Mapa GPS en Vivo'}</span>
          </button>

          <button
            type="button"
            onClick={handleToggleSunlight}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border flex items-center gap-1 transition ${
              sunlightBoost
                ? 'bg-yellow-400 text-black border-yellow-300 shadow-md shadow-yellow-400/20'
                : 'bg-neutral-900 text-neutral-300 border-neutral-700'
            }`}
            title="Activar Alto Contraste para Luz Solar Directa"
          >
            {sunlightBoost ? <Sun className="w-3.5 h-3.5 fill-black" /> : <Moon className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{sunlightBoost ? 'Sol 1000 Nits' : 'Modo Noche'}</span>
          </button>

          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200"
            title="Pantalla Completa para CarPlay / Android Auto"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-red-950 border border-neutral-700 hover:border-red-500/50 text-xs font-racing font-bold uppercase text-neutral-300 hover:text-red-300 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">{isEn ? 'Exit HUD' : 'Salir'}</span>
          </button>
        </div>
      </div>

      {/* BARRA DE REVOLUCIONES (SHIFT-LIGHT) DE ANCHO COMPLETO ESTILO MOTOGP */}
      <div className="px-3 sm:px-5 pt-2">
        <div className="flex items-center justify-between text-[11px] font-mono mb-1">
          <span className="text-neutral-300 font-bold">
            🏍️ {identity.brand} {identity.model} • <strong className="text-amber-400">{Number(odometer).toLocaleString()} KM</strong>
          </span>
          <span className="text-amber-400 font-bold">
            {currentRpm.toLocaleString()} RPM • MODO {rideMode}
          </span>
        </div>
        <div className="w-full h-3.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-700 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-150 ${
              rpmPct > 85
                ? 'bg-gradient-to-r from-amber-500 via-red-500 to-rose-600 animate-pulse'
                : 'bg-gradient-to-r from-emerald-400 via-amber-400 to-orange-500'
            }`}
            style={{ width: `${rpmPct}%` }}
          />
        </div>
      </div>

      {/* CUERPO CENTRAL ADAPTADO AL TAMAÑO DE PANTALLA (3.6", 5.0", 7.0") */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch my-auto">
        {/* COLUMNA IZQUIERDA: VELOCÍMETRO GIGANTE + MARCHA + BATERÍA Y GASOLINA TFT */}
        <div
          className={`${
            screenSizePreset === '7.0' ? 'lg:col-span-5' : 'lg:col-span-5'
          } rounded-3xl p-4 sm:p-6 flex flex-col justify-between border-2 ${
            sunlightBoost
              ? 'bg-neutral-950 border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.2)]'
              : 'bg-neutral-900/90 border-neutral-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
              <Gauge className="w-4 h-4" />
              <span>{activePreset.label} ({activePreset.resolution})</span>
            </span>

            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold">
              GPS ACTIVO
            </span>
          </div>

          {/* Velocidad Gigante y Marcha Engranada */}
          <div className="flex items-center justify-around my-3 py-2">
            <div className="text-center">
              <div className={`${activePreset.speedFontClass} font-black font-telemetry leading-none text-white tracking-tight`}>
                {currentSpeed}
              </div>
              <span className="text-xs sm:text-sm font-mono font-bold text-amber-400 tracking-widest uppercase block mt-1">
                {displayUnit}
              </span>
            </div>

            <div className="w-px h-20 bg-neutral-800" />

            <div className="text-center">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                {isEn ? 'GEAR' : 'MARCHA'}
              </span>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500 text-black font-racing font-black text-4xl sm:text-5xl flex items-center justify-center shadow-lg mt-1">
                {currentGear}
              </div>
            </div>
          </div>

          {/* Barra Rápida de Batería TFT y Gasolina */}
          <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-neutral-800">
            <div className="p-2.5 rounded-2xl bg-black/80 border border-emerald-500/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Battery className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 block">BATERÍA TFT</span>
                  <span className="text-sm font-black font-mono text-emerald-300">
                    {batteryVolt}V • {batteryPct}%
                  </span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-black/80 border border-cyan-500/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fuel className="w-5 h-5 text-cyan-400" />
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 block">TANQUE TFT</span>
                  <span className="text-sm font-black font-mono text-cyan-300">
                    {fuelPct}% ({hw.estimatedRangeKm || 380} km)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: BOTONES GIGANTES PARA GUANTES O MAPA GPS EN VIVO */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          {hudViewMode === 'map' || screenSizePreset === '7.0' ? (
            <div className="space-y-3 h-full flex flex-col">
              {/* Mapa GPS en Vivo para CarPlay / Android Auto */}
              <div className="flex-1 min-h-[210px] rounded-3xl overflow-hidden border-2 border-cyan-500/50 bg-neutral-950 relative">
                {osmMapUrl ? (
                  <iframe
                    title="Mapa CarPlay MotoDash AI"
                    src={osmMapUrl}
                    className="w-full h-full min-h-[210px] border-0 filter invert-[90%] hue-rotate-180 contrast-125"
                  />
                ) : (
                  <div className="w-full h-full min-h-[210px] flex flex-col items-center justify-center p-6 text-center">
                    <Navigation className="w-8 h-8 text-cyan-400 animate-pulse mb-2" />
                    <p className="text-xs font-mono text-neutral-300">
                      Mapa GPS listo • Activa la ubicación para ver tu posición en tiempo real.
                    </p>
                  </div>
                )}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-black/85 border border-cyan-500/40 text-xs font-mono text-cyan-300 font-bold">
                  📍 Radar GPS CarPlay Activo {gpsCoords ? `(${gpsCoords.lat}, ${gpsCoords.lng})` : ''}
                </div>
              </div>

              {/* Fila de 4 Botones Rápidos debajo del Mapa en modo 7.0" o Mapa */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  type="button"
                  onClick={onOpenGlovebox}
                  className="p-3 rounded-2xl bg-emerald-950/90 hover:bg-emerald-900 border-2 border-emerald-500 text-emerald-300 font-racing font-black uppercase text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Modo Retén</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenLawyer}
                  className="p-3 rounded-2xl bg-indigo-950/90 hover:bg-indigo-900 border-2 border-indigo-500 text-indigo-200 font-racing font-black uppercase text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <Scale className="w-5 h-5 text-amber-400" />
                  <span>Abogado IA</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenSos}
                  className="p-3 rounded-2xl bg-red-950/90 hover:bg-red-900 border-2 border-red-500 text-white font-racing font-black uppercase text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <HeartPulse className="w-5 h-5 text-red-400 animate-pulse" />
                  <span>SOS GPS</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenCommunity}
                  className="p-3 rounded-2xl bg-amber-950/90 hover:bg-amber-900 border-2 border-amber-500 text-amber-300 font-racing font-black uppercase text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <Users className="w-5 h-5 text-amber-400" />
                  <span>Mi Clan</span>
                </button>
              </div>
            </div>
          ) : (
            /* GRILLA DE 6 BOTONES TÁCTILES GIGANTES OPTIMIZADA PARA PANTALLAS DE 3.6" Y 5.0" CON GUANTES */
            <div className={`grid ${activePreset.buttonGridClass} h-full`}>
              <button
                type="button"
                onClick={onOpenGlovebox}
                className={`${activePreset.buttonPaddingClass} rounded-3xl bg-emerald-950/85 hover:bg-emerald-900 border-2 border-emerald-500 text-left flex flex-col justify-between transition active:scale-95 shadow-lg`}
              >
                <ShieldCheck className="w-8 h-8 text-emerald-400 mb-2" />
                <div>
                  <span className="text-[10px] font-mono uppercase text-emerald-300 block">
                    6 FOTOS + PIN + ZOOM
                  </span>
                  <span className="text-base sm:text-lg font-black font-racing uppercase text-white">
                    {isEn ? 'MY DOCUMENTS' : 'MODO RETÉN'}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={onOpenLawyer}
                className={`${activePreset.buttonPaddingClass} rounded-3xl bg-indigo-950/85 hover:bg-indigo-900 border-2 border-indigo-500 text-left flex flex-col justify-between transition active:scale-95 shadow-lg`}
              >
                <Scale className="w-8 h-8 text-amber-400 mb-2" />
                <div>
                  <span className="text-[10px] font-mono uppercase text-indigo-300 block">
                    DEFENSA COMPARENDOS
                  </span>
                  <span className="text-base sm:text-lg font-black font-racing uppercase text-white">
                    {isEn ? 'AI LAWYER' : 'ABOGADO IA'}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={onOpenSos}
                className={`${activePreset.buttonPaddingClass} rounded-3xl bg-red-950/90 hover:bg-red-900 border-2 border-red-500 text-left flex flex-col justify-between transition active:scale-95 shadow-lg`}
              >
                <HeartPulse className="w-8 h-8 text-red-400 animate-pulse mb-2" />
                <div>
                  <span className="text-[10px] font-mono uppercase text-red-300 block">
                    COORDENADAS AL CLAN
                  </span>
                  <span className="text-base sm:text-lg font-black font-racing uppercase text-white">
                    SOS AUXILIO 24/7
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={onOpenCommunity}
                className={`${activePreset.buttonPaddingClass} rounded-3xl bg-amber-950/85 hover:bg-amber-900 border-2 border-amber-500 text-left flex flex-col justify-between transition active:scale-95 shadow-lg`}
              >
                <Users className="w-8 h-8 text-amber-400 mb-2" />
                <div>
                  <span className="text-[10px] font-mono uppercase text-amber-300 block">
                    CHAT & RODADAS
                  </span>
                  <span className="text-base sm:text-lg font-black font-racing uppercase text-white">
                    {isEn ? 'BIKER CLANS' : 'MI CLAN MOTERO'}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={onOpenDoctor}
                className={`${activePreset.buttonPaddingClass} rounded-3xl bg-teal-950/85 hover:bg-teal-900 border-2 border-teal-500 text-left flex flex-col justify-between transition active:scale-95 shadow-lg`}
              >
                <Wrench className="w-8 h-8 text-cyan-400 mb-2" />
                <div>
                  <span className="text-[10px] font-mono uppercase text-teal-300 block">
                    FALLAS & RUIDOS
                  </span>
                  <span className="text-base sm:text-lg font-black font-racing uppercase text-white">
                    DOCTOR MOTOR IA
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={onOpenHardwareBridge}
                className={`${activePreset.buttonPaddingClass} rounded-3xl bg-cyan-950/85 hover:bg-cyan-900 border-2 border-cyan-500 text-left flex flex-col justify-between transition active:scale-95 shadow-lg`}
              >
                <Bluetooth className="w-8 h-8 text-cyan-400 mb-2" />
                <div>
                  <span className="text-[10px] font-mono uppercase text-cyan-300 block">
                    12 SENSORES + BATERÍA
                  </span>
                  <span className="text-base sm:text-lg font-black font-racing uppercase text-white">
                    TABLERO TFT / OBD
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PIE DE PÁGINA INFORMATIVO DEL PERFIL CARPLAY ACTIVO */}
      <div className="px-4 py-2 border-t border-neutral-900 bg-neutral-950 text-[11px] font-mono text-neutral-400 flex flex-wrap items-center justify-between gap-2">
        <span>
          📟 <strong>Modo CarPlay / Android Auto Activo:</strong> {activePreset.label} ({activePreset.resolution}) — {activePreset.desc}
        </span>
        <span className="text-amber-400 font-bold">
          Toca cualquier módulo con guantes para abrirlo
        </span>
      </div>
    </div>
  );
}

