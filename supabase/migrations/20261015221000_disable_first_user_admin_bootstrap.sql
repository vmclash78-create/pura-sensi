-- Once an administrator already exists, remove the first-signup-wins bootstrap.
-- If no admin exists yet, keep the bootstrap trigger to avoid locking the project out;
-- in that case, disable public sign-ups in Supabase until an administrator is provisioned.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    DROP TRIGGER IF EXISTS on_auth_user_created_first_admin ON auth.users;
    DROP FUNCTION IF EXISTS public.handle_new_user_first_admin();
  END IF;
END
$$;
