import { BookOpen, Lock, Brain, Trophy, Users, Download } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Structured Curriculum",
    description: "Weekly modules with lessons, assignments, and quizzes designed by qualified scholars.",
  },
  {
    icon: Lock,
    title: "Controlled Progression",
    description: "Complete each module before unlocking the next. No shortcuts — discipline is key.",
  },
  {
    icon: Brain,
    title: "AI Learning Assistant",
    description: "Get instant help understanding concepts with our Islamic-knowledge-aware AI tutor.",
  },
  {
    icon: Trophy,
    title: "Gamification & Streaks",
    description: "Earn titles like Talibul Ilm, maintain learning streaks, and track your growth.",
  },
  {
    icon: Users,
    title: "Community Learning",
    description: "Engage in moderated discussions, share insights, and learn alongside fellow students.",
  },
  {
    icon: Download,
    title: "Offline Access",
    description: "Download lessons and materials to continue learning anytime, anywhere.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-card">
      <div className="container">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold tracking-widest uppercase text-primary mb-3 font-body">
            Why Sabilul Jannah
          </p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            A Real Islamiyya Experience, Online
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto font-body">
            Built on the principles of traditional Islamic schooling with modern tools for today's learners.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-lg bg-background shadow-card hover:shadow-elevated transition-shadow duration-300 group"
            >
              <div className="h-12 w-12 rounded-lg gradient-hero flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-heading font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
