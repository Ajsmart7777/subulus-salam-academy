import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface CourseRow {
  id: string;
  title: string;
  title_ar: string;
  description: string;
  category: string;
  level: string;
  image_url: string | null;
  teacher_id: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ModuleRow {
  id: string;
  course_id: string;
  title: string;
  week: number;
  sort_order: number;
  has_quiz: boolean;
  has_assignment: boolean;
}

export interface LessonRow {
  id: string;
  module_id: string;
  title: string;
  type: string;
  duration: string;
  content_url: string | null;
  content_text: string | null;
  sort_order: number;
}

export interface AssignmentRow {
  id: string;
  module_id: string;
  title: string;
  description: string;
  due_days: number;
  max_score: number;
}

export function useTeacherCourses() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["teacher-courses", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("teacher_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as CourseRow[];
    },
    enabled: !!user,
  });
}

export function useCourseModules(courseId: string | undefined) {
  return useQuery({
    queryKey: ["course-modules", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .eq("course_id", courseId!)
        .order("sort_order");
      if (error) throw error;
      return data as ModuleRow[];
    },
    enabled: !!courseId,
  });
}

export function useModuleLessons(moduleId: string | undefined) {
  return useQuery({
    queryKey: ["module-lessons", moduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("module_id", moduleId!)
        .order("sort_order");
      if (error) throw error;
      return data as LessonRow[];
    },
    enabled: !!moduleId,
  });
}

export function useModuleAssignments(moduleId: string | undefined) {
  return useQuery({
    queryKey: ["module-assignments", moduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assignments")
        .select("*")
        .eq("module_id", moduleId!);
      if (error) throw error;
      return data as AssignmentRow[];
    },
    enabled: !!moduleId,
  });
}

export function useCourseEnrollments(courseId: string | undefined) {
  return useQuery({
    queryKey: ["course-enrollments", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select("*, profiles:user_id(full_name, avatar_url)")
        .eq("course_id", courseId!);
      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });
}

export function useCourseMutations() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  const createCourse = useMutation({
    mutationFn: async (data: { title: string; title_ar?: string; description?: string; category?: string; level?: string }) => {
      const { error, data: course } = await supabase.from("courses").insert({
        ...data,
        teacher_id: user!.id,
      }).select().single();
      if (error) throw error;
      return course;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-courses"] });
      toast({ title: "Course created successfully" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateCourse = useMutation({
    mutationFn: async ({ id, ...data }: Partial<CourseRow> & { id: string }) => {
      const { error } = await supabase.from("courses").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-courses"] });
      toast({ title: "Course updated" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteCourse = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-courses"] });
      toast({ title: "Course deleted" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const createModule = useMutation({
    mutationFn: async (data: { course_id: string; title: string; week: number; sort_order: number }) => {
      const { error } = await supabase.from("modules").insert(data);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["course-modules", vars.course_id] });
      toast({ title: "Module added" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteModule = useMutation({
    mutationFn: async ({ id, courseId }: { id: string; courseId: string }) => {
      const { error } = await supabase.from("modules").delete().eq("id", id);
      if (error) throw error;
      return courseId;
    },
    onSuccess: (courseId) => {
      queryClient.invalidateQueries({ queryKey: ["course-modules", courseId] });
      toast({ title: "Module deleted" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const createLesson = useMutation({
    mutationFn: async (data: { module_id: string; title: string; type: string; duration: string; sort_order: number; content_url?: string; content_text?: string }) => {
      const { error } = await supabase.from("lessons").insert(data);
      if (error) throw error;
      return data.module_id;
    },
    onSuccess: (moduleId) => {
      queryClient.invalidateQueries({ queryKey: ["module-lessons", moduleId] });
      toast({ title: "Lesson added" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteLesson = useMutation({
    mutationFn: async ({ id, moduleId }: { id: string; moduleId: string }) => {
      const { error } = await supabase.from("lessons").delete().eq("id", id);
      if (error) throw error;
      return moduleId;
    },
    onSuccess: (moduleId) => {
      queryClient.invalidateQueries({ queryKey: ["module-lessons", moduleId] });
      toast({ title: "Lesson deleted" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const createAssignment = useMutation({
    mutationFn: async (data: { module_id: string; title: string; description?: string; due_days?: number; max_score?: number }) => {
      const { error } = await supabase.from("assignments").insert(data);
      if (error) throw error;
      return data.module_id;
    },
    onSuccess: (moduleId) => {
      queryClient.invalidateQueries({ queryKey: ["module-assignments", moduleId] });
      toast({ title: "Assignment added" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteAssignment = useMutation({
    mutationFn: async ({ id, moduleId }: { id: string; moduleId: string }) => {
      const { error } = await supabase.from("assignments").delete().eq("id", id);
      if (error) throw error;
      return moduleId;
    },
    onSuccess: (moduleId) => {
      queryClient.invalidateQueries({ queryKey: ["module-assignments", moduleId] });
      toast({ title: "Assignment deleted" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  return { createCourse, updateCourse, deleteCourse, createModule, deleteModule, createLesson, deleteLesson, createAssignment, deleteAssignment };
}
