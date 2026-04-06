
-- Add price column to courses
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS price numeric DEFAULT 0;

-- Referral codes table
CREATE TABLE public.referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  code text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own referral code" ON public.referral_codes FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create own referral code" ON public.referral_codes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can view all referral codes" ON public.referral_codes FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Referral rewards table
CREATE TABLE public.referral_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_id uuid NOT NULL,
  enrollment_id uuid NOT NULL,
  credits integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own rewards" ON public.referral_rewards FOR SELECT TO authenticated USING (referrer_id = auth.uid());
CREATE POLICY "System can insert rewards" ON public.referral_rewards FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can view all rewards" ON public.referral_rewards FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Payments table
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'NGN',
  status text NOT NULL DEFAULT 'pending',
  flutterwave_ref text,
  flutterwave_tx_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create own payments" ON public.payments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can view all payments" ON public.payments FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update payments" ON public.payments FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Certificates table
CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL,
  certificate_number text UNIQUE NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own certificates" ON public.certificates FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "System can insert certificates" ON public.certificates FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Teachers can view course certificates" ON public.certificates FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM courses WHERE courses.id = certificates.course_id AND courses.teacher_id = auth.uid())
);
CREATE POLICY "Admins can view all certificates" ON public.certificates FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Function to generate referral code for new users
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.referral_codes (user_id, code)
  VALUES (NEW.id, 'SJ-' || substr(md5(NEW.id::text || now()::text), 1, 8));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_referral
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.generate_referral_code();

-- Function to award referral credits on enrollment
CREATE OR REPLACE FUNCTION public.award_referral_on_enrollment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referrer uuid;
  ref_code text;
BEGIN
  -- Check if the enrolled user was referred (stored in user metadata)
  SELECT (raw_user_meta_data->>'referred_by')::text INTO ref_code
  FROM auth.users WHERE id = NEW.user_id;
  
  IF ref_code IS NOT NULL THEN
    SELECT user_id INTO referrer FROM public.referral_codes WHERE code = ref_code;
    IF referrer IS NOT NULL AND referrer != NEW.user_id THEN
      -- Check if reward already given for this enrollment
      IF NOT EXISTS (SELECT 1 FROM public.referral_rewards WHERE enrollment_id = NEW.id) THEN
        INSERT INTO public.referral_rewards (referrer_id, referred_id, enrollment_id, credits)
        VALUES (referrer, NEW.user_id, NEW.id, 100);
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_enrollment_award_referral
  AFTER INSERT ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION public.award_referral_on_enrollment();
