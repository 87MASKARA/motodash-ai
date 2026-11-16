import React, { useState, useEffect } from 'react';
import {
  Bell,
  MessageCircle,
  Clock,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Send,
  MapPin,
  Radio,
  X
} from 'lucide-react';
import {
  getCountryDocumentLabels,
  evaluateDocumentAlertStatus,
  triggerBrowserPushAlert,
  buildWhatsAppAlertUrl
} from '../../services/globalDocumentsService';
import { supabase, getAuthenticatedUserId } from '../../services/supabaseClient';

const DEFAULT_ROAD_ALERTS = [
  {
    id: 'alert_1',
    author_name: 'Red Vial Antioquia',
    author_bike: 'TVS Apache RTR 160 4V',
    city: 'Medellín',
    content: '⚠️ Control de documentos (SOAT y Tecno) en Autopista Sur altura Itagüí sentido Norte-Sur.',
    created_at: new Date(Date.now() - 900000).toISOString()
  },
  {
    id: 'alert_2',
    author_name: 'Piloto Verificado',
    author_bike: 'Yamaha MT-09 SP',
    city: 'Medellín',
    content: '🌧️ Calzada húmeda en Las Palmas km 12 subiendo. Precaución en curvas.',
    created_at: new Date(Date.now() - 2400000).toISOString()
  }
];

export default function AlertsCenterModal({
  isOpen,
  onClose,
  bike,
  hojaDeVida = {},
  userProfile
}) {
  const docs = hojaDeVida?.documentos || {};
  const globalDocs = hojaDeVida?.globalDocuments || {};

  const [activeTab, setActiveTab] = useState('vencimientos'); // 'vencimientos' | 'retenes_via'
  const [whatsappPhone, setWhatsappPhone] = useState(
    userProfile?.phone || docs.telefonoPropietario || ''
  );
  const [pushStatus, setPushStatus] = useState('');
  const [roadAlerts, setRoadAlerts] = useState(DEFAULT_ROAD_ALERTS);
  const [newAlertText, setNewAlertText] = useState('');
  const [sendingAlert, setSendingAlert] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    async function loadRoadAlerts() {
      const authUid = await getAuthenticatedUserId();
      if (!authUid) return;
      const { data, error } = await supabase
        .from('community_messages')
        .select('*')
        .eq('channel_id', 'alertas_viales')
        .order('created_at', { ascending: false })
        .limit(30);

      if (mounted && !error && Array.isArray(data) && data.length > 0) {
        setRoadAlerts(data);
      }
    }
    loadRoadAlerts();

    const sub = supabase
      .channel('road_alerts_live')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: 'channel_id=eq.alertas_viales'
        },
        (payload) => {
          if (payload?.new && mounted) {
            setRoadAlerts((prev) => [payload.new, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(sub);
    };
  }, [isOpen]);

  if (!isOpen || !bike) return null;

  const identity = bike.config?.bikeIdentity || {};
  const countryLabels = getCountryDocumentLabels(userProfile?.country || hojaDeVida?.country || 'Colombia');

  const mandatoryExpiry =
    globalDocs.mandatory_insurance?.expiryDate || docs.soatVencimiento || '';
  const technicalExpiry =
    globalDocs.technical_inspection?.expiryDate || docs.tecnoVencimiento || '';

  const mandatoryEval = evaluateDocumentAlertStatus(
    mandatoryExpiry,
    countryLabels.mandatory_insurance.shortName
  );
  const technicalEval = evaluateDocumentAlertStatus(
    technicalExpiry,
    countryLabels.technical_inspection.shortName
  );

  const handleActivatePush = async () => {
    const ok = await triggerBrowserPushAlert(
      `🔔 Alertas MotoDash AI (${docs.placa || identity.model})`,
      `${mandatoryEval.alertMessage} | ${technicalEval.alertMessage}`
    );
    setPushStatus(
      ok
        ? '✅ Notificaciones Push activadas en este dispositivo (Cron 8:00 AM sincronizado).'
        : '⚠️ Habilita los permisos de notificación en tu navegador.'
    );
  };

  const handleSendWhatsApp = () => {
    const url = buildWhatsAppAlertUrl(
      whatsappPhone,
      `${identity.brand} ${identity.model}`,
      docs.placa || '',
      [
        `${countryLabels.mandatory_insurance.shortName}: ${mandatoryEval.badgeText} (Vence: ${mandatoryExpiry || 'Sin fecha'})`,
        `${countryLabels.technical_inspection.shortName}: ${technicalEval.badgeText} (Vence: ${technicalExpiry || 'Sin fecha'})`
      ]
    );
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handlePublishRoadAlert = async (e) => {
    e.preventDefault();
    const clean = newAlertText.trim();
    if (!clean) return;
    setSendingAlert(true);

    try {
      const authUid = await getAuthenticatedUserId();
      const bikeName = `${identity.brand || 'Moto'} ${identity.model || ''}`.trim();
      if (authUid) {
        const { data, error } = await supabase
          .from('community_messages')
          .insert({
            user_id: authUid,
            channel_id: 'alertas_viales',
            category: 'alerta_vial',
            author_name: userProfile?.fullName || 'Piloto Verificado',
            author_bike: bikeName,
            author_verified: true,
            content: clean,
            city: userProfile?.city || 'Medellín'
          })
          .select()
          .single();

        if (!error && data) {
          setRoadAlerts((prev) => [data, ...prev.filter((a) => a.id !== data.id)]);
          setNewAlertText('');
          setSendingAlert(false);
          return;
        }
      }

      setRoadAlerts((prev) => [
        {
          id: `local_alert_${Date.now()}`,
          author_name: userProfile?.fullName || 'Piloto MotoDash',
          author_bike: bikeName,
          city: userProfile?.city || 'Medellín',
          content: clean,
          created_at: new Date().toISOString()
        },
        ...prev
      ]);
      setNewAlertText('');
    } finally {
      setSendingAlert(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-neutral-950 border border-rose-500/40 rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl text-white my-auto max-h-[92vh] overflow-y-auto">
        {/* ENCABEZADO CENTRO DE ALERTAS INDEPENDIENTE */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  GUARDIÁN 8:00 AM • PUSH & WHATSAPP
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-racing uppercase tracking-wider text-white mt-0.5">
                Centro de Alertas (Vencimientos & Retenes en Vía)
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

        {/* PESTAÑAS: 1. ALERTAS DE VENCIMIENTO (30/15/5 DÍAS) | 2. ALERTAS DE RETENES Y VÍAS */}
        <div className="flex gap-2 mt-4 pb-3 border-b border-neutral-800">
          <button
            type="button"
            onClick={() => setActiveTab('vencimientos')}
            className={`px-3.5 py-2 rounded-xl text-xs font-racing font-bold uppercase tracking-wider flex items-center gap-1.5 border transition ${
              activeTab === 'vencimientos'
                ? 'bg-rose-500 text-white border-rose-400 shadow-md'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Alertas Push / WhatsApp (30, 15 y 5 Días)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('retenes_via')}
            className={`px-3.5 py-2 rounded-xl text-xs font-racing font-bold uppercase tracking-wider flex items-center gap-1.5 border transition ${
              activeTab === 'retenes_via'
                ? 'bg-amber-500 text-black border-amber-400 shadow-md'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Radar de Retenes & Alertas Viales</span>
          </button>
        </div>

        {activeTab === 'vencimientos' ? (
          <div className="mt-4 space-y-4">
            <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-xs font-black font-racing uppercase tracking-wider text-amber-400">
                  Estado de Vencimientos Programados (Cron Diario 8:00 AM)
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Hitos Activos: 30d • 15d • 5d
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-white">
                      {countryLabels.mandatory_insurance.shortName}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {mandatoryEval.badgeText}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-neutral-400">
                    Fecha en Supabase (<code className="text-amber-300">mandatory_insurance</code>):{' '}
                    <strong className="text-white">{mandatoryExpiry || 'Pendiente'}</strong>
                  </p>
                  <p className="text-[11px] text-neutral-300 mt-1.5">{mandatoryEval.alertMessage}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-white">
                      {countryLabels.technical_inspection.shortName}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {technicalEval.badgeText}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-neutral-400">
                    Fecha en Supabase (<code className="text-amber-300">technical_inspection</code>):{' '}
                    <strong className="text-white">{technicalExpiry || 'Pendiente'}</strong>
                  </p>
                  <p className="text-[11px] text-neutral-300 mt-1.5">{technicalEval.alertMessage}</p>
                </div>
              </div>
            </div>

            {/* CONFIGURACIÓN DE ENVÍO AUTOMÁTICO WHATSAPP & PUSH */}
            <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3">
              <h4 className="text-xs font-black font-racing uppercase tracking-wider text-white">
                Canales de Notificación Directa al Piloto
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                <div>
                  <label className="text-[11px] font-mono text-neutral-400 block mb-1">
                    Número de WhatsApp para Alertas (con indicativo, ej: 57300...)
                  </label>
                  <input
                    type="text"
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    placeholder="+57 300 000 0000"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleActivatePush}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs font-mono text-white flex items-center justify-center gap-1.5 transition"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-400" />
                    <span>Probar Push</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-mono font-bold text-emerald-300 flex items-center justify-center gap-1.5 transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Enviar a WhatsApp</span>
                  </button>
                </div>
              </div>

              {pushStatus && (
                <p className="text-xs font-mono text-emerald-400">{pushStatus}</p>
              )}
            </div>
          </div>
        ) : (
          /* PESTAÑA 2: RADAR DE RETENES Y ALERTAS VIALES EN VIVO (SEPARADO DE COMUNIDAD) */
          <div className="mt-4 space-y-4">
            <form onSubmit={handlePublishRoadAlert} className="flex gap-2">
              <input
                type="text"
                value={newAlertText}
                onChange={(e) => setNewAlertText(e.target.value)}
                placeholder="🚨 Reportar retén policial, cámara móvil, accidente o vía cerrada..."
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                disabled={sendingAlert || !newAlertText.trim()}
                className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-racing font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Reportar Alerta</span>
              </button>
            </form>

            <div className="space-y-2.5 max-h-[45vh] overflow-y-auto pr-1">
              {roadAlerts.map((alertItem) => (
                <div
                  key={alertItem.id}
                  className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>ALERTA EN VÍA</span>
                      </span>
                      <span className="text-xs font-bold text-white">{alertItem.author_name}</span>
                      <span className="text-[10px] font-mono text-amber-400">
                        • {alertItem.author_bike}
                      </span>
                      {alertItem.city && (
                        <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" /> {alertItem.city}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-200">{alertItem.content}</p>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500 whitespace-nowrap">
                    {alertItem.created_at
                      ? new Date(alertItem.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Ahora'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

