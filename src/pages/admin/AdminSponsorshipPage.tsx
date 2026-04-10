import AdminLayout from "@/components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HandHeart, Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminSponsorshipPage = () => {
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ["admin-sponsorship-requests"],
    queryFn: async () => {
      const { data } = await supabase
        .from("student_sponsorship_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (!data?.length) return [];

      const courseIds = [...new Set(data.map((r) => r.course_id))];
      const userIds = [...new Set(data.map((r) => r.student_user_id))];

      const [coursesRes, profilesRes] = await Promise.all([
        supabase.from("courses").select("id, title, price").in("id", courseIds),
        supabase.from("profiles").select("user_id, full_name").in("user_id", userIds),
      ]);

      const courseMap = new Map((coursesRes.data ?? []).map((c) => [c.id, c]));
      const profileMap = new Map((profilesRes.data ?? []).map((p) => [p.user_id, p]));

      return data.map((r) => ({
        ...r,
        course: courseMap.get(r.course_id),
        profile: profileMap.get(r.student_user_id),
      }));
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("student_sponsorship_requests").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sponsorship-requests"] });
      toast({ title: "Status updated" });
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <HandHeart className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-heading font-bold text-foreground">Sponsorship Requests</h1>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-8"><div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests?.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.profile?.full_name ?? "Unknown"}</TableCell>
                        <TableCell>{r.course?.title ?? "Unknown"}</TableCell>
                        <TableCell className="font-bold">₦{Number(r.course?.price ?? 0).toLocaleString()}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">{r.reason}</TableCell>
                        <TableCell>
                          <Badge className={
                            r.status === "sponsored" ? "bg-primary/10 text-primary" :
                            r.status === "rejected" ? "bg-destructive/10 text-destructive" :
                            "bg-accent/10 text-accent"
                          }>{r.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {r.status === "pending" && (
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" onClick={() => updateStatus.mutate({ id: r.id, status: "rejected" })}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSponsorshipPage;
