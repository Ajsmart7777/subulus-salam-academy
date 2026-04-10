import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DonationForm from "@/components/donate/DonationForm";
import CampaignCard from "@/components/donate/CampaignCard";
import { Heart, HandHeart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const DonatePage = () => {
  const { t } = useLanguage();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | undefined>();

  const { data: campaigns } = useQuery({
    queryKey: ["active-campaigns"],
    queryFn: async () => {
      const { data } = await supabase
        .from("donation_campaigns")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="relative">
        <div className="absolute inset-0 gradient-hero" />
        <div className="relative py-12 sm:py-16">
          <div className="container px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 rounded-full px-4 py-1.5 mb-4">
              <Heart className="h-4 w-4 text-primary-foreground" />
              <span className="text-sm font-body text-primary-foreground">{t("donate.badge")}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-primary-foreground mb-3">{t("donate.title")}</h1>
            <p className="text-primary-foreground/70 font-body max-w-xl mx-auto mb-4">{t("donate.subtitle")}</p>
            <Button variant="gold" size="lg" asChild>
              <Link to="/sponsor-a-student" className="gap-2">
                <HandHeart className="h-5 w-5" />
                {t("donate.sponsor_link")}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Donation Form */}
          <div>
            <DonationForm
              campaignId={selectedCampaignId}
              onSuccess={() => setSelectedCampaignId(undefined)}
            />
          </div>

          {/* Campaigns */}
          <div>
            <h2 className="text-xl font-heading font-bold text-foreground mb-4">{t("donate.campaigns")}</h2>
            {campaigns && campaigns.length > 0 ? (
              <div className="space-y-4">
                {campaigns.map((campaign: any) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    onDonate={(id) => setSelectedCampaignId(id)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground font-body text-sm">{t("donate.no_campaigns")}</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DonatePage;
