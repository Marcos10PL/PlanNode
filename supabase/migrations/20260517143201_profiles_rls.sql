DROP POLICY IF EXISTS "Users can select own profile." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '';

CREATE POLICY "Users can select own profile."
ON profiles FOR SELECT
USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can insert their own profile."
ON profiles FOR INSERT
WITH CHECK ((SELECT auth.uid()) = id AND role = 'user');

CREATE POLICY "Users can update own profile."
ON profiles FOR UPDATE
USING ((SELECT auth.uid()) = id AND role = 'user');

CREATE POLICY "Admins can do anything."
ON profiles
USING (public.is_admin());

ALTER TABLE public.profiles ALTER COLUMN full_name SET NOT NULL;