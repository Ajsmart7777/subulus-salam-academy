import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowLeft, Download, MessageCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const LessonPage = () => {
  const { courseId, lessonId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch lesson with module info
  const { data, isLoading } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: async () => {
      const { data: lesson, error } = await supabase
        .from("lessons")
        .select("*, modules:module_id(title, week, course_id)")
        .eq("id", lessonId!)
        .single();
      if (error) throw error;
      return lesson;
    },
    enabled: !!lessonId,
  });

  // Fetch completion status
  const { data: progressData } = useQuery({
    queryKey: ["lesson-progress-single", lessonId, user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("lesson_progress")
        .select("*")
        .eq("lesson_id", lessonId!)
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!lessonId && !!user,
  });

  const isCompleted = progressData?.completed ?? false;

  const markComplete = useMutation({
    mutationFn: async () => {
      if (progressData) {
        const { error } = await supabase
          .from("lesson_progress")
          .update({ completed: true, completed_at: new Date().toISOString() })
          .eq("id", progressData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("lesson_progress")
          .insert({
            user_id: user!.id,
            lesson_id: lessonId!,
            completed: true,
            completed_at: new Date().toISOString(),
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson-progress"] });
      queryClient.invalidateQueries({ queryKey: ["lesson-progress-single", lessonId] });
      toast({ title: "Lesson completed! ✓" });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-heading font-bold text-foreground">Lesson not found</h1>
          <Button variant="hero" className="mt-4" asChild>
            <Link to={`/course/${courseId}`}>Back to Course</Link>
          </Button>
        </div>
      </div>
    );
  }

  const module = data.modules as any;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 max-w-4xl">
        <Link
          to={`/course/${courseId}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary font-body mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to course
        </Link>

        <div className="mb-6">
          <p className="text-xs text-muted-foreground font-body mb-1">Week {module?.week} · {module?.title}</p>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">{data.title}</h1>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs font-body capitalize">{data.type}</Badge>
            <span className="text-xs text-muted-foreground font-body">{data.duration}</span>
          </div>
        </div>

        {/* Content area */}
        {data.content_text ? (
          <div className="prose prose-sm max-w-none bg-card rounded-lg border border-border p-6 mb-8 shadow-card font-body">
            <div dangerouslySetInnerHTML={{ __html: data.content_text }} />
          </div>
        ) : data.content_url ? (
          <div className="rounded-lg bg-card border border-border aspect-video flex items-center justify-center mb-8 shadow-card overflow-hidden">
            <iframe src={data.content_url} className="w-full h-full" allowFullScreen />
          </div>
        ) : (
          <div className="rounded-lg bg-card border border-border aspect-video flex items-center justify-center mb-8 shadow-card">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full gradient-hero flex items-center justify-center mx-auto mb-3">
                <svg className="h-8 w-8 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground font-body">Lesson content will appear here</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mb-8">
          <Button
            variant={isCompleted ? "outline" : "hero"}
            className="gap-2"
            onClick={() => !isCompleted && markComplete.mutate()}
            disabled={isCompleted || markComplete.isPending}
          >
            <CheckCircle2 className="h-4 w-4" />
            {isCompleted ? "Completed ✓" : markComplete.isPending ? "Saving..." : "Mark as Complete"}
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Download Materials
          </Button>
          <Button variant="outline" className="gap-2">
            <MessageCircle className="h-4 w-4" /> Ask AI Assistant
          </Button>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-card mb-8">
          <h3 className="font-heading font-bold text-foreground mb-3">Your Notes</h3>
          <textarea
            className="w-full min-h-[120px] bg-background rounded-md border border-input p-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
            placeholder="Write your notes for this lesson..."
          />
        </div>

        <div className="flex justify-between">
          <Button variant="ghost" className="font-body text-sm" asChild>
            <Link to={`/course/${courseId}`}>← Back to Course</Link>
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LessonPage;
