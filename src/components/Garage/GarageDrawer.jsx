import React from 'react';
import { Bike, Plus, Trash2, X } from 'lucide-react';
import { BrandLogo } from '../Common/BrandLogos';

export default function GarageDrawer({ 
  garage, 
  activeBikeId, 
  onSelectBike, 
  onAddNewBike, 
  onDeleteBike, 
  onCleanDemoBikes,
  onClose 
}) {
  const hasDemoBikes = garage.some(b => 
    ["bike_yamaha_mt09", "bike_ktm_duke390", "bike_kawasaki_zx6r", "bike_ducati_panigale", "bike_bmw_s1000rr"].includes(b.id)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
      <div className="bg-neutral-900 border-l border-neutral-800 w-full max-w-sm h-full p-6 flex flex-col shadow-2xl relative text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <img src="/logo-emblem.png" alt="MotoDash AI" className="h-7 w-auto object-contain" />
            <h2 className="text-lg font-bold font-racing uppercase tracking-wider">
              Mi Garaje Digital ({garage.length})
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-neutral-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-neutral-400 my-3">
          Alterna rápidamente entre tus motos. Cada una guarda su tacómetro, colores e historial oficial.
        </p>

        {/* Botón rápido para limpiar motos demo si existen */}
        {hasDemoBikes && (
          <div className="mb-3">
            <button
              type="button"
              onClick={() => {
                if (window.confirm("¿Deseas remover todas las motos demo de prueba y dejar únicamente tus motos registradas?")) {
                  if (onCleanDemoBikes) onCleanDemoBikes();
                }
              }}
              className="w-full py-2 px-3 rounded-xl text-xs font-mono font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <span>🧹 Remover motos demo de prueba</span>
            </button>
          </div>
        )}

        {/* Lista de Motos en el Garaje */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {garage.map((item) => {
            const isActive = item.id === activeBikeId;
            const { bikeIdentity, telemetrySpecs } = item.config;

            return (
              <div 
                key={item.id}
                onClick={() => onSelectBike(item.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isActive 
                    ? "bg-neutral-800/90 border-amber-500/80 shadow-lg ring-1 ring-amber-500/40" 
                    : "bg-neutral-800/40 border-neutral-700/60 hover:bg-neutral-800 hover:border-neutral-600"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {/* Logo Oficial de la Marca */}
                    <div 
                      className="w-10 h-10 rounded-xl bg-neutral-950 border p-1.5 shadow-md flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: bikeIdentity.colorHex }}
                    >
                      <BrandLogo
                        brand={bikeIdentity.brand}
                        accentColor={bikeIdentity.colorHex}
                        className="w-full h-full"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold font-racing uppercase text-white leading-tight">
                        {bikeIdentity.brand} {bikeIdentity.model}
                      </h4>
                      <span className="text-[10px] text-neutral-400 font-mono flex items-center gap-1.5 mt-0.5">
                        <span
                          className="w-2 h-2 rounded-full inline-block"
                          style={{ backgroundColor: bikeIdentity.colorHex }}
                        />
                        <span>{bikeIdentity.year} • {telemetrySpecs.engineCc}cc</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isActive && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                        ACTIVA
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (garage.length <= 1) {
                          alert("Debes tener al menos 1 moto en tu garaje. Puedes calibrar una nueva antes de eliminar esta.");
                          return;
                        }
                        if (window.confirm(`¿Eliminar ${bikeIdentity.brand} ${bikeIdentity.model} (${item.hojaDeVida?.documentos?.placa || item.id}) de tu garaje?`)) {
                          onDeleteBike(item.id);
                        }
                      }}
                      className="text-neutral-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-neutral-800 transition"
                      title="Eliminar de mi garaje"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-neutral-400 pt-2 border-t border-neutral-700/40 font-mono">
                  <span>Placa: <strong className="text-neutral-200">{item.hojaDeVida?.documentos?.placa || "SIN PLACA"}</strong></span>
                  <span>{telemetrySpecs.engineCc}cc • {telemetrySpecs.redlineRpm.toLocaleString()} RPM</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Botón Agregar Nueva Moto */}
        <div className="pt-4 border-t border-neutral-800">
          <button
            onClick={onAddNewBike}
            className="w-full py-3 px-4 rounded-xl font-bold font-racing uppercase tracking-wider text-xs bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 flex items-center justify-center gap-2 transition"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Calibrar Nueva Moto con IA</span>
          </button>
        </div>
      </div>
    </div>
  );
}

