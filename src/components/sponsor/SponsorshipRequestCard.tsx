import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/i18n/LanguageContext";

interface SponsorshipRequestCardProps {
  request: {
    id: string;
    reason?: string | null;
    course: { title: string; price: number; level?: string | null };
    studentFirstName: string;
  };
  onSponsor: (requestId: string, amount: number) => void;
}

const SponsorshipRequestCard = ({ request, onSponsor }: SponsorshipRequestCardProps) => {
  const { t } = useLanguage();

  return (
    <Card className="hover:shadow-card transition-all duration-300">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full gradient-gold flex items-center justify-center shrink-0">
            <GraduationCap className="h-5 w-5 text-accent-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-heading font-bold text-foreground">{request.studentFirstName}</p>
            <p className="text-sm text-muted-foreground font-body">{t("sponsor.needs_help")}</p>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground font-body mb-1">{t("sponsor.course")}</p>
          <p className="font-heading font-medium text-foreground">{request.course.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">{request.course.level}</Badge>
            <span className="text-sm font-bold text-accent">₦{request.course.price.toLocaleString()}</span>
          </div>
        </div>

        {request.reason && (
          <div>
            <p className="text-xs text-muted-foreground font-body mb-1">{t("sponsor.reason")}</p>
            <p className="text-sm font-body text-foreground italic">"{request.reason}"</p>
          </div>
        )}

        <Button variant="hero" className="w-full gap-2" onClick={() => onSponsor(request.id, request.course.price)}>
          <Heart className="h-4 w-4" />
          {t("sponsor.sponsor_btn", { amount: request.course.price.toLocaleString() })}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SponsorshipRequestCard;
