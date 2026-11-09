-- =========================================================================
-- MOTODASH AI - ESQUEMA DE BASE DE DATOS GLOBAL (SUPABASE / POSTGRESQL)
-- Endurecido con políticas RLS estrictas y protección contra escalada Pro
-- =========================================================================

-- 1. Tabla de Perfiles de Usuarios y Suscripciones Rider Pro
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    city TEXT,
    country TEXT,
    is_pro BOOLEAN DEFAULT false NOT NULL,
    subscription_plan TEXT DEFAULT 'solo' NOT NULL CHECK (subscription_plan IN ('solo', 'pro_monthly', 'garage', 'founder_vip')),
    trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + interval '7 days') NOT NULL,
    lemonsqueezy_customer_id TEXT,
    lemonsqueezy_subscription_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Motocicletas del Garaje
CREATE TABLE IF NOT EXISTS public.motorcycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INT NOT NULL CHECK (year >= 1950 AND year <= 2035),
    color_hex TEXT NOT NULL CHECK (color_hex ~ '^#[0-9A-Fa-f]{6}$'),
    odometer_km INT DEFAULT 0 NOT NULL CHECK (odometer_km >= 0),
    is_active BOOLEAN DEFAULT false,
    dashboard_config JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla de Documentos Legales & Vencimientos
CREATE TABLE IF NOT EXISTS public.motorcycle_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    motorcycle_id UUID NOT NULL REFERENCES public.motorcycles(id) ON DELETE CASCADE,
    placa TEXT,
    vin_chasis TEXT,
    engine_number TEXT,
    soat_vencimiento DATE,
    tecnomecanica_vencimiento DATE,
    seguro_nombre TEXT,
    seguro_poliza TEXT,
    seguro_vencimiento DATE,
    impuesto_vencimiento DATE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabla de Hoja de Vida & Historial de Mantenimientos
CREATE TABLE IF NOT EXISTS public.service_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    motorcycle_id UUID NOT NULL REFERENCES public.motorcycles(id) ON DELETE CASCADE,
    component_key TEXT NOT NULL,
    service_label TEXT NOT NULL,
    km_at_service INT NOT NULL CHECK (km_at_service >= 0),
    service_date DATE NOT NULL,
    spare_part_brand TEXT,
    workshop_name TEXT,
    cost_total NUMERIC(12, 2) DEFAULT 0 CHECK (cost_total >= 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabla de Registro de Tanqueos & Telemetría de Combustible
CREATE TABLE IF NOT EXISTS public.fuel_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    motorcycle_id UUID NOT NULL REFERENCES public.motorcycles(id) ON DELETE CASCADE,
    km_at_refuel INT NOT NULL CHECK (km_at_refuel >= 0),
    liters NUMERIC(8, 2) NOT NULL CHECK (liters > 0),
    cost_total NUMERIC(12, 2) NOT NULL CHECK (cost_total >= 0),
    is_full_tank BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Habilitar Row Level Security (RLS) en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motorcycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motorcycle_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_logs ENABLE ROW LEVEL SECURITY;

-- 7. Trigger de Seguridad: Impedir que el cliente modifique su propio estado de pago (is_pro / subscription_plan)
CREATE OR REPLACE FUNCTION public.protect_profile_billing_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF current_setting('request.jwt.claims', true)::jsonb ->> 'role' <> 'service_role' THEN
        NEW.is_pro := OLD.is_pro;
        NEW.subscription_plan := OLD.subscription_plan;
        NEW.trial_ends_at := OLD.trial_ends_at;
        NEW.lemonsqueezy_customer_id := OLD.lemonsqueezy_customer_id;
        NEW.lemonsqueezy_subscription_id := OLD.lemonsqueezy_subscription_id;
    END IF;
    NEW.updated_at := timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_billing ON public.profiles;
CREATE TRIGGER trg_protect_profile_billing
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_profile_billing_columns();

-- 8. Trigger Automático: Crear perfil cuando un usuario se registra en Supabase Auth
--    (Otorga automáticamente Membresía Fundador VIP Vitalicia a anderson1125@gmail.com)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    is_founder BOOLEAN;
BEGIN
    is_founder := LOWER(COALESCE(NEW.email, '')) = 'anderson1125@gmail.com';

    INSERT INTO public.profiles (id, email, full_name, is_pro, subscription_plan, trial_ends_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', CASE WHEN is_founder THEN 'Anderson • Fundador VIP' ELSE '' END),
        is_founder,
        CASE WHEN is_founder THEN 'founder_vip' ELSE 'solo' END,
        CASE WHEN is_founder THEN '2099-12-31 23:59:59+00'::timestamptz ELSE (timezone('utc'::text, now()) + interval '7 days') END
    )
    ON CONFLICT (id) DO UPDATE SET
        is_pro = CASE WHEN EXCLUDED.subscription_plan = 'founder_vip' THEN true ELSE public.profiles.is_pro END,
        subscription_plan = CASE WHEN EXCLUDED.subscription_plan = 'founder_vip' THEN 'founder_vip' ELSE public.profiles.subscription_plan END;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 8b. Garantizar que el usuario Fundador VIP (anderson1125@gmail.com) ya creado en auth.users tenga su perfil Vitalicio activo
INSERT INTO public.profiles (id, email, full_name, is_pro, subscription_plan, trial_ends_at)
SELECT id, email, 'Anderson • Fundador VIP', true, 'founder_vip', '2099-12-31 23:59:59+00'::timestamptz
FROM auth.users
WHERE LOWER(email) = 'anderson1125@gmail.com'
ON CONFLICT (id) DO UPDATE SET
    is_pro = true,
    subscription_plan = 'founder_vip',
    trial_ends_at = '2099-12-31 23:59:59+00'::timestamptz;

-- 9. Políticas RLS con validación USING y WITH CHECK
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage own motorcycles"
    ON public.motorcycles FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own documents"
    ON public.motorcycle_documents FOR ALL
    USING (
        EXISTS (SELECT 1 FROM public.motorcycles WHERE id = motorcycle_documents.motorcycle_id AND user_id = auth.uid())
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.motorcycles WHERE id = motorcycle_documents.motorcycle_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can manage own service logs"
    ON public.service_logs FOR ALL
    USING (
        EXISTS (SELECT 1 FROM public.motorcycles WHERE id = service_logs.motorcycle_id AND user_id = auth.uid())
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.motorcycles WHERE id = service_logs.motorcycle_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can manage own fuel logs"
    ON public.fuel_logs FOR ALL
    USING (
        EXISTS (SELECT 1 FROM public.motorcycles WHERE id = fuel_logs.motorcycle_id AND user_id = auth.uid())
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.motorcycles WHERE id = fuel_logs.motorcycle_id AND user_id = auth.uid())
    );
