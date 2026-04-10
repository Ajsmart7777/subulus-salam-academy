import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Target, Gift, Copy, Award, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";

const StatCard = ({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string | number; sub?: string }) => (
  <div className="bg-card rounded-xl p-4 sm:p-5 shadow-soft border border-border">
    <div className="flex items-center gap-3 mb-2">
      <div className="h-10 w-10 rounded-xl gradient-hero flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-primary-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-body truncate">{label}</p>
        <p className="text-lg sm:text-xl font-heading font-bold text-foreground">{value}</p>
      </div>
    </div>
    {sub && <p className="text-xs text-muted-foreground font-body">{sub}</p>}
  </div>
);

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const displayName = profile?.full_name || "Student";

  const { data: enrolledCourses } = useQuery({
    queryKey: ["my-enrollments", user?.id],
    queryFn: async () => {
      const { data: enrollments } = await supabase.from("enrollments").select("course_id, enrolled_at").eq("user_id", user!.id);
      if (!enrollments?.length) return [];
      const courseIds = enrollments.map((e) => e.course_id);
      const { data: courses } = await supabase.from("courses").select("*").in("id", courseIds);
      const { data: modules } = await supabase.from("modules").select("id, course_id").in("course_id", courseIds);
      const moduleIds = (modules ?? []).map((m) => m.id);
      const { data: lessons } = moduleIds.length ? await supabase.from("lessons").select("id, module_id").in("module_id", moduleIds) : { data: [] };
      const lessonIds = (lessons ?? []).map((l) => l.id);
      const { data: progressData } = lessonIds.length ? await supabase.from("lesson_progress").select("lesson_id, completed").eq("user_id", user!.id).in("lesson_id", lessonIds) : { data: [] };
      const completedSet = new Set((progressData ?? []).filter((p) => p.completed).map((p) => p.lesson_id));
      return (courses ?? []).map((c) => {
        const courseModules = (modules ?? []).filter((m) => m.course_id === c.id);
        const courseLessons = (lessons ?? []).filter((l) => courseModules.some((m) => m.id === l.module_id));
        const completed = courseLessons.filter((l) => completedSet.has(l.id)).length;
        return { ...c, totalLessons: courseLessons.length, completedLessons: completed, totalModules: courseModules.length };
      });
    },
    enabled: !!user,
  });

  const { data: referralData } = useQuery({
    queryKey: ["my-referral", user?.id],
    queryFn: async () => {
      const [codeRes, rewardsRes] = await Promise.all([
        supabase.from("referral_codes").select("code").eq("user_id", user!.id).maybeSingle(),
        supabase.from("referral_rewards").select("credits").eq("referrer_id", user!.id),
      ]);
      return { code: codeRes.data?.code ?? null, totalCredits: (rewardsRes.data ?? []).reduce((sum, r) => sum + r.credits, 0), totalReferrals: rewardsRes.data?.length ?? 0 };
    },
    enabled: !!user,
  });

  const { data: certificates } = useQuery({
    queryKey: ["my-certificates", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("certificates").select("*, courses:course_id(title)").eq("user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: sponsorshipRequests } = useQuery({
    queryKey: ["my-sponsorship-requests", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("student_sponsorship_requests")
        .select("*, courses:course_id(title, price)")
        .eq("student_user_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const totalLessonsCompleted = enrolledCourses?.reduce((sum, c) => sum + c.completedLessons, 0) ?? 0;
  const totalLessons = enrolledCourses?.reduce((sum, c) => sum + c.totalLessons, 0) ?? 0;

  const copyReferralLink = () => {
    if (referralData?.code) {
      navigator.clipboard.writeText(`${window.location.origin}/register?ref=${referralData.code}`);
      toast({ title: t("dashboard.copied"), description: t("dashboard.referral_link") });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-1">{t("dashboard.greeting")}, {displayName}</h1>
          <p className="text-muted-foreground font-body text-sm sm:text-base">{t("dashboard.subtitle")}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
          <StatCard icon={BookOpen} label={t("dashboard.enrolled")} value={enrolledCourses?.length ?? 0} />
          <StatCard icon={Target} label={t("dashboard.lessons_done")} value={`${totalLessonsCompleted}/${totalLessons}`} />
          <StatCard icon={Gift} label={t("dashboard.referral_credits")} value={referralData?.totalCredits ?? 0} sub={`${referralData?.totalReferrals ?? 0} ${t("dashboard.referrals")}`} />
          <StatCard icon={Award} label={t("dashboard.certificates")} value={certificates?.length ?? 0} />
        </div>

        {referralData?.code && (
          <Card className="mb-6 sm:mb-8">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="font-heading flex items-center gap-2 text-base sm:text-lg">
                <Gift className="h-5 w-5 text-accent" /> {t("dashboard.your_referral")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground font-body mb-1.5">{t("dashboard.referral_code")}</p>
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-3 sm:px-4 py-2 rounded-lg text-base sm:text-lg font-mono font-bold text-foreground flex-1 truncate">{referralData.code}</code>
                  <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(referralData.code!); toast({ title: t("dashboard.copied") }); }}>
                    <Copy className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">{t("dashboard.copy_code")}</span>
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-body mb-1.5">{t("dashboard.referral_link")}</p>
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-3 py-2 rounded-lg text-xs sm:text-sm font-mono text-foreground flex-1 truncate">{`${window.location.origin}/register?ref=${referralData.code}`}</code>
                  <Button variant="outline" size="sm" onClick={copyReferralLink}>
                    <Copy className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">{t("dashboard.copy_link")}</span>
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-body">
                {t("dashboard.referral_info", { credits: "100" })}
              </p>
            </CardContent>
          </Card>
        )}

        {certificates && certificates.length > 0 && (
          <Card className="mb-6 sm:mb-8">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="font-heading flex items-center gap-2 text-base sm:text-lg">
                <Award className="h-5 w-5 text-accent" /> {t("dashboard.your_certs")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {certificates.map((cert: any) => (
                <Link key={cert.id} to={`/certificate/${cert.id}`} className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors group gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full gradient-gold flex items-center justify-center shrink-0">
                      <Award className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-heading font-medium text-foreground group-hover:text-primary transition-colors truncate text-sm sm:text-base">{cert.courses?.title ?? "Course"}</p>
                      <p className="text-xs text-muted-foreground font-body">#{cert.certificate_number} · {new Date(cert.issued_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1 text-xs shrink-0">{t("dashboard.view")} <Award className="h-3 w-3" /></Button>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

        {sponsorshipRequests && sponsorshipRequests.length > 0 && (
          <Card className="mb-6 sm:mb-8">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="font-heading flex items-center gap-2 text-base sm:text-lg">
                <Heart className="h-5 w-5 text-accent" /> {t("dashboard.your_sponsorship")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sponsorshipRequests.map((req: any) => {
                const statusColor = req.status === "sponsored" ? "bg-green-100 text-green-800" : req.status === "rejected" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800";
                return (
                  <div key={req.id} className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-xl gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-full gradient-hero flex items-center justify-center shrink-0">
                        <Heart className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-heading font-medium text-foreground truncate text-sm sm:text-base">{req.courses?.title ?? "Course"}</p>
                        <p className="text-xs text-muted-foreground font-body">{new Date(req.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Badge className={`text-xs shrink-0 ${statusColor}`}>
                      {t(`dashboard.sponsorship_${req.status}`)}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-foreground mb-4">{t("dashboard.your_courses")}</h2>
          {!enrolledCourses?.length ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground font-body mb-4">{t("dashboard.no_courses")}</p>
                <Button variant="hero" asChild><Link to="/courses">{t("dashboard.browse")}</Link></Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              {enrolledCourses.map((course) => {
                const courseProgress = course.totalLessons > 0 ? Math.round((course.completedLessons / course.totalLessons) * 100) : 0;
                return (
                  <Link to={`/course/${course.id}`} key={course.id} className="bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 group border border-border">
                    {/* Course banner */}
                    <div className="h-28 sm:h-32 overflow-hidden">
                      {course.image_url ? (
                        <img src={course.image_url} alt={course.title} className="w-full h-full object-cover rounded-none group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full gradient-hero flex items-center justify-center">
                          <p className="text-lg font-heading text-primary-foreground/80">{course.title_ar || ""}</p>
                        </div>
                      )}
                    </div>
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <div className="min-w-0">
                          <Badge className="mb-1.5 bg-sage-light text-sage-dark font-body text-xs">{course.category}</Badge>
                          <h3 className="text-base sm:text-lg font-heading font-bold text-foreground group-hover:text-primary transition-colors truncate">{course.title}</h3>
                        </div>
                        <Badge variant="outline" className="text-xs font-body shrink-0">{course.level}</Badge>
                      </div>
                      <div className="space-y-2 mt-3">
                        <div className="flex justify-between text-xs font-body text-muted-foreground">
                          <span>{course.completedLessons} {t("dashboard.of_lessons", { total: String(course.totalLessons) })}</span>
                          <span>{courseProgress}%</span>
                        </div>
                        <Progress value={courseProgress} className="h-2" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
