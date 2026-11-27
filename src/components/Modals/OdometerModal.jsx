import React, { useState, useEffect, useRef } from 'react';
import { Gauge, Fuel, Wrench, X, Check, Globe2, Camera, CheckCircle2 } from 'lucide-react';
import { COMPONENTES_DESGASTE_OFICIALES } from '../../services/maintenanceCatalog';
import { BrandLogo } from '../Common/BrandLogos';
import { scanTftClusterPhotoWithAi } from '../../services/hardwareBridgeService';
import {
  COUNTRY_FUEL_UNITS,
  getCountryFuelConfig,
  gallonsToLiters,
  litersToGallons
} from '../../services/fuelUnitsService';

export default function OdometerModal({
  isOpen,
  onClose,
  currentKm,
  initialComponentKey,
  onSaveOdometer,
  bikeName,
  bike = null,
  userProfile = null,
  currency = 'COP'
}) {
  const defaultFuelCfg = getCountryFuelConfig({ bike, userProfile, currency });

  const [kmInput, setKmInput] = useState(currentKm || 0);
  const [recordType, setRecordType] = useState(initialComponentKey ? 'service' : 'quick_km');
  const [selectedCountry, setSelectedCountry] = useState(defaultFuelCfg.country);
  const [fuelUnit, setFuelUnit] = useState(defaultFuelCfg.unit); // 'gal' | 'L'
  const [isScanningPhoto, setIsScanningPhoto] = useState(false);
  const [scannedClusterData, setScannedClusterData] = useState(null);
  const photoInputRef = useRef(null);

  // Campos de Tanqueo (en Galones para Colombia/Perú/Ecuador/EE.UU./Centroamérica, o Litros para México/España/Chile/Argentina/Brasil)
  const [fuelAmount, setFuelAmount] = useState(defaultFuelCfg.defaultRefuelAmount);
  const [fuelCost, setFuelCost] = useState(defaultFuelCfg.defaultRefuelCost);
  const [isFullTank, setIsFullTank] = useState(true);

  // Campos de Mantenimiento / Taller
  const [selectedComponentKey, setSelectedComponentKey] = useState(initialComponentKey || "aceite_motor");
  const [sparePartBrand, setSparePartBrand] = useState("");
  const [workshopName, setWorkshopName] = useState("");
  const [serviceCost, setServiceCost] = useState(
    COMPONENTES_DESGASTE_OFICIALES[initialComponentKey]?.costoSugerido || 85000
  );
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setKmInput(currentKm || 0);
    const cfg = getCountryFuelConfig({ bike, userProfile, currency });
    setSelectedCountry(cfg.country);
    setFuelUnit(cfg.unit);
    setFuelAmount(cfg.defaultRefuelAmount);
    setFuelCost(cfg.defaultRefuelCost);

    if (initialComponentKey === 'fuel') {
      setRecordType('fuel');
    } else if (initialComponentKey === 'service') {
      setRecordType('service');
    } else if (typeof initialComponentKey === 'string' && COMPONENTES_DESGASTE_OFICIALES[initialComponentKey]) {
      setRecordType('service');
      setSelectedComponentKey(initialComponentKey);
      setServiceCost(COMPONENTES_DESGASTE_OFICIALES[initialComponentKey].costoSugerido);
    } else {
      setRecordType('quick_km');
    }
  }, [currentKm, initialComponentKey, isOpen]);

  const handleCountryFuelChange = (nextCountry) => {
    setSelectedCountry(nextCountry);
    const cfg = COUNTRY_FUEL_UNITS[nextCountry] || COUNTRY_FUEL_UNITS.Colombia;
    setFuelUnit(cfg.unit);
    setFuelAmount(cfg.defaultRefuelAmount);
    setFuelCost(cfg.defaultRefuelCost);
  };

  if (!isOpen) return null;

  const activeCountryCfg = COUNTRY_FUEL_UNITS[selectedCountry] || defaultFuelCfg;
  const isGal = fuelUnit === 'gal';
  const tankCapLiters = Number(bike?.config?.telemetrySpecs?.tankCapacityLiters) || 12;
  const tankCapGallons = litersToGallons(tankCapLiters);
  const numericAmount = Math.max(0.1, Number(fuelAmount) || 0.1);
  const computedLiters = isGal ? gallonsToLiters(numericAmount) : Number(numericAmount.toFixed(2));
  const computedGallons = isGal ? Number(numericAmount.toFixed(2)) : litersToGallons(numericAmount);

  const handleComponentChange = (key) => {
    setSelectedComponentKey(key);
    const item = COMPONENTES_DESGASTE_OFICIALES[key];
    if (item && item.costoSugerido) {
      setServiceCost(item.costoSugerido);
    }
  };

  const handleScanPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanningPhoto(true);
    try {
      const scanned = await scanTftClusterPhotoWithAi(file, bike);
      if (scanned && scanned.success) {
        setScannedClusterData(scanned);
        if (scanned.odometerKm !== undefined && scanned.odometerKm !== null) {
          setKmInput(scanned.odometerKm);
        }
      }
    } catch (err) {
      console.warn('Error escaneando foto de tacómetro:', err);
    } finally {
      setIsScanningPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newKm = Number(kmInput);
    if (isNaN(newKm) || newKm < 0) {
      alert("Por favor ingresa un kilometraje válido");
      return;
    }

    const compInfo = COMPONENTES_DESGASTE_OFICIALES[selectedComponentKey];

    const payload = {
      km: newKm,
      recordType,
      date: new Date().toISOString().slice(0, 10),
      scannedTelemetry: scannedClusterData
        ? {
            ...scannedClusterData,
            odometerKm: newKm
          }
        : null,
      fuelData: recordType === 'fuel'
        ? {
            liters: computedLiters,
            gallons: computedGallons,
            unitUsed: fuelUnit,
            country: selectedCountry,
            cost: Number(fuelCost),
            isFull: isFullTank
          }
        : null,
      serviceData: recordType === 'service' ? {
        componentKey: selectedComponentKey,
        service: compInfo ? compInfo.label : "Servicio Mecánico",
        sparePartBrand: sparePartBrand || compInfo?.especificacion || "Repuesto OEM",
        workshop: workshopName || "Taller Particular",
        cost: Number(serviceCost),
        notes
      } : null
    };

    onSaveOdometer(payload);
    setScannedClusterData(null);
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
                Calibrar Odómetro & Registro
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono">
                {bikeName} • Ajuste manual de kilometraje real
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

        {/* Tipo de Registro */}
        <div className="grid grid-cols-3 gap-2 my-5">
          <button
            type="button"
            onClick={() => setRecordType('quick_km')}
            className={`py-2 px-2 rounded-xl text-xs font-racing font-bold flex flex-col items-center gap-1 border transition ${
              recordType === 'quick_km'
                ? "bg-neutral-800 border-amber-500 text-amber-400 shadow-md"
                : "bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-white"
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>Ajustar Km</span>
          </button>

          <button
            type="button"
            onClick={() => setRecordType('fuel')}
            className={`py-2 px-2 rounded-xl text-xs font-racing font-bold flex flex-col items-center gap-1 border transition ${
              recordType === 'fuel'
                ? "bg-neutral-800 border-amber-500 text-amber-400 shadow-md"
                : "bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-white"
            }`}
          >
            <Fuel className="w-4 h-4" />
            <span>Tanqueo</span>
          </button>

          <button
            type="button"
            onClick={() => setRecordType('service')}
            className={`py-2 px-2 rounded-xl text-xs font-racing font-bold flex flex-col items-center gap-1 border transition ${
              recordType === 'service'
                ? "bg-neutral-800 border-amber-500 text-amber-400 shadow-md"
                : "bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-white"
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Servicio / Taller</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            onChange={handleScanPhoto}
            className="hidden"
          />

          {/* Campo Central: Kilometraje Actual de la Moto + Escáner de Foto del Tacómetro IA */}
          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 text-center space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <label className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 text-left">
                Kilometraje Exacto en el Tacómetro de tu Moto
              </label>
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={isScanningPhoto}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-racing font-black text-[11px] flex items-center gap-1.5 shadow transition flex-shrink-0"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isScanningPhoto ? 'Leyendo Foto...' : '📸 Leer Foto Tacómetro IA'}</span>
              </button>
            </div>

            {scannedClusterData && (
              <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 flex items-center gap-2.5 text-left text-[11px] font-mono">
                {scannedClusterData.previewDataUrl && (
                  <img
                    src={scannedClusterData.previewDataUrl}
                    alt="Tacómetro"
                    className="w-16 h-12 object-cover rounded-lg border border-emerald-400/50 flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <span className="text-emerald-300 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Foto leída: ODO {scannedClusterData.odometerKm} KM • Gasolina {scannedClusterData.fuelBars}/6 ({scannedClusterData.fuelLevelPercent}%) • {scannedClusterData.rpmIdle} RPM
                  </span>
                  <span className="text-[10px] text-neutral-400 block">
                    Al guardar se actualizarán también las barras de gasolina, RPM y velocidades leídas de la foto.
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-2">
              <input
                type="number"
                value={kmInput}
                onChange={(e) => setKmInput(e.target.value)}
                min="0"
                step="any"
                className="w-44 text-3xl font-black font-telemetry text-center bg-neutral-900 border border-neutral-700 rounded-xl px-2 py-1 text-white focus:outline-none focus:border-amber-500"
                required
              />
              <span className="text-sm font-bold text-neutral-400 font-racing">KM</span>
            </div>
            <p className="text-[10px] text-neutral-500">
              Se actualizarán todas las alertas de mantenimiento oficiales con base en este valor.
            </p>
          </div>

          {/* Opciones Específicas de Tanqueo con Unidad Oficial por País */}
          {recordType === 'fuel' && (
            <div className="space-y-3 p-4 bg-neutral-950/60 rounded-2xl border border-neutral-800/80">
              {/* Selector de País y Estándar Oficial de Estación de Servicio */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-neutral-800">
                <div className="flex items-center gap-1.5 text-xs font-mono text-amber-300">
                  <Globe2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Estándar Gasolinera por País:</span>
                </div>
                <select
                  value={selectedCountry}
                  onChange={(e) => handleCountryFuelChange(e.target.value)}
                  className="bg-neutral-900 border border-amber-500/40 rounded-xl px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                >
                  {Object.values(COUNTRY_FUEL_UNITS).map((c) => (
                    <option key={c.country} value={c.country}>
                      {c.flag} {c.country} — Se tanquea en {c.unitLabelEs.toUpperCase()} ({c.unitShort})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono bg-neutral-900/90 px-3 py-2 rounded-xl border border-neutral-800">
                <span className="text-neutral-300">
                  {activeCountryCfg.flag} En <strong>{selectedCountry}</strong> se mide en:{' '}
                  <strong className="text-amber-400">
                    {isGal ? 'GALONES (1 Gal = 3.785 L)' : 'LITROS (L)'}
                  </strong>
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setFuelUnit('gal')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                      isGal ? 'bg-amber-500 text-black' : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    Galones
                  </button>
                  <button
                    type="button"
                    onClick={() => setFuelUnit('L')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                      !isGal ? 'bg-amber-500 text-black' : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    Litros
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-amber-300 font-bold block mb-1">
                    {isGal ? 'Galones Tanqueados (Gal)' : 'Litros Tanqueados (L)'}
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    value={fuelAmount}
                    onChange={(e) => setFuelAmount(e.target.value)}
                    className="w-full bg-neutral-900 border border-amber-500/50 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-[10px] font-mono text-neutral-400 block mt-1">
                    {isGal
                      ? `≈ ${computedLiters} Litros (Tanque total: ${tankCapGallons} Gal / ${tankCapLiters}L)`
                      : `≈ ${computedGallons} Galones (Tanque total: ${tankCapLiters}L / ${tankCapGallons} Gal)`}
                  </span>
                </div>
                <div>
                  <label className="text-xs font-mono text-neutral-400 block mb-1">
                    Costo Total ({currency})
                  </label>
                  <input
                    type="number"
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] font-mono text-emerald-400 block mt-1">
                    {numericAmount > 0
                      ? `Precio por ${isGal ? 'Galón' : 'Litro'}: $${Math.round((Number(fuelCost) || 0) / numericAmount).toLocaleString()} ${currency}`
                      : ''}
                  </span>
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isFullTank}
                  onChange={(e) => setIsFullTank(e.target.checked)}
                  className="rounded border-neutral-700 text-amber-500 focus:ring-0"
                />
                <span>Tanque Lleno Completo (Full • Actualiza medidor al 100%)</span>
              </label>
            </div>
          )}

          {/* Opciones Específicas de Servicio / Taller (17 componentes oficiales) */}
          {recordType === 'service' && (
            <div className="space-y-3 p-4 bg-neutral-950/60 rounded-2xl border border-neutral-800/80 max-h-60 overflow-y-auto pr-1">
              <div>
                <label className="text-xs font-mono text-neutral-400 block mb-1">
                  Componente Oficial del Manual
                </label>
                <select
                  value={selectedComponentKey}
                  onChange={(e) => handleComponentChange(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-sans"
                >
                  {Object.values(COMPONENTES_DESGASTE_OFICIALES).map((comp) => (
                    <option key={comp.id} value={comp.id}>
                      {comp.label} (cada {comp.intervalo.toLocaleString()} km)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-neutral-400 block mb-1">Marca / Especificación</label>
                  <input
                    type="text"
                    placeholder="Ej: Michelin Pilot, Motul, Brembo..."
                    value={sparePartBrand}
                    onChange={(e) => setSparePartBrand(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-neutral-400 block mb-1">Costo Repuesto + Mano Obra</label>
                  <input
                    type="number"
                    value={serviceCost}
                    onChange={(e) => setServiceCost(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-neutral-400 block mb-1">Taller Mecánico / Concesionario</label>
                <input
                  type="text"
                  placeholder="Ej: Taller Autorizado / Mantenimiento Propio"
                  value={workshopName}
                  onChange={(e) => setWorkshopName(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-neutral-400 block mb-1">Notas / Observaciones</label>
                <input
                  type="text"
                  placeholder="Ej: Cambio de arandela, presión a 32 psi, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl font-bold font-racing text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl font-bold font-racing text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/20 hover:opacity-90 transition flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Calibración</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
