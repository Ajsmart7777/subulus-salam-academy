import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, BookOpen, Trophy, Target, Clock, Star, Gift, Copy, Award } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const StatCard = ({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string | number; sub?: string }) => (
  <div className="bg-card rounded-lg p-5 shadow-card">
    <div className="flex items-center gap-3 mb-2">
      <div className="h-10 w-10 rounded-lg gradient-hero flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-body">{label}</p>
        <p className="text-xl font-heading font-bold text-foreground">{value}</p>
      </div>
    </div>
    {sub && <p className="text-xs text-muted-foreground font-body">{sub}</p>}
  </div>
);

const Dashboard = () => {
  const { user, profile } = useAuth();
  const displayName = profile?.full_name || "Student";

  // Fetch enrolled courses from DB
  const { data: enrolledCourses } = useQuery({
    queryKey: ["my-enrollments", user?.id],
    queryFn: async () => {
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("course_id, enrolled_at")
        .eq("user_id", user!.id);
      if (!enrollments?.length) return [];
      const courseIds = enrollments.map((e) => e.course_id);
      const { data: courses } = await supabase
        .from("courses")
        .select("*")
        .in("id", courseIds);

      // Get module counts per course
      const { data: modules } = await supabase
        .from("modules")
        .select("id, course_id")
        .in("course_id", courseIds);

      // Get lesson progress
      const moduleIds = (modules ?? []).map((m) => m.id);
      const { data: lessons } = moduleIds.length
        ? await supabase.from("lessons").select("id, module_id").in("module_id", moduleIds)
        : { data: [] };
      const lessonIds = (lessons ?? []).map((l) => l.id);
      const { data: progressData } = lessonIds.length
        ? await supabase.from("lesson_progress").select("lesson_id, completed").eq("user_id", user!.id).in("lesson_id", lessonIds)
        : { data: [] };

      const completedSet = new Set((progressData ?? []).filter((p) => p.completed).map((p) => p.lesson_id));

      return (courses ?? []).map((c) => {
        const courseModules = (modules ?? []).filter((m) => m.course_id === c.id);
        const courseLessons = (lessons ?? []).filter((l) => courseModules.some((m) => m.id === l.module_id));
        const completed = courseLessons.filter((l) => completedSet.has(l.id)).length;
        return {
          ...c,
          totalLessons: courseLessons.length,
          completedLessons: completed,
          totalModules: courseModules.length,
        };
      });
    },
    enabled: !!user,
  });

  // Fetch referral info
  const { data: referralData } = useQuery({
    queryKey: ["my-referral", user?.id],
    queryFn: async () => {
      const [codeRes, rewardsRes] = await Promise.all([
        supabase.from("referral_codes").select("code").eq("user_id", user!.id).maybeSingle(),
        supabase.from("referral_rewards").select("credits").eq("referrer_id", user!.id),
      ]);
      return {
        code: codeRes.data?.code ?? null,
        totalCredits: (rewardsRes.data ?? []).reduce((sum, r) => sum + r.credits, 0),
        totalReferrals: rewardsRes.data?.length ?? 0,
      };
    },
    enabled: !!user,
  });

  // Fetch certificates
  const { data: certificates } = useQuery({
    queryKey: ["my-certificates", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("certificates")
        .select("*, courses:course_id(title)")
        .eq("user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const totalLessonsCompleted = enrolledCourses?.reduce((sum, c) => sum + c.completedLessons, 0) ?? 0;
  const totalLessons = enrolledCourses?.reduce((sum, c) => sum + c.totalLessons, 0) ?? 0;

  const copyReferralLink = () => {
    if (referralData?.code) {
      navigator.clipboard.writeText(`${window.location.origin}/register?ref=${referralData.code}`);
      toast({ title: "Copied!", description: "Referral link copied to clipboard." });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-1">Assalamu Alaikum, {displayName}</h1>
          <p className="text-muted-foreground font-body">Continue your journey of knowledge.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard icon={BookOpen} label="Courses Enrolled" value={enrolledCourses?.length ?? 0} />
          <StatCard icon={Target} label="Lessons Done" value={`${totalLessonsCompleted}/${totalLessons}`} />
          <StatCard icon={Gift} label="Referral Credits" value={referralData?.totalCredits ?? 0} sub={`${referralData?.totalReferrals ?? 0} referrals`} />
          <StatCard icon={Award} label="Certificates" value={certificates?.length ?? 0} />
        </div>

        {/* Referral Card */}
        {referralData?.code && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <Gift className="h-5 w-5 text-accent" /> Your Referral
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Referral Code */}
              <div>
                <p className="text-xs text-muted-foreground font-body mb-1.5">Your Referral Code</p>
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-4 py-2 rounded-lg text-lg font-mono font-bold text-foreground flex-1">
                    {referralData.code}
                  </code>
                  <Button variant="outline" size="sm" onClick={() => {
                    navigator.clipboard.writeText(referralData.code!);
                    toast({ title: "Copied!", description: "Referral code copied to clipboard." });
                  }}>
                    <Copy className="h-4 w-4 mr-1" /> Copy Code
                  </Button>
                </div>
              </div>
              {/* Referral Link */}
              <div>
                <p className="text-xs text-muted-foreground font-body mb-1.5">Your Referral Link</p>
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-3 py-2 rounded-lg text-sm font-mono text-foreground flex-1 truncate">
                    {`${window.location.origin}/register?ref=${referralData.code}`}
                  </code>
                  <Button variant="outline" size="sm" onClick={copyReferralLink}>
                    <Copy className="h-4 w-4 mr-1" /> Copy Link
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-body">
                Share your code or link. Earn <span className="font-semibold text-accent">100 credits</span> for each student who enrolls!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Certificates */}
        {certificates && certificates.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <Award className="h-5 w-5 text-accent" /> Your Certificates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {certificates.map((cert: any) => (
                <Link
                  key={cert.id}
                  to={`/certificate/${cert.id}`}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full gradient-gold flex items-center justify-center">
                      <Award className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="font-heading font-medium text-foreground group-hover:text-primary transition-colors">
                        {cert.courses?.title ?? "Course"}
                      </p>
                      <p className="text-xs text-muted-foreground font-body">
                        #{cert.certificate_number} · {new Date(cert.issued_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1 text-xs">
                    View <Award className="h-3 w-3" />
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Enrolled Courses */}
        <div className="mb-6">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-4">Your Courses</h2>
          {!enrolledCourses?.length ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground font-body mb-4">You haven't enrolled in any courses yet.</p>
                <Button variant="hero" asChild>
                  <Link to="/courses">Browse Courses</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {enrolledCourses.map((course) => {
                const progress = course.totalLessons > 0
                  ? Math.round((course.completedLessons / course.totalLessons) * 100)
                  : 0;
                return (
                  <Link
                    to={`/course/${course.id}`}
                    key={course.id}
                    className="bg-card rounded-lg p-6 shadow-card hover:shadow-elevated transition-shadow group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Badge className="mb-2 bg-sage-light text-sage-dark font-body text-xs">{course.category}</Badge>
                        <h3 className="text-lg font-heading font-bold text-foreground group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                        {course.title_ar && (
                          <p className="text-xs text-muted-foreground font-body mt-1">{course.title_ar}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs font-body">{course.level}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-body text-muted-foreground">
                        <span>{course.completedLessons} of {course.totalLessons} lessons</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
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
