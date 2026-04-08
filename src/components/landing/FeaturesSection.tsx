import { BookOpen, Lock, Brain, Trophy, Users, Download } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const FeaturesSection = () => {
  const { t } = useLanguage();

  const features = [
    { icon: BookOpen, titleKey: "feature.curriculum.title", descKey: "feature.curriculum.desc" },
    { icon: Lock, titleKey: "feature.progression.title", descKey: "feature.progression.desc" },
    { icon: Brain, titleKey: "feature.ai.title", descKey: "feature.ai.desc" },
    { icon: Trophy, titleKey: "feature.gamification.title", descKey: "feature.gamification.desc" },
    { icon: Users, titleKey: "feature.community.title", descKey: "feature.community.desc" },
    { icon: Download, titleKey: "feature.offline.title", descKey: "feature.offline.desc" },
  ];

  return (
    <section className="py-24 bg-card">
      <div className="container">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold tracking-widest uppercase text-primary mb-3 font-body">
            {t("features.label")}
          </p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            {t("features.title")}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto font-body">
            {t("features.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.titleKey}
              className="p-6 rounded-lg bg-background shadow-card hover:shadow-elevated transition-shadow duration-300 group"
            >
              <div className="h-12 w-12 rounded-lg gradient-hero flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-heading font-bold text-foreground mb-2">{t(feature.titleKey)}</h3>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">{t(feature.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
