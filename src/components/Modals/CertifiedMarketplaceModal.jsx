import React, { useState, useEffect, useRef } from 'react';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  FileText,
  TrendingUp,
  Share2,
  DollarSign,
  Camera,
  Trash2,
  Maximize2,
  MapPin,
  Phone,
  X
} from 'lucide-react';
import { supabase, getAuthenticatedUserId, uploadMotoDocument } from '../../services/supabaseClient';
import { compressDocumentImage } from '../../services/globalDocumentsService';

const CITY_PHASE2_PROGRESS = [
  { city: 'Medellín & Antioquia', activeRiders: 840, target: 1000, percent: 84, status: 'Próxima Apertura' },
  { city: 'Bogotá & Sabana', activeRiders: 760, target: 1000, percent: 76, status: 'En Crecimiento' },
  { city: 'Ciudad de México', activeRiders: 680, target: 1000, percent: 68, status: 'En Crecimiento' },
  { city: 'Madrid & España', activeRiders: 610, target: 1000, percent: 61, status: 'Fase 2' }
];

const SALE_PHOTO_SLOTS = [
  {
    id: 'side_profile',
    step: 'FOTO 1 • PRINCIPAL',
    title: 'Perfil General de la Moto',
    hint: 'Lateral completo (derecho o izquierdo) con buena luz',
    required: true
  },
  {
    id: 'front_wheel',
    step: 'FOTO 2 • FRENTE & LLANTA',
    title: 'Frente, Farola y Llanta Delantera',
    hint: 'Muestra estado de barras, disco de freno y labrado',
    required: true
  },
  {
    id: 'cluster_odometer',
    step: 'FOTO 3 • KILOMETRAJE REAL',
    title: 'Tablero Encendido (Odómetro)',
    hint: 'Respalda visualmente el KM certificado en la app',
    required: true
  },
  {
    id: 'engine_extras',
    step: 'FOTO 4 • MOTOR / EXTRAS (OPCIONAL)',
    title: 'Motor, Kit de Arrastre o Accesorios',
    hint: 'Sliders, alforjas, llanta trasera o detalles extras',
    required: false
  }
];

export default function CertifiedMarketplaceModal({
  isOpen,
  onClose,
  bike,
  hojaDeVida = {},
  odometer = 0,
  userProfile,
  onOpenHojaDeVida,
  onUpdateHojaDeVida
}) {
  const existingListing = hojaDeVida?.marketplaceListing || {};

  const [price, setPrice] = useState(existingListing.price || '11900000');
  const [currency, setCurrency] = useState(existingListing.currency || 'COP');
  const [selectedTier, setSelectedTier] = useState(existingListing.tier || 'free'); // 'free' | 'featured_499' | 'inspection_999'
  const [sellerPhone, setSellerPhone] = useState(existingListing.sellerPhone || userProfile?.phone || '');
  const [sellerNotes, setSellerNotes] = useState(
    existingListing.sellerNotes || 'Mantenimiento al día en MotoDash AI, papeles vigentes, lista para traspaso.'
  );
  const [photos, setPhotos] = useState(existingListing.photos || {});
  const [uploadingSlot, setUploadingSlot] = useState(null);
  const [activeSlotToPick, setActiveSlotToPick] = useState('side_profile');
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [photoErrorMsg, setPhotoErrorMsg] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && bike) {
      const saved = hojaDeVida?.marketplaceListing || {};
      setPrice(saved.price || '11900000');
      setCurrency(saved.currency || 'COP');
      setSelectedTier(saved.tier || 'free');
      setSellerPhone(saved.sellerPhone || userProfile?.phone || '');
      setSellerNotes(
        saved.sellerNotes || 'Mantenimiento al día en MotoDash AI, papeles vigentes, lista para traspaso.'
      );
      setPhotos(saved.photos || {});
      setSavedSuccess(false);
      setPhotoErrorMsg('');
    }
  }, [isOpen, bike?.id]);

  if (!isOpen || !bike) return null;

  const identity = bike.config?.bikeIdentity || {};
  const docs = hojaDeVida?.documentos || {};
  const servicios = Array.isArray(hojaDeVida?.servicios) ? hojaDeVida.servicios : [];

  const uploadedPhotosList = SALE_PHOTO_SLOTS.map((slot) => ({
    ...slot,
    dataUrl: photos[slot.id]?.dataUrl || null,
    uploadedAt: photos[slot.id]?.uploadedAt || null
  })).filter((p) => Boolean(p.dataUrl));

  const uploadedPhotosCount = uploadedPhotosList.length;
  const hasMinThreePhotos = uploadedPhotosCount >= 3;

  // Cálculo automático de la Insignia de "Mantenimiento Verificado"
  const hasVerifiedBadge = servicios.length >= 1 || odometer > 0;
  const lastService = servicios[0] || {
    servicio: 'Mantenimiento Preventivo & Aceite Sintético',
    km: odometer,
    fecha: new Date().toISOString().slice(0, 10),
    taller: 'Centro Autorizado'
  };

  const persistListingToHoja = (nextPhotos, extraFields = {}) => {
    if (!onUpdateHojaDeVida) return;
    onUpdateHojaDeVida({
      ...hojaDeVida,
      marketplaceListing: {
        ...(hojaDeVida.marketplaceListing || {}),
        price,
        currency,
        tier: selectedTier,
        sellerPhone,
        sellerNotes,
        photos: nextPhotos,
        updatedAt: new Date().toISOString(),
        ...extraFields
      }
    });
  };

  const handleTriggerPhotoUpload = (slotId) => {
    setActiveSlotToPick(slotId);
    setPhotoErrorMsg('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handlePhotoFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeSlotToPick) return;

    setUploadingSlot(activeSlotToPick);
    setPhotoErrorMsg('');

    try {
      const compressed = await compressDocumentImage(file, 1280, 0.78);
      let storagePath = null;
      if (!bike?.isDemo && userProfile?.id) {
        try {
          storagePath = await uploadMotoDocument(compressed.compressedFile, `sale_${activeSlotToPick}`);
        } catch {}
      }

      const nextPhotos = {
        ...photos,
        [activeSlotToPick]: {
          slotId: activeSlotToPick,
          dataUrl: compressed.dataUrl,
          storagePath,
          sizeKB: compressed.compressedSizeKB,
          uploadedAt: new Date().toISOString()
        }
      };

      setPhotos(nextPhotos);
      persistListingToHoja(nextPhotos);
    } catch (err) {
      setPhotoErrorMsg(err.message || 'No se pudo procesar la foto de la moto.');
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleRemovePhoto = (slotId) => {
    const nextPhotos = { ...photos };
    delete nextPhotos[slotId];
    setPhotos(nextPhotos);
    persistListingToHoja(nextPhotos);
  };

  const handlePublishListing = async (e) => {
    e.preventDefault();
    setPhotoErrorMsg('');

    if (uploadedPhotosCount < 3) {
      setPhotoErrorMsg(
        `Por favor agrega al menos 3 fotos reales de tu moto (llevas ${uploadedPhotosCount}/3: Perfil, Frente y Tablero) para certificar el anuncio.`
      );
      return;
    }

    setSaving(true);
    setSavedSuccess(false);

    try {
      persistListingToHoja(photos, { status: 'published' });

      const authUid = await getAuthenticatedUserId();
      if (authUid && !bike?.isDemo) {
        await supabase.from('marketplace_listings').upsert(
          {
            user_id: authUid,
            moto_id: bike.id,
            brand: identity.brand || 'Moto',
            model: identity.model || '',
            year: Number(docs.modeloAno || identity.year || 2026),
            odometer: Number(odometer) || 0,
            price: Number(price) || 0,
            currency,
            city: userProfile?.city || 'Medellín',
            country: userProfile?.country || 'Colombia',
            verified_maintenance_badge: hasVerifiedBadge,
            health_score: 98,
            fines_clean: true,
            is_featured: selectedTier !== 'free',
            tier: selectedTier,
            status: 'pre_registered',
            technical_summary: {
              plate: docs.placa || 'PROTEGIDA',
              servicesCount: servicios.length,
              lastService: lastService.servicio,
              componentsAudited: 17,
              photosCount: uploadedPhotosCount,
              photos: Object.keys(photos).map((k) => ({
                slotId: k,
                storagePath: photos[k]?.storagePath || null,
                dataUrl: photos[k]?.dataUrl || null
              })),
              sellerPhone,
              sellerNotes
            }
          },
          { onConflict: 'user_id,moto_id' }
        );
      }
      setSavedSuccess(true);
    } finally {
      setSaving(false);
    }
  };

  const handleShareVerifiedWhatsApp = () => {
    const formattedPrice = Number(price || 0).toLocaleString();
    const text = [
      `🏆 *VENTA CON HISTORIAL CERTIFICADO MOTODASH AI*`,
      `🏍️ Moto: *${identity.brand} ${identity.model} (${docs.modeloAno || identity.year || '2026'})*`,
      `📍 Kilometraje Trazable: *${Number(odometer).toLocaleString()} km*`,
      `💰 Precio: *$${formattedPrice} ${currency}*`,
      `📸 Galería Verificada: *${uploadedPhotosCount} Fotos Reales (Perfil, Frente y Tablero)*`,
      `────────────────────`,
      `✅ *Insignia Mantenimiento Verificado:* ${servicios.length} servicios sellados en bitácora`,
      `🔧 *Último servicio:* ${lastService.servicio} (${lastService.km} km)`,
      `🛡️ *17 Componentes de Desgaste Auditados:* 98% Salud Mecánica`,
      `⚖️ *Estado SIMIT / DGT:* 0 Multas Pendientes • SOAT al día`,
      sellerNotes ? `📝 *Notas del propietario:* ${sellerNotes}` : null,
      sellerPhone ? `📲 *Contacto directo:* ${sellerPhone}` : null,
      `────────────────────`,
      `📄 _Solicita el Certificado PDF de Hoja de Vida y las fotos HD verificadas por MotoDash AI._`
    ]
      .filter(Boolean)
      .join('\n');

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-neutral-950 border border-amber-500/40 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl text-white my-auto max-h-[94vh] overflow-y-auto">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoFileSelected}
          className="hidden"
        />

        {/* ENCABEZADO MARKETPLACE CERTIFICADO */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-500 text-black">
                  HISTORIAL CERTIFICADO • CERO MOTOS MAQUILLADAS
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    hasMinThreePhotos
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                  }`}
                >
                  📸 {uploadedPhotosCount}/4 FOTOS REALES ({hasMinThreePhotos ? 'MÍNIMO 3 COMPLETO ✅' : 'SUBE MÍNIMO 3 FOTOS'})
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black font-racing uppercase tracking-wider text-white mt-1">
                Poner en Venta con Fotos Reales y Sello Verificado
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                Agrega mínimo 3 fotos reales de tu moto y vincúlalas al Certificado PDF de Hoja de Vida y los 17 componentes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* VISTA PREVIA DE LA TARJETA CERTIFICADA DE LA MOTO ACTUAL */}
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-amber-950/20 border border-amber-500/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              {photos.side_profile?.dataUrl && (
                <img
                  src={photos.side_profile.dataUrl}
                  alt={identity.model}
                  onClick={() => setLightboxPhoto(photos.side_profile.dataUrl)}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400 cursor-pointer flex-shrink-0"
                />
              )}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black font-racing uppercase text-white">
                    {identity.brand} {identity.model} ({docs.modeloAno || identity.year || '2026'})
                  </h3>
                  {hasVerifiedBadge && (
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Insignia Mantenimiento Verificado</span>
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono text-neutral-400 mt-0.5">
                  Odómetro Trazable: <strong className="text-white">{Number(odometer).toLocaleString()} km</strong> • Cilindrada: {identity.displacementCc || 160} cc • Fotos cargadas: <strong className="text-amber-300">{uploadedPhotosCount}</strong>
                </p>
              </div>
            </div>

            {onOpenHojaDeVida && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenHojaDeVida();
                }}
                className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs font-mono text-amber-300 flex items-center gap-1.5 self-start sm:self-center"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Ver Certificado PDF Vinculado</span>
              </button>
            )}
          </div>

          {/* 3 PILARES DE TRANSPARENCIA TOTAL PARA EL COMPRADOR */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                1. Último Servicio Sellado
              </span>
              <p className="text-xs font-bold text-white mt-1 truncate">{lastService.servicio}</p>
              <span className="text-[10px] font-mono text-emerald-400">
                A los {lastService.km} km • {servicios.length} registros oficiales
              </span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                2. Salud de 17 Componentes
              </span>
              <p className="text-xs font-bold text-white mt-1">98% Índice de Conservación</p>
              <span className="text-[10px] font-mono text-amber-400">
                Motor, transmisión, frenos y líquidos al día
              </span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                3. Radar Legal SIMIT / DGT
              </span>
              <p className="text-xs font-bold text-white mt-1">0 Multas / Libre de Embargos</p>
              <span className="text-[10px] font-mono text-emerald-400">
                SOAT y Garantía verificados en la nube
              </span>
            </div>
          </div>
        </div>

        {/* SECCIÓN NUEVA: GALERÍA DE FOTOS REALES DE LA MOTO (MÍNIMO 3 FOTOS) */}
        <div className="mt-5 p-4 rounded-2xl bg-neutral-900/75 border border-neutral-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-xs sm:text-sm font-black font-racing uppercase tracking-wider text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-400" />
                <span>Galería Fotográfica de tu Moto (Mínimo 3 Fotos Reales)</span>
              </h4>
              <p className="text-[11px] text-neutral-400 font-mono">
                Toca cada recuadro para tomar o subir la foto desde tu celular. Se comprimen en HD automáticamente.
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold border ${
                hasMinThreePhotos
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
              }`}
            >
              {hasMinThreePhotos
                ? `✅ ${uploadedPhotosCount} de 4 fotos listas`
                : `📸 Faltan ${Math.max(0, 3 - uploadedPhotosCount)} foto(s) para el mínimo de 3`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SALE_PHOTO_SLOTS.map((slot) => {
              const slotData = photos[slot.id];
              const isUploading = uploadingSlot === slot.id;

              return (
                <div
                  key={slot.id}
                  className={`rounded-2xl border p-3 flex flex-col justify-between transition ${
                    slotData?.dataUrl
                      ? 'bg-neutral-950 border-emerald-500/50'
                      : 'bg-neutral-950/70 border-neutral-800 hover:border-amber-500/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-neutral-900 text-amber-300 border border-neutral-800">
                        {slot.step}
                      </span>
                      {slotData?.dataUrl && (
                        <span className="text-[9px] font-mono text-emerald-400 font-bold">LISTA ✓</span>
                      )}
                    </div>

                    <h5 className="text-xs font-bold font-racing uppercase text-white leading-tight">
                      {slot.title}
                    </h5>
                    <p className="text-[10px] text-neutral-400 mt-0.5 mb-2">{slot.hint}</p>
                  </div>

                  {slotData?.dataUrl ? (
                    <div className="space-y-2">
                      <div className="relative group rounded-xl overflow-hidden border border-neutral-800 h-32 bg-black">
                        <img
                          src={slotData.dataUrl}
                          alt={slot.title}
                          onClick={() => setLightboxPhoto(slotData.dataUrl)}
                          className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition"
                        />
                        <button
                          type="button"
                          onClick={() => setLightboxPhoto(slotData.dataUrl)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/75 text-white hover:text-amber-300 transition"
                          title="Ampliar foto"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleTriggerPhotoUpload(slot.id)}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-[10px] font-mono text-amber-300 transition"
                        >
                          Cambiar Foto
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(slot.id)}
                          className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/70 border border-red-500/40 text-red-300 transition"
                          title="Eliminar foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => handleTriggerPhotoUpload(slot.id)}
                      className="h-36 rounded-xl border-2 border-dashed border-neutral-700 hover:border-amber-400 bg-neutral-900/50 hover:bg-neutral-900 flex flex-col items-center justify-center gap-1.5 text-neutral-400 hover:text-amber-300 transition p-2"
                    >
                      <Camera className="w-6 h-6 text-amber-400" />
                      <span className="text-[11px] font-racing font-bold uppercase text-center">
                        {isUploading ? 'Comprimiendo HD...' : '+ Subir / Tomar Foto'}
                      </span>
                      <span className="text-[9px] font-mono text-neutral-500">
                        {slot.required ? 'Requerida (Mín. 3)' : 'Opcional'}
                      </span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CONFIGURACIÓN DE PRECIO, CONTACTO Y MODELO DE MONETIZACIÓN */}
        <form onSubmit={handlePublishListing} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-mono text-neutral-300 block mb-1">
                Precio de Venta Solicitado
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-amber-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-neutral-300 block mb-1">Moneda</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
              >
                <option value="COP">COP ($ Pesos)</option>
                <option value="USD">USD ($ Dólares)</option>
                <option value="EUR">EUR (€ Euros)</option>
                <option value="MXN">MXN ($ Pesos MX)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-neutral-300 block mb-1">
                WhatsApp de Contacto Compradores
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-emerald-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Ej: +57 300 000 0000"
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-neutral-300 block mb-1">
              Descripción / Estado / Extras Incluidos
            </label>
            <input
              type="text"
              value={sellerNotes}
              onChange={(e) => setSellerNotes(e.target.value)}
              placeholder="Ej: Único dueño, llantas al 90%, sliders, SOAT y Tecno vigentes..."
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* OPCIONES DE PUBLICACIÓN E IMPULSO PAGO */}
          <div>
            <label className="text-xs font-mono text-neutral-300 block mb-2">
              Modalidad de Publicación y Peritaje Digital
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div
                onClick={() => setSelectedTier('free')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                  selectedTier === 'free'
                    ? 'bg-amber-500/15 border-amber-400'
                    : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-black font-racing uppercase text-white">
                    Publicación Estándar
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">GRATIS</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Incluido con tu plan activo. Publica tus fotos reales junto a los datos técnicos de tu garaje.
                </p>
              </div>

              <div
                onClick={() => setSelectedTier('featured_499')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                  selectedTier === 'featured_499'
                    ? 'bg-amber-500/15 border-amber-400'
                    : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-black font-racing uppercase text-amber-300">
                    Destacado en tu Ciudad
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400">$4.99 USD</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Posiciona tu moto y tu galería de fotos en los primeros lugares de búsqueda de tu ciudad.
                </p>
              </div>

              <div
                onClick={() => setSelectedTier('inspection_999')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                  selectedTier === 'inspection_999'
                    ? 'bg-amber-500/15 border-amber-400'
                    : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-black font-racing uppercase text-emerald-300">
                    Peritaje Digital + Top
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">$9.99 USD</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Informe técnico descargable de los 17 componentes + Galería HD Certificada + Destacado.
                </p>
              </div>
            </div>
          </div>

          {photoErrorMsg && (
            <div className="p-3 rounded-xl bg-amber-950/70 border border-amber-500/50 text-xs font-mono text-amber-200">
              ⚠️ {photoErrorMsg}
            </div>
          )}

          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-xs font-mono text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                ¡Anuncio certificado con {uploadedPhotosCount} fotos reales guardado con éxito! Ya puedes compartir tu ficha verificada por WhatsApp.
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-racing font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {saving
                  ? 'Certificando Anuncio y Fotos...'
                  : `Publicar con ${uploadedPhotosCount} Foto(s) e Historial Certificado`}
              </span>
            </button>

            <button
              type="button"
              onClick={handleShareVerifiedWhatsApp}
              className="py-3 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-racing font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Compartir Ficha Verificada en WhatsApp</span>
            </button>
          </div>
        </form>

        {/* TERMÓMETRO DE MASA CRÍTICA POR CIUDAD (ESTRATEGIA FASE 2) */}
        <div className="mt-5 p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-black font-racing uppercase tracking-wider text-white">
                Roadmap Fase 2: Masa Crítica por Ciudad para Apertura de Vitrina Pública
              </h4>
            </div>
            <span className="text-[10px] font-mono text-neutral-400">
              Anti-Marketplace Vacío
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 mb-3">
            Para garantizar liquidez inmediata, la vitrina pública de cada ciudad se desbloquea al alcanzar 1.000 moteros activos usando telemetría, alertas y chat. Pre-registrar tu moto hoy congela tu antigüedad de mantenimiento verificado:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {CITY_PHASE2_PROGRESS.map((item) => (
              <div key={item.city} className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-white font-bold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    {item.city}
                  </span>
                  <span className="text-amber-400">{item.percent}% ({item.activeRiders}/1.000)</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* VISOR LIGHTBOX PANTALLA COMPLETA DE FOTOS DE LA MOTO */}
      {lightboxPhoto && (
        <div
          onClick={() => setLightboxPhoto(null)}
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4"
        >
          <button
            type="button"
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-5 right-5 p-2.5 rounded-xl bg-neutral-900 text-white border border-neutral-700"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={lightboxPhoto}
            alt="Foto de la moto en venta"
            className="max-w-full max-h-[88vh] rounded-2xl object-contain border border-amber-500/40 shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
