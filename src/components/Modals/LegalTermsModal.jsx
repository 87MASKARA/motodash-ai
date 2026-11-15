import React, { useState, useEffect } from 'react';
import {
  X, ShieldCheck, Scale, Lock, FileText, Eye, Cpu, Users,
  AlertTriangle, CheckCircle2, Crown, HeartPulse, Bluetooth, Globe
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function LegalTermsModal({
  isOpen,
  onClose,
  initialTab = 'privacy' // 'privacy' | 'terms' | 'habeas'
}) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const lastUpdated = '15 de Noviembre de 2026 • Versión 2.5 PRO';

  return (
    <div className="fixed inset-0 z-[190] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-neutral-800 flex items-center justify-between bg-gradient-to-r from-neutral-950 via-amber-950/20 to-neutral-950">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black font-racing uppercase tracking-wide text-white">
                  {isEn
                    ? 'Legal Center • Privacy Policy & Terms of Use'
                    : 'Centro Legal • Política de Privacidad y Términos de Uso'}
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-300">
                  HABEAS DATA / RGPD / CCPA
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono">
                MotoDash AI • {lastUpdated}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de Pestañas */}
        <div className="px-5 pt-3 border-b border-neutral-800 flex gap-2 bg-neutral-900/40 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-racing font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'border-amber-500 text-amber-400 bg-neutral-900/90'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isEn ? '1. Privacy Policy & Data Protection' : '1. Política de Privacidad y Datos'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-racing font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition whitespace-nowrap ${
              activeTab === 'terms'
                ? 'border-amber-500 text-amber-400 bg-neutral-900/90'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{isEn ? '2. Terms & Conditions of Service' : '2. Términos y Condiciones de Uso'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('clans')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-racing font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition whitespace-nowrap ${
              activeTab === 'clans'
                ? 'border-amber-500 text-amber-400 bg-neutral-900/90'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{isEn ? '3. Clans, AI & Safety Disclaimers' : '3. Reglas de Clanes, IA y Seguridad Vial'}</span>
          </button>
        </div>

        {/* Contenido Legal Desplazable */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
          {activeTab === 'privacy' && (
            <>
              <div className="p-4 rounded-2xl bg-emerald-950/25 border border-emerald-500/35 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-white font-racing uppercase">
                    {isEn
                      ? 'Commitment to Total Rider Privacy & Security'
                      : 'Compromiso de Privacidad Total y Protección de Datos (Habeas Data)'}
                  </h3>
                  <p className="text-xs text-neutral-300 mt-1">
                    {isEn
                      ? 'MotoDash AI complies with Law 1581 of 2012 (Colombia Habeas Data), GDPR (Europe), CCPA (United States), and LFPDPPP (Mexico). Your documents, license plates, and motorcycle telemetry belong exclusively to you.'
                      : 'MotoDash AI cumple estrictamente con la Ley Estatutaria 1581 de 2012 y el Decreto 1377 de 2013 (Habeas Data en Colombia), así como el RGPD (Europa), CCPA (EE. UU.) y LFPDPPP (México). Tus documentos, placas y telemetría te pertenecen exclusivamente a ti.'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800">
                  <h4 className="text-xs font-mono font-bold uppercase text-amber-400 mb-1.5 flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    {isEn ? '1.1 Information We Collect & Purpose' : '1.1 Datos que Recopilamos y su Finalidad'}
                  </h4>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs text-neutral-300">
                    <li>
                      <strong>{isEn ? 'Pilot Profile:' : 'Perfil del Piloto:'}</strong>{' '}
                      {isEn
                        ? 'Name, email, phone number, country, and city to authenticate your account, customize local traffic laws, and send preventive maintenance or document expiry alerts.'
                        : 'Nombre, correo electrónico, teléfono opcional, país y ciudad para autenticar tu cuenta, adaptar la legislación vial de tu país y enviarte alertas preventivas de vencimiento (30, 15 y 5 días).'}
                    </li>
                    <li>
                      <strong>{isEn ? 'Digital Glovebox (Checkpoint Vault):' : 'Guantera Digital (Modo Retén por Ambos Lados):'}</strong>{' '}
                      {isEn
                        ? 'Front and back photos of your Driver License, Ownership Card, SOAT/Insurance, and Technical Inspection are stored encrypted in your private vault and local IndexedDB offline cache so you can present them at checkpoints even without internet.'
                        : 'Las fotografías por ambos lados (Frente y Reverso) de tu Licencia de Conducción, Tarjeta de Propiedad, SOAT y Revisión Técnico-Mecánica se almacenan de forma privada y en la bóveda Offline local (IndexedDB) de tu dispositivo, protegidas con tu PIN policial de 4 dígitos.'}
                    </li>
                    <li>
                      <strong>{isEn ? 'TFT Bluetooth & OBD-II Telemetry:' : 'Telemetría Bluetooth TFT SmartXonnect y Cable OBD-II:'}</strong>{' '}
                      {isEn
                        ? 'Odometer, battery voltage/health, fuel level, ride mode, and engine parameters read via Web Bluetooth or OBD-II are used solely to update your motorcycle dashboard and predictive maintenance.'
                        : 'El kilometraje, voltaje/salud de batería, nivel de gasolina, modo de manejo y parámetros leídos desde el tablero TFT o cable OBD-II se utilizan únicamente para actualizar tu Cockpit y el Mantenimiento Predictivo de tu moto.'}
                    </li>
                    <li>
                      <strong>{isEn ? 'Emergency Medical Card (SOS) & GPS:' : 'Ficha Médica de Emergencia (SOS) y Ubicación GPS:'}</strong>{' '}
                      {isEn
                        ? 'Blood type (RH), allergies, EPS/insurance, and GPS coordinates are processed only on your screen or when you explicitly press the SOS Tow / Clan Alert button.'
                        : 'Tu grupo sanguíneo (Factor RH), alergias, EPS/ARL y coordenadas GPS solo se muestran cuando abres el módulo SOS para paramédicos o cuando pulsas voluntariamente el botón de auxilio/grúa.'}
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800">
                  <h4 className="text-xs font-mono font-bold uppercase text-cyan-400 mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-4 h-4" />
                    {isEn ? '1.2 Database Isolation (RLS) & AI Processing' : '1.2 Aislamiento en Nube (RLS) y Procesamiento con IA'}
                  </h4>
                  <p className="text-xs text-neutral-300">
                    {isEn
                      ? 'All cloud data is protected by PostgreSQL Row-Level Security (RLS) policies in Supabase (`auth.uid() = user_id`), ensuring no other user can read your garage or documents. Queries to the AI Traffic Lawyer, Doctor Motor AI, and Document OCR Scanner are routed through our secure serverless gateway without exposing API keys or training public AI models with your personal documents.'
                      : 'Todos los datos sincronizados en la nube cuentan con aislamiento criptográfico por fila (Row-Level Security — RLS en Supabase bajo `auth.uid() = user_id`), impidiendo que terceros accedan a tu garaje o documentos. Las consultas al Abogado Vial IA, Doctor Motor IA y Escáner OCR se procesan mediante nuestro Gateway seguro sin entrenar modelos públicos con tus fotos privadas.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800">
                  <h4 className="text-xs font-mono font-bold uppercase text-emerald-400 mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    {isEn ? '1.3 Your Rights (Access, Export & Deletion)' : '1.3 Derechos del Titular (Acceso, Exportación y Eliminación Total)'}
                  </h4>
                  <p className="text-xs text-neutral-300">
                    {isEn
                      ? 'You may inspect, modify, export a full JSON backup of your data, or permanently wipe your garage and local/cloud records at any time directly from the Settings (⚙️) menu inside the app.'
                      : 'Como titular de tus datos puedes conocer, actualizar, rectificar, descargar una copia completa en formato JSON o restablecer/eliminar permanentemente tus datos desde el botón de Ajustes (⚙️) de la aplicación en cualquier momento.'}
                  </p>
                </div>
              </div>
            </>
          )}

          {activeTab === 'terms' && (
            <>
              <div className="p-4 rounded-2xl bg-amber-950/25 border border-amber-500/35 flex items-start gap-3">
                <Scale className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-white font-racing uppercase">
                    {isEn
                      ? 'Terms & Conditions of Use — MotoDash AI Platform'
                      : 'Términos y Condiciones Generales de Uso — MotoDash AI'}
                  </h3>
                  <p className="text-xs text-neutral-300 mt-1">
                    {isEn
                      ? 'By accessing or using MotoDash AI, you agree to these Terms of Service designed to keep your motorcycle, your legal standing, and our biker community safe.'
                      : 'Al acceder y utilizar MotoDash AI, aceptas las presentes condiciones de uso diseñadas para proteger tu seguridad vial, la integridad mecánica de tu motocicleta y la convivencia de nuestra comunidad motera.'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800">
                  <h4 className="text-xs font-mono font-bold uppercase text-amber-400 mb-1.5">
                    {isEn ? '2.1 License of Use & Account Responsibility' : '2.1 Licencia de Uso y Responsabilidad de la Cuenta'}
                  </h4>
                  <p className="text-xs text-neutral-300">
                    {isEn
                      ? 'MotoDash AI grants you a personal, non-exclusive, revocable license to use the intelligent cockpit, maintenance tracker, and AI assistants. You are responsible for maintaining the confidentiality of your login credentials and your 4-digit Checkpoint PIN.'
                      : 'MotoDash AI te otorga una licencia personal, intransferible y no exclusiva para utilizar el cockpit digital, el sistema de mantenimiento predictivo y los asistentes de IA. Eres responsable de la veracidad de los documentos cargados en tu Guantera Digital y del resguardo de tu PIN de bloqueo.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800">
                  <h4 className="text-xs font-mono font-bold uppercase text-cyan-400 mb-1.5">
                    {isEn ? '2.2 Certified Marketplace & Verifiable Maintenance History' : '2.2 Compra/Venta con Historial Certificado'}
                  </h4>
                  <p className="text-xs text-neutral-300">
                    {isEn
                      ? 'When you generate a Certified History Sheet to sell your motorcycle, you certify that the recorded odometer readings and maintenance logs are truthful. MotoDash AI acts as a technological logbook and does not intervene as a broker or guarantor in private vehicle sales.'
                      : 'Al generar el Certificado de Hoja de Vida para poner en venta tu motocicleta, declaras que los kilometrajes y mantenimientos registrados corresponden a la realidad. MotoDash AI actúa como bitácora tecnológica certificada y no cobra comisiones ni actúa como intermediario financiero en la compraventa entre particulares.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800">
                  <h4 className="text-xs font-mono font-bold uppercase text-emerald-400 mb-1.5">
                    {isEn ? '2.3 Subscriptions, 7-Day Free Trial & Cancellation' : '2.3 Planes de Suscripción y Prueba Gratuita de 7 Días'}
                  </h4>
                  <p className="text-xs text-neutral-300">
                    {isEn
                      ? 'All paid plans (Rider Solo, Rider Pro, and Garage Pro) include a 7-day free trial. You may cancel or switch plans at any time without penalty.'
                      : 'Todos los planes (Rider Solo, Rider Pro y Garaje/Taller Pro) incluyen 7 días de prueba gratuita. Puedes cancelar o cambiar de modalidad (mensual o anual) en cualquier momento sin cláusulas de permanencia.'}
                  </p>
                </div>
              </div>
            </>
          )}

          {activeTab === 'clans' && (
            <>
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex items-start gap-3">
                <Crown className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-white font-racing uppercase">
                    {isEn
                      ? 'Official Biker Clan Policy, AI Scope & Road Safety'
                      : 'Política Oficial de Clanes Moteros, Alcance de la IA y Seguridad Vial'}
                  </h3>
                  <p className="text-xs text-neutral-300 mt-1">
                    {isEn
                      ? 'Specific rules governing Private Biker Clans, the AI Traffic Lawyer, Doctor Motor AI, and safe riding practices.'
                      : 'Normas específicas que regulan la creación de Clanes Moteros Privados, el uso del Abogado Vial IA, el Doctor Motor IA y la conducción segura.'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-neutral-900/80 border border-amber-500/40">
                  <h4 className="text-xs font-mono font-bold uppercase text-amber-400 mb-1.5 flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {isEn
                      ? '3.1 Official Clan Governance & Mandatory Founder VIP Membership'
                      : '3.1 Gobernanza de Clanes Moteros e Inclusión Obligatoria del Fundador VIP'}
                  </h4>
                  <p className="text-xs text-neutral-200">
                    {isEn
                      ? 'Motoclubs and independent groups may create Private Clans with their own custom logos and invite codes. By mandatory platform policy, the Platform Founder ("👑 Anderson • Fundador VIP") is automatically and permanently registered as an honorary founder and supervisor in every clan created on MotoDash AI to guarantee security, support, and compliance with community standards.'
                      : 'Todo grupo o motoclub puede crear su Clan Privado con su propio escudo/logo y código de invitación. Por política oficial e irrevocable de MotoDash AI, el usuario Fundador de la plataforma («👑 Anderson • Fundador VIP») queda incluido de manera automática y permanente en todos los clanes creados, garantizando la supervisión de seguridad, soporte técnico y respeto de las normas de la comunidad.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800">
                  <h4 className="text-xs font-mono font-bold uppercase text-indigo-400 mb-1.5 flex items-center gap-1.5">
                    <Scale className="w-4 h-4" />
                    {isEn
                      ? '3.2 Scope of the AI Traffic Lawyer & Doctor Motor AI'
                      : '3.2 Alcance Orientativo del Abogado Vial IA y Doctor Motor IA'}
                  </h4>
                  <p className="text-xs text-neutral-300">
                    {isEn
                      ? 'The AI Traffic Lawyer provides instant legal guidance based on national traffic codes (such as Law 769 of 2002 in Colombia and international equivalents) to help riders understand their rights at checkpoints, but does not replace formal legal representation before traffic authorities. Likewise, Doctor Motor AI provides reference mechanical diagnostics and estimated repair costs that must always be verified by a certified mechanic.'
                      : 'El Asesor Jurídico Vial IA brinda orientación legal inmediata basada en los códigos nacionales de tránsito (Ley 769 de 2002 en Colombia y normativas homólogas de cada país) para defender tus derechos en retenes, pero no sustituye la representación formal de un abogado en audiencias administrativas. Del mismo modo, los diagnósticos y costos del Doctor Motor IA son guías técnicas preventivas que deben ser confirmadas en un taller calificado.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/35">
                  <h4 className="text-xs font-mono font-bold uppercase text-red-400 mb-1.5 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    {isEn
                      ? '3.3 Hands-Free Road Safety Disclaimer'
                      : '3.3 Seguridad Vial: Prohibición de Manipular el Celular en Movimiento'}
                  </h4>
                  <p className="text-xs text-neutral-300">
                    {isEn
                      ? 'Always keep your eyes on the road. Configure your TFT link, route, or cockpit theme before riding, and only interact with modals (Glovebox, AI Lawyer, Clans, or Maintenance) when your motorcycle is completely stopped in a safe place.'
                      : 'La vida del piloto es la prioridad número uno. Configura tu enlace TFT, ruta o carátula antes de arrancar, y jamás escribas ni manipules los menús (Guantera, Abogado IA, Clanes o Mantenimiento) mientras la motocicleta esté en movimiento.'}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer del Modal */}
        <div className="p-4 sm:p-5 border-t border-neutral-800 bg-neutral-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] font-mono text-neutral-400 text-center sm:text-left">
            {isEn
              ? 'Protected by SSL/TLS Encryption, Supabase RLS & Local Offline Vault'
              : 'Protegido con Cifrado SSL/TLS, Aislamiento RLS en Nube y Bóveda Local Offline'}
          </span>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-racing font-black uppercase tracking-wider text-xs transition shadow-lg shadow-amber-500/20"
          >
            {isEn ? 'Understood & Accept' : 'Entendido y Aceptar'}
          </button>
        </div>
      </div>
    </div>
  );
}
