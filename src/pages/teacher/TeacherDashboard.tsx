import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, Users, Eye, EyeOff, Trash2 } from "lucide-react";
import { useTeacherCourses, useCourseMutations } from "@/hooks/useTeacherCourses";
import { useState } from "react";
import CreateCourseDialog from "@/components/teacher/CreateCourseDialog";

const TeacherDashboard = () => {
  const { data: courses, isLoading } = useTeacherCourses();
  const { deleteCourse, updateCourse } = useCourseMutations();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">Teacher Panel</h1>
            <p className="text-muted-foreground font-body text-sm sm:text-base">Manage your classes, books, and students.</p>
          </div>
          <Button variant="hero" className="gap-2 w-full sm:w-auto" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" /> New Class
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !courses?.length ? (
          <div className="text-center py-20 bg-card rounded-xl shadow-soft border border-border">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-heading font-bold text-foreground mb-2">No classes yet</h2>
            <p className="text-muted-foreground font-body mb-4">Create your first class to get started.</p>
            <Button variant="hero" onClick={() => setShowCreate(true)}>Create Class</Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {courses.map((course) => (
              <div key={course.id} className="relative bg-card rounded-xl overflow-hidden shadow-soft border border-border flex flex-col">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent z-10" />
                <div className="h-28 sm:h-32 overflow-hidden">
                  {course.image_url ? (
                    <img src={course.image_url} alt={course.title} className="w-full h-full object-cover rounded-none" />
                  ) : (
                    <div className="w-full h-full gradient-hero flex items-center justify-center">
                      <p className="text-lg sm:text-xl font-heading text-primary-foreground/80">{course.title_ar || course.title}</p>
                    </div>
                  )}
                </div>
                <div className="p-4 sm:p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge className="bg-sage-light text-sage-dark font-body text-xs">{course.category || "General"}</Badge>
                    <Badge variant={course.published ? "default" : "outline"} className="text-xs font-body">
                      {course.published ? <><Eye className="h-3 w-3 mr-1" /> Published</> : <><EyeOff className="h-3 w-3 mr-1" /> Draft</>}
                    </Badge>
                  </div>
                  <h3 className="text-base sm:text-lg font-heading font-bold text-foreground mb-1">{course.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground font-body mb-4 flex-1 line-clamp-2">{course.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="flex-1 min-w-0" asChild>
                      <Link to={`/teacher/course/${course.id}`}>
                        <BookOpen className="h-4 w-4 mr-1" /> Manage
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/teacher/course/${course.id}/students`}>
                        <Users className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => updateCourse.mutate({ id: course.id, published: !course.published })}>
                      {course.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { if (confirm("Delete this class and all its content?")) deleteCourse.mutate(course.id); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
      <CreateCourseDialog open={showCreate} onOpenChange={setShowCreate} />
    </div>
  );
};

export default TeacherDashboard;
