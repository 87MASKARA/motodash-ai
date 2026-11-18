-- ============================================================================
-- MOTODASH AI — ESQUEMA DE PRODUCCIÓN GLOBAL & SEGURIDAD RLS (SUPABASE)
-- ============================================================================
-- Incluye:
-- 1. Tablas principales (motos, mantenimientos, gastos, user_bikes, pilot_profiles)
-- 2. Índices de rendimiento en user_id para evaluación rápida de RLS
-- 3. Activación y forzado de Row Level Security (ENABLE & FORCE RLS)
-- 4. Revocación de permisos al rol público/anónimo (anon)
-- 5. Políticas CRUD estrictas (SELECT, INSERT, UPDATE, DELETE) por tabla con auth.uid()
-- 6. Trigger anti-escalada de privilegios en pilot_profiles
-- 7. Funciones RPC con SECURITY INVOKER y validación obligatoria de auth.uid()
-- 8. Políticas RLS para Supabase Storage (bucket privado moto-documents por carpeta auth.uid())
-- 9. Aislamiento de Data API únicamente al esquema public
-- ============================================================================

-- 1. CREACIÓN DE TABLAS PRINCIPALES
CREATE TABLE IF NOT EXISTS public.pilot_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  city text,
  country text,
  plan text DEFAULT 'solo',
  is_pro boolean DEFAULT false,
  is_lifetime_vip boolean DEFAULT false,
  active_bike_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_bikes (
  id text NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  odometer numeric NOT NULL DEFAULT 0,
  riding_condition text DEFAULT 'normal',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  hoja_de_vida jsonb NOT NULL DEFAULT '{}'::jsonb,
  custom_components jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (id, user_id)
);

CREATE TABLE IF NOT EXISTS public.motos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  placa text,
  marca text NOT NULL,
  modelo text NOT NULL,
  anio integer NOT NULL DEFAULT 2025,
  kilometraje numeric NOT NULL DEFAULT 0,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  hoja_de_vida jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mantenimientos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  moto_id text NOT NULL,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  kilometraje numeric NOT NULL DEFAULT 0,
  servicio text NOT NULL,
  repuesto text,
  taller text,
  costo numeric(12, 2) NOT NULL DEFAULT 0,
  es_garantia boolean DEFAULT false,
  notas text,
  factura_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gastos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  moto_id text NOT NULL,
  categoria text NOT NULL DEFAULT 'combustible',
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  kilometraje numeric DEFAULT 0,
  monto numeric(12, 2) NOT NULL DEFAULT 0,
  litros numeric(8, 2),
  descripcion text,
  comprobante_url text,
  created_at timestamptz DEFAULT now()
);

-- Índices en user_id para acelerar políticas RLS
CREATE INDEX IF NOT EXISTS idx_user_bikes_user_id ON public.user_bikes(user_id);
CREATE INDEX IF NOT EXISTS idx_motos_user_id ON public.motos(user_id);
CREATE INDEX IF NOT EXISTS idx_mantenimientos_user_id ON public.mantenimientos(user_id);
CREATE INDEX IF NOT EXISTS idx_gastos_user_id ON public.gastos(user_id);

-- ============================================================================
-- 2. HABILITAR Y FORZAR ROW LEVEL SECURITY (RLS) EN TODAS LAS TABLAS
-- ============================================================================
ALTER TABLE public.motos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motos FORCE ROW LEVEL SECURITY;

ALTER TABLE public.mantenimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mantenimientos FORCE ROW LEVEL SECURITY;

ALTER TABLE public.gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gastos FORCE ROW LEVEL SECURITY;

ALTER TABLE public.user_bikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bikes FORCE ROW LEVEL SECURITY;

ALTER TABLE public.pilot_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilot_profiles FORCE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. REVOCAR ACCESO ANÓNIMO (anon) Y OTORGAR SOLO A USUARIOS AUTENTICADOS
-- ============================================================================
REVOKE ALL ON TABLE public.motos FROM PUBLIC, anon;
REVOKE ALL ON TABLE public.mantenimientos FROM PUBLIC, anon;
REVOKE ALL ON TABLE public.gastos FROM PUBLIC, anon;
REVOKE ALL ON TABLE public.user_bikes FROM PUBLIC, anon;
REVOKE ALL ON TABLE public.pilot_profiles FROM PUBLIC, anon;

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.motos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.mantenimientos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.gastos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_bikes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.pilot_profiles TO authenticated;

-- ============================================================================
-- 4. POLÍTICAS CRUD PARA EL USUARIO AUTENTICADO (auth.uid() = user_id)
-- ============================================================================

-- 4A. TABLA: motos
DROP POLICY IF EXISTS "Ver propias motos" ON public.motos;
DROP POLICY IF EXISTS "Insertar propias motos" ON public.motos;
DROP POLICY IF EXISTS "Actualizar propias motos" ON public.motos;
DROP POLICY IF EXISTS "Eliminar propias motos" ON public.motos;

CREATE POLICY "Ver propias motos"
  ON public.motos FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Insertar propias motos"
  ON public.motos FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Actualizar propias motos"
  ON public.motos FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Eliminar propias motos"
  ON public.motos FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- 4B. TABLA: mantenimientos
DROP POLICY IF EXISTS "Ver propios mantenimientos" ON public.mantenimientos;
DROP POLICY IF EXISTS "Insertar propios mantenimientos" ON public.mantenimientos;
DROP POLICY IF EXISTS "Actualizar propios mantenimientos" ON public.mantenimientos;
DROP POLICY IF EXISTS "Eliminar propios mantenimientos" ON public.mantenimientos;

CREATE POLICY "Ver propios mantenimientos"
  ON public.mantenimientos FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Insertar propios mantenimientos"
  ON public.mantenimientos FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Actualizar propios mantenimientos"
  ON public.mantenimientos FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Eliminar propios mantenimientos"
  ON public.mantenimientos FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- 4C. TABLA: gastos
DROP POLICY IF EXISTS "Ver propios gastos" ON public.gastos;
DROP POLICY IF EXISTS "Insertar propios gastos" ON public.gastos;
DROP POLICY IF EXISTS "Actualizar propios gastos" ON public.gastos;
DROP POLICY IF EXISTS "Eliminar propios gastos" ON public.gastos;

CREATE POLICY "Ver propios gastos"
  ON public.gastos FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Insertar propios gastos"
  ON public.gastos FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Actualizar propios gastos"
  ON public.gastos FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Eliminar propios gastos"
  ON public.gastos FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- 4D. TABLA: user_bikes
DROP POLICY IF EXISTS "user_bikes_all" ON public.user_bikes;
DROP POLICY IF EXISTS "Ver propias motos (user_bikes)" ON public.user_bikes;
DROP POLICY IF EXISTS "Insertar propias motos (user_bikes)" ON public.user_bikes;
DROP POLICY IF EXISTS "Actualizar propias motos (user_bikes)" ON public.user_bikes;
DROP POLICY IF EXISTS "Eliminar propias motos (user_bikes)" ON public.user_bikes;

CREATE POLICY "Ver propias motos (user_bikes)"
  ON public.user_bikes FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Insertar propias motos (user_bikes)"
  ON public.user_bikes FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Actualizar propias motos (user_bikes)"
  ON public.user_bikes FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Eliminar propias motos (user_bikes)"
  ON public.user_bikes FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- 4E. TABLA: pilot_profiles
DROP POLICY IF EXISTS "pilot_profiles_all" ON public.pilot_profiles;
DROP POLICY IF EXISTS "Ver propio perfil" ON public.pilot_profiles;
DROP POLICY IF EXISTS "Insertar propio perfil" ON public.pilot_profiles;
DROP POLICY IF EXISTS "Actualizar propio perfil" ON public.pilot_profiles;
DROP POLICY IF EXISTS "Eliminar propio perfil" ON public.pilot_profiles;

CREATE POLICY "Ver propio perfil"
  ON public.pilot_profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Insertar propio perfil"
  ON public.pilot_profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Actualizar propio perfil"
  ON public.pilot_profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Eliminar propio perfil"
  ON public.pilot_profiles FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = id);

-- ============================================================================
-- 5. PROTECCIÓN CONTRA ESCALADA DE PRIVILEGIOS EN pilot_profiles
-- ============================================================================
CREATE OR REPLACE FUNCTION public.protect_pilot_profile_billing()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '') NOT IN ('service_role', 'supabase_admin')
     AND current_user NOT IN ('postgres', 'supabase_admin') THEN
    NEW.plan := OLD.plan;
    NEW.is_pro := OLD.is_pro;
    NEW.is_lifetime_vip := OLD.is_lifetime_vip;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.protect_pilot_profile_billing() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_protect_pilot_profile_billing ON public.pilot_profiles;
CREATE TRIGGER trg_protect_pilot_profile_billing
  BEFORE UPDATE ON public.pilot_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_pilot_profile_billing();

-- ============================================================================
-- 6. FUNCIONES RPC ENDURECIDAS (SECURITY INVOKER + VALIDACIÓN auth.uid())
-- ============================================================================
CREATE OR REPLACE FUNCTION public.save_pilot_garage(
  p_user_id uuid DEFAULT NULL,
  p_bikes jsonb DEFAULT '[]'::jsonb,
  p_active_bike_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
  v_bike jsonb;
  v_bike_id text;
  v_odometer numeric;
  v_cond text;
  v_config jsonb;
  v_hoja jsonb;
  v_custom jsonb;
  v_existing_ids text[] := ARRAY[]::text[];
BEGIN
  v_uid := (select auth.uid());
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'No autenticado: inicia sesión para guardar tu garaje.' USING ERRCODE = '42501';
  END IF;

  IF p_user_id IS NOT NULL AND p_user_id <> v_uid THEN
    RAISE EXCEPTION 'Acceso denegado: no puedes modificar el garaje de otro usuario.' USING ERRCODE = '42501';
  END IF;

  IF p_active_bike_id IS NOT NULL THEN
    UPDATE public.pilot_profiles
    SET active_bike_id = p_active_bike_id, updated_at = now()
    WHERE id = v_uid;
  END IF;

  FOR v_bike IN SELECT * FROM jsonb_array_elements(p_bikes)
  LOOP
    v_bike_id := v_bike->>'id';
    IF v_bike_id IS NOT NULL AND v_bike_id <> '' THEN
      v_existing_ids := array_append(v_existing_ids, v_bike_id);
      v_odometer := COALESCE((v_bike->>'odometer')::numeric, 0);
      v_cond := COALESCE(v_bike->>'ridingCondition', 'normal');
      v_config := COALESCE(v_bike->'config', '{}'::jsonb);
      v_hoja := COALESCE(v_bike->'hojaDeVida', '{}'::jsonb);
      v_custom := COALESCE(v_bike->'customComponents', '{}'::jsonb);

      INSERT INTO public.user_bikes (
        id, user_id, odometer, riding_condition, config, hoja_de_vida, custom_components, updated_at
      ) VALUES (
        v_bike_id, v_uid, v_odometer, v_cond, v_config, v_hoja, v_custom, now()
      )
      ON CONFLICT (id, user_id) DO UPDATE SET
        odometer = EXCLUDED.odometer,
        riding_condition = EXCLUDED.riding_condition,
        config = EXCLUDED.config,
        hoja_de_vida = EXCLUDED.hoja_de_vida,
        custom_components = EXCLUDED.custom_components,
        updated_at = now();
    END IF;
  END LOOP;

  IF array_length(v_existing_ids, 1) > 0 THEN
    DELETE FROM public.user_bikes
    WHERE user_id = v_uid
      AND NOT (id = ANY(v_existing_ids));
  END IF;

  RETURN jsonb_build_object('success', true, 'count', COALESCE(array_length(v_existing_ids, 1), 0));
END;
$$;

CREATE OR REPLACE FUNCTION public.get_pilot_garage(
  p_user_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
  v_bikes jsonb;
  v_profile jsonb;
BEGIN
  v_uid := (select auth.uid());
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'No autenticado: inicia sesión para consultar tu garaje.' USING ERRCODE = '42501';
  END IF;

  IF p_user_id IS NOT NULL AND p_user_id <> v_uid THEN
    RAISE EXCEPTION 'Acceso denegado: no puedes consultar el garaje de otro usuario.' USING ERRCODE = '42501';
  END IF;

  SELECT jsonb_agg(
    jsonb_build_object(
      'id', b.id,
      'odometer', b.odometer,
      'ridingCondition', b.riding_condition,
      'config', b.config,
      'hojaDeVida', b.hoja_de_vida,
      'customComponents', b.custom_components
    ) ORDER BY b.created_at ASC
  )
  INTO v_bikes
  FROM public.user_bikes b
  WHERE b.user_id = v_uid;

  SELECT to_jsonb(p.*)
  INTO v_profile
  FROM public.pilot_profiles p
  WHERE p.id = v_uid;

  RETURN jsonb_build_object(
    'bikes', COALESCE(v_bikes, '[]'::jsonb),
    'profile', v_profile,
    'activeBikeId', v_profile->>'active_bike_id'
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.save_pilot_garage(uuid, jsonb, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_pilot_garage(uuid, jsonb, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_pilot_garage(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_pilot_garage(uuid) TO authenticated;

-- ============================================================================
-- 7. SUPABASE STORAGE: BUCKET PRIVADO Y RLS POR CARPETA DE USUARIO (auth.uid())
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'moto-documents',
  'moto-documents',
  false,
  10485760, -- 10 MB máx
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

DROP POLICY IF EXISTS "Ver propios documentos en storage" ON storage.objects;
DROP POLICY IF EXISTS "Subir propios documentos en storage" ON storage.objects;
DROP POLICY IF EXISTS "Actualizar propios documentos en storage" ON storage.objects;
DROP POLICY IF EXISTS "Eliminar propios documentos en storage" ON storage.objects;

CREATE POLICY "Ver propios documentos en storage"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'moto-documents'
    AND (storage.foldername(name))[1] = (select auth.uid())::text
  );

CREATE POLICY "Subir propios documentos en storage"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'moto-documents'
    AND (storage.foldername(name))[1] = (select auth.uid())::text
  );

CREATE POLICY "Actualizar propios documentos en storage"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'moto-documents'
    AND (storage.foldername(name))[1] = (select auth.uid())::text
  )
  WITH CHECK (
    bucket_id = 'moto-documents'
    AND (storage.foldername(name))[1] = (select auth.uid())::text
  );

CREATE POLICY "Eliminar propios documentos en storage"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'moto-documents'
    AND (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- ============================================================================
-- 8. AISLAMIENTO DE ESQUEMAS EN LA API REST (SOLO public)
-- ============================================================================
ALTER ROLE authenticator SET pgrst.db_schemas = 'public';
NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';


-- ============================================================================
-- 9. ADAPTACIÓN GLOBAL: COLUMNAS ESTÁNDAR DE DOCUMENTOS LEGALES
--    (mandatory_insurance, technical_inspection, vehicle_registration)
-- ============================================================================
ALTER TABLE public.motos
  ADD COLUMN IF NOT EXISTS mandatory_insurance jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS mandatory_insurance_expiry date,
  ADD COLUMN IF NOT EXISTS technical_inspection jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS technical_inspection_expiry date,
  ADD COLUMN IF NOT EXISTS vehicle_registration jsonb DEFAULT '{}'::jsonb;

ALTER TABLE public.user_bikes
  ADD COLUMN IF NOT EXISTS mandatory_insurance jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS mandatory_insurance_expiry date,
  ADD COLUMN IF NOT EXISTS technical_inspection jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS technical_inspection_expiry date,
  ADD COLUMN IF NOT EXISTS vehicle_registration jsonb DEFAULT '{}'::jsonb;

ALTER TABLE public.pilot_profiles
  ADD COLUMN IF NOT EXISTS whatsapp_alerts_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS push_alerts_enabled boolean DEFAULT true;

-- ============================================================================
-- 10. SISTEMA DE ALERTAS AUTOMATIZADAS (30, 15 y 5 DÍAS) + CRON 8:00 AM
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.document_alerts_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  moto_id text NOT NULL,
  document_type text NOT NULL,
  days_remaining integer NOT NULL,
  expiry_date date NOT NULL,
  channel text NOT NULL DEFAULT 'whatsapp_and_push',
  message text NOT NULL,
  sent_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_document_alerts_user_id ON public.document_alerts_log(user_id);

ALTER TABLE public.document_alerts_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_alerts_log FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.document_alerts_log FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.document_alerts_log TO authenticated;

CREATE POLICY "Ver propias alertas"
  ON public.document_alerts_log FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Insertar propias alertas"
  ON public.document_alerts_log FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Actualizar propias alertas"
  ON public.document_alerts_log FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Eliminar propias alertas"
  ON public.document_alerts_log FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- 11. MÓDULO DE COMUNIDAD Y CHAT EN TIEMPO REAL (SUPABASE REALTIME)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.community_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id text NOT NULL DEFAULT 'medellin',
  category text NOT NULL DEFAULT 'general',
  author_name text NOT NULL DEFAULT 'Piloto Rider',
  author_bike text DEFAULT 'Motocicleta',
  author_verified boolean DEFAULT false,
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 600),
  city text DEFAULT 'Medellín',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_messages_channel ON public.community_messages(channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_messages_user_id ON public.community_messages(user_id);

ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.community_messages FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.community_messages TO authenticated;

CREATE POLICY "Leer mensajes de comunidad (autenticados)"
  ON public.community_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Publicar propios mensajes en comunidad"
  ON public.community_messages FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Editar propios mensajes en comunidad"
  ON public.community_messages FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Eliminar propios mensajes en comunidad"
  ON public.community_messages FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- 12. MARKETPLACE: COMPRA CON HISTORIAL CERTIFICADO (FASE 2 READY)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  moto_id text NOT NULL,
  brand text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  odometer numeric NOT NULL DEFAULT 0,
  price numeric(14, 2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'COP',
  city text NOT NULL DEFAULT 'Medellín',
  country text NOT NULL DEFAULT 'Colombia',
  verified_maintenance_badge boolean DEFAULT false,
  health_score integer DEFAULT 95,
  fines_clean boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  tier text DEFAULT 'free',
  status text DEFAULT 'pre_registered',
  technical_summary jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, moto_id)
);

CREATE INDEX IF NOT EXISTS idx_marketplace_user_id ON public.marketplace_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_city ON public.marketplace_listings(city, status);

ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.marketplace_listings FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.marketplace_listings TO authenticated;

DROP POLICY IF EXISTS "Ver anuncios certificados" ON public.marketplace_listings;
CREATE POLICY "Ver anuncios certificados"
  ON public.marketplace_listings FOR SELECT
  TO authenticated, anon
  USING (true);

DROP POLICY IF EXISTS "Crear propio anuncio certificado" ON public.marketplace_listings;
CREATE POLICY "Crear propio anuncio certificado"
  ON public.marketplace_listings FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Actualizar propio anuncio certificado" ON public.marketplace_listings;
CREATE POLICY "Actualizar propio anuncio certificado"
  ON public.marketplace_listings FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Eliminar propio anuncio certificado" ON public.marketplace_listings;
CREATE POLICY "Eliminar propio anuncio certificado"
  ON public.marketplace_listings FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Permitir lectura pública de la vitrina de motos certificadas
GRANT SELECT ON TABLE public.marketplace_listings TO anon;

-- ============================================================================
-- 13. MOTOMALL B2B2C: TIENDAS ALIADAS, TALLERES Y CONCESIONARIOS (mall_stores)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.mall_stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  slug text UNIQUE NOT NULL,
  store_name text NOT NULL,
  store_type text NOT NULL DEFAULT 'repuestos',
  tax_id_nit text,
  city text NOT NULL DEFAULT 'Medellín',
  country text DEFAULT 'Colombia',
  address text,
  latitude numeric(10, 6),
  longitude numeric(10, 6),
  whatsapp_sales text,
  logo_url text,
  accent_color text DEFAULT '#F59E0B',
  brands_supported text[] DEFAULT ARRAY['TVS', 'YAMAHA', 'KTM', 'BAJAJ'],
  is_verified boolean DEFAULT false,
  founder_overseer_name text DEFAULT 'Anderson • Fundador VIP',
  rating numeric(3, 2) DEFAULT 5.0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.mall_stores
  ADD COLUMN IF NOT EXISTS owner_id uuid DEFAULT auth.uid(),
  ADD COLUMN IF NOT EXISTS store_name text,
  ADD COLUMN IF NOT EXISTS store_type text DEFAULT 'repuestos',
  ADD COLUMN IF NOT EXISTS tax_id_nit text,
  ADD COLUMN IF NOT EXISTS city text DEFAULT 'Medellín',
  ADD COLUMN IF NOT EXISTS country text DEFAULT 'Colombia',
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS latitude numeric(10, 6),
  ADD COLUMN IF NOT EXISTS longitude numeric(10, 6),
  ADD COLUMN IF NOT EXISTS whatsapp_sales text,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS accent_color text DEFAULT '#F59E0B',
  ADD COLUMN IF NOT EXISTS brands_supported text[] DEFAULT ARRAY['TVS', 'YAMAHA', 'KTM', 'BAJAJ'],
  ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS founder_overseer_name text DEFAULT 'Anderson • Fundador VIP',
  ADD COLUMN IF NOT EXISTS rating numeric(3, 2) DEFAULT 5.0;

CREATE INDEX IF NOT EXISTS idx_mall_stores_city ON public.mall_stores(city);
CREATE INDEX IF NOT EXISTS idx_mall_stores_slug ON public.mall_stores(slug);

ALTER TABLE public.mall_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mall_stores FORCE ROW LEVEL SECURITY;
GRANT SELECT ON TABLE public.mall_stores TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.mall_stores TO authenticated;

DROP POLICY IF EXISTS "Ver tiendas del MotoMall" ON public.mall_stores;
CREATE POLICY "Ver tiendas del MotoMall"
  ON public.mall_stores FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Registrar propia tienda en MotoMall" ON public.mall_stores;
CREATE POLICY "Registrar propia tienda en MotoMall"
  ON public.mall_stores FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = owner_id OR owner_id IS NULL);

DROP POLICY IF EXISTS "Actualizar propia tienda o Fundador VIP" ON public.mall_stores;
CREATE POLICY "Actualizar propia tienda o Fundador VIP"
  ON public.mall_stores FOR UPDATE
  TO authenticated
  USING (
    (select auth.uid()) = owner_id
    OR (select auth.jwt() ->> 'email') = 'anderson1125@gmail.com'
  );

DROP POLICY IF EXISTS "Eliminar propia tienda o Fundador VIP" ON public.mall_stores;
CREATE POLICY "Eliminar propia tienda o Fundador VIP"
  ON public.mall_stores FOR DELETE
  TO authenticated
  USING (
    (select auth.uid()) = owner_id
    OR (select auth.jwt() ->> 'email') = 'anderson1125@gmail.com'
  );

-- ============================================================================
-- 14. MOTOMALL B2B2C: CATÁLOGO DE REPUESTOS Y MOTOS 0 KM (mall_products)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.mall_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  store_slug text NOT NULL,
  store_name text NOT NULL,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'motor',
  maintenance_comp_id text DEFAULT 'aceite_motor',
  compatible_brands text[] DEFAULT ARRAY['TVS', 'YAMAHA', 'KTM', 'BAJAJ'],
  compatible_models text,
  oem_reference text,
  price numeric(14, 2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'COP',
  discount_pct integer DEFAULT 0,
  stock integer DEFAULT 10,
  image_url text,
  whatsapp_sales text,
  delivery_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.mall_products
  ADD COLUMN IF NOT EXISTS seller_id uuid DEFAULT auth.uid(),
  ADD COLUMN IF NOT EXISTS store_slug text,
  ADD COLUMN IF NOT EXISTS store_name text,
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'motor',
  ADD COLUMN IF NOT EXISTS maintenance_comp_id text DEFAULT 'aceite_motor',
  ADD COLUMN IF NOT EXISTS compatible_brands text[] DEFAULT ARRAY['TVS', 'YAMAHA', 'KTM', 'BAJAJ'],
  ADD COLUMN IF NOT EXISTS compatible_models text,
  ADD COLUMN IF NOT EXISTS oem_reference text,
  ADD COLUMN IF NOT EXISTS price numeric(14, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'COP',
  ADD COLUMN IF NOT EXISTS discount_pct integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stock integer DEFAULT 10,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS whatsapp_sales text,
  ADD COLUMN IF NOT EXISTS delivery_available boolean DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_mall_products_category ON public.mall_products(category);
CREATE INDEX IF NOT EXISTS idx_mall_products_store ON public.mall_products(store_slug);

ALTER TABLE public.mall_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mall_products FORCE ROW LEVEL SECURITY;
GRANT SELECT ON TABLE public.mall_products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.mall_products TO authenticated;

DROP POLICY IF EXISTS "Ver productos del MotoMall" ON public.mall_products;
CREATE POLICY "Ver productos del MotoMall"
  ON public.mall_products FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Publicar productos en MotoMall" ON public.mall_products;
CREATE POLICY "Publicar productos en MotoMall"
  ON public.mall_products FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = seller_id OR seller_id IS NULL);

DROP POLICY IF EXISTS "Actualizar propios productos o Fundador VIP" ON public.mall_products;
CREATE POLICY "Actualizar propios productos o Fundador VIP"
  ON public.mall_products FOR UPDATE
  TO authenticated
  USING (
    (select auth.uid()) = seller_id
    OR (select auth.jwt() ->> 'email') = 'anderson1125@gmail.com'
  );

DROP POLICY IF EXISTS "Eliminar propios productos o Fundador VIP" ON public.mall_products;
CREATE POLICY "Eliminar propios productos o Fundador VIP"
  ON public.mall_products FOR DELETE
  TO authenticated
  USING (
    (select auth.uid()) = seller_id
    OR (select auth.jwt() ->> 'email') = 'anderson1125@gmail.com'
  );

-- ============================================================================
-- 15. CLANES MOTEROS PRIVADOS CON LOGO PROPIO (moto_clans)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.moto_clans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  tag text DEFAULT 'CLAN',
  motto text,
  city text NOT NULL DEFAULT 'Medellín',
  country text NOT NULL DEFAULT 'Colombia',
  logo_url text,
  accent_color text DEFAULT '#F59E0B',
  is_private boolean DEFAULT false,
  invite_code text,
  creator_name text NOT NULL DEFAULT 'Líder de Clan',
  founder_name text DEFAULT 'Anderson • Fundador VIP',
  member_count integer DEFAULT 2,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.moto_clans
  ADD COLUMN IF NOT EXISTS creator_id uuid DEFAULT auth.uid(),
  ADD COLUMN IF NOT EXISTS tag text DEFAULT 'CLAN',
  ADD COLUMN IF NOT EXISTS motto text,
  ADD COLUMN IF NOT EXISTS city text DEFAULT 'Medellín',
  ADD COLUMN IF NOT EXISTS country text DEFAULT 'Colombia',
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS accent_color text DEFAULT '#F59E0B',
  ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS invite_code text,
  ADD COLUMN IF NOT EXISTS creator_name text DEFAULT 'Líder de Clan',
  ADD COLUMN IF NOT EXISTS founder_name text DEFAULT 'Anderson • Fundador VIP',
  ADD COLUMN IF NOT EXISTS member_count integer DEFAULT 2;

CREATE INDEX IF NOT EXISTS idx_moto_clans_slug ON public.moto_clans(slug);

ALTER TABLE public.moto_clans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moto_clans FORCE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.moto_clans TO authenticated;

DROP POLICY IF EXISTS "Ver clanes moteros" ON public.moto_clans;
CREATE POLICY "Ver clanes moteros"
  ON public.moto_clans FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Crear propio clan motero" ON public.moto_clans;
CREATE POLICY "Crear propio clan motero"
  ON public.moto_clans FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = creator_id OR creator_id IS NULL);

DROP POLICY IF EXISTS "Actualizar propio clan o Fundador VIP" ON public.moto_clans;
CREATE POLICY "Actualizar propio clan o Fundador VIP"
  ON public.moto_clans FOR UPDATE
  TO authenticated
  USING (
    (select auth.uid()) = creator_id
    OR (select auth.jwt() ->> 'email') = 'anderson1125@gmail.com'
  );

DROP POLICY IF EXISTS "Eliminar propio clan o Fundador VIP" ON public.moto_clans;
CREATE POLICY "Eliminar propio clan o Fundador VIP"
  ON public.moto_clans FOR DELETE
  TO authenticated
  USING (
    (select auth.uid()) = creator_id
    OR (select auth.jwt() ->> 'email') = 'anderson1125@gmail.com'
  );
