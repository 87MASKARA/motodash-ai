import React, { useState } from 'react';
import { Mail, Lock, X, ArrowRight, UserCheck, Sparkles, Shield } from 'lucide-react';
import AppLogo from '../Common/AppLogo';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      // Simular login exitoso o conectar con Supabase Auth
      const pilotProfile = {
        fullName: email.split('@')[0] || "Piloto Rider",
        email: email || "motero@motodash.com",
        phone: "+57 300 123 4567",
        city: "Medellín",
        country: "Colombia",
        plan: "pro_monthly",
        isPro: true
      };
      setLoading(false);
      onLoginSuccess(pilotProfile);
      onClose();
    }, 600);
  };

  const handleQuickDemo = () => {
    const demoProfile = {
      fullName: "Daniel Gómez",
      email: "daniel.gomez@motodash.com",
      phone: "+57 312 987 6543",
      city: "Medellín",
      country: "Colombia",
      plan: "pro_monthly",
      isPro: true
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
            Iniciar Sesión
          </h2>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            Accede a tu garaje y telemetría de motos sincronizada
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-mono text-neutral-300 block mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              <input
                type="email"
                placeholder="tu-correo@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>
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
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-bold font-racing uppercase tracking-wider text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/20 hover:opacity-90 flex items-center justify-center gap-1.5 transition active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? "Iniciando..." : "Ingresar a Mi Garaje"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-neutral-800 text-center">
          <span className="text-xs text-neutral-500 block mb-2 font-mono">¿Quieres probar sin registrarte?</span>
          <button
            type="button"
            onClick={handleQuickDemo}
            className="w-full py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-neutral-700 text-xs font-racing font-bold flex items-center justify-center gap-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Acceso Rápido con Cuenta Demo Pro</span>
          </button>
        </div>
      </div>
    </div>
  );
}

