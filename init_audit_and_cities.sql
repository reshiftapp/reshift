-- ============================================================================
-- RESHIFT ESSENTIAL SYSTEM TABLES MIGRATION
-- Execute in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/yvrbxfazgnjiallojyqp/sql/new
-- ============================================================================

-- 1. SECURITY AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.moderator_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moderator_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id text,
  old_value jsonb,
  new_value jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.moderator_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_table_name ON public.moderator_audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.moderator_audit_log(action);

ALTER TABLE public.moderator_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on audit log" ON public.moderator_audit_log;
CREATE POLICY "Service role full access on audit log" ON public.moderator_audit_log
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users view audit log" ON public.moderator_audit_log;
CREATE POLICY "Authenticated users view audit log" ON public.moderator_audit_log
  FOR SELECT TO authenticated USING (true);

-- 2. OPERATIONAL CITIES TABLE
CREATE TABLE IF NOT EXISTS public.cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  label text NOT NULL,
  state text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_cities_name ON public.cities(name);
CREATE INDEX IF NOT EXISTS idx_cities_is_active ON public.cities(is_active);

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on cities" ON public.cities;
CREATE POLICY "Allow public read on cities" ON public.cities
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow service role full access on cities" ON public.cities;
CREATE POLICY "Allow service role full access on cities" ON public.cities
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Seed Default Indian Metros
INSERT INTO public.cities (name, label, state, latitude, longitude)
VALUES
  ('Kochi', 'Kochi', 'Kerala', 9.9312, 76.2673),
  ('Bangalore', 'Bangalore', 'Karnataka', 12.9716, 77.5946),
  ('Trivandrum', 'Trivandrum', 'Kerala', 8.5241, 76.9366),
  ('Calicut', 'Calicut', 'Kerala', 11.2588, 75.7804),
  ('Chennai', 'Chennai', 'Tamil Nadu', 13.0827, 80.2707),
  ('Mumbai', 'Mumbai', 'Maharashtra', 19.0760, 72.8777)
ON CONFLICT (name) DO UPDATE SET
  label = EXCLUDED.label,
  state = EXCLUDED.state,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude;
