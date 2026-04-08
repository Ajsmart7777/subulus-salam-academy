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
    <section className="py-24 section-divider">
      <div className="container">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 bg-accent/14 text-foreground border border-accent/28 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            {t("features.label")}
          </span>
          <h2 className="font-heading font-bold text-foreground mb-4">
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
              className="relative p-7 rounded-xl bg-card border border-border shadow-soft hover:shadow-card hover:-translate-y-1 hover:border-accent/35 transition-all duration-300 group overflow-hidden"
            >
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />

              <div className="h-12 w-12 rounded-xl gradient-hero flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-heading font-semibold text-foreground mb-2">{t(feature.titleKey)}</h3>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">{t(feature.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
