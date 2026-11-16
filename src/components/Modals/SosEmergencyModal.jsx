import React, { useState, useEffect, useRef } from 'react';
import {
  HeartPulse,
  MapPin,
  PhoneCall,
  Share2,
  ShieldAlert,
  Truck,
  Radio,
  CheckCircle2,
  ExternalLink,
  Users,
  Navigation,
  Search,
  AlertTriangle,
  Compass,
  Store,
  X
} from 'lucide-react';
import { supabase, getAuthenticatedUserId } from '../../services/supabaseClient';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  getLoadedMallStores,
  sortStoresByProximity,
  buildStoreMapsUrl
} from '../../services/mallLocationService';

const COUNTRY_EMERGENCY_NUMBERS = {
  Colombia: {
    emergency: '123',
    highwayPolice: '#767 (INVIAS / Policía de Carreteras)',
    insuranceAssist: '#888 (Asistencia SURA / Grúa 24/7)',
    ambulance: '125 / 123 Salud'
  },
  'Estados Unidos': {
    emergency: '911',
    highwayPolice: '911 / *HP (State Highway Patrol)',
    insuranceAssist: '1-800 Roadside Assistance',
    ambulance: '911 EMS'
  },
  España: {
    emergency: '112',
    highwayPolice: '062 (Guardia Civil de Tráfico)',
    insuranceAssist: 'Asistencia en Carretera 24h',
    ambulance: '112 Emergencias Sanitarias'
  },
  México: {
    emergency: '911',
    highwayPolice: '074 (CAPUFE) / 088 (Guardia Nacional)',
    insuranceAssist: 'Cabina de Siniestros 24/7',
    ambulance: '911 / 065 Cruz Roja'
  },
  Chile: {
    emergency: '133',
    highwayPolice: '133 (Carabineros)',
    insuranceAssist: 'Asistencia en Ruta SOAP / Seguro',
    ambulance: '131 (SAMU)'
  },
  Perú: {
    emergency: '105',
    highwayPolice: '110 (Policía de Carreteras)',
    insuranceAssist: 'Central de Emergencias SOAT',
    ambulance: '106 (SAMU) / 116 (Bomberos)'
  }
};

const DEFAULT_CLANS_FALLBACK = [
  { slug: 'apache-rtr-medellin', name: 'Clan Apache RTR Antioquia', tag: 'RTR-MDE' },
  { slug: 'night-riders-colombia', name: 'Night Riders Street Club', tag: 'NIGHT-CO' }
];

function appendMessageToLocalChannel(channelKey, msgObj) {
  try {
    const storageKey = `motodash_chat_${channelKey}`;
    const raw = localStorage.getItem(storageKey);
    const existing = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(existing) ? existing : [];
    const updated = [...list, msgObj].slice(-80);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  } catch {}
}

export default function SosEmergencyModal({
  isOpen,
  onClose,
  bike,
  hojaDeVida = {},
  userProfile,
  onUpdateHojaDeVida,
  onOpenClanChat
}) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const docs = hojaDeVida?.documentos || {};
  const medicalInfo = hojaDeVida?.fichaMedica || {};
  const country = hojaDeVida?.country || userProfile?.country || 'Colombia';
  const numbers = COUNTRY_EMERGENCY_NUMBERS[country] || COUNTRY_EMERGENCY_NUMBERS.Colombia;

  const [bloodType, setBloodType] = useState(
    medicalInfo.bloodType || docs.grupoSanguineo || 'O+'
  );
  const [allergies, setAllergies] = useState(
    medicalInfo.allergies || 'Ninguna conocida'
  );
  const [emergencyContactName, setEmergencyContactName] = useState(
    medicalInfo.emergencyContactName || 'Contacto Familiar Directo'
  );
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(
    medicalInfo.emergencyContactPhone || docs.telefonoContacto || ''
  );

  // Coordenadas GPS reales del dispositivo o calibradas por el usuario
  const [coords, setCoords] = useState(() => {
    try {
      const saved = localStorage.getItem('motodash_last_verified_gps');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });
  const [detectedAddress, setDetectedAddress] = useState('');
  const [locating, setLocating] = useState(false);
  const [gpsStatusMsg, setGpsStatusMsg] = useState('');
  const [gpsErrorType, setGpsErrorType] = useState(null); // 'permission' | 'coarse_pc' | 'timeout' | null

  // Buscador manual de calle / barrio / municipio (por si está en PC sin chip GPS o en sótano)
  const [addressSearchQuery, setAddressSearchQuery] = useState('');
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const [emergencyNote, setEmergencyNote] = useState('');
  const [targetClanSlug, setTargetClanSlug] = useState('ALL_CLANS');
  const [availableClans, setAvailableClans] = useState(DEFAULT_CLANS_FALLBACK);
  const [sendingSos, setSendingSos] = useState(false);
  const [sosBroadcastResult, setSosBroadcastResult] = useState(null);
  const [savedMedical, setSavedMedical] = useState(false);

  const watchIdRef = useRef(null);
  const bestAccuracyRef = useRef(999999);

  // Geocodificación inversa: convierte (lat, lng) en Dirección, Barrio y Municipio real
  const reverseGeocodeCoordinates = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': isEn ? 'en' : 'es' } }
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data?.display_name) {
        const addr = data.address || {};
        const road = addr.road || addr.pedestrian || addr.suburb || '';
        const neighbourhood = addr.neighbourhood || addr.suburb || addr.quarter || '';
        const city = addr.city || addr.town || addr.municipality || addr.county || addr.state || '';
        const shortFormatted = [road, neighbourhood, city].filter(Boolean).join(', ');
        const finalAddress = shortFormatted ? `${shortFormatted} (${data.display_name.split(',').slice(0, 4).join(',')})` : data.display_name;
        setDetectedAddress(finalAddress);
      }
    } catch {}
  };

  // Adquisición GPS real multi-etapa con filtro de precisión y watchPosition continuo
  const startRealGpsTracking = () => {
    setLocating(true);
    setGpsErrorType(null);
    setGpsStatusMsg('🛰️ Buscando satélites GPS de alta precisión en tu dispositivo...');
    bestAccuracyRef.current = 999999;

    if (watchIdRef.current && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (!navigator.geolocation) {
      setLocating(false);
      setGpsErrorType('timeout');
      setGpsStatusMsg('⚠️ Tu navegador no soporta geolocalización directa. Escribe tu barrio o dirección abajo.');
      return;
    }

    const handleSuccessPosition = (pos, isHighAccuracyAttempt = true) => {
      const rawLat = pos.coords.latitude;
      const rawLng = pos.coords.longitude;
      const accuracyMeters = Math.round(pos.coords.accuracy || 15);

      // Si ya teníamos una lectura más precisa (o fijada manualmente por el usuario), no la sobreescribimos con una peor de antena ISP
      if (accuracyMeters > bestAccuracyRef.current && bestAccuracyRef.current < 100) {
        setLocating(false);
        return;
      }

      bestAccuracyRef.current = accuracyMeters;
      const nextCoords = {
        lat: rawLat.toFixed(6),
        lng: rawLng.toFixed(6),
        accuracy: accuracyMeters,
        source:
          accuracyMeters <= 60
            ? 'GPS Satelital Exacto'
            : accuracyMeters <= 400
            ? 'Triangulación Wi-Fi / Antena'
            : 'Ubicación Aproximada de Red (ISP)'
      };

      setCoords(nextCoords);
      setLocating(false);

      try {
        localStorage.setItem('motodash_last_verified_gps', JSON.stringify(nextCoords));
      } catch {}

      if (accuracyMeters > 350) {
        setGpsErrorType('coarse_pc');
        setGpsStatusMsg(
          `📶 Tu dispositivo reportó ubicación por red/Wi-Fi (±${accuracyMeters}m). Si estás en PC o el proveedor de internet muestra otro barrio/ciudad, busca tu calle o barrio abajo para fijar el punto exacto.`
        );
      } else {
        setGpsErrorType(null);
        setGpsStatusMsg(
          `✅ Ubicación GPS bloqueada con éxito (±${accuracyMeters}m de precisión • ${ isHighAccuracyAttempt ? 'Alta Precisión' : 'Red Activa' })`
        );
      }

      reverseGeocodeCoordinates(nextCoords.lat, nextCoords.lng);
    };

    const handleGpsError = (err) => {
      if (err?.code === 1) {
        // PERMISSION_DENIED
        setLocating(false);
        setGpsErrorType('permission');
        setGpsStatusMsg(
          '🔒 Permiso de Ubicación bloqueado en tu navegador. Toca el candado junto a la URL arriba y permite "Ubicación", o busca tu barrio/calle en el buscador de abajo.'
        );
        return;
      }

      // Si falló o tardó enableHighAccuracy (común en PC de escritorio sin chip GPS), reintentar con Wi-Fi (enableHighAccuracy: false)
      navigator.geolocation.getCurrentPosition(
        (pos) => handleSuccessPosition(pos, false),
        () => {
          setLocating(false);
          setGpsErrorType('timeout');
          setGpsStatusMsg(
            '⚠️ El GPS del dispositivo tardó en responder. Usa el buscador de calle/barrio abajo para fijar tu ubicación exacta.'
          );
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
      );
    };

    // 1. Disparo inmediato de alta precisión sin caché viejo (maximumAge: 0)
    navigator.geolocation.getCurrentPosition(
      (pos) => handleSuccessPosition(pos, true),
      handleGpsError,
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );

    // 2. Escucha continua mientras el modal SOS esté abierto para afinar precisión a medida que el chip GPS engancha más satélites
    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => handleSuccessPosition(pos, true),
        () => {},
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } catch {}
  };

  useEffect(() => {
    if (!isOpen) {
      if (watchIdRef.current && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    try {
      const savedClans = localStorage.getItem('motodash_custom_clans');
      if (savedClans) {
        const parsed = JSON.parse(savedClans);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAvailableClans(parsed);
        }
      }
    } catch {}

    startRealGpsTracking();

    return () => {
      if (watchIdRef.current && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isOpen]);

  // Buscador de dirección / barrio / ciudad en vivo (OpenStreetMap Nominatim) para fijar coordenadas exactas al instante
  const handleSearchExactAddress = async (e) => {
    if (e) e.preventDefault();
    const q = addressSearchQuery.trim();
    if (!q) return;

    setSearchingAddress(true);
    setSearchResults([]);
    try {
      const queryWithCountry = q.toLowerCase().includes(country.toLowerCase())
        ? q
        : `${q}, ${country}`;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(queryWithCountry)}&limit=4&addressdetails=1`,
        { headers: { 'Accept-Language': isEn ? 'en' : 'es' } }
      );
      if (res.ok) {
        const list = await res.json();
        setSearchResults(Array.isArray(list) ? list : []);
      }
    } catch {} finally {
      setSearchingAddress(false);
    }
  };

  const handleSelectSearchedPlace = (place) => {
    const fixedCoords = {
      lat: Number(place.lat).toFixed(6),
      lng: Number(place.lon).toFixed(6),
      accuracy: 5,
      source: 'Ubicación Exacta Confirmada por el Piloto'
    };
    bestAccuracyRef.current = 1; // Bloquear para que una antena Wi-Fi imprecisa no la pise
    setCoords(fixedCoords);
    setDetectedAddress(place.display_name);
    setSearchResults([]);
    setGpsErrorType(null);
    setGpsStatusMsg(`✅ Ubicación fijada exactamente en: ${place.display_name.split(',').slice(0, 3).join(', ')}`);
    try {
      localStorage.setItem('motodash_last_verified_gps', JSON.stringify(fixedCoords));
    } catch {}
  };

  if (!isOpen) return null;

  const identity = bike?.config?.bikeIdentity || {};
  const riderName = docs.propietario || userProfile?.fullName || 'Anderson • Fundador VIP';
  const riderId = docs.cedulaPropietario || docs.documentoPropietario || 'Verificado en RUNT/DMV';
  const plate = docs.placa || 'SIN PLACA';
  const soatIssuer = docs.soatAseguradora || 'SOAT Vigente';
  const allRiskIssuer = docs.seguroTodoRiesgoAseguradora || docs.seguroNombre || 'Póliza Todo Riesgo Activa';
  const allRiskPolicy = docs.seguroTodoRiesgoPoliza || docs.seguroPoliza || 'Activa';

  const hasValidCoords = Boolean(coords && coords.lat && coords.lng);
  const effectiveLat = coords?.lat || '';
  const effectiveLng = coords?.lng || '';
  const mapsUrl = hasValidCoords
    ? `https://www.google.com/maps?q=${effectiveLat},${effectiveLng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(detectedAddress || userProfile?.city || 'Colombia')}`;

  // URL de mapa embebido en vivo para verificar visualmente el punto exacto antes de enviar
  const osmEmbedUrl = hasValidCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${(Number(effectiveLng) - 0.0045).toFixed(6)}%2C${(Number(effectiveLat) - 0.003).toFixed(6)}%2C${(Number(effectiveLng) + 0.0045).toFixed(6)}%2C${(Number(effectiveLat) + 0.003).toFixed(6)}&layer=mapnik&marker=${effectiveLat}%2C${effectiveLng}`
    : null;

  const handleSendWhatsAppSos = () => {
    if (!hasValidCoords) {
      alert('Primero confirma tu ubicación GPS o escribe tu barrio/calle en el buscador para enviar coordenadas reales.');
      return;
    }
    const exactUrl = `https://www.google.com/maps?q=${effectiveLat},${effectiveLng}`;
    const addrLine = detectedAddress ? `\n🏠 Dirección/Zona: ${detectedAddress}` : '';
    const noteText = emergencyNote.trim() ? `\n⚠️ Situación: ${emergencyNote.trim()}` : '';

    const text = isEn
      ? `🚨 *MOTO SOS ALERT — MOTODASH AI* 🚨\nRider: ${riderName}\nBike: ${identity.brand} ${identity.model} (Plate: ${plate})\nBlood Type (RH): ${bloodType} | Allergies: ${allergies}${addrLine}${noteText}\n📍 Exact GPS: Lat ${effectiveLat}, Lng ${effectiveLng}\n🗺️ Google Maps Pin: ${exactUrl}`
      : `🚨 *ALERTA SOS ACCIDENTE / AUXILIO — MOTODASH AI* 🚨\nPiloto: ${riderName}\nMoto: ${identity.brand} ${identity.model} (Placa: ${plate})\nFactor RH: ${bloodType} | Alergias: ${allergies}${addrLine}${noteText}\n📍 Coordenadas Exactas: Lat ${effectiveLat}, Lng ${effectiveLng}\n🗺️ Abrir Mapa Exacto: ${exactUrl}`;

    const cleanPhone = String(emergencyContactPhone || '').replace(/[^0-9]/g, '');
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleBroadcastSosToClan = async () => {
    if (!hasValidCoords) {
      alert('Espera un segundo a que el GPS fije tu ubicación o escribe tu calle/barrio en el buscador para no enviar coordenadas vacías.');
      return;
    }

    setSendingSos(true);
    try {
      const exactUrl = `https://www.google.com/maps?q=${effectiveLat},${effectiveLng}`;
      const shortAddr = detectedAddress
        ? ` • Zona: ${detectedAddress.split(',').slice(0, 3).join(', ')}`
        : '';
      const cleanNote = emergencyNote.trim()
        ? ` • Reporte: "${emergencyNote.trim()}"`
        : ' • Solicita apoyo inmediato / asistencia en ruta';

      const content = `🚨 [SOS ACCIDENTE / AUXILIO EN RUTA] Piloto: ${riderName} • Moto: ${identity.brand} ${identity.model} (Placa: ${plate}) • Factor RH: ${bloodType} (Alergias: ${allergies})${shortAddr}${cleanNote} • 📍 Coordenadas GPS Exactas: Lat ${effectiveLat}, Lng ${effectiveLng} • Mapa directo: ${exactUrl}`;

      const targetSlugs =
        targetClanSlug === 'ALL_CLANS'
          ? availableClans.map((c) => c.slug)
          : [targetClanSlug];

      const targetChannelIds = [
        ...targetSlugs.map((slug) => `clan_${slug}`),
        'medellin'
      ];

      const nowIso = new Date().toISOString();

      // 1. Guardar inmediatamente en el historial local de cada clan para que se vea al instante
      targetChannelIds.forEach((chId) => {
        const localSosMsg = {
          id: `sos_${Date.now()}_${chId}`,
          channel_id: chId,
          category: 'alerta_vial',
          author_name: riderName,
          author_bike: `${identity.brand || 'Moto'} ${identity.model || ''}`.trim(),
          author_verified: true,
          is_sos: true,
          coords_lat: effectiveLat,
          coords_lng: effectiveLng,
          maps_url: exactUrl,
          content,
          city: country,
          created_at: nowIso
        };
        appendMessageToLocalChannel(chId, localSosMsg);
      });

      // 2. Publicar también en Supabase Realtime
      const authUid = await getAuthenticatedUserId();
      if (authUid) {
        const rowsToInsert = targetChannelIds.map((chId) => ({
          user_id: authUid,
          channel_id: chId,
          category: 'alerta_vial',
          author_name: riderName,
          author_bike: `${identity.brand || 'Moto'} ${identity.model || ''}`.trim(),
          author_verified: true,
          content,
          city: country
        }));
        await supabase.from('community_messages').insert(rowsToInsert);
      }

      const targetLabel =
        targetClanSlug === 'ALL_CLANS'
          ? `Todos tus Clanes (${availableClans.map((c) => c.name).join(' + ')})`
          : availableClans.find((c) => c.slug === targetClanSlug)?.name || 'Clan Motero';

      setSosBroadcastResult({
        sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        lat: effectiveLat,
        lng: effectiveLng,
        address: detectedAddress,
        mapsUrl: exactUrl,
        targetLabel,
        content
      });
    } finally {
      setSendingSos(false);
    }
  };

  const handleSaveMedicalCard = (e) => {
    e.preventDefault();
    if (onUpdateHojaDeVida) {
      onUpdateHojaDeVida({
        ...hojaDeVida,
        documentos: {
          ...docs,
          grupoSanguineo: bloodType
        },
        fichaMedica: {
          bloodType,
          allergies,
          emergencyContactName,
          emergencyContactPhone
        }
      });
    }
    setSavedMedical(true);
    setTimeout(() => setSavedMedical(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-neutral-950 border-2 border-red-500 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-[0_0_60px_rgba(239,68,68,0.28)] text-white my-auto max-h-[94vh] overflow-y-auto">
        {/* ENCABEZADO ROJO DE ALTO CONTRASTE PARA PARAMÉDICOS Y ASISTENCIA */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-red-900/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 border-2 border-red-500 flex items-center justify-center text-red-400 animate-pulse flex-shrink-0">
              <HeartPulse className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full bg-red-600 text-white">
                {isEn ? 'SOS MEDICAL & ROADSIDE TOW CARD' : 'FICHA MÉDICA SOS PARA PARAMÉDICOS & GRÚA 24/7'}
              </span>
              <h2 className="text-lg sm:text-xl font-black font-racing uppercase tracking-wider text-white mt-1">
                {isEn ? 'Emergency Medical ID & Live GPS SOS' : 'Identificación Médica de Emergencia & Alerta GPS al Clan'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TARJETA GIGANTE DE ALTO IMPACTO PARA PARAMÉDICOS EN CASO DE ACCIDENTE */}
        <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-950/70 via-neutral-900 to-neutral-900 border-2 border-red-500/60 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-black/70 border border-red-500/40">
            <span className="text-[10px] font-mono uppercase text-red-300 block">
              {isEn ? 'BLOOD TYPE / RH' : 'FACTOR RH / SANGRE'}
            </span>
            <p className="text-2xl sm:text-3xl font-black font-racing text-red-400 mt-0.5">
              {bloodType}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-black/70 border border-neutral-800">
            <span className="text-[10px] font-mono uppercase text-neutral-400 block">
              {isEn ? 'RIDER / ID' : 'CONDUCTOR / CÉDULA'}
            </span>
            <p className="text-xs sm:text-sm font-bold text-white truncate mt-1">{riderName}</p>
            <p className="text-[11px] font-mono text-amber-400">ID: {riderId}</p>
          </div>

          <div className="p-3 rounded-xl bg-black/70 border border-neutral-800">
            <span className="text-[10px] font-mono uppercase text-neutral-400 block">
              {isEn ? 'MOTORCYCLE / PLATE' : 'MOTOCICLETA / PLACA'}
            </span>
            <p className="text-xs sm:text-sm font-bold text-white truncate mt-1">
              {identity.brand} {identity.model}
            </p>
            <p className="text-[11px] font-mono text-emerald-400 font-bold">PLACA: {plate}</p>
          </div>

          <div className="p-3 rounded-xl bg-black/70 border border-neutral-800">
            <span className="text-[10px] font-mono uppercase text-neutral-400 block">
              {isEn ? 'INSURANCE & TOWING' : 'SEGURO & ASISTENCIA GRÚA'}
            </span>
            <p className="text-xs font-bold text-cyan-300 truncate mt-1">{allRiskIssuer}</p>
            <p className="text-[10px] font-mono text-neutral-300 truncate">
              {soatIssuer} • Póliza: {allRiskPolicy}
            </p>
          </div>
        </div>

        {/* MÓDULO DE TELEMETRÍA GPS REAL, MAPA EN VIVO Y CALIBRADOR DE DIRECCIÓN */}
        <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-neutral-900 border-2 border-red-500/40 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-800">
            <div>
              <h3 className="text-sm sm:text-base font-black font-racing uppercase text-amber-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-400 animate-bounce" />
                <span>
                  {isEn
                    ? 'Live Accident GPS Coordinates & Clan Broadcast'
                    : 'Radar GPS en Vivo del Accidente & Envío al Clan'}
                </span>
              </h3>
              <p className="text-xs font-mono text-neutral-300 mt-0.5">
                {gpsStatusMsg || '🛰️ Conectando con el sensor GPS del dispositivo...'}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={startRealGpsTracking}
                disabled={locating}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-xs font-mono font-bold text-emerald-300 flex items-center gap-1.5 transition"
              >
                <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
                <span>{locating ? 'Triangulando...' : 'Recalibrar Mi GPS Real'}</span>
              </button>

              {hasValidCoords && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/70 border border-cyan-500/40 text-xs font-mono font-bold text-cyan-300 flex items-center gap-1 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Google Maps</span>
                </a>
              )}
            </div>
          </div>

          {/* ALERTA SI ESTÁ EN PC (WIFI ISP IMPRECISO) O PERMISO DENEGADO */}
          {gpsErrorType && (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/50 flex items-start gap-2.5 text-xs font-mono text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong>¿Por qué muestra otro punto si estás en computador o sin permiso GPS?</strong>{' '}
                Los computadores de escritorio no tienen antena satelital GPS y usan el nodo central de tu proveedor de internet (que suele estar en otra zona o ciudad). Puedes escribir tu <strong>barrio, calle o municipio</strong> aquí abajo para fijar tu pin exacto en 1 clic:
              </div>
            </div>
          )}

          {/* BUSCADOR DE CALLE / BARRIO / MUNICIPIO PARA FIJAR EL PIN EXACTO */}
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
            <label className="text-[10px] font-mono uppercase text-amber-300 block">
              🔍 ¿Quieres fijar tu calle, barrio o municipio exacto manualmente? Escríbelo aquí:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={addressSearchQuery}
                onChange={(e) => setAddressSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchExactAddress(e);
                  }
                }}
                placeholder="Ej: Bello Antioquia / Envigado Parque / Sabaneta / Calle 10 El Poblado..."
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={handleSearchExactAddress}
                disabled={searchingAddress || !addressSearchQuery.trim()}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-racing font-bold text-xs uppercase flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{searchingAddress ? 'Buscando...' : 'Fijar Ubicación'}</span>
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono text-emerald-400 block">
                  Selecciona tu punto exacto para actualizar las coordenadas:
                </span>
                {searchResults.map((place) => (
                  <button
                    key={place.place_id}
                    type="button"
                    onClick={() => handleSelectSearchedPlace(place)}
                    className="w-full text-left p-2 rounded-xl bg-neutral-900 hover:bg-emerald-950/60 border border-neutral-800 hover:border-emerald-500/50 text-xs font-mono text-neutral-200 flex items-center justify-between gap-2 transition"
                  >
                    <span className="truncate">📍 {place.display_name}</span>
                    <span className="text-[10px] text-emerald-400 font-bold whitespace-nowrap">
                      Usar este punto →
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DIRECCIÓN DETECTADA + VISOR DE MAPA EN VIVO */}
          {detectedAddress && (
            <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs font-mono text-emerald-200 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="truncate">
                <strong>Ubicación Detectada:</strong> {detectedAddress}
              </span>
            </div>
          )}

          {osmEmbedUrl && (
            <div className="rounded-2xl overflow-hidden border border-neutral-700 h-44 bg-neutral-950 relative">
              <iframe
                title="Mapa de Ubicación SOS en Vivo"
                src={osmEmbedUrl}
                className="w-full h-full border-0 filter invert-[90%] hue-rotate-180 contrast-125"
                loading="lazy"
              />
              <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/80 border border-white/15 text-[10px] font-mono text-amber-300 pointer-events-none">
                📍 Pin Exacto: {effectiveLat}, {effectiveLng}
              </div>
            </div>
          )}

          {/* CAJAS EDITABLES DE LATITUD, LONGITUD Y SELECCIÓN DEL CLAN */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-2.5 rounded-xl bg-neutral-950 border border-emerald-500/40">
              <label className="text-[10px] font-mono uppercase text-neutral-400 block">
                LATITUD GPS EXACTA
              </label>
              <input
                type="text"
                value={effectiveLat}
                onChange={(e) =>
                  setCoords((prev) => ({
                    ...(prev || { accuracy: 5, source: 'Manual' }),
                    lat: e.target.value
                  }))
                }
                placeholder="Obteniendo..."
                className="w-full bg-transparent text-base font-black font-telemetry text-emerald-400 focus:outline-none mt-0.5"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-950 border border-emerald-500/40">
              <label className="text-[10px] font-mono uppercase text-neutral-400 block">
                LONGITUD GPS EXACTA
              </label>
              <input
                type="text"
                value={effectiveLng}
                onChange={(e) =>
                  setCoords((prev) => ({
                    ...(prev || { accuracy: 5, source: 'Manual' }),
                    lng: e.target.value
                  }))
                }
                placeholder="Obteniendo..."
                className="w-full bg-transparent text-base font-black font-telemetry text-emerald-400 focus:outline-none mt-0.5"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-950 border border-amber-500/40">
              <label className="text-[10px] font-mono uppercase text-amber-300 block mb-1">
                🛡️ Clan Destino de la Alerta
              </label>
              <select
                value={targetClanSlug}
                onChange={(e) => setTargetClanSlug(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
              >
                <option value="ALL_CLANS">🚨 Todos mis Clanes ({availableClans.length})</option>
                {availableClans.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    [{c.tag}] {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CAMPO OPCIONAL DE DETALLE RÁPIDO DEL ACCIDENTE O VARADA */}
          <div>
            <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
              Detalle rápido de la emergencia o punto de referencia (Opcional):
            </label>
            <input
              type="text"
              value={emergencyNote}
              onChange={(e) => setEmergencyNote(e.target.value)}
              placeholder="Ej: Caída en curva / Llanta pinchada frente a estación de gasolina, necesito apoyo del clan..."
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* BOTONES DE ENVÍO INMEDIATO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleSendWhatsAppSos}
              className="py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-black font-racing font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>
                {isEn ? 'Send SOS + GPS via WhatsApp' : 'Enviar Coordenadas por WhatsApp'}
              </span>
            </button>

            <button
              type="button"
              disabled={sendingSos}
              onClick={handleBroadcastSosToClan}
              className="py-3 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-racing font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-500/30 transition active:scale-95"
            >
              <Radio className="w-4 h-4 animate-ping" />
              <span>
                {sendingSos
                  ? 'Enviando Coordenadas al Clan...'
                  : isEn
                  ? 'Broadcast SOS + GPS to My Clan'
                  : '🚨 Enviar Coordenadas SOS al Clan'}
              </span>
            </button>
          </div>

          {/* CONFIRMACIÓN VISUAL DE ENVÍO CON COORDENADAS EXACTAS Y ACCESO DIRECTO AL CHAT DEL CLAN */}
          {sosBroadcastResult && (
            <div className="p-4 rounded-2xl bg-red-950/60 border-2 border-emerald-400/80 space-y-2.5 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ¡ALERTA SOS PUBLICADA EN EL CHAT DEL CLAN ({sosBroadcastResult.sentAt})!
                </span>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-black/60 text-amber-300 border border-amber-500/40">
                  Destino: {sosBroadcastResult.targetLabel}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black/75 border border-red-500/40 text-xs font-mono text-neutral-200 leading-relaxed break-words">
                {sosBroadcastResult.content}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <a
                  href={sosBroadcastResult.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 transition"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>
                    Abrir Pin GPS ({sosBroadcastResult.lat}, {sosBroadcastResult.lng})
                  </span>
                </a>

                {onOpenClanChat && (
                  <button
                    type="button"
                    onClick={onOpenClanChat}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-racing font-black uppercase text-xs flex items-center gap-1.5 shadow-lg transition"
                  >
                    <Users className="w-4 h-4" />
                    <span>Ver Alerta en el Chat del Clan →</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TARJETA DE RESCATE: TIENDA / TALLER ALIADO MÁS CERCANO DESDE MOTOMALL */}
          {(() => {
            const nearbyStores = sortStoresByProximity(
              getLoadedMallStores(),
              hasValidCoords ? { lat: effectiveLat, lng: effectiveLng } : null
            );
            const closest = nearbyStores[0];
            if (!closest) return null;

            return (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-neutral-950 to-emerald-950/35 border border-amber-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-black flex items-center gap-1">
                      <Store className="w-3 h-3" /> TALLER / ALMACÉN ALIADO MÁS CERCANO
                    </span>
                    {closest.distanceLabel && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        📍 {closest.distanceLabel}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-black font-racing uppercase text-white">
                    {closest.store_name}
                  </p>
                  <p className="text-[11px] font-mono text-neutral-300">
                    📍 {closest.address} ({closest.city})
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={buildStoreMapsUrl(closest, hasValidCoords ? { lat: effectiveLat, lng: effectiveLng } : null)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-racing font-black uppercase text-[11px] flex items-center gap-1 transition"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Ir al Aliado</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      const cleanPhone = String(closest.whatsapp_sales || '573009120000').replace(/[^0-9]/g, '');
                      const gpsLine = hasValidCoords
                        ? `\n📍 Ubicación GPS exacta: https://www.google.com/maps?q=${effectiveLat},${effectiveLng}`
                        : '';
                      const msg = `🆘 *SOLICITUD DE DESVARE / REPUESTO — MOTODASH AI*\nHola *${closest.store_name}*, me varé con mi *${identity.brand} ${identity.model}* (${plate}).${gpsLine}\n\n¿Tienen disponibilidad de auxilio o repuesto urgente?`;
                      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
                    }}
                    className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-racing font-black uppercase text-[11px] flex items-center gap-1 transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>WhatsApp Auxilio</span>
                  </button>
                </div>
              </div>
            );
          })()}
        </div>

        {/* LÍNEAS TELEFÓNICAS OFICIALES DE EMERGENCIA Y GRÚA SEGÚN EL PAÍS */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <a
            href={`tel:${numbers.emergency}`}
            className="p-3 rounded-xl bg-red-950/50 hover:bg-red-900/60 border border-red-500/50 flex flex-col justify-between transition"
          >
            <span className="text-[10px] font-mono uppercase text-red-300 flex items-center gap-1">
              <PhoneCall className="w-3 h-3" /> Emergencia Nacional
            </span>
            <span className="text-lg font-black font-racing text-white mt-1">{numbers.emergency}</span>
          </a>

          <a
            href="tel:#767"
            className="p-3 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/40 flex flex-col justify-between transition"
          >
            <span className="text-[10px] font-mono uppercase text-amber-300 flex items-center gap-1">
              <Truck className="w-3 h-3" /> Policía Carreteras / Grúa
            </span>
            <span className="text-xs font-bold font-mono text-white mt-1">{numbers.highwayPolice}</span>
          </a>

          <a
            href="tel:#888"
            className="p-3 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/40 flex flex-col justify-between transition"
          >
            <span className="text-[10px] font-mono uppercase text-cyan-300 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Asistencia Aseguradora
            </span>
            <span className="text-xs font-bold font-mono text-white mt-1">{numbers.insuranceAssist}</span>
          </a>

          <a
            href={`tel:${numbers.emergency}`}
            className="p-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 flex flex-col justify-between transition"
          >
            <span className="text-[10px] font-mono uppercase text-emerald-300 flex items-center gap-1">
              <HeartPulse className="w-3 h-3" /> Ambulancia / Salud
            </span>
            <span className="text-xs font-bold font-mono text-white mt-1">{numbers.ambulance}</span>
          </a>
        </div>

        {/* CONFIGURACIÓN DE DATOS MÉDICOS Y CONTACTO DE EMERGENCIA */}
        <form onSubmit={handleSaveMedicalCard} className="mt-4 p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-racing uppercase tracking-wider text-neutral-300">
              Actualizar Ficha Médica & Contacto de Emergencia
            </span>
            {savedMedical && (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Guardado en tu Hoja de Vida
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                Tipo de Sangre (RH)
              </label>
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs font-mono text-white"
              >
                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((rh) => (
                  <option key={rh} value={rh}>{rh}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                Alergias / Medicamentos
              </label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="Ej: Ninguna / Penicilina"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                Contacto de Emergencia
              </label>
              <input
                type="text"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                placeholder="Nombre Familiar"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                WhatsApp de Emergencia
              </label>
              <input
                type="text"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                placeholder="Ej: 573215357042"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs font-mono text-white"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs font-racing font-bold uppercase text-emerald-400"
            >
              Guardar Ficha Médica
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
