import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { Search } from "lucide-react";
import heroQuran from "@/assets/hero-quran.png";
import ornamentDivider from "@/assets/ornament-divider.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/courses?q=${encodeURIComponent(search)}`);
  };

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-background">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Large subtle circle top-right */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full border border-primary/[0.06]" />
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full border border-primary/[0.04]" />
        {/* Crescent & star */}
        <div className="absolute top-24 left-12 text-primary/10 text-6xl font-arabic select-none hidden lg:block">☪</div>
        {/* Small geometric accents */}
        <div className="absolute bottom-32 left-[8%] w-16 h-16 border border-primary/[0.08] rotate-45 rounded-md hidden md:block" />
        <div className="absolute top-[40%] right-[5%] w-10 h-10 border border-gold/[0.12] rotate-12 rounded-full hidden md:block" />
        {/* Dots pattern */}
        <div className="absolute top-20 right-[30%] grid grid-cols-3 gap-2 opacity-[0.08] hidden md:grid">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary" />
          ))}
        </div>
      </div>

      <div className="container relative z-10 py-12 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left content */}
          <div className="order-2 lg:order-1">
            <p className="animate-fade-up text-xs sm:text-sm font-body font-semibold tracking-[0.2em] uppercase text-primary mb-4">
              {t("hero.subtitle")} — ONLINE ISLAMIYYA
            </p>

            <h1 className="animate-fade-up font-heading font-bold text-foreground leading-[1.05] mb-5">
              {t("hero.title")}
            </h1>

            <p className="animate-fade-up-delay text-base sm:text-lg text-muted-foreground max-w-lg mb-6 font-body leading-relaxed">
              {t("hero.description")}
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="animate-fade-up-delay flex items-center gap-2 max-w-md mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("hero.search_placeholder")}
                  className="w-full h-12 pl-10 pr-4 rounded-full border border-border bg-card text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                />
              </div>
              <Button type="submit" variant="default" size="default" className="h-12 px-6 rounded-full">
                {t("hero.search_btn")}
              </Button>
            </form>

            {/* Tags */}
            <div className="animate-fade-up-delay-2 flex flex-wrap gap-2 mb-8">
              {["Aqeedah", "Fiqh", "Arabic", "Hadith", "Tafseer"].map((tag) => (
                <Link
                  key={tag}
                  to="/courses"
                  className="px-4 py-1.5 rounded-full text-xs font-body font-medium bg-sage-light text-primary border border-primary/10 hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="animate-fade-up-delay-2 flex flex-col sm:flex-row gap-3">
              <Button variant="hero" size="lg" asChild>
                <Link to="/dashboard">{t("hero.cta_primary")}</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/courses">{t("hero.cta_secondary")}</Link>
              </Button>
            </div>
          </div>

          {/* Right — Quran image with decorative frame */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative animate-fade-up">
              {/* Background decorative circle */}
              <div className="absolute inset-0 -m-6 rounded-full bg-gradient-to-br from-primary/[0.08] to-gold/[0.06]" />
              {/* Decorative ring */}
              <div className="absolute -inset-4 rounded-full border-2 border-dashed border-primary/[0.10] animate-[spin_40s_linear_infinite]" />

              <div className="relative bg-card rounded-3xl shadow-card p-6 sm:p-8 border border-border">
                <img
                  src={heroQuran}
                  alt="Holy Quran on stand"
                  className="w-64 h-64 sm:w-80 sm:h-80 object-contain mx-auto"
                  width={900}
                  height={900}
                />
                {/* Ornament below */}
                <div className="flex justify-center mt-4">
                  <img
                    src={ornamentDivider}
                    alt=""
                    aria-hidden="true"
                    className="w-40 opacity-50"
                    width={800}
                    height={512}
                  />
                </div>
                {/* Hadith quote */}
                <p className="text-center text-sm text-primary font-arabic leading-relaxed mt-3 italic max-w-xs mx-auto">
                  {t("hero.hadith")}
                </p>
              </div>

              {/* Floating accent badges */}
              <div className="absolute -top-3 -left-3 bg-primary text-primary-foreground text-xs font-body font-semibold px-3 py-1.5 rounded-full shadow-soft">
                500+ {t("hero.stat_students")}
              </div>
              <div className="absolute -bottom-3 -right-3 bg-gold text-foreground text-xs font-body font-semibold px-3 py-1.5 rounded-full shadow-soft">
                20+ {t("hero.stat_courses")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
