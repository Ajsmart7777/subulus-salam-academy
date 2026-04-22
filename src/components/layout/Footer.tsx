import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import logoIcon from "@/assets/logo-icon.png";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="gradient-hero text-primary-foreground mt-16 rounded-t-3xl">
      <div className="container py-16">
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logoIcon} alt="Sabilul Jannah" className="h-10 w-10 rounded-lg brightness-150" width={512} height={512} />
              <h3 className="font-heading text-xl font-bold text-primary-foreground">Sabilul Jannah</h3>
            </div>
            <p className="text-sm text-primary-foreground/75 font-body leading-relaxed">
              {t("footer.description")}
            </p>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-primary-foreground mb-4 text-lg">{t("footer.platform")}</h4>
            <div className="space-y-3">
              <Link to="/courses" className="block text-sm text-primary-foreground/75 hover:text-accent-soft font-body transition-colors">{t("nav.courses")}</Link>
              <Link to="/dashboard" className="block text-sm text-primary-foreground/75 hover:text-accent-soft font-body transition-colors">{t("nav.dashboard")}</Link>
            </div>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-primary-foreground mb-4 text-lg">{t("footer.support")}</h4>
            <div className="space-y-3">
              <Link to="/donate" className="block text-sm text-primary-foreground/75 hover:text-accent-soft font-body transition-colors">{t("nav.donate")}</Link>
              <Link to="/sponsor-a-student" className="block text-sm text-primary-foreground/75 hover:text-accent-soft font-body transition-colors">{t("nav.sponsor")}</Link>
              <Link to="#" className="block text-sm text-primary-foreground/75 hover:text-accent-soft font-body transition-colors">{t("footer.contact")}</Link>
              <Link to="#" className="block text-sm text-primary-foreground/75 hover:text-accent-soft font-body transition-colors">{t("footer.faq")}</Link>
              <Link to="/privacy-policy.html" className="block text-sm text-primary-foreground/75 hover:text-accent-soft font-body transition-colors">
  Privacy Policy
</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/15 mt-10 pt-6 text-center">
          <p className="text-xs text-primary-foreground/60 font-body">{t("footer.rights")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
