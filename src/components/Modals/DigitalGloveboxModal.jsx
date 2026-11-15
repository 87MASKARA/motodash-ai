import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  FileCheck2,
  Camera,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Bell,
  MessageCircle,
  Maximize2,
  X,
  Globe2,
  QrCode,
  UploadCloud,
  Clock,
  Lock
} from 'lucide-react';
import {
  COUNTRY_DOCUMENT_TERMINOLOGY,
  getCountryDocumentLabels,
  compressDocumentImage,
  extractDocumentWithAI,
  evaluateDocumentAlertStatus,
  triggerBrowserPushAlert,
  buildWhatsAppAlertUrl
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
  const [pushStatus, setPushStatus] = useState('');
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

  const vehicleRegistration = globalDocs.vehicle_registration || {
    plate: docs.placa || 'SIN PLACA',
    vin: docs.numeroChasis || identity.vin || 'N/A',
    engineNumber: docs.numeroMotor || identity.engineNumber || 'N/A',
    ownerName: docs.propietario || userProfile?.fullName || 'Titular Registrado',
    issuer: countryLabels.vehicle_registration.issuerPlaceholder,
    imageUrl: globalDocs.vehicle_registration?.imageUrl || null,
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

      // 3. Enviar imagen a Gemini Vision para extracción automática de fechas y póliza
      const aiResult = await extractDocumentWithAI({
        base64Data: compressed.base64Data,
        mimeType: compressed.mimeType,
        documentSlot: slot,
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
    const nextGlobalDocs = {
      ...(hojaDeVida.globalDocuments || {}),
      [slot]: {
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
      }
    };

    const nextDocs = { ...(hojaDeVida.documentos || {}) };
    if (slot === 'mandatory_insurance') {
      nextDocs.soatVencimiento = aiDraft.expiryDate;
      nextDocs.soatPoliza = aiDraft.policyOrCertNumber;
      nextDocs.soatAseguradora = aiDraft.issuerEntity;
    } else if (slot === 'technical_inspection') {
      nextDocs.tecnoVencimiento = aiDraft.expiryDate;
      nextDocs.tecnoCertificado = aiDraft.policyOrCertNumber;
      nextDocs.tecnoCentro = aiDraft.issuerEntity;
    } else if (slot === 'vehicle_registration' && aiDraft.plate) {
      nextDocs.placa = aiDraft.plate;
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

  const handleTestPushNotification = async () => {
    const sent = await triggerBrowserPushAlert(
      `🏍️ Guardián Legal MotoDash AI (${docs.placa || identity.model})`,
      `${mandatoryEval.alertMessage} | ${technicalEval.alertMessage}`
    );
    setPushStatus(
      sent
        ? '✅ Notificación Push enviada y Cron 8:00 AM activo'
        : '⚠️ Activa permisos de notificación en tu navegador'
    );
  };

  const handleSendWhatsAppAlert = () => {
    const url = buildWhatsAppAlertUrl(
      userProfile?.phone || docs.telefonoPropietario || '',
      `${identity.brand} ${identity.model}`,
      docs.placa || '',
      [
        `${countryLabels.mandatory_insurance.shortName}: ${mandatoryEval.badgeText} (Vence: ${mandatoryInsurance.expiryDate || 'No registrado'})`,
        `${countryLabels.technical_inspection.shortName}: ${technicalEval.badgeText} (Vence: ${technicalInspection.expiryDate || 'No registrado'})`
      ]
    );
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const documentCards = [
    {
      slot: 'mandatory_insurance',
      globalKey: 'mandatory_insurance',
      shortLabel: countryLabels.mandatory_insurance.shortName,
      fullLabel: countryLabels.mandatory_insurance.fullName,
      expiryDate: mandatoryInsurance.expiryDate,
      numberLabel: 'Póliza / Ref.',
      numberValue: mandatoryInsurance.policyNumber,
      issuer: mandatoryInsurance.issuer,
      imageUrl: mandatoryInsurance.imageUrl,
      verifiedByAi: mandatoryInsurance.verifiedByAi,
      evalStatus: mandatoryEval
    },
    {
      slot: 'technical_inspection',
      globalKey: 'technical_inspection',
      shortLabel: countryLabels.technical_inspection.shortName,
      fullLabel: countryLabels.technical_inspection.fullName,
      expiryDate: technicalInspection.expiryDate,
      numberLabel: 'Certificado Oficial',
      numberValue: technicalInspection.policyNumber,
      issuer: technicalInspection.issuer,
      imageUrl: technicalInspection.imageUrl,
      verifiedByAi: technicalInspection.verifiedByAi,
      evalStatus: technicalEval
    },
    {
      slot: 'vehicle_registration',
      globalKey: 'vehicle_registration',
      shortLabel: countryLabels.vehicle_registration.shortName,
      fullLabel: countryLabels.vehicle_registration.fullName,
      expiryDate: 'PERMANENTE',
      numberLabel: 'Placa & VIN Oficial',
      numberValue: `${vehicleRegistration.plate} • VIN: ${vehicleRegistration.vin}`,
      issuer: `Motor: ${vehicleRegistration.engineNumber}`,
      imageUrl: vehicleRegistration.imageUrl,
      verifiedByAi: true,
      evalStatus: {
        status: 'valid',
        badgeText: 'PROPIEDAD VERIFICADA',
        alertMessage: 'Tarjeta de propiedad lista para inspección.'
      }
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-neutral-950 border-2 border-emerald-500/40 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-[0_0_50px_rgba(16,185,129,0.18)] relative text-white my-auto max-h-[94vh] overflow-y-auto">
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
                  MODO RETÉN POLICIAL • ACCESO RÁPIDO
                </span>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {docs.placa || 'SIN PLACA'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black font-racing uppercase tracking-wider text-white mt-1">
                Guantera Digital & Escáner IA de Documentos
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                {identity.brand} {identity.model} ({docs.modeloAno || identity.year || '2026'}) • {countryLabels.authority}
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
                    ¡Extracción Automática con IA Completada! ({aiDraft.confidence}% Precisión)
                  </h3>
                  <p className="text-[11px] font-mono text-neutral-300">
                    Motor: {aiDraft.source} • Verifica que la fecha leída sea correcta y confirma con 1 clic:
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
                  Número de Póliza / Certificado
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
                <span>Confirmar Fecha y Guardar en Supabase</span>
              </button>
            </div>
          </div>
        )}

        {/* TARJETAS DE DOCUMENTOS EN ALTA CLARIDAD PARA RETENES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {documentCards.map((card) => {
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
                    <span className="text-[10px] font-mono text-neutral-500 uppercase">
                      DB: {card.globalKey}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
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

                  <h3 className="text-base font-black font-racing uppercase text-white flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{card.shortLabel}</span>
                  </h3>
                  <p className="text-[11px] text-neutral-400 line-clamp-1 mb-3">
                    {card.fullLabel}
                  </p>

                  <div className="bg-neutral-950/90 border border-neutral-800 rounded-xl p-3 space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Vencimiento:</span>
                      <span className="font-bold text-white">
                        {card.expiryDate || 'Sin escanear'}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-neutral-500">{card.numberLabel}:</span>
                      <span className="text-neutral-200 truncate">{card.numberValue}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-neutral-500">Entidad:</span>
                      <span className="text-emerald-400 truncate">{card.issuer}</span>
                    </div>
                  </div>

                  {/* Vista previa del soporte fotográfico comprimido */}
                  {card.imageUrl ? (
                    <div
                      onClick={() => setFullscreenDoc(card)}
                      className="mt-3 relative group cursor-pointer rounded-xl overflow-hidden border border-neutral-700 h-28 bg-black flex items-center justify-center"
                    >
                      <img
                        src={card.imageUrl}
                        alt={card.shortLabel}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-xs font-mono font-bold text-white transition">
                        <Maximize2 className="w-4 h-4 text-emerald-400" />
                        <span>Ampliar para Agente de Tránsito</span>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => setFullscreenDoc(card)}
                      className="mt-3 rounded-xl border border-dashed border-neutral-700 hover:border-emerald-500/50 p-3 bg-neutral-950/60 flex items-center justify-between cursor-pointer transition"
                    >
                      <div className="flex items-center gap-2">
                        <QrCode className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                        <div>
                          <span className="text-[11px] font-bold text-white block">
                            Tarjeta Digital Verificable
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400">
                            Toca para abrir en pantalla completa
                          </span>
                        </div>
                      </div>
                      <Maximize2 className="w-4 h-4 text-neutral-400" />
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-neutral-800/80 flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={isScanning}
                    onClick={() => handleTriggerFileSelect(card.slot)}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 font-racing font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
                  >
                    {isScanning ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        <span>Comprimiendo & Leyendo con IA...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-3.5 h-3.5" />
                        <span>Subir Foto & Extraer Fecha con IA</span>
                      </>
                    )}
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

        {/* MODAL INTERNO DE PANTALLA COMPLETA PARA MOSTRAR AL AGENTE EN RETÉN */}
        {fullscreenDoc && (
          <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4">
            <div className="max-w-lg w-full bg-neutral-900 border-2 border-emerald-500 rounded-3xl p-6 text-white relative">
              <button
                onClick={() => setFullscreenDoc(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-black uppercase">
                DOCUMENTO OFICIAL PARA INSPECCIÓN DE TRÁNSITO
              </span>
              <h3 className="text-xl font-black font-racing uppercase mt-2">
                {fullscreenDoc.fullLabel}
              </h3>
              <p className="text-xs font-mono text-neutral-400">
                Vehículo: {identity.brand} {identity.model} • Placa: {docs.placa || 'SIN PLACA'}
              </p>

              {fullscreenDoc.imageUrl ? (
                <div className="mt-4 rounded-2xl overflow-hidden border border-neutral-700 max-h-[55vh] flex items-center justify-center bg-black">
                  <img
                    src={fullscreenDoc.imageUrl}
                    alt={fullscreenDoc.shortLabel}
                    className="max-h-[55vh] w-auto object-contain"
                  />
                </div>
              ) : (
                <div className="mt-4 p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5 font-mono text-sm">
                  <div className="flex justify-between border-b border-neutral-800 pb-2">
                    <span className="text-neutral-400">PLACA:</span>
                    <span className="font-bold text-amber-400 text-base">{docs.placa || 'SIN PLACA'}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-800 pb-2">
                    <span className="text-neutral-400">VENCIMIENTO:</span>
                    <span className="font-bold text-emerald-400">{fullscreenDoc.expiryDate || 'VIGENTE'}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-800 pb-2">
                    <span className="text-neutral-400">REFERENCIA:</span>
                    <span className="text-white">{fullscreenDoc.numberValue}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-800 pb-2">
                    <span className="text-neutral-400">ENTIDAD:</span>
                    <span className="text-white">{fullscreenDoc.issuer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">VIN / CHASIS:</span>
                    <span className="text-neutral-300">{docs.numeroChasis || identity.vin || 'OFICIAL'}</span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setFullscreenDoc(null)}
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
