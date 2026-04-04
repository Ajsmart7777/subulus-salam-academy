import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ArrowLeft, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCourseEnrollments, useTeacherCourses } from "@/hooks/useTeacherCourses";

const TeacherStudentsPage = () => {
  const { courseId } = useParams();
  const { data: courses } = useTeacherCourses();
  const { data: enrollments, isLoading } = useCourseEnrollments(courseId);
  const course = courses?.find((c) => c.id === courseId);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 max-w-4xl">
        <Link to={`/teacher/course/${courseId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary font-body mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Course
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-1">Enrolled Students</h1>
          {course && <p className="text-muted-foreground font-body">{course.title}</p>}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !enrollments?.length ? (
          <div className="text-center py-16 bg-card rounded-lg shadow-card">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-heading font-bold text-foreground mb-2">No students enrolled yet</h2>
            <p className="text-muted-foreground font-body">Students will appear here once they enroll in this course.</p>
          </div>
        ) : (
          <div className="bg-card rounded-lg shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-body">Student</TableHead>
                  <TableHead className="font-body">Enrolled</TableHead>
                  <TableHead className="font-body">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((enrollment: any) => (
                  <TableRow key={enrollment.id}>
                    <TableCell className="font-body font-medium">
                      {enrollment.profiles?.full_name || "Unknown Student"}
                    </TableCell>
                    <TableCell className="font-body text-sm text-muted-foreground">
                      {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-body">Active</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default TeacherStudentsPage;
