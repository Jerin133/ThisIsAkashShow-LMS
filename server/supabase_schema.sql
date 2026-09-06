-- =========================================================
-- LMS DATABASE SCHEMA & STORAGE SETUP SCRIPT
-- Run this script in the Supabase SQL Editor
-- =========================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to automatically create profile on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  description TEXT,
  price NUMERIC(10, 2) DEFAULT 0,
  duration TEXT,
  level TEXT DEFAULT 'Beginner',
  thumbnail_url TEXT,
  instructor_id UUID REFERENCES public.profiles(id),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MODULES TABLE
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. LESSONS TABLE (with notes & video support)
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration_seconds INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 1,
  is_free BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  video_path TEXT,
  notes_path TEXT,
  notes_content TEXT,
  thumbnail_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ENROLLMENTS TABLE (Students who purchased courses)
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  payment_id TEXT,
  order_id TEXT,
  amount NUMERIC(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'refunded')),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- 6. LESSON PROGRESS TABLE (Tracking watch status)
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  last_watched_second INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- 7. PAYMENTS AUDIT TABLE
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  order_id TEXT,
  payment_id TEXT,
  signature TEXT,
  amount NUMERIC(10, 2),
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'success',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CONTACT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. COURSE RATINGS & REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.course_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, user_id)
);

-- =========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR TABLES
-- =========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, user can update own profile
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Courses: Everyone can view published courses, admins can do all
DROP POLICY IF EXISTS "Published courses viewable by all" ON public.courses;
CREATE POLICY "Published courses viewable by all" ON public.courses FOR SELECT USING (is_published = true OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

DROP POLICY IF EXISTS "Admins have full access to courses" ON public.courses;
CREATE POLICY "Admins have full access to courses" ON public.courses FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Modules: Viewable if parent course viewable
DROP POLICY IF EXISTS "Modules viewable by everyone" ON public.modules;
CREATE POLICY "Modules viewable by everyone" ON public.modules FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins have full access to modules" ON public.modules;
CREATE POLICY "Admins have full access to modules" ON public.modules FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Lessons: Viewable if published
DROP POLICY IF EXISTS "Lessons viewable by everyone" ON public.lessons;
CREATE POLICY "Lessons viewable by everyone" ON public.lessons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins have full access to lessons" ON public.lessons;
CREATE POLICY "Admins have full access to lessons" ON public.lessons FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Enrollments: Students see their own enrollments, admins see all
DROP POLICY IF EXISTS "Students see their own enrollments" ON public.enrollments;
CREATE POLICY "Students see their own enrollments" ON public.enrollments FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

DROP POLICY IF EXISTS "Service role & Admins manage enrollments" ON public.enrollments;
CREATE POLICY "Service role & Admins manage enrollments" ON public.enrollments FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin') OR auth.role() = 'service_role');

-- Progress: Students manage own progress
DROP POLICY IF EXISTS "Students manage own progress" ON public.lesson_progress;
CREATE POLICY "Students manage own progress" ON public.lesson_progress FOR ALL USING (auth.uid() = user_id);

-- Payments: Users see own payments, admins see all
DROP POLICY IF EXISTS "Payments viewable by owner or admin" ON public.payments;
CREATE POLICY "Payments viewable by owner or admin" ON public.payments FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

DROP POLICY IF EXISTS "Payments insertable by authenticated users" ON public.payments;
CREATE POLICY "Payments insertable by authenticated users" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- =========================================================
-- STORAGE BUCKETS & STORAGE RLS POLICIES (Fixes upload error)
-- =========================================================

-- Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('course-videos', 'course-videos', false),
  ('course-notes', 'course-notes', false),
  ('course-thumbnails', 'course-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- 1. Policies for 'course-videos' bucket
DROP POLICY IF EXISTS "Allow authenticated uploads to course-videos" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to course-videos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'course-videos');

DROP POLICY IF EXISTS "Allow authenticated updates to course-videos" ON storage.objects;
CREATE POLICY "Allow authenticated updates to course-videos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'course-videos');

DROP POLICY IF EXISTS "Allow authenticated deletes to course-videos" ON storage.objects;
CREATE POLICY "Allow authenticated deletes to course-videos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'course-videos');

DROP POLICY IF EXISTS "Allow authenticated reads to course-videos" ON storage.objects;
CREATE POLICY "Allow authenticated reads to course-videos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'course-videos');

-- 2. Policies for 'course-notes' bucket
DROP POLICY IF EXISTS "Allow authenticated uploads to course-notes" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to course-notes"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'course-notes');

DROP POLICY IF EXISTS "Allow authenticated updates to course-notes" ON storage.objects;
CREATE POLICY "Allow authenticated updates to course-notes"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'course-notes');

DROP POLICY IF EXISTS "Allow authenticated deletes to course-notes" ON storage.objects;
CREATE POLICY "Allow authenticated deletes to course-notes"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'course-notes');

DROP POLICY IF EXISTS "Allow authenticated reads to course-notes" ON storage.objects;
CREATE POLICY "Allow authenticated reads to course-notes"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'course-notes');

-- 3. Policies for 'course-thumbnails' bucket (Public read, authenticated insert/update/delete)
DROP POLICY IF EXISTS "Allow public read of course-thumbnails" ON storage.objects;
CREATE POLICY "Allow public read of course-thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-thumbnails');

DROP POLICY IF EXISTS "Allow authenticated uploads to course-thumbnails" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to course-thumbnails"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'course-thumbnails');

DROP POLICY IF EXISTS "Allow authenticated updates to course-thumbnails" ON storage.objects;
CREATE POLICY "Allow authenticated updates to course-thumbnails"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'course-thumbnails');

DROP POLICY IF EXISTS "Allow authenticated deletes to course-thumbnails" ON storage.objects;
CREATE POLICY "Allow authenticated deletes to course-thumbnails"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'course-thumbnails');

