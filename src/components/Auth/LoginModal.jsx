import React, { useState } from 'react';
import { Mail, Lock, X, ArrowRight, Sparkles, Crown, AlertCircle, UserPlus } from 'lucide-react';
import AppLogo from '../Common/AppLogo';
import { supabase } from '../../services/supabaseClient';

export const FOUNDER_VIP_EMAILS = [
  'anderson1125@gmail.com'
];

export function isFounderVipEmail(email = '') {
  return FOUNDER_VIP_EMAILS.includes(String(email).trim().toLowerCase());
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const cleanEmail = email.trim().toLowerCase();
    const isVip = isFounderVipEmail(cleanEmail);

    try {
      let authUser = null;

      if (isRegisterMode) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            data: {
              full_name: cleanEmail.split('@')[0] || 'Piloto Rider',
              plan: 'solo'
            }
          }
        });
        if (error) throw new Error(error.message || 'No se pudo registrar la cuenta.');
        authUser = data?.user;
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password
        });
        if (error || !data?.user) {
          throw new Error(error?.message === 'Invalid login credentials'
            ? 'Correo o contraseña incorrectos. Verifica tus credenciales.'
            : (error?.message || 'Credenciales inválidas'));
        }
        authUser = data.user;
      }

      if (!authUser?.id) {
        throw new Error('Autenticación incompleta. Revisa tu correo o intenta nuevamente.');
      }

      const pilotProfile = {
        id: authUser.id,
        fullName:
          authUser.user_metadata?.full_name ||
          (isVip ? 'Anderson • Fundador VIP' : cleanEmail.split('@')[0] || 'Piloto Rider'),
        email: cleanEmail,
        phone: authUser.user_metadata?.phone || '',
        city: 'Medellín',
        country: 'Colombia',
        plan: isVip ? 'founder_vip' : authUser.user_metadata?.plan || 'solo',
        isPro: isVip || Boolean(authUser.user_metadata?.is_pro),
        isLifetimeVip: isVip
      };

      setLoading(false);
      onLoginSuccess(pilotProfile);
      onClose();
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'No se pudo iniciar sesión. Verifica tu correo y contraseña.');
    }
  };

  const handleQuickDemo = () => {
    const demoProfile = {
      fullName: 'Daniel Gómez (Demo)',
      email: 'demo@motodash.com',
      phone: '+57 312 987 6543',
      city: 'Medellín',
      country: 'Colombia',
      plan: 'pro_monthly',
      isPro: true,
      isLifetimeVip: false
    };
    onLoginSuccess(demoProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-white">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <AppLogo variant="full" size="lg" className="justify-center mb-2" />
          <h2 className="text-lg font-black font-racing uppercase tracking-wider text-white">
            {isRegisterMode ? 'Crear Cuenta de Piloto' : 'Iniciar Sesión'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            Garaje blindado con Row Level Security (RLS) en Supabase
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-xs text-red-300 flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-mono text-neutral-300 block mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              <input
                type="email"
                placeholder="piloto@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            {isFounderVipEmail(email) && (
              <span className="text-[10px] font-mono text-amber-400 mt-1 flex items-center gap-1">
                <Crown className="w-3 h-3" /> Cuenta Fundador VIP detectada (Requiere contraseña autenticada)
              </span>
            )}
          </div>

          <div>
            <label className="text-xs font-mono text-neutral-300 block mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                minLength={6}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-bold font-racing uppercase tracking-wider text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/20 hover:opacity-90 flex items-center justify-center gap-1.5 transition active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? 'Autenticando...' : isRegisterMode ? 'Registrar Cuenta Segura' : 'Ingresar a Mi Garaje'}
            {!loading && (isRegisterMode ? <UserPlus className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />)}
          </button>
        </form>

        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setErrorMsg('');
            }}
            className="text-xs font-mono text-amber-400 hover:underline"
          >
            {isRegisterMode ? '¿Ya tienes cuenta? Inicia sesión aquí' : '¿Nuevo piloto? Crea tu cuenta gratis'}
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-neutral-800 text-center">
          <span className="text-xs text-neutral-500 block mb-2 font-mono">¿Quieres explorar en modo visitante?</span>
          <button
            type="button"
            onClick={handleQuickDemo}
            className="w-full py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-neutral-700 text-xs font-racing font-bold flex items-center justify-center gap-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Acceso Rápido Modo Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
