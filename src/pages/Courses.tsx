import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { courses } from "@/data/mockData";

const Courses = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Courses</h1>
          <p className="text-muted-foreground font-body">Explore our structured Islamic curriculum.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-card rounded-lg overflow-hidden shadow-card hover:shadow-elevated transition-shadow flex flex-col">
              <div className="h-32 gradient-hero flex items-center justify-center">
                <p className="text-2xl font-heading text-primary-foreground">{course.titleAr}</p>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-sage-light text-sage-dark font-body text-xs">{course.category}</Badge>
                  <Badge variant="outline" className="text-xs font-body">{course.level}</Badge>
                </div>
                <h3 className="text-lg font-heading font-bold text-foreground mb-1">{course.title}</h3>
                <p className="text-sm text-muted-foreground font-body mb-3 flex-1">{course.description}</p>
                <p className="text-xs text-muted-foreground font-body mb-4">{course.teacher} · {course.totalModules} modules</p>
                <Button variant={course.enrolled ? "outline" : "hero"} size="sm" asChild>
                  <Link to={`/course/${course.id}`}>
                    {course.enrolled ? "Continue" : "Enroll"}
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Courses;
