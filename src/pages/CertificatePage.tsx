import { useRef } from "react";
import { useParams, Link } from "react-router-dom";
import html2canvas from "html2canvas";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Download, Share2, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import CertificateTemplate from "@/components/certificate/CertificateTemplate";
import { useLanguage } from "@/i18n/LanguageContext";

const CertificatePage = () => {
  const { certificateId } = useParams();
  const { user, profile } = useAuth();
  const certRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const { data: certificate, isLoading } = useQuery({
    queryKey: ["certificate-detail", certificateId],
    queryFn: async () => {
      const { data, error } = await supabase.from("certificates").select("*").eq("id", certificateId!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!certificateId,
  });

  const { data: course } = useQuery({
    queryKey: ["certificate-course", certificate?.course_id],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("title, title_ar").eq("id", certificate!.course_id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!certificate?.course_id,
  });

  const handleDownload = async () => {
    if (!certRef.current) return;
    try {
      const canvas = await html2canvas(certRef.current, { scale: 2, backgroundColor: null, useCORS: true });
      const link = document.createElement("a");
      link.download = `certificate-${certificate?.certificate_number}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast({ title: t("dashboard.copied"), description: "Certificate saved as PNG." });
    } catch {
      toast({ title: "Error", description: "Failed to download certificate.", variant: "destructive" });
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Certificate - ${course?.title}`, text: `I completed "${course?.title}" at Sabilul Jannah Academy!`, url: shareUrl });
      } catch {}
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: t("dashboard.copied"), description: "Certificate link copied to clipboard." });
    }
  };

  if (isLoading) {
    return (<div className="min-h-screen bg-background"><Navbar /><div className="flex justify-center py-20"><div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div></div>);
  }

  if (!certificate) {
    return (<div className="min-h-screen bg-background"><Navbar /><div className="container py-20 text-center"><h1 className="text-2xl font-heading font-bold text-foreground">{t("cert.not_found")}</h1><Button variant="hero" className="mt-4" asChild><Link to="/dashboard">{t("cert.back_dashboard")}</Link></Button></div></div>);
  }

  const studentName = profile?.full_name || user?.email || "Student";
  const issuedDate = new Date(certificate.issued_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <Link to={`/course/${certificate.course_id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 font-body">
          <ArrowLeft className="h-4 w-4" /> {t("cert.back_course")}
        </Link>
        <div className="text-center mb-6">
          <h1 className="text-3xl font-heading font-bold text-foreground">{t("cert.title")}</h1>
          <p className="text-muted-foreground font-body mt-1">{t("cert.congratulations")}</p>
        </div>
        <div className="flex justify-center gap-3 mb-8">
          <Button variant="hero" onClick={handleDownload} className="gap-2"><Download className="h-4 w-4" /> {t("cert.download")}</Button>
          <Button variant="gold" onClick={handleShare} className="gap-2"><Share2 className="h-4 w-4" /> {t("cert.share")}</Button>
        </div>
        <div className="flex justify-center overflow-x-auto pb-8">
          <div className="shadow-elevated rounded-lg overflow-hidden">
            <CertificateTemplate ref={certRef} studentName={studentName} courseName={course?.title ?? ""} courseNameAr={course?.title_ar ?? undefined} certificateNumber={certificate.certificate_number} issuedDate={issuedDate} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CertificatePage;
