import React, { useState } from 'react';
import {
  Scale,
  ShieldAlert,
  CheckCircle2,
  BookOpen,
  Send,
  Sparkles,
  Globe2,
  Truck,
  X
} from 'lucide-react';
import {
  COUNTRY_LEGAL_FRAMEWORKS,
  QUICK_LEGAL_QUESTIONS,
  askTrafficLawyerAI
} from '../../services/trafficLawyerAiService';

export default function TrafficLawyerModal({
  isOpen,
  onClose,
  bike,
  userProfile
}) {
  if (!isOpen) return null;

  const identity = bike?.config?.bikeIdentity || {};
  const [selectedCountry, setSelectedCountry] = useState(
    userProfile?.country || 'Colombia'
  );
  const [customQuery, setCustomQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeResponse, setActiveResponse] = useState(QUICK_LEGAL_QUESTIONS[0]);

  const framework = COUNTRY_LEGAL_FRAMEWORKS[selectedCountry] || COUNTRY_LEGAL_FRAMEWORKS.Colombia;

  const handleSelectQuickQuestion = (item) => {
    setActiveResponse({
      ...item,
      source: `Base Legal Verificada (${selectedCountry})`
    });
  };

  const handleAskCustomQuestion = async (e) => {
    e.preventDefault();
    const clean = customQuery.trim();
    if (!clean) return;

    setLoading(true);
    try {
      const result = await askTrafficLawyerAI({
        question: clean,
        country: selectedCountry,
        bikeBrand: identity.brand || 'TVS',
        bikeModel: identity.model || 'Apache'
      });
      setActiveResponse({
        question: clean,
        ...result
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-neutral-950 border-2 border-indigo-500/50 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-[0_0_50px_rgba(99,102,241,0.2)] text-white my-auto max-h-[94vh] overflow-y-auto">
        {/* ENCABEZADO ASESOR JURÍDICO VIAL IA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/40 flex items-center justify-center text-indigo-400 flex-shrink-0">
              <Scale className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500 text-white">
                  ABOGADO DE BOLSILLO IA • DEFENSA EN RETENES
                </span>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {framework.flag} {selectedCountry}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black font-racing uppercase tracking-wider text-white mt-1">
                Asesor Jurídico de Tránsito & Anti-Inmovilización IA
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                {framework.codeName} • Consulta al instante si un comparendo o grúa es legal o ilegal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-700 rounded-xl px-2.5 py-1.5">
              <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="bg-transparent text-xs font-mono text-white focus:outline-none cursor-pointer"
              >
                {Object.keys(COUNTRY_LEGAL_FRAMEWORKS).map((c) => (
                  <option key={c} value={c} className="bg-neutral-900 text-white">
                    {COUNTRY_LEGAL_FRAMEWORKS[c].flag} {c}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* BUSCADOR / PREGUNTA LIBRE AL ABOGADO VIAL IA */}
        <form onSubmit={handleAskCustomQuestion} className="mt-4">
          <label className="text-xs font-mono text-indigo-300 block mb-1.5">
            ¿Qué te está diciendo el agente de tránsito o qué duda tienes del comparendo?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder="Ej: El agente dice que se va a llevar mi moto en grúa porque no tengo el SOAT impreso en papel..."
              className="flex-1 bg-neutral-900 border border-indigo-500/40 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-400"
            />
            <button
              type="submit"
              disabled={loading || !customQuery.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-racing font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Analizando Ley...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Consultar Ley</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* BOTONES DE EMERGENCIA EN RETÉN (1 CLIC) */}
        <div className="mt-4">
          <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-2">
            Situaciones Frecuentes en Retenes (Toca una para ver el Artículo Exacto):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {QUICK_LEGAL_QUESTIONS.map((q) => {
              const isSelected = activeResponse?.id === q.id;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => handleSelectQuickQuestion(q)}
                  className={`p-2.5 rounded-xl text-left text-xs font-mono border transition ${
                    isSelected
                      ? 'bg-indigo-500/20 border-indigo-400 text-white font-bold shadow-md'
                      : 'bg-neutral-900/90 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  {q.badge}
                </button>
              );
            })}
          </div>
        </div>

        {/* DICTAMEN JURÍDICO ESTRUCTURADO PARA MOSTRAR O CITAR AL AGENTE */}
        {activeResponse && (
          <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-neutral-900/95 border-2 border-indigo-500/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold block">
                  PREGUNTA ANALIZADA ({activeResponse.source || `Código de Tránsito ${selectedCountry}`}):
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                  "{activeResponse.question}"
                </h3>
              </div>
            </div>

            {/* SEMÁFORO DE INMOVILIZACIÓN / GRÚA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-emerald-500/40">
                <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                  ⚖️ VEREDICTO LEGAL INMEDIATO
                </span>
                <p className="text-sm font-black font-racing uppercase text-emerald-400 mt-1">
                  {activeResponse.instantVerdict}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950 border border-amber-500/40">
                <span className="text-[10px] font-mono uppercase text-neutral-400 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-amber-400" />
                  <span>¿SE PUEDEN LLEVAR LA MOTO EN GRÚA?</span>
                </span>
                <p className="text-sm font-black font-racing uppercase text-amber-300 mt-1">
                  {activeResponse.canImpound}
                </p>
              </div>
            </div>

            {/* FUNDAMENTO JURÍDICO EXACTO PARA CITAR */}
            <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/40">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-300 mb-1">
                <BookOpen className="w-4 h-4" />
                <span>NORMA / ARTÍCULO EXACTO PARA INVOCAR ANTE EL AGENTE:</span>
              </div>
              <p className="text-xs sm:text-sm font-mono font-bold text-white">
                {activeResponse.lawCitation}
              </p>
              <p className="text-xs sm:text-sm text-neutral-200 mt-2 leading-relaxed">
                {activeResponse.explanation}
              </p>
            </div>

            {/* PASOS DE DEFENSA EN EL SITIO */}
            {Array.isArray(activeResponse.actionSteps) && activeResponse.actionSteps.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-racing uppercase tracking-wider text-amber-400 block">
                  🛡️ Qué hacer paso a paso en este momento:
                </span>
                {activeResponse.actionSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start gap-2.5 text-xs sm:text-sm text-neutral-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
