-- ============================================================================
-- RESHIFT CITIES TABLE MIGRATION
-- Execute in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/yvrbxfazgnjiallojyqp/sql/new
-- ============================================================================

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

-- Allow all authenticated users and public to read cities
DROP POLICY IF EXISTS "Allow public read on cities" ON public.cities;
CREATE POLICY "Allow public read on cities" ON public.cities
  FOR SELECT USING (true);

-- Allow service role full administrative access on cities
DROP POLICY IF EXISTS "Allow service role full access on cities" ON public.cities;
CREATE POLICY "Allow service role full access on cities" ON public.cities
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Seed default Operational Indian Metros
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
