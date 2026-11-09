import React, { useState } from 'react';
import { 
  Radar, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  ExternalLink, 
  Wrench, 
  CheckCircle2, 
  Scale, 
  DollarSign, 
  RefreshCw,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  computeFinesRadarState, 
  verifyTrafficFinesBackend 
} from '../../../services/trafficFinesService';

export default function TrafficFinesRadarCard({
  bike = {},
  userProfile = null,
  onOpenFinesModal,
  onUpdateHojaDeVida
}) {
  const radar = computeFinesRadarState(bike, userProfile);
  const [isVerifying, setIsVerifying] = useState(false);

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
    ahorroPotencial,
    tiempoDesdeVerificacion,
    estadoGeneral
  } = radar;

  // Ejecutar verificación asistida en 1 clic (Opción A + C)
  const handleVerifyNow = async () => {
    setIsVerifying(true);
    try {
      const result = await verifyTrafficFinesBackend({
        countryCode,
        plate: placa,
        docNumber: docTitular,
        vin: bike?.hojaDeVida?.documentos?.vinChasis
      });

      const currentHoja = bike?.hojaDeVida || {};
      const currentMultas = currentHoja.multas || {};

      const nextMultas = {
        ...currentMultas,
        pais: countryCode,
        documentoTitular: docTitular,
        ultimaVerificacion: result.timestamp,
        alertasActivas: result.hasFines ? result.fines : (currentMultas.alertasActivas || [])
      };

      if (onUpdateHojaDeVida) {
        onUpdateHojaDeVida({
          ...currentHoja,
          multas: nextMultas
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsVerifying(false);
    }
  };

  // Simulación para probar alerta con 50% de descuento en vivo
  const handleToggleDemoFine = () => {
    const currentHoja = bike?.hojaDeVida || {};
    const currentMultas = currentHoja.multas || {};
    const hasActive = (currentMultas.alertasActivas || []).length > 0;

    let nextAlertas = [];
    if (!hasActive) {
      const limitDate = new Date();
      limitDate.setDate(limitDate.getDate() + 5);

      nextAlertas = [
        {
          id: `fine_${Date.now()}`,
          codigoInfraccion: "C29",
          descripcion: "Conducir a velocidad superior a la máxima permitida (Fotomulta por radar)",
          fechaComparendo: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          lugar: "Autopista Norte Km 14 - Cámara Salvavidas 04",
          entidadTransito: "Secretaría de Movilidad",
          valorOriginal: 650000,
          valorConDescuento: 325000,
          porcentajeDescuento: 50,
          fechaLimiteDescuento: limitDate.toISOString().slice(0, 10),
          diasRestantesDescuento: 5,
          estado: "PENDIENTE_PAGO",
          cursoPedagogicoRequerido: true,
          enlaceOficialPago: portal.portalUrl
        }
      ];
    }

    if (onUpdateHojaDeVida) {
      onUpdateHojaDeVida({
        ...currentHoja,
        multas: {
          ...currentMultas,
          ultimaVerificacion: new Date().toISOString(),
          alertasActivas: nextAlertas
        }
      });
    }
  };

  const handleOpenOfficialSite = () => {
    window.open(portal.portalUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={`rounded-3xl p-4 sm:p-5 border transition-all relative overflow-hidden shadow-2xl ${
      tieneMultas
        ? "bg-gradient-to-b from-[#180808] via-[#0d0404] to-black border-red-500/80 shadow-red-500/20"
        : "bg-[#090e1a] border-blue-900/40 shadow-blue-500/5"
    }`}>
      
      {/* Resplandor Neón Superior */}
      <div className={`absolute top-0 right-0 w-72 h-28 blur-[90px] pointer-events-none ${
        tieneMultas ? "bg-red-500/15" : "bg-cyan-500/10"
      }`} />

      {/* Header del Radar */}
      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3 mb-3.5 gap-2 flex-wrap sm:flex-nowrap relative z-10">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border flex-shrink-0 shadow-inner ${
            tieneMultas
              ? "bg-red-500/20 text-red-400 border-red-500/40"
              : "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
          }`}>
            <Radar className={`w-5 h-5 ${isVerifying ? "animate-spin" : ""}`} />
          </div>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-racing font-black text-xs text-white uppercase tracking-wider">
                RADAR LEGAL DE FOTOMULTAS & COMPARENDOS
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-700">
                {portal.bandera} {portal.entidadCorta}
              </span>
            </div>
            <div className="text-[10px] font-mono text-neutral-400">
              Placa: <strong className="text-white">{placa}</strong> • Consulta con Cédula / VIN oficial
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="shrink-0">
          {tieneMultas ? (
            <span className="px-2.5 py-1 rounded-full bg-red-600 text-white font-mono font-black text-[10px] tracking-wider uppercase flex items-center gap-1 animate-pulse shadow-md shadow-red-500/30">
              <AlertTriangle className="w-3 h-3" />
              ¡{totalMultas} FOTOMULTA PENDIENTE!
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-mono font-bold text-[10px] tracking-wider uppercase flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              ● AL DÍA (SIN COMPARENDOS)
            </span>
          )}
        </div>
      </div>

      {/* Cuerpo Principal del Radar */}
      {tieneMultas && multaUrgente ? (
        /* VISTA: INFRACCIÓN DETECTADA CON ALERTA DE 50% DE DESCUENTO */
        <div className="space-y-3.5 relative z-10 animate-fadeIn">
          
          <div className="p-3.5 sm:p-4 rounded-2xl bg-black/60 border border-red-500/40 space-y-2">
            <div className="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-bold block flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Infracción {multaUrgente.codigoInfraccion}
                </span>
                <h4 className="text-sm sm:text-base font-bold text-white font-racing mt-0.5">
                  {multaUrgente.descripcion}
                </h4>
                <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                  Lugar: {multaUrgente.lugar} • Fecha: {multaUrgente.fechaComparendo}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold uppercase block">
                  {multaUrgente.porcentajeDescuento}% DESCUENTO LEY
                </span>
              </div>
            </div>

            {/* Caja de Descuento & Cronómetro */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-neutral-800">
              
              {/* Cronómetro Días Restantes */}
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-red-300 block uppercase font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-red-400" /> Vence Descuento:
                  </span>
                  <div className="text-2xl font-black font-racing text-red-400 tracking-tight mt-0.5">
                    {multaUrgente.diasRestantesDescuento} DÍAS
                  </div>
                  <span className="text-[9px] font-mono text-neutral-400">
                    Límite: {multaUrgente.fechaLimiteDescuento}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-mono text-neutral-400 block">Ahorro:</span>
                  <span className="text-sm font-bold font-mono text-emerald-400">
                    -${(multaUrgente.valorOriginal - multaUrgente.valorConDescuento).toLocaleString()} {portal.moneda}
                  </span>
                </div>
              </div>

              {/* Valores Comparativos */}
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-neutral-500 block uppercase">Valor Pleno:</span>
                  <span className="text-xs font-mono text-neutral-400 line-through">
                    ${multaUrgente.valorOriginal.toLocaleString()} {portal.moneda}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 block uppercase font-bold mt-1">Con Descuento 50%:</span>
                  <span className="text-base font-black font-mono text-emerald-300">
                    ${multaUrgente.valorConDescuento.toLocaleString()} {portal.moneda}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Curso 2h
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Botones de Acción de Infracción */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={handleOpenOfficialSite}
              className="py-2.5 px-3 rounded-xl text-xs font-racing font-bold uppercase bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>PAGAR CON 50%</span>
              <ExternalLink className="w-3 h-3" />
            </button>

            <button
              onClick={() => onOpenFinesModal('impugnacion')}
              className="py-2.5 px-3 rounded-xl text-xs font-mono font-bold bg-neutral-900 hover:bg-neutral-800 border border-amber-500/40 text-amber-300 flex items-center justify-center gap-1.5 transition"
            >
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              <span>GUÍA IMPUGNAR</span>
            </button>

            <button
              onClick={handleToggleDemoFine}
              className="py-2.5 px-3 rounded-xl text-xs font-mono text-neutral-400 hover:text-white bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 flex items-center justify-center gap-1 transition"
              title="Resolver o retirar comparendo"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Marcar Pagada</span>
            </button>
          </div>

        </div>
      ) : (
        /* VISTA: TODO AL DÍA (RADAR LIMPIO) */
        <div className="space-y-3 relative z-10 animate-fadeIn">
          
          <div className="p-3 rounded-2xl bg-black/40 border border-neutral-800 flex items-center justify-between flex-wrap sm:flex-nowrap gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-xs font-mono">
                <span className="font-bold text-neutral-200 block">
                  Sin fotomultas ni sanciones vigentes registradas
                </span>
                <span className="text-[11px] text-neutral-500">
                  Verificación automática: <strong className="text-neutral-400">{tiempoDesdeVerificacion}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleVerifyNow}
                disabled={isVerifying}
                className="py-1.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? "animate-spin text-cyan-400" : ""}`} />
                <span>{isVerifying ? "Verificando..." : "Verificar Ahora"}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenOfficialSite}
                className="py-1.5 px-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white text-xs font-mono flex items-center gap-1 transition"
                title={`Ir a portal oficial ${portal.entidadCorta}`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 px-1 pt-0.5">
            <span>Ley 769 / DGT: Alerta activa para 50% de descuento</span>
            <button
              onClick={handleToggleDemoFine}
              className="text-neutral-600 hover:text-amber-400 transition underline text-[10px]"
            >
              [Simular Fotomulta de Prueba]
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
