import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  BookOpen, 
  X, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Settings,
  CircleDot,
  Droplet,
  Disc,
  Link,
  Fuel,
  Sun,
  GitCommit,
  Eye,
  RotateCcw
} from 'lucide-react';
import { CHECKLIST_DIARIO_ITEMS } from '../../services/warrantyCatalog';

export default function WarrantyRulesModal({
  isOpen,
  onClose,
  warrantyState,
  onSaveCustomWarranty,
  bikeName = "Moto"
}) {
  const [activeTab, setActiveTab] = useState('cronograma'); // 'cronograma' | 'reglas' | 'checklist' | 'settings'
  const [expandedRevision, setExpandedRevision] = useState(
    warrantyState?.nextRev?.numero || 1
  );

  // Checklist diario local
  const [dailyChecks, setDailyChecks] = useState(() => {
    try {
      const saved = localStorage.getItem("motodash_daily_checklist");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const toggleDailyCheck = (id) => {
    const updated = { ...dailyChecks, [id]: !dailyChecks[id] };
    setDailyChecks(updated);
    localStorage.setItem("motodash_daily_checklist", JSON.stringify(updated));
  };

  const resetDailyChecklist = () => {
    setDailyChecks({});
    localStorage.removeItem("motodash_daily_checklist");
  };

  const completedChecklistCount = Object.values(dailyChecks).filter(Boolean).length;

  // Formulario de ajustes de garantía
  const [customDistribuidor, setCustomDistribuidor] = useState(warrantyState?.distribuidor || "");
  const [customDistribuidorCorto, setCustomDistribuidorCorto] = useState(warrantyState?.distribuidorCorto || "");
  const [customMeses, setCustomMeses] = useState(warrantyState?.mesesGarantia || 24);
  const [customKm, setCustomKm] = useState(warrantyState?.kmGarantia || 24000);
  const [customTolerancia, setCustomTolerancia] = useState(warrantyState?.toleranciaKm || 200);
  const [customRitmo, setCustomRitmo] = useState(warrantyState?.ritmoKmDia || 65);
  const [customEnabled, setCustomEnabled] = useState(warrantyState?.isEnabled !== false);

  if (!isOpen) return null;

  const handleSaveSettings = (e) => {
    e.preventDefault();
    if (onSaveCustomWarranty) {
      onSaveCustomWarranty({
        enabled: customEnabled,
        distribuidor: customDistribuidor.trim() || warrantyState?.distribuidor,
        distribuidorCorto: customDistribuidorCorto.trim() || warrantyState?.distribuidorCorto,
        mesesGarantia: Number(customMeses) || 24,
        kmGarantia: Number(customKm) || 24000,
        toleranciaKm: Number(customTolerancia) || 200,
        ritmoKmDia: Number(customRitmo) || 65
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#090d19] border border-blue-900/50 rounded-t-3xl sm:rounded-3xl max-h-[94vh] flex flex-col overflow-hidden shadow-2xl text-white">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-blue-950/80 bg-[#070a14] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-racing font-black text-sm text-white uppercase tracking-wider">
                  MANUAL DE GARANTÍA & MANTENIMIENTO
                </h3>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-cyan-400 font-bold border border-blue-800">
                  {warrantyState?.distribuidorCorto}
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                {warrantyState?.distribuidor} • {warrantyState?.totalRevisiones} REVISIONES • TOLERANCIA +/- {warrantyState?.toleranciaKm} KM
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Navigation Bar */}
        <div className="flex border-b border-blue-950/80 bg-[#060912] p-2 gap-1.5 overflow-x-auto flex-shrink-0">
          {[
            { id: "cronograma", label: `${warrantyState?.totalRevisiones || 8} Revisiones`, icon: Calendar, badge: `${warrantyState?.completadasCount || 0}/${warrantyState?.totalRevisiones || 8}` },
            { id: "reglas", label: "Reglas de Oro", icon: ShieldAlert },
            { id: "checklist", label: "Checklist Diario", icon: CheckCircle2, badge: `${completedChecklistCount}/${CHECKLIST_DIARIO_ITEMS.length}` },
            { id: "settings", label: "Ajustar Garantía", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 whitespace-nowrap border ${
                  isActive
                    ? "bg-cyan-500/20 text-white border-cyan-400/60 shadow-sm shadow-cyan-500/20"
                    : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? "bg-cyan-400 text-black font-black" : "bg-slate-800 text-slate-400"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          
          {/* TAB 1: REVISIONES OBLIGATORIAS EXPANDIBLES */}
          {activeTab === "cronograma" && (
            <div className="space-y-3 animate-fadeIn">
              
              {/* Alert Callout for Tolerance */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs font-mono">
                  <span className="font-bold text-amber-300 block">
                    Regla de Oro de {warrantyState?.distribuidorCorto}: Tolerancia estricta de +/- {warrantyState?.toleranciaKm} KM
                  </span>
                  <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                    Se puede llevar la moto desde <strong>{warrantyState?.toleranciaKm} km antes o hasta {warrantyState?.toleranciaKm} km después</strong> del kilometraje fijado. Si te pasas del límite o no asistes, se <strong>pierde automáticamente la garantía</strong> del fabricante.
                  </p>
                </div>
              </div>

              {/* Revision Cards List */}
              <div className="space-y-2.5">
                {warrantyState?.revisiones?.map((rev) => {
                  const isExpanded = expandedRevision === rev.numero;
                  const isDone = warrantyState.completedNumbers.includes(rev.numero);
                  const isCurrent = warrantyState.nextRev && warrantyState.nextRev.numero === rev.numero;
                  const ventanaMin = Math.max(0, rev.km - (warrantyState.toleranciaKm || 100));
                  const ventanaMax = rev.km + (warrantyState.toleranciaKm || 100);

                  return (
                    <div
                      key={rev.numero}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isDone
                          ? "bg-emerald-950/20 border-emerald-500/30"
                          : isCurrent
                          ? "bg-slate-900/80 border-cyan-400/60 shadow-md shadow-cyan-500/10"
                          : "bg-slate-900/50 border-slate-800/80"
                      }`}
                    >
                      {/* Revision Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className={`w-8 h-8 rounded-xl font-racing font-black text-sm flex items-center justify-center shrink-0 mt-0.5 border ${
                            isDone
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : isCurrent
                              ? "bg-cyan-500/20 text-cyan-300 border-cyan-400"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}>
                            {isDone ? <Check className="w-4 h-4" /> : `${rev.numero}ª`}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-racing font-bold text-sm text-white">
                                {rev.numero}ª Revisión: {rev.km.toLocaleString()} KM
                              </span>
                              {rev.manoDeObra === "GRATIS" ? (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[9px] font-bold">
                                  MANO DE OBRA GRATIS
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-400 font-mono text-[9px]">
                                  PAGADA ({rev.tiempoEstHoras || 2}h)
                                </span>
                              )}
                              {isDone && (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-mono text-[9px] font-bold">
                                  COMPLETADA
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                              Ventana Oficial: <strong className="text-slate-200">{ventanaMin.toLocaleString()} - {ventanaMax.toLocaleString()} KM</strong>
                            </div>
                          </div>
                        </div>

                        {/* Status / Countdown */}
                        <div className="text-right shrink-0">
                          {isDone ? (
                            <span className="text-[11px] font-mono text-emerald-400 font-bold block">
                              Realizada
                            </span>
                          ) : (
                            <div>
                              <span className="text-xs font-mono font-bold text-slate-200 block">
                                Meta: {rev.km.toLocaleString()} km
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Summary text */}
                      <p className="text-[11px] font-mono text-slate-300 mt-2 bg-black/30 p-2.5 rounded-xl border border-slate-800">
                        {rev.descripcionManoObra || rev.descripcion}
                      </p>

                      {/* Toggle Details */}
                      <button
                        onClick={() => setExpandedRevision(isExpanded ? null : rev.numero)}
                        className="mt-2 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        <span>{isExpanded ? "Ocultar puntos de chequeo" : `Ver tareas técnicas oficiales (${rev.chequeos?.length || 0})`}</span>
                      </button>

                      {/* Expandable Official Checkpoints */}
                      {isExpanded && (
                        <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 space-y-2 animate-fadeIn text-xs font-mono">
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                            Tareas Oficiales en esta Revisión:
                          </div>
                          <ul className="space-y-1 text-slate-300 text-[11px]">
                            {rev.chequeos?.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-cyan-400 font-bold">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>

                          {rev.cambiosObligatorios && rev.cambiosObligatorios.length > 0 && (
                            <div className="pt-2">
                              <span className="text-[10px] text-amber-400 font-bold uppercase block mb-1">
                                Insumos / Repuestos a Reemplazar:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {rev.cambiosObligatorios.map((c, i) => (
                                  <span key={i} className="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-[10px]">
                                    {c}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: REGLAS DE ORO */}
          {activeTab === "reglas" && (
            <div className="space-y-3 animate-fadeIn">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs font-mono">
                  <span className="font-bold text-amber-300 block">
                    Reglas Fundamentales de Fábrica ({warrantyState?.distribuidorCorto})
                  </span>
                  <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                    El incumplimiento de cualquiera de estas condiciones exonera a la marca de responder por reparaciones de garantía.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {warrantyState?.reglasDeOro?.map((regla, idx) => {
                  const isCritico = regla.nivel === "critico";
                  const isAdvertencia = regla.nivel === "advertencia";

                  return (
                    <div 
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-racing font-bold text-sm text-white flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isCritico ? "bg-red-400 animate-pulse" : isAdvertencia ? "bg-amber-400" : "bg-blue-400"}`} />
                          <span>{regla.titulo || regla}</span>
                        </h4>
                        {regla.nivel && (
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                            isCritico ? "bg-red-500/20 text-red-300 border border-red-500/40" :
                            isAdvertencia ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" :
                            "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                          }`}>
                            {regla.nivel}
                          </span>
                        )}
                      </div>
                      {regla.detalle && (
                        <p className="text-[11px] font-mono text-slate-300 leading-relaxed pl-4">
                          {regla.detalle}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CHECKLIST DIARIO PRE-RODAJE */}
          {activeTab === "checklist" && (
            <div className="space-y-3 animate-fadeIn font-mono text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div>
                  <span className="font-bold text-white block">Inspección Pre-Vuelo Diaria</span>
                  <span className="text-[10px] text-slate-400">Chequeos mandatorios del manual antes de encender</span>
                </div>
                <button
                  onClick={resetDailyChecklist}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reiniciar</span>
                </button>
              </div>

              <div className="space-y-2">
                {CHECKLIST_DIARIO_ITEMS.map((item) => {
                  const isChecked = Boolean(dailyChecks[item.id]);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleDailyCheck(item.id)}
                      className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        isChecked
                          ? "bg-emerald-950/30 border-emerald-500/50"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isChecked ? "text-emerald-300" : "text-white"}`}>
                            {item.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          {item.detalle}
                        </p>
                      </div>

                      <div className={`w-6 h-6 rounded-xl border flex items-center justify-center shrink-0 transition ${
                        isChecked
                          ? "bg-emerald-500 border-emerald-400 text-black shadow-md shadow-emerald-500/30"
                          : "border-slate-700 bg-slate-800 text-transparent"
                      }`}>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: AJUSTAR GARANTÍA PARA OTRAS MOTOS */}
          {activeTab === "settings" && (
            <form onSubmit={handleSaveSettings} className="space-y-4 animate-fadeIn font-mono text-xs">
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1">
                <span className="text-amber-400 font-bold block">Personalización Multimarca</span>
                <p className="text-slate-400 text-[11px]">
                  Si tienes una moto de otra marca, compraste una moto usada o el concesionario te dio condiciones diferentes, ajusta estos parámetros:
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-white font-bold block">Modo Garantía Activo</span>
                  <span className="text-[10px] text-slate-400">Desactívalo si tu moto ya superó la garantía oficial</span>
                </div>
                <input
                  type="checkbox"
                  checked={customEnabled}
                  onChange={(e) => setCustomEnabled(e.target.checked)}
                  className="w-5 h-5 rounded accent-cyan-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Concesionario / Distribuidor:</label>
                  <input
                    type="text"
                    value={customDistribuidor}
                    onChange={(e) => setCustomDistribuidor(e.target.value)}
                    placeholder="Ej: AUTECO / DISMERCA"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-sans text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Nombre Corto / Taller:</label>
                  <input
                    type="text"
                    value={customDistribuidorCorto}
                    onChange={(e) => setCustomDistribuidorCorto(e.target.value)}
                    placeholder="Ej: Dismerca"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-sans text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Duración en Meses:</label>
                  <input
                    type="number"
                    value={customMeses}
                    onChange={(e) => setCustomMeses(e.target.value)}
                    min="1"
                    max="120"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Límite Kilometraje (KM):</label>
                  <input
                    type="number"
                    value={customKm}
                    onChange={(e) => setCustomKm(e.target.value)}
                    min="1000"
                    step="1000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Tolerancia Taller (+/- KM):</label>
                  <input
                    type="number"
                    value={customTolerancia}
                    onChange={(e) => setCustomTolerancia(e.target.value)}
                    min="10"
                    max="1000"
                    step="10"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Ritmo Promedio (KM / Día):</label>
                  <input
                    type="number"
                    value={customRitmo}
                    onChange={(e) => setCustomRitmo(e.target.value)}
                    min="5"
                    max="500"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl font-racing font-bold uppercase tracking-wider text-xs bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-lg shadow-cyan-500/20 hover:opacity-90 transition"
                >
                  Guardar Ajustes de Garantía
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-blue-950/80 bg-[#070a14] flex justify-between items-center text-[11px] font-mono text-slate-500 flex-shrink-0">
          <span>{bikeName} • MotoDash AI</span>
          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-racing font-bold text-xs transition"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
