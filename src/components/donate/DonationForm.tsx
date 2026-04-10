import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";

interface DonationFormProps {
  campaignId?: string;
  sponsorshipRequestId?: string;
  fixedAmount?: number;
  onSuccess?: () => void;
}

const quickAmounts = [1000, 5000, 10000, 25000];

const DonationForm = ({ campaignId, sponsorshipRequestId, fixedAmount, onSuccess }: DonationFormProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [amount, setAmount] = useState(fixedAmount ?? 0);
  const [loading, setLoading] = useState(false);

  const handleDonate = async () => {
    if (!donorName.trim()) {
      toast({ title: t("donate.name_required"), variant: "destructive" });
      return;
    }
    if (amount <= 0) {
      toast({ title: t("donate.amount_required"), variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("handle-donation", {
        body: {
          action: "initialize",
          donor_name: donorName.trim(),
          donor_email: donorEmail.trim() || null,
          donor_phone: donorPhone.trim() || null,
          user_id: user?.id || null,
          amount,
          currency: "NGN",
          campaign_id: campaignId || null,
          sponsorship_request_id: sponsorshipRequestId || null,
        },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      const { flw_public_key, flw_ref } = data;
      const script = document.createElement("script");
      script.src = "https://checkout.flutterwave.com/v3.js";
      script.onload = () => {
        (window as any).FlutterwaveCheckout({
          public_key: flw_public_key,
          tx_ref: flw_ref,
          amount,
          currency: "NGN",
          payment_options: "card,banktransfer,ussd",
          customer: { email: donorEmail || "donor@sabiluljannah.com", name: donorName, phone_number: donorPhone },
          customizations: {
            title: "Sabilul Jannah International Online Islamiyya",
            description: sponsorshipRequestId ? "Student Sponsorship" : campaignId ? "Campaign Donation" : "General Donation",
            logo: "",
          },
          callback: async (response: any) => {
            try {
              const { data: verifyData } = await supabase.functions.invoke("handle-donation", {
                body: { action: "verify", transaction_id: response.transaction_id, tx_ref: flw_ref },
              });
              if (verifyData?.success) {
                toast({ title: t("donate.success"), description: t("donate.success_desc") });
                onSuccess?.();
              } else {
                toast({ title: t("donate.failed"), description: verifyData?.message, variant: "destructive" });
              }
            } catch (err: any) {
              toast({ title: "Error", description: err.message, variant: "destructive" });
            }
            setLoading(false);
          },
          onclose: () => setLoading(false),
        });
      };
      document.head.appendChild(script);
    } catch (err: any) {
      toast({ title: t("donate.error"), description: err.message, variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-2">
          <Heart className="h-5 w-5 text-accent" />
          {t("donate.your_info")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="font-body">{t("donate.name")} *</Label>
          <Input value={donorName} onChange={(e) => setDonorName(e.target.value)} placeholder={t("donate.name_placeholder")} />
        </div>
        <div>
          <Label className="font-body">{t("donate.email")}</Label>
          <Input type="email" value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} placeholder={t("donate.email_placeholder")} />
        </div>
        <div>
          <Label className="font-body">{t("donate.phone")}</Label>
          <Input value={donorPhone} onChange={(e) => setDonorPhone(e.target.value)} placeholder={t("donate.phone_placeholder")} />
        </div>

        {!fixedAmount && (
          <div>
            <Label className="font-body">{t("donate.amount")}</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {quickAmounts.map((a) => (
                <Button
                  key={a}
                  type="button"
                  variant={amount === a ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAmount(a)}
                >
                  ₦{a.toLocaleString()}
                </Button>
              ))}
            </div>
            <Input
              type="number"
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder={t("donate.custom_amount")}
              min={100}
            />
          </div>
        )}

        {fixedAmount && (
          <div className="bg-muted rounded-lg p-3 text-center">
            <p className="text-sm text-muted-foreground font-body">{t("donate.amount")}</p>
            <p className="text-2xl font-heading font-bold text-foreground">₦{fixedAmount.toLocaleString()}</p>
          </div>
        )}

        <Button variant="hero" className="w-full gap-2" disabled={loading} onClick={handleDonate}>
          <Heart className="h-4 w-4" />
          {loading ? t("donate.processing") : t("donate.donate_now")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DonationForm;
