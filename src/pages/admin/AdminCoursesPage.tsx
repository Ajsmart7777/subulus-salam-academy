import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Trash2, DollarSign, ImagePlus, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const AdminCoursesPage = () => {
  const queryClient = useQueryClient();
  const [pricingCourse, setPricingCourse] = useState<{ id: string; title: string; price: number } | null>(null);
  const [newPrice, setNewPrice] = useState("");
  const [bannerCourse, setBannerCourse] = useState<{ id: string; title: string; image_url: string | null } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      toast({ title: "Class updated" });
    },
  });

  const deleteCourse = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast({ title: "Class deleted" });
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

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !bannerCourse) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({ title: "File too large", description: "Max banner size is 5MB.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${bannerCourse.id}/banner.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("course-banners")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("course-banners")
        .getPublicUrl(filePath);

      const imageUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("courses")
        .update({ image_url: imageUrl })
        .eq("id", bannerCourse.id);

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      setBannerCourse(null);
      toast({ title: "Banner uploaded successfully!" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminLayout title="Class Management">
      <p className="text-muted-foreground font-body mb-6">Manage all classes, banners, and pricing.</p>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !courses?.length ? (
        <p className="text-center text-muted-foreground py-20">No classes yet.</p>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {/* Desktop table */}
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Banner</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
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
                      <TableCell>
                        <div
                          className="w-16 h-10 rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setBannerCourse({ id: c.id, title: c.title, image_url: c.image_url })}
                        >
                          {c.image_url ? (
                            <img src={c.image_url} alt="" className="w-full h-full object-cover rounded-none" />
                          ) : (
                            <div className="w-full h-full gradient-hero flex items-center justify-center">
                              <ImagePlus className="h-4 w-4 text-primary-foreground/60" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{c.title}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-xs">{c.category || "—"}</Badge></TableCell>
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
                          <Button variant="outline" size="sm" onClick={() => setBannerCourse({ id: c.id, title: c.title, image_url: c.image_url })} title="Change banner">
                            <ImagePlus className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => { setPricingCourse({ id: c.id, title: c.title, price: (c as any).price ?? 0 }); setNewPrice(String((c as any).price ?? 0)); }}>
                            <DollarSign className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => togglePublish.mutate({ id: c.id, published: !c.published })}>
                            {c.published ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive" onClick={() => { if (confirm("Delete this class?")) deleteCourse.mutate(c.id); }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile card list */}
            <div className="lg:hidden divide-y divide-border">
              {courses.map((c) => (
                <div key={c.id} className="p-4 space-y-3">
                  <div className="flex gap-3">
                    <div
                      className="w-20 h-14 rounded-lg overflow-hidden bg-muted shrink-0 cursor-pointer"
                      onClick={() => setBannerCourse({ id: c.id, title: c.title, image_url: c.image_url })}
                    >
                      {c.image_url ? (
                        <img src={c.image_url} alt="" className="w-full h-full object-cover rounded-none" />
                      ) : (
                        <div className="w-full h-full gradient-hero flex items-center justify-center">
                          <ImagePlus className="h-4 w-4 text-primary-foreground/60" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-bold text-foreground text-sm truncate">{c.title}</h3>
                      <p className="text-xs text-muted-foreground font-body">{c.teacherName}</p>
                      <div className="flex gap-1.5 mt-1">
                        <Badge variant="secondary" className="text-xs">{c.category || "—"}</Badge>
                        <Badge variant={c.published ? "default" : "outline"} className="text-xs">
                          {c.published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-xs text-muted-foreground font-body">
                      <span>{(c as any).price ? `₦${Number((c as any).price).toLocaleString()}` : "Free"}</span>
                      <span>{c.enrollmentCount} enrolled</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => setBannerCourse({ id: c.id, title: c.title, image_url: c.image_url })}>
                        <ImagePlus className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => { setPricingCourse({ id: c.id, title: c.title, price: (c as any).price ?? 0 }); setNewPrice(String((c as any).price ?? 0)); }}>
                        <DollarSign className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => togglePublish.mutate({ id: c.id, published: !c.published })}>
                        {c.published ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive" onClick={() => { if (confirm("Delete this class?")) deleteCourse.mutate(c.id); }}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Dialog */}
      <Dialog open={!!pricingCourse} onOpenChange={() => setPricingCourse(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">Set Class Price</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground font-body">{pricingCourse?.title}</p>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Price (NGN) — Set to 0 for free</Label>
              <Input type="number" min="0" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="0" />
            </div>
            <Button variant="hero" className="w-full" onClick={() => pricingCourse && updatePrice.mutate({ id: pricingCourse.id, price: Number(newPrice) })}>
              Save Price
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Banner Upload Dialog */}
      <Dialog open={!!bannerCourse} onOpenChange={() => setBannerCourse(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">Class Banner</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground font-body">{bannerCourse?.title}</p>
          <div className="space-y-4 pt-2">
            {bannerCourse?.image_url ? (
              <div className="rounded-xl overflow-hidden border border-border">
                <img src={bannerCourse.image_url} alt="Current banner" className="w-full h-40 object-cover rounded-none" />
              </div>
            ) : (
              <div className="w-full h-40 rounded-xl gradient-hero flex items-center justify-center">
                <p className="text-primary-foreground/60 font-body text-sm">No banner set</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleBannerUpload}
            />
            <Button
              variant="hero"
              className="w-full gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
              ) : (
                <><ImagePlus className="h-4 w-4" /> {bannerCourse?.image_url ? "Change Banner" : "Upload Banner"}</>
              )}
            </Button>
            <p className="text-xs text-muted-foreground font-body text-center">Recommended: 1200×400px, max 5MB</p>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCoursesPage;
