import React, { useState, useEffect } from 'react';
import { Settings, X, Check, RotateCcw, Trash2 } from 'lucide-react';
import { COMPONENTES_DESGASTE_OFICIALES } from '../../services/maintenanceCatalog';
import { BrandLogo } from '../Common/BrandLogos';

export default function EditComponentModal({
  isOpen,
  onClose,
  component,
  currentOdometer,
  onSaveComponent,
  onDeleteComponent,
  bikeName
}) {
  const [label, setLabel] = useState("");
  const [intervalo, setIntervalo] = useState(4000);
  const [ultimoCambioKm, setUltimoCambioKm] = useState(0);
  const [alertaKm, setAlertaKm] = useState(300);
  const [especificacion, setEspecificacion] = useState("");
  const [categoria, setCategoria] = useState("motor");
  const [costo, setCosto] = useState(0);

  useEffect(() => {
    if (component) {
      setLabel(component.label || "");
      setIntervalo(component.intervalo || 4000);
      setUltimoCambioKm(component.ultimoCambioKm || 0);
      setAlertaKm(component.alertaPreventivaKm || 300);
      setEspecificacion(component.especificacion || "");
      setCategoria(component.categoria || "motor");
      setCosto(component.costoSugerido || 0);
    } else {
      // Nuevo componente personalizado
      setLabel("");
      setIntervalo(5000);
      setUltimoCambioKm(currentOdometer || 0);
      setAlertaKm(500);
      setEspecificacion("");
      setCategoria("motor");
      setCosto(0);
    }
  }, [component, currentOdometer, isOpen]);

  if (!isOpen) return null;

  // Cálculo en vivo de cómo quedará el ciclo
  const kmDesdeUltimo = Math.max(0, currentOdometer - ultimoCambioKm);
  const kmRestantesCalculados = Math.max(0, intervalo - kmDesdeUltimo);
  const vidaCalculada = Math.max(0, Math.min(100, Math.round((kmRestantesCalculados / intervalo) * 100)));

  // Restaurar valores recomendados de fábrica
  const handleRestoreOEM = () => {
    if (component && COMPONENTES_DESGASTE_OFICIALES[component.id]) {
      const oem = COMPONENTES_DESGASTE_OFICIALES[component.id];
      setIntervalo(oem.intervalo);
      setAlertaKm(oem.alertaPreventivaKm);
      setEspecificacion(oem.especificacion);
      setCosto(oem.costoSugerido);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!label.trim()) return alert("El nombre del componente es obligatorio");
    if (intervalo <= 0) return alert("El intervalo debe ser mayor a 0 km");

    const payload = {
      id: component?.id || `custom_${Date.now()}`,
      label: label.trim(),
      intervalo: Number(intervalo),
      ultimoCambioKm: Number(ultimoCambioKm),
      alertaPreventivaKm: Number(alertaKm),
      especificacion: especificacion.trim(),
      categoria,
      costoSugerido: Number(costo),
      isCustom: component ? component.isCustom : true
    };

    onSaveComponent(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-10 h-10 rounded-xl bg-neutral-950 border p-1.5 flex items-center justify-center shadow-lg flex-shrink-0"
              style={{ borderColor: "var(--primary-accent)" }}
            >
              <BrandLogo brand={(bikeName || "").split(" ")[0]} className="w-full h-full" />
            </div>
            <div>
              <h3 className="text-base font-bold font-racing uppercase tracking-wider text-white">
                {component ? "Calibrar Intervalo de la Parte" : "Añadir Nueva Parte a Tu Moto"}
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono">
                {bikeName} • Personaliza los kilómetros según el manual de tu moto
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Previsualización en Vivo de Vida Útil */}
        <div className="my-4 p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-neutral-400 uppercase block">Vida Restante Calculada</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-telemetry text-amber-400">
                {kmRestantesCalculados.toLocaleString()} km
              </span>
              <span className="text-xs text-neutral-400 font-mono font-bold">
                ({vidaCalculada}%)
              </span>
            </div>
          </div>

          <div className="text-right text-[11px] font-mono text-neutral-500">
            <span>Odómetro actual:</span>
            <strong className="text-neutral-200 block">{currentOdometer.toLocaleString()} km</strong>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre del Componente */}
          <div>
            <label className="text-xs font-mono text-neutral-300 block mb-1">
              Nombre de la Parte / Repuesto
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ej: Aceite Motor, Pastillas Delanteras, Cadena..."
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-sans"
              required
            />
          </div>

          {/* Intervalo & Último Cambio */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-neutral-300 block mb-1">
                Intervalo de Cambio (KM)
              </label>
              <input
                type="number"
                value={intervalo}
                onChange={(e) => setIntervalo(e.target.value)}
                min="100"
                step="100"
                placeholder="Ej: 3000, 5000, 15000"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono font-bold"
                required
              />
              <span className="text-[10px] text-neutral-500 block mt-1">Cada cuántos km cambiar</span>
            </div>

            <div>
              <label className="text-xs font-mono text-neutral-300 block mb-1">
                Último Cambio a los (KM)
              </label>
              <input
                type="number"
                value={ultimoCambioKm}
                onChange={(e) => setUltimoCambioKm(e.target.value)}
                min="0"
                step="100"
                placeholder="Ej: 12000"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono font-bold"
              />
              <span className="text-[10px] text-neutral-500 block mt-1">En qué km lo pusiste nuevo</span>
            </div>
          </div>

          {/* Alerta Preventiva & Categoría */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-neutral-300 block mb-1">
                Avisar con Anticipación (KM)
              </label>
              <input
                type="number"
                value={alertaKm}
                onChange={(e) => setAlertaKm(e.target.value)}
                min="50"
                step="50"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
              <span className="text-[10px] text-neutral-500 block mt-1">Margen de alerta previa</span>
            </div>

            <div>
              <label className="text-xs font-mono text-neutral-300 block mb-1">
                Categoría
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-sans"
              >
                <option value="motor">Motor & Filtros</option>
                <option value="frenos">Frenos & Suspensión</option>
                <option value="transmision">Transmisión & Cadena</option>
                <option value="llantas">Llantas & Neumáticos</option>
              </select>
            </div>
          </div>

          {/* Especificación de Manual o Marca */}
          <div>
            <label className="text-xs font-mono text-neutral-300 block mb-1">
              Especificación / Referencia Técnica
            </label>
            <input
              type="text"
              value={especificacion}
              onChange={(e) => setEspecificacion(e.target.value)}
              placeholder="Ej: 10W-40 JASO MA2, Presión 28/32 psi, Holgura 20mm..."
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-sans"
            />
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-800 gap-2">
            {/* Restaurar valores oficiales OEM si es una pieza original */}
            {component && !component.isCustom ? (
              <button
                type="button"
                onClick={handleRestoreOEM}
                className="text-xs text-neutral-400 hover:text-amber-400 font-mono flex items-center gap-1 transition"
                title="Restaurar valores predeterminados de fábrica"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Manual OEM</span>
              </button>
            ) : component?.isCustom ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm("¿Deseas eliminar este componente personalizado?")) {
                    onDeleteComponent(component.id);
                    onClose();
                  }
                }}
                className="text-xs text-red-400 hover:text-red-300 font-mono flex items-center gap-1 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar Pieza</span>
              </button>
            ) : <div />}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl font-bold font-racing text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl font-bold font-racing text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/20 hover:opacity-90 transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Calibración</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

