import { useState, useEffect } from "react";
import { z } from "zod";
import { loadFlutterwave, preloadFlutterwave } from "@/lib/flutterwave";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useLanguage } from "@/i18n/LanguageContext";

const donationSchema = z.object({
  donorName: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  donorEmail: z.string().trim().email("Invalid email address").max(255).optional().or(z.literal("")),
  donorPhone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s\-()]{6,19}$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  amount: z
    .number({ invalid_type_error: "Amount is required" })
    .int("Amount must be a whole number")
    .min(100, "Minimum donation is ₦100")
    .max(10000000, "Amount is too large"),
});

type FieldErrors = Partial<Record<"donorName" | "donorEmail" | "donorPhone" | "amount", string>>;

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
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => { preloadFlutterwave(); }, []);

  const handleDonate = async () => {
    const result = donationSchema.safeParse({ donorName, donorEmail, donorPhone, amount });
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast({ title: t("donate.error"), description: Object.values(fieldErrors)[0], variant: "destructive" });
      return;
    }
    setErrors({});
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
            const verifyWithRetry = async (attempt = 1): Promise<void> => {
              try {
                const { data: verifyData, error: verifyError } = await supabase.functions.invoke("handle-donation", {
                  body: { action: "verify", transaction_id: response.transaction_id, tx_ref: flw_ref },
                });
                if (verifyError) throw new Error(verifyError.message);
                if (verifyData?.success) {
                  toast({ title: t("donate.success"), description: t("donate.success_desc") });
                  onSuccess?.();
                  setLoading(false);
                  return;
                }
                // Verification returned failure
                toast({
                  title: t("donate.failed") || "Payment verification failed",
                  description: `${verifyData?.message || "We couldn't confirm your payment."} Reference: ${flw_ref}. If your account was charged, contact support@sabiluljannah.com with this reference — no duplicate charge will occur.`,
                  variant: "destructive",
                  action: (
                    <ToastAction altText="Retry verification" onClick={() => { setLoading(true); verifyWithRetry(1); }}>
                      Retry
                    </ToastAction>
                  ),
                });
                setLoading(false);
              } catch (err: any) {
                if (attempt < 3) {
                  await new Promise((r) => setTimeout(r, 1500 * attempt));
                  return verifyWithRetry(attempt + 1);
                }
                toast({
                  title: "Verification error",
                  description: `We couldn't reach the server to confirm your payment (${err.message}). Reference: ${flw_ref}. Please check your connection and retry, or contact support@sabiluljannah.com with this reference.`,
                  variant: "destructive",
                  action: (
                    <ToastAction altText="Retry verification" onClick={() => { setLoading(true); verifyWithRetry(1); }}>
                      Retry
                    </ToastAction>
                  ),
                });
                setLoading(false);
              }
            };
            verifyWithRetry();
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
          <Input
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            placeholder={t("donate.name_placeholder")}
            maxLength={100}
            aria-invalid={!!errors.donorName}
          />
          {errors.donorName && <p className="text-sm text-destructive mt-1">{errors.donorName}</p>}
        </div>
        <div>
          <Label className="font-body">{t("donate.email")}</Label>
          <Input
            type="email"
            value={donorEmail}
            onChange={(e) => setDonorEmail(e.target.value)}
            placeholder={t("donate.email_placeholder")}
            maxLength={255}
            aria-invalid={!!errors.donorEmail}
          />
          {errors.donorEmail && <p className="text-sm text-destructive mt-1">{errors.donorEmail}</p>}
        </div>
        <div>
          <Label className="font-body">{t("donate.phone")}</Label>
          <Input
            value={donorPhone}
            onChange={(e) => setDonorPhone(e.target.value)}
            placeholder={t("donate.phone_placeholder")}
            maxLength={20}
            aria-invalid={!!errors.donorPhone}
          />
          {errors.donorPhone && <p className="text-sm text-destructive mt-1">{errors.donorPhone}</p>}
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
              max={10000000}
              aria-invalid={!!errors.amount}
            />
            {errors.amount && <p className="text-sm text-destructive mt-1">{errors.amount}</p>}
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
