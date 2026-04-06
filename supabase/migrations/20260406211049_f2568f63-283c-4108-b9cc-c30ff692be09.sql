
DROP POLICY "System can insert rewards" ON public.referral_rewards;
CREATE POLICY "Authenticated can insert own referral rewards" ON public.referral_rewards FOR INSERT TO authenticated WITH CHECK (referrer_id = auth.uid() OR referred_id = auth.uid());
