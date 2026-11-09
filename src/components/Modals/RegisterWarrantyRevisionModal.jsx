import React, { useState } from 'react';
import { Wrench, Calendar, Gauge, DollarSign, FileText, CheckCircle2, X, Shield } from 'lucide-react';

export default function RegisterWarrantyRevisionModal({
  isOpen,
  onClose,
  revision,
  currentOdometer,
  distribuidor,
  currency = 'COP',
  onConfirmRevision
}) {
  const [km, setKm] = useState(currentOdometer || revision?.km || 10000);
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [taller, setTaller] = useState(distribuidor || "Taller Autorizado");
  const [costo, setCosto] = useState(revision?.manoDeObra === 'GRATIS' ? 0 : 65000);
  const [repuestos, setRepuestos] = useState(
    revision?.numero === 1
      ? "Aceite oficial de rodaje y filtro de aceite"
      : revision?.numero === 2
      ? "Aceite oficial y filtro de aire"
      : "Aceite sintético, bujía, filtro de aire y cauchos de arrastre"
  );
  const [notas, setNotas] = useState(`Sellado y validación de la ${revision?.numero || 1}ª Revisión Obligatoria en sistema oficial.`);

  if (!isOpen || !revision) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onConfirmRevision) {
      onConfirmRevision({
        revisionNumero: revision.numero,
        revisionKm: revision.km,
        kmReal: Number(km) || revision.km,
        fecha,
        taller,
        costo: Number(costo) || 0,
        repuestos,
        notas,
        servicioTitulo: `${revision.numero}ª Revisión Obligatoria de Garantía (${revision.km.toLocaleString()} KM)`
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative text-white my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-racing uppercase tracking-wider text-white">
                Registrar {revision.numero}ª Revisión
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono">
                Meta oficial: {revision.km.toLocaleString()} KM • {distribuidor}
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

        {/* Tarjeta Informativa de la Revisión */}
        <div className="my-4 p-3.5 rounded-2xl bg-neutral-950 border border-cyan-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block flex items-center gap-1">
              <Shield className="w-3 h-3" /> Certificación de Fábrica
            </span>
            <div className="text-xs font-bold text-white mt-0.5">
              {revision.descripcion}
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold whitespace-nowrap border ${
            revision.manoDeObra === 'GRATIS'
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              : "bg-blue-500/20 text-blue-300 border-blue-500/40"
          }`}>
            Mano de Obra: {revision.manoDeObra}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 font-mono text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-neutral-400 block mb-1 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                <span>KM al Ingresar:</span>
              </label>
              <input
                type="number"
                value={km}
                onChange={(e) => setKm(e.target.value)}
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-bold text-xs focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-neutral-400 block mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Fecha del Servicio:</span>
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-neutral-400 block mb-1">Taller Autorizado / Concesionario:</label>
            <input
              type="text"
              value={taller}
              onChange={(e) => setTaller(e.target.value)}
              required
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-sans text-xs focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-neutral-400 block mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Costo ({currency}):</span>
              </label>
              <input
                type="number"
                value={costo}
                onChange={(e) => setCosto(e.target.value)}
                min="0"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-neutral-400 block mb-1">Repuestos Utilizados:</label>
              <input
                type="text"
                value={repuestos}
                onChange={(e) => setRepuestos(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-sans text-xs focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-neutral-400 block mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-neutral-400" />
              <span>Notas & Observaciones del Taller:</span>
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows="2"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white font-sans text-xs focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl font-bold font-racing uppercase tracking-wider text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition"
            >
              <CheckCircle2 className="w-4 h-4 text-black" />
              <span>Validar & Sellar Revisión</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
