import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      toast({ title: t("login.failed"), description: error.message, variant: "destructive" });
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 sm:px-6 max-w-md py-10 sm:py-16">
        <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-card border border-border">
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-foreground text-center mb-2">{t("login.title")}</h1>
          <p className="text-sm text-muted-foreground font-body text-center mb-6">
            {t("login.subtitle")}
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="font-body">{t("login.email")}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@example.com" required className="rounded-xl" />
            </div>
            <div>
              <Label htmlFor="password" className="font-body">{t("login.password")}</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="rounded-xl" />
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
              {loading ? t("login.loading") : t("login.submit")}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground font-body text-center mt-6">
            {t("login.no_account")}{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              {t("nav.signup")}
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
