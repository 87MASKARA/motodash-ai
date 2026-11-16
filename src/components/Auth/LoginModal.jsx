import React, { useState, useEffect } from 'react';
import { Mail, Lock, X, ArrowRight, Sparkles, Crown, AlertCircle, UserPlus, CheckCircle2, KeyRound } from 'lucide-react';
import AppLogo from '../Common/AppLogo';
import { supabase } from '../../services/supabaseClient';

export const FOUNDER_VIP_EMAILS = [
  'anderson1125@gmail.com'
];

export function isFounderVipEmail(email = '') {
  return FOUNDER_VIP_EMAILS.includes(String(email).trim().toLowerCase());
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess, onOpenLegal }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newRecoveryPassword, setNewRecoveryPassword] = useState('');
  const [pastedRecoveryUrl, setPastedRecoveryUrl] = useState('');
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'forgot' | 'update_password'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setAuthMode('update_password');
        setErrorMsg('');
        setSuccessMsg('Enlace de recuperación verificado. Ingresa tu nueva contraseña segura.');
      }
    });
    return () => subscription?.unsubscribe();
  }, []);

  if (!isOpen) return null;

  const isRegisterMode = authMode === 'register';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();
    const isVip = isFounderVipEmail(cleanEmail);

    try {
      if (authMode === 'forgot') {
        if (!cleanEmail) throw new Error('Ingresa tu correo electrónico para enviar el enlace de recuperación.');
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: window.location.origin
        });
        if (error) throw new Error(error.message || 'No se pudo enviar el correo de recuperación.');
        setLoading(false);
        setSuccessMsg(
          `✅ Te enviamos un enlace oficial de recuperación a ${cleanEmail}. Revisa tu bandeja de entrada o Spam y ábrelo para crear tu nueva contraseña.`
        );
        return;
      }

      if (authMode === 'update_password') {
        if (!newRecoveryPassword || newRecoveryPassword.length < 6) {
          throw new Error('La nueva contraseña debe tener al menos 6 caracteres.');
        }
        const { error } = await supabase.auth.updateUser({ password: newRecoveryPassword });
        if (error) throw new Error(error.message || 'No se pudo actualizar la contraseña.');
        setLoading(false);
        setSuccessMsg('✅ ¡Contraseña actualizada con éxito! Ya puedes iniciar sesión con tu nueva clave.');
        setAuthMode('login');
        setPassword('');
        setNewRecoveryPassword('');
        return;
      }

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
            ? 'Correo o contraseña incorrectos. Verifica tus credenciales o usa "¿Olvidaste tu contraseña?".'
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
      setErrorMsg(err.message || 'No se pudo procesar la solicitud. Verifica tus datos.');
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

  const handleApplyPastedRecoveryUrl = async () => {
    const raw = pastedRecoveryUrl.trim();
    if (!raw) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const hashPart = raw.includes('#') ? raw.split('#')[1] : '';
      const queryPart = raw.includes('?') ? raw.split('?')[1].split('#')[0] : '';
      const hashParams = new URLSearchParams(hashPart);
      const queryParams = new URLSearchParams(queryPart);

      const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
      const code = queryParams.get('code') || hashParams.get('code');
      const tokenHash = queryParams.get('token_hash') || hashParams.get('token_hash');

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        if (error) throw error;
      } else if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery'
        });
        if (error) throw error;
      } else if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) throw error;
      } else {
        throw new Error('Pega la URL completa que abrió el enlace (debe contener #access_token=..., ?token_hash=... o ?code=...).');
      }

      setAuthMode('update_password');
      setSuccessMsg('✅ ¡Token de recuperación validado! Ahora escribe tu nueva contraseña abajo.');
      setPastedRecoveryUrl('');
    } catch (err) {
      setErrorMsg(err.message || 'El enlace pegado expiró o no es válido. Solicita uno nuevo.');
    } finally {
      setLoading(false);
    }
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
            {authMode === 'register'
              ? 'Crear Cuenta de Piloto'
              : authMode === 'forgot'
              ? 'Recuperar Contraseña'
              : authMode === 'update_password'
              ? 'Establecer Nueva Contraseña'
              : 'Iniciar Sesión'}
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

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-xs text-emerald-300 flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode !== 'update_password' && (
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
                  <Crown className="w-3 h-3" /> Cuenta Fundador VIP detectada (Requiere autenticación segura)
                </span>
              )}
            </div>
          )}

          {(authMode === 'login' || authMode === 'register') && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-mono text-neutral-300">Contraseña</label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className="text-[11px] font-mono text-amber-400 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
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
          )}

          {authMode === 'update_password' && (
            <div>
              <label className="text-xs font-mono text-neutral-300 block mb-1">Nueva Contraseña (mín. 6 caracteres)</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
                <input
                  type="password"
                  placeholder="Ingresa tu nueva contraseña"
                  value={newRecoveryPassword}
                  onChange={(e) => setNewRecoveryPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-emerald-500/60 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
                  minLength={6}
                  required
                />
              </div>
            </div>
          )}

          {authMode === 'forgot' && (
            <div className="p-3 rounded-2xl bg-neutral-950 border border-amber-500/40 space-y-2">
              <span className="text-[11px] font-mono font-bold text-amber-300 block">
                💡 ¿El correo te mandó a localhost:3000?
              </span>
              <p className="text-[10px] font-mono text-neutral-400 leading-relaxed">
                Copia la dirección completa de la barra del navegador (aunque diga <code className="text-amber-300">localhost:3000/#access_token=...</code>) y pégala aquí para cambiar tu clave al instante:
              </p>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={pastedRecoveryUrl}
                  onChange={(e) => setPastedRecoveryUrl(e.target.value)}
                  placeholder="Pega aquí http://localhost:3000/#access_token=..."
                  className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-[11px] font-mono text-emerald-300 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={handleApplyPastedRecoveryUrl}
                  disabled={loading || !pastedRecoveryUrl.trim()}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-racing font-bold text-[11px] uppercase disabled:opacity-50"
                >
                  Validar
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-bold font-racing uppercase tracking-wider text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/20 hover:opacity-90 flex items-center justify-center gap-1.5 transition active:scale-[0.99] disabled:opacity-50"
          >
            {loading
              ? 'Procesando...'
              : authMode === 'register'
              ? 'Registrar Cuenta Segura'
              : authMode === 'forgot'
              ? 'Enviar Enlace de Recuperación por Correo'
              : authMode === 'update_password'
              ? 'Guardar Nueva Contraseña'
              : 'Ingresar a Mi Garaje'}
            {!loading && (authMode === 'register' ? <UserPlus className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />)}
          </button>
        </form>

        <div className="mt-3 text-center space-y-1.5">
          {authMode === 'forgot' || authMode === 'update_password' ? (
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="text-xs font-mono text-amber-400 hover:underline block mx-auto"
            >
              ← Volver a Iniciar Sesión
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAuthMode(isRegisterMode ? 'login' : 'register');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="text-xs font-mono text-amber-400 hover:underline"
            >
              {isRegisterMode ? '¿Ya tienes cuenta? Inicia sesión aquí' : '¿Nuevo piloto? Crea tu cuenta gratis'}
            </button>
          )}
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

          <p className="text-[10px] font-mono text-neutral-500 mt-3 leading-relaxed">
            Al ingresar aceptas la{' '}
            <button
              type="button"
              onClick={() => onOpenLegal && onOpenLegal('privacy')}
              className="text-amber-400 hover:underline"
            >
              Política de Privacidad (Habeas Data)
            </button>{' '}
            y los{' '}
            <button
              type="button"
              onClick={() => onOpenLegal && onOpenLegal('terms')}
              className="text-amber-400 hover:underline"
            >
              Términos y Condiciones
            </button>.
          </p>
        </div>
      </div>
    </div>
  );
}
