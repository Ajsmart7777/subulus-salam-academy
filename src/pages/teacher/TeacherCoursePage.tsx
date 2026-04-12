import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Plus, Trash2, ArrowLeft, BookOpen, FileText, PlayCircle, Headphones,
  ClipboardList, ChevronDown, ChevronRight, Upload, Edit, Loader2, ExternalLink, ImageIcon
} from "lucide-react";
import { useCourseModules, useModuleLessons, useModuleAssignments, useCourseMutations, useTeacherCourses, LessonRow } from "@/hooks/useTeacherCourses";
import { useState, useRef } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const lessonIcons: Record<string, React.ElementType> = {
  video: PlayCircle,
  audio: Headphones,
  text: FileText,
};

const LessonContentDialog = ({
  lesson,
  open,
  onOpenChange,
}: {
  lesson: LessonRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { updateLesson } = useCourseMutations();
  const [contentText, setContentText] = useState(lesson.content_text ?? "");
  const [contentUrl, setContentUrl] = useState(lesson.content_url ?? "");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeTab = lesson.type === "text" ? "text" : "file";

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast({ title: "File too large", description: "Maximum file size is 50MB.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${lesson.module_id}/${lesson.id}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("lesson-content")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("lesson-content")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      setContentUrl(publicUrl);

      updateLesson.mutate(
        { id: lesson.id, moduleId: lesson.module_id, content_url: publicUrl },
        { onSuccess: () => toast({ title: "File uploaded successfully!" }) }
      );
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveText = () => {
    updateLesson.mutate(
      { id: lesson.id, moduleId: lesson.module_id, content_text: contentText },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  const handleSaveUrl = () => {
    updateLesson.mutate(
      { id: lesson.id, moduleId: lesson.module_id, content_url: contentUrl },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">Edit Lesson Content</DialogTitle>
          <p className="text-sm text-muted-foreground font-body">{lesson.title}</p>
        </DialogHeader>

        <Tabs defaultValue={activeTab}>
          <TabsList className="w-full">
            <TabsTrigger value="file" className="flex-1 gap-1">
              <Upload className="h-3 w-3" /> Upload File
            </TabsTrigger>
            <TabsTrigger value="url" className="flex-1 gap-1">
              <ExternalLink className="h-3 w-3" /> Paste URL
            </TabsTrigger>
            <TabsTrigger value="text" className="flex-1 gap-1">
              <FileText className="h-3 w-3" /> Write Text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-4 pt-2">
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="video/*,audio/*,.pdf,.doc,.docx,.pptx,.txt"
                onChange={handleFileUpload}
              />
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground font-body">Uploading...</p>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground font-body mb-3">
                    Upload video, audio, PDF, or document (max 50MB)
                  </p>
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    Choose File
                  </Button>
                </>
              )}
            </div>
            {contentUrl && (
              <div className="bg-muted/30 rounded-md p-3">
                <p className="text-xs text-muted-foreground font-body mb-1">Current file:</p>
                <a href={contentUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline font-body break-all">
                  {contentUrl.split("/").pop()}
                </a>
              </div>
            )}
          </TabsContent>

          <TabsContent value="url" className="space-y-4 pt-2">
            <div>
              <Label className="text-sm font-body">Content URL</Label>
              <p className="text-xs text-muted-foreground font-body mb-2">
                Paste a YouTube, Vimeo, Google Drive, or any external URL
              </p>
              <Input
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
                placeholder="https://www.youtube.com/embed/..."
              />
            </div>
            <Button variant="hero" className="w-full" onClick={handleSaveUrl} disabled={updateLesson.isPending}>
              {updateLesson.isPending ? "Saving..." : "Save URL"}
            </Button>
          </TabsContent>

          <TabsContent value="text" className="space-y-4 pt-2">
            <div>
              <Label className="text-sm font-body">Lesson Text Content</Label>
              <p className="text-xs text-muted-foreground font-body mb-2">
                Write or paste lesson content. Supports basic HTML for formatting.
              </p>
              <Textarea
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                placeholder="Write your lesson content here..."
                rows={10}
                className="font-body"
              />
            </div>
            <Button variant="hero" className="w-full" onClick={handleSaveText} disabled={updateLesson.isPending}>
              {updateLesson.isPending ? "Saving..." : "Save Text"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

const ModuleCard = ({ module, courseId }: { module: any; courseId: string }) => {
  const { data: lessons } = useModuleLessons(module.id);
  const { data: assignments } = useModuleAssignments(module.id);
  const { deleteModule, createLesson, deleteLesson, createAssignment, deleteAssignment } = useCourseMutations();
  const [open, setOpen] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonType, setLessonType] = useState("video");
  const [lessonDuration, setLessonDuration] = useState("");
  const [assignTitle, setAssignTitle] = useState("");
  const [editingLesson, setEditingLesson] = useState<LessonRow | null>(null);

  const handleAddLesson = () => {
    if (!lessonTitle.trim()) return;
    createLesson.mutate(
      { module_id: module.id, title: lessonTitle, type: lessonType, duration: lessonDuration, sort_order: (lessons?.length || 0) },
      { onSuccess: () => { setLessonTitle(""); setLessonDuration(""); setShowAddLesson(false); } }
    );
  };

  const handleAddAssignment = () => {
    if (!assignTitle.trim()) return;
    createAssignment.mutate(
      { module_id: module.id, title: assignTitle },
      { onSuccess: () => { setAssignTitle(""); setShowAddAssignment(false); } }
    );
  };

  return (
    <>
      <Collapsible open={open} onOpenChange={setOpen} className="rounded-lg border border-border bg-card shadow-card">
        <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors rounded-t-lg">
          <div className="flex items-center gap-3">
            {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            <div className="text-left">
              <p className="text-xs text-muted-foreground font-body">Book {module.week}</p>
              <h3 className="font-heading font-bold text-foreground">{module.title}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-body">{lessons?.length || 0} lessons</Badge>
            <Button variant="ghost" size="sm" className="text-destructive h-8 w-8 p-0" onClick={(e) => {
              e.stopPropagation();
              if (confirm("Delete this book?")) deleteModule.mutate({ id: module.id, courseId });
            }}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="border-t border-border">
          <div className="p-4 space-y-3">
            {/* Lessons */}
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-body font-semibold text-foreground">Lessons</h4>
              <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => setShowAddLesson(!showAddLesson)}>
                <Plus className="h-3 w-3" /> Add Lesson
              </Button>
            </div>
            {showAddLesson && (
              <div className="flex gap-2 items-end bg-muted/30 p-3 rounded-md">
                <div className="flex-1">
                  <Input placeholder="Lesson title" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} className="text-sm" />
                </div>
                <Select value={lessonType} onValueChange={setLessonType}>
                  <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Duration" value={lessonDuration} onChange={(e) => setLessonDuration(e.target.value)} className="w-24 text-sm" />
                <Button size="sm" variant="hero" onClick={handleAddLesson} disabled={createLesson.isPending}>Add</Button>
              </div>
            )}
            {lessons?.map((lesson) => {
              const Icon = lessonIcons[lesson.type] || FileText;
              const hasContent = !!(lesson.content_url || lesson.content_text);
              return (
                <div key={lesson.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/30">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 text-sm font-body text-foreground">{lesson.title}</span>
                  <span className="text-xs text-muted-foreground font-body">{lesson.duration}</span>
                  {hasContent ? (
                    <Badge className="bg-primary/10 text-primary text-xs">Content ✓</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-muted-foreground">No content</Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-primary"
                    onClick={() => setEditingLesson(lesson)}
                    title="Edit content"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive h-6 w-6 p-0" onClick={() => deleteLesson.mutate({ id: lesson.id, moduleId: module.id })}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}

            {/* Assignments */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <h4 className="text-sm font-body font-semibold text-foreground flex items-center gap-1">
                <ClipboardList className="h-4 w-4" /> Assignments
              </h4>
              <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => setShowAddAssignment(!showAddAssignment)}>
                <Plus className="h-3 w-3" /> Add Assignment
              </Button>
            </div>
            {showAddAssignment && (
              <div className="flex gap-2 items-end bg-muted/30 p-3 rounded-md">
                <Input placeholder="Assignment title" value={assignTitle} onChange={(e) => setAssignTitle(e.target.value)} className="flex-1 text-sm" />
                <Button size="sm" variant="hero" onClick={handleAddAssignment} disabled={createAssignment.isPending}>Add</Button>
              </div>
            )}
            {assignments?.map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/30">
                <ClipboardList className="h-4 w-4 text-accent" />
                <span className="flex-1 text-sm font-body text-foreground">{a.title}</span>
                <span className="text-xs text-muted-foreground font-body">Max: {a.max_score} pts</span>
                <Button variant="ghost" size="sm" className="text-destructive h-6 w-6 p-0" onClick={() => deleteAssignment.mutate({ id: a.id, moduleId: module.id })}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {editingLesson && (
        <LessonContentDialog
          lesson={editingLesson}
          open={!!editingLesson}
          onOpenChange={(o) => { if (!o) setEditingLesson(null); }}
        />
      )}
    </>
  );
};

const TeacherCoursePage = () => {
  const { courseId } = useParams();
  const { data: courses } = useTeacherCourses();
  const { data: modules, isLoading } = useCourseModules(courseId);
  const { createModule } = useCourseMutations();
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleWeek, setModuleWeek] = useState("");
  const [bannerUploading, setBannerUploading] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const course = courses?.find((c) => c.id === courseId);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !courseId) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB", variant: "destructive" });
      return;
    }
    setBannerUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${courseId}/banner.${ext}`;
      const { error: uploadError } = await supabase.storage.from("course-banners").upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("course-banners").getPublicUrl(filePath);
      const { error: updateError } = await supabase.from("courses").update({ image_url: urlData.publicUrl }).eq("id", courseId);
      if (updateError) throw updateError;
      toast({ title: "Banner updated!" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setBannerUploading(false);
    }
  };

  const handleAddModule = () => {
    if (!moduleTitle.trim() || !courseId) return;
    createModule.mutate(
      { course_id: courseId, title: moduleTitle, week: parseInt(moduleWeek) || (modules?.length || 0) + 1, sort_order: (modules?.length || 0) },
      { onSuccess: () => { setModuleTitle(""); setModuleWeek(""); } }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 max-w-4xl">
        <Link to="/teacher" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary font-body mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Teacher Panel
        </Link>

        {course && (
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-foreground mb-1">{course.title}</h1>
            <p className="text-muted-foreground font-body mb-4">{course.description}</p>
            {/* Banner Management */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="relative h-40 sm:h-52 bg-gradient-to-br from-sage-700 to-sage-900 flex items-center justify-center">
                {course.image_url ? (
                  <img src={course.image_url} alt="Course banner" className="absolute inset-0 w-full h-full object-cover rounded-none" />
                ) : (
                  <p className="text-white/60 font-body text-sm">No banner set</p>
                )}
              </div>
              <div className="p-3 bg-card flex items-center justify-between">
                <p className="text-xs text-muted-foreground font-body">Course Banner · Recommended 1200×400px, max 5MB</p>
                <input ref={bannerInputRef} type="file" className="hidden" accept="image/*" onChange={handleBannerUpload} />
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => bannerInputRef.current?.click()} disabled={bannerUploading}>
                  {bannerUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
                  {bannerUploading ? "Uploading..." : "Upload Banner"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Add Module */}
        <div className="mb-6 flex gap-2 items-end">
          <div className="flex-1">
            <Input placeholder="New module title..." value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} />
          </div>
          <Input placeholder="Week" value={moduleWeek} onChange={(e) => setModuleWeek(e.target.value)} className="w-20" type="number" />
          <Button variant="hero" onClick={handleAddModule} disabled={createModule.isPending} className="gap-1">
            <Plus className="h-4 w-4" /> Add Module
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {modules?.map((mod) => (
              <ModuleCard key={mod.id} module={mod} courseId={courseId!} />
            ))}
            {!modules?.length && (
              <div className="text-center py-12 text-muted-foreground font-body">
                <BookOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                No modules yet. Add your first module above.
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default TeacherCoursePage;
