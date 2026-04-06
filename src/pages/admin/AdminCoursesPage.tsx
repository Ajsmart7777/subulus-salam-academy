import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Trash2, DollarSign } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const AdminCoursesPage = () => {
  const queryClient = useQueryClient();
  const [pricingCourse, setPricingCourse] = useState<{ id: string; title: string; price: number } | null>(null);
  const [newPrice, setNewPrice] = useState("");

  const { data: courses, isLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;

      const courseIds = data.map((c) => c.id);
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("course_id")
        .in("course_id", courseIds);

      const enrollCountMap: Record<string, number> = {};
      (enrollments ?? []).forEach((e) => {
        enrollCountMap[e.course_id] = (enrollCountMap[e.course_id] ?? 0) + 1;
      });

      const teacherIds = [...new Set(data.map((c) => c.teacher_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", teacherIds);
      const teacherMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p.full_name]));

      return data.map((c) => ({
        ...c,
        enrollmentCount: enrollCountMap[c.id] ?? 0,
        teacherName: teacherMap[c.teacher_id] ?? "Unknown",
      }));
    },
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { error } = await supabase.from("courses").update({ published }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast({ title: "Course updated" });
    },
  });

  const deleteCourse = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast({ title: "Course deleted" });
    },
  });

  const updatePrice = useMutation({
    mutationFn: async ({ id, price }: { id: string; price: number }) => {
      const { error } = await supabase.from("courses").update({ price }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      setPricingCourse(null);
      toast({ title: "Price updated" });
    },
  });

  return (
    <AdminLayout title="Course Management">
      <p className="text-muted-foreground font-body mb-6">Manage all courses and set pricing.</p>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !courses?.length ? (
        <p className="text-center text-muted-foreground py-20">No courses yet.</p>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Enrolled</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell><Badge variant="secondary" className="text-xs">{c.category || "—"}</Badge></TableCell>
                    <TableCell className="text-sm">{c.level}</TableCell>
                    <TableCell className="text-sm">{c.teacherName}</TableCell>
                    <TableCell className="text-sm font-medium">
                      {(c as any).price ? `₦${Number((c as any).price).toLocaleString()}` : "Free"}
                    </TableCell>
                    <TableCell className="text-sm">{c.enrollmentCount}</TableCell>
                    <TableCell>
                      <Badge variant={c.published ? "default" : "outline"} className="text-xs">
                        {c.published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPricingCourse({ id: c.id, title: c.title, price: (c as any).price ?? 0 });
                            setNewPrice(String((c as any).price ?? 0));
                          }}
                        >
                          <DollarSign className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => togglePublish.mutate({ id: c.id, published: !c.published })}
                        >
                          {c.published ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive"
                          onClick={() => { if (confirm("Delete this course?")) deleteCourse.mutate(c.id); }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!pricingCourse} onOpenChange={() => setPricingCourse(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">Set Course Price</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground font-body">{pricingCourse?.title}</p>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Price (NGN) — Set to 0 for free</Label>
              <Input
                type="number"
                min="0"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="0"
              />
            </div>
            <Button
              variant="hero"
              className="w-full"
              onClick={() => pricingCourse && updatePrice.mutate({ id: pricingCourse.id, price: Number(newPrice) })}
            >
              Save Price
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCoursesPage;
