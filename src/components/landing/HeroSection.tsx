import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import logoIcon from "@/assets/logo-icon.png";
import { useLanguage } from "@/i18n/LanguageContext";

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden rounded-b-3xl islamic-pattern-bg">
      {/* Radial overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[radial-gradient(circle,hsl(37_50%_60%/0.14),transparent_50%)]" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[radial-gradient(circle,hsl(160_72%_21%/0.12),transparent_50%)]" />
      </div>

      <div className="container relative z-10 py-20">
        <div className="max-w-3xl mx-auto text-center">
          {/* Logo in arch frame */}
          <div className="animate-fade-up flex justify-center mb-8">
            <div className="arch-frame bg-card shadow-card p-3">
              <img src={logoIcon} alt="Sabilul Jannah" className="h-24 w-24 rounded-none" width={512} height={512} />
            </div>
          </div>

          <p className="animate-fade-up text-sm font-body font-semibold tracking-[0.2em] uppercase text-accent mb-5">
            {t("hero.subtitle")}
          </p>

          <h1 className="animate-fade-up font-heading font-bold text-foreground leading-[1.05] mb-6">
            {t("hero.title")}
          </h1>

          <p className="animate-fade-up-delay text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 font-body leading-relaxed">
            {t("hero.description")}
          </p>

          <p className="animate-fade-up-delay text-base text-primary font-arabic leading-loose mb-12 italic">
            {t("hero.hadith")}
          </p>

          <div className="animate-fade-up-delay-2 flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/dashboard">{t("hero.cta_primary")}</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/courses">{t("hero.cta_secondary")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
