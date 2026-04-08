import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, CheckCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

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
  const { t } = useLanguage();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        toast({ title: t("register.email_verified"), description: t("register.welcome") });
        navigate("/dashboard");
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate, toast, t]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { full_name: fullName, ...(referral ? { referred_by: referral } : {}) },
        emailRedirectTo: window.location.origin + "/dashboard",
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: t("register.failed"), description: error.message, variant: "destructive" });
    } else {
      setEmailSent(true);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setLoading(false);
    if (error) {
      toast({ title: t("register.resend_failed"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("register.resent"), description: t("register.resent_desc") });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 sm:px-6 max-w-md py-10 sm:py-16">
        <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-card border border-border">
          {!emailSent ? (
            <>
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-foreground text-center mb-2">{t("register.title")}</h1>
              <p className="text-sm text-muted-foreground font-body text-center mb-6">{t("register.subtitle")}</p>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="fullName" className="font-body">{t("register.fullname")}</Label>
                  <Input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="rounded-xl" />
                </div>
                <div>
                  <Label htmlFor="email" className="font-body">{t("register.email")}</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@example.com" required className="rounded-xl" />
                </div>
                <div>
                  <Label htmlFor="password" className="font-body">{t("register.password")}</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={6} required className="rounded-xl" />
                </div>
                <div>
                  <Label htmlFor="referral" className="font-body">{t("register.referral")}</Label>
                  <Input id="referral" type="text" value={referral} onChange={(e) => setReferral(e.target.value)} placeholder="e.g. SJ-abc12345" className="rounded-xl" />
                </div>
                <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                  {loading ? t("register.loading") : t("register.submit")}
                </Button>
              </form>
              <p className="text-sm text-muted-foreground font-body text-center mt-6">
                {t("register.has_account")}{" "}
                <Link to="/login" className="text-primary font-medium hover:underline">{t("nav.login")}</Link>
              </p>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-foreground">{t("register.check_email")}</h1>
              <p className="text-sm text-muted-foreground font-body">
                {t("register.email_sent")}<br />
                <span className="font-medium text-foreground">{email}</span>
              </p>
              <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground font-body space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{t("register.verify_step")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{t("register.redirect_step")}</span>
                </div>
              </div>
              <button onClick={handleResendEmail} disabled={loading} className="text-sm text-primary font-body hover:underline disabled:opacity-50">
                {loading ? t("register.sending") : t("register.resend")}
              </button>
              <button onClick={() => setEmailSent(false)} className="text-sm text-muted-foreground font-body hover:underline block mx-auto">
                {t("register.back")}
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
