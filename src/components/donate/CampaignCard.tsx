import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Target } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface CampaignCardProps {
  campaign: {
    id: string;
    title: string;
    description?: string | null;
    goal_amount: number;
    raised_amount: number;
    currency: string;
    image_url?: string | null;
  };
  onDonate: (campaignId: string) => void;
}

const CampaignCard = ({ campaign, onDonate }: CampaignCardProps) => {
  const { t } = useLanguage();
  const progress = campaign.goal_amount > 0 ? Math.min(100, Math.round((campaign.raised_amount / campaign.goal_amount) * 100)) : 0;

  return (
    <Card className="overflow-hidden hover:shadow-card transition-all duration-300">
      {campaign.image_url && (
        <div className="h-40 overflow-hidden">
          <img src={campaign.image_url} alt={campaign.title} className="w-full h-full object-cover" />
        </div>
      )}
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl gradient-hero flex items-center justify-center shrink-0">
            <Target className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h3 className="font-heading font-bold text-foreground truncate">{campaign.title}</h3>
            {campaign.description && <p className="text-sm text-muted-foreground font-body line-clamp-2">{campaign.description}</p>}
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs font-body text-muted-foreground mb-1">
            <span>₦{campaign.raised_amount.toLocaleString()} {t("donate.raised")}</span>
            <span>{t("donate.goal")}: ₦{campaign.goal_amount.toLocaleString()}</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground font-body mt-1">{progress}% {t("donate.reached")}</p>
        </div>
        <Button variant="hero" size="sm" className="w-full" onClick={() => onDonate(campaign.id)}>
          {t("donate.donate_to_campaign")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CampaignCard;
