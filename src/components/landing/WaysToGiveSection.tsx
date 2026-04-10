import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, GraduationCap } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const WaysToGiveSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-muted/30">
      <div className="container">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/15 text-accent text-xs font-semibold font-body tracking-wider uppercase mb-4">
            {t("give.badge")}
          </span>
          <h2 className="font-heading font-bold text-foreground mb-3" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}>
            {t("give.title")}
          </h2>
          <p className="text-muted-foreground font-body max-w-xl mx-auto text-lg leading-relaxed">
            {t("give.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Donate Card */}
          <div className="group relative bg-card rounded-2xl border border-primary/10 p-8 shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 islamic-pattern-bg opacity-10 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-xl gradient-gold flex items-center justify-center mb-6">
                <Heart className="h-7 w-7 text-foreground" />
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground mb-3">
                {t("give.donate_title")}
              </h3>
              <p className="text-muted-foreground font-body leading-relaxed mb-6">
                {t("give.donate_desc")}
              </p>
              <Button variant="gold" asChild>
                <Link to="/donate">{t("give.donate_cta")}</Link>
              </Button>
            </div>
          </div>

          {/* Sponsor Card */}
          <div className="group relative bg-card rounded-2xl border border-primary/10 p-8 shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 islamic-pattern-bg opacity-10 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center mb-6">
                <GraduationCap className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground mb-3">
                {t("give.sponsor_title")}
              </h3>
              <p className="text-muted-foreground font-body leading-relaxed mb-6">
                {t("give.sponsor_desc")}
              </p>
              <Button variant="hero" asChild>
                <Link to="/sponsor-a-student">{t("give.sponsor_cta")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WaysToGiveSection;
