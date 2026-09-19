
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.current_org_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION private.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION private.can_access_module(_user_id UUID, _module TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE
    WHEN private.has_role(_user_id, 'admin') THEN true
    WHEN private.has_role(_user_id, 'accountant') THEN _module IN ('dashboard','invoices','expenses','payments','reports')
    WHEN private.has_role(_user_id, 'manager') THEN EXISTS (
      SELECT 1 FROM public.user_module_access
      WHERE user_id = _user_id AND module_key = _module AND enabled
    )
    ELSE false
  END
$$;

REVOKE ALL ON FUNCTION private.current_org_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.can_access_module(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.current_org_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.can_access_module(uuid, text) TO authenticated, service_role;

DROP POLICY "Members can view their organization" ON public.organizations;
DROP POLICY "Admins can update their organization" ON public.organizations;
DROP POLICY "Members can view org profiles" ON public.profiles;
DROP POLICY "Admins can update org profiles" ON public.profiles;
DROP POLICY "Members can view org roles" ON public.user_roles;
DROP POLICY "Admins manage org roles" ON public.user_roles;
DROP POLICY "Members can view own module access" ON public.user_module_access;
DROP POLICY "Admins manage module access" ON public.user_module_access;

CREATE POLICY "Members can view their organization" ON public.organizations
FOR SELECT TO authenticated USING (id = private.current_org_id());
CREATE POLICY "Admins can update their organization" ON public.organizations
FOR UPDATE TO authenticated USING (id = private.current_org_id() AND private.has_role(auth.uid(),'admin'))
WITH CHECK (id = private.current_org_id() AND private.has_role(auth.uid(),'admin'));

CREATE POLICY "Members can view org profiles" ON public.profiles
FOR SELECT TO authenticated USING (organization_id = private.current_org_id());
CREATE POLICY "Admins can update org profiles" ON public.profiles
FOR UPDATE TO authenticated USING (organization_id = private.current_org_id() AND private.has_role(auth.uid(),'admin'))
WITH CHECK (organization_id = private.current_org_id() AND private.has_role(auth.uid(),'admin'));

CREATE POLICY "Members can view org roles" ON public.user_roles
FOR SELECT TO authenticated USING (organization_id = private.current_org_id());
CREATE POLICY "Admins manage org roles" ON public.user_roles
FOR ALL TO authenticated
USING (organization_id = private.current_org_id() AND private.has_role(auth.uid(),'admin'))
WITH CHECK (organization_id = private.current_org_id() AND private.has_role(auth.uid(),'admin'));

CREATE POLICY "Members can view org module access" ON public.user_module_access
FOR SELECT TO authenticated USING (organization_id = private.current_org_id());
CREATE POLICY "Admins manage module access" ON public.user_module_access
FOR ALL TO authenticated
USING (organization_id = private.current_org_id() AND private.has_role(auth.uid(),'admin'))
WITH CHECK (organization_id = private.current_org_id() AND private.has_role(auth.uid(),'admin'));

DROP FUNCTION IF EXISTS public.can_access_module(uuid, text);
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.current_org_id();
