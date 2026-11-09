import React, { useState } from 'react';
import { 
  Radar, 
  Scale, 
  ShieldAlert, 
  ExternalLink, 
  X, 
  Check, 
  DollarSign, 
  FileText, 
  Globe, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { TRAFFIC_PORTALS, getCountryTrafficPortal } from '../../services/trafficFinesService';

export default function TrafficFinesModal({
  isOpen,
  onClose,
  radarState,
  initialTab = 'multas',
  onSaveTrafficSettings,
  onClearFine,
  bikeName = "Moto"
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'multas' | 'impugnacion' | 'paises'

  const {
    portal,
    countryCode,
    placa,
    docTitular,
    tieneMultas,
    totalMultas,
    multasPendientes,
    multaUrgente,
    totalDeudaOriginal,
    totalDeudaConDescuento,
    ahorroPotencial
  } = radarState || {};

  const [selectedCountry, setSelectedCountry] = useState(countryCode || "CO");
  const [customDoc, setCustomDoc] = useState(docTitular || "");

  if (!isOpen) return null;

  const currentPortal = getCountryTrafficPortal(selectedCountry);

  const handleSaveCountry = (e) => {
    e.preventDefault();
    if (onSaveTrafficSettings) {
      onSaveTrafficSettings({
        pais: selectedCountry,
        documentoTitular: customDoc.trim()
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#090d19] border border-red-950/60 rounded-t-3xl sm:rounded-3xl max-h-[94vh] flex flex-col overflow-hidden shadow-2xl text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-[#070a14] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center flex-shrink-0">
              <Radar className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-racing font-black text-sm text-white uppercase tracking-wider">
                  Radar Legal de Fotomultas & Tránsito
                </h3>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                  {portal?.bandera} {portal?.entidadCorta}
                </span>
              </div>
              <div className="text-[10px] font-mono text-neutral-400">
                Placa: <strong className="text-white">{placa}</strong> • {bikeName}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtabs */}
        <div className="flex border-b border-neutral-800 bg-[#060912] p-2 gap-1.5 overflow-x-auto flex-shrink-0">
          {[
            { id: "multas", label: `Estado de Cuenta (${totalMultas || 0})`, icon: DollarSign },
            { id: "impugnacion", label: "Guía de Impugnación Legal", icon: Scale },
            { id: "paises", label: "País & Entidad Oficial", icon: Globe }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 whitespace-nowrap border ${
                  isActive
                    ? "bg-red-500/20 text-red-300 border-red-400/60 shadow-sm shadow-red-500/20"
                    : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-red-400" : "text-neutral-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          
          {/* TAB 1: MULTAS & ESTADO DE CUENTA */}
          {activeTab === "multas" && (
            <div className="space-y-3.5 animate-fadeIn">
              
              {tieneMultas ? (
                <>
                  {/* Resumen de Deuda & Ahorro */}
                  <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/40 flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <span className="text-[10px] font-mono text-red-300 uppercase tracking-wider block font-bold">
                        COMPARENDOS ACTIVOS ({totalMultas})
                      </span>
                      <div className="text-2xl font-black font-racing text-white mt-0.5">
                        ${totalDeudaConDescuento?.toLocaleString()} {portal?.moneda}
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400">
                        Valor pleno: ${totalDeudaOriginal?.toLocaleString()} {portal?.moneda}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block font-bold">
                        AHORRO POR LEY (50%):
                      </span>
                      <span className="text-lg font-bold font-mono text-emerald-300">
                        -${ahorroPotencial?.toLocaleString()} {portal?.moneda}
                      </span>
                      <span className="text-[9px] font-mono text-neutral-400 block">
                        Aplica dentro del término legal
                      </span>
                    </div>
                  </div>

                  {/* Lista de Comparendos */}
                  <div className="space-y-2.5">
                    {multasPendientes?.map((multa) => (
                      <div 
                        key={multa.id}
                        className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
                          <div>
                            <span className="text-[10px] font-mono text-red-400 font-bold uppercase block">
                              Código {multa.codigoInfraccion} • Comparendo Oficial
                            </span>
                            <h4 className="text-sm font-bold text-white font-racing">
                              {multa.descripcion}
                            </h4>
                            <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                              {multa.entidadTransito} • {multa.lugar} ({multa.fechaComparendo})
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                              50% Descuento: ${multa.valorConDescuento?.toLocaleString()} {portal?.moneda}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-neutral-800 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
                          <span className="text-amber-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Vence en {multa.diasRestantesDescuento} días ({multa.fechaLimiteDescuento})</span>
                          </span>

                          <div className="flex items-center gap-2">
                            <a
                              href={multa.enlaceOficialPago || portal?.portalUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="py-1 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-[11px] font-bold font-racing flex items-center gap-1"
                            >
                              <span>Pagar en {portal?.entidadCorta}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>

                            <button
                              onClick={onClearFine}
                              className="py-1 px-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px]"
                            >
                              Marcar Pagada
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-8 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold font-racing text-white uppercase tracking-wider">
                    ¡Placa {placa} completamente al día!
                  </h4>
                  <p className="text-xs font-mono text-neutral-400 max-w-sm mx-auto">
                    No registras fotomultas ni sanciones pendientes en la base de datos de {portal?.entidadCorta}.
                  </p>
                  <a
                    href={portal?.portalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-cyan-400 font-mono text-xs transition mt-2"
                  >
                    <span>Verificar directamente en {portal?.entidadCorta}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: GUÍA DE IMPUGNACIÓN LEGAL */}
          {activeTab === "impugnacion" && (
            <div className="space-y-3.5 animate-fadeIn font-mono text-xs">
              
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
                <Scale className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300 block">
                    Defensa Legal contra Fotomultas No Notificadas ({portal?.pais})
                  </span>
                  <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                    Gran parte de las fotomultas son anulables mediante derecho de petición o tutela cuando la secretaría de tránsito viola el debido proceso.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                  Fundamentos Jurídicos para Impugnar en {portal?.pais}:
                </span>

                {portal?.reglasImpugnacion?.map((regla, idx) => (
                  <div key={idx} className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-neutral-300 text-xs leading-relaxed font-sans">
                      {regla}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
                <span className="text-white font-bold block">Paso a Paso Recomendado:</span>
                <ol className="list-decimal list-inside space-y-1 text-neutral-300">
                  <li>Ingresa al portal de {portal?.entidadCorta} y descarga la guía de envío físico de la citación.</li>
                  <li>Si la empresa de mensajería no te entregó la carta en menos de 3 días hábiles desde la validación, la notificación es nula.</li>
                  <li>Radica un Derecho de Petición solicitando la revocatoria directa por violación al debido proceso (art. 29 C.P.).</li>
                </ol>
              </div>

            </div>
          )}

          {/* TAB 3: PAÍSES & PARÁMETROS */}
          {activeTab === "paises" && (
            <form onSubmit={handleSaveCountry} className="space-y-3.5 animate-fadeIn font-mono text-xs">
              
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1">
                <span className="text-cyan-400 font-bold block">Configuración de Entidad de Tránsito</span>
                <p className="text-neutral-400 text-[11px]">
                  Selecciona el país donde circula la moto para conectar con su registro oficial de comparendos:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(TRAFFIC_PORTALS).map(([code, p]) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setSelectedCountry(code)}
                    className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                      selectedCountry === code
                        ? "bg-cyan-500/15 border-cyan-400 text-white shadow-md shadow-cyan-500/10"
                        : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                        <span>{p.bandera}</span>
                        <span>{p.pais}</span>
                      </div>
                      <span className="text-[10px] text-neutral-500 block mt-0.5">
                        {p.entidadCorta}
                      </span>
                    </div>
                    {selectedCountry === code && <Check className="w-4 h-4 text-cyan-400" />}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <label className="text-neutral-400 block mb-1">
                  {currentPortal?.documentoLabel} (requerido para consultar):
                </label>
                <input
                  type="text"
                  value={customDoc}
                  onChange={(e) => setCustomDoc(e.target.value)}
                  placeholder="Ej: 1020304050"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl font-racing font-bold uppercase tracking-wider text-xs bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-lg shadow-cyan-500/20 hover:opacity-90 transition"
                >
                  Guardar Configuración de País
                </button>
              </div>

            </form>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-neutral-800 bg-[#070a14] flex justify-between items-center text-[11px] font-mono text-neutral-500 flex-shrink-0">
          <span>{portal?.entidad}</span>
          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-racing font-bold text-xs transition"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}

