import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Send,
  Compass,
  Wrench,
  MessageSquare,
  ShieldCheck,
  Bike,
  Radio,
  Shield,
  Plus,
  Crown,
  Lock,
  Unlock,
  Upload,
  KeyRound,
  Sparkles,
  CheckCircle2,
  X
} from 'lucide-react';
import { supabase, getAuthenticatedUserId } from '../../services/supabaseClient';
import { isFounderVipEmail } from '../Auth/LoginModal';
import { useLanguage } from '../../i18n/LanguageContext';

const OFFICIAL_FOUNDER_NAME = 'Anderson • Fundador VIP';
const OFFICIAL_FOUNDER_ROLE_LABEL = 'Fundador MotoDash AI (Miembro Permanente por Política)';

const COMMUNITY_CHANNELS = [
  { id: 'medellin', label: '🇨🇴 Medellín & Valle de Aburrá', type: 'city', city: 'Medellín' },
  { id: 'bogota', label: '🇨🇴 Bogotá & Sabana', type: 'city', city: 'Bogotá' },
  { id: 'cdmx', label: '🇲🇽 CDMX & Ruta Sur', type: 'city', city: 'CDMX' },
  { id: 'madrid', label: '🇪🇸 Madrid & Sierra', type: 'city', city: 'Madrid' },
  { id: 'apache_rtr', label: '🏍️ Club TVS Apache RTR / Street', type: 'bike', city: 'Global' },
  { id: 'sport_racing', label: '🏁 Alto Cilindrada & Racing', type: 'bike', city: 'Global' }
];

const DEFAULT_CLANS = [
  {
    id: 'clan_default_apache',
    slug: 'apache-rtr-medellin',
    name: 'Clan Apache RTR Antioquia',
    tag: 'RTR-MDE',
    motto: 'Potencia 4V, rutas de montaña y hermandad en Antioquia',
    city: 'Medellín',
    country: 'Colombia',
    logo_url: null,
    accent_color: '#EF4444',
    is_private: true,
    invite_code: 'RTR4V1',
    creator_name: 'Anderson • Fundador VIP',
    founder_name: OFFICIAL_FOUNDER_NAME,
    member_count: 18
  },
  {
    id: 'clan_default_night',
    slug: 'night-riders-colombia',
    name: 'Night Riders Street Club',
    tag: 'NIGHT-CO',
    motto: 'Rodadas nocturnas seguras y telemetría oficial',
    city: 'Medellín / Bogotá',
    country: 'Colombia',
    logo_url: null,
    accent_color: '#6366F1',
    is_private: true,
    invite_code: 'NIGHT9',
    creator_name: 'Capitán Ruta Nocturna',
    founder_name: OFFICIAL_FOUNDER_NAME,
    member_count: 24
  }
];

const CLAN_COLOR_PRESETS = [
  { hex: '#EF4444', name: 'Racing Red' },
  { hex: '#F59E0B', name: 'Amber Gold' },
  { hex: '#10B981', name: 'Emerald Nitro' },
  { hex: '#6366F1', name: 'Indigo Cyber' },
  { hex: '#06B6D4', name: 'Cyan Apex' },
  { hex: '#EC4899', name: 'Neon Corsa' }
];

const MESSAGE_CATEGORIES = [
  { id: 'rodada', label: '🏍️ Convocar Rodada / Ruta', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: Compass },
  { id: 'taller', label: '🔧 Taller & Mecánica', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', icon: Wrench },
  { id: 'general', label: '💬 Charla Motera', color: 'bg-neutral-800 text-neutral-300 border-neutral-700', icon: MessageSquare }
];

const FALLBACK_MESSAGES = {
  medellin: [
    {
      id: 'seed_1',
      channel_id: 'medellin',
      category: 'rodada',
      author_name: 'Club Rutas Antioquia',
      author_bike: 'TVS Apache RTR 4V',
      author_verified: true,
      content: '¡Bienvenidos al canal de Comunidad y Rodadas de Medellín! Este domingo salimos a las 7:00 AM hacia Santa Fe de Antioquia.',
      created_at: new Date(Date.now() - 1800000).toISOString()
    }
  ],
  apache_rtr: [
    {
      id: 'seed_3',
      channel_id: 'apache_rtr',
      category: 'taller',
      author_name: 'Comunidad Apache RTR Oficial',
      author_bike: 'TVS Apache RTR 160 4V FI NG',
      author_verified: true,
      content: 'Tip para las Apache 160 4V FI NG: usar aceite 10W-40 Sintético y sellar las garantías de 500 km y 2.500 km en Auteco.',
      created_at: new Date(Date.now() - 900000).toISOString()
    }
  ],
  'clan_apache-rtr-medellin': [
    {
      id: 'seed_clan_1',
      channel_id: 'clan_apache-rtr-medellin',
      category: 'rodada',
      author_name: OFFICIAL_FOUNDER_NAME,
      author_bike: 'TVS Apache RTR 160 4V FI NG',
      author_verified: true,
      content: '👑 ¡Bienvenidos al espacio privado del Clan Apache RTR Antioquia! Por política oficial de MotoDash AI, cada clan cuenta con sala exclusiva, logo propio y respaldo directo del Fundador.',
      created_at: new Date(Date.now() - 1200000).toISOString()
    }
  ],
  'clan_night-riders-colombia': [
    {
      id: 'seed_clan_2',
      channel_id: 'clan_night-riders-colombia',
      category: 'rodada',
      author_name: OFFICIAL_FOUNDER_NAME,
      author_bike: 'TVS Apache RTR 160 4V FI NG',
      author_verified: true,
      content: '👑 Sala privada verificada para Night Riders Street Club. Punto de encuentro de esta noche: Palmas Mirador 8:30 PM.',
      created_at: new Date(Date.now() - 950000).toISOString()
    }
  ]
};

/**
 * Comprime el logo del clan en el navegador (<canvas> 220x220 WebP/JPEG)
 * para que cargue al instante sin saturar la base de datos.
 */
async function compressClanLogo(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const size = 220;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, size, size);

        const ratio = Math.min(size / img.width, size / img.height);
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const x = Math.round((size - w) / 2);
        const y = Math.round((size - h) / 2);
        ctx.drawImage(img, x, y, w, h);

        resolve(canvas.toDataURL('image/webp', 0.84));
      };
      img.onerror = reject;
      img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function CommunityChatModal({
  isOpen,
  onClose,
  bike,
  userProfile
}) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const isFounderUser = Boolean(
    userProfile?.plan === 'founder_vip' ||
    userProfile?.isLifetimeVip ||
    isFounderVipEmail(userProfile?.email)
  );

  // Modo de vista: 'clans' (Clanes con logo propio y sala privada) | 'channels' (Canales abiertos por ciudad/moto)
  const [viewMode, setViewMode] = useState('clans');
  const [clans, setClans] = useState(() => {
    try {
      const saved = localStorage.getItem('motodash_custom_clans');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_CLANS;
  });

  const [activeClanSlug, setActiveClanSlug] = useState('apache-rtr-medellin');
  const [activeChannel, setActiveChannel] = useState('medellin');
  const [unlockedClans, setUnlockedClans] = useState(() => {
    try {
      const saved = localStorage.getItem('motodash_unlocked_clans');
      return saved ? JSON.parse(saved) : ['apache-rtr-medellin'];
    } catch {
      return ['apache-rtr-medellin'];
    }
  });
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [rsvpClans, setRsvpClans] = useState({});

  // Modal interno para crear un nuevo Clan Motero con logo propio
  const [isCreateClanOpen, setIsCreateClanOpen] = useState(false);
  const [clanName, setClanName] = useState('');
  const [clanTag, setClanTag] = useState('');
  const [clanMotto, setClanMotto] = useState('');
  const [clanCity, setClanCity] = useState(userProfile?.city || 'Medellín');
  const [clanColor, setClanColor] = useState('#EF4444');
  const [clanIsPrivate, setClanIsPrivate] = useState(true);
  const [clanInviteCode, setClanInviteCode] = useState('MOTO4V');
  const [clanLogoDataUrl, setClanLogoDataUrl] = useState(null);
  const [creatingClan, setCreatingClan] = useState(false);
  const logoInputRef = useRef(null);

  const [selectedCategory, setSelectedCategory] = useState('rodada');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const messagesEndRef = useRef(null);

  const effectiveChannelId =
    viewMode === 'clans' ? `clan_${activeClanSlug}` : activeChannel;

  // Cargar clanes desde Supabase al abrir
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    async function fetchClans() {
      const { data, error } = await supabase
        .from('moto_clans')
        .select('*')
        .order('created_at', { ascending: false });

      if (isMounted && !error && Array.isArray(data) && data.length > 0) {
        // Garantizar siempre en UI que founder_name sea el Fundador por política
        const normalized = data.map((c) => ({
          ...c,
          founder_name: OFFICIAL_FOUNDER_NAME
        }));
        setClans(normalized);
        try {
          localStorage.setItem('motodash_custom_clans', JSON.stringify(normalized));
        } catch {}
      }
    }

    fetchClans();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Cargar mensajes del canal o clan activo + suscripción Realtime
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    async function loadChannelMessages() {
      const authUid = await getAuthenticatedUserId();
      const defaultMsgs = FALLBACK_MESSAGES[effectiveChannelId] || [
        {
          id: `welcome_${effectiveChannelId}`,
          channel_id: effectiveChannelId,
          category: 'rodada',
          author_name: OFFICIAL_FOUNDER_NAME,
          author_bike: 'TVS Apache RTR 160 4V FI NG',
          author_verified: true,
          is_founder: true,
          content: `👑 Sala privada del clan activada. Por política oficial de MotoDash AI, ${OFFICIAL_FOUNDER_NAME} hace parte de este grupo como miembro fundador garante.`,
          created_at: new Date().toISOString()
        }
      ];

      if (!authUid) {
        if (isMounted) setMessages(defaultMsgs);
        return;
      }

      const { data, error } = await supabase
        .from('community_messages')
        .select('*')
        .eq('channel_id', effectiveChannelId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (isMounted) {
        if (!error && Array.isArray(data) && data.length > 0) {
          setMessages(data);
        } else {
          setMessages(defaultMsgs);
        }
      }
    }

    loadChannelMessages();

    const channelSub = supabase
      .channel(`community_room_${effectiveChannelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `channel_id=eq.${effectiveChannelId}`
        },
        (payload) => {
          if (payload?.new && isMounted) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
          }
        }
      )
      .subscribe((status) => {
        if (isMounted) setRealtimeConnected(status === 'SUBSCRIBED');
      });

    return () => {
      isMounted = false;
      supabase.removeChannel(channelSub);
    };
  }, [isOpen, effectiveChannelId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const identity = bike?.config?.bikeIdentity || {};
  const bikeLabel = `${identity.brand || 'Moto'} ${identity.model || ''}`.trim();
  const currentClan = clans.find((c) => c.slug === activeClanSlug) || clans[0] || DEFAULT_CLANS[0];

  // El Fundador VIP o el creador o quien haya desbloqueado el clan tiene acceso directo al espacio privado
  const hasClanAccess =
    isFounderUser ||
    !currentClan?.is_private ||
    unlockedClans.includes(currentClan?.slug) ||
    currentClan?.creator_name === userProfile?.fullName;

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressClanLogo(file);
      setClanLogoDataUrl(dataUrl);
    } catch (err) {
      console.warn('Error procesando logo del clan:', err);
    }
  };

  const handleCreateClan = async (e) => {
    e.preventDefault();
    const cleanName = clanName.trim();
    if (!cleanName) return;

    setCreatingClan(true);
    const cleanTag = (clanTag.trim() || cleanName.slice(0, 6)).toUpperCase().replace(/[^A-Z0-9-]/g, '');
    const slug = `${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
    const cleanInvite = (clanInviteCode.trim() || 'CLAN4V').toUpperCase();
    const creatorLabel = userProfile?.fullName || 'Líder de Clan';

    const newClanObject = {
      id: `clan_${Date.now()}`,
      slug,
      name: cleanName,
      tag: cleanTag || 'CLAN',
      motto: clanMotto.trim() || 'Hermandad en dos ruedas, nadie se queda atrás',
      city: clanCity.trim() || 'Medellín',
      country: userProfile?.country || 'Colombia',
      logo_url: clanLogoDataUrl,
      accent_color: clanColor,
      is_private: clanIsPrivate,
      invite_code: cleanInvite,
      creator_name: creatorLabel,
      // POLÍTICA OBLIGATORIA: En todo clan creado se incluye siempre al usuario Fundador
      founder_name: OFFICIAL_FOUNDER_NAME,
      founder_policy_enforced: true,
      member_count: 2
    };

    try {
      const authUid = await getAuthenticatedUserId();
      if (authUid) {
        const { data, error } = await supabase
          .from('moto_clans')
          .insert({
            slug: newClanObject.slug,
            name: newClanObject.name,
            tag: newClanObject.tag,
            motto: newClanObject.motto,
            city: newClanObject.city,
            country: newClanObject.country,
            logo_url: newClanObject.logo_url,
            accent_color: newClanObject.accent_color,
            is_private: newClanObject.is_private,
            invite_code: newClanObject.invite_code,
            creator_id: authUid,
            creator_name: creatorLabel,
            founder_name: OFFICIAL_FOUNDER_NAME
          })
          .select()
          .single();

        if (!error && data) {
          newClanObject.id = data.id;
        }
      }

      const nextClans = [newClanObject, ...clans];
      setClans(nextClans);
      const nextUnlocked = Array.from(new Set([...unlockedClans, slug]));
      setUnlockedClans(nextUnlocked);
      try {
        localStorage.setItem('motodash_custom_clans', JSON.stringify(nextClans));
        localStorage.setItem('motodash_unlocked_clans', JSON.stringify(nextUnlocked));
      } catch {}

      setActiveClanSlug(slug);
      setViewMode('clans');
      setIsCreateClanOpen(false);
      setClanName('');
      setClanTag('');
      setClanMotto('');
      setClanLogoDataUrl(null);
    } finally {
      setCreatingClan(false);
    }
  };

  const handleUnlockClan = async (e) => {
    e.preventDefault();
    if (!currentClan) return;
    const cleanCode = inviteCodeInput.trim().toUpperCase();

    try {
      const authUid = await getAuthenticatedUserId();
      if (authUid) {
        const { data } = await supabase.rpc('join_moto_clan_with_code', {
          p_clan_slug: currentClan.slug,
          p_invite_code: cleanCode,
          p_member_name: userProfile?.fullName || 'Piloto Clan',
          p_member_bike: bikeLabel
        });
        if (data?.success) {
          const nextUnlocked = Array.from(new Set([...unlockedClans, currentClan.slug]));
          setUnlockedClans(nextUnlocked);
          setInviteCodeInput('');
          setInviteError('');
          localStorage.setItem('motodash_unlocked_clans', JSON.stringify(nextUnlocked));
          return;
        }
      }
    } catch {}

    if (cleanCode === String(currentClan.invite_code || '').toUpperCase()) {
      const nextUnlocked = Array.from(new Set([...unlockedClans, currentClan.slug]));
      setUnlockedClans(nextUnlocked);
      setInviteCodeInput('');
      setInviteError('');
      try {
        localStorage.setItem('motodash_unlocked_clans', JSON.stringify(nextUnlocked));
      } catch {}
    } else {
      setInviteError(
        isEn
          ? 'Invalid clan invite code. Ask the clan leader or Founder VIP.'
          : 'Código de invitación incorrecto. Solicítalo al líder del clan.'
      );
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const cleanText = newMessage.trim();
    if (!cleanText) return;

    setSending(true);
    const authorName = isFounderUser
      ? OFFICIAL_FOUNDER_NAME
      : userProfile?.fullName || 'Piloto MotoDash';
    const currentChannelObj = COMMUNITY_CHANNELS.find((c) => c.id === activeChannel);

    try {
      const authUid = await getAuthenticatedUserId();
      if (authUid) {
        const { data, error } = await supabase
          .from('community_messages')
          .insert({
            user_id: authUid,
            channel_id: effectiveChannelId,
            category: selectedCategory,
            author_name: authorName,
            author_bike: bikeLabel,
            author_verified: true,
            content: cleanText,
            city: viewMode === 'clans' ? currentClan?.city || 'Medellín' : currentChannelObj?.city || 'Medellín'
          })
          .select()
          .single();

        if (!error && data) {
          setMessages((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data]));
          setNewMessage('');
          setSending(false);
          return;
        }
      }

      const localMsg = {
        id: `local_${Date.now()}`,
        channel_id: effectiveChannelId,
        category: selectedCategory,
        author_name: authorName,
        author_bike: bikeLabel,
        author_verified: Boolean(userProfile || isFounderUser),
        content: cleanText,
        created_at: new Date().toISOString()
      };
      setMessages((prev) => [...prev, localMsg]);
      setNewMessage('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-neutral-950 border-2 border-amber-500/40 rounded-3xl max-w-5xl w-full p-4 sm:p-6 shadow-[0_0_50px_rgba(245,158,11,0.16)] text-white flex flex-col h-[92vh] max-h-[840px]">
        {/* ENCABEZADO DE COMUNIDAD Y CLANES MOTEROS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span>{realtimeConnected ? 'SUPABASE REALTIME ACTIVO' : 'CLANES & COMUNIDAD EN VIVO'}</span>
                </span>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" />
                  <span>Fundador en todos los Clanes: {OFFICIAL_FOUNDER_NAME}</span>
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black font-racing uppercase tracking-wider text-white mt-0.5">
                {isEn
                  ? 'Biker Clans, Custom Club Logos & Live Community'
                  : 'Clanes Moteros con Logo Propio & Comunidad en Vivo'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={() => setIsCreateClanOpen(!isCreateClanOpen)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-racing font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>{isEn ? 'Create Biker Clan' : 'Crear Clan Motero'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONMUTADOR ENTRE CLANES PRIVADOS Y CANALES PÚBLICOS */}
        <div className="flex items-center justify-between gap-2 py-2.5 border-b border-neutral-800/80 flex-wrap">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setViewMode('clans')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-racing font-bold uppercase tracking-wider flex items-center gap-1.5 border transition ${
                viewMode === 'clans'
                  ? 'bg-amber-500 text-black border-amber-400 shadow-md'
                  : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>🛡️ {isEn ? `Biker Clans (${clans.length})` : `Clanes & Grupos Moteros (${clans.length})`}</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('channels')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-racing font-bold uppercase tracking-wider flex items-center gap-1.5 border transition ${
                viewMode === 'channels'
                  ? 'bg-emerald-500 text-black border-emerald-400 shadow-md'
                  : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>🌐 {isEn ? 'City & Bike Channels' : 'Canales Abiertos por Ciudad'}</span>
            </button>
          </div>

          <span className="text-[11px] font-mono text-neutral-400 hidden md:inline">
            {isEn
              ? 'Each clan keeps its own logo, identity & private room'
              : 'Cada grupo motero conserva su propio logo, identidad y espacio privado'}
          </span>
        </div>

        {/* FORMULARIO DESPLEGABLE PARA CREAR UN NUEVO CLAN CON SU PROPIO LOGO */}
        {isCreateClanOpen && (
          <form
            onSubmit={handleCreateClan}
            className="my-3 p-4 rounded-2xl bg-neutral-900/95 border-2 border-amber-500/50 space-y-3 overflow-y-auto max-h-[65vh] animate-fadeIn"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black font-racing uppercase tracking-wider text-amber-300">
                  {isEn ? 'Create Official Biker Clan & Upload Club Logo' : 'Crear Nuevo Clan / Club Motero con Logo Propio'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateClanOpen(false)}
                className="text-xs font-mono text-neutral-400 hover:text-white"
              >
                {isEn ? 'Cancel' : 'Cerrar'}
              </button>
            </div>

            {/* AVISO DE POLÍTICA OBLIGATORIA: FUNDADOR INCLUIDO AUTOMÁTICAMENTE */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-start gap-2.5">
              <Crown className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] font-mono text-amber-200 leading-relaxed">
                <strong>Política Oficial de Gobernanza MotoDash AI:</strong> Al crear cualquier clan o espacio privado, tu grupo tendrá su propio logo, colores y código de acceso privado, y por políticas de la plataforma el usuario Fundador (<strong>👑 {OFFICIAL_FOUNDER_NAME}</strong>) queda incluido automáticamente como miembro fundador permanente.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* SUBIDA DEL LOGO DEL CLAN */}
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col items-center justify-center text-center">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                <div
                  onClick={() => logoInputRef.current?.click()}
                  style={{ borderColor: clanColor }}
                  className="w-16 h-16 rounded-2xl border-2 bg-neutral-900 flex items-center justify-center overflow-hidden cursor-pointer hover:scale-105 transition mb-2"
                >
                  {clanLogoDataUrl ? (
                    <img src={clanLogoDataUrl} alt="Logo Clan" className="w-full h-full object-cover" />
                  ) : (
                    <Shield className="w-8 h-8" style={{ color: clanColor }} />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" />
                  <span>{clanLogoDataUrl ? 'Cambiar Logo del Clan' : 'Subir Logo del Clan'}</span>
                </button>
              </div>

              {/* DATOS DE IDENTIDAD DEL CLAN */}
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                    Nombre del Clan / Grupo Motero *
                  </label>
                  <input
                    type="text"
                    required
                    value={clanName}
                    onChange={(e) => setClanName(e.target.value)}
                    placeholder="Ej: Lobos del Asfalto Medellín"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                    Sigla / Tag Oficial (Ej: LOBOS, RTR4V)
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={clanTag}
                    onChange={(e) => setClanTag(e.target.value)}
                    placeholder="LOBOS-MDE"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs font-mono uppercase text-amber-300"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                    Ciudad Sede
                  </label>
                  <input
                    type="text"
                    value={clanCity}
                    onChange={(e) => setClanCity(e.target.value)}
                    placeholder="Medellín"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                    Código de Acceso Privado
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={clanInviteCode}
                    onChange={(e) => setClanInviteCode(e.target.value.toUpperCase())}
                    placeholder="MOTO4V"
                    className="w-full bg-neutral-950 border border-emerald-500/50 rounded-xl px-3 py-2 text-xs font-mono uppercase text-emerald-300"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                    Lema / Identidad del Grupo
                  </label>
                  <input
                    type="text"
                    value={clanMotto}
                    onChange={(e) => setClanMotto(e.target.value)}
                    placeholder="Ej: Rodadas todos los jueves 8:00 PM • Respeto y hermandad"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* COLOR DE IDENTIDAD Y PRIVACIDAD */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-neutral-400">Color del Clan:</span>
                {CLAN_COLOR_PRESETS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setClanColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-5 h-5 rounded-full transition ${
                      clanColor === c.hex ? 'ring-2 ring-white scale-110' : 'opacity-70'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setClanIsPrivate(!clanIsPrivate)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono border flex items-center gap-1.5 ${
                    clanIsPrivate
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {clanIsPrivate ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>{clanIsPrivate ? 'Espacio Privado (Con Código)' : 'Clan Abierto'}</span>
                </button>

                <button
                  type="submit"
                  disabled={creatingClan || !clanName.trim()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-racing font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{creatingClan ? 'Creando Clan...' : 'Fundar Clan Motero'}</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* CARRUSEL DE CLANES MOTEROS (CON LOGOS PROPIOS) O CANALES PÚBLICOS */}
        {viewMode === 'clans' ? (
          <div className="space-y-2.5 pt-2.5">
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-neutral-800/80 no-scrollbar">
              {clans.map((clan) => {
                const isSelected = clan.slug === activeClanSlug;
                return (
                  <button
                    key={clan.slug}
                    type="button"
                    onClick={() => {
                      setActiveClanSlug(clan.slug);
                      setInviteError('');
                    }}
                    style={
                      isSelected
                        ? { borderColor: clan.accent_color || '#F59E0B' }
                        : undefined
                    }
                    className={`px-3 py-2 rounded-2xl text-left flex items-center gap-2.5 border-2 whitespace-nowrap transition flex-shrink-0 ${
                      isSelected
                        ? 'bg-neutral-900 text-white shadow-lg'
                        : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div
                      style={{ borderColor: clan.accent_color || '#F59E0B' }}
                      className="w-9 h-9 rounded-xl border bg-neutral-950 flex items-center justify-center overflow-hidden flex-shrink-0"
                    >
                      {clan.logo_url ? (
                        <img src={clan.logo_url} alt={clan.name} className="w-full h-full object-cover" />
                      ) : (
                        <Shield className="w-5 h-5" style={{ color: clan.accent_color || '#F59E0B' }} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-neutral-800 text-amber-300">
                          [{clan.tag}]
                        </span>
                        <span className="text-xs font-bold text-white">{clan.name}</span>
                        {clan.is_private && <Lock className="w-3 h-3 text-amber-400" />}
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400 block">
                        📍 {clan.city} • 👑 {OFFICIAL_FOUNDER_NAME}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* BANNER DE IDENTIDAD DEL CLAN SELECCIONADO + GOBERNANZA FUNDADOR */}
            {currentClan && (
              <div
                style={{ borderColor: `${currentClan.accent_color || '#F59E0B'}66` }}
                className="p-3 rounded-2xl bg-neutral-900/95 border flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    style={{ borderColor: currentClan.accent_color || '#F59E0B' }}
                    className="w-12 h-12 rounded-2xl border-2 bg-neutral-950 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md"
                  >
                    {currentClan.logo_url ? (
                      <img src={currentClan.logo_url} alt={currentClan.name} className="w-full h-full object-cover" />
                    ) : (
                      <Shield className="w-6 h-6" style={{ color: currentClan.accent_color || '#F59E0B' }} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        style={{
                          backgroundColor: `${currentClan.accent_color || '#F59E0B'}25`,
                          color: currentClan.accent_color || '#F59E0B',
                          borderColor: `${currentClan.accent_color || '#F59E0B'}60`
                        }}
                        className="text-[10px] font-mono font-black px-2 py-0.5 rounded-md border"
                      >
                        [{currentClan.tag}]
                      </span>
                      <h3 className="text-sm sm:text-base font-black font-racing uppercase text-white">
                        {currentClan.name}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
                        {currentClan.is_private ? '🔒 Sala Privada del Clan' : '🔓 Sala Abierta'}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 font-mono mt-0.5">
                      "{currentClan.motto}" • Sede: {currentClan.city}
                    </p>
                  </div>
                </div>

                {/* INSIGNIAS DE POLÍTICA OFICIAL: EL FUNDADOR SIEMPRE ESTÁ EN EL GRUPO */}
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                  <div
                    className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/15 border border-amber-400/50 text-amber-200 flex items-center gap-1.5"
                    title={OFFICIAL_FOUNDER_ROLE_LABEL}
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      <strong>Fundador Oficial:</strong> {OFFICIAL_FOUNDER_NAME}
                    </span>
                  </div>

                  <div className="px-2.5 py-1 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300">
                    🛡️ <strong>Líder:</strong> {currentClan.creator_name || 'Capitán de Clan'}
                  </div>

                  {hasClanAccess && currentClan.invite_code && (
                    <div className="px-2.5 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                      🔑 Código Clan: <strong>{currentClan.invite_code}</strong>
                    </div>
                  )}

                  {hasClanAccess && (
                    <button
                      type="button"
                      onClick={() =>
                        setRsvpClans((prev) => ({
                          ...prev,
                          [currentClan.slug]: !prev[currentClan.slug]
                        }))
                      }
                      className={`px-2.5 py-1 rounded-xl border font-bold transition flex items-center gap-1 ${
                        rsvpClans[currentClan.slug]
                          ? 'bg-emerald-500 text-black border-emerald-400'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        {rsvpClans[currentClan.slug]
                          ? `✅ Confirmado en Rodada (${(currentClan.member_count || 12) + 1} motos)`
                          : `🏍️ Confirmar Rodada (${currentClan.member_count || 12} motos)`}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-1.5 overflow-x-auto py-3 border-b border-neutral-800/80 no-scrollbar">
            {COMMUNITY_CHANNELS.map((ch) => {
              const active = ch.id === activeChannel;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setActiveChannel(ch.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap border transition ${
                    active
                      ? 'bg-emerald-500 text-black font-bold border-emerald-400 shadow-md'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  {ch.label}
                </button>
              );
            })}
          </div>
        )}

        {/* SI EL CLAN ES PRIVADO Y EL USUARIO NO HA INGRESADO EL CÓDIGO (EXCEPTO EL FUNDADOR QUE TIENE LLAVE MAESTRA) */}
        {viewMode === 'clans' && !hasClanAccess ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center my-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-3">
              <KeyRound className="w-8 h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-black font-racing uppercase text-white">
              Espacio Privado de {currentClan?.name} [{currentClan?.tag}]
            </h3>
            <p className="text-xs font-mono text-neutral-400 max-w-md mt-1">
              Este grupo motero protege su identidad y rutas privadas con código de invitación.
              (Nota: El Fundador <strong>👑 {OFFICIAL_FOUNDER_NAME}</strong> cuenta con acceso directo por política oficial).
            </p>

            <form onSubmit={handleUnlockClan} className="mt-4 flex gap-2 w-full max-w-xs">
              <input
                type="text"
                value={inviteCodeInput}
                onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                placeholder={`Código (Ej: ${currentClan?.invite_code || 'RTR4V1'})`}
                className="flex-1 bg-neutral-900 border border-amber-500/50 rounded-xl px-3 py-2 text-xs font-mono uppercase text-white text-center"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 text-black font-racing font-bold text-xs uppercase"
              >
                Entrar
              </button>
            </form>
            {inviteError && (
              <p className="text-xs font-mono text-red-400 mt-2">{inviteError}</p>
            )}
          </div>
        ) : (
          <>
            {/* FEED DE MENSAJES EN TIEMPO REAL DEL CLAN O CANAL */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
              {messages.map((msg) => {
                const cat = MESSAGE_CATEGORIES.find((c) => c.id === msg.category) || MESSAGE_CATEGORIES[2];
                const isMsgFromFounder =
                  msg.is_founder ||
                  String(msg.author_name || '').toLowerCase().includes('anderson') ||
                  String(msg.author_name || '').toLowerCase().includes('fundador');
                const timeStr = msg.created_at
                  ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Ahora';

                return (
                  <div
                    key={msg.id}
                    className={`p-3.5 rounded-2xl border transition ${
                      isMsgFromFounder
                        ? 'bg-gradient-to-r from-amber-950/35 via-neutral-900 to-neutral-900 border-amber-500/50'
                        : 'bg-neutral-900/90 border-neutral-800/90 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white flex items-center gap-1">
                          {isMsgFromFounder && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                          {msg.author_name}
                          {msg.author_verified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" title="Piloto Verificado" />
                          )}
                        </span>
                        {isMsgFromFounder && (
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500 text-black uppercase">
                            FUNDADOR OFICIAL
                          </span>
                        )}
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-neutral-950 text-amber-400 border border-neutral-800 flex items-center gap-1">
                          <Bike className="w-3 h-3" />
                          {msg.author_bike}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${cat.color}`}>
                          {cat.label}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500">{timeStr}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">{msg.content}</p>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* COMPOSITOR DE MENSAJES EN SALA PRIVADA DE CLAN O CANAL PÚBLICO */}
            <form onSubmit={handleSendMessage} className="pt-3 border-t border-neutral-800 space-y-2.5">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <span className="text-[10px] font-mono text-neutral-500 uppercase mr-1">Etiqueta:</span>
                {MESSAGE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono border whitespace-nowrap transition ${
                      selectedCategory === cat.id
                        ? cat.color
                        : 'bg-neutral-900 text-neutral-500 border-neutral-800 hover:text-neutral-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={
                    viewMode === 'clans'
                      ? `Escribe en la sala privada de ${currentClan?.name} [${currentClan?.tag}]...`
                      : 'Escribe al canal de tu ciudad o convoca una rodada...'
                  }
                  maxLength={500}
                  className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-racing font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
