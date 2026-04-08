import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground mb-3">Sabilul Jannah</h3>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              {t("footer.description")}
            </p>
          </div>
          <div>
            <h4 className="font-body font-semibold text-foreground mb-3 text-sm">{t("footer.platform")}</h4>
            <div className="space-y-2">
              <Link to="/courses" className="block text-sm text-muted-foreground hover:text-primary font-body">{t("nav.courses")}</Link>
              <Link to="/dashboard" className="block text-sm text-muted-foreground hover:text-primary font-body">{t("nav.dashboard")}</Link>
            </div>
          </div>
          <div>
            <h4 className="font-body font-semibold text-foreground mb-3 text-sm">{t("footer.support")}</h4>
            <div className="space-y-2">
              <Link to="#" className="block text-sm text-muted-foreground hover:text-primary font-body">{t("footer.contact")}</Link>
              <Link to="#" className="block text-sm text-muted-foreground hover:text-primary font-body">{t("footer.faq")}</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-6 text-center">
          <p className="text-xs text-muted-foreground font-body">{t("footer.rights")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
