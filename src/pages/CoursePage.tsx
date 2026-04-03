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
} from "lucide-react";
import { courses, modules } from "@/data/mockData";

const lessonIcon = (type: string) => {
  switch (type) {
    case "video": return PlayCircle;
    case "audio": return Headphones;
    default: return FileText;
  }
};

const CoursePage = () => {
  const { courseId } = useParams();
  const course = courses.find((c) => c.id === courseId);
  const courseModules = modules.filter((m) => m.courseId === courseId);

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

  const progress = Math.round((course.completedModules / course.totalModules) * 100);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Course header */}
      <div className="gradient-hero py-12">
        <div className="container">
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-primary-foreground/20 text-primary-foreground font-body text-xs">{course.category}</Badge>
            <Badge className="bg-primary-foreground/20 text-primary-foreground font-body text-xs">{course.level}</Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground mb-1">
            {course.title}
          </h1>
          <p className="text-lg font-heading text-primary-foreground/80 mb-3">{course.titleAr}</p>
          <p className="text-sm text-primary-foreground/70 font-body mb-6 max-w-2xl">{course.description}</p>
          <p className="text-sm text-primary-foreground/70 font-body mb-4">Taught by {course.teacher}</p>
          <div className="max-w-sm">
            <div className="flex justify-between text-xs text-primary-foreground/60 font-body mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-primary-foreground/20" />
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="container py-8">
        <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Weekly Modules</h2>
        <div className="space-y-4">
          {courseModules.map((mod) => (
            <div
              key={mod.id}
              className={`rounded-lg border ${
                mod.locked ? "border-border bg-muted/50 opacity-70" : "border-border bg-card shadow-card"
              }`}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {mod.locked ? (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    ) : mod.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-accent" />
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground font-body">Week {mod.week}</p>
                      <h3 className="font-heading font-bold text-foreground">{mod.title}</h3>
                    </div>
                  </div>
                  {mod.locked && (
                    <Badge variant="outline" className="text-xs font-body text-muted-foreground">
                      <Lock className="h-3 w-3 mr-1" /> Locked
                    </Badge>
                  )}
                </div>

                {mod.locked ? (
                  <p className="text-sm text-muted-foreground font-body italic">
                    Complete this week's module to unlock next.
                  </p>
                ) : (
                  <>
                    {/* Lessons */}
                    <div className="space-y-2 mb-4">
                      {mod.lessons.map((lesson) => {
                        const LIcon = lessonIcon(lesson.type);
                        return (
                          <Link
                            to={`/course/${courseId}/lesson/${lesson.id}`}
                            key={lesson.id}
                            className="flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors group"
                          >
                            <LIcon className={`h-4 w-4 ${lesson.completed ? "text-primary" : "text-muted-foreground"}`} />
                            <span className={`flex-1 text-sm font-body ${lesson.completed ? "text-foreground" : "text-muted-foreground"}`}>
                              {lesson.title}
                            </span>
                            <span className="text-xs text-muted-foreground font-body">{lesson.duration}</span>
                            {lesson.completed ? (
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                            )}
                          </Link>
                        );
                      })}
                    </div>

                    {/* Quiz & Assignment status */}
                    <div className="flex gap-3 pt-3 border-t border-border">
                      {mod.hasQuiz && (
                        <div className="flex items-center gap-1.5 text-xs font-body">
                          <HelpCircle className={`h-4 w-4 ${mod.quizCompleted ? "text-primary" : "text-muted-foreground"}`} />
                          <span className={mod.quizCompleted ? "text-primary" : "text-muted-foreground"}>
                            Quiz {mod.quizCompleted ? "✓" : ""}
                          </span>
                        </div>
                      )}
                      {mod.hasAssignment && (
                        <div className="flex items-center gap-1.5 text-xs font-body">
                          <ClipboardList className={`h-4 w-4 ${mod.assignmentCompleted ? "text-primary" : "text-muted-foreground"}`} />
                          <span className={mod.assignmentCompleted ? "text-primary" : "text-muted-foreground"}>
                            Assignment {mod.assignmentCompleted ? "✓" : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CoursePage;
