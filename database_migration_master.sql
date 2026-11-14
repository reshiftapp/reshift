-- ============================================================================
-- RESHIFT MODERATOR DASHBOARD — MASTER DATABASE MIGRATION SCRIPT
-- Execute in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/yvrbxfazgnjiallojyqp/sql/new
-- ============================================================================

BEGIN;

-- 1. ROLE SYSTEM & USER PROFILE ENHANCEMENTS
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS moderator_role text CHECK (moderator_role IN ('volunteer', 'content_editor', 'moderator', 'super_admin')),
  ADD COLUMN IF NOT EXISTS mobile_number text,
  ADD COLUMN IF NOT EXISTS id_card_url text,
  ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS is_suspended boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS suspension_reason text,
  ADD COLUMN IF NOT EXISTS suspended_at timestamptz,
  ADD COLUMN IF NOT EXISTS suspended_by uuid REFERENCES public.profiles(id);

-- OTP Codes Table for Brevo Email Password Reset
CREATE TABLE IF NOT EXISTS public.auth_otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  otp_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  attempts integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auth_otp_email ON public.auth_otp_codes(email);
ALTER TABLE public.auth_otp_codes ENABLE ROW LEVEL SECURITY;
-- Service role only access for security
CREATE POLICY "Service role full access on auth_otp_codes" ON public.auth_otp_codes
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Helper security functions
CREATE OR REPLACE FUNCTION public.is_moderator()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT COALESCE(
    (SELECT moderator_role IS NOT NULL FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT COALESCE(
    (SELECT moderator_role = 'super_admin' FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Protect moderator_role and suspension flags from self-update by standard users
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  -- If executing as service_role, allow any update
  IF current_setting('role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- If moderator_role is being modified
  IF (OLD.moderator_role IS DISTINCT FROM NEW.moderator_role) THEN
    IF NOT public.is_super_admin() THEN
      RAISE EXCEPTION 'Only super_admins can modify moderator roles.';
    END IF;
  END IF;

  -- If suspension status is being modified
  IF (OLD.is_suspended IS DISTINCT FROM NEW.is_suspended) OR (OLD.suspension_reason IS DISTINCT FROM NEW.suspension_reason) THEN
    IF NOT public.is_moderator() THEN
      RAISE EXCEPTION 'Only moderators can suspend or reactivate accounts.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

-- 2. EVENTS & HERO CAROUSEL EXTENSIONS
-- ----------------------------------------------------------------------------
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order smallint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- 3. COMMUNITY MODERATION ENHANCEMENTS
-- ----------------------------------------------------------------------------
ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS is_pinned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hidden_reason text,
  ADD COLUMN IF NOT EXISTS moderated_by uuid REFERENCES public.profiles(id);

-- 4. EXPLORE CARDS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.explore_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  title text NOT NULL,
  subtitle text NOT NULL,
  image_url text,
  action_route text NOT NULL DEFAULT '/explore',
  sort_order smallint NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. APP BANNERS TABLE (SPLASH & ONBOARDING)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  placement text NOT NULL CHECK (placement IN ('splash', 'onboarding_1', 'onboarding_2', 'onboarding_3', 'home_popup')),
  image_url text NOT NULL,
  title text,
  subtitle text,
  action_url text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. PUSH NOTIFICATIONS TABLE & FCM TOKENS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_fcm_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  fcm_token text NOT NULL UNIQUE,
  device_platform text CHECK (device_platform IN ('android', 'ios', 'web')),
  city text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.push_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  target_city text[] NOT NULL DEFAULT '{}',
  target_audience text NOT NULL DEFAULT 'all',
  notification_type text NOT NULL DEFAULT 'Announcement',
  image_url text,
  deep_link text,
  scheduled_at timestamptz,
  sent_at timestamptz,
  sent_by uuid REFERENCES public.profiles(id),
  delivery_count integer DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 7. SUPPORT TICKET ENHANCEMENTS & NOTES
-- ----------------------------------------------------------------------------
ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS resolved_at timestamptz,
  ADD COLUMN IF NOT EXISTS resolved_by uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS internal_status text DEFAULT 'Open';

CREATE TABLE IF NOT EXISTS public.ticket_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  moderator_id uuid NOT NULL REFERENCES public.profiles(id),
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8. AUTOMATED AUDIT LOGGING SYSTEM
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.moderator_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moderator_id uuid REFERENCES public.profiles(id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id text,
  old_value jsonb,
  new_value jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Audit log trigger function
CREATE OR REPLACE FUNCTION public.audit_moderator_action_trigger()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_actor_id uuid := auth.uid();
  v_rec_id text;
  v_old_data jsonb := NULL;
  v_new_data jsonb := NULL;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_rec_id := OLD.id::text;
    v_old_data := to_jsonb(OLD);
  ELSIF TG_OP = 'UPDATE' THEN
    v_rec_id := NEW.id::text;
    v_old_data := to_jsonb(OLD);
    v_new_data := to_jsonb(NEW);
  ELSIF TG_OP = 'INSERT' THEN
    v_rec_id := NEW.id::text;
    v_new_data := to_jsonb(NEW);
  END IF;

  IF v_actor_id IS NOT NULL AND public.is_moderator() THEN
    INSERT INTO public.moderator_audit_log (
      moderator_id,
      action,
      table_name,
      record_id,
      old_value,
      new_value
    ) VALUES (
      v_actor_id,
      TG_OP,
      TG_TABLE_NAME,
      v_rec_id,
      v_old_data,
      v_new_data
    );
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY['properties', 'events', 'food_spots', 'community_posts', 'support_tickets', 'essential_places', 'internet_plans'];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_audit_%I ON public.%I;', tbl, tbl);
    EXECUTE format('CREATE TRIGGER trg_audit_%I AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.audit_moderator_action_trigger();', tbl, tbl);
  END LOOP;
END $$;

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.explore_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_fcm_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderator_audit_log ENABLE ROW LEVEL SECURITY;

-- Explore Cards
DROP POLICY IF EXISTS "Public can view active explore cards" ON public.explore_cards;
CREATE POLICY "Public can view active explore cards" ON public.explore_cards
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Moderators can manage explore cards" ON public.explore_cards;
CREATE POLICY "Moderators can manage explore cards" ON public.explore_cards
  FOR ALL TO authenticated USING (public.is_moderator()) WITH CHECK (public.is_moderator());

-- App Banners
DROP POLICY IF EXISTS "Public can view active banners" ON public.app_banners;
CREATE POLICY "Public can view active banners" ON public.app_banners
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Moderators can manage banners" ON public.app_banners;
CREATE POLICY "Moderators can manage banners" ON public.app_banners
  FOR ALL TO authenticated USING (public.is_moderator()) WITH CHECK (public.is_moderator());

-- Push Notifications
DROP POLICY IF EXISTS "Moderators can manage push notifications" ON public.push_notifications;
CREATE POLICY "Moderators can manage push notifications" ON public.push_notifications
  FOR ALL TO authenticated USING (public.is_moderator()) WITH CHECK (public.is_moderator());

-- Ticket Notes
DROP POLICY IF EXISTS "Moderators can manage ticket notes" ON public.ticket_notes;
CREATE POLICY "Moderators can manage ticket notes" ON public.ticket_notes
  FOR ALL TO authenticated USING (public.is_moderator()) WITH CHECK (public.is_moderator());

-- Audit Log
DROP POLICY IF EXISTS "Moderators can view audit logs" ON public.moderator_audit_log;
CREATE POLICY "Moderators can view audit logs" ON public.moderator_audit_log
  FOR SELECT TO authenticated USING (public.is_moderator());

-- Grant moderators access to existing tables
DROP POLICY IF EXISTS "Moderators full access on properties" ON public.properties;
CREATE POLICY "Moderators full access on properties" ON public.properties
  FOR ALL TO authenticated USING (public.is_moderator()) WITH CHECK (public.is_moderator());

DROP POLICY IF EXISTS "Moderators full access on events" ON public.events;
CREATE POLICY "Moderators full access on events" ON public.events
  FOR ALL TO authenticated USING (public.is_moderator()) WITH CHECK (public.is_moderator());

DROP POLICY IF EXISTS "Moderators full access on food_spots" ON public.food_spots;
CREATE POLICY "Moderators full access on food_spots" ON public.food_spots
  FOR ALL TO authenticated USING (public.is_moderator()) WITH CHECK (public.is_moderator());

DROP POLICY IF EXISTS "Moderators full access on community_posts" ON public.community_posts;
CREATE POLICY "Moderators full access on community_posts" ON public.community_posts
  FOR ALL TO authenticated USING (public.is_moderator()) WITH CHECK (public.is_moderator());

DROP POLICY IF EXISTS "Moderators full access on support_tickets" ON public.support_tickets;
CREATE POLICY "Moderators full access on support_tickets" ON public.support_tickets
  FOR ALL TO authenticated USING (public.is_moderator()) WITH CHECK (public.is_moderator());

DROP POLICY IF EXISTS "Moderators full access on transport_stops" ON public.transport_stops;
CREATE POLICY "Moderators full access on transport_stops" ON public.transport_stops
  FOR ALL TO authenticated USING (public.is_moderator()) WITH CHECK (public.is_moderator());

DROP POLICY IF EXISTS "Moderators full access on bus_routes" ON public.bus_routes;
CREATE POLICY "Moderators full access on bus_routes" ON public.bus_routes
  FOR ALL TO authenticated USING (public.is_moderator()) WITH CHECK (public.is_moderator());

DROP POLICY IF EXISTS "Moderators full access on bus_route_stops" ON public.bus_route_stops;
CREATE POLICY "Moderators full access on bus_route_stops" ON public.bus_route_stops
  FOR ALL TO authenticated USING (public.is_moderator()) WITH CHECK (public.is_moderator());

DROP POLICY IF EXISTS "Moderators full access on essential_places" ON public.essential_places;
CREATE POLICY "Moderators full access on essential_places" ON public.essential_places
  FOR ALL TO authenticated USING (public.is_moderator()) WITH CHECK (public.is_moderator());

DROP POLICY IF EXISTS "Moderators full access on internet_plans" ON public.internet_plans;
CREATE POLICY "Moderators full access on internet_plans" ON public.internet_plans
  FOR ALL TO authenticated USING (public.is_moderator()) WITH CHECK (public.is_moderator());

DROP POLICY IF EXISTS "Moderators full access on emergency_services" ON public.emergency_services;
CREATE POLICY "Moderators full access on emergency_services" ON public.emergency_services
  FOR ALL TO authenticated USING (public.is_moderator()) WITH CHECK (public.is_moderator());

DROP POLICY IF EXISTS "Moderators full access on local_guides" ON public.local_guides;
CREATE POLICY "Moderators full access on local_guides" ON public.local_guides
  FOR ALL TO authenticated USING (public.is_moderator()) WITH CHECK (public.is_moderator());

DROP POLICY IF EXISTS "Moderators full access on relocation_steps" ON public.relocation_steps;
CREATE POLICY "Moderators full access on relocation_steps" ON public.relocation_steps
  FOR ALL TO authenticated USING (public.is_moderator()) WITH CHECK (public.is_moderator());

COMMIT;
