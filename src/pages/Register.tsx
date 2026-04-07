import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, CheckCircle } from "lucide-react";

const Register = () => {
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get("ref") || "";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referral, setReferral] = useState(referralCode);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Listen for auth state changes (user clicks confirmation link)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        toast({ title: "Email verified! ✓", description: "Welcome to Subulus-Salam Academy." });
        navigate("/dashboard");
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate, toast]);

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
        emailRedirectTo: window.location.origin + "/dashboard",
      },
    });
    setLoading(false);

    if (error) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    } else {
      setEmailSent(true);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    setLoading(false);

    if (error) {
      toast({ title: "Failed to resend", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Email resent!", description: "Check your inbox for the confirmation link." });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-md py-16">
        <div className="bg-card rounded-lg p-8 shadow-card">
          {!emailSent ? (
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
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h1 className="text-2xl font-heading font-bold text-foreground">Check Your Email</h1>
              <p className="text-sm text-muted-foreground font-body">
                We've sent a confirmation link to<br />
                <span className="font-medium text-foreground">{email}</span>
              </p>
              <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground font-body space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>Click the link in your email to verify your account</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>You'll be automatically redirected once verified</span>
                </div>
              </div>

              <button
                onClick={handleResendEmail}
                disabled={loading}
                className="text-sm text-primary font-body hover:underline disabled:opacity-50"
              >
                {loading ? "Sending..." : "Didn't receive the email? Resend"}
              </button>

              <button
                onClick={() => setEmailSent(false)}
                className="text-sm text-muted-foreground font-body hover:underline block mx-auto"
              >
                ← Back to registration
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
