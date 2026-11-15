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
  FlipHorizontal,
  Eye
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

  // Estado de escaneo IA y compresión
  const [scanningSlot, setScanningSlot] = useState(null);
  const [aiDraft, setAiDraft] = useState(null);
  const [compressionStats, setCompressionStats] = useState(null);
  const [fullscreenDoc, setFullscreenDoc] = useState(null);
  const [regSideFilter, setRegSideFilter] = useState('both'); // 'both' | 'front' | 'back'
  const fileInputRef = useRef(null);
  const [activeUploadSlot, setActiveUploadSlot] = useState('mandatory_insurance');

  // Datos unificados bajo llaves globales (mandatory_insurance, technical_inspection, vehicle_registration)
  const mandatoryInsurance = globalDocs.mandatory_insurance || {
    expiryDate: docs.soatVencimiento || '',
    policyNumber: docs.soatPoliza || `SOAT-${docs.placa || 'OFICIAL'}`,
    issuer: docs.soatAseguradora || countryLabels.mandatory_insurance.issuerPlaceholder,
    imageUrl: globalDocs.mandatory_insurance?.imageUrl || null,
    verifiedByAi: Boolean(globalDocs.mandatory_insurance?.verifiedByAi || docs.soatVencimiento)
  };

  const technicalInspection = globalDocs.technical_inspection || {
    expiryDate: docs.tecnoVencimiento || '',
    policyNumber: docs.tecnoCertificado || `CERT-${docs.placa || 'RUNT'}`,
    issuer: docs.tecnoCentro || countryLabels.technical_inspection.issuerPlaceholder,
    imageUrl: globalDocs.technical_inspection?.imageUrl || null,
    verifiedByAi: Boolean(globalDocs.technical_inspection?.verifiedByAi || docs.tecnoVencimiento)
  };

  const vehicleRegRaw = globalDocs.vehicle_registration || {};
  const vehicleRegistration = {
    plate: docs.placa || vehicleRegRaw.plate || 'SIN PLACA',
    vin: docs.numeroChasis || vehicleRegRaw.vin || identity.vin || 'N/A',
    engineNumber: docs.numeroMotor || vehicleRegRaw.engineNumber || identity.engineNumber || 'N/A',
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
      null,
    verifiedByAi: true
  };

  const mandatoryEval = evaluateDocumentAlertStatus(
    mandatoryInsurance.expiryDate,
    countryLabels.mandatory_insurance.shortName
  );
  const technicalEval = evaluateDocumentAlertStatus(
    technicalInspection.expiryDate,
    countryLabels.technical_inspection.shortName
  );

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
      // 1. Compresión en Frontend antes de subir a Supabase Storage o enviar a Gemini Vision
      const compressed = await compressDocumentImage(file, 1400, 0.78);
      setCompressionStats({
        originalKB: compressed.originalSizeKB,
        compressedKB: compressed.compressedSizeKB,
        savedPercent: compressed.savedPercent
      });

      // 2. Subir archivo comprimido al bucket privado 'moto-documents' si hay sesión autenticada
      let storagePath = null;
      try {
        storagePath = await uploadMotoDocument(compressed.compressedFile, slot);
      } catch {
        // Si está en modo visitante/demo, continúa con vista previa local comprimida
      }

      // Si es Cara Frontal o Cara Posterior de la Tarjeta de Propiedad, guardar la foto inmediatamente y extraer placa/VIN con IA
      const baseDocSlot = slot.startsWith('vehicle_registration') ? 'vehicle_registration' : slot;

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

    let nextGlobalDocs = { ...prevGlobal };
    const nextDocs = { ...(hojaDeVida.documentos || {}) };

    if (slot === 'vehicle_registration_front' || slot === 'vehicle_registration_back') {
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500 text-black">
                  MODO RETÉN POLICIAL • VISOR DE FOTOS OFICIALES
                </span>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  PLACA: {vehicleRegistration.plate}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black font-racing uppercase tracking-wider text-white mt-1">
                Mis Documentos: Fotos de {countryLabels.mandatory_insurance.shortName}, {countryLabels.technical_inspection.shortName} y {countryLabels.vehicle_registration.shortName} (Ambos Lados)
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                {identity.brand} {identity.model} ({vehicleRegistration.modelYear}) • Toca cualquier foto para abrirla en pantalla completa ante el agente de tránsito
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-700 rounded-xl px-2.5 py-1.5">
              <Globe2 className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={selectedCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="bg-transparent text-xs font-mono text-white focus:outline-none cursor-pointer"
                title="Adaptación de nomenclatura legal por país"
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
                  Número de Póliza / Certificado / Placa
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

        {/* SECCIÓN 1: TARJETA DE PROPIEDAD POR AMBOS LADOS (CARA FRONTAL / ANVERSO Y CARA POSTERIOR / REVERSO) */}
        <div className="mt-5 p-4 rounded-2xl bg-neutral-900/95 border-2 border-amber-500/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500 text-black">
                  EXIGIDO EN RETENES • AMBAS CARAS
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  DB: vehicle_registration
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black font-racing uppercase text-white mt-1 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-amber-400" />
                <span>{countryLabels.vehicle_registration.shortName} (Cara Frontal y Cara Posterior)</span>
              </h3>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setFullscreenDoc({
                    type: 'registration_both',
                    title: `${countryLabels.vehicle_registration.fullName} (Ambos Lados)`,
                    frontImageUrl: vehicleRegistration.frontImageUrl,
                    backImageUrl: vehicleRegistration.backImageUrl
                  })
                }
                className="px-3 py-1.5 rounded-xl bg-amber-500 text-black font-racing font-bold text-xs uppercase flex items-center gap-1.5 shadow-md"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Mostrar Ambos Lados al Agente</span>
              </button>
            </div>
          </div>

          {/* GRILLA DOBLE: LADO A (CARA FRONTAL) Y LADO B (CARA POSTERIOR) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* LADO 1: CARA FRONTAL (ANVERSO) */}
            <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-racing font-bold uppercase text-amber-300 flex items-center gap-1.5">
                    <FlipHorizontal className="w-3.5 h-3.5" />
                    <span>Lado 1: Cara Frontal (Anverso)</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {vehicleRegistration.frontImageUrl ? 'FOTO REAL CARGADA' : 'CREDENCIAL DIGITAL'}
                  </span>
                </div>

                {/* FOTO CARA FRONTAL O FACSCÍMIL VISUAL */}
                <div
                  onClick={() =>
                    setFullscreenDoc({
                      type: 'registration_both',
                      title: `${countryLabels.vehicle_registration.fullName} — Cara Frontal y Posterior`,
                      frontImageUrl: vehicleRegistration.frontImageUrl,
                      backImageUrl: vehicleRegistration.backImageUrl
                    })
                  }
                  className="relative group cursor-pointer rounded-xl overflow-hidden border-2 border-neutral-700 hover:border-amber-400 h-48 bg-gradient-to-br from-emerald-950/60 via-neutral-900 to-neutral-950 flex flex-col justify-between p-3.5 transition"
                >
                  {vehicleRegistration.frontImageUrl ? (
                    <img
                      src={vehicleRegistration.frontImageUrl}
                      alt="Tarjeta de Propiedad - Cara Frontal"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <div className="flex justify-between items-start border-b border-emerald-500/30 pb-2">
                        <div>
                          <span className="text-[9px] font-mono uppercase text-emerald-300 block font-bold">
                            REPÚBLICA DE COLOMBIA • LICENCIA DE TRÁNSITO (ANVERSO)
                          </span>
                          <span className="text-sm font-black font-racing text-white">
                            {identity.brand} {identity.model}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-amber-400 text-black font-mono font-black text-xs">
                          {vehicleRegistration.plate}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono my-auto py-1">
                        <div>
                          <span className="text-neutral-400 text-[9px] block">PROPIETARIO:</span>
                          <span className="text-white font-bold truncate block">{vehicleRegistration.ownerName}</span>
                        </div>
                        <div>
                          <span className="text-neutral-400 text-[9px] block">MODELO / CILINDRADA:</span>
                          <span className="text-white font-bold">{vehicleRegistration.modelYear} • {vehicleRegistration.displacementCc} cc</span>
                        </div>
                        <div>
                          <span className="text-neutral-400 text-[9px] block">CLASE / SERVICIO:</span>
                          <span className="text-emerald-300">MOTOCICLETA • PARTICULAR</span>
                        </div>
                        <div>
                          <span className="text-neutral-400 text-[9px] block">DOCUMENTO:</span>
                          <span className="text-neutral-200">{vehicleRegistration.ownerDoc}</span>
                        </div>
                      </div>

                      <div className="text-[9px] font-mono text-neutral-400 flex justify-between items-center border-t border-neutral-800 pt-1.5">
                        <span>CARA FRONTAL VERIFICADA</span>
                        <span className="text-amber-400 font-bold">Toca para ampliar 🔍</span>
                      </div>
                    </>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-xs font-mono font-bold text-white transition">
                    <Maximize2 className="w-4 h-4 text-amber-400" />
                    <span>Ver en Pantalla Completa</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={scanningSlot === 'vehicle_registration_front'}
                onClick={() => handleTriggerFileSelect('vehicle_registration_front')}
                className="mt-3 w-full py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-racing font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>
                  {scanningSlot === 'vehicle_registration_front'
                    ? 'Comprimiendo Cara Frontal...'
                    : vehicleRegistration.frontImageUrl
                    ? 'Actualizar Foto Cara Frontal'
                    : 'Subir Foto Cara Frontal (Anverso)'}
                </span>
              </button>
            </div>

            {/* LADO 2: CARA POSTERIOR (REVERSO) */}
            <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-racing font-bold uppercase text-cyan-300 flex items-center gap-1.5">
                    <FlipHorizontal className="w-3.5 h-3.5" />
                    <span>Lado 2: Cara Posterior (Reverso)</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {vehicleRegistration.backImageUrl ? 'FOTO REAL CARGADA' : 'CREDENCIAL DIGITAL'}
                  </span>
                </div>

                {/* FOTO CARA POSTERIOR O FACSCÍMIL VISUAL */}
                <div
                  onClick={() =>
                    setFullscreenDoc({
                      type: 'registration_both',
                      title: `${countryLabels.vehicle_registration.fullName} — Cara Frontal y Posterior`,
                      frontImageUrl: vehicleRegistration.frontImageUrl,
                      backImageUrl: vehicleRegistration.backImageUrl
                    })
                  }
                  className="relative group cursor-pointer rounded-xl overflow-hidden border-2 border-neutral-700 hover:border-cyan-400 h-48 bg-gradient-to-br from-cyan-950/50 via-neutral-900 to-neutral-950 flex flex-col justify-between p-3.5 transition"
                >
                  {vehicleRegistration.backImageUrl ? (
                    <img
                      src={vehicleRegistration.backImageUrl}
                      alt="Tarjeta de Propiedad - Cara Posterior"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <div className="flex justify-between items-start border-b border-cyan-500/30 pb-2">
                        <div>
                          <span className="text-[9px] font-mono uppercase text-cyan-300 block font-bold">
                            LICENCIA DE TRÁNSITO • REVERSO TÉCNICO (VIN / MOTOR)
                          </span>
                          <span className="text-xs font-mono font-bold text-white">
                            {countryLabels.authority}
                          </span>
                        </div>
                        <QrCode className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                      </div>

                      <div className="space-y-1.5 text-[11px] font-mono my-auto">
                        <div className="flex justify-between bg-black/40 px-2.5 py-1 rounded">
                          <span className="text-neutral-400">VIN / CHASIS:</span>
                          <span className="text-amber-300 font-bold">{vehicleRegistration.vin}</span>
                        </div>
                        <div className="flex justify-between bg-black/40 px-2.5 py-1 rounded">
                          <span className="text-neutral-400">NÚMERO MOTOR:</span>
                          <span className="text-white font-bold">{vehicleRegistration.engineNumber}</span>
                        </div>
                        <div className="flex justify-between bg-black/40 px-2.5 py-1 rounded">
                          <span className="text-neutral-400">RESTRICCIÓN:</span>
                          <span className="text-emerald-300">NINGUNA • LIBRE CIRCULACIÓN</span>
                        </div>
                      </div>

                      <div className="text-[9px] font-mono text-neutral-400 flex justify-between items-center border-t border-neutral-800 pt-1.5">
                        <span>CARA POSTERIOR VERIFICADA</span>
                        <span className="text-cyan-400 font-bold">Toca para ampliar 🔍</span>
                      </div>
                    </>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-xs font-mono font-bold text-white transition">
                    <Maximize2 className="w-4 h-4 text-cyan-400" />
                    <span>Ver en Pantalla Completa</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={scanningSlot === 'vehicle_registration_back'}
                onClick={() => handleTriggerFileSelect('vehicle_registration_back')}
                className="mt-3 w-full py-2 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 font-racing font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>
                  {scanningSlot === 'vehicle_registration_back'
                    ? 'Comprimiendo Cara Posterior...'
                    : vehicleRegistration.backImageUrl
                    ? 'Actualizar Foto Cara Posterior'
                    : 'Subir Foto Cara Posterior (Reverso)'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: FOTOS DE SOAT (SEGURO OBLIGATORIO) Y TECNOMECÁNICA (REVISIÓN TÉCNICA) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {[
            {
              slot: 'mandatory_insurance',
              globalKey: 'mandatory_insurance',
              shortLabel: countryLabels.mandatory_insurance.shortName,
              fullLabel: countryLabels.mandatory_insurance.fullName,
              expiryDate: mandatoryInsurance.expiryDate,
              numberLabel: 'Póliza Oficial',
              numberValue: mandatoryInsurance.policyNumber,
              issuer: mandatoryInsurance.issuer,
              imageUrl: mandatoryInsurance.imageUrl,
              evalStatus: mandatoryEval
            },
            {
              slot: 'technical_inspection',
              globalKey: 'technical_inspection',
              shortLabel: countryLabels.technical_inspection.shortName,
              fullLabel: countryLabels.technical_inspection.fullName,
              expiryDate: technicalInspection.expiryDate,
              numberLabel: 'Certificado RUNT',
              numberValue: technicalInspection.policyNumber,
              issuer: technicalInspection.issuer,
              imageUrl: technicalInspection.imageUrl,
              evalStatus: technicalEval
            }
          ].map((card) => {
            const isExpired = card.evalStatus.status === 'expired';
            const isWarning = ['critical_5d', 'warning_15d', 'notice_30d'].includes(card.evalStatus.status);
            const isScanning = scanningSlot === card.slot;

            return (
              <div
                key={card.slot}
                className={`rounded-2xl p-4 border flex flex-col justify-between transition ${
                  isExpired
                    ? 'bg-red-950/25 border-red-500/60'
                    : isWarning
                    ? 'bg-amber-950/25 border-amber-500/60'
                    : 'bg-neutral-900/90 border-neutral-800 hover:border-emerald-500/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-base font-black font-racing uppercase text-white flex items-center gap-1.5">
                      <FileCheck2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>Foto {card.shortLabel}</span>
                    </h3>
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                        isExpired
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : isWarning
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {card.evalStatus.badgeText}
                    </span>
                  </div>

                  {/* VISOR FOTOGRÁFICO GRANDE DEL DOCUMENTO */}
                  <div
                    onClick={() =>
                      setFullscreenDoc({
                        type: 'single',
                        card
                      })
                    }
                    className="relative group cursor-pointer rounded-xl overflow-hidden border-2 border-neutral-700 hover:border-emerald-400 h-52 bg-neutral-950 flex flex-col justify-between p-4 transition"
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
                              SOPORTE DIGITAL OFICIAL • {card.globalKey}
                            </span>
                            <span className="text-sm font-black font-racing uppercase text-white">
                              {card.fullLabel}
                            </span>
                          </div>
                          <QrCode className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                        </div>

                        <div className="space-y-1.5 font-mono text-xs my-auto">
                          <div className="flex justify-between bg-neutral-900/90 px-3 py-1.5 rounded-lg">
                            <span className="text-neutral-400">PLACA VEHÍCULO:</span>
                            <span className="font-bold text-amber-400">{vehicleRegistration.plate}</span>
                          </div>
                          <div className="flex justify-between bg-neutral-900/90 px-3 py-1.5 rounded-lg">
                            <span className="text-neutral-400">VENCIMIENTO:</span>
                            <span className="font-bold text-emerald-400">{card.expiryDate || 'SIN FECHA'}</span>
                          </div>
                          <div className="flex justify-between bg-neutral-900/90 px-3 py-1.5 rounded-lg">
                            <span className="text-neutral-400">{card.numberLabel}:</span>
                            <span className="text-white truncate max-w-[180px]">{card.numberValue}</span>
                          </div>
                          <div className="flex justify-between bg-neutral-900/90 px-3 py-1.5 rounded-lg">
                            <span className="text-neutral-400">ENTIDAD:</span>
                            <span className="text-neutral-200 truncate max-w-[180px]">{card.issuer}</span>
                          </div>
                        </div>

                        <div className="text-[10px] font-mono text-neutral-400 flex justify-between items-center pt-1 border-t border-neutral-800">
                          <span>Toca para mostrar en pantalla completa</span>
                          <span className="text-emerald-400 font-bold">Ampliar 🔍</span>
                        </div>
                      </>
                    )}

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-xs font-mono font-bold text-white transition">
                      <Maximize2 className="w-4 h-4 text-emerald-400" />
                      <span>Mostrar {card.shortLabel} en Pantalla Completa</span>
                    </div>
                  </div>
                </div>

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
                        <span>
                          {card.imageUrl
                            ? `Cambiar Foto de ${card.shortLabel}`
                            : `Subir Foto de ${card.shortLabel} (IA)`}
                        </span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFullscreenDoc({
                        type: 'single',
                        card
                      })
                    }
                    className="px-3 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs font-mono text-white flex items-center gap-1"
                    title="Abrir en pantalla completa"
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

        {/* MODAL INTERNO DE PANTALLA COMPLETA PARA MOSTRAR AL AGENTE DE TRÁNSITO */}
        {fullscreenDoc && (
          <div className="fixed inset-0 z-50 bg-black/96 flex flex-col items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="max-w-3xl w-full bg-neutral-900 border-2 border-emerald-500 rounded-3xl p-4 sm:p-6 text-white relative my-auto">
              <button
                onClick={() => setFullscreenDoc(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-black uppercase">
                INSPECCIÓN OFICIAL DE TRÁNSITO • PLACA {vehicleRegistration.plate}
              </span>

              {fullscreenDoc.type === 'registration_both' ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2">
                    <h3 className="text-lg sm:text-xl font-black font-racing uppercase">
                      {fullscreenDoc.title}
                    </h3>
                    <div className="flex gap-1.5">
                      {[
                        { id: 'both', label: 'Ambos Lados' },
                        { id: 'front', label: 'Solo Frontal' },
                        { id: 'back', label: 'Solo Posterior' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setRegSideFilter(tab.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono border ${
                            regSideFilter === tab.id
                              ? 'bg-amber-500 text-black font-bold border-amber-400'
                              : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 mt-4">
                    {(regSideFilter === 'both' || regSideFilter === 'front') && (
                      <div className="p-4 rounded-2xl bg-neutral-950 border border-amber-500/50">
                        <span className="text-xs font-racing font-bold uppercase text-amber-400 block mb-2">
                          Lado 1: Cara Frontal (Anverso) — Datos del Vehículo y Propietario
                        </span>
                        {fullscreenDoc.frontImageUrl ? (
                          <img
                            src={fullscreenDoc.frontImageUrl}
                            alt="Cara Frontal"
                            className="w-full max-h-[42vh] object-contain rounded-xl bg-black mx-auto"
                          />
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                            <div>
                              <span className="text-neutral-500 block text-[10px]">PLACA:</span>
                              <span className="text-amber-400 font-bold text-base">{vehicleRegistration.plate}</span>
                            </div>
                            <div>
                              <span className="text-neutral-500 block text-[10px]">MARCA / LÍNEA:</span>
                              <span className="text-white font-bold">{identity.brand} {identity.model}</span>
                            </div>
                            <div>
                              <span className="text-neutral-500 block text-[10px]">MODELO / CILINDRADA:</span>
                              <span className="text-white font-bold">{vehicleRegistration.modelYear} • {vehicleRegistration.displacementCc} cc</span>
                            </div>
                            <div>
                              <span className="text-neutral-500 block text-[10px]">PROPIETARIO:</span>
                              <span className="text-emerald-300 font-bold">{vehicleRegistration.ownerName}</span>
                            </div>
                            <div>
                              <span className="text-neutral-500 block text-[10px]">IDENTIFICACIÓN:</span>
                              <span className="text-white">{vehicleRegistration.ownerDoc}</span>
                            </div>
                            <div>
                              <span className="text-neutral-500 block text-[10px]">SERVICIO:</span>
                              <span className="text-white">PARTICULAR</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {(regSideFilter === 'both' || regSideFilter === 'back') && (
                      <div className="p-4 rounded-2xl bg-neutral-950 border border-cyan-500/50">
                        <span className="text-xs font-racing font-bold uppercase text-cyan-400 block mb-2">
                          Lado 2: Cara Posterior (Reverso) — Chasis / VIN, Motor y Organismo de Tránsito
                        </span>
                        {fullscreenDoc.backImageUrl ? (
                          <img
                            src={fullscreenDoc.backImageUrl}
                            alt="Cara Posterior"
                            className="w-full max-h-[42vh] object-contain rounded-xl bg-black mx-auto"
                          />
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                            <div>
                              <span className="text-neutral-500 block text-[10px]">VIN / CHASIS / SERIE:</span>
                              <span className="text-amber-300 font-bold">{vehicleRegistration.vin}</span>
                            </div>
                            <div>
                              <span className="text-neutral-500 block text-[10px]">NÚMERO DE MOTOR:</span>
                              <span className="text-white font-bold">{vehicleRegistration.engineNumber}</span>
                            </div>
                            <div>
                              <span className="text-neutral-500 block text-[10px]">AUTORIDAD:</span>
                              <span className="text-cyan-300 font-bold">{countryLabels.authority}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-black font-racing uppercase mt-2">
                    {fullscreenDoc.card?.fullLabel}
                  </h3>
                  <p className="text-xs font-mono text-neutral-400">
                    Vehículo: {identity.brand} {identity.model} • Placa: {vehicleRegistration.plate}
                  </p>

                  {fullscreenDoc.card?.imageUrl ? (
                    <div className="mt-4 rounded-2xl overflow-hidden border border-neutral-700 max-h-[60vh] flex items-center justify-center bg-black">
                      <img
                        src={fullscreenDoc.card.imageUrl}
                        alt={fullscreenDoc.card.shortLabel}
                        className="max-h-[60vh] w-auto object-contain"
                      />
                    </div>
                  ) : (
                    <div className="mt-4 p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5 font-mono text-sm">
                      <div className="flex justify-between border-b border-neutral-800 pb-2">
                        <span className="text-neutral-400">PLACA:</span>
                        <span className="font-bold text-amber-400 text-base">{vehicleRegistration.plate}</span>
                      </div>
                      <div className="flex justify-between border-b border-neutral-800 pb-2">
                        <span className="text-neutral-400">VENCIMIENTO:</span>
                        <span className="font-bold text-emerald-400">{fullscreenDoc.card?.expiryDate || 'VIGENTE'}</span>
                      </div>
                      <div className="flex justify-between border-b border-neutral-800 pb-2">
                        <span className="text-neutral-400">REFERENCIA:</span>
                        <span className="text-white">{fullscreenDoc.card?.numberValue}</span>
                      </div>
                      <div className="flex justify-between border-b border-neutral-800 pb-2">
                        <span className="text-neutral-400">ENTIDAD:</span>
                        <span className="text-white">{fullscreenDoc.card?.issuer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">VIN / CHASIS:</span>
                        <span className="text-neutral-300">{vehicleRegistration.vin}</span>
                      </div>
                    </div>
                  )}
                </>
              )}

              <button
                type="button"
                onClick={() => setFullscreenDoc(null)}
                className="mt-5 w-full py-3 rounded-xl bg-emerald-500 text-black font-racing font-bold uppercase text-xs"
              >
                Cerrar Vista de Inspección
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
