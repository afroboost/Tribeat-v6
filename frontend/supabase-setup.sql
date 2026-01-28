-- ============================================
-- BEATTRIBE - CONFIGURATION SUPABASE
-- ============================================
-- Exécutez ces commandes dans Supabase > SQL Editor
-- https://supabase.com/dashboard/project/tfghpbgbtpgrjlhomlvz/sql
-- ============================================

-- 1. CRÉER LA TABLE PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('none', 'trial', 'monthly', 'yearly', 'enterprise')),
  has_accepted_terms BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ACTIVER ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. CRÉER LES POLICIES RLS
-- ============================================
-- Policy: Les utilisateurs peuvent lire leur propre profil
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Le système peut insérer des profils
CREATE POLICY "System can insert profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (true);

-- 4. CRÉER LA FONCTION TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role, subscription_status, has_accepted_terms)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    'user',
    'trial',
    FALSE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. CRÉER LE TRIGGER
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. DÉFINIR L'ADMIN
-- ============================================
-- Exécutez cette commande APRÈS avoir créé un compte avec cet email
UPDATE public.profiles 
SET role = 'admin', subscription_status = 'enterprise' 
WHERE email = 'contact.artboost@gmail.com';

-- 7. VÉRIFIER LA CONFIGURATION
-- ============================================
SELECT 
  id,
  email,
  role,
  subscription_status,
  has_accepted_terms,
  created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- STORAGE POLICIES (audio-tracks bucket)
-- ============================================

-- Policy INSERT (permettre les uploads)
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'audio-tracks');

-- Policy SELECT (permettre la lecture)
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'audio-tracks');

-- Policy DELETE (permettre la suppression par le créateur)
CREATE POLICY "Allow owner delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'audio-tracks');

-- ============================================
-- FIN DE LA CONFIGURATION
-- ============================================
