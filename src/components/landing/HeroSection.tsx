import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroPattern from "@/assets/hero-pattern.jpg";
import logoIcon from "@/assets/logo-icon.png";
import { useLanguage } from "@/i18n/LanguageContext";

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroPattern} alt="" className="w-full h-full object-cover opacity-30" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>

      <div className="container relative z-10 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="animate-fade-up flex justify-center mb-6">
            <img src={logoIcon} alt="Sabilul Jannah" className="h-28 w-28" width={512} height={512} />
          </div>

          <p className="animate-fade-up text-sm font-body font-semibold tracking-widest uppercase text-primary mb-4">
            {t("hero.subtitle")}
          </p>

          <h1 className="animate-fade-up text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-foreground leading-tight mb-6">
            {t("hero.title")}
          </h1>

          <p className="animate-fade-up-delay text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 font-body">
            {t("hero.description")}
          </p>

          <p className="animate-fade-up-delay text-sm text-muted-foreground mb-10 font-body italic">
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
