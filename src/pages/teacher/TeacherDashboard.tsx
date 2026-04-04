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
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Teacher Panel</h1>
            <p className="text-muted-foreground font-body">Manage your courses, modules, and students.</p>
          </div>
          <Button variant="hero" className="gap-2" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" /> New Course
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !courses?.length ? (
          <div className="text-center py-20 bg-card rounded-lg shadow-card">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-heading font-bold text-foreground mb-2">No courses yet</h2>
            <p className="text-muted-foreground font-body mb-4">Create your first course to get started.</p>
            <Button variant="hero" onClick={() => setShowCreate(true)}>Create Course</Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-card rounded-lg overflow-hidden shadow-card flex flex-col">
                <div className="h-24 gradient-hero flex items-center justify-center">
                  <p className="text-xl font-heading text-primary-foreground">{course.title_ar || course.title}</p>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-sage-light text-sage-dark font-body text-xs">{course.category || "General"}</Badge>
                    <Badge variant={course.published ? "default" : "outline"} className="text-xs font-body">
                      {course.published ? <><Eye className="h-3 w-3 mr-1" /> Published</> : <><EyeOff className="h-3 w-3 mr-1" /> Draft</>}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-heading font-bold text-foreground mb-1">{course.title}</h3>
                  <p className="text-sm text-muted-foreground font-body mb-4 flex-1 line-clamp-2">{course.description}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link to={`/teacher/course/${course.id}`}>
                        <BookOpen className="h-4 w-4 mr-1" /> Manage
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/teacher/course/${course.id}/students`}>
                        <Users className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateCourse.mutate({ id: course.id, published: !course.published })}
                    >
                      {course.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => {
                        if (confirm("Delete this course and all its content?")) {
                          deleteCourse.mutate(course.id);
                        }
                      }}
                    >
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
