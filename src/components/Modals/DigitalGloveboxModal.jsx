import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  FileCheck2,
  Camera,
  Sparkles,
  CheckCircle2,
  Maximize2,
  X,
  Globe2,
  QrCode,
  Lock,
  Eye,
  CreditCard,
  UserCheck,
  Scale,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move
} from 'lucide-react';
import {
  COUNTRY_DOCUMENT_TERMINOLOGY,
  getCountryDocumentLabels,
  compressDocumentImage,
  extractDocumentWithAI,
  evaluateDocumentAlertStatus
} from '../../services/globalDocumentsService';
import {
  COUNTRY_TO_ISO_AND_LANG,
  ISO_TO_COUNTRY_NAME,
  LANG_TO_DEFAULT_COUNTRY,
  isEnglishCountry
} from '../../services/trafficLawyerAiService';
import { useLanguage } from '../../i18n/LanguageContext';
import { uploadMotoDocument } from '../../services/supabaseClient';
import {
  saveOfflineCheckpointPhoto,
  loadOfflineCheckpointPhotos
} from '../../services/offlineDocsCache';

export default function DigitalGloveboxModal({
  isOpen,
  onClose,
  bike,
  hojaDeVida = {},
  userProfile,
  onUpdateHojaDeVida,
  onOpenLawyer
}) {
  const { language, setLang } = useLanguage();
  const resolvedCountry =
    (language && language !== 'es' && LANG_TO_DEFAULT_COUNTRY[language]) ||
    hojaDeVida?.country ||
    ISO_TO_COUNTRY_NAME[hojaDeVida?.multas?.pais] ||
    userProfile?.country ||
    'Colombia';

  const [selectedCountry, setSelectedCountry] = useState(resolvedCountry);

  // Estado de escaneo IA, compresión, bóveda offline y bloqueo PIN para agente
  const [scanningSlot, setScanningSlot] = useState(null);
  const [aiDraft, setAiDraft] = useState(null);
  const [compressionStats, setCompressionStats] = useState(null);
  const [fullscreenView, setFullscreenView] = useState(null);
  const [offlinePhotos, setOfflinePhotos] = useState({});
  const [isPinLocked, setIsPinLocked] = useState(false);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [savedPin, setSavedPin] = useState(() => {
    try {
      return localStorage.getItem('motodash_checkpoint_pin') || hojaDeVida?.checkpointPin || '1234';
    } catch {
      return '1234';
    }
  });
  const [showChangePinPanel, setShowChangePinPanel] = useState(false);
  const [newPinValue, setNewPinValue] = useState('');
  const [pinSavedSuccess, setPinSavedSuccess] = useState(false);

  // Controles de Lupa / Zoom / Rotación y Arrastre para que el Agente de Tránsito inspeccione cada detalle
  const [zoomScale, setZoomScale] = useState(1);
  const [rotationDeg, setRotationDeg] = useState(0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDraggingDoc, setIsDraggingDoc] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const fileInputRef = useRef(null);
  const [activeUploadSlot, setActiveUploadSlot] = useState('mandatory_insurance');

  const resetZoomAndPan = () => {
    setZoomScale(1);
    setRotationDeg(0);
    setPanOffset({ x: 0, y: 0 });
    setIsDraggingDoc(false);
  };

  // Filtro rápido por documento en el retén
  const [activeDocFilter, setActiveDocFilter] = useState('all');

  useEffect(() => {
    if (isOpen) {
      try {
        const currentPin = localStorage.getItem('motodash_checkpoint_pin') || hojaDeVida?.checkpointPin || '1234';
        setSavedPin(currentPin);
      } catch {}
    }
  }, [isOpen, hojaDeVida?.checkpointPin]);

  useEffect(() => {
    if (isOpen && resolvedCountry && COUNTRY_DOCUMENT_TERMINOLOGY[resolvedCountry]) {
      setSelectedCountry(resolvedCountry);
    }
  }, [isOpen, resolvedCountry]);

  const isDemoBike = Boolean(
    bike?.isDemo ||
    !userProfile?.id ||
    userProfile?.email === 'demo@motodash.com'
  );

  useEffect(() => {
    if (!isOpen || !bike?.id) return;
    if (isDemoBike) {
      // Aislamiento estricto: el modo Demo nunca lee documentos ni fotos offline reales de IndexedDB
      setOfflinePhotos({});
      return;
    }
    loadOfflineCheckpointPhotos(bike.id).then((cached) => {
      if (cached && typeof cached === 'object') {
        setOfflinePhotos(cached);
      } else {
        setOfflinePhotos({});
      }
    });
  }, [isOpen, bike?.id, isDemoBike]);

  if (!isOpen || !bike) return null;

  const identity = bike.config?.bikeIdentity || {};
  const docs = hojaDeVida?.documentos || {};
  const globalDocs = hojaDeVida?.globalDocuments || {};

  const isEn = isEnglishCountry(selectedCountry);
  const countryLabels = getCountryDocumentLabels(selectedCountry);
  const driverLabels = countryLabels.driver_license || {
    shortName: 'Pase / Licencia de Conducción',
    fullName: 'Licencia Nacional de Conducción (Categoría A1 / A2)',
    categoryDefault: 'A2 (Motocicletas > 125 cc)',
    issuerPlaceholder: 'Ministerio de Transporte / RUNT'
  };

  // 1. PASE / LICENCIA DE CONDUCCIÓN (AMBOS LADOS: FRONTAL Y POSTERIOR)
  const driverLicenseRaw = globalDocs.driver_license || {};
  const driverLicense = {
    holderName: docs.propietario || userProfile?.fullName || 'Conductor Titular',
    licenseNumber: docs.licenciaNumero || docs.documentoPropietario || driverLicenseRaw.licenseNumber || 'VERIFICADO RUNT',
    category: docs.licenciaCategoria || driverLicenseRaw.category || driverLabels.categoryDefault,
    expiryDate: docs.licenciaVencimiento || driverLicenseRaw.expiryDate || '2030-01-23',
    bloodType: docs.grupoSanguineo || driverLicenseRaw.bloodType || 'O+',
    restrictions: docs.licenciaRestricciones || driverLicenseRaw.restrictions || 'Ninguna',
    issuer: driverLabels.issuerPlaceholder,
    frontImageUrl:
      offlinePhotos.driver_license_front ||
      driverLicenseRaw.frontImageUrl ||
      globalDocs.driver_license_front?.imageUrl ||
      null,
    backImageUrl:
      offlinePhotos.driver_license_back ||
      driverLicenseRaw.backImageUrl ||
      globalDocs.driver_license_back?.imageUrl ||
      null
  };

  // 2. TARJETA DE PROPIEDAD / LICENCIA DE TRÁNSITO (AMBOS LADOS: FRONTAL Y POSTERIOR)
  const vehicleRegRaw = globalDocs.vehicle_registration || {};
  const vehicleRegistration = {
    plate: docs.placa || vehicleRegRaw.plate || 'SIN PLACA',
    vin: docs.numeroChasis || docs.vinChasis || vehicleRegRaw.vin || identity.vin || 'N/A',
    engineNumber: docs.numeroMotor || docs.engineNumber || vehicleRegRaw.engineNumber || identity.engineNumber || 'N/A',
    ownerName: docs.propietario || userProfile?.fullName || 'Titular Registrado',
    ownerDoc: docs.documentoPropietario || 'Verificado',
    modelYear: docs.modeloAno || identity.year || '2026',
    displacementCc: identity.displacementCc || bike.config?.telemetrySpecs?.engineCc || 160,
    issuer: countryLabels.vehicle_registration.issuerPlaceholder,
    frontImageUrl:
      offlinePhotos.vehicle_registration_front ||
      vehicleRegRaw.frontImageUrl ||
      vehicleRegRaw.imageUrl ||
      globalDocs.vehicle_registration_front?.imageUrl ||
      null,
    backImageUrl:
      offlinePhotos.vehicle_registration_back ||
      vehicleRegRaw.backImageUrl ||
      globalDocs.vehicle_registration_back?.imageUrl ||
      null
  };

  // 3. SOAT / SEGURO OBLIGATORIO
  const mandatoryInsurance = globalDocs.mandatory_insurance || {
    expiryDate: docs.soatVencimiento || '',
    policyNumber: docs.soatPoliza || `SOAT-${docs.placa || 'OFICIAL'}`,
    issuer: docs.soatAseguradora || countryLabels.mandatory_insurance.issuerPlaceholder,
    imageUrl: offlinePhotos.mandatory_insurance || globalDocs.mandatory_insurance?.imageUrl || null,
    verifiedByAi: Boolean(globalDocs.mandatory_insurance?.verifiedByAi || docs.soatVencimiento)
  };

  // 4. TECNOMECÁNICA / ITV / MOT
  const technicalInspection = globalDocs.technical_inspection || {
    expiryDate: docs.tecnoVencimiento || '',
    policyNumber: docs.tecnoCertificado || `CERT-${docs.placa || 'RUNT'}`,
    issuer: docs.tecnoCentro || countryLabels.technical_inspection.issuerPlaceholder,
    imageUrl: offlinePhotos.technical_inspection || globalDocs.technical_inspection?.imageUrl || null,
    verifiedByAi: Boolean(globalDocs.technical_inspection?.verifiedByAi || docs.tecnoVencimiento)
  };

  const licenseEval = evaluateDocumentAlertStatus(
    driverLicense.expiryDate,
    driverLabels.shortName
  );
  const mandatoryEval = evaluateDocumentAlertStatus(
    mandatoryInsurance.expiryDate,
    countryLabels.mandatory_insurance.shortName
  );
  const technicalEval = evaluateDocumentAlertStatus(
    technicalInspection.expiryDate,
    countryLabels.technical_inspection.shortName
  );

  // Las 6 Fotos de los 4 Documentos Oficiales que pide Tránsito en Colombia y el Mundo:
  // 1A & 1B: Pase de Conducción (Cara Frontal + Cara Posterior)
  // 2A & 2B: Tarjeta de Propiedad (Cara Frontal + Cara Posterior)
  // 3: SOAT (Seguro Obligatorio)
  // 4: Tecnomecánica (Revisión Técnica)
  const checkpointPhotoCards = [
    {
      slot: 'driver_license_front',
      group: 'license',
      stepNumber: '1A',
      globalKey: isEn ? 'driver_license (Side 1)' : 'driver_license (Lado 1)',
      shortLabel: isEn
        ? `${driverLabels.shortName} • SIDE 1 (FRONT)`
        : `${driverLabels.shortName} • LADO 1 (FRONTAL)`,
      fullLabel: isEn
        ? `${driverLabels.fullName} — Front Side`
        : `${driverLabels.fullName} — Cara Frontal (Anverso)`,
      sideBadge: isEn ? 'LICENSE SIDE 1 • HOLDER INFO' : 'PASE LADO 1 • DATOS CONDUCTOR',
      accentBorder: 'border-violet-500/60',
      badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
      badgeText: driverLicense.frontImageUrl
        ? (isEn ? 'FRONT PHOTO READY' : 'FOTO FRONTAL LISTA')
        : (isEn ? 'ACTIVE FRONT SIDE' : 'PASE ANVERSO ACTIVO'),
      imageUrl: driverLicense.frontImageUrl,
      uploadBtnText: driverLicense.frontImageUrl
        ? (isEn ? 'Change License Side 1 (Front)' : 'Cambiar Foto Pase Lado 1 (Frontal)')
        : (isEn ? 'Upload License Side 1 (Front)' : 'Subir Foto Pase Lado 1 (Cara Frontal)'),
      fields: [
        { label: isEn ? 'LICENSE HOLDER' : 'CONDUCTOR TITULAR', value: driverLicense.holderName, highlight: 'text-white font-bold' },
        { label: isEn ? 'LICENSE / ID NUMBER' : 'N° LICENCIA / CÉDULA', value: driverLicense.licenseNumber, highlight: 'text-amber-300 font-bold' },
        { label: isEn ? 'BLOOD TYPE / RH' : 'FACTOR RH / SANGRE', value: driverLicense.bloodType, highlight: 'text-emerald-300 font-bold' },
        { label: isEn ? 'ISSUING AUTHORITY' : 'ENTIDAD EXPEDIDORA', value: driverLicense.issuer, highlight: 'text-neutral-300' }
      ]
    },
    {
      slot: 'driver_license_back',
      group: 'license',
      stepNumber: '1B',
      globalKey: isEn ? 'driver_license (Side 2)' : 'driver_license (Lado 2)',
      shortLabel: isEn
        ? `${driverLabels.shortName} • SIDE 2 (BACK)`
        : `${driverLabels.shortName} • LADO 2 (POSTERIOR)`,
      fullLabel: isEn
        ? `${driverLabels.fullName} — Back Side (Class & Expiration)`
        : `${driverLabels.fullName} — Cara Posterior (Categoría y Vigencia)`,
      sideBadge: isEn ? 'LICENSE SIDE 2 • MOTORCYCLE CLASS' : 'PASE LADO 2 • CATEGORÍA MOTO',
      accentBorder: 'border-violet-500/60',
      badgeColor:
        licenseEval.status === 'expired'
          ? 'bg-red-500/20 text-red-300 border-red-500/40'
          : 'bg-violet-500/20 text-violet-300 border-violet-500/40',
      badgeText: driverLicense.backImageUrl
        ? (isEn ? 'BACK PHOTO READY' : 'FOTO POSTERIOR LISTA')
        : (isEn ? 'VALID LICENSE' : licenseEval.badgeText),
      imageUrl: driverLicense.backImageUrl,
      uploadBtnText: driverLicense.backImageUrl
        ? (isEn ? 'Change License Side 2 (Back)' : 'Cambiar Foto Pase Lado 2 (Posterior)')
        : (isEn ? 'Upload License Side 2 (Back)' : 'Subir Foto Pase Lado 2 (Cara Posterior)'),
      fields: [
        { label: isEn ? 'AUTHORIZED CLASS' : 'CATEGORÍA AUTORIZADA', value: driverLicense.category, highlight: 'text-amber-400 font-bold' },
        { label: isEn ? 'EXPIRATION DATE' : 'FECHA VENCIMIENTO PASE', value: driverLicense.expiryDate, highlight: 'text-emerald-400 font-bold' },
        { label: isEn ? 'RESTRICTIONS' : 'RESTRICCIONES', value: isEn && driverLicense.restrictions === 'Ninguna' ? 'None' : driverLicense.restrictions, highlight: 'text-white' },
        { label: isEn ? 'OFFICIAL VERIFICATION' : 'VERIFICACIÓN OFICIAL', value: countryLabels.authority, highlight: 'text-violet-300' }
      ]
    },
    {
      slot: 'vehicle_registration_front',
      group: 'registration',
      stepNumber: '2A',
      globalKey: isEn ? 'vehicle_registration (Side 1)' : 'vehicle_registration (Lado 1)',
      shortLabel: isEn
        ? `${countryLabels.vehicle_registration.shortName} • SIDE 1 (FRONT)`
        : `${countryLabels.vehicle_registration.shortName} • LADO 1 (FRONTAL)`,
      fullLabel: isEn
        ? `${countryLabels.vehicle_registration.fullName} — Front Side`
        : `${countryLabels.vehicle_registration.fullName} — Cara Frontal (Anverso)`,
      sideBadge: isEn ? 'REGISTRATION SIDE 1 • FRONT' : 'TARJETA LADO 1 • ANVERSO',
      accentBorder: 'border-amber-500/60',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      badgeText: vehicleRegistration.frontImageUrl
        ? (isEn ? 'FRONT PHOTO READY' : 'FOTO FRONTAL LISTA')
        : (isEn ? 'OFFICIAL FRONT SIDE' : 'CARA FRONTAL OFICIAL'),
      imageUrl: vehicleRegistration.frontImageUrl,
      uploadBtnText: vehicleRegistration.frontImageUrl
        ? (isEn ? 'Change Registration Side 1 (Front)' : 'Cambiar Foto Tarjeta Lado 1 (Frontal)')
        : (isEn ? 'Upload Registration Side 1 (Front)' : 'Subir Foto Tarjeta Lado 1 (Cara Frontal)'),
      fields: [
        { label: isEn ? 'LICENSE PLATE' : 'PLACA / MATRÍCULA', value: vehicleRegistration.plate, highlight: 'text-amber-400 font-bold' },
        { label: isEn ? 'MAKE / MODEL / YEAR' : 'MARCA / LÍNEA / MODELO', value: `${identity.brand} ${identity.model} (${vehicleRegistration.modelYear})`, highlight: 'text-white font-bold' },
        { label: isEn ? 'DISPLACEMENT / CLASS' : 'CILINDRADA / CLASE', value: `${vehicleRegistration.displacementCc} cc • ${isEn ? 'MOTORCYCLE' : 'MOTOCICLETA'}`, highlight: 'text-emerald-300' },
        { label: isEn ? 'REGISTERED OWNER' : 'PROPIETARIO TITULAR', value: vehicleRegistration.ownerName, highlight: 'text-neutral-200' }
      ]
    },
    {
      slot: 'vehicle_registration_back',
      group: 'registration',
      stepNumber: '2B',
      globalKey: isEn ? 'vehicle_registration (Side 2)' : 'vehicle_registration (Lado 2)',
      shortLabel: isEn
        ? `${countryLabels.vehicle_registration.shortName} • SIDE 2 (BACK)`
        : `${countryLabels.vehicle_registration.shortName} • LADO 2 (POSTERIOR)`,
      fullLabel: isEn
        ? `${countryLabels.vehicle_registration.fullName} — Back Side`
        : `${countryLabels.vehicle_registration.fullName} — Cara Posterior (Reverso)`,
      sideBadge: isEn ? 'REGISTRATION SIDE 2 • BACK' : 'TARJETA LADO 2 • REVERSO',
      accentBorder: 'border-cyan-500/60',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      badgeText: vehicleRegistration.backImageUrl
        ? (isEn ? 'BACK PHOTO READY' : 'FOTO POSTERIOR LISTA')
        : (isEn ? 'OFFICIAL BACK SIDE' : 'CARA POSTERIOR OFICIAL'),
      imageUrl: vehicleRegistration.backImageUrl,
      uploadBtnText: vehicleRegistration.backImageUrl
        ? (isEn ? 'Change Registration Side 2 (Back)' : 'Cambiar Foto Tarjeta Lado 2 (Posterior)')
        : (isEn ? 'Upload Registration Side 2 (Back)' : 'Subir Foto Tarjeta Lado 2 (Cara Posterior)'),
      fields: [
        { label: isEn ? 'VIN / CHASSIS / SERIAL' : 'VIN / CHASIS / SERIE', value: vehicleRegistration.vin, highlight: 'text-amber-300 font-bold' },
        { label: isEn ? 'ENGINE NUMBER' : 'NÚMERO DE MOTOR', value: vehicleRegistration.engineNumber, highlight: 'text-white font-bold' },
        { label: isEn ? 'USE / RESTRICTION' : 'SERVICIO / RESTRICCIÓN', value: isEn ? 'PRIVATE • NO RESTRICTIONS' : 'PARTICULAR • SIN RESTRICCIÓN', highlight: 'text-emerald-300' },
        { label: isEn ? 'TRAFFIC AUTHORITY' : 'ORGANISMO TRÁNSITO', value: countryLabels.authority, highlight: 'text-cyan-300' }
      ]
    },
    {
      slot: 'mandatory_insurance',
      group: 'soat',
      stepNumber: '3',
      globalKey: 'mandatory_insurance',
      shortLabel: isEn ? `${countryLabels.mandatory_insurance.shortName} Photo` : `Foto ${countryLabels.mandatory_insurance.shortName}`,
      fullLabel: countryLabels.mandatory_insurance.fullName,
      sideBadge: isEn ? 'MANDATORY LIABILITY INSURANCE' : 'SEGURO OBLIGATORIO VIGENTE',
      accentBorder: 'border-emerald-500/50',
      badgeColor:
        mandatoryEval.status === 'expired'
          ? 'bg-red-500/20 text-red-300 border-red-500/40'
          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      badgeText: isEn ? (mandatoryEval.status === 'expired' ? 'EXPIRED' : 'ACTIVE POLICY') : mandatoryEval.badgeText,
      imageUrl: mandatoryInsurance.imageUrl,
      uploadBtnText: mandatoryInsurance.imageUrl
        ? (isEn ? `Change ${countryLabels.mandatory_insurance.shortName} Photo` : `Cambiar Foto ${countryLabels.mandatory_insurance.shortName}`)
        : (isEn ? `Upload ${countryLabels.mandatory_insurance.shortName} (AI Scanner)` : `Subir Foto ${countryLabels.mandatory_insurance.shortName} (Escáner IA)`),
      fields: [
        { label: isEn ? 'VEHICLE PLATE' : 'PLACA VEHÍCULO', value: vehicleRegistration.plate, highlight: 'text-amber-400 font-bold' },
        { label: isEn ? 'EXPIRATION DATE' : 'FECHA VENCIMIENTO', value: mandatoryInsurance.expiryDate || (isEn ? 'NO DATE' : 'SIN FECHA'), highlight: 'text-emerald-400 font-bold' },
        { label: isEn ? 'POLICY NUMBER' : 'N° PÓLIZA', value: mandatoryInsurance.policyNumber, highlight: 'text-white' },
        { label: isEn ? 'INSURANCE CARRIER' : 'ASEGURADORA', value: mandatoryInsurance.issuer, highlight: 'text-neutral-300' }
      ]
    },
    {
      slot: 'technical_inspection',
      group: 'tecno',
      stepNumber: '4',
      globalKey: 'technical_inspection',
      shortLabel: isEn ? `${countryLabels.technical_inspection.shortName} Photo` : `Foto ${countryLabels.technical_inspection.shortName}`,
      fullLabel: countryLabels.technical_inspection.fullName,
      sideBadge: isEn ? 'SAFETY & EMISSIONS CERTIFICATE' : 'CERTIFICADO TÉCNICO Y GASES',
      accentBorder: 'border-emerald-500/50',
      badgeColor:
        technicalEval.status === 'expired'
          ? 'bg-red-500/20 text-red-300 border-red-500/40'
          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      badgeText: isEn ? (technicalEval.status === 'expired' ? 'EXPIRED' : 'ACTIVE INSPECTION') : technicalEval.badgeText,
      imageUrl: technicalInspection.imageUrl,
      uploadBtnText: technicalInspection.imageUrl
        ? (isEn ? `Change ${countryLabels.technical_inspection.shortName} Photo` : `Cambiar Foto ${countryLabels.technical_inspection.shortName}`)
        : (isEn ? `Upload ${countryLabels.technical_inspection.shortName} (AI Scanner)` : `Subir Foto ${countryLabels.technical_inspection.shortName} (Escáner IA)`),
      fields: [
        { label: isEn ? 'VEHICLE PLATE' : 'PLACA VEHÍCULO', value: vehicleRegistration.plate, highlight: 'text-amber-400 font-bold' },
        { label: isEn ? 'EXPIRATION DATE' : 'FECHA VENCIMIENTO', value: technicalInspection.expiryDate || (isEn ? 'NO DATE' : 'SIN FECHA'), highlight: 'text-emerald-400 font-bold' },
        { label: isEn ? 'CERTIFICATE NUMBER' : 'N° CERTIFICADO', value: technicalInspection.policyNumber, highlight: 'text-white' },
        { label: isEn ? 'INSPECTION STATION' : 'CENTRO / CDA', value: technicalInspection.issuer, highlight: 'text-neutral-300' }
      ]
    }
  ];

  const visibleCards =
    activeDocFilter === 'all'
      ? checkpointPhotoCards
      : checkpointPhotoCards.filter((c) => c.group === activeDocFilter);

  const handleTriggerFileSelect = (slotKey) => {
    setActiveUploadSlot(slotKey);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const slot = activeUploadSlot;
    setScanningSlot(slot);
    setAiDraft(null);
    setCompressionStats(null);

    try {
      const compressed = await compressDocumentImage(file, 1400, 0.78);
      setCompressionStats({
        originalKB: compressed.originalSizeKB,
        compressedKB: compressed.compressedSizeKB,
        savedPercent: compressed.savedPercent
      });

      let storagePath = null;
      if (!isDemoBike) {
        try {
          storagePath = await uploadMotoDocument(compressed.compressedFile, slot);
        } catch {
          // Sin sesión o sin conexión
        }
      }

      const baseDocSlot = slot.startsWith('vehicle_registration')
        ? 'vehicle_registration'
        : slot.startsWith('driver_license')
        ? 'driver_license'
        : slot;

      const aiResult = await extractDocumentWithAI({
        base64Data: compressed.base64Data,
        mimeType: compressed.mimeType,
        documentSlot: baseDocSlot,
        bikePlate: docs.placa || '',
        bikeBrand: identity.brand || '',
        bikeModel: identity.model || ''
      });

      // Guardar inmediatamente en la Bóveda Offline IndexedDB para funcionar con 0% señal en carretera (solo cuentas reales)
      if (bike?.id && compressed.dataUrl) {
        if (!isDemoBike) {
          await saveOfflineCheckpointPhoto(bike.id, slot, compressed.dataUrl, {
            expiryDate: aiResult.expiryDate,
            policyOrCertNumber: aiResult.policyOrCertNumber
          });
        }
        setOfflinePhotos((prev) => ({ ...prev, [slot]: compressed.dataUrl }));
      }

      setAiDraft({
        slot,
        source: aiResult.source,
        expiryDate: aiResult.expiryDate,
        issueDate: aiResult.issueDate,
        policyOrCertNumber: aiResult.policyOrCertNumber,
        issuerEntity: aiResult.issuerEntity,
        plate: aiResult.plate || docs.placa || '',
        vin: aiResult.vin || docs.numeroChasis || '',
        engineNumber: aiResult.engineNumber || docs.numeroMotor || '',
        confidence: Math.round((aiResult.confidence || 0.95) * 100),
        summary: aiResult.summary,
        imageUrl: compressed.dataUrl,
        storagePath
      });
    } catch (err) {
      alert(err.message || 'No se pudo procesar la imagen del documento.');
    } finally {
      setScanningSlot(null);
    }
  };

  const handleConfirmAiExtraction = () => {
    if (!aiDraft || !onUpdateHojaDeVida) return;

    const slot = aiDraft.slot;
    const prevGlobal = hojaDeVida.globalDocuments || {};
    const prevReg = prevGlobal.vehicle_registration || {};
    const prevLic = prevGlobal.driver_license || {};

    const nextGlobalDocs = { ...prevGlobal };
    const nextDocs = { ...(hojaDeVida.documentos || {}) };

    if (slot === 'driver_license_front' || slot === 'driver_license_back') {
      const isFront = slot === 'driver_license_front';
      nextGlobalDocs.driver_license = {
        ...prevLic,
        documentType: 'driver_license',
        licenseNumber: aiDraft.policyOrCertNumber || driverLicense.licenseNumber,
        expiryDate: aiDraft.expiryDate || driverLicense.expiryDate,
        issuer: aiDraft.issuerEntity || driverLicense.issuer,
        frontImageUrl: isFront ? aiDraft.imageUrl : prevLic.frontImageUrl || null,
        backImageUrl: !isFront ? aiDraft.imageUrl : prevLic.backImageUrl || null,
        verifiedByAi: true,
        updatedAt: new Date().toISOString()
      };
      nextGlobalDocs[slot] = {
        documentType: slot,
        imageUrl: aiDraft.imageUrl,
        storagePath: aiDraft.storagePath,
        updatedAt: new Date().toISOString()
      };
      if (aiDraft.expiryDate) nextDocs.licenciaVencimiento = aiDraft.expiryDate;
      if (aiDraft.policyOrCertNumber) nextDocs.licenciaNumero = aiDraft.policyOrCertNumber;
    } else if (slot === 'vehicle_registration_front' || slot === 'vehicle_registration_back') {
      const isFront = slot === 'vehicle_registration_front';
      nextGlobalDocs.vehicle_registration = {
        ...prevReg,
        documentType: 'vehicle_registration',
        plate: aiDraft.plate || docs.placa,
        vin: aiDraft.vin || docs.numeroChasis,
        engineNumber: aiDraft.engineNumber || docs.numeroMotor,
        frontImageUrl: isFront ? aiDraft.imageUrl : prevReg.frontImageUrl || null,
        backImageUrl: !isFront ? aiDraft.imageUrl : prevReg.backImageUrl || null,
        verifiedByAi: true,
        updatedAt: new Date().toISOString()
      };
      nextGlobalDocs[slot] = {
        documentType: slot,
        imageUrl: aiDraft.imageUrl,
        storagePath: aiDraft.storagePath,
        updatedAt: new Date().toISOString()
      };
      if (aiDraft.plate) nextDocs.placa = aiDraft.plate;
      if (aiDraft.vin) nextDocs.numeroChasis = aiDraft.vin;
      if (aiDraft.engineNumber) nextDocs.numeroMotor = aiDraft.engineNumber;
    } else {
      nextGlobalDocs[slot] = {
        documentType: slot,
        expiryDate: aiDraft.expiryDate,
        issueDate: aiDraft.issueDate,
        policyNumber: aiDraft.policyOrCertNumber,
        issuer: aiDraft.issuerEntity,
        plate: aiDraft.plate || docs.placa,
        imageUrl: aiDraft.imageUrl,
        storagePath: aiDraft.storagePath,
        verifiedByAi: true,
        updatedAt: new Date().toISOString()
      };

      if (slot === 'mandatory_insurance') {
        nextDocs.soatVencimiento = aiDraft.expiryDate;
        nextDocs.soatPoliza = aiDraft.policyOrCertNumber;
        nextDocs.soatAseguradora = aiDraft.issuerEntity;
      } else if (slot === 'technical_inspection') {
        nextDocs.tecnoVencimiento = aiDraft.expiryDate;
        nextDocs.tecnoCertificado = aiDraft.policyOrCertNumber;
        nextDocs.tecnoCentro = aiDraft.issuerEntity;
      }
    }

    onUpdateHojaDeVida({
      ...hojaDeVida,
      country: selectedCountry,
      documentos: nextDocs,
      globalDocuments: nextGlobalDocs
    });

    setAiDraft(null);
  };

  const handleCountryChange = (newCountry) => {
    setSelectedCountry(newCountry);
    const mapping = COUNTRY_TO_ISO_AND_LANG[newCountry] || { iso: 'CO', lang: 'es' };
    if (setLang) {
      setLang(mapping.lang);
    }
    if (onUpdateHojaDeVida) {
      const currentMultas = hojaDeVida?.multas || {};
      onUpdateHojaDeVida({
        ...hojaDeVida,
        country: newCountry,
        multas: {
          ...currentMultas,
          pais: mapping.iso
        }
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/94 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-neutral-950 border-2 border-emerald-500/40 rounded-3xl max-w-5xl w-full p-4 sm:p-6 shadow-[0_0_50px_rgba(16,185,129,0.18)] relative text-white my-auto max-h-[95vh] overflow-y-auto">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* ENCABEZADO MODO RETÉN POLICIAL */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500 text-black">
                  {isEn
                    ? 'POLICE CHECKPOINT MODE • ALL 4 REQUIRED DOCUMENTS'
                    : 'MODO RETÉN POLICIAL • LOS 4 DOCUMENTOS EXIGIDOS'}
                </span>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {isEn ? 'PLATE' : 'PLACA'}: {vehicleRegistration.plate}
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black font-racing uppercase tracking-wider text-white mt-1">
                1. {driverLabels.shortName} ({isEn ? '2 Sides' : '2 Lados'}) • 2. {countryLabels.vehicle_registration.shortName} ({isEn ? '2 Sides' : '2 Lados'}) • 3. {countryLabels.mandatory_insurance.shortName} • 4. {countryLabels.technical_inspection.shortName}
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                {identity.brand} {identity.model} ({vehicleRegistration.modelYear}) • {isEn ? `Automatically adapted for ${selectedCountry}` : `Adaptado automáticamente para ${selectedCountry}`} ({countryLabels.authority})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-end lg:self-center">
            {onOpenLawyer && (
              <button
                type="button"
                onClick={onOpenLawyer}
                className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-racing font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition"
                title={isEn ? 'Ask AI Traffic Lawyer if a ticket or tow is legal' : 'Consultar al Asesor Jurídico Vial IA si un comparendo o grúa es legal'}
              >
                <Scale className="w-4 h-4 text-amber-400" />
                <span>{isEn ? 'Ticket or Tow? AI Lawyer' : '¿Comparendo o Grúa? Abogado IA'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setFullscreenView({ mode: 'all_checkpoint' })}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-racing font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
            >
              <Maximize2 className="w-4 h-4" />
              <span>{isEn ? 'Show All to Officer' : 'Mostrar Todo al Agente'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setNewPinValue(savedPin);
                setShowChangePinPanel(!showChangePinPanel);
              }}
              className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs flex items-center gap-1.5 transition"
              title={isEn ? 'Change your 4-digit Checkpoint Lock PIN' : 'Cambiar tu PIN de 4 dígitos para bloqueo en retenes'}
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEn ? 'Change PIN' : 'Cambiar PIN'}</span>
            </button>

            <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-700 rounded-xl px-2.5 py-1.5">
              <Globe2 className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={selectedCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="bg-transparent text-xs font-mono text-white focus:outline-none cursor-pointer"
                title={isEn ? 'Switch country to adapt required traffic documents' : 'Cambia de país para ver qué documentos exige la autoridad local'}
              >
                {Object.keys(COUNTRY_DOCUMENT_TERMINOLOGY).map((countryName) => (
                  <option key={countryName} value={countryName} className="bg-neutral-900 text-white">
                    {COUNTRY_DOCUMENT_TERMINOLOGY[countryName].flag} {countryName}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PANEL RÁPIDO PARA CAMBIAR EL PIN DE 4 DÍGITOS DE BLOQUEO POLICIAL */}
        {showChangePinPanel && (
          <div className="mt-3 p-4 rounded-2xl bg-neutral-900 border-2 border-amber-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
            <div>
              <h3 className="text-xs sm:text-sm font-black font-racing uppercase text-amber-300 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>
                  {isEn
                    ? 'Customize Your 4-Digit Officer Screen Lock PIN'
                    : 'Configurar tu PIN Personal de 4 Dígitos (Modo Retén)'}
                </span>
              </h3>
              <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                {isEn
                  ? `Current PIN: ${savedPin} • Used to lock the screen before handing your phone to an officer.`
                  : `PIN actual: ${savedPin} • Se usa para bloquear la pantalla antes de entregarle el celular al agente de tránsito.`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={newPinValue}
                onChange={(e) => setNewPinValue(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                placeholder="Ej: 2580"
                className="w-28 bg-neutral-950 border-2 border-amber-500/50 rounded-xl px-3 py-2 text-center font-mono font-bold text-sm text-white tracking-widest focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={() => {
                  if (newPinValue.length !== 4) {
                    alert(isEn ? 'Please enter exactly 4 digits.' : 'El PIN debe tener exactamente 4 números.');
                    return;
                  }
                  setSavedPin(newPinValue);
                  try {
                    localStorage.setItem('motodash_checkpoint_pin', newPinValue);
                  } catch {}
                  if (onUpdateHojaDeVida) {
                    onUpdateHojaDeVida({
                      ...hojaDeVida,
                      checkpointPin: newPinValue
                    });
                  }
                  setPinSavedSuccess(true);
                  setTimeout(() => {
                    setPinSavedSuccess(false);
                    setShowChangePinPanel(false);
                  }, 1500);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-racing font-black uppercase text-xs transition shadow-md"
              >
                {pinSavedSuccess ? (isEn ? '✓ PIN Saved!' : '✓ ¡PIN Guardado!') : (isEn ? 'Save PIN' : 'Guardar PIN')}
              </button>
            </div>
          </div>
        )}

        {/* BARRA DE FILTRO RÁPIDO ENTRE LOS 4 DOCUMENTOS EXIGIDOS EN UN RETÉN */}
        <div className="flex gap-1.5 overflow-x-auto py-3 border-b border-neutral-800/80">
          {[
            { id: 'all', label: isEn ? '📋 All Documents (6 Photos)' : '📋 Todos los Documentos (6 Fotos)' },
            { id: 'license', label: `🪪 1. ${driverLabels.shortName} (${isEn ? 'Both Sides' : 'Ambos Lados'})` },
            { id: 'registration', label: `💳 2. ${countryLabels.vehicle_registration.shortName} (${isEn ? 'Both Sides' : 'Ambos Lados'})` },
            { id: 'soat', label: `🛡️ 3. ${countryLabels.mandatory_insurance.shortName}` },
            { id: 'tecno', label: `🔧 4. ${countryLabels.technical_inspection.shortName}` }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveDocFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap border transition ${
                activeDocFilter === tab.id
                  ? 'bg-emerald-500 text-black font-bold border-emerald-400 shadow-md'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* PANEL DE CONFIRMACIÓN DE LECTURA CON IA (FACTOR WOW) */}
        {aiDraft && (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-neutral-900 border-2 border-amber-400/60 animate-fadeIn">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                <div>
                  <h3 className="text-sm font-black font-racing uppercase text-amber-300">
                    ¡Foto Comprimida y Leída con IA! ({aiDraft.confidence}% Precisión)
                  </h3>
                  <p className="text-[11px] font-mono text-neutral-300">
                    Motor: {aiDraft.source} • Confirma los datos para guardar la foto en tu Guantera Digital:
                  </p>
                </div>
              </div>
              {compressionStats && (
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/40">
                  Compresión Frontend: {compressionStats.originalKB} KB → {compressionStats.compressedKB} KB (-{compressionStats.savedPercent}%)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              <div>
                <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                  Fecha de Vencimiento Extraída
                </label>
                <input
                  type="date"
                  value={aiDraft.expiryDate}
                  onChange={(e) => setAiDraft({ ...aiDraft, expiryDate: e.target.value })}
                  className="w-full bg-neutral-950 border border-amber-500/50 rounded-xl px-3 py-2 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                  Número de Documento / Póliza / Placa
                </label>
                <input
                  type="text"
                  value={aiDraft.policyOrCertNumber}
                  onChange={(e) => setAiDraft({ ...aiDraft, policyOrCertNumber: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                  Entidad Emisora Detectada
                </label>
                <input
                  type="text"
                  value={aiDraft.issuerEntity}
                  onChange={(e) => setAiDraft({ ...aiDraft, issuerEntity: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs font-mono text-white"
                />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setAiDraft(null)}
                className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-mono text-neutral-400"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmAiExtraction}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-racing font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Foto y Guardar en Supabase</span>
              </button>
            </div>
          </div>
        )}

        {/* GRILLA UNIFORME DE FOTOS PARA EL RETÉN (PASE 2 LADOS + TARJETA PROPIEDAD 2 LADOS + SOAT + TECNO) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {visibleCards.map((card) => {
            const isScanning = scanningSlot === card.slot;
            const isLicense = card.group === 'license';
            const isReg = card.group === 'registration';

            return (
              <div
                key={card.slot}
                className={`rounded-2xl p-4 bg-neutral-900/95 border-2 ${card.accentBorder} flex flex-col justify-between transition`}
              >
                <div>
                  {/* Cabecera de cada Foto */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-md bg-neutral-800 text-amber-400 border border-neutral-700">
                        DOC {card.stepNumber}
                      </span>
                      <span className="text-[10px] font-mono font-bold uppercase text-neutral-300">
                        {card.sideBadge}
                      </span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${card.badgeColor}`}>
                      {card.badgeText}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-black font-racing uppercase text-white flex items-center gap-1.5 mb-2">
                    {isLicense ? (
                      <UserCheck className="w-4 h-4 text-violet-400 flex-shrink-0" />
                    ) : isReg ? (
                      <CreditCard className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    ) : (
                      <FileCheck2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    )}
                    <span>{card.shortLabel}</span>
                  </h3>

                  {/* VISOR DE LA FOTO DEL DOCUMENTO */}
                  <div
                    onClick={() => setFullscreenView({ mode: 'single', card })}
                    className="relative group cursor-pointer rounded-xl overflow-hidden border-2 border-neutral-700 hover:border-amber-400 h-52 bg-neutral-950 flex flex-col justify-between p-3.5 transition"
                  >
                    {card.imageUrl ? (
                      <img
                        src={card.imageUrl}
                        alt={card.shortLabel}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <div className="flex items-start justify-between border-b border-neutral-800 pb-2">
                          <div>
                            <span className="text-[9px] font-mono uppercase text-emerald-400 font-bold block">
                              {isEn ? 'VERIFIED DIGITAL CREDENTIAL' : 'CREDENCIAL DIGITAL VERIFICADA'} • {card.globalKey}
                            </span>
                            <span className="text-xs font-black font-racing uppercase text-white line-clamp-1">
                              {card.fullLabel}
                            </span>
                          </div>
                          <QrCode className="w-7 h-7 text-emerald-400 flex-shrink-0" />
                        </div>

                        <div className="space-y-1.5 font-mono text-[11px] my-auto">
                          {card.fields.map((f) => (
                            <div
                              key={f.label}
                              className="flex justify-between gap-2 bg-neutral-900/90 px-2.5 py-1 rounded-lg border border-neutral-800/80"
                            >
                              <span className="text-neutral-400">{f.label}:</span>
                              <span className={`${f.highlight} truncate max-w-[200px]`}>{f.value}</span>
                            </div>
                          ))}
                        </div>

                        <div className="text-[10px] font-mono text-neutral-400 flex justify-between items-center pt-1 border-t border-neutral-800">
                          <span>{isEn ? 'Upload physical photo or tap to expand' : 'Sube la foto física o toca para ampliar'}</span>
                          <span className="text-amber-400 font-bold">{isEn ? 'Full Screen 🔍' : 'Pantalla Completa 🔍'}</span>
                        </div>
                      </>
                    )}

                    <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-xs font-mono font-bold text-white transition">
                      <Maximize2 className="w-4 h-4 text-emerald-400" />
                      <span>{isEn ? 'Show to Officer in Full Screen' : 'Mostrar al Agente en Pantalla Completa'}</span>
                    </div>
                  </div>
                </div>

                {/* BOTONES DE ACCIÓN DE CADA FOTO */}
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={isScanning}
                    onClick={() => handleTriggerFileSelect(card.slot)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 font-racing font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
                  >
                    {isScanning ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        <span>Comprimiendo & Leyendo IA...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-3.5 h-3.5" />
                        <span>{card.uploadBtnText}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setFullscreenView({ mode: 'single', card })}
                    className="px-3 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs font-mono text-white flex items-center gap-1"
                    title="Ampliar foto en pantalla completa"
                  >
                    <Eye className="w-4 h-4 text-emerald-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* PÓLIZA TODO RIESGO ADICIONAL (SI EXISTE EN HOJA DE VIDA, EJ. SURA) */}
        {docs.seguroTodoRiesgoAseguradora && (
          <div className="mt-4 p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-cyan-400 flex-shrink-0" />
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-300 font-bold block">
                  PÓLIZA TODO RIESGO ACTIVA • COBERTURA COMPLEMENTARIA
                </span>
                <p className="text-xs font-mono text-white">
                  {docs.seguroTodoRiesgoAseguradora} • Póliza N° {docs.seguroTodoRiesgoPoliza} • {docs.seguroTodoRiesgoPlan || 'Plan Integral'} (Vence: {docs.seguroTodoRiesgoVencimiento})
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              Asistencia 24/7 Activa
            </span>
          </div>
        )}

        {/* VISOR DE PANTALLA COMPLETA PARA INSPECCIÓN DE AGENTE DE TRÁNSITO + BLOQUEO TÁCTIL CON PIN */}
        {fullscreenView && (
          <div className="fixed inset-0 z-50 bg-black/96 flex flex-col items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="max-w-4xl w-full bg-neutral-900 border-2 border-emerald-500 rounded-3xl p-4 sm:p-6 text-white relative my-auto max-h-[94vh] overflow-y-auto">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-black uppercase">
                    {isEn ? `OFFICIAL TRAFFIC INSPECTION • PLATE ${vehicleRegistration.plate}` : `INSPECCIÓN OFICIAL DE TRÁNSITO • PLACA ${vehicleRegistration.plate}`}
                  </span>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    ⚡ {isEn ? 'Offline Vault Active (0% Signal Ready)' : 'Bóveda Offline 0% Señal Activa'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Botón de Bloqueo Táctil Anti-Curiosos para entregar el celular al agente */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!isPinLocked) {
                        setIsPinLocked(true);
                        setShowPinPrompt(false);
                        setPinError('');
                      } else {
                        setShowPinPrompt(true);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border flex items-center gap-1.5 transition ${
                      isPinLocked
                        ? 'bg-red-600 text-white border-red-400 shadow-lg shadow-red-600/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                    }`}
                    title="Bloquea la salida para que el agente solo pueda ver los 4 documentos sin tocar tu celular"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>
                      {isPinLocked
                        ? (isEn ? '🔒 Screen Locked (Tap to Unlock PIN)' : '🔒 Modo Agente Bloqueado (Desbloquear PIN)')
                        : (isEn ? 'Lock Screen for Officer (PIN)' : 'Bloquear Pantalla para Agente (Con tu PIN)')}
                    </span>
                  </button>

                  {!isPinLocked && (
                    <button
                      onClick={() => setFullscreenView(null)}
                      className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Mini Modal de Desbloqueo con PIN Personalizado */}
              {isPinLocked && showPinPrompt && (
                <div className="my-2 p-3.5 rounded-2xl bg-neutral-950 border-2 border-red-500/60 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-mono text-red-300">
                    🔐 {isEn ? 'Enter your 4-digit security PIN to exit Officer Mode:' : 'Ingresa tu PIN de seguridad de 4 dígitos para salir del Modo Agente:'}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                      placeholder="••••"
                      className="w-24 bg-neutral-900 border border-red-500/50 rounded-xl px-3 py-1.5 text-center font-mono text-sm text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (pinInput === savedPin) {
                          setIsPinLocked(false);
                          setShowPinPrompt(false);
                          setPinInput('');
                          setPinError('');
                        } else {
                          setPinError(isEn ? 'Invalid PIN' : 'PIN incorrecto');
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-black font-racing font-bold text-xs uppercase"
                    >
                      {isEn ? 'Unlock' : 'Desbloquear'}
                    </button>
                    {pinError && <span className="text-xs font-mono text-red-400">{pinError}</span>}
                  </div>
                </div>
              )}

              {/* Selector rápido entre las 6 fotos o vista completa */}
              <div className="flex gap-1.5 overflow-x-auto py-3 mt-2 border-b border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    resetZoomAndPan();
                    setFullscreenView({ mode: 'all_checkpoint' });
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap border ${
                    fullscreenView.mode === 'all_checkpoint'
                      ? 'bg-emerald-500 text-black font-bold border-emerald-400'
                      : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                  }`}
                >
                  {isEn ? '📋 View All Together' : '📋 Ver Todos Juntos'}
                </button>
                {checkpointPhotoCards.map((c) => (
                  <button
                    key={c.slot}
                    type="button"
                    onClick={() => {
                      resetZoomAndPan();
                      setFullscreenView({ mode: 'single', card: c });
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap border ${
                      fullscreenView.card?.slot === c.slot
                        ? 'bg-amber-500 text-black font-bold border-amber-400'
                        : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                    }`}
                  >
                    {c.stepNumber} {c.shortLabel}
                  </button>
                ))}
              </div>

              {fullscreenView.mode === 'all_checkpoint' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {checkpointPhotoCards.map((c) => (
                    <div
                      key={c.slot}
                      onClick={() => {
                        resetZoomAndPan();
                        setFullscreenView({ mode: 'single', card: c });
                      }}
                      className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-amber-400 cursor-pointer group transition"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-racing font-bold uppercase text-amber-400">
                          DOC {c.stepNumber} • {c.shortLabel}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <ZoomIn className="w-3 h-3" />
                          <span>{isEn ? 'Tap to Zoom' : 'Tocar para Hacer Zoom'}</span>
                        </span>
                      </div>
                      {c.imageUrl ? (
                        <img
                          src={c.imageUrl}
                          alt={c.shortLabel}
                          className="w-full h-48 object-contain rounded-xl bg-black"
                        />
                      ) : (
                        <div className="space-y-1.5 font-mono text-xs p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                          {c.fields.map((f) => (
                            <div key={f.label} className="flex justify-between gap-2">
                              <span className="text-neutral-400">{f.label}:</span>
                              <span className={f.highlight}>{f.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-lg sm:text-xl font-black font-racing uppercase text-white">
                        {fullscreenView.card?.fullLabel}
                      </h3>
                      <p className="text-xs font-mono text-neutral-400">
                        {fullscreenView.card?.sideBadge} • Vehículo: {identity.brand} {identity.model} ({vehicleRegistration.plate})
                      </p>
                    </div>

                    {/* BARRA DE LUPA, ZOOM Y ROTACIÓN PARA EL AGENTE DE TRÁNSITO */}
                    <div className="flex flex-wrap items-center gap-1.5 bg-neutral-950 p-1.5 rounded-2xl border border-emerald-500/40">
                      <button
                        type="button"
                        onClick={() => {
                          const next = Math.max(1, Number((zoomScale - 0.5).toFixed(1)));
                          setZoomScale(next);
                          if (next === 1) setPanOffset({ x: 0, y: 0 });
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-mono font-bold text-white flex items-center gap-1"
                        title="Alejar documento"
                      >
                        <ZoomOut className="w-3.5 h-3.5 text-amber-400" />
                        <span>-</span>
                      </button>

                      {[1, 1.5, 2, 3, 4].map((scaleVal) => (
                        <button
                          key={scaleVal}
                          type="button"
                          onClick={() => {
                            setZoomScale(scaleVal);
                            if (scaleVal === 1) setPanOffset({ x: 0, y: 0 });
                          }}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition ${
                            zoomScale === scaleVal
                              ? 'bg-emerald-500 text-black border-emerald-400 shadow'
                              : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white'
                          }`}
                        >
                          {scaleVal}x
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() => setZoomScale((prev) => Math.min(4, Number((prev + 0.5).toFixed(1))))}
                        className="px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-mono font-bold text-white flex items-center gap-1"
                        title="Acercar documento (Lupa)"
                      >
                        <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />
                        <span>+</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRotationDeg((prev) => (prev + 90) % 360)}
                        className="px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-mono font-bold text-cyan-300 flex items-center gap-1"
                        title="Girar documento 90°"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>90°</span>
                      </button>

                      {(zoomScale > 1 || rotationDeg !== 0 || panOffset.x !== 0 || panOffset.y !== 0) && (
                        <button
                          type="button"
                          onClick={resetZoomAndPan}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-mono font-bold text-amber-300"
                        >
                          100%
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Instrucción de gesto táctil cuando tiene zoom */}
                  <div className="mb-2 flex items-center justify-between text-[11px] font-mono text-emerald-300 bg-emerald-950/30 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                    <span className="flex items-center gap-1.5">
                      <Move className="w-3.5 h-3.5 text-emerald-400" />
                      {zoomScale > 1
                        ? (isEn
                            ? `Zoom active (${Math.round(zoomScale * 100)}%) • Drag with your finger or mouse to inspect any corner`
                            : `Lupa activa (${Math.round(zoomScale * 100)}%) • Arrastra con el dedo o mouse para mover el documento`)
                        : (isEn
                            ? 'Double-tap the document or use the 1.5x / 2x / 3x / 4x buttons above to zoom in'
                            : 'Toca dos veces el documento o usa los botones 1.5x / 2x / 3x / 4x arriba para hacer zoom')}
                    </span>
                    <span className="text-amber-300 font-bold">
                      {Math.round(zoomScale * 100)}%
                    </span>
                  </div>

                  {/* Contenedor Interactivo con Zoom, Rotación y Arrastre (Pan) */}
                  <div
                    onWheel={(e) => {
                      e.preventDefault();
                      const delta = e.deltaY < 0 ? 0.25 : -0.25;
                      const next = Math.max(1, Math.min(4, Number((zoomScale + delta).toFixed(2))));
                      setZoomScale(next);
                      if (next === 1) setPanOffset({ x: 0, y: 0 });
                    }}
                    onDoubleClick={() => {
                      if (zoomScale > 1) {
                        resetZoomAndPan();
                      } else {
                        setZoomScale(2.5);
                      }
                    }}
                    onPointerDown={(e) => {
                      if (zoomScale <= 1) return;
                      setIsDraggingDoc(true);
                      dragStartRef.current = {
                        x: e.clientX - panOffset.x,
                        y: e.clientY - panOffset.y
                      };
                    }}
                    onPointerMove={(e) => {
                      if (!isDraggingDoc || zoomScale <= 1) return;
                      setPanOffset({
                        x: e.clientX - dragStartRef.current.x,
                        y: e.clientY - dragStartRef.current.y
                      });
                    }}
                    onPointerUp={() => setIsDraggingDoc(false)}
                    onPointerLeave={() => setIsDraggingDoc(false)}
                    style={{ touchAction: zoomScale > 1 ? 'none' : 'pan-y' }}
                    className={`rounded-2xl overflow-hidden border-2 border-neutral-700 min-h-[340px] max-h-[64vh] flex items-center justify-center bg-black relative select-none ${
                      zoomScale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
                    }`}
                  >
                    <div
                      style={{
                        transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale}) rotate(${rotationDeg}deg)`,
                        transformOrigin: 'center center',
                        transition: isDraggingDoc ? 'none' : 'transform 0.18s ease-out'
                      }}
                      className="w-full flex items-center justify-center p-2"
                    >
                      {fullscreenView.card?.imageUrl ? (
                        <img
                          src={fullscreenView.card.imageUrl}
                          alt={fullscreenView.card.shortLabel}
                          draggable={false}
                          className="max-h-[60vh] w-auto object-contain pointer-events-none"
                        />
                      ) : (
                        <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5 font-mono text-sm w-full max-w-xl">
                          {fullscreenView.card?.fields.map((f) => (
                            <div key={f.label} className="flex justify-between border-b border-neutral-800 pb-2 gap-4">
                              <span className="text-neutral-400">{f.label}:</span>
                              <span className={f.highlight}>{f.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!isPinLocked && (
                <button
                  type="button"
                  onClick={() => setFullscreenView(null)}
                  className="mt-5 w-full py-3 rounded-xl bg-emerald-500 text-black font-racing font-bold uppercase text-xs"
                >
                  {isEn ? 'Back to Digital Glovebox' : 'Volver a la Guantera Digital'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
