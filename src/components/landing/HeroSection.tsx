import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { BookOpen, GraduationCap, Users } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import ornamentDivider from "@/assets/ornament-divider.png";
import logoIcon from "@/assets/logo-icon.png";

const stats = [
  { icon: BookOpen, value: "20+", labelKey: "hero.stat_courses" },
  { icon: Users, value: "500+", labelKey: "hero.stat_students" },
  { icon: GraduationCap, value: "15+", labelKey: "hero.stat_scholars" },
];

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden">
      {/* Background image */}
      <img
        src={heroBg}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1080}
      />

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-sage-dark/80 via-sage-dark/60 to-sage-dark/90" />

      {/* Subtle animated particles / floating dots */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] left-[10%] w-2 h-2 rounded-full bg-gold/30 animate-pulse" />
        <div className="absolute top-[25%] right-[15%] w-1.5 h-1.5 rounded-full bg-gold/20 animate-pulse [animation-delay:1s]" />
        <div className="absolute top-[60%] left-[20%] w-1 h-1 rounded-full bg-gold/25 animate-pulse [animation-delay:0.5s]" />
        <div className="absolute top-[45%] right-[25%] w-2 h-2 rounded-full bg-gold/15 animate-pulse [animation-delay:1.5s]" />
      </div>

      <div className="container relative z-10 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="animate-fade-up flex justify-center mb-6">
            <div className="arch-frame bg-cream/10 backdrop-blur-sm border border-gold/20 p-4">
              <img
                src={logoIcon}
                alt="Sabilul Jannah"
                className="h-20 w-20 sm:h-28 sm:w-28 rounded-none"
                width={512}
                height={512}
              />
            </div>
          </div>

          {/* Arabic calligraphy subtitle */}
          <p className="animate-fade-up font-arabic text-gold text-2xl sm:text-3xl mb-3 tracking-wide">
            {t("hero.subtitle")}
          </p>

          {/* Ornament divider */}
          <div className="animate-fade-up flex justify-center mb-6">
            <img
              src={ornamentDivider}
              alt=""
              aria-hidden="true"
              className="w-48 sm:w-64 opacity-60"
              width={800}
              height={512}
            />
          </div>

          {/* Main heading */}
          <h1 className="animate-fade-up font-heading font-bold text-cream leading-[1.05] mb-4 drop-shadow-lg">
            {t("hero.title")}
          </h1>

          {/* Tagline */}
          <p className="animate-fade-up text-xs sm:text-sm font-body font-semibold tracking-[0.25em] uppercase text-gold-light mb-6">
            INTERNATIONAL ONLINE ISLAMIYYA
          </p>

          {/* Description */}
          <p className="animate-fade-up-delay text-base sm:text-lg text-cream/80 max-w-2xl mx-auto mb-4 font-body leading-relaxed">
            {t("hero.description")}
          </p>

          {/* Hadith quote */}
          <div className="animate-fade-up-delay relative max-w-xl mx-auto mb-10">
            <div className="border-l-2 border-r-2 border-gold/30 px-6 py-3">
              <p className="text-base sm:text-lg text-gold font-arabic leading-loose italic">
                {t("hero.hadith")}
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="animate-fade-up-delay-2 flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button variant="gold" size="lg" className="text-base px-10 py-6 shadow-elevated" asChild>
              <Link to="/dashboard">{t("hero.cta_primary")}</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base px-10 py-6 border-cream/25 text-cream hover:bg-cream/10 hover:border-cream/40"
              asChild
            >
              <Link to="/courses">{t("hero.cta_secondary")}</Link>
            </Button>
          </div>

          {/* Stats bar */}
          <div className="animate-fade-up-delay-2">
            <div className="inline-flex flex-wrap justify-center gap-6 sm:gap-12 bg-cream/5 backdrop-blur-sm border border-gold/15 rounded-2xl px-8 py-5">
              {stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-3 text-cream/90">
                  <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-gold" />
                  </div>
                  <div className="text-left">
                    <p className="text-xl sm:text-2xl font-heading font-bold text-gold">{stat.value}</p>
                    <p className="text-xs font-body text-cream/60">{t(stat.labelKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom curve */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 60V30C240 0 480 0 720 15C960 30 1200 30 1440 15V60H0Z"
            fill="hsl(38, 45%, 95%)"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
