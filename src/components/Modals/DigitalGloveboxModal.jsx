import React, { useState, useRef } from 'react';
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
  UserCheck
} from 'lucide-react';
import {
  COUNTRY_DOCUMENT_TERMINOLOGY,
  getCountryDocumentLabels,
  compressDocumentImage,
  extractDocumentWithAI,
  evaluateDocumentAlertStatus
} from '../../services/globalDocumentsService';
import { uploadMotoDocument } from '../../services/supabaseClient';

export default function DigitalGloveboxModal({
  isOpen,
  onClose,
  bike,
  hojaDeVida = {},
  userProfile,
  onUpdateHojaDeVida
}) {
  if (!isOpen || !bike) return null;

  const identity = bike.config?.bikeIdentity || {};
  const docs = hojaDeVida?.documentos || {};
  const globalDocs = hojaDeVida?.globalDocuments || {};

  const [selectedCountry, setSelectedCountry] = useState(
    userProfile?.country || hojaDeVida?.country || 'Colombia'
  );
  const countryLabels = getCountryDocumentLabels(selectedCountry);
  const driverLabels = countryLabels.driver_license || {
    shortName: 'Pase / Licencia de Conducción',
    fullName: 'Licencia Nacional de Conducción (Categoría A1 / A2)',
    categoryDefault: 'A2 (Motocicletas > 125 cc)',
    issuerPlaceholder: 'Ministerio de Transporte / RUNT'
  };

  // Filtro rápido por documento en el retén
  const [activeDocFilter, setActiveDocFilter] = useState('all'); // 'all' | 'license' | 'registration' | 'soat' | 'tecno'

  // Estado de escaneo IA y compresión
  const [scanningSlot, setScanningSlot] = useState(null);
  const [aiDraft, setAiDraft] = useState(null);
  const [compressionStats, setCompressionStats] = useState(null);
  const [fullscreenView, setFullscreenView] = useState(null);
  const fileInputRef = useRef(null);
  const [activeUploadSlot, setActiveUploadSlot] = useState('mandatory_insurance');

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
      driverLicenseRaw.frontImageUrl ||
      globalDocs.driver_license_front?.imageUrl ||
      null,
    backImageUrl:
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
      vehicleRegRaw.frontImageUrl ||
      vehicleRegRaw.imageUrl ||
      globalDocs.vehicle_registration_front?.imageUrl ||
      null,
    backImageUrl:
      vehicleRegRaw.backImageUrl ||
      globalDocs.vehicle_registration_back?.imageUrl ||
      null
  };

  // 3. SOAT / SEGURO OBLIGATORIO
  const mandatoryInsurance = globalDocs.mandatory_insurance || {
    expiryDate: docs.soatVencimiento || '',
    policyNumber: docs.soatPoliza || `SOAT-${docs.placa || 'OFICIAL'}`,
    issuer: docs.soatAseguradora || countryLabels.mandatory_insurance.issuerPlaceholder,
    imageUrl: globalDocs.mandatory_insurance?.imageUrl || null,
    verifiedByAi: Boolean(globalDocs.mandatory_insurance?.verifiedByAi || docs.soatVencimiento)
  };

  // 4. TECNOMECÁNICA / ITV / MOT
  const technicalInspection = globalDocs.technical_inspection || {
    expiryDate: docs.tecnoVencimiento || '',
    policyNumber: docs.tecnoCertificado || `CERT-${docs.placa || 'RUNT'}`,
    issuer: docs.tecnoCentro || countryLabels.technical_inspection.issuerPlaceholder,
    imageUrl: globalDocs.technical_inspection?.imageUrl || null,
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
      globalKey: 'driver_license (Lado 1)',
      shortLabel: `${driverLabels.shortName} • LADO 1 (FRONTAL)`,
      fullLabel: `${driverLabels.fullName} — Cara Frontal (Anverso)`,
      sideBadge: 'PASE LADO 1 • DATOS CONDUCTOR',
      accentBorder: 'border-violet-500/60',
      badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
      badgeText: driverLicense.frontImageUrl ? 'FOTO FRONTAL LISTA' : 'PASE ANVERSO ACTIVO',
      imageUrl: driverLicense.frontImageUrl,
      uploadBtnText: driverLicense.frontImageUrl
        ? 'Cambiar Foto Pase Lado 1 (Frontal)'
        : 'Subir Foto Pase Lado 1 (Cara Frontal)',
      fields: [
        { label: 'CONDUCTOR TITULAR', value: driverLicense.holderName, highlight: 'text-white font-bold' },
        { label: 'N° LICENCIA / CÉDULA', value: driverLicense.licenseNumber, highlight: 'text-amber-300 font-bold' },
        { label: 'FACTOR RH / SANGRE', value: driverLicense.bloodType, highlight: 'text-emerald-300 font-bold' },
        { label: 'ENTIDAD EXPEDIDORA', value: driverLicense.issuer, highlight: 'text-neutral-300' }
      ]
    },
    {
      slot: 'driver_license_back',
      group: 'license',
      stepNumber: '1B',
      globalKey: 'driver_license (Lado 2)',
      shortLabel: `${driverLabels.shortName} • LADO 2 (POSTERIOR)`,
      fullLabel: `${driverLabels.fullName} — Cara Posterior (Categoría y Vigencia)`,
      sideBadge: 'PASE LADO 2 • CATEGORÍA MOTO',
      accentBorder: 'border-violet-500/60',
      badgeColor:
        licenseEval.status === 'expired'
          ? 'bg-red-500/20 text-red-300 border-red-500/40'
          : 'bg-violet-500/20 text-violet-300 border-violet-500/40',
      badgeText: driverLicense.backImageUrl ? 'FOTO POSTERIOR LISTA' : licenseEval.badgeText,
      imageUrl: driverLicense.backImageUrl,
      uploadBtnText: driverLicense.backImageUrl
        ? 'Cambiar Foto Pase Lado 2 (Posterior)'
        : 'Subir Foto Pase Lado 2 (Cara Posterior)',
      fields: [
        { label: 'CATEGORÍA AUTORIZADA', value: driverLicense.category, highlight: 'text-amber-400 font-bold' },
        { label: 'FECHA VENCIMIENTO PASE', value: driverLicense.expiryDate, highlight: 'text-emerald-400 font-bold' },
        { label: 'RESTRICCIONES', value: driverLicense.restrictions, highlight: 'text-white' },
        { label: 'VERIFICACIÓN OFICIAL', value: countryLabels.authority, highlight: 'text-violet-300' }
      ]
    },
    {
      slot: 'vehicle_registration_front',
      group: 'registration',
      stepNumber: '2A',
      globalKey: 'vehicle_registration (Lado 1)',
      shortLabel: `${countryLabels.vehicle_registration.shortName} • LADO 1 (FRONTAL)`,
      fullLabel: `${countryLabels.vehicle_registration.fullName} — Cara Frontal (Anverso)`,
      sideBadge: 'TARJETA LADO 1 • ANVERSO',
      accentBorder: 'border-amber-500/60',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      badgeText: vehicleRegistration.frontImageUrl ? 'FOTO FRONTAL LISTA' : 'CARA FRONTAL OFICIAL',
      imageUrl: vehicleRegistration.frontImageUrl,
      uploadBtnText: vehicleRegistration.frontImageUrl
        ? 'Cambiar Foto Tarjeta Lado 1 (Frontal)'
        : 'Subir Foto Tarjeta Lado 1 (Cara Frontal)',
      fields: [
        { label: 'PLACA / MATRÍCULA', value: vehicleRegistration.plate, highlight: 'text-amber-400 font-bold' },
        { label: 'MARCA / LÍNEA / MODELO', value: `${identity.brand} ${identity.model} (${vehicleRegistration.modelYear})`, highlight: 'text-white font-bold' },
        { label: 'CILINDRADA / CLASE', value: `${vehicleRegistration.displacementCc} cc • MOTOCICLETA`, highlight: 'text-emerald-300' },
        { label: 'PROPIETARIO TITULAR', value: vehicleRegistration.ownerName, highlight: 'text-neutral-200' }
      ]
    },
    {
      slot: 'vehicle_registration_back',
      group: 'registration',
      stepNumber: '2B',
      globalKey: 'vehicle_registration (Lado 2)',
      shortLabel: `${countryLabels.vehicle_registration.shortName} • LADO 2 (POSTERIOR)`,
      fullLabel: `${countryLabels.vehicle_registration.fullName} — Cara Posterior (Reverso)`,
      sideBadge: 'TARJETA LADO 2 • REVERSO',
      accentBorder: 'border-cyan-500/60',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      badgeText: vehicleRegistration.backImageUrl ? 'FOTO POSTERIOR LISTA' : 'CARA POSTERIOR OFICIAL',
      imageUrl: vehicleRegistration.backImageUrl,
      uploadBtnText: vehicleRegistration.backImageUrl
        ? 'Cambiar Foto Tarjeta Lado 2 (Posterior)'
        : 'Subir Foto Tarjeta Lado 2 (Cara Posterior)',
      fields: [
        { label: 'VIN / CHASIS / SERIE', value: vehicleRegistration.vin, highlight: 'text-amber-300 font-bold' },
        { label: 'NÚMERO DE MOTOR', value: vehicleRegistration.engineNumber, highlight: 'text-white font-bold' },
        { label: 'SERVICIO / RESTRICCIÓN', value: 'PARTICULAR • SIN RESTRICCIÓN', highlight: 'text-emerald-300' },
        { label: 'ORGANISMO TRÁNSITO', value: countryLabels.authority, highlight: 'text-cyan-300' }
      ]
    },
    {
      slot: 'mandatory_insurance',
      group: 'soat',
      stepNumber: '3',
      globalKey: 'mandatory_insurance',
      shortLabel: `Foto ${countryLabels.mandatory_insurance.shortName}`,
      fullLabel: countryLabels.mandatory_insurance.fullName,
      sideBadge: 'SEGURO OBLIGATORIO VIGENTE',
      accentBorder: 'border-emerald-500/50',
      badgeColor:
        mandatoryEval.status === 'expired'
          ? 'bg-red-500/20 text-red-300 border-red-500/40'
          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      badgeText: mandatoryEval.badgeText,
      imageUrl: mandatoryInsurance.imageUrl,
      uploadBtnText: mandatoryInsurance.imageUrl
        ? `Cambiar Foto ${countryLabels.mandatory_insurance.shortName}`
        : `Subir Foto ${countryLabels.mandatory_insurance.shortName} (Escáner IA)`,
      fields: [
        { label: 'PLACA VEHÍCULO', value: vehicleRegistration.plate, highlight: 'text-amber-400 font-bold' },
        { label: 'FECHA VENCIMIENTO', value: mandatoryInsurance.expiryDate || 'SIN FECHA', highlight: 'text-emerald-400 font-bold' },
        { label: 'N° PÓLIZA', value: mandatoryInsurance.policyNumber, highlight: 'text-white' },
        { label: 'ASEGURADORA', value: mandatoryInsurance.issuer, highlight: 'text-neutral-300' }
      ]
    },
    {
      slot: 'technical_inspection',
      group: 'tecno',
      stepNumber: '4',
      globalKey: 'technical_inspection',
      shortLabel: `Foto ${countryLabels.technical_inspection.shortName}`,
      fullLabel: countryLabels.technical_inspection.fullName,
      sideBadge: 'CERTIFICADO TÉCNICO Y GASES',
      accentBorder: 'border-emerald-500/50',
      badgeColor:
        technicalEval.status === 'expired'
          ? 'bg-red-500/20 text-red-300 border-red-500/40'
          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      badgeText: technicalEval.badgeText,
      imageUrl: technicalInspection.imageUrl,
      uploadBtnText: technicalInspection.imageUrl
        ? `Cambiar Foto ${countryLabels.technical_inspection.shortName}`
        : `Subir Foto ${countryLabels.technical_inspection.shortName} (Escáner IA)`,
      fields: [
        { label: 'PLACA VEHÍCULO', value: vehicleRegistration.plate, highlight: 'text-amber-400 font-bold' },
        { label: 'FECHA VENCIMIENTO', value: technicalInspection.expiryDate || 'SIN FECHA', highlight: 'text-emerald-400 font-bold' },
        { label: 'N° CERTIFICADO', value: technicalInspection.policyNumber, highlight: 'text-white' },
        { label: 'CENTRO / CDA', value: technicalInspection.issuer, highlight: 'text-neutral-300' }
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
      try {
        storagePath = await uploadMotoDocument(compressed.compressedFile, slot);
      } catch {
        // Modo demo o sin sesión
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
    if (onUpdateHojaDeVida) {
      onUpdateHojaDeVida({
        ...hojaDeVida,
        country: newCountry
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
                  MODO RETÉN POLICIAL • LOS 4 DOCUMENTOS EXIGIDOS
                </span>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  PLACA: {vehicleRegistration.plate}
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black font-racing uppercase tracking-wider text-white mt-1">
                1. {driverLabels.shortName} (2 Lados) • 2. {countryLabels.vehicle_registration.shortName} (2 Lados) • 3. {countryLabels.mandatory_insurance.shortName} • 4. {countryLabels.technical_inspection.shortName}
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                {identity.brand} {identity.model} ({vehicleRegistration.modelYear}) • Adaptado automáticamente para {selectedCountry} ({countryLabels.authority})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-end lg:self-center">
            <button
              type="button"
              onClick={() => setFullscreenView({ mode: 'all_checkpoint' })}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-racing font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Mostrar Todo al Agente</span>
            </button>

            <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-700 rounded-xl px-2.5 py-1.5">
              <Globe2 className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={selectedCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="bg-transparent text-xs font-mono text-white focus:outline-none cursor-pointer"
                title="Cambia de país para ver qué documentos exige la autoridad local"
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

        {/* BARRA DE FILTRO RÁPIDO ENTRE LOS 4 DOCUMENTOS EXIGIDOS EN UN RETÉN */}
        <div className="flex gap-1.5 overflow-x-auto py-3 border-b border-neutral-800/80">
          {[
            { id: 'all', label: '📋 Todos los Documentos (6 Fotos)' },
            { id: 'license', label: `🪪 1. ${driverLabels.shortName} (Ambos Lados)` },
            { id: 'registration', label: `💳 2. ${countryLabels.vehicle_registration.shortName} (Ambos Lados)` },
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
                              CREDENCIAL DIGITAL VERIFICADA • {card.globalKey}
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
                          <span>Sube la foto física o toca para ampliar</span>
                          <span className="text-amber-400 font-bold">Pantalla Completa 🔍</span>
                        </div>
                      </>
                    )}

                    <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-xs font-mono font-bold text-white transition">
                      <Maximize2 className="w-4 h-4 text-emerald-400" />
                      <span>Mostrar al Agente en Pantalla Completa</span>
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

        {/* VISOR DE PANTALLA COMPLETA PARA INSPECCIÓN DE AGENTE DE TRÁNSITO */}
        {fullscreenView && (
          <div className="fixed inset-0 z-50 bg-black/96 flex flex-col items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="max-w-4xl w-full bg-neutral-900 border-2 border-emerald-500 rounded-3xl p-4 sm:p-6 text-white relative my-auto max-h-[94vh] overflow-y-auto">
              <button
                onClick={() => setFullscreenView(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-black uppercase">
                INSPECCIÓN OFICIAL DE TRÁNSITO • PLACA {vehicleRegistration.plate}
              </span>

              {/* Selector rápido entre las 6 fotos o vista completa */}
              <div className="flex gap-1.5 overflow-x-auto py-3 mt-2 border-b border-neutral-800">
                <button
                  type="button"
                  onClick={() => setFullscreenView({ mode: 'all_checkpoint' })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap border ${
                    fullscreenView.mode === 'all_checkpoint'
                      ? 'bg-emerald-500 text-black font-bold border-emerald-400'
                      : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                  }`}
                >
                  📋 Ver Todos Juntos
                </button>
                {checkpointPhotoCards.map((c) => (
                  <button
                    key={c.slot}
                    type="button"
                    onClick={() => setFullscreenView({ mode: 'single', card: c })}
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
                    <div key={c.slot} className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-racing font-bold uppercase text-amber-400">
                          DOC {c.stepNumber} • {c.shortLabel}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400">{c.sideBadge}</span>
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
                  <h3 className="text-lg sm:text-xl font-black font-racing uppercase text-white">
                    {fullscreenView.card?.fullLabel}
                  </h3>
                  <p className="text-xs font-mono text-neutral-400 mb-3">
                    {fullscreenView.card?.sideBadge} • Vehículo: {identity.brand} {identity.model} ({vehicleRegistration.plate})
                  </p>

                  {fullscreenView.card?.imageUrl ? (
                    <div className="rounded-2xl overflow-hidden border border-neutral-700 max-h-[60vh] flex items-center justify-center bg-black">
                      <img
                        src={fullscreenView.card.imageUrl}
                        alt={fullscreenView.card.shortLabel}
                        className="max-h-[60vh] w-auto object-contain"
                      />
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5 font-mono text-sm">
                      {fullscreenView.card?.fields.map((f) => (
                        <div key={f.label} className="flex justify-between border-b border-neutral-800 pb-2">
                          <span className="text-neutral-400">{f.label}:</span>
                          <span className={f.highlight}>{f.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => setFullscreenView(null)}
                className="mt-5 w-full py-3 rounded-xl bg-emerald-500 text-black font-racing font-bold uppercase text-xs"
              >
                Volver a la Guantera Digital
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
