CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  role app_role NOT NULL DEFAULT 'manager',
  modules text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending',
  invited_by uuid NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.invitations TO authenticated;
GRANT ALL ON public.invitations TO service_role;

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage org invitations" ON public.invitations
FOR ALL TO authenticated
USING (organization_id = private.current_org_id() AND private.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (organization_id = private.current_org_id() AND private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_invitations_updated_at
BEFORE UPDATE ON public.invitations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX invitations_org_idx ON public.invitations(organization_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_org_id UUID;
  company TEXT;
  invited_org UUID;
  invited_role app_role;
  mod TEXT;
BEGIN
  invited_org := NULLIF(NEW.raw_user_meta_data->>'organization_id','')::uuid;

  IF invited_org IS NOT NULL AND EXISTS (SELECT 1 FROM public.organizations o WHERE o.id = invited_org) THEN
    invited_role := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role',''), 'manager')::app_role;

    INSERT INTO public.profiles (id, organization_id, full_name, email, avatar_url)
    VALUES (
      NEW.id,
      invited_org,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
      COALESCE(NEW.email,''),
      NEW.raw_user_meta_data->>'avatar_url'
    );

    INSERT INTO public.user_roles (user_id, organization_id, role)
    VALUES (NEW.id, invited_org, invited_role);

    IF NEW.raw_user_meta_data ? 'modules' THEN
      FOR mod IN SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'modules') LOOP
        INSERT INTO public.user_module_access (user_id, organization_id, module_key, enabled)
        VALUES (NEW.id, invited_org, mod, true)
        ON CONFLICT DO NOTHING;
      END LOOP;
    END IF;

    UPDATE public.invitations
      SET status = 'accepted'
      WHERE organization_id = invited_org AND lower(email) = lower(COALESCE(NEW.email,'')) AND status = 'pending';

    RETURN NEW;
  END IF;

  company := COALESCE(NULLIF(NEW.raw_user_meta_data->>'company_name',''), 'My Company');
  INSERT INTO public.organizations (name, created_by) VALUES (company, NEW.id)
  RETURNING id INTO new_org_id;

  INSERT INTO public.profiles (id, organization_id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    new_org_id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.email,''),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO public.user_roles (user_id, organization_id, role)
  VALUES (NEW.id, new_org_id, 'admin');

  RETURN NEW;
END; $function$;