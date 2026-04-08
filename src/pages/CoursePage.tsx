import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Lock, CheckCircle2, Circle, PlayCircle, FileText, Headphones,
  ClipboardList, HelpCircle, ChevronRight, Award, CreditCard,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";

const lessonIcon = (type: string) => {
  switch (type) {
    case "video": return PlayCircle;
    case "audio": return Headphones;
    default: return FileText;
  }
};

const CoursePage = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [paymentLoading, setPaymentLoading] = useState(false);
  const { t } = useLanguage();

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("*").eq("id", courseId!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });

  const { data: enrollment } = useQuery({
    queryKey: ["enrollment", courseId, user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("enrollments").select("*").eq("course_id", courseId!).eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!courseId && !!user,
  });

  const { data: modules } = useQuery({
    queryKey: ["course-modules", courseId],
    queryFn: async () => {
      const { data: mods, error } = await supabase.from("modules").select("*").eq("course_id", courseId!).order("sort_order");
      if (error) throw error;
      const moduleIds = mods.map((m) => m.id);
      const [lessonsRes, assignmentsRes] = await Promise.all([
        supabase.from("lessons").select("*").in("module_id", moduleIds).order("sort_order"),
        supabase.from("assignments").select("*").in("module_id", moduleIds),
      ]);
      return mods.map((m) => ({
        ...m,
        lessons: (lessonsRes.data ?? []).filter((l: any) => l.module_id === m.id),
        assignments: (assignmentsRes.data ?? []).filter((a: any) => a.module_id === m.id),
      }));
    },
    enabled: !!courseId,
  });

  const { data: progress } = useQuery({
    queryKey: ["lesson-progress", courseId, user?.id],
    queryFn: async () => {
      if (!modules) return {};
      const lessonIds = modules.flatMap((m) => (m.lessons ?? []).map((l) => l.id));
      if (!lessonIds.length) return {};
      const { data } = await supabase.from("lesson_progress").select("*").eq("user_id", user!.id).in("lesson_id", lessonIds);
      const map: Record<string, boolean> = {};
      (data ?? []).forEach((p) => { if (p.completed) map[p.lesson_id] = true; });
      return map;
    },
    enabled: !!modules && !!user,
  });

  const { data: submissions } = useQuery({
    queryKey: ["assignment-submissions", courseId, user?.id],
    queryFn: async () => {
      if (!modules) return {};
      const assignmentIds = modules.flatMap((m) => (m.assignments ?? []).map((a) => a.id));
      if (!assignmentIds.length) return {};
      const { data } = await supabase.from("assignment_submissions").select("*").eq("user_id", user!.id).in("assignment_id", assignmentIds);
      const map: Record<string, boolean> = {};
      (data ?? []).forEach((s) => { map[s.assignment_id] = true; });
      return map;
    },
    enabled: !!modules && !!user,
  });

  const { data: certificate } = useQuery({
    queryKey: ["certificate", courseId, user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("certificates").select("*").eq("course_id", courseId!).eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!courseId && !!user,
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("enrollments").insert({ user_id: user!.id, course_id: courseId! });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollment", courseId] });
      toast({ title: t("course.enrolled"), description: t("course.enrolled_desc") });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const issueCertificate = useMutation({
    mutationFn: async () => {
      const certNumber = `SJ-CERT-${Date.now().toString(36).toUpperCase()}`;
      const { error } = await supabase.from("certificates").insert({ user_id: user!.id, course_id: courseId!, certificate_number: certNumber });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificate", courseId] });
      toast({ title: t("course.cert_issued"), description: t("course.cert_issued_desc") });
    },
  });

  const handlePayment = async () => {
    if (!user || !courseId) return;
    setPaymentLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("handle-payment", {
        body: { action: "initialize", course_id: courseId, user_id: user.id, amount: coursePrice, currency: "NGN" },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      const { flw_public_key, flw_ref } = data;
      const script = document.createElement("script");
      script.src = "https://checkout.flutterwave.com/v3.js";
      script.onload = () => {
        (window as any).FlutterwaveCheckout({
          public_key: flw_public_key, tx_ref: flw_ref, amount: coursePrice, currency: "NGN",
          payment_options: "card,banktransfer,ussd",
          customer: { email: user.email ?? "" },
          customizations: { title: "Sabilul Jannah International Online Islamiyya", description: `Enrollment: ${course?.title}`, logo: "" },
          callback: async (response: any) => {
            try {
              const { data: verifyData } = await supabase.functions.invoke("handle-payment", {
                body: { action: "verify", transaction_id: response.transaction_id, tx_ref: flw_ref, user_id: user.id, course_id: courseId },
              });
              if (verifyData?.success) {
                queryClient.invalidateQueries({ queryKey: ["enrollment", courseId] });
                toast({ title: t("course.enrolled"), description: t("course.enrolled_desc") });
              } else {
                toast({ title: "Verification failed", description: verifyData?.message, variant: "destructive" });
              }
            } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
            setPaymentLoading(false);
          },
          onclose: () => setPaymentLoading(false),
        });
      };
      document.head.appendChild(script);
    } catch (err: any) {
      toast({ title: t("course.payment_error"), description: err.message, variant: "destructive" });
      setPaymentLoading(false);
    }
  };

  const isModuleUnlocked = (moduleIndex: number): boolean => {
    if (moduleIndex === 0) return true;
    if (!modules || !progress || !submissions) return false;
    const prevModule = modules[moduleIndex - 1];
    const prevLessons = prevModule.lessons ?? [];
    const prevAssignments = prevModule.assignments ?? [];
    return prevLessons.every((l) => progress[l.id]) && (prevAssignments.length === 0 || prevAssignments.every((a) => submissions[a.id]));
  };

  const isModuleComplete = (mod: any): boolean => {
    if (!progress || !submissions) return false;
    const lessons = mod.lessons ?? [];
    const assignments = mod.assignments ?? [];
    return lessons.every((l: any) => progress[l.id]) && (assignments.length === 0 || assignments.every((a: any) => submissions[a.id]));
  };

  const isCourseComplete = modules?.every((_, i) => isModuleComplete(modules[i])) && (modules?.length ?? 0) > 0;

  if (courseLoading) {
    return (<div className="min-h-screen bg-background"><Navbar /><div className="flex justify-center py-20"><div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div></div>);
  }

  if (!course) {
    return (<div className="min-h-screen bg-background"><Navbar /><div className="container py-20 text-center"><h1 className="text-2xl font-heading font-bold text-foreground">{t("course.not_found")}</h1><Button variant="hero" className="mt-4" asChild><Link to="/courses">{t("course.browse")}</Link></Button></div></div>);
  }

  const totalModules = modules?.length ?? 0;
  const completedModules = modules?.filter((_, i) => isModuleComplete(modules[i])).length ?? 0;
  const overallProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
  const coursePrice = Number((course as any).price ?? 0);
  const isFree = coursePrice === 0;
  const isEnrolled = !!enrollment;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Course Hero with banner */}
      <div className="relative">
        {course.image_url ? (
          <div className="absolute inset-0 h-full">
            <img src={course.image_url} alt="" className="w-full h-full object-cover rounded-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(160_75%_15%)] via-[hsl(160_72%_21%/0.85)] to-[hsl(160_72%_21%/0.7)]" />
          </div>
        ) : (
          <div className="absolute inset-0 gradient-hero" />
        )}

        <div className="relative py-10 sm:py-12">
          <div className="container px-4 sm:px-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge className="bg-primary-foreground/20 text-primary-foreground font-body text-xs">{course.category}</Badge>
              <Badge className="bg-primary-foreground/20 text-primary-foreground font-body text-xs">{course.level}</Badge>
              {!isFree && <Badge className="bg-accent text-accent-foreground font-body text-xs">₦{coursePrice.toLocaleString()}</Badge>}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-primary-foreground mb-1">{course.title}</h1>
            {course.title_ar && <p className="text-base sm:text-lg font-arabic text-primary-foreground/80 mb-3">{course.title_ar}</p>}
            <p className="text-sm text-primary-foreground/70 font-body mb-6 max-w-2xl">{course.description}</p>

            {isEnrolled && (
              <div className="max-w-sm">
                <div className="flex justify-between text-xs text-primary-foreground/60 font-body mb-1">
                  <span>{t("course.progress")}</span><span>{overallProgress}%</span>
                </div>
                <Progress value={overallProgress} className="h-2 bg-primary-foreground/20" />
              </div>
            )}

            {!isEnrolled && user && (
              <div className="mt-4">
                {isFree ? (
                  <Button variant="gold" size="lg" onClick={() => enrollMutation.mutate()} disabled={enrollMutation.isPending}>
                    {enrollMutation.isPending ? t("course.enrolling") : t("course.enroll_free")}
                  </Button>
                ) : (
                  <Button variant="gold" size="lg" className="gap-2" disabled={paymentLoading} onClick={handlePayment}>
                    <CreditCard className="h-4 w-4" />
                    {paymentLoading ? t("course.processing") : t("course.pay_enroll", { price: coursePrice.toLocaleString() })}
                  </Button>
                )}
              </div>
            )}

            {!user && <Button variant="gold" size="lg" className="mt-4" asChild><Link to="/register">{t("course.signup_enroll")}</Link></Button>}
          </div>
        </div>
      </div>

      {certificate && (
        <div className="bg-accent/10 border-b border-accent/20 py-4">
          <div className="container px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Award className="h-6 w-6 text-accent shrink-0" />
            <div className="flex-1">
              <p className="font-heading font-bold text-foreground">{t("course.completed_banner")}</p>
              <p className="text-sm text-muted-foreground font-body">
                {t("course.cert_number", { number: certificate.certificate_number, date: new Date(certificate.issued_at).toLocaleDateString() })}
              </p>
            </div>
            <Button variant="gold" size="sm" asChild>
              <Link to={`/certificate/${certificate.id}`}><Award className="h-4 w-4 mr-1" /> {t("course.view_cert")}</Link>
            </Button>
          </div>
        </div>
      )}

      {isCourseComplete && !certificate && isEnrolled && (
        <div className="bg-accent/10 border-b border-accent/20 py-4">
          <div className="container px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Award className="h-6 w-6 text-accent shrink-0" />
            <div className="flex-1">
              <p className="font-heading font-bold text-foreground">{t("course.all_complete")}</p>
              <p className="text-sm text-muted-foreground font-body">{t("course.claim_cert")}</p>
            </div>
            <Button variant="hero" size="sm" onClick={() => issueCertificate.mutate()} disabled={issueCertificate.isPending}>
              <Award className="h-4 w-4 mr-1" /> {t("course.get_cert")}
            </Button>
          </div>
        </div>
      )}

      <div className="container px-4 sm:px-6 py-8">
        <h2 className="text-xl sm:text-2xl font-heading font-bold text-foreground mb-6">{t("course.weekly_modules")}</h2>
        <div className="space-y-4">
          {modules?.map((mod, index) => {
            const unlocked = isEnrolled && isModuleUnlocked(index);
            const completed = isModuleComplete(mod);
            return (
              <div key={mod.id} className={`rounded-xl border ${!unlocked ? "border-border bg-muted/50 opacity-70" : "border-border bg-card shadow-soft"}`}>
                <div className="p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      {!unlocked ? <Lock className="h-5 w-5 text-muted-foreground shrink-0" /> : completed ? <CheckCircle2 className="h-5 w-5 text-primary shrink-0" /> : <Circle className="h-5 w-5 text-accent shrink-0" />}
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground font-body">{t("course.week")} {mod.week}</p>
                        <h3 className="font-heading font-bold text-foreground truncate">{mod.title}</h3>
                      </div>
                    </div>
                    {!unlocked && <Badge variant="outline" className="text-xs font-body text-muted-foreground shrink-0"><Lock className="h-3 w-3 mr-1" /> {t("course.locked")}</Badge>}
                    {completed && <Badge className="bg-primary/10 text-primary text-xs font-body shrink-0"><CheckCircle2 className="h-3 w-3 mr-1" /> {t("course.complete")}</Badge>}
                  </div>

                  {!unlocked ? (
                    <p className="text-sm text-muted-foreground font-body italic">{t("course.unlock_hint")}</p>
                  ) : (
                    <>
                      <div className="space-y-2 mb-4">
                        {(mod.lessons ?? []).map((lesson) => {
                          const LIcon = lessonIcon(lesson.type);
                          const lessonDone = progress?.[lesson.id] ?? false;
                          return (
                            <Link to={`/course/${courseId}/lesson/${lesson.id}`} key={lesson.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                              <LIcon className={`h-4 w-4 shrink-0 ${lessonDone ? "text-primary" : "text-muted-foreground"}`} />
                              <span className={`flex-1 text-sm font-body min-w-0 truncate ${lessonDone ? "text-foreground" : "text-muted-foreground"}`}>{lesson.title}</span>
                              <span className="text-xs text-muted-foreground font-body hidden sm:block">{lesson.duration}</span>
                              {lessonDone ? <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground shrink-0" />}
                            </Link>
                          );
                        })}
                      </div>
                      <div className="flex flex-wrap gap-3 pt-3 border-t border-border">
                        {mod.has_quiz && (
                          <div className="flex items-center gap-1.5 text-xs font-body">
                            <HelpCircle className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">{t("course.quiz")}</span>
                          </div>
                        )}
                        {(mod.assignments ?? []).length > 0 && (
                          <div className="flex items-center gap-1.5 text-xs font-body">
                            <ClipboardList className={`h-4 w-4 ${(mod.assignments ?? []).every((a) => submissions?.[a.id]) ? "text-primary" : "text-muted-foreground"}`} />
                            <span className={(mod.assignments ?? []).every((a) => submissions?.[a.id]) ? "text-primary" : "text-muted-foreground"}>
                              {t("course.assignment")} {(mod.assignments ?? []).every((a) => submissions?.[a.id]) ? "✓" : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CoursePage;
