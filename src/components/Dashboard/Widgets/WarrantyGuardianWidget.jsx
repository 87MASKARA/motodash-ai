import React from 'react';
import { 
  ShieldCheck, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Wrench, 
  BookOpen, 
  ChevronRight,
  Award,
  Sparkles
} from 'lucide-react';
import { computeWarrantyState } from '../../../services/warrantyCatalog';

export default function WarrantyGuardianWidget({
  bike = {},
  currentOdometer = 0,
  onOpenRulesModal,
  onOpenRegisterRevisionModal
}) {
  const warranty = computeWarrantyState(bike, currentOdometer);

  if (!warranty.isEnabled) {
    return (
      <div className="bg-[#0b101b] border border-neutral-800/80 rounded-3xl p-4 sm:p-5 text-neutral-400 font-mono text-xs flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-neutral-200 font-bold block text-sm">Garantía de Fábrica Inactiva</span>
            <span className="text-[11px] text-neutral-500">Modo mantenimiento preventivo libre activo en el Cockpit</span>
          </div>
        </div>
        <button
          onClick={onOpenRulesModal}
          className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-racing font-bold transition"
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
    isPeligroVencida,
    isEnVentana,
    distanciaRestante,
    diasRestantes,
    fechaEstimada,
    ventanaMin,
    ventanaMax
  } = warranty;

  if (status === "COMPLETADA" || !nextRev) {
    return (
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950/70 via-neutral-900 to-neutral-950 border border-emerald-500/40 p-5 sm:p-6 shadow-2xl text-center">
        <div className="flex items-center justify-center gap-2 text-emerald-400 mb-1.5">
          <Award className="w-6 h-6" />
          <h4 className="font-racing font-black text-sm sm:text-base uppercase tracking-wider text-white">
            CICLO OFICIAL DE GARANTÍA CUMPLIDO
          </h4>
        </div>
        <p className="text-xs font-mono text-neutral-300 max-w-lg mx-auto">
          Has completado las {totalRevisiones} revisiones oficiales con respaldo de {distribuidorCorto}. Tu moto conserva su máximo valor de reventa con su Hoja de Vida oficial.
        </p>
        <button
          onClick={() => onOpenRulesModal()}
          className="mt-3.5 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-racing font-bold text-xs transition"
        >
          Ver Historial de Revisiones
        </button>
      </div>
    );
  }

  // Progreso en el tramo actual
  const prevKm = nextRev.numero === 1 ? 0 : (revisiones[nextRev.numero - 2]?.km || 0);
  const totalRango = Math.max(1, nextRev.km - prevKm);
  const recorridoEnTramo = Math.max(0, currentOdometer - prevKm);
  const porcentajeProgreso = Math.min(100, Math.max(4, Math.round((recorridoEnTramo / totalRango) * 100)));

  // Badges y bordes dinámicos por severidad
  let cardBorder = "border-blue-900/40";
  let statusBadge = (
    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono font-medium text-[10px] tracking-wider uppercase">
      PROGRAMADA
    </span>
  );

  if (isPeligroVencida) {
    cardBorder = "border-2 border-red-500 shadow-2xl shadow-red-500/30 animate-pulse";
    statusBadge = (
      <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-mono font-black text-[10px] tracking-wider uppercase flex items-center gap-1 animate-pulse">
        <AlertTriangle className="w-3 h-3" />
        ¡RIESGO PÉRDIDA DE GARANTÍA!
      </span>
    );
  } else if (isEnVentana) {
    cardBorder = "border-2 border-amber-500 shadow-2xl shadow-amber-500/30";
    statusBadge = (
      <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono font-black text-[10px] tracking-wider uppercase flex items-center gap-1">
        <Clock className="w-3 h-3 animate-spin" />
        ¡LLEVAR AL TALLER AHORA! (+/- {toleranciaKm} KM)
      </span>
    );
  } else if (status === "URGENTE") {
    cardBorder = "border-amber-500/50 shadow-lg shadow-amber-500/10";
    statusBadge = (
      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold text-[10px] tracking-wider uppercase">
        ⏰ PRÓXIMA EN &lt; 3 DÍAS
      </span>
    );
  }

  const isManoGratis = nextRev.manoDeObra === "GRATIS";

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-[#080d19] border ${cardBorder} p-4 sm:p-5 shadow-2xl transition-all`}>
      
      {/* Luz Ambiental de Fondo Neón */}
      <div className="absolute top-0 right-0 w-80 h-32 bg-cyan-500/10 blur-[100px] pointer-events-none" />

      {/* 1. Header Oficial del Guardián */}
      <div className="flex items-center justify-between border-b border-blue-950/80 pb-3 mb-3.5 gap-2 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center shadow-inner flex-shrink-0">
            <ShieldCheck className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-racing font-black text-xs text-white uppercase tracking-wider">
                GUARDIÁN DE GARANTÍA {distribuidorCorto.toUpperCase()}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {mesesGarantia} MESES / {kmGarantia >= 900000 ? "KM ILIMITADO" : `${kmGarantia.toLocaleString()} KM`}
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              {distribuidor} • TOLERANCIA ESTRICTA +/- {toleranciaKm} KM
            </div>
          </div>
        </div>

        <div className="shrink-0">{statusBadge}</div>
      </div>

      {/* 2. Hero Card: Título de la Revisión & Badge de Gratuidad */}
      <div className="bg-[#050811] rounded-2xl border border-slate-800/80 p-3.5 sm:p-4 mb-3.5">
        <div className="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
          <div>
            <h3 className="font-racing font-black text-base sm:text-lg text-white">
              {nextRev.numero}ª REVISIÓN OBLIGATORIA ({nextRev.km.toLocaleString()} KM)
            </h3>
            <p className="text-[11px] font-mono text-slate-300 mt-0.5">
              {nextRev.descripcion}
            </p>
          </div>

          <div className="shrink-0 text-right">
            {isManoGratis ? (
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono font-black uppercase tracking-wider block shadow-sm shadow-emerald-500/20">
                ✨ MANO DE OBRA GRATIS
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono font-bold uppercase tracking-wider block">
                PAGADA (EST. {nextRev.tiempoEstHoras || 2}H)
              </span>
            )}
          </div>
        </div>

        {/* Dual Countdown: Kilómetros & Días */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 pt-3 border-t border-slate-800">
          
          {/* Distancia Restante */}
          <div className="p-3 rounded-xl bg-[#090e1c] border border-slate-800/80">
            <span className="text-[10px] font-mono text-slate-400 uppercase block mb-0.5 font-bold">
              DISTANCIA RESTANTE
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className={`font-racing font-black text-2xl sm:text-3xl tracking-tight ${
                isPeligroVencida 
                  ? "text-red-400" 
                  : isEnVentana 
                  ? "text-amber-400" 
                  : "text-white"
              }`}>
                {isPeligroVencida ? `+${(currentOdometer - nextRev.km).toLocaleString()}` : distanciaRestante.toLocaleString()}
              </span>
              <span className="text-xs font-mono font-bold text-cyan-400">KM</span>
            </div>
            <span className="text-[9px] font-mono text-slate-500 block mt-0.5">
              {isPeligroVencida ? "¡Excedido del punto oficial!" : `Meta: ${nextRev.km.toLocaleString()} KM`}
            </span>
          </div>

          {/* Días Estimados Restantes */}
          <div className="p-3 rounded-xl bg-[#090e1c] border border-slate-800/80">
            <span className="text-[10px] font-mono text-slate-400 uppercase block mb-0.5 font-bold flex items-center gap-1">
              <Calendar className="w-3 h-3 text-cyan-400" />
              <span>TIEMPO ESTIMADO</span>
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className={`font-racing font-black text-2xl sm:text-3xl tracking-tight ${
                isPeligroVencida 
                  ? "text-red-400" 
                  : isEnVentana 
                  ? "text-amber-400" 
                  : "text-emerald-400"
              }`}>
                {isPeligroVencida ? "0" : diasRestantes}
              </span>
              <span className="text-xs font-mono font-bold text-slate-300">
                {diasRestantes === 1 ? "DÍA" : "DÍAS"}
              </span>
            </div>
            <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
              {isPeligroVencida ? "¡Venció la tolerancia de días!" : `Aprox: ${fechaEstimada || "próximamente"}`}
            </span>
          </div>

        </div>

        {/* Ventana de Tolerancia Bar */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80">
          <div className="flex justify-between items-center text-[10px] font-mono mb-1">
            <span className="text-slate-400">
              Ventana Taller: <strong className="text-white">{ventanaMin.toLocaleString()} - {ventanaMax.toLocaleString()} KM</strong>
            </span>
            <span className="text-slate-400">
              Ritmo: <strong className="text-cyan-400">{ritmoKmDia} km/día</strong>
            </span>
          </div>

          {/* Progress bar towards window */}
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isPeligroVencida 
                  ? "bg-red-500 animate-pulse" 
                  : isEnVentana 
                  ? "bg-amber-400 animate-pulse" 
                  : "bg-gradient-to-r from-cyan-500 to-emerald-400"
              }`}
              style={{ width: `${porcentajeProgreso}%` }}
            />
          </div>

          <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
            <span>{prevKm.toLocaleString()} KM</span>
            <span className="text-amber-400 font-bold">Tolerancia {distribuidorCorto}: +/- {toleranciaKm} KM</span>
            <span>{nextRev.km.toLocaleString()} KM</span>
          </div>
        </div>

      </div>

      {/* 3. Mini Roadmap Visual: Stepper Cuadriculado Exacto */}
      <div className="mb-3.5">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5 px-1">
          <span>ROADMAP DE {totalRevisiones} REVISIONES OBLIGATORIAS:</span>
          <span className="text-cyan-400 font-bold">{completadasCount} / {totalRevisiones} COMPLETADAS</span>
        </div>
        
        <div className={`grid gap-1.5 ${
          totalRevisiones === 8 ? "grid-cols-4 sm:grid-cols-8" :
          totalRevisiones === 6 ? "grid-cols-3 sm:grid-cols-6" :
          totalRevisiones === 5 ? "grid-cols-5" :
          totalRevisiones === 4 ? "grid-cols-4" : "grid-cols-4 sm:grid-cols-8"
        }`}>
          {revisiones.map((rev) => {
            const isCurrent = rev.numero === nextRev.numero;
            const isDone = completedNumbers.includes(rev.numero);
            const kmLabel = rev.km >= 1000 ? `${rev.km / 1000}k` : rev.km;

            return (
              <button
                key={rev.numero}
                type="button"
                onClick={() => onOpenRulesModal(rev.numero)}
                title={`${rev.numero}ª Rev (${rev.km.toLocaleString()} KM) - ${rev.manoDeObra === 'GRATIS' ? 'M.O Gratis' : 'Pagada'}`}
                className={`p-1.5 sm:p-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center ${
                  isDone
                    ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-400"
                    : isCurrent
                    ? isPeligroVencida
                      ? "bg-red-950 border-red-500 text-red-300 animate-pulse ring-1 ring-red-400"
                      : isEnVentana
                      ? "bg-amber-950 border-amber-500 text-amber-300 animate-pulse ring-1 ring-amber-400"
                      : "bg-cyan-500/20 border-cyan-400 text-white font-bold shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400"
                    : "bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-300"
                }`}
              >
                <span className="text-[10px] font-mono font-black block leading-none">
                  {rev.numero}ª
                </span>
                <span className="text-[9px] font-mono block mt-1 leading-none">
                  {kmLabel}
                </span>
                {rev.manoDeObra === "GRATIS" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shadow-sm shadow-emerald-400/50" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        <button
          type="button"
          onClick={() => onOpenRegisterRevisionModal(nextRev)}
          className={`py-3 px-4 rounded-2xl text-xs font-racing font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
            isEnVentana || isPeligroVencida
              ? "bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-white shadow-red-500/30 hover:opacity-95"
              : "bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 text-black shadow-cyan-500/20 hover:opacity-95"
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>REGISTRAR {nextRev.numero}ª REVISIÓN</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenRulesModal(nextRev?.numero)}
          className="py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
        >
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>MANUAL, REGLAS & CHEQUEOS</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

    </div>
  );
}
