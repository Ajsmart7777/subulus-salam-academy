import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

const AdminReportsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const [coursesRes, enrollmentsRes, progressRes, submissionsRes] = await Promise.all([
        supabase.from("courses").select("id, title, published"),
        supabase.from("enrollments").select("course_id"),
        supabase.from("lesson_progress").select("id, completed"),
        supabase.from("assignment_submissions").select("id, graded"),
      ]);

      const enrollCountMap: Record<string, number> = {};
      (enrollmentsRes.data ?? []).forEach((e) => {
        enrollCountMap[e.course_id] = (enrollCountMap[e.course_id] ?? 0) + 1;
      });

      const totalLessonsCompleted = (progressRes.data ?? []).filter((p) => p.completed).length;
      const totalSubmissions = submissionsRes.data?.length ?? 0;
      const gradedSubmissions = (submissionsRes.data ?? []).filter((s) => s.graded).length;

      return {
        courses: (coursesRes.data ?? []).map((c) => ({
          ...c,
          enrollments: enrollCountMap[c.id] ?? 0,
        })),
        totalLessonsCompleted,
        totalSubmissions,
        gradedSubmissions,
      };
    },
  });

  return (
    <AdminLayout title="Reports & Analytics">
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-body text-muted-foreground">Lessons Completed</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-heading font-bold">{data?.totalLessonsCompleted ?? 0}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-body text-muted-foreground">Assignment Submissions</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-heading font-bold">{data?.totalSubmissions ?? 0}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-body text-muted-foreground">Graded Assignments</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-heading font-bold">{data?.gradedSubmissions ?? 0}</p></CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Course Enrollment Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data?.courses.map((c) => (
                <div key={c.id} className="flex items-center gap-4">
                  <span className="text-sm font-medium w-48 truncate">{c.title}</span>
                  <Progress value={Math.min(c.enrollments * 10, 100)} className="flex-1" />
                  <span className="text-sm text-muted-foreground w-20 text-right">{c.enrollments} enrolled</span>
                </div>
              ))}
              {!data?.courses.length && <p className="text-sm text-muted-foreground">No courses yet.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Revenue Reports</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground font-body">
              <p>Payment integration (Flutterwave) coming soon. Revenue tracking will be available once payment is configured.</p>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminReportsPage;
