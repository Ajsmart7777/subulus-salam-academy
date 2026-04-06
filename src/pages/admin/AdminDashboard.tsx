import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, GraduationCap, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [profilesRes, coursesRes, enrollmentsRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("courses").select("id", { count: "exact", head: true }),
        supabase.from("enrollments").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("role"),
      ]);
      const teachers = rolesRes.data?.filter((r) => r.role === "teacher").length ?? 0;
      const students = rolesRes.data?.filter((r) => r.role === "student").length ?? 0;
      return {
        totalUsers: profilesRes.count ?? 0,
        totalCourses: coursesRes.count ?? 0,
        totalEnrollments: enrollmentsRes.count ?? 0,
        teachers,
        students,
      };
    },
  });

  const cards = [
    { label: "Total Students", value: stats?.students ?? 0, icon: Users, color: "text-primary" },
    { label: "Total Teachers", value: stats?.teachers ?? 0, icon: GraduationCap, color: "text-accent" },
    { label: "Total Courses", value: stats?.totalCourses ?? 0, icon: BookOpen, color: "text-primary" },
    { label: "Total Enrollments", value: stats?.totalEnrollments ?? 0, icon: TrendingUp, color: "text-accent" },
  ];

  return (
    <AdminLayout title="Dashboard">
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {cards.map((c) => (
              <Card key={c.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-body font-medium text-muted-foreground">{c.label}</CardTitle>
                  <c.icon className={`h-5 w-5 ${c.color}`} />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-heading font-bold text-foreground">{c.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Recent Enrollments</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentEnrollments />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Platform Overview</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground font-body space-y-2">
                <p>• {stats?.totalCourses} courses available</p>
                <p>• {stats?.students} students enrolled</p>
                <p>• {stats?.teachers} active teachers</p>
                <p>• Referral system: Coming soon</p>
                <p>• Payment integration: Coming soon</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

const RecentEnrollments = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-recent-enrollments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select("id, enrolled_at, course_id, user_id")
        .order("enrolled_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      if (!data?.length) return [];

      const courseIds = [...new Set(data.map((e) => e.course_id))];
      const userIds = [...new Set(data.map((e) => e.user_id))];
      const [coursesRes, profilesRes] = await Promise.all([
        supabase.from("courses").select("id, title").in("id", courseIds),
        supabase.from("profiles").select("user_id, full_name").in("user_id", userIds),
      ]);
      const courseMap = Object.fromEntries((coursesRes.data ?? []).map((c) => [c.id, c.title]));
      const profileMap = Object.fromEntries((profilesRes.data ?? []).map((p) => [p.user_id, p.full_name]));

      return data.map((e) => ({
        ...e,
        courseName: courseMap[e.course_id] ?? "Unknown",
        studentName: profileMap[e.user_id] ?? "Unknown",
      }));
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading...</p>;
  if (!data?.length) return <p className="text-sm text-muted-foreground">No enrollments yet.</p>;

  return (
    <div className="space-y-3">
      {data.map((e) => (
        <div key={e.id} className="flex justify-between items-center text-sm">
          <div>
            <span className="font-medium text-foreground">{e.studentName}</span>
            <span className="text-muted-foreground"> enrolled in </span>
            <span className="font-medium text-foreground">{e.courseName}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {new Date(e.enrolled_at).toLocaleDateString()}
          </span>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
