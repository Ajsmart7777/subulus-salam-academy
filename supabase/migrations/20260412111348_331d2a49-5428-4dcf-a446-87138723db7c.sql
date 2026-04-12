
-- Create quizzes table
CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  passing_score INTEGER NOT NULL DEFAULT 70,
  time_limit_minutes INTEGER DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz_attempts table
CREATE TABLE public.quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  passed BOOLEAN NOT NULL DEFAULT false,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Quizzes RLS policies
CREATE POLICY "Enrolled students can view quizzes"
ON public.quizzes FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM modules m
    JOIN courses c ON c.id = m.course_id
    JOIN enrollments e ON e.course_id = c.id
    WHERE m.id = quizzes.module_id AND e.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view quizzes of published courses"
ON public.quizzes FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM modules m
    JOIN courses c ON c.id = m.course_id
    WHERE m.id = quizzes.module_id AND c.published = true
  )
);

CREATE POLICY "Teachers can manage own course quizzes"
ON public.quizzes FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM modules m
    JOIN courses c ON c.id = m.course_id
    WHERE m.id = quizzes.module_id AND c.teacher_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all quizzes"
ON public.quizzes FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Quiz attempts RLS policies
CREATE POLICY "Students can view own attempts"
ON public.quiz_attempts FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Students can create own attempts"
ON public.quiz_attempts FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Teachers can view attempts for their courses"
ON public.quiz_attempts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM quizzes q
    JOIN modules m ON m.id = q.module_id
    JOIN courses c ON c.id = m.course_id
    WHERE q.id = quiz_attempts.quiz_id AND c.teacher_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all attempts"
ON public.quiz_attempts FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_quizzes_updated_at
BEFORE UPDATE ON public.quizzes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Also create the missing increment_campaign_raised function
CREATE OR REPLACE FUNCTION public.increment_campaign_raised(_campaign_id UUID, _amount NUMERIC)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE donation_campaigns
  SET raised_amount = raised_amount + _amount
  WHERE id = _campaign_id;
$$;
