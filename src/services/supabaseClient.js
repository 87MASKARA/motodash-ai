import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sbjsqvxtddhrpaootdrh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_HPbwOP9-C2BdVT_o1sKQ7Q_6AMTW3Lm';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

/**
 * Carga el garaje y perfil del piloto directamente desde Supabase en la nube
 */
export async function loadPilotGarage(userId) {
  if (!userId) return null;
  try {
    const { data, error } = await supabase.rpc('get_pilot_garage', {
      p_user_id: userId
    });

    if (error) {
      console.warn('[Supabase] Error al cargar garaje remoto:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.warn('[Supabase] Error de red al cargar garaje:', err.message);
    return null;
  }
}

/**
 * Sincroniza y guarda el garaje completo y moto activa en Supabase en la nube
 */
export async function savePilotGarage(userId, garage, activeBikeId) {
  if (!userId || !Array.isArray(garage) || garage.length === 0) return false;
  try {
    const { data, error } = await supabase.rpc('save_pilot_garage', {
      p_user_id: userId,
      p_bikes: garage,
      p_active_bike_id: activeBikeId || null
    });

    if (error) {
      console.warn('[Supabase] Error al sincronizar garaje remoto:', error.message);
      return false;
    }

    return data?.success || false;
  } catch (err) {
    console.warn('[Supabase] Error de red al sincronizar garaje:', err.message);
    return false;
  }
}

/**
 * Suscripción en tiempo real a cambios en el garaje desde cualquier dispositivo (PC / Celular)
 */
export function subscribeToGarageChanges(userId, onRemoteUpdate) {
  if (!userId || typeof onRemoteUpdate !== 'function') return () => {};

  const channel = supabase
    .channel(`garage_sync_${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_bikes',
        filter: `user_id=eq.${userId}`
      },
      () => {
        // Al detectar un cambio en la nube, recargar garaje
        loadPilotGarage(userId).then((data) => {
          if (data && Array.isArray(data.bikes) && data.bikes.length > 0) {
            onRemoteUpdate(data);
          }
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

