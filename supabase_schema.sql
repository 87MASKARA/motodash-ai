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
