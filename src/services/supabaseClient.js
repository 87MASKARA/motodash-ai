import { createClient } from '@supabase/supabase-js';

// Solo llaves públicas anónimas (anon/publishable). NUNCA usar SERVICE_ROLE_KEY en el frontend.
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://sbjsqvxtddhrpaootdrh.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_HPbwOP9-C2BdVT_o1sKQ7Q_6AMTW3Lm';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

/**
 * Obtiene el ID del usuario autenticado actualmente mediante sesión JWT válida de Supabase Auth
 */
export async function getAuthenticatedUserId() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id || null;
  } catch {
    return null;
  }
}

/**
 * Carga el garaje y perfil del piloto directamente desde Supabase bajo políticas RLS (auth.uid() = user_id)
 */
export async function loadPilotGarage(userId) {
  const authUid = await getAuthenticatedUserId();
  const targetUid = authUid || userId;
  if (!targetUid || !authUid) return null;

  try {
    const { data, error } = await supabase.rpc('get_pilot_garage', {
      p_user_id: authUid
    });

    if (error) {
      console.warn('[Supabase RLS] Error al cargar garaje remoto:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.warn('[Supabase] Error de red al cargar garaje:', err.message);
    return null;
  }
}

/**
 * Sincroniza y guarda el garaje completo y moto activa en Supabase bajo políticas RLS (auth.uid() = user_id)
 */
export async function savePilotGarage(userId, garage, activeBikeId) {
  const authUid = await getAuthenticatedUserId();
  if (!authUid || !Array.isArray(garage) || garage.length === 0) return false;

  try {
    const { data, error } = await supabase.rpc('save_pilot_garage', {
      p_user_id: authUid,
      p_bikes: garage,
      p_active_bike_id: activeBikeId || null
    });

    if (error) {
      console.warn('[Supabase RLS] Error al sincronizar garaje remoto:', error.message);
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

/**
 * Sube un documento privado (SOAT, factura, foto) al bucket protegido 'moto-documents'
 * Cumple la política RLS de Storage: la carpeta raíz debe coincidir exactamente con auth.uid()
 */
export async function uploadMotoDocument(file, category = 'documento') {
  const authUid = await getAuthenticatedUserId();
  if (!authUid || !file) {
    throw new Error('Debes iniciar sesión para subir documentos de tu moto.');
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `${authUid}/${category}_${Date.now()}_${safeName}`;

  const { data, error } = await supabase.storage
    .from('moto-documents')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;
  return data.path;
}

/**
 * Genera una URL firmada temporal (60 min) para visualizar un documento privado del usuario autenticado
 */
export async function getMotoDocumentSignedUrl(filePath) {
  const authUid = await getAuthenticatedUserId();
  if (!authUid || !filePath) return null;

  const { data, error } = await supabase.storage
    .from('moto-documents')
    .createSignedUrl(filePath, 3600);

  if (error) {
    console.warn('[Supabase Storage RLS] No se pudo obtener URL firmada:', error.message);
    return null;
  }
  return data?.signedUrl || null;
}
