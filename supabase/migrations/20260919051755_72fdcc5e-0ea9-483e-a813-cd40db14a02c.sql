
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  base_currency TEXT NOT NULL DEFAULT 'USD',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'accountant');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, organization_id, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_module_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  module_key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, module_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_module_access TO authenticated;
GRANT ALL ON public.user_module_access TO service_role;
ALTER TABLE public.user_module_access ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.current_org_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.can_access_module(_user_id UUID, _module TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE
    WHEN public.has_role(_user_id, 'admin') THEN true
    WHEN public.has_role(_user_id, 'accountant') THEN _module IN ('dashboard','invoices','expenses','payments','reports')
    WHEN public.has_role(_user_id, 'manager') THEN EXISTS (
      SELECT 1 FROM public.user_module_access
      WHERE user_id = _user_id AND module_key = _module AND enabled
    )
    ELSE false
  END
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_module_access_updated_at BEFORE UPDATE ON public.user_module_access
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Policies
CREATE POLICY "Members can view their organization" ON public.organizations
FOR SELECT TO authenticated USING (id = public.current_org_id());
CREATE POLICY "Admins can update their organization" ON public.organizations
FOR UPDATE TO authenticated USING (id = public.current_org_id() AND public.has_role(auth.uid(),'admin'))
WITH CHECK (id = public.current_org_id() AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "Members can view org profiles" ON public.profiles
FOR SELECT TO authenticated USING (organization_id = public.current_org_id());
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Admins can update org profiles" ON public.profiles
FOR UPDATE TO authenticated USING (organization_id = public.current_org_id() AND public.has_role(auth.uid(),'admin'))
WITH CHECK (organization_id = public.current_org_id() AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "Members can view org roles" ON public.user_roles
FOR SELECT TO authenticated USING (organization_id = public.current_org_id());
CREATE POLICY "Admins manage org roles" ON public.user_roles
FOR ALL TO authenticated
USING (organization_id = public.current_org_id() AND public.has_role(auth.uid(),'admin'))
WITH CHECK (organization_id = public.current_org_id() AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "Members can view own module access" ON public.user_module_access
FOR SELECT TO authenticated USING (organization_id = public.current_org_id());
CREATE POLICY "Admins manage module access" ON public.user_module_access
FOR ALL TO authenticated
USING (organization_id = public.current_org_id() AND public.has_role(auth.uid(),'admin'))
WITH CHECK (organization_id = public.current_org_id() AND public.has_role(auth.uid(),'admin'));

-- Signup: create org + profile + admin role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_org_id UUID;
  company TEXT;
BEGIN
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
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
