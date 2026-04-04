import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Trash2, ArrowLeft, BookOpen, FileText, PlayCircle, Headphones,
  ClipboardList, ChevronDown, ChevronRight
} from "lucide-react";
import { useCourseModules, useModuleLessons, useModuleAssignments, useCourseMutations, useTeacherCourses } from "@/hooks/useTeacherCourses";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const lessonIcons: Record<string, React.ElementType> = {
  video: PlayCircle,
  audio: Headphones,
  text: FileText,
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
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-lg border border-border bg-card shadow-card">
      <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors rounded-t-lg">
        <div className="flex items-center gap-3">
          {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          <div className="text-left">
            <p className="text-xs text-muted-foreground font-body">Week {module.week}</p>
            <h3 className="font-heading font-bold text-foreground">{module.title}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-body">{lessons?.length || 0} lessons</Badge>
          <Button variant="ghost" size="sm" className="text-destructive h-8 w-8 p-0" onClick={(e) => {
            e.stopPropagation();
            if (confirm("Delete this module?")) deleteModule.mutate({ id: module.id, courseId });
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
            return (
              <div key={lesson.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/30">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 text-sm font-body text-foreground">{lesson.title}</span>
                <span className="text-xs text-muted-foreground font-body">{lesson.duration}</span>
                <Badge variant="outline" className="text-xs capitalize">{lesson.type}</Badge>
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
  );
};

const TeacherCoursePage = () => {
  const { courseId } = useParams();
  const { data: courses } = useTeacherCourses();
  const { data: modules, isLoading } = useCourseModules(courseId);
  const { createModule } = useCourseMutations();
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleWeek, setModuleWeek] = useState("");

  const course = courses?.find((c) => c.id === courseId);

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
            <p className="text-muted-foreground font-body">{course.description}</p>
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
