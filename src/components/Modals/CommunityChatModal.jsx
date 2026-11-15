import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Send,
  AlertTriangle,
  Compass,
  Wrench,
  MessageSquare,
  ShieldCheck,
  MapPin,
  Bike,
  Radio,
  X
} from 'lucide-react';
import { supabase, getAuthenticatedUserId } from '../../services/supabaseClient';

const COMMUNITY_CHANNELS = [
  { id: 'medellin', label: '🇨🇴 Medellín & Valle de Aburrá', type: 'city', city: 'Medellín' },
  { id: 'bogota', label: '🇨🇴 Bogotá & Sabana', type: 'city', city: 'Bogotá' },
  { id: 'cdmx', label: '🇲🇽 CDMX & Ruta Sur', type: 'city', city: 'CDMX' },
  { id: 'madrid', label: '🇪🇸 Madrid & Sierra', type: 'city', city: 'Madrid' },
  { id: 'apache_rtr', label: '🏍️ Club TVS Apache RTR / Street', type: 'bike', city: 'Global' },
  { id: 'sport_racing', label: '🏁 Alto Cilindrada & Racing', type: 'bike', city: 'Global' }
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
  ]
};

export default function CommunityChatModal({
  isOpen,
  onClose,
  bike,
  userProfile
}) {
  if (!isOpen) return null;

  const identity = bike?.config?.bikeIdentity || {};
  const bikeLabel = `${identity.brand || 'Moto'} ${identity.model || ''}`.trim();

  const [activeChannel, setActiveChannel] = useState('medellin');
  const [selectedCategory, setSelectedCategory] = useState('rodada');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function loadChannelMessages() {
      const authUid = await getAuthenticatedUserId();
      if (!authUid) {
        if (isMounted) {
          setMessages(FALLBACK_MESSAGES[activeChannel] || FALLBACK_MESSAGES.medellin);
        }
        return;
      }

      const { data, error } = await supabase
        .from('community_messages')
        .select('*')
        .eq('channel_id', activeChannel)
        .order('created_at', { ascending: true })
        .limit(50);

      if (isMounted) {
        if (!error && Array.isArray(data) && data.length > 0) {
          setMessages(data);
        } else {
          setMessages(FALLBACK_MESSAGES[activeChannel] || FALLBACK_MESSAGES.medellin);
        }
      }
    }

    loadChannelMessages();

    // Suscripción en tiempo real mediante Supabase Realtime
    const channelSub = supabase
      .channel(`community_room_${activeChannel}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `channel_id=eq.${activeChannel}`
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
  }, [activeChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const cleanText = newMessage.trim();
    if (!cleanText) return;

    setSending(true);
    const authorName = userProfile?.fullName || 'Piloto MotoDash';
    const currentChannelObj = COMMUNITY_CHANNELS.find((c) => c.id === activeChannel);

    try {
      const authUid = await getAuthenticatedUserId();
      if (authUid) {
        const { data, error } = await supabase
          .from('community_messages')
          .insert({
            user_id: authUid,
            channel_id: activeChannel,
            category: selectedCategory,
            author_name: authorName,
            author_bike: bikeLabel,
            author_verified: true,
            content: cleanText,
            city: currentChannelObj?.city || 'Medellín'
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

      // Modo visitante / sin sesión activa: agrega al feed local de demostración
      const localMsg = {
        id: `local_${Date.now()}`,
        channel_id: activeChannel,
        category: selectedCategory,
        author_name: authorName,
        author_bike: bikeLabel,
        author_verified: Boolean(userProfile),
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
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl text-white flex flex-col h-[88vh] max-h-[780px]">
        {/* ENCABEZADO DE COMUNIDAD EN TIEMPO REAL */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span>{realtimeConnected ? 'SUPABASE REALTIME ACTIVO' : 'CANAL MOTERO EN VIVO'}</span>
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-racing uppercase tracking-wider text-white mt-0.5">
                Comunidad Motera & Radar de Rodadas
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

        {/* SELECTOR DE CANALES SEGMENTADOS POR CIUDAD Y TIPO DE MOTO */}
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
                    ? 'bg-amber-500 text-black font-bold border-amber-400 shadow-md'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                {ch.label}
              </button>
            );
          })}
        </div>

        {/* FEED DE MENSAJES EN TIEMPO REAL */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
          {messages.map((msg) => {
            const cat = MESSAGE_CATEGORIES.find((c) => c.id === msg.category) || MESSAGE_CATEGORIES[2];
            const timeStr = msg.created_at
              ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Ahora';

            return (
              <div
                key={msg.id}
                className="p-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-800/90 hover:border-neutral-700 transition"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      {msg.author_name}
                      {msg.author_verified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" title="Piloto Verificado" />
                      )}
                    </span>
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

        {/* COMPOSITOR DE MENSAJES Y ALERTAS RÁPIDAS */}
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
              placeholder={`Coordinar rodada, ruta o consulta técnica desde tu ${bikeLabel}...`}
              maxLength={500}
              className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-racing font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Publicar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

