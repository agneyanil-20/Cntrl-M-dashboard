-- ══════════════════════════════════════════
-- CNTRL M DASHBOARD DB SCHEMA (SUPABASE)
-- ══════════════════════════════════════════

-- 1. Profiles (Extends auth.users)
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'team_member')) DEFAULT 'team_member'
);

-- 2. Clients Table
CREATE TABLE public.clients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  cycle_start_day int NOT NULL,
  cycle_end_day int NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Deliverables Template
CREATE TABLE public.deliverables (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES public.clients ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  quantity int NOT NULL DEFAULT 1,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Cycles Table (Tracks monthly/periodic sprints)
CREATE TABLE public.cycles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES public.clients ON DELETE CASCADE NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'completed')) DEFAULT 'active',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tasks (Specific work items)
CREATE TABLE public.tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES public.clients ON DELETE CASCADE NOT NULL,
  cycle_id uuid REFERENCES public.cycles ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status text NOT NULL CHECK (status IN ('pending', 'in progress', 'completed')) DEFAULT 'pending',
  due_date date,
  submission_link text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ══════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ══════════════════════════════════════════

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles, but can only update their own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Clients: Read all, only admin can insert/update/delete
CREATE POLICY "Clients viewable by all authenticated" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Clients full access for admins" ON public.clients FOR ALL TO authenticated USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Deliverables
CREATE POLICY "Deliverables viewable by all authenticated" ON public.deliverables FOR SELECT TO authenticated USING (true);
CREATE POLICY "Deliverables full access for admins" ON public.deliverables FOR ALL TO authenticated USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Cycles
CREATE POLICY "Cycles viewable by all authenticated" ON public.cycles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Cycles full access for admins" ON public.cycles FOR ALL TO authenticated USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Tasks
-- Team members can read all tasks, but only update their own. Admins can do anything.
CREATE POLICY "Tasks viewable by all authenticated" ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Tasks updatable by assigned user" ON public.tasks FOR UPDATE TO authenticated USING (
  assigned_to = auth.uid()
);
CREATE POLICY "Tasks full access for admins" ON public.tasks FOR ALL TO authenticated USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (new.id, new.raw_user_meta_data->>'name', COALESCE(new.raw_user_meta_data->>'role', 'team_member'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically add profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
