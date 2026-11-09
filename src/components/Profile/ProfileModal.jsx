import React, { useState } from 'react';
import { 
  User, Mail, Phone, MapPin, Crown, Shield, Calendar, 
  LogOut, X, Check, Bike, DollarSign, Wrench
} from 'lucide-react';

export default function ProfileModal({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
  onLogout,
  garageCount = 1,
  onOpenPaywall
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(userProfile?.fullName || "Daniel Gómez");
  const [phone, setPhone] = useState(userProfile?.phone || "+57 300 123 4567");
  const [city, setCity] = useState(userProfile?.city || "Medellín");
  const [country, setCountry] = useState(userProfile?.country || "Colombia");

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateProfile({
      ...userProfile,
      fullName,
      phone,
      city,
      country
    });
    setIsEditing(false);
  };

  const planName = userProfile?.plan === 'garage' 
    ? 'Garaje / Taller Pro ($9.99 USD • Hasta 15 Motos)' 
    : userProfile?.plan === 'pro_monthly' || userProfile?.isPro 
    ? 'Rider Pro ($4.99 USD • Hasta 3 Motos)' 
    : 'Rider Solo ($1.99 USD • 1 Moto)';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-racing uppercase tracking-wider text-white">
                Perfil del Piloto
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono">
                {userProfile?.email || "piloto@motodash.com"}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tarjeta de Membresía */}
        <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-neutral-900 to-amber-950/20 border border-amber-500/40 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block flex items-center gap-1">
              <Crown className="w-3 h-3" /> Membresía Activa
            </span>
            <div className="text-sm font-bold text-white mt-0.5">{planName}</div>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-1">
              ● Estado: Suscripción Vigente
            </span>
          </div>

          <button
            onClick={onOpenPaywall}
            className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-racing font-bold transition"
          >
            Gestionar Plan
          </button>
        </div>

        {/* Formulario de Datos Personales */}
        {!isEditing ? (
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80 flex justify-between items-center">
              <span className="text-neutral-500">Nombre:</span>
              <strong className="text-white font-sans">{userProfile?.fullName || fullName}</strong>
            </div>

            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80 flex justify-between items-center">
              <span className="text-neutral-500">WhatsApp / Móvil:</span>
              <strong className="text-white">{userProfile?.phone || phone}</strong>
            </div>

            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80 flex justify-between items-center">
              <span className="text-neutral-500">Ubicación:</span>
              <strong className="text-white font-sans">{userProfile?.city || city}, {userProfile?.country || country}</strong>
            </div>

            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80 flex justify-between items-center">
              <span className="text-neutral-500">Motos en Garaje:</span>
              <strong className="text-amber-400">{garageCount} Motos Registradas</strong>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex-1 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-racing font-bold border border-neutral-700 transition"
              >
                Editar Mis Datos
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="py-2 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 text-xs font-racing font-bold flex items-center gap-1.5 transition"
                title="Cerrar Sesión y Volver al Inicio"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] font-mono text-neutral-400 block mb-1">Nombre Completo</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-neutral-400 block mb-1">WhatsApp / Celular</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">Ciudad</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">País</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2 rounded-xl bg-neutral-800 text-neutral-400 text-xs font-racing font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-amber-500 text-black text-xs font-racing font-bold flex items-center justify-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

