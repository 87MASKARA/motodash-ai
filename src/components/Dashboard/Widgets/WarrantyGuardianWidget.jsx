import React, { useState } from 'react';
import { 
  Shield, Calendar, Gauge, Wrench, FileText, ChevronRight, 
  Check, AlertTriangle, Clock, Sparkles, CheckCircle2, ChevronDown, ChevronUp
} from 'lucide-react';
import { computeWarrantyState } from '../../../services/warrantyCatalog';

export default function WarrantyGuardianWidget({
  bike = {},
  currentOdometer = 0,
  onOpenRulesModal,
  onOpenRegisterRevisionModal
}) {
  const warranty = computeWarrantyState(bike, currentOdometer);
  const [isExpanded, setIsExpanded] = useState(true);

  if (!warranty.isEnabled) {
    return (
      <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-3xl p-4 sm:p-5 text-neutral-400 font-mono text-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-neutral-600" />
          <div>
            <span className="text-neutral-300 font-bold block">Garantía de Fábrica Inactiva</span>
            <span className="text-[11px] text-neutral-500">Mantenimiento preventivo libre activo en el Cockpit</span>
          </div>
        </div>
        <button
          onClick={onOpenRulesModal}
          className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-racing font-bold transition"
        >
          Activar o Configurar
        </button>
      </div>
    );
  }

  const {
    distribuidor,
    distribuidorCorto,
    mesesGarantia,
    kmGarantia,
    toleranciaKm,
    ritmoKmDia,
    revisiones,
    completedNumbers,
    completadasCount,
    totalRevisiones,
    nextRev,
    status,
    distanciaRestante,
    diasRestantes,
    fechaEstimada,
    ventanaMin,
    ventanaMax
  } = warranty;

  // Cálculo de progreso hacia la siguiente revisión
  const prevRevKm = nextRev && nextRev.numero > 1
    ? revisiones.find(r => r.numero === nextRev.numero - 1)?.km || 0
    : 0;
  
  const spanKm = nextRev ? Math.max(1, nextRev.km - prevRevKm) : 10000;
  const currentProgress = nextRev
    ? Math.min(100, Math.max(0, Math.round(((currentOdometer - prevRevKm) / spanKm) * 100)))
    : 100;

  // Estado visual del badge
  const badgeConfig = {
    PROGRAMADA: { label: "PROGRAMADA", bg: "bg-blue-500/15 text-blue-400 border-blue-500/40" },
    EN_VENTANA: { label: "● EN VENTANA (TALLER)", bg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 animate-pulse" },
    URGENTE: { label: "URGENTE (PRÓXIMA)", bg: "bg-amber-500/20 text-amber-300 border-amber-500/50" },
    EN_RIESGO: { label: "⚠ RIESGO DE PÉRDIDA", bg: "bg-red-500/20 text-red-400 border-red-500/50 animate-bounce" },
    COMPLETADA: { label: "CUMPLIDA 100%", bg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" },
    VENCIDA_KILOMETRAJE: { label: "LÍMITE KM CUMPLIDO", bg: "bg-neutral-800 text-neutral-400 border-neutral-700" }
  }[status] || { label: status, bg: "bg-neutral-800 text-neutral-300 border-neutral-700" };

  return (
    <div className="bg-[#0b101b] border border-blue-900/40 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden transition-all duration-300">
      
      {/* Resplandor Neón Superior */}
      <div className="absolute top-0 right-0 w-80 h-32 bg-blue-500/10 blur-[90px] pointer-events-none" />

      {/* 1. Header del Guardián de Garantía */}
      <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap pb-4 border-b border-blue-950/80 relative z-10">
        
        {/* Identidad de la Garantía */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500/20 via-blue-500/15 to-transparent border border-red-500/30 flex items-center justify-center text-red-400 flex-shrink-0 shadow-lg shadow-red-500/10">
            <Shield className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black font-racing uppercase tracking-wider text-white">
                Guardián de Garantía {distribuidorCorto}
              </h3>
            </div>
            <p className="text-[11px] text-neutral-400 font-mono uppercase tracking-wide">
              {distribuidor} • Tolerancia Estricta +/- {toleranciaKm} KM
            </p>
          </div>
        </div>

        {/* Badges de Cobertura & Estado */}
        <div className="flex flex-col sm:items-end gap-1.5 flex-shrink-0">
          <div className="px-2.5 py-0.5 rounded-lg bg-neutral-900/90 border border-neutral-700/80 text-[11px] font-mono font-bold text-neutral-300">
            {mesesGarantia} MESES / {kmGarantia >= 900000 ? "KM ILIMITADO" : `${kmGarantia.toLocaleString()} KM`}
          </div>
          <div className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider border ${badgeConfig.bg}`}>
            {badgeConfig.label}
          </div>
        </div>

      </div>

      {/* 2. Cuerpo Principal de la Próxima Revisión */}
      {nextRev ? (
        <div className="pt-4 space-y-4 relative z-10">
          
          {/* Título de la Revisión Obligatoria */}
          <div className="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
            <div>
              <h4 className="text-lg sm:text-xl font-black font-racing uppercase tracking-wider text-white">
                {nextRev.numero}ª REVISIÓN OBLIGATORIA ({nextRev.km.toLocaleString()} KM)
              </h4>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                {nextRev.descripcion}
              </p>
            </div>

            <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold whitespace-nowrap border flex-shrink-0 ${
              nextRev.manoDeObra === 'GRATIS'
                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                : "bg-blue-500/15 text-blue-300 border-blue-500/30"
            }`}>
              {nextRev.manoDeObra === 'GRATIS' ? 'GRATIS (MANO DE OBRA)' : `PAGADA (EST. ${nextRev.tiempoEstHoras}H)`}
            </span>
          </div>

          {/* Dos Cajas de Métricas: Distancia Restante & Tiempo Estimado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            
            {/* Caja Distancia */}
            <div className="p-4 rounded-2xl bg-[#070b13] border border-blue-900/30">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block font-bold">
                DISTANCIA RESTANTE
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-400 tracking-tight mt-1 flex items-baseline gap-1.5">
                <span>{distanciaRestante.toLocaleString()}</span>
                <span className="text-sm text-cyan-600 font-racing">KM</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-500 block mt-0.5">
                Meta: {nextRev.km.toLocaleString()} KM
              </span>
            </div>

            {/* Caja Tiempo */}
            <div className="p-4 rounded-2xl bg-[#070b13] border border-blue-900/30">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block font-bold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>TIEMPO ESTIMADO</span>
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 tracking-tight mt-1 flex items-baseline gap-1.5">
                <span>{diasRestantes}</span>
                <span className="text-sm text-emerald-600 font-racing">DÍAS</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-500 block mt-0.5">
                Aprox: {fechaEstimada}
              </span>
            </div>

          </div>

          {/* Barra de Ventana del Taller & Tolerancia */}
          <div className="p-4 rounded-2xl bg-[#070b13] border border-blue-900/30 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-neutral-400">Ventana Taller:</span>
                <strong className="text-white font-bold">
                  {ventanaMin.toLocaleString()} - {ventanaMax.toLocaleString()} KM
                </strong>
              </div>
              <div className="text-neutral-400 hidden sm:block">
                Ritmo: <strong className="text-cyan-400">{ritmoKmDia} km/día</strong>
              </div>
            </div>

            {/* Track de Progreso */}
            <div className="relative w-full bg-neutral-900 h-2.5 rounded-full overflow-hidden border border-neutral-800">
              <div 
                className={`h-full transition-all duration-700 ${
                  status === 'EN_RIESGO'
                    ? "bg-red-500"
                    : status === 'EN_VENTANA'
                    ? "bg-emerald-400 animate-pulse"
                    : "bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400"
                }`}
                style={{ width: `${currentProgress}%` }}
              />
            </div>

            {/* Indicadores de Tolerancia */}
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-neutral-500">{prevRevKm.toLocaleString()} KM</span>
              <span className="text-amber-400 font-bold">
                Tolerancia {distribuidorCorto}: +/- {toleranciaKm} KM
              </span>
              <span className="text-neutral-400 font-bold">{nextRev.km.toLocaleString()} KM</span>
            </div>
          </div>

          {/* Roadmap de Revisiones */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-400 uppercase tracking-wider font-bold text-[10px] sm:text-xs">
                ROADMAP DE {totalRevisiones} REVISIONES OBLIGATORIAS:
              </span>
              <span className="text-cyan-400 font-bold">
                {completadasCount} / {totalRevisiones} COMPLETADAS
              </span>
            </div>

            {/* Fila de Pills Horizontales */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
              {revisiones.map((rev) => {
                const isCompleted = completedNumbers.includes(rev.numero);
                const isCurrent = nextRev && rev.numero === nextRev.numero;
                const kmLabel = rev.km >= 1000 ? `${rev.km / 1000}k` : `${rev.km}`;

                return (
                  <button
                    key={rev.numero}
                    type="button"
                    onClick={() => {
                      if (onOpenRulesModal) onOpenRulesModal(rev.numero);
                    }}
                    title={`${rev.numero}ª Revisión (${rev.km.toLocaleString()} KM)`}
                    className={`px-3 py-2 rounded-xl font-mono text-xs font-bold transition flex flex-col items-center min-w-[58px] border ${
                      isCompleted
                        ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300"
                        : isCurrent
                        ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-400/50"
                        : "bg-neutral-900/60 border-neutral-800 text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    <span className="text-[10px]">{rev.numero}ª</span>
                    <span className="text-xs">{kmLabel}</span>
                    <span className="text-[9px] mt-0.5">
                      {isCompleted ? "✓" : isCurrent ? "●" : "·"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            
            <button
              type="button"
              onClick={() => onOpenRegisterRevisionModal(nextRev)}
              className="py-3 px-5 rounded-2xl font-black font-racing uppercase tracking-wider text-xs sm:text-sm bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 hover:from-cyan-400 hover:to-blue-400 text-black shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <Wrench className="w-4 h-4 text-black" />
              <span>REGISTRAR {nextRev.numero}ª REVISIÓN</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenRulesModal(nextRev?.numero)}
              className="py-3 px-5 rounded-2xl font-bold font-racing uppercase tracking-wider text-xs bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700/80 text-neutral-200 hover:text-white flex items-center justify-center gap-2 transition"
            >
              <FileText className="w-4 h-4 text-neutral-400" />
              <span>MANUAL, REGLAS & CHEQUEOS &gt;</span>
            </button>

          </div>

        </div>
      ) : (
        /* Garantía Completada al 100% */
        <div className="py-6 text-center space-y-3 relative z-10 animate-fadeIn">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold font-racing uppercase tracking-wider text-white">
            ¡Garantía Oficial Cumplida al 100%!
          </h4>
          <p className="text-xs text-neutral-400 font-mono max-w-md mx-auto">
            Todas las {totalRevisiones} revisiones obligatorias fueron selladas y registradas. Tu moto conserva su máximo valor de reventa con su Hoja de Vida certificada.
          </p>
          <button
            onClick={() => onOpenRulesModal()}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-racing font-bold transition"
          >
            Ver Historial Completo
          </button>
        </div>
      )}

    </div>
  );
}
