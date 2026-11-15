import React, { useState } from 'react';
import {
  Wrench,
  Sparkles,
  Send,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  X
} from 'lucide-react';
import {
  QUICK_MECHANICAL_SYMPTOMS,
  diagnoseMechanicalSymptomAI
} from '../../services/doctorMotorService';
import { useLanguage } from '../../i18n/LanguageContext';

export default function DoctorMotorModal({
  isOpen,
  onClose,
  bike,
  odometer = 0
}) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const [customSymptom, setCustomSymptom] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeDiagnosis, setActiveDiagnosis] = useState(QUICK_MECHANICAL_SYMPTOMS[0]);

  if (!isOpen) return null;

  const identity = bike?.config?.bikeIdentity || {};
  const bikeName = `${identity.brand || 'TVS'} ${identity.model || 'Apache RTR 160 4V'}`;

  const handleAskDoctor = async (e) => {
    e.preventDefault();
    const clean = customSymptom.trim();
    if (!clean) return;

    setLoading(true);
    try {
      const result = await diagnoseMechanicalSymptomAI({
        symptom: clean,
        bikeBrand: identity.brand || 'TVS',
        bikeModel: identity.model || 'Apache RTR 160 4V FI NG',
        odometer,
        lang
      });
      setActiveDiagnosis({
        id: 'custom_diag',
        symptom: clean,
        ...result
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-neutral-950 border-2 border-cyan-500/50 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-[0_0_50px_rgba(6,182,212,0.2)] text-white my-auto max-h-[94vh] overflow-y-auto">
        {/* ENCABEZADO DOCTOR MOTOR IA */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 flex-shrink-0">
              <Wrench className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-cyan-500 text-black">
                  {isEn ? 'DOCTOR MOTOR AI • ANTI-SCAM MECHANIC ADVISOR' : 'DOCTOR MOTOR IA • DIAGNÓSTICO & PRECIO JUSTO DE TALLER'}
                </span>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-neutral-900 text-amber-300 border border-neutral-700">
                  🏍️ {bikeName} ({Number(odometer || 0).toLocaleString()} km)
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black font-racing uppercase tracking-wider text-white mt-1">
                {isEn
                  ? 'AI Mechanical Sound & Symptom Diagnosis'
                  : 'Diagnóstico Mecánico por Ruido o Síntoma con IA'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONSULTA ABIERTA DE RUIDO O SÍNTOMA */}
        <form onSubmit={handleAskDoctor} className="mt-4">
          <label className="text-xs font-mono text-cyan-300 block mb-1.5">
            {isEn
              ? 'Describe the noise, vibration, or symptom your motorcycle is making:'
              : 'Describe qué ruido, vibración o falla sientes en tu moto para saber qué tiene antes de ir al taller:'}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customSymptom}
              onChange={(e) => setCustomSymptom(e.target.value)}
              placeholder={
                isEn
                  ? 'E.g.: Metallic ticking sound at 3,500 RPM when cold, or hard shifting into 2nd gear...'
                  : 'Ej: Suena un cascabeleo en frío a 3.000 RPM o se siente dura la caja al meter segunda...'
              }
              className="flex-1 bg-neutral-900 border border-cyan-500/40 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={loading || !customSymptom.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-black font-racing font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>{isEn ? 'Diagnosing...' : 'Diagnosticando...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{isEn ? 'Diagnose' : 'Diagnosticar'}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* SÍNTOMAS FRECUENTES DE 1 TOQUE */}
        <div className="mt-4">
          <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-2">
            {isEn
              ? 'Common Motorcycle Noises & Symptoms (Tap one):'
              : 'Ruidos y Síntomas Frecuentes (Toca uno para ver diagnóstico y costo justo):'}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {QUICK_MECHANICAL_SYMPTOMS.map((item) => {
              const isSelected = activeDiagnosis?.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveDiagnosis(item)}
                  className={`p-2.5 rounded-xl text-left text-xs font-mono border transition ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold shadow-md'
                      : 'bg-neutral-900/90 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  {item.badge}
                </button>
              );
            })}
          </div>
        </div>

        {/* RESULTADO DEL DIAGNÓSTICO MECÁNICO */}
        {activeDiagnosis && (
          <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-neutral-900/95 border-2 border-cyan-500/40 space-y-4">
            <div className="pb-3 border-b border-neutral-800">
              <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">
                SÍNTOMA ANALIZADO ({activeDiagnosis.source || `Calibrado para ${bikeName}`}):
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                "{activeDiagnosis.symptom}"
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-cyan-500/40">
                <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                  🔧 CAUSA TÉCNICA PROBABLE
                </span>
                <p className="text-xs sm:text-sm font-black font-racing uppercase text-cyan-300 mt-1">
                  {activeDiagnosis.diagnosisTitle}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950 border border-amber-500/40">
                <span className="text-[10px] font-mono uppercase text-neutral-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>¿PUEDO SEGUIR RODANDO?</span>
                </span>
                <p className="text-xs sm:text-sm font-black font-racing uppercase text-amber-300 mt-1">
                  {activeDiagnosis.canRideSafely}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950 border border-emerald-500/40">
                <span className="text-[10px] font-mono uppercase text-neutral-400 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>PRECIO JUSTO ESTIMADO</span>
                </span>
                <p className="text-xs sm:text-sm font-black font-racing uppercase text-emerald-400 mt-1">
                  {activeDiagnosis.estimatedCostCOP}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-cyan-950/25 border border-cyan-500/30">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>EXPLICACIÓN DE INGENIERÍA MECÁNICA:</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                {activeDiagnosis.technicalExplanation}
              </p>
            </div>

            {Array.isArray(activeDiagnosis.mechanicChecklist) && (
              <div className="space-y-2">
                <span className="text-xs font-racing uppercase tracking-wider text-amber-400 block">
                  📋 Qué pedirle exactamente al mecánico (para que no te cobren de más):
                </span>
                {activeDiagnosis.mechanicChecklist.map((step, idx) => (
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
