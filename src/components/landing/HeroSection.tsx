import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroPattern from "@/assets/hero-pattern.jpg";
import logoIcon from "@/assets/logo-icon.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroPattern} alt="" className="w-full h-full object-cover opacity-30" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>

      <div className="container relative z-10 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="animate-fade-up flex justify-center mb-6">
            <img src={logoIcon} alt="Sabilul Jannah" className="h-20 w-20" width={512} height={512} />
          </div>

          <p className="animate-fade-up text-sm font-body font-semibold tracking-widest uppercase text-primary mb-4">
            سبيل الجنة
          </p>

          <h1 className="animate-fade-up text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-foreground leading-tight mb-6">
            Sabilul Jannah
          </h1>

          <p className="animate-fade-up-delay text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 font-body">
            International Online Islamiyya — Your structured journey through authentic Islamic knowledge.
            Learn step-by-step with discipline, sincerity, and guidance.
          </p>

          <p className="animate-fade-up-delay text-sm text-muted-foreground mb-10 font-body italic">
            "Whoever follows a path in pursuit of knowledge, Allah will make easy for him a path to Paradise."
          </p>

          <div className="animate-fade-up-delay-2 flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/dashboard">Begin Your Journey</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/courses">Explore Courses</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
