import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SponsorshipRequestCard from "@/components/sponsor/SponsorshipRequestCard";
import DonationForm from "@/components/donate/DonationForm";
import { HandHeart } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const SponsorStudentPage = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<{ id: string; amount: number } | null>(null);

  const { data: requests } = useQuery({
    queryKey: ["pending-sponsorships"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_public_pending_sponsorships");
      if (error) throw error;
      return (data ?? []).map((r: any) => ({
        id: r.id,
        reason: null,
        studentFirstName: r.student_first_name || "Student",
        course: {
          title: r.course_title ?? "Course",
          price: Number(r.course_price ?? 0),
          level: r.course_level ?? "Beginner",
        },
      }));
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
              <HandHeart className="h-4 w-4 text-primary-foreground" />
              <span className="text-sm font-body text-primary-foreground">{t("sponsor.badge")}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-primary-foreground mb-3">{t("sponsor.title")}</h1>
            <p className="text-primary-foreground/70 font-body max-w-xl mx-auto">{t("sponsor.subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="container px-4 sm:px-6 py-8">
        {requests && requests.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {requests.map((req) => (
              <SponsorshipRequestCard
                key={req.id}
                request={req}
                onSponsor={(id, amount) => setSelectedRequest({ id, amount })}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <HandHeart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-body">{t("sponsor.no_requests")}</p>
          </div>
        )}
      </div>

      {/* Sponsorship payment dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">{t("sponsor.sponsor_student")}</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <DonationForm
              sponsorshipRequestId={selectedRequest.id}
              fixedAmount={selectedRequest.amount}
              onSuccess={() => {
                setSelectedRequest(null);
                queryClient.invalidateQueries({ queryKey: ["pending-sponsorships"] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default SponsorStudentPage;
