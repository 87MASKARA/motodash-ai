import React, { useState } from 'react';
import { Sparkles, Bike, Palette, Check, Key, ShieldCheck } from 'lucide-react';
import { generateDashboardSpecs } from '../../services/aiGenerator';

const BRANDS = [
  { name: "Yamaha", defaultModel: "MT-09", colors: [
    { name: "Icon Blue", hex: "#0040C1" },
    { name: "Cyan Storm", hex: "#00D2D3" },
    { name: "Tech Black", hex: "#18181B" }
  ]},
  { name: "KTM", defaultModel: "Duke 390", colors: [
    { name: "Ready to Race Orange", hex: "#FF6600" },
    { name: "Factory White", hex: "#F4F4F5" },
    { name: "Dark Shadow", hex: "#1C1917" }
  ]},
  { name: "Kawasaki", defaultModel: "Ninja ZX-6R", colors: [
    { name: "Lime Green", hex: "#52C41A" },
    { name: "Metallic Diablo Black", hex: "#121212" },
    { name: "Pearl Robotic White", hex: "#E5E7EB" }
  ]},
  { name: "Ducati", defaultModel: "Panigale V4", colors: [
    { name: "Rosso Corsa", hex: "#DC2626" },
    { name: "Dark Stealth", hex: "#171717" },
    { name: "Aviator Grey", hex: "#6B7280" }
  ]},
  { name: "Honda", defaultModel: "CBR650R", colors: [
    { name: "Grand Prix Red", hex: "#EF4444" },
    { name: "Matte Jeans Blue", hex: "#1E3A8A" },
    { name: "Ballistic Black", hex: "#18181B" }
  ]},
  { name: "BMW", defaultModel: "S1000RR", colors: [
    { name: "M Motorsport Tricolor", hex: "#2563EB" },
    { name: "Racing Red", hex: "#DC2626" },
    { name: "Black Storm Metallic", hex: "#111827" }
  ]},
  { name: "Bajaj", defaultModel: "Pulsar NS200", colors: [
    { name: "Burnt Red", hex: "#B91C1C" },
    { name: "Plasma Blue", hex: "#1D4ED8" },
    { name: "Satin Grey", hex: "#4B5563" }
  ]}
];

export default function BikeSelector({ onDashboardGenerated, currentConfig, onClose }) {
  const [selectedBrand, setSelectedBrand] = useState(currentConfig?.bikeIdentity?.brand || "Yamaha");
  const [model, setModel] = useState(currentConfig?.bikeIdentity?.model || "MT-09");
  const [year, setYear] = useState(currentConfig?.bikeIdentity?.year || 2024);
  const [selectedColor, setSelectedColor] = useState(currentConfig?.bikeIdentity?.colorHex || BRANDS[0].colors[0].hex);
  const [isCustomColor, setIsCustomColor] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiInput, setShowApiInput] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const activeBrandData = BRANDS.find(b => b.name.toLowerCase() === selectedBrand.toLowerCase()) || BRANDS[0];

  const handleBrandChange = (brandName) => {
    setSelectedBrand(brandName);
    const brandObj = BRANDS.find(b => b.name === brandName);
    if (brandObj) {
      setModel(brandObj.defaultModel);
      setSelectedColor(brandObj.colors[0].hex);
      setIsCustomColor(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!model.trim()) return alert("Por favor escribe el modelo de tu moto");

    setIsGenerating(true);
    try {
      const config = await generateDashboardSpecs({
        brand: selectedBrand,
        model: model,
        year: year,
        colorHex: selectedColor,
        apiKey: apiKey.trim() || null
      });

      // Guardar en localStorage para persistencia
      localStorage.setItem("motodash_active_bike", JSON.stringify(config));
      onDashboardGenerated(config);
    } catch (err) {
      console.error(err);
      alert("Error al calibrar con IA");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-neutral-400 hover:text-white text-sm"
          >
            ✕
          </button>
        )}

        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-black font-black">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold font-racing uppercase tracking-wider text-white">
            Calibrador MotoDash AI
          </h2>
        </div>
        <p className="text-xs text-neutral-400 mb-6">
          Selecciona tu marca, modelo y color para que la IA genere el tacómetro, redline y telemetría de fábrica.
        </p>

        <form onSubmit={handleGenerate} className="space-y-5">
          {/* Selector de Marca */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-2 font-racing uppercase">
              1. Marca de la Moto
            </label>
            <div className="grid grid-cols-4 gap-2">
              {BRANDS.map((b) => {
                const isSelected = selectedBrand.toLowerCase() === b.name.toLowerCase();
                return (
                  <button
                    key={b.name}
                    type="button"
                    onClick={() => handleBrandChange(b.name)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      isSelected 
                        ? "bg-white text-black border-white shadow-lg" 
                        : "bg-neutral-800/80 text-neutral-400 border-neutral-700/60 hover:text-white hover:border-neutral-500"
                    }`}
                  >
                    {b.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modelo y Año */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-neutral-300 block mb-1 font-racing uppercase">
                2. Modelo
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Ej: MT-09, Duke 390, ZX-6R..."
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1 font-racing uppercase">
                Año
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                min="1990"
                max="2027"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Paleta de Color de la Moto */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-neutral-300 font-racing uppercase flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                3. Color de Chasis / Gráficas
              </label>
              <span className="text-[11px] text-neutral-500">Inyecta tema al dashboard</span>
            </div>

            <div className="flex items-center gap-3">
              {activeBrandData.colors.map((c) => {
                const isActive = selectedColor === c.hex && !isCustomColor;
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => { setSelectedColor(c.hex); setIsCustomColor(false); }}
                    title={c.name}
                    className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all ${
                      isActive ? "border-white scale-110 shadow-xl" : "border-neutral-700 hover:scale-105"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {isActive && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                  </button>
                );
              })}

              {/* Selector de color HEX personalizado */}
              <label 
                className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center cursor-pointer transition-all ${
                  isCustomColor ? "border-white scale-110 shadow-xl" : "border-neutral-700 hover:scale-105"
                }`}
                style={{ backgroundColor: isCustomColor ? selectedColor : "#262626" }}
                title="Color personalizado"
              >
                <input
                  type="color"
                  className="opacity-0 w-0 h-0"
                  onChange={(e) => {
                    setSelectedColor(e.target.value);
                    setIsCustomColor(true);
                  }}
                />
                {!isCustomColor && <span className="text-neutral-400 text-xs font-bold">+</span>}
              </label>
            </div>
          </div>

          {/* Opción de API Key de Gemini (Opcional) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowApiInput(!showApiInput)}
              className="text-[11px] text-neutral-400 hover:text-amber-400 flex items-center gap-1 font-mono transition"
            >
              <Key className="w-3 h-3" />
              {showApiInput ? "Ocultar Gemini API Key" : "Configurar Gemini API Key (Opcional)"}
            </button>
            {showApiInput && (
              <div className="mt-2 p-3 bg-neutral-800/60 rounded-xl border border-neutral-700/80">
                <p className="text-[10px] text-neutral-400 mb-2">
                  Si dejas este campo vacío, usaremos el motor de especificaciones integrado de MotoDash AI.
                </p>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            )}
          </div>

          {/* Botón Principal de Envío */}
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-3.5 px-4 rounded-2xl font-bold font-racing uppercase tracking-wider text-sm bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-black shadow-xl shadow-amber-500/20 transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Generando Dashboard con IA...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generar Mi Dashboard Inteligente →</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

