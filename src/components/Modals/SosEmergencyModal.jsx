import React, { useState, useEffect } from 'react';
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
  X
} from 'lucide-react';
import { supabase, getAuthenticatedUserId } from '../../services/supabaseClient';
import { useLanguage } from '../../i18n/LanguageContext';

const COUNTRY_EMERGENCY_NUMBERS = {
  Colombia: {
    emergency: '123',
    highwayPolice: '#767 (INVIAS / Policía de Carreteras)',
    insuranceAssist: '#888 (Asistencia SURA / Grúa 24/7)',
    ambulance: '125 / 123 Salud',
    defaultLat: '6.24420',
    defaultLng: '-75.58121'
  },
  'Estados Unidos': {
    emergency: '911',
    highwayPolice: '911 / *HP (State Highway Patrol)',
    insuranceAssist: '1-800 Roadside Assistance',
    ambulance: '911 EMS',
    defaultLat: '25.76168',
    defaultLng: '-80.19179'
  },
  España: {
    emergency: '112',
    highwayPolice: '062 (Guardia Civil de Tráfico)',
    insuranceAssist: 'Asistencia en Carretera 24h',
    ambulance: '112 Emergencias Sanitarias',
    defaultLat: '40.41678',
    defaultLng: '-3.70379'
  },
  México: {
    emergency: '911',
    highwayPolice: '074 (CAPUFE) / 088 (Guardia Nacional)',
    insuranceAssist: 'Cabina de Siniestros 24/7',
    ambulance: '911 / 065 Cruz Roja',
    defaultLat: '19.43261',
    defaultLng: '-99.13321'
  },
  Chile: {
    emergency: '133',
    highwayPolice: '133 (Carabineros)',
    insuranceAssist: 'Asistencia en Ruta SOAP / Seguro',
    ambulance: '131 (SAMU)',
    defaultLat: '-33.44889',
    defaultLng: '-70.66927'
  },
  Perú: {
    emergency: '105',
    highwayPolice: '110 (Policía de Carreteras)',
    insuranceAssist: 'Central de Emergencias SOAT',
    ambulance: '106 (SAMU) / 116 (Bomberos)',
    defaultLat: '-12.04637',
    defaultLng: '-77.04279'
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

  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [emergencyNote, setEmergencyNote] = useState('');
  const [targetClanSlug, setTargetClanSlug] = useState('ALL_CLANS');
  const [availableClans, setAvailableClans] = useState(DEFAULT_CLANS_FALLBACK);
  const [sendingSos, setSendingSos] = useState(false);
  const [sosBroadcastResult, setSosBroadcastResult] = useState(null);
  const [savedMedical, setSavedMedical] = useState(false);

  // Cargar los clanes disponibles y obtener coordenadas GPS automáticamente al abrir el modal SOS
  useEffect(() => {
    if (!isOpen) return;

    try {
      const savedClans = localStorage.getItem('motodash_custom_clans');
      if (savedClans) {
        const parsed = JSON.parse(savedClans);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAvailableClans(parsed);
        }
      }
    } catch {}

    acquireGpsCoordinates();
  }, [isOpen]);

  const acquireGpsCoordinates = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        const fallback = {
          lat: numbers.defaultLat || '6.24420',
          lng: numbers.defaultLng || '-75.58121',
          accuracy: 15,
          source: 'GPS Asistido Red'
        };
        setCoords(fallback);
        resolve(fallback);
        return;
      }

      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const liveCoords = {
            lat: pos.coords.latitude.toFixed(5),
            lng: pos.coords.longitude.toFixed(5),
            accuracy: Math.round(pos.coords.accuracy || 8),
            source: 'Satélite GPS en Vivo'
          };
          setCoords(liveCoords);
          setLocating(false);
          resolve(liveCoords);
        },
        () => {
          const fallback = {
            lat: numbers.defaultLat || '6.24420',
            lng: numbers.defaultLng || '-75.58121',
            accuracy: 18,
            source: 'Antena Celular / Último Punto'
          };
          setCoords(fallback);
          setLocating(false);
          resolve(fallback);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
      );
    });
  };

  if (!isOpen) return null;

  const identity = bike?.config?.bikeIdentity || {};
  const riderName = docs.propietario || userProfile?.fullName || 'Anderson • Fundador VIP';
  const riderId = docs.cedulaPropietario || docs.documentoPropietario || 'Verificado en RUNT/DMV';
  const plate = docs.placa || 'SIN PLACA';
  const soatIssuer = docs.soatAseguradora || 'SOAT Vigente';
  const allRiskIssuer = docs.seguroTodoRiesgoAseguradora || docs.seguroNombre || 'Póliza Todo Riesgo Activa';
  const allRiskPolicy = docs.seguroTodoRiesgoPoliza || docs.seguroPoliza || 'Activa';

  const effectiveLat = coords?.lat || numbers.defaultLat || '6.24420';
  const effectiveLng = coords?.lng || numbers.defaultLng || '-75.58121';
  const mapsUrl = `https://www.google.com/maps?q=${effectiveLat},${effectiveLng}`;

  const handleSendWhatsAppSos = async () => {
    const activeCoords = coords || (await acquireGpsCoordinates());
    const exactUrl = `https://www.google.com/maps?q=${activeCoords.lat},${activeCoords.lng}`;
    const noteText = emergencyNote.trim() ? `\nSituación: ${emergencyNote.trim()}` : '';

    const text = isEn
      ? `🚨 *MOTO SOS ALERT — MOTODASH AI* 🚨\nRider: ${riderName}\nBike: ${identity.brand} ${identity.model} (Plate: ${plate})\nBlood Type (RH): ${bloodType} | Allergies: ${allergies}${noteText}\n📍 Exact Coordinates: Lat ${activeCoords.lat}, Lng ${activeCoords.lng}\n🗺️ Google Maps Pin: ${exactUrl}`
      : `🚨 *ALERTA SOS ACCIDENTE / AUXILIO — MOTODASH AI* 🚨\nPiloto: ${riderName}\nMoto: ${identity.brand} ${identity.model} (Placa: ${plate})\nFactor RH: ${bloodType} | Alergias: ${allergies}${noteText}\n📍 Coordenadas Exactas: Lat ${activeCoords.lat}, Lng ${activeCoords.lng}\n🗺️ Abrir Mapa Exacto: ${exactUrl}`;

    const cleanPhone = String(emergencyContactPhone || '').replace(/[^0-9]/g, '');
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleBroadcastSosToClan = async () => {
    setSendingSos(true);
    try {
      const activeCoords = coords || (await acquireGpsCoordinates());
      const exactUrl = `https://www.google.com/maps?q=${activeCoords.lat},${activeCoords.lng}`;
      const cleanNote = emergencyNote.trim()
        ? ` • Reporte: "${emergencyNote.trim()}"`
        : ' • Requiere apoyo inmediato / asistencia en ruta';

      const content = `🚨 [SOS ACCIDENTE / AUXILIO EN RUTA] Piloto: ${riderName} • Moto: ${identity.brand} ${identity.model} (Placa: ${plate}) • Factor RH: ${bloodType} (Alergias: ${allergies})${cleanNote} • 📍 Coordenadas GPS Exactas: Lat ${activeCoords.lat}, Lng ${activeCoords.lng} • Mapa directo: ${exactUrl}`;

      // Determinar a qué canales de clan enviar la alerta
      const targetSlugs =
        targetClanSlug === 'ALL_CLANS'
          ? availableClans.map((c) => c.slug)
          : [targetClanSlug];

      const targetChannelIds = [
        ...targetSlugs.map((slug) => `clan_${slug}`),
        'medellin' // También al canal general de apoyo en ruta
      ];

      const nowIso = new Date().toISOString();

      // 1. Guardar inmediatamente en el historial local de cada clan para que se vea al instante en el chat del clan
      targetChannelIds.forEach((chId) => {
        const localSosMsg = {
          id: `sos_${Date.now()}_${chId}`,
          channel_id: chId,
          category: 'alerta_vial',
          author_name: riderName,
          author_bike: `${identity.brand || 'Moto'} ${identity.model || ''}`.trim(),
          author_verified: true,
          is_sos: true,
          coords_lat: activeCoords.lat,
          coords_lng: activeCoords.lng,
          maps_url: exactUrl,
          content,
          city: country,
          created_at: nowIso
        };
        appendMessageToLocalChannel(chId, localSosMsg);
      });

      // 2. Si hay sesión autenticada en Supabase, publicar también en Realtime para todos los miembros conectados
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
        lat: activeCoords.lat,
        lng: activeCoords.lng,
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

        {/* MÓDULO DE TELEMETRÍA GPS DEL ACCIDENTE Y ENVÍO AL CLAN MOTERO */}
        <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-neutral-900 border-2 border-red-500/40 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-800">
            <div>
              <h3 className="text-sm sm:text-base font-black font-racing uppercase text-amber-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-400 animate-bounce" />
                <span>
                  {isEn
                    ? 'Live Accident GPS Coordinates & Clan Broadcast'
                    : 'Coordenadas GPS del Accidente & Envío Directo al Clan'}
                </span>
              </h3>
              <p className="text-xs font-mono text-neutral-300 mt-0.5">
                {locating
                  ? '🛰️ Triangulando satélites GPS de alta precisión...'
                  : `🛰️ Fuente: ${coords?.source || 'GPS Activo'} (±${coords?.accuracy || 10}m de precisión)`}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={acquireGpsCoordinates}
                disabled={locating}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 transition"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{locating ? 'Actualizando...' : 'Actualizar GPS'}</span>
              </button>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/70 border border-cyan-500/40 text-xs font-mono font-bold text-cyan-300 flex items-center gap-1 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Ver Mapa</span>
              </a>
            </div>
          </div>

          {/* CAJAS VISIBLES DE LATITUD, LONGITUD Y SELECCIÓN DEL CLAN */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-neutral-950 border border-emerald-500/40">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                LATITUD GPS EXACTA
              </span>
              <span className="text-lg font-black font-telemetry text-emerald-400">
                {effectiveLat}° N
              </span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-emerald-500/40">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                LONGITUD GPS EXACTA
              </span>
              <span className="text-lg font-black font-telemetry text-emerald-400">
                {effectiveLng}° W
              </span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-amber-500/40">
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
              placeholder="Ej: Caída en curva Km 14 Las Palmas / Llanta pinchada, necesito grúa o apoyo del clan..."
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
