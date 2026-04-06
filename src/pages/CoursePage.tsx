import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Lock,
  CheckCircle2,
  Circle,
  PlayCircle,
  FileText,
  Headphones,
  ClipboardList,
  HelpCircle,
  ChevronRight,
  Award,
  CreditCard,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

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

  // Fetch course
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });

  // Fetch enrollment
  const { data: enrollment } = useQuery({
    queryKey: ["enrollment", courseId, user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("enrollments")
        .select("*")
        .eq("course_id", courseId!)
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!courseId && !!user,
  });

  // Fetch modules with lessons
  const { data: modules } = useQuery({
    queryKey: ["course-modules", courseId],
    queryFn: async () => {
      const { data: mods, error } = await supabase
        .from("modules")
        .select("*")
        .eq("course_id", courseId!)
        .order("sort_order");
      if (error) throw error;

      const moduleIds = mods.map((m) => m.id);
      const [lessonsRes, assignmentsRes] = await Promise.all([
        supabase.from("lessons").select("*").in("module_id", moduleIds).order("sort_order"),
        supabase.from("assignments").select("*").in("module_id", moduleIds),
      ]);

      return mods.map((m) => ({
        ...m,
        lessons: (lessonsRes.data ?? []).filter((l) => l.module_id === m.id),
        assignments: (assignmentsRes.data ?? []).filter((a) => a.module_id === m.id),
      }));
    },
    enabled: !!courseId,
  });

  // Fetch user progress
  const { data: progress } = useQuery({
    queryKey: ["lesson-progress", courseId, user?.id],
    queryFn: async () => {
      if (!modules) return {};
      const lessonIds = modules.flatMap((m) => m.lessons.map((l) => l.id));
      if (!lessonIds.length) return {};
      const { data } = await supabase
        .from("lesson_progress")
        .select("*")
        .eq("user_id", user!.id)
        .in("lesson_id", lessonIds);
      const map: Record<string, boolean> = {};
      (data ?? []).forEach((p) => { if (p.completed) map[p.lesson_id] = true; });
      return map;
    },
    enabled: !!modules && !!user,
  });

  // Fetch assignment submissions
  const { data: submissions } = useQuery({
    queryKey: ["assignment-submissions", courseId, user?.id],
    queryFn: async () => {
      if (!modules) return {};
      const assignmentIds = modules.flatMap((m) => m.assignments.map((a) => a.id));
      if (!assignmentIds.length) return {};
      const { data } = await supabase
        .from("assignment_submissions")
        .select("*")
        .eq("user_id", user!.id)
        .in("assignment_id", assignmentIds);
      const map: Record<string, boolean> = {};
      (data ?? []).forEach((s) => { map[s.assignment_id] = true; });
      return map;
    },
    enabled: !!modules && !!user,
  });

  // Fetch certificate
  const { data: certificate } = useQuery({
    queryKey: ["certificate", courseId, user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("certificates")
        .select("*")
        .eq("course_id", courseId!)
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!courseId && !!user,
  });

  // Enroll (free courses)
  const enrollMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("enrollments").insert({
        user_id: user!.id,
        course_id: courseId!,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollment", courseId] });
      toast({ title: "Enrolled!", description: "You are now enrolled in this course." });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // Issue certificate
  const issueCertificate = useMutation({
    mutationFn: async () => {
      const certNumber = `SJ-CERT-${Date.now().toString(36).toUpperCase()}`;
      const { error } = await supabase.from("certificates").insert({
        user_id: user!.id,
        course_id: courseId!,
        certificate_number: certNumber,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificate", courseId] });
      toast({ title: "🎉 Certificate Issued!", description: "Congratulations on completing the course!" });
    },
  });

  // Flutterwave payment handler
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

      // Load Flutterwave inline script
      const script = document.createElement("script");
      script.src = "https://checkout.flutterwave.com/v3.js";
      script.onload = () => {
        (window as any).FlutterwaveCheckout({
          public_key: flw_public_key,
          tx_ref: flw_ref,
          amount: coursePrice,
          currency: "NGN",
          payment_options: "card,banktransfer,ussd",
          customer: { email: user.email ?? "" },
          customizations: {
            title: "Subulus-Salam Academy",
            description: `Enrollment: ${course?.title}`,
            logo: "",
          },
          callback: async (response: any) => {
            try {
              const { data: verifyData } = await supabase.functions.invoke("handle-payment", {
                body: {
                  action: "verify",
                  transaction_id: response.transaction_id,
                  tx_ref: flw_ref,
                  user_id: user.id,
                  course_id: courseId,
                },
              });
              if (verifyData?.success) {
                queryClient.invalidateQueries({ queryKey: ["enrollment", courseId] });
                toast({ title: "Payment Successful!", description: "You are now enrolled in this course." });
              } else {
                toast({ title: "Verification failed", description: verifyData?.message, variant: "destructive" });
              }
            } catch (err: any) {
              toast({ title: "Error", description: err.message, variant: "destructive" });
            }
            setPaymentLoading(false);
          },
          onclose: () => setPaymentLoading(false),
        });
      };
      document.head.appendChild(script);
    } catch (err: any) {
      toast({ title: "Payment Error", description: err.message, variant: "destructive" });
      setPaymentLoading(false);
    }
  };

  // Module unlock logic
  const isModuleUnlocked = (moduleIndex: number): boolean => {
    if (moduleIndex === 0) return true; // First module always unlocked
    if (!modules || !progress || !submissions) return false;

    const prevModule = modules[moduleIndex - 1];
    // All lessons completed?
    const allLessonsComplete = prevModule.lessons.every((l) => progress[l.id]);
    // All assignments submitted?
    const allAssignmentsComplete = prevModule.assignments.length === 0 ||
      prevModule.assignments.every((a) => submissions[a.id]);

    return allLessonsComplete && allAssignmentsComplete;
  };

  const isModuleComplete = (mod: any): boolean => {
    if (!progress || !submissions) return false;
    const allLessons = mod.lessons.every((l: any) => progress[l.id]);
    const allAssignments = mod.assignments.length === 0 ||
      mod.assignments.every((a: any) => submissions[a.id]);
    return allLessons && allAssignments;
  };

  // Check if entire course is complete
  const isCourseComplete = modules?.every((_, i) => {
    const mod = modules[i];
    return isModuleComplete(mod);
  }) && (modules?.length ?? 0) > 0;

  if (courseLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-heading font-bold text-foreground">Course not found</h1>
          <Button variant="hero" className="mt-4" asChild>
            <Link to="/courses">Browse Courses</Link>
          </Button>
        </div>
      </div>
    );
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

      {/* Course header */}
      <div className="gradient-hero py-12">
        <div className="container">
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-primary-foreground/20 text-primary-foreground font-body text-xs">{course.category}</Badge>
            <Badge className="bg-primary-foreground/20 text-primary-foreground font-body text-xs">{course.level}</Badge>
            {!isFree && (
              <Badge className="bg-accent text-accent-foreground font-body text-xs">₦{coursePrice.toLocaleString()}</Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground mb-1">{course.title}</h1>
          {course.title_ar && (
            <p className="text-lg font-heading text-primary-foreground/80 mb-3">{course.title_ar}</p>
          )}
          <p className="text-sm text-primary-foreground/70 font-body mb-6 max-w-2xl">{course.description}</p>

          {isEnrolled && (
            <div className="max-w-sm">
              <div className="flex justify-between text-xs text-primary-foreground/60 font-body mb-1">
                <span>Progress</span>
                <span>{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2 bg-primary-foreground/20" />
            </div>
          )}

          {!isEnrolled && user && (
            <div className="mt-4">
              {isFree ? (
                <Button variant="hero" onClick={() => enrollMutation.mutate()} disabled={enrollMutation.isPending}>
                  {enrollMutation.isPending ? "Enrolling..." : "Enroll for Free"}
                </Button>
              ) : (
                <Button
                  variant="hero"
                  className="gap-2"
                  disabled={paymentLoading}
                  onClick={handlePayment}
                >
                  <CreditCard className="h-4 w-4" />
                  {paymentLoading ? "Processing..." : `Pay ₦${coursePrice.toLocaleString()} to Enroll`}
                </Button>
              )}
            </div>
          )}

          {!user && (
            <Button variant="hero" className="mt-4" asChild>
              <Link to="/register">Sign Up to Enroll</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Certificate banner */}
      {certificate && (
        <div className="bg-accent/10 border-b border-accent/20 py-4">
          <div className="container flex items-center gap-3">
            <Award className="h-6 w-6 text-accent" />
            <div>
              <p className="font-heading font-bold text-foreground">Course Completed! 🎉</p>
              <p className="text-sm text-muted-foreground font-body">
                Certificate #{certificate.certificate_number} — Issued {new Date(certificate.issued_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {isCourseComplete && !certificate && isEnrolled && (
        <div className="bg-accent/10 border-b border-accent/20 py-4">
          <div className="container flex items-center gap-3">
            <Award className="h-6 w-6 text-accent" />
            <div className="flex-1">
              <p className="font-heading font-bold text-foreground">All modules completed!</p>
              <p className="text-sm text-muted-foreground font-body">Claim your certificate now.</p>
            </div>
            <Button variant="hero" size="sm" onClick={() => issueCertificate.mutate()} disabled={issueCertificate.isPending}>
              <Award className="h-4 w-4 mr-1" /> Get Certificate
            </Button>
          </div>
        </div>
      )}

      {/* Modules */}
      <div className="container py-8">
        <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Weekly Modules</h2>
        <div className="space-y-4">
          {modules?.map((mod, index) => {
            const unlocked = isEnrolled && isModuleUnlocked(index);
            const completed = isModuleComplete(mod);

            return (
              <div
                key={mod.id}
                className={`rounded-lg border ${
                  !unlocked ? "border-border bg-muted/50 opacity-70" : "border-border bg-card shadow-card"
                }`}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {!unlocked ? (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      ) : completed ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5 text-accent" />
                      )}
                      <div>
                        <p className="text-xs text-muted-foreground font-body">Week {mod.week}</p>
                        <h3 className="font-heading font-bold text-foreground">{mod.title}</h3>
                      </div>
                    </div>
                    {!unlocked && (
                      <Badge variant="outline" className="text-xs font-body text-muted-foreground">
                        <Lock className="h-3 w-3 mr-1" /> Locked
                      </Badge>
                    )}
                    {completed && (
                      <Badge className="bg-primary/10 text-primary text-xs font-body">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Complete
                      </Badge>
                    )}
                  </div>

                  {!unlocked ? (
                    <p className="text-sm text-muted-foreground font-body italic">
                      Complete all lessons and assignments in the previous module to unlock.
                    </p>
                  ) : (
                    <>
                      <div className="space-y-2 mb-4">
                        {mod.lessons.map((lesson) => {
                          const LIcon = lessonIcon(lesson.type);
                          const lessonDone = progress?.[lesson.id] ?? false;
                          return (
                            <Link
                              to={`/course/${courseId}/lesson/${lesson.id}`}
                              key={lesson.id}
                              className="flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors group"
                            >
                              <LIcon className={`h-4 w-4 ${lessonDone ? "text-primary" : "text-muted-foreground"}`} />
                              <span className={`flex-1 text-sm font-body ${lessonDone ? "text-foreground" : "text-muted-foreground"}`}>
                                {lesson.title}
                              </span>
                              <span className="text-xs text-muted-foreground font-body">{lesson.duration}</span>
                              {lessonDone ? (
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                              )}
                            </Link>
                          );
                        })}
                      </div>

                      <div className="flex gap-3 pt-3 border-t border-border">
                        {mod.has_quiz && (
                          <div className="flex items-center gap-1.5 text-xs font-body">
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Quiz</span>
                          </div>
                        )}
                        {mod.assignments.length > 0 && (
                          <div className="flex items-center gap-1.5 text-xs font-body">
                            <ClipboardList className={`h-4 w-4 ${mod.assignments.every((a) => submissions?.[a.id]) ? "text-primary" : "text-muted-foreground"}`} />
                            <span className={mod.assignments.every((a) => submissions?.[a.id]) ? "text-primary" : "text-muted-foreground"}>
                              Assignment {mod.assignments.every((a) => submissions?.[a.id]) ? "✓" : ""}
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
