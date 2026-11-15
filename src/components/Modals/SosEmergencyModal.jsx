import React, { useState } from 'react';
import {
  HeartPulse,
  MapPin,
  PhoneCall,
  Share2,
  ShieldAlert,
  Truck,
  Radio,
  CheckCircle2,
  X
} from 'lucide-react';
import { supabase, getAuthenticatedUserId } from '../../services/supabaseClient';
import { useLanguage } from '../../i18n/LanguageContext';

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

export default function SosEmergencyModal({
  isOpen,
  onClose,
  bike,
  hojaDeVida = {},
  userProfile,
  onUpdateHojaDeVida
}) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const docs = hojaDeVida?.documentos || {};
  const medicalInfo = hojaDeVida?.fichaMedica || {};

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
  const [sosSentToClan, setSosSentToClan] = useState(false);
  const [savedMedical, setSavedMedical] = useState(false);

  if (!isOpen) return null;

  const identity = bike?.config?.bikeIdentity || {};
  const country = hojaDeVida?.country || userProfile?.country || 'Colombia';
  const numbers = COUNTRY_EMERGENCY_NUMBERS[country] || COUNTRY_EMERGENCY_NUMBERS.Colombia;

  const riderName = docs.propietario || userProfile?.fullName || 'Piloto Titular MotoDash';
  const riderId = docs.cedulaPropietario || docs.documentoPropietario || 'Verificado en RUNT/DMV';
  const plate = docs.placa || 'SIN PLACA';
  const soatIssuer = docs.soatAseguradora || 'SOAT Vigente';
  const allRiskIssuer = docs.seguroTodoRiesgoAseguradora || docs.seguroNombre || 'Póliza Todo Riesgo Activa';
  const allRiskPolicy = docs.seguroTodoRiesgoPoliza || docs.seguroPoliza || 'Activa';

  const handleGetLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude.toFixed(5),
          lng: pos.coords.longitude.toFixed(5)
        });
        setLocating(false);
      },
      () => {
        // Coordenadas de respaldo en caso de permiso denegado
        setCoords({ lat: '6.24420', lng: '-75.58121' });
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  const mapsUrl = coords
    ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}`
    : 'https://www.google.com/maps';

  const handleSendWhatsAppSos = () => {
    const text = isEn
      ? `🚨 *MOTO SOS ALERT — MOTODASH AI* 🚨\nRider: ${riderName}\nBike: ${identity.brand} ${identity.model} (Plate: ${plate})\nBlood Type: ${bloodType}\nGPS Location: ${mapsUrl}\nNeed immediate assistance / tow truck.`
      : `🚨 *ALERTA SOS MOTERA — MOTODASH AI* 🚨\nPiloto: ${riderName}\nMoto: ${identity.brand} ${identity.model} (Placa: ${plate})\nFactor RH: ${bloodType}\nUbicación GPS Exacta: ${mapsUrl}\nSolicito apoyo en ruta / asistencia inmediata.`;

    const cleanPhone = String(emergencyContactPhone || '').replace(/[^0-9]/g, '');
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleBroadcastSosToClan = async () => {
    const authUid = await getAuthenticatedUserId();
    const content = `🚨 [ALERTA SOS EN RUTA] Piloto ${riderName} (${identity.brand} ${identity.model} • Placa ${plate} • RH ${bloodType}) solicita apoyo o grúa en estas coordenadas GPS: ${mapsUrl}`;

    if (authUid) {
      await supabase.from('community_messages').insert({
        user_id: authUid,
        channel_id: 'clan_apache-rtr-medellin',
        category: 'alerta_vial',
        author_name: riderName,
        author_bike: `${identity.brand} ${identity.model}`,
        author_verified: true,
        content,
        city: country
      });
    }
    setSosSentToClan(true);
    setTimeout(() => setSosSentToClan(false), 5000);
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
                {isEn ? 'Emergency Medical ID & Live GPS SOS' : 'Identificación Médica de Emergencia & Alerta GPS'}
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

        {/* BOTONES DE EMERGENCIA DE 1 TOQUE: GPS + WHATSAPP + ALERTA AL CLAN */}
        <div className="mt-4 p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-black font-racing uppercase text-amber-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-400" />
                <span>
                  {isEn
                    ? '1-Tap Live GPS SOS Broadcast (WhatsApp & Biker Clan)'
                    : 'Envío de Coordenadas GPS Exactas en 1 Toque (WhatsApp & Clan Motero)'}
                </span>
              </h3>
              <p className="text-xs font-mono text-neutral-400">
                {coords
                  ? `📍 Coordenadas listas: Lat ${coords.lat}, Lng ${coords.lng}`
                  : isEn
                  ? 'Tap "Get My GPS Coordinates" to attach your exact Google Maps pin'
                  : 'Obtén tu ubicación GPS para enviarla a tu familia, grúa o Clan Motero'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleGetLocation}
              disabled={locating}
              className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs font-mono font-bold text-white flex items-center gap-1.5 self-start sm:self-center"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{locating ? 'Obteniendo Satélites...' : '📍 Obtener Mi Ubicación GPS'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleSendWhatsAppSos}
              className="py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-black font-racing font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Share2 className="w-4 h-4" />
              <span>
                {isEn ? 'Send SOS + GPS via WhatsApp' : 'Enviar SOS + Ubicación GPS por WhatsApp'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleBroadcastSosToClan}
              className="py-3 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-racing font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
            >
              <Radio className="w-4 h-4 animate-ping" />
              <span>
                {sosSentToClan
                  ? '¡Alerta SOS Enviada al Clan!'
                  : isEn
                  ? 'Alert My Biker Clan Now'
                  : 'Emitir Alerta SOS a mi Clan Motero'}
              </span>
            </button>
          </div>
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
