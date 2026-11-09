import React from 'react';
import { AlertTriangle, Wrench, ShieldAlert, Radar, DollarSign } from 'lucide-react';
import { COMPONENTES_DESGASTE_OFICIALES } from '../../../services/maintenanceCatalog';
import { useLanguage } from '../../../i18n/LanguageContext';

export default function CriticalAlertBanner({ 
  currentOdometer = 0, 
  customComponents = {},
  docs = {},
  urgentFine = null,
  onOpenOdometerModal,
  onOpenHojaDeVida,
  onOpenFinesModal
}) {
  const { t } = useLanguage();
  const allComponents = {
    ...COMPONENTES_DESGASTE_OFICIALES,
    ...customComponents
  };

  // 1. Verificar si hay componentes críticos respetando calibraciones y últimos cambios
  const urgentComponents = Object.values(allComponents).map((comp) => {
    const custom = customComponents[comp.id] || {};
    const intervalo = custom.intervalo || comp.intervalo || 5000;
    const alertaMargin = custom.alertaPreventivaKm || comp.alertaPreventivaKm || 300;
    const ultimoCambioKm = typeof custom.ultimoCambioKm === 'number' ? custom.ultimoCambioKm : 0;

    let kmRestantes;
    if (ultimoCambioKm > 0 && currentOdometer >= ultimoCambioKm) {
      kmRestantes = Math.max(0, intervalo - (currentOdometer - ultimoCambioKm));
    } else {
      const kmEnCiclo = currentOdometer % intervalo;
      kmRestantes = intervalo - kmEnCiclo;
    }

    const isCritico = kmRestantes <= alertaMargin;
    return { ...comp, ...custom, kmRestantes, isCritico };
  }).filter(c => c.isCritico);

  // 2. Verificar si hay documentos con <= 20 días o vencidos
  const getDaysRemaining = (dateStr) => {
    if (!dateStr) return null;
    const target = new Date(dateStr);
    const today = new Date();
    return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  };

  const urgentDocs = [
    { name: "SOAT", days: getDaysRemaining(docs.soatVencimiento) },
    { name: "Revisión Técnico-Mecánica", days: getDaysRemaining(docs.tecnoVencimiento) },
    { name: "Seguro Todo Riesgo", days: getDaysRemaining(docs.seguroVencimiento) }
  ].filter(d => d.days !== null && d.days <= 20);

  if (urgentComponents.length === 0 && urgentDocs.length === 0 && !urgentFine) {
    return null; // Todo en orden
  }

  const primaryComp = urgentComponents[0];
  const primaryDoc = urgentDocs[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 w-full">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950/90 via-red-900/80 to-red-950/90 border-2 border-red-500/80 p-4 shadow-2xl">
        {/* Fondo de alerta */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#EF4444_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/50 flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-red-300 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                  {urgentFine ? "🚨 ALERTA FOTOMULTA ACTIVA" : t('alert.urgentTitle')}
                </span>
              </div>

              {urgentFine ? (
                <h3 className="text-sm font-bold text-white leading-tight mt-0.5">
                  Infracción {urgentFine.codigoInfraccion}: Quedan <strong className="text-amber-300 font-mono">{urgentFine.diasRestantesDescuento} días</strong> para pagar con 50% de descuento (${urgentFine.valorConDescuento?.toLocaleString()} COP)
                </h3>
              ) : primaryComp ? (
                <h3 className="text-sm font-bold text-white leading-tight mt-0.5">
                  {primaryComp.label} • {t('alert.onlyRemaining')} <strong className="text-amber-300 font-mono">{primaryComp.kmRestantes.toLocaleString()} km</strong>
                </h3>
              ) : (
                <h3 className="text-sm font-bold text-white leading-tight mt-0.5">
                  {t('alert.upcomingExpiry')} {primaryDoc.name} ({primaryDoc.days <= 0 ? t('alert.expired') : t('alert.inDays', { days: primaryDoc.days })})
                </h3>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {urgentFine ? (
              <button
                onClick={onOpenFinesModal}
                className="w-full sm:w-auto py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black text-xs font-bold font-racing uppercase tracking-wider shadow-lg transition flex items-center justify-center gap-1.5"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Pagar con 50% Descuento</span>
              </button>
            ) : primaryComp ? (
              <button
                onClick={() => onOpenOdometerModal(primaryComp.id)}
                className="w-full sm:w-auto py-2 px-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-black text-xs font-bold font-racing uppercase tracking-wider shadow-lg transition flex items-center justify-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>{t('alert.logChange')} ({primaryComp.shortLabel || primaryComp.label})</span>
              </button>
            ) : (
              <button
                onClick={onOpenHojaDeVida}
                className="w-full sm:w-auto py-2 px-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-black text-xs font-bold font-racing uppercase tracking-wider shadow-lg transition flex items-center justify-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{t('alert.viewLogbook')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
