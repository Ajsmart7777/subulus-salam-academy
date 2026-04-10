
-- Create donations table
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_name TEXT NOT NULL,
  donor_email TEXT,
  donor_phone TEXT,
  user_id UUID,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  type TEXT NOT NULL DEFAULT 'one-time',
  campaign_id UUID,
  sponsorship_request_id UUID,
  status TEXT NOT NULL DEFAULT 'pending',
  flutterwave_ref TEXT,
  flutterwave_tx_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create donation_campaigns table
CREATE TABLE public.donation_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  goal_amount NUMERIC NOT NULL DEFAULT 0,
  raised_amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'NGN',
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_sponsorship_requests table
CREATE TABLE public.student_sponsorship_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_user_id UUID NOT NULL,
  course_id UUID NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  sponsored_by_donation_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign keys
ALTER TABLE public.donations
  ADD CONSTRAINT donations_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.donation_campaigns(id),
  ADD CONSTRAINT donations_sponsorship_request_id_fkey FOREIGN KEY (sponsorship_request_id) REFERENCES public.student_sponsorship_requests(id);

ALTER TABLE public.student_sponsorship_requests
  ADD CONSTRAINT sponsorship_requests_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  ADD CONSTRAINT sponsorship_requests_donation_id_fkey FOREIGN KEY (sponsored_by_donation_id) REFERENCES public.donations(id);

-- Enable RLS
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_sponsorship_requests ENABLE ROW LEVEL SECURITY;

-- Donations RLS
CREATE POLICY "Anyone can create donations" ON public.donations
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Users can view own donations" ON public.donations
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins can view all donations" ON public.donations
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update donations" ON public.donations
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Campaigns RLS
CREATE POLICY "Anyone can view active campaigns" ON public.donation_campaigns
  FOR SELECT TO anon, authenticated USING (active = true);

CREATE POLICY "Admins can manage campaigns" ON public.donation_campaigns
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Sponsorship requests RLS
CREATE POLICY "Students can create own requests" ON public.student_sponsorship_requests
  FOR INSERT TO authenticated WITH CHECK (student_user_id = auth.uid());

CREATE POLICY "Students can view own requests" ON public.student_sponsorship_requests
  FOR SELECT TO authenticated USING (student_user_id = auth.uid());

CREATE POLICY "Anyone can view pending requests" ON public.student_sponsorship_requests
  FOR SELECT TO anon, authenticated USING (status = 'pending');

CREATE POLICY "Admins can manage all requests" ON public.student_sponsorship_requests
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.donation_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sponsorship_requests_updated_at
  BEFORE UPDATE ON public.student_sponsorship_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
