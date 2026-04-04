
-- Courses table
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_ar text DEFAULT '',
  description text DEFAULT '',
  category text DEFAULT '',
  level text DEFAULT 'Beginner',
  image_url text,
  teacher_id uuid NOT NULL,
  published boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Modules table
CREATE TABLE public.modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  week integer NOT NULL DEFAULT 1,
  sort_order integer NOT NULL DEFAULT 0,
  has_quiz boolean DEFAULT false,
  has_assignment boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Lessons table
CREATE TABLE public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  type text NOT NULL DEFAULT 'video',
  duration text DEFAULT '',
  content_url text,
  content_text text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Assignments table
CREATE TABLE public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  due_days integer DEFAULT 7,
  max_score integer DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enrollments table
CREATE TABLE public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Lesson progress table
CREATE TABLE public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  UNIQUE(user_id, lesson_id)
);

-- Assignment submissions table
CREATE TABLE public.assignment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  assignment_id uuid REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
  submission_text text,
  file_url text,
  score integer,
  graded boolean DEFAULT false,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  graded_at timestamptz
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Update triggers
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON public.modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- COURSES RLS: Teachers can CRUD their own courses, everyone can read published
CREATE POLICY "Anyone can view published courses" ON public.courses FOR SELECT USING (published = true);
CREATE POLICY "Teachers can view own courses" ON public.courses FOR SELECT TO authenticated USING (teacher_id = auth.uid());
CREATE POLICY "Teachers can create courses" ON public.courses FOR INSERT TO authenticated WITH CHECK (teacher_id = auth.uid() AND has_role(auth.uid(), 'teacher'::app_role));
CREATE POLICY "Teachers can update own courses" ON public.courses FOR UPDATE TO authenticated USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "Teachers can delete own courses" ON public.courses FOR DELETE TO authenticated USING (teacher_id = auth.uid());
CREATE POLICY "Admins can manage all courses" ON public.courses FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- MODULES RLS
CREATE POLICY "Anyone can view modules of published courses" ON public.modules FOR SELECT USING (EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND published = true));
CREATE POLICY "Teachers can view own course modules" ON public.modules FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND teacher_id = auth.uid()));
CREATE POLICY "Teachers can manage own course modules" ON public.modules FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND teacher_id = auth.uid()));

-- LESSONS RLS
CREATE POLICY "Anyone can view lessons of published courses" ON public.lessons FOR SELECT USING (EXISTS (SELECT 1 FROM public.modules m JOIN public.courses c ON c.id = m.course_id WHERE m.id = module_id AND c.published = true));
CREATE POLICY "Teachers can manage own course lessons" ON public.lessons FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.modules m JOIN public.courses c ON c.id = m.course_id WHERE m.id = module_id AND c.teacher_id = auth.uid()));

-- ASSIGNMENTS RLS
CREATE POLICY "Enrolled students can view assignments" ON public.assignments FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.modules m JOIN public.courses c ON c.id = m.course_id JOIN public.enrollments e ON e.course_id = c.id WHERE m.id = module_id AND e.user_id = auth.uid()));
CREATE POLICY "Teachers can manage own course assignments" ON public.assignments FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.modules m JOIN public.courses c ON c.id = m.course_id WHERE m.id = module_id AND c.teacher_id = auth.uid()));

-- ENROLLMENTS RLS
CREATE POLICY "Users can view own enrollments" ON public.enrollments FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can enroll themselves" ON public.enrollments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Teachers can view enrollments for their courses" ON public.enrollments FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND teacher_id = auth.uid()));

-- LESSON_PROGRESS RLS
CREATE POLICY "Users can manage own progress" ON public.lesson_progress FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Teachers can view student progress" ON public.lesson_progress FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.lessons l JOIN public.modules m ON m.id = l.module_id JOIN public.courses c ON c.id = m.course_id WHERE l.id = lesson_id AND c.teacher_id = auth.uid()));

-- ASSIGNMENT_SUBMISSIONS RLS
CREATE POLICY "Students can manage own submissions" ON public.assignment_submissions FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Teachers can view and grade submissions" ON public.assignment_submissions FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.assignments a JOIN public.modules m ON m.id = a.module_id JOIN public.courses c ON c.id = m.course_id WHERE a.id = assignment_id AND c.teacher_id = auth.uid()));
