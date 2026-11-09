import React, { useState, useEffect } from 'react';
import PrintReportModal from './PrintReportModal';
import { BrandLogo } from '../Common/BrandLogos';
import { 
  Wrench, Shield, Plus, Gauge, X, Edit3, Check, Trash2, Radar
} from 'lucide-react';
import TrafficFinesRadarCard from '../Dashboard/Widgets/TrafficFinesRadarCard';
import TrafficFinesModal from '../Modals/TrafficFinesModal';
import { computeFinesRadarState } from '../../services/trafficFinesService';

export default function HojaDeVidaModal({
  isOpen,
  onClose,
  bikeConfig,
  hojaDeVida = {},
  odometer = 0,
  currency = 'COP',
  onUpdateHojaDeVida,
  onDeleteService,
  onOpenOdometerModal,
  userProfile = null,
  bike = null,
  onOpenFinesModal = null
}) {
  const [activeTab, setActiveTab] = useState('servicios'); // 'servicios' | 'documentos' | 'ficha' | 'fotomultas'
  const [isEditingDocs, setIsEditingDocs] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isFinesModalOpen, setIsFinesModalOpen] = useState(false);
  const [finesModalTab, setFinesModalTab] = useState('multas');

  const defaultDocs = {
    placa: "APC-4V",
    vinChasis: "NO REGISTRADO",
    engineNumber: "NO REGISTRADO",
    soatVencimiento: "2027-02-15",
    tecnoVencimiento: "2027-03-20",
    seguroNombre: "Seguro Todo Riesgo SURA (Demo)",
    seguroPoliza: "900000000000",
    seguroVencimiento: "2027-09-10",
    impuestoVencimiento: "2027-06-30"
  };

  const docs = { ...defaultDocs, ...(hojaDeVida.documentos || {}) };
  const [docForm, setDocForm] = useState(docs);

  useEffect(() => {
    setDocForm({ ...defaultDocs, ...(hojaDeVida.documentos || {}) });
    setIsEditingDocs(false);
  }, [hojaDeVida, isOpen]);

  if (!isOpen || !bikeConfig) return null;

  const { bikeIdentity, telemetrySpecs } = bikeConfig;
  const servicios = Array.isArray(hojaDeVida.servicios) ? hojaDeVida.servicios : [];

  const getDaysRemaining = (dateStr) => {
    if (!dateStr) return null;
    const target = new Date(dateStr);
    const today = new Date();
    const diffTime = target - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const totalInvertido = servicios.reduce((acc, s) => acc + (Number(s.costo) || 0), 0);

  const handleSaveDocs = (e) => {
    e.preventDefault();
    if (onUpdateHojaDeVida) {
      onUpdateHojaDeVida({
        ...hojaDeVida,
        documentos: {
          ...docs,
          ...docForm,
          placa: String(docForm.placa || "SIN PLACA").trim().toUpperCase().slice(0, 15),
          vinChasis: String(docForm.vinChasis || "").trim().toUpperCase().slice(0, 30),
          engineNumber: String(docForm.engineNumber || "").trim().toUpperCase().slice(0, 30)
        }
      });
    }
    setIsEditingDocs(false);
  };

  const currentBike = bike || { config: bikeConfig, hojaDeVida, odometer };
  const finesRadarState = computeFinesRadarState(currentBike, userProfile);
  const pendingFinesCount = finesRadarState.multasPendientes?.length || 0;

  const handleSaveTrafficSettings = (newSettings) => {
    if (onUpdateHojaDeVida) {
      onUpdateHojaDeVida({
        ...hojaDeVida,
        multas: {
          ...(hojaDeVida.multas || {}),
          ...newSettings
        }
      });
    }
  };

  const handleClearFine = (fineId) => {
    const currentMultas = hojaDeVida.multas || {};
    const currentList = Array.isArray(currentMultas.registros) ? currentMultas.registros : [];
    const updatedList = currentList.filter(f => f.id !== fineId);
    if (onUpdateHojaDeVida) {
      onUpdateHojaDeVida({
        ...hojaDeVida,
        multas: {
          ...currentMultas,
          registros: updatedList,
          lastChecked: new Date().toISOString()
        }
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl relative text-white overflow-hidden">
        
        {/* Header con Identidad de la Moto */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div 
              className="w-11 h-11 rounded-2xl bg-neutral-900 border p-1.5 flex items-center justify-center shadow-lg flex-shrink-0"
              style={{ borderColor: "var(--primary-accent)" }}
            >
              <BrandLogo
                brand={bikeIdentity.brand}
                accentColor={bikeIdentity.colorHex}
                className="w-full h-full drop-shadow"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black font-racing uppercase tracking-wider text-white">
                  Hoja de Vida & Bitácora Técnica
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-amber-400 border border-neutral-700 font-bold">
                  {docs.placa || "SIN PLACA"}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-mono">
                {bikeIdentity.brand} {bikeIdentity.model} ({bikeIdentity.year}) • Historial oficial de intervenciones
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPrintOpen(true)}
              className="py-1.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-racing font-bold flex items-center gap-1.5 transition"
              title="Descargar o Imprimir Certificado de Mantenimiento"
            >
              <span>📄 Certificado PDF</span>
            </button>
            <button 
              onClick={onClose}
              className="text-neutral-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/40 p-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('servicios')}
            className={`py-2 px-3 rounded-xl text-xs font-racing font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'servicios'
                ? "bg-amber-500 text-black shadow-md"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Mantenimiento & Taller ({servicios.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('documentos')}
            className={`py-2 px-3 rounded-xl text-xs font-racing font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'documentos'
                ? "bg-amber-500 text-black shadow-md"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Documentos & Vencimientos</span>
          </button>

          <button
            onClick={() => setActiveTab('ficha')}
            className={`py-2 px-3 rounded-xl text-xs font-racing font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'ficha'
                ? "bg-amber-500 text-black shadow-md"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Ficha Técnica Oficial</span>
          </button>

          <button
            onClick={() => setActiveTab('fotomultas')}
            className={`py-2 px-3 rounded-xl text-xs font-racing font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'fotomultas'
                ? "bg-amber-500 text-black shadow-md"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Radar className="w-3.5 h-3.5" />
            <span>Radar de Multas & Tránsito</span>
            {pendingFinesCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black">
                {pendingFinesCount}
              </span>
            )}
          </button>
        </div>

        {/* Contenido Principal con Scroll */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: SERVICIOS Y TALLER */}
          {activeTab === 'servicios' && (
            <div className="space-y-4">
              {/* Tarjetas Resumen */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-neutral-950/70 border border-neutral-800 p-4 rounded-2xl">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase block mb-1">
                    Total Invertido en Mantenimiento
                  </span>
                  <div className="text-xl sm:text-2xl font-black font-telemetry text-emerald-400">
                    ${totalInvertido.toLocaleString()} <span className="text-xs text-neutral-400 font-normal">{currency}</span>
                  </div>
                  <span className="text-[10px] text-neutral-500">Repuestos + Mano de Obra</span>
                </div>

                <div className="bg-neutral-950/70 border border-neutral-800 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase block mb-1">
                      Última Intervención
                    </span>
                    <div className="text-sm font-bold text-neutral-200 truncate">
                      {servicios[0]?.servicio || "Sin registros"}
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenOdometerModal && onOpenOdometerModal('service')}
                    className="mt-2 text-xs font-racing font-bold text-black bg-amber-500 hover:bg-amber-400 py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Registrar Mantenimiento</span>
                  </button>
                </div>
              </div>

              {/* Lista de Registros */}
              <div className="space-y-3">
                <h4 className="text-xs font-racing uppercase tracking-wider text-neutral-400">
                  Historial Cronológico de Servicios
                </h4>
                {servicios.map((srv) => (
                  <div key={srv.id} className="bg-neutral-950/50 border border-neutral-800/80 p-4 rounded-2xl">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <div>
                        <h5 className="text-sm font-bold text-white flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          <span>{srv.servicio}</span>
                        </h5>
                        <span className="text-[11px] text-neutral-400 font-mono">
                          {srv.fecha} • Kilometraje: <strong className="text-neutral-200">{Number(srv.km || 0).toLocaleString()} km</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black font-telemetry text-neutral-100">
                          ${Number(srv.costo || 0).toLocaleString()} <span className="text-[10px] text-neutral-500 font-normal">{currency}</span>
                        </span>
                        {onDeleteService && servicios.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm("¿Eliminar este registro de mantenimiento?")) {
                                onDeleteService(srv.id);
                              }
                            }}
                            className="text-neutral-500 hover:text-red-400 p-1 rounded-lg transition"
                            title="Eliminar registro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-neutral-400 pt-2 border-t border-neutral-800/60 font-mono">
                      <div>
                        <span className="text-[10px] text-neutral-500 block">Repuesto / Aceite:</span>
                        <span className="text-neutral-300 font-sans">{srv.marcaRepuesto || "No especificado"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 block">Taller / Mecánico:</span>
                        <span className="text-neutral-300 font-sans">{srv.taller || "Particular"}</span>
                      </div>
                    </div>

                    {(srv.notas || srv.notes) && (
                      <p className="text-[11px] text-neutral-400 mt-2 bg-neutral-900/60 p-2 rounded-lg italic">
                        "{srv.notas || srv.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: DOCUMENTOS LEGALES & VENCIMIENTOS (CON MODO EDICIÓN) */}
          {activeTab === 'documentos' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-racing uppercase tracking-wider text-neutral-400">
                  Control Legal & Vencimientos de la Moto
                </span>
                {!isEditingDocs && (
                  <button
                    type="button"
                    onClick={() => setIsEditingDocs(true)}
                    className="py-1.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-neutral-700 text-xs font-racing font-bold flex items-center gap-1.5 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Actualizar Fechas / Placa</span>
                  </button>
                )}
              </div>

              {!isEditingDocs ? (
                <>
                  {[
                    { 
                      id: "soat", 
                      title: "SOAT (Seguro Obligatorio)", 
                      date: docs.soatVencimiento, 
                      desc: "Cobertura de accidentes de tránsito" 
                    },
                    { 
                      id: "tecno", 
                      title: "Revisión Técnico-Mecánica (RTM)", 
                      date: docs.tecnoVencimiento, 
                      desc: "Certificado de gases y seguridad vial" 
                    },
                    { 
                      id: "seguro", 
                      title: docs.seguroNombre || "Seguro Todo Riesgo", 
                      date: docs.seguroVencimiento, 
                      desc: `Póliza #${docs.seguroPoliza || "SURA"}` 
                    },
                    { 
                      id: "impuesto", 
                      title: "Impuesto Vehicular Anual", 
                      date: docs.impuestoVencimiento, 
                      desc: "Gobernación / Semaforización" 
                    }
                  ].map((doc) => {
                    const days = getDaysRemaining(doc.date);
                    const isExpired = days !== null && days <= 0;
                    const isWarning = days !== null && days > 0 && days <= 30;

                    return (
                      <div key={doc.id} className="bg-neutral-950/60 border border-neutral-800 p-4 rounded-2xl flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isExpired ? "bg-red-950/80 text-red-400 border border-red-800/60" :
                            isWarning ? "bg-amber-950/80 text-amber-400 border border-amber-800/60" :
                            "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                          }`}>
                            <Shield className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-white">{doc.title}</h5>
                            <p className="text-[11px] text-neutral-400 font-mono">
                              Vence: {doc.date || "Sin fecha"} • {doc.desc}
                            </p>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
                            isExpired ? "bg-red-500/20 text-red-400 border border-red-500/40" :
                            isWarning ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" :
                            "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          }`}>
                            {days === null ? "N/A" : isExpired ? "VENCIDO" : `${days} días`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <form onSubmit={handleSaveDocs} className="bg-neutral-950/80 border border-neutral-800 p-4 rounded-2xl space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-mono text-neutral-400 block mb-1">Placa / Matrícula</label>
                      <input
                        type="text"
                        value={docForm.placa || ""}
                        onChange={(e) => setDocForm({ ...docForm, placa: e.target.value.toUpperCase() })}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-neutral-400 block mb-1">VIN / Chasis</label>
                      <input
                        type="text"
                        value={docForm.vinChasis || ""}
                        onChange={(e) => setDocForm({ ...docForm, vinChasis: e.target.value.toUpperCase() })}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-neutral-400 block mb-1">Número de Motor</label>
                      <input
                        type="text"
                        value={docForm.engineNumber || ""}
                        onChange={(e) => setDocForm({ ...docForm, engineNumber: e.target.value.toUpperCase() })}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-mono text-neutral-400 block mb-1">Vencimiento SOAT</label>
                      <input
                        type="date"
                        value={docForm.soatVencimiento || ""}
                        onChange={(e) => setDocForm({ ...docForm, soatVencimiento: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-neutral-400 block mb-1">Vencimiento Técnico-Mecánica</label>
                      <input
                        type="date"
                        value={docForm.tecnoVencimiento || ""}
                        onChange={(e) => setDocForm({ ...docForm, tecnoVencimiento: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-neutral-400 block mb-1">Aseguradora Todo Riesgo</label>
                      <input
                        type="text"
                        value={docForm.seguroNombre || ""}
                        onChange={(e) => setDocForm({ ...docForm, seguroNombre: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-neutral-400 block mb-1">Póliza #</label>
                      <input
                        type="text"
                        value={docForm.seguroPoliza || ""}
                        onChange={(e) => setDocForm({ ...docForm, seguroPoliza: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-neutral-400 block mb-1">Vencimiento Póliza Todo Riesgo</label>
                      <input
                        type="date"
                        value={docForm.seguroVencimiento || ""}
                        onChange={(e) => setDocForm({ ...docForm, seguroVencimiento: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-neutral-400 block mb-1">Vencimiento Impuesto Anual</label>
                      <input
                        type="date"
                        value={docForm.impuestoVencimiento || ""}
                        onChange={(e) => setDocForm({ ...docForm, impuestoVencimiento: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
                    <button
                      type="button"
                      onClick={() => setIsEditingDocs(false)}
                      className="py-2 px-4 rounded-xl bg-neutral-800 text-neutral-300 font-racing font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-racing font-bold flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Guardar Documentos</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: FICHA TÉCNICA OFICIAL */}
          {activeTab === 'ficha' && (
            <div className="space-y-4">
              <div className="bg-neutral-950/60 border border-neutral-800 p-4 rounded-2xl">
                <h4 className="text-xs font-racing uppercase tracking-wider text-neutral-400 mb-3">
                  Especificaciones de Fábrica Calibradas
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 block">CILINDRADA</span>
                    <strong className="text-neutral-200 text-sm">{telemetrySpecs.engineCc} cc</strong>
                  </div>
                  <div className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 block">LÍNEA ROJA (REDLINE)</span>
                    <strong className="text-red-400 text-sm">{telemetrySpecs.redlineRpm.toLocaleString()} RPM</strong>
                  </div>
                  <div className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 block">CAPACIDAD TANQUE</span>
                    <strong className="text-neutral-200 text-sm">{telemetrySpecs.tankCapacityLiters} Litros</strong>
                  </div>
                  <div className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 block">VIN / CHASIS</span>
                    <strong className="text-neutral-200 text-xs truncate block">{docs.vinChasis || "NO REGISTRADO"}</strong>
                  </div>
                  <div className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 block">NÚMERO MOTOR</span>
                    <strong className="text-neutral-200 text-xs truncate block">{docs.engineNumber || "NO REGISTRADO"}</strong>
                  </div>
                  <div className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 block">ACEITE RECOMENDADO</span>
                    <strong className="text-neutral-200 text-sm">10W-40 Sintético</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RADAR DE FOTOMULTAS & TRÁNSITO */}
          {activeTab === 'fotomultas' && (
            <div className="space-y-4">
              <TrafficFinesRadarCard
                bike={currentBike}
                userProfile={userProfile}
                onOpenFinesModal={(tab = 'multas') => {
                  setFinesModalTab(tab);
                  setIsFinesModalOpen(true);
                }}
                onUpdateHojaDeVida={onUpdateHojaDeVida}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex justify-between items-center text-xs">
          <span className="text-neutral-500 font-mono">
            {bikeIdentity.brand} Gemelo Digital Oficial
          </span>
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl font-racing font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition"
          >
            Cerrar
          </button>
        </div>

        {/* Modal Imprimible de Certificado */}
        <PrintReportModal
          isOpen={isPrintOpen}
          onClose={() => setIsPrintOpen(false)}
          bikeConfig={bikeConfig}
          hojaDeVida={hojaDeVida}
          odometer={odometer}
          currency={currency}
        />

        {/* Modal Detallado de Radar de Fotomultas & Tránsito */}
        <TrafficFinesModal
          isOpen={isFinesModalOpen}
          onClose={() => setIsFinesModalOpen(false)}
          bike={currentBike}
          userProfile={userProfile}
          initialTab={finesModalTab}
          onUpdateTrafficSettings={handleSaveTrafficSettings}
          onClearFine={handleClearFine}
        />
      </div>
    </div>
  );
}
