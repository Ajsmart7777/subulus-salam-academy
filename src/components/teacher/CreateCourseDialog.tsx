import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCourseMutations } from "@/hooks/useTeacherCourses";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateCourseDialog = ({ open, onOpenChange }: Props) => {
  const [title, setTitle] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Aqeedah");
  const [level, setLevel] = useState("Beginner");
  const { createCourse } = useCourseMutations();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createCourse.mutate(
      { title, title_ar: titleAr, description, category, level },
      { onSuccess: () => { onOpenChange(false); setTitle(""); setTitleAr(""); setDescription(""); } }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Create New Course</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="font-body">Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Foundations of Aqeedah" required />
          </div>
          <div className="space-y-2">
            <Label className="font-body">Arabic Title</Label>
            <Input value={titleAr} onChange={(e) => setTitleAr(e.target.value)} placeholder="e.g. أصول العقيدة" dir="rtl" />
          </div>
          <div className="space-y-2">
            <Label className="font-body">Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Course description..." rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-body">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Aqeedah", "Fiqh", "Arabic", "Seerah", "Tafsir", "Hadith", "Quran"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-body">Level</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Beginner", "Basic 1", "Basic 2", "Intermediate", "Advanced"].map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" variant="hero" className="w-full" disabled={createCourse.isPending}>
            {createCourse.isPending ? "Creating..." : "Create Course"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCourseDialog;
