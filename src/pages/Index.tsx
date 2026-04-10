import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import WaysToGiveSection from "@/components/landing/WaysToGiveSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/layout/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <WaysToGiveSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
