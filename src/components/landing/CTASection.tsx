import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

const CTASection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-24">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center gradient-cta rounded-3xl p-12 md:p-16 shadow-elevated relative overflow-hidden">
          {/* Decorative pattern overlay */}
          <div className="absolute inset-0 islamic-pattern-bg opacity-30 pointer-events-none" />

          <div className="relative z-10">
            <h2 className="font-heading font-bold text-primary-foreground mb-4" style={{ fontSize: 'clamp(2rem, 3vw, 3.2rem)' }}>
              {t("cta.title")}
            </h2>
            <p className="text-primary-foreground/80 mb-10 font-body max-w-lg mx-auto text-lg leading-relaxed">
              {t("cta.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gold" size="lg" asChild>
                <Link to="/donate">{t("nav.donate")}</Link>
              </Button>
              <Button variant="outline" size="lg" className="border-primary-foreground/25 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link to="/sponsor-a-student">{t("nav.sponsor")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
