import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get("ref") || "";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referral, setReferral] = useState(referralCode);
  const [loading, setLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          ...(referral ? { referred_by: referral } : {}),
        },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);

    if (error) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Verification code sent!",
        description: "Check your email for the 6-digit code.",
      });
      setOtpStep(true);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;
    setVerifying(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "signup",
    });
    setVerifying(false);

    if (error) {
      toast({ title: "Verification failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Email verified! ✓", description: "Welcome to Subulus-Salam Academy." });
      navigate("/dashboard");
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    setLoading(false);

    if (error) {
      toast({ title: "Failed to resend", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Code resent!", description: "Check your email for the new code." });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-md py-16">
        <div className="bg-card rounded-lg p-8 shadow-card">
          {!otpStep ? (
            <>
              <h1 className="text-2xl font-heading font-bold text-foreground text-center mb-2">Begin Your Journey</h1>
              <p className="text-sm text-muted-foreground font-body text-center mb-6">
                Create your account to start learning
              </p>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="fullName" className="font-body">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="font-body">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="font-body">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="referral" className="font-body">Referral Code (optional)</Label>
                  <Input
                    id="referral"
                    type="text"
                    value={referral}
                    onChange={(e) => setReferral(e.target.value)}
                    placeholder="e.g. SJ-abc12345"
                  />
                </div>
                <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>

              <p className="text-sm text-muted-foreground font-body text-center mt-6">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Sign In
                </Link>
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-heading font-bold text-foreground text-center mb-2">Verify Your Email</h1>
              <p className="text-sm text-muted-foreground font-body text-center mb-6">
                Enter the 6-digit code sent to <span className="font-medium text-foreground">{email}</span>
              </p>

              <div className="flex justify-center mb-6">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                variant="hero"
                className="w-full mb-3"
                onClick={handleVerifyOtp}
                disabled={otp.length !== 6 || verifying}
              >
                {verifying ? "Verifying..." : "Verify Email"}
              </Button>

              <div className="text-center">
                <button
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-sm text-primary font-body hover:underline disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Didn't receive the code? Resend"}
                </button>
              </div>

              <button
                onClick={() => setOtpStep(false)}
                className="text-sm text-muted-foreground font-body hover:underline mt-4 block mx-auto"
              >
                ← Back to registration
              </button>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
