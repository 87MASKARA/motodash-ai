import React, { useState } from 'react';
import { 
  Shield, CheckCircle2, AlertTriangle, FileText, X, 
  Settings, Wrench, ChevronRight, Check, Calendar, Gauge
} from 'lucide-react';

export default function WarrantyRulesModal({
  isOpen,
  onClose,
  warrantyState,
  onSaveCustomWarranty,
  bikeName = "Moto"
}) {
  const [activeTab, setActiveTab] = useState('rules'); // 'rules' | 'checklists' | 'settings'
  const [selectedRevNum, setSelectedRevNum] = useState(
    warrantyState?.nextRev?.numero || warrantyState?.revisiones?.[0]?.numero || 1
  );

  // Formulario de ajustes de garantía
  const [customDistribuidor, setCustomDistribuidor] = useState(warrantyState?.distribuidor || "");
  const [customDistribuidorCorto, setCustomDistribuidorCorto] = useState(warrantyState?.distribuidorCorto || "");
  const [customMeses, setCustomMeses] = useState(warrantyState?.mesesGarantia || 24);
  const [customKm, setCustomKm] = useState(warrantyState?.kmGarantia || 24000);
  const [customTolerancia, setCustomTolerancia] = useState(warrantyState?.toleranciaKm || 200);
  const [customRitmo, setCustomRitmo] = useState(warrantyState?.ritmoKmDia || 65);
  const [customEnabled, setCustomEnabled] = useState(warrantyState?.isEnabled !== false);

  if (!isOpen) return null;

  const currentRevisionDetail = warrantyState?.revisiones?.find(
    (r) => r.numero === Number(selectedRevNum)
  ) || warrantyState?.revisiones?.[0];

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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl relative text-white my-auto max-h-[92vh] flex flex-col">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold font-racing uppercase tracking-wider text-white flex items-center gap-2">
                <span>Manual & Reglas de Garantía</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                  {warrantyState?.distribuidorCorto}
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono">
                {bikeName} • {warrantyState?.mesesGarantia} Meses / {warrantyState?.kmGarantia >= 900000 ? 'KM Ilimitado' : `${warrantyState?.kmGarantia?.toLocaleString()} KM`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex items-center gap-2 pt-3 pb-2 border-b border-neutral-800/80 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded-xl text-xs font-racing font-bold flex items-center gap-1.5 transition ${
              activeTab === 'rules'
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                : "text-neutral-400 hover:text-white bg-neutral-800/40"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Reglas de Oro</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('checklists')}
            className={`px-3 py-1.5 rounded-xl text-xs font-racing font-bold flex items-center gap-1.5 transition ${
              activeTab === 'checklists'
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                : "text-neutral-400 hover:text-white bg-neutral-800/40"
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Chequeos por Revisión</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-xl text-xs font-racing font-bold flex items-center gap-1.5 transition ${
              activeTab === 'settings'
                ? "bg-purple-500/20 text-purple-400 border border-purple-500/40"
                : "text-neutral-400 hover:text-white bg-neutral-800/40"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Ajustar Garantía</span>
          </button>
        </div>

        {/* Contenido con Scroll */}
        <div className="overflow-y-auto flex-1 pr-1 py-4 space-y-4 font-sans text-xs">
          
          {/* TAB 1: REGLAS DE ORO PARA PROTEGER LA GARANTÍA */}
          {activeTab === 'rules' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-amber-300 font-racing uppercase tracking-wider text-xs">
                    Condiciones Estrictas de Garantía de Fábrica
                  </h4>
                  <p className="text-neutral-300 text-[11px] leading-relaxed">
                    {warrantyState?.descripcionReglas || "Para mantener vigente la garantía oficial de fábrica, el usuario debe realizar las revisiones en los talleres autorizados sin exceder la tolerancia estipulada."}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <h5 className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 font-bold">
                  5 Reglas Fundamentales:
                </h5>
                {warrantyState?.reglasDeOro?.map((regla, idx) => (
                  <div 
                    key={idx}
                    className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80 flex items-start gap-2.5"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-neutral-200 text-xs leading-relaxed font-mono">
                      {regla}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-[11px] text-neutral-400 font-mono flex items-center justify-between">
                <span>Tolerancia Oficial:</span>
                <strong className="text-amber-400">+/- {warrantyState?.toleranciaKm} KM</strong>
              </div>
            </div>
          )}

          {/* TAB 2: CHEQUEOS DETALLADOS POR REVISIÓN */}
          {activeTab === 'checklists' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Selector de Revisión */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {warrantyState?.revisiones?.map((rev) => {
                  const isSelected = rev.numero === currentRevisionDetail.numero;
                  const isDone = warrantyState.completedNumbers.includes(rev.numero);
                  return (
                    <button
                      key={rev.numero}
                      type="button"
                      onClick={() => setSelectedRevNum(rev.numero)}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs whitespace-nowrap flex items-center gap-1.5 border transition ${
                        isSelected
                          ? "bg-cyan-500 text-black font-bold border-cyan-400 shadow-lg shadow-cyan-500/20"
                          : isDone
                          ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/80"
                          : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white"
                      }`}
                    >
                      {isDone && <Check className="w-3 h-3" />}
                      <span>{rev.numero}ª ({rev.km >= 1000 ? `${rev.km / 1000}k` : rev.km})</span>
                    </button>
                  );
                })}
              </div>

              {/* Tarjeta de la Revisión Seleccionada */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="font-bold text-white font-racing uppercase tracking-wider text-sm flex items-center gap-2">
                    <span>{currentRevisionDetail.numero}ª Revisión Obligatoria</span>
                    <span className="text-xs font-mono text-cyan-400">({currentRevisionDetail.km.toLocaleString()} KM)</span>
                  </h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                    currentRevisionDetail.manoDeObra === 'GRATIS'
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : "bg-blue-500/15 text-blue-400 border-blue-500/30"
                  }`}>
                    Mano de Obra: {currentRevisionDetail.manoDeObra} • Est. {currentRevisionDetail.tiempoEstHoras}h
                  </span>
                </div>

                <p className="text-neutral-400 text-xs font-mono">
                  {currentRevisionDetail.descripcion}
                </p>

                <div className="pt-2 border-t border-neutral-800 space-y-2">
                  <h5 className="font-mono text-[11px] text-neutral-500 uppercase tracking-wider font-bold">
                    Puntos de Inspección Mandatorios del Manual:
                  </h5>
                  <div className="grid grid-cols-1 gap-1.5">
                    {currentRevisionDetail.chequeos?.map((chk, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-neutral-300 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                        <span>{chk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONFIGURAR Y ADAPTAR GARANTÍA PARA OTRAS MOTOS */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-4 animate-fadeIn font-mono text-xs">
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
                <span className="text-amber-400 font-bold block">Personalización de Garantía</span>
                <p className="text-neutral-400 text-[11px]">
                  Si tu moto tiene garantía con otro concesionario (o si compraste una moto de segunda y quieres desactivarla o cambiar los términos), puedes modificar estos valores:
                </p>
              </div>

              {/* Activar / Desactivar Garantía */}
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-white font-bold block">Modo Garantía Activo</span>
                  <span className="text-[10px] text-neutral-400">Desactívalo si tu moto ya superó la garantía oficial de fábrica</span>
                </div>
                <input
                  type="checkbox"
                  checked={customEnabled}
                  onChange={(e) => setCustomEnabled(e.target.checked)}
                  className="w-5 h-5 rounded accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Nombre Concesionario / Distribuidor:</label>
                  <input
                    type="text"
                    value={customDistribuidor}
                    onChange={(e) => setCustomDistribuidor(e.target.value)}
                    placeholder="Ej: AUTECO / DISMERCA"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-sans text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Nombre Corto / Taller:</label>
                  <input
                    type="text"
                    value={customDistribuidorCorto}
                    onChange={(e) => setCustomDistribuidorCorto(e.target.value)}
                    placeholder="Ej: Dismerca"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-sans text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Duración en Meses:</label>
                  <input
                    type="number"
                    value={customMeses}
                    onChange={(e) => setCustomMeses(e.target.value)}
                    min="1"
                    max="120"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Límite Kilometraje (KM):</label>
                  <input
                    type="number"
                    value={customKm}
                    onChange={(e) => setCustomKm(e.target.value)}
                    min="1000"
                    step="1000"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Tolerancia Taller (+/- KM):</label>
                  <input
                    type="number"
                    value={customTolerancia}
                    onChange={(e) => setCustomTolerancia(e.target.value)}
                    min="10"
                    max="1000"
                    step="10"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Ritmo Promedio (KM / Día):</label>
                  <input
                    type="number"
                    value={customRitmo}
                    onChange={(e) => setCustomRitmo(e.target.value)}
                    min="5"
                    max="500"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl font-bold font-racing uppercase tracking-wider text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/20 hover:opacity-90 transition"
                >
                  Guardar Ajustes de Garantía
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-neutral-800 flex justify-between items-center text-[11px] font-mono text-neutral-500 flex-shrink-0">
          <span>MotoDash AI • Guardián de Garantía Oficial</span>
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
