import React, { useState, useEffect } from 'react';
import {
  Scale,
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
  COUNTRY_TO_ISO_AND_LANG,
  ISO_TO_COUNTRY_NAME,
  LANG_TO_DEFAULT_COUNTRY,
  isEnglishCountry,
  getCountryQuickLegalQuestions,
  getLawyerModalUiLabels,
  askTrafficLawyerAI
} from '../../services/trafficLawyerAiService';
import { useLanguage } from '../../i18n/LanguageContext';

export default function TrafficLawyerModal({
  isOpen,
  onClose,
  bike,
  hojaDeVida = {},
  userProfile,
  onUpdateHojaDeVida
}) {
  const { language, setLang } = useLanguage();

  const resolvedInitialCountry =
    (language && language !== 'es' && LANG_TO_DEFAULT_COUNTRY[language]) ||
    hojaDeVida?.country ||
    ISO_TO_COUNTRY_NAME[hojaDeVida?.multas?.pais] ||
    userProfile?.country ||
    'Colombia';

  const [selectedCountry, setSelectedCountry] = useState(resolvedInitialCountry);
  const [selectedQuestionId, setSelectedQuestionId] = useState('digital_docs');
  const [customQuery, setCustomQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [customResponse, setCustomResponse] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const nextCountry =
        (language && language !== 'es' && LANG_TO_DEFAULT_COUNTRY[language]) ||
        hojaDeVida?.country ||
        ISO_TO_COUNTRY_NAME[hojaDeVida?.multas?.pais] ||
        userProfile?.country ||
        'Colombia';
      if (COUNTRY_LEGAL_FRAMEWORKS[nextCountry]) {
        setSelectedCountry(nextCountry);
      }
    }
  }, [isOpen, language, hojaDeVida?.country, hojaDeVida?.multas?.pais, userProfile?.country]);

  if (!isOpen) return null;

  const identity = bike?.config?.bikeIdentity || {};
  const framework = COUNTRY_LEGAL_FRAMEWORKS[selectedCountry] || COUNTRY_LEGAL_FRAMEWORKS.Colombia;
  const countryQuestions = getCountryQuickLegalQuestions(selectedCountry);
  const ui = getLawyerModalUiLabels(selectedCountry);
  const isEn = isEnglishCountry(selectedCountry);

  const activeQuickItem =
    countryQuestions.find((q) => q.id === selectedQuestionId) || countryQuestions[0];

  const activeResponse = customResponse || {
    ...activeQuickItem,
    source: isEn
      ? `Verified Legal Database (${selectedCountry})`
      : `Base Legal Verificada (${selectedCountry})`
  };

  const handleCountryChange = (newCountry) => {
    setSelectedCountry(newCountry);
    setCustomResponse(null);

    const mapping = COUNTRY_TO_ISO_AND_LANG[newCountry] || { iso: 'CO', lang: 'es' };
    if (setLang) {
      setLang(mapping.lang);
    }

    if (onUpdateHojaDeVida) {
      const currentMultas = hojaDeVida?.multas || {};
      onUpdateHojaDeVida({
        ...hojaDeVida,
        country: newCountry,
        multas: {
          ...currentMultas,
          pais: mapping.iso
        }
      });
    }
  };

  const handleSelectQuickQuestion = (item) => {
    setCustomResponse(null);
    setSelectedQuestionId(item.id);
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
      setCustomResponse({
        id: 'custom_ai',
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
                  {ui.topPill}
                </span>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {framework.flag} {selectedCountry} ({framework.lang.toUpperCase()})
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black font-racing uppercase tracking-wider text-white mt-1">
                {ui.title}
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                {framework.codeName} • {ui.subtitleSuffix}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <div className="flex items-center gap-1.5 bg-neutral-900 border border-indigo-500/50 rounded-xl px-2.5 py-1.5">
              <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
              <select
                value={selectedCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="bg-transparent text-xs font-mono text-white focus:outline-none cursor-pointer"
                title={isEn ? 'Select Country & Legal Code' : 'Selecciona el país y código de tránsito'}
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
            {ui.inputLabel}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder={ui.inputPlaceholder}
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
                  <span>{ui.askingBtn}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{ui.askBtn}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* BOTONES DE EMERGENCIA EN RETÉN (1 CLIC ADAPTADOS AL PAÍS E IDIOMA) */}
        <div className="mt-4">
          <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-2">
            {ui.quickSectionTitle}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {countryQuestions.map((q) => {
              const isSelected = !customResponse && activeResponse?.id === q.id;
              return (
                <button
                  key={`${selectedCountry}_${q.id}`}
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
                  {ui.analyzedLabel} ({activeResponse.source}):
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                  "{activeResponse.question}"
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 self-start sm:self-center">
                {framework.authority}
              </span>
            </div>

            {/* SEMÁFORO DE INMOVILIZACIÓN / GRÚA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-emerald-500/40">
                <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                  {ui.verdictLabel}
                </span>
                <p className="text-sm font-black font-racing uppercase text-emerald-400 mt-1">
                  {activeResponse.instantVerdict}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950 border border-amber-500/40">
                <span className="text-[10px] font-mono uppercase text-neutral-400 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-amber-400" />
                  <span>{ui.impoundLabel}</span>
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
                <span>{ui.citationLabel}</span>
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
                  {ui.stepsLabel}
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
