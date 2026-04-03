import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowLeft, Download, MessageCircle } from "lucide-react";
import { modules } from "@/data/mockData";

const LessonPage = () => {
  const { courseId, lessonId } = useParams();

  // Find the lesson
  let foundLesson = null;
  let foundModule = null;
  for (const mod of modules) {
    const lesson = mod.lessons.find((l) => l.id === lessonId);
    if (lesson) {
      foundLesson = lesson;
      foundModule = mod;
      break;
    }
  }

  if (!foundLesson || !foundModule) {
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 max-w-4xl">
        {/* Breadcrumb */}
        <Link
          to={`/course/${courseId}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary font-body mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to course
        </Link>

        {/* Lesson header */}
        <div className="mb-6">
          <p className="text-xs text-muted-foreground font-body mb-1">Week {foundModule.week} · {foundModule.title}</p>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">{foundLesson.title}</h1>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs font-body capitalize">{foundLesson.type}</Badge>
            <span className="text-xs text-muted-foreground font-body">{foundLesson.duration}</span>
          </div>
        </div>

        {/* Video/Audio placeholder */}
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

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button variant={foundLesson.completed ? "outline" : "hero"} className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {foundLesson.completed ? "Completed" : "Mark as Complete"}
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Download Materials
          </Button>
          <Button variant="outline" className="gap-2">
            <MessageCircle className="h-4 w-4" /> Ask AI Assistant
          </Button>
        </div>

        {/* Notes section */}
        <div className="bg-card rounded-lg p-6 shadow-card mb-8">
          <h3 className="font-heading font-bold text-foreground mb-3">Your Notes</h3>
          <textarea
            className="w-full min-h-[120px] bg-background rounded-md border border-input p-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
            placeholder="Write your notes for this lesson..."
          />
        </div>

        {/* Lesson navigation */}
        <div className="flex justify-between">
          <Button variant="ghost" className="font-body text-sm" disabled>
            ← Previous Lesson
          </Button>
          <Button variant="ghost" className="font-body text-sm">
            Next Lesson →
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LessonPage;
