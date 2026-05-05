
-- ========== 1. SPONSORSHIP REQUESTS ==========
DROP POLICY IF EXISTS "Anyone can view pending requests" ON public.student_sponsorship_requests;

CREATE OR REPLACE FUNCTION public.get_public_pending_sponsorships()
RETURNS TABLE (
  id uuid,
  course_id uuid,
  student_first_name text,
  course_title text,
  course_level text,
  course_price numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    r.id,
    r.course_id,
    COALESCE(split_part(p.full_name, ' ', 1), 'Student') AS student_first_name,
    c.title AS course_title,
    c.level AS course_level,
    c.price AS course_price
  FROM public.student_sponsorship_requests r
  LEFT JOIN public.profiles p ON p.user_id = r.student_user_id
  LEFT JOIN public.courses c ON c.id = r.course_id
  WHERE r.status = 'pending'
  ORDER BY r.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.get_public_pending_sponsorships() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_pending_sponsorships() TO anon, authenticated;

-- ========== 2. DONATIONS - tighten insert ==========
DROP POLICY IF EXISTS "Anyone can create donations" ON public.donations;

CREATE POLICY "Anyone can create pending donations"
ON public.donations
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'pending'
  AND flutterwave_tx_id IS NULL
  AND (user_id IS NULL OR user_id = auth.uid())
  AND amount > 0
);

-- ========== 3. STORAGE: lesson-content - restrict writes ==========
DROP POLICY IF EXISTS "Teachers can upload lesson content" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can update lesson content" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can delete lesson content" ON storage.objects;

CREATE POLICY "Teachers and admins can upload lesson content"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'lesson-content'
  AND (public.has_role(auth.uid(), 'teacher'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Teachers and admins can update lesson content"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'lesson-content'
  AND (public.has_role(auth.uid(), 'teacher'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Teachers and admins can delete lesson content"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'lesson-content'
  AND (public.has_role(auth.uid(), 'teacher'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role))
);

-- ========== 4. REFERRAL REWARDS - remove user insert ==========
DROP POLICY IF EXISTS "Authenticated can insert own referral rewards" ON public.referral_rewards;

-- ========== 5. LESSONS & QUIZZES - restrict public access ==========
DROP POLICY IF EXISTS "Anyone can view lessons of published courses" ON public.lessons;
DROP POLICY IF EXISTS "Anyone can view quizzes of published courses" ON public.quizzes;

CREATE POLICY "Enrolled students can view lessons"
ON public.lessons FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.modules m
    JOIN public.courses c ON c.id = m.course_id
    JOIN public.enrollments e ON e.course_id = c.id
    WHERE m.id = lessons.module_id AND e.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.modules m
    JOIN public.courses c ON c.id = m.course_id
    WHERE m.id = lessons.module_id AND c.teacher_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- ========== 6. REVOKE EXECUTE on internal functions ==========
REVOKE EXECUTE ON FUNCTION public.increment_campaign_raised(uuid, numeric) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_referral_code() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.award_referral_on_enrollment() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
