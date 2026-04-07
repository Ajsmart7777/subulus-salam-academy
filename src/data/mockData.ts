export interface Course {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  teacher: string;
  totalModules: number;
  completedModules: number;
  enrolled: boolean;
  category: string;
  level: "Beginner" | "Basic 1" | "Basic 2" | "Intermediate" | "Advanced";
  image?: string;
}

export interface Module {
  id: string;
  courseId: string;
  week: number;
  title: string;
  locked: boolean;
  completed: boolean;
  lessons: Lesson[];
  hasQuiz: boolean;
  hasAssignment: boolean;
  quizCompleted: boolean;
  assignmentCompleted: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  type: "video" | "audio" | "text";
  duration: string;
  completed: boolean;
}

export const courses: Course[] = [
  {
    id: "aqeedah-101",
    title: "Foundations of Aqeedah",
    titleAr: "أصول العقيدة",
    description: "Learn the fundamentals of Islamic creed from authentic sources, covering Tawheed, the pillars of Iman, and core beliefs.",
    teacher: "Sheikh Ahmad Al-Farsi",
    totalModules: 12,
    completedModules: 3,
    enrolled: true,
    category: "Aqeedah",
    level: "Beginner",
  },
  {
    id: "fiqh-salah",
    title: "Fiqh of Salah",
    titleAr: "فقه الصلاة",
    description: "A comprehensive study of prayer jurisprudence covering conditions, pillars, obligations, and common mistakes.",
    teacher: "Ustadha Maryam Hassan",
    totalModules: 8,
    completedModules: 1,
    enrolled: true,
    category: "Fiqh",
    level: "Beginner",
  },
  {
    id: "arabic-101",
    title: "Arabic for Quran",
    titleAr: "العربية للقرآن",
    description: "Master the Arabic grammar and vocabulary needed to understand the Quran directly.",
    teacher: "Dr. Yusuf Ibrahim",
    totalModules: 16,
    completedModules: 0,
    enrolled: false,
    category: "Arabic",
    level: "Beginner",
  },
  {
    id: "seerah-101",
    title: "Life of the Prophet ﷺ",
    titleAr: "السيرة النبوية",
    description: "Study the blessed biography of Prophet Muhammad ﷺ from birth to his passing.",
    teacher: "Sheikh Omar Abdallah",
    totalModules: 20,
    completedModules: 0,
    enrolled: false,
    category: "Seerah",
    level: "Intermediate",
  },
];

export const modules: Module[] = [
  {
    id: "m1",
    courseId: "aqeedah-101",
    week: 1,
    title: "Introduction to Tawheed",
    locked: false,
    completed: true,
    hasQuiz: true,
    hasAssignment: true,
    quizCompleted: true,
    assignmentCompleted: true,
    lessons: [
      { id: "l1", title: "What is Tawheed?", type: "video", duration: "18 min", completed: true },
      { id: "l2", title: "Categories of Tawheed", type: "video", duration: "22 min", completed: true },
      { id: "l3", title: "Reading: Ibn Taymiyyah on Tawheed", type: "text", duration: "10 min", completed: true },
    ],
  },
  {
    id: "m2",
    courseId: "aqeedah-101",
    week: 2,
    title: "Tawheed Ar-Ruboobiyyah",
    locked: false,
    completed: true,
    hasQuiz: true,
    hasAssignment: true,
    quizCompleted: true,
    assignmentCompleted: true,
    lessons: [
      { id: "l4", title: "Lordship of Allah", type: "video", duration: "20 min", completed: true },
      { id: "l5", title: "Evidence from Quran & Sunnah", type: "audio", duration: "15 min", completed: true },
    ],
  },
  {
    id: "m3",
    courseId: "aqeedah-101",
    week: 3,
    title: "Tawheed Al-Uloohiyyah",
    locked: false,
    completed: true,
    hasQuiz: true,
    hasAssignment: false,
    quizCompleted: true,
    assignmentCompleted: true,
    lessons: [
      { id: "l6", title: "Worship belongs to Allah alone", type: "video", duration: "25 min", completed: true },
      { id: "l7", title: "Forms of Shirk", type: "video", duration: "18 min", completed: true },
    ],
  },
  {
    id: "m4",
    courseId: "aqeedah-101",
    week: 4,
    title: "Tawheed Al-Asma wa As-Sifaat",
    locked: false,
    completed: false,
    hasQuiz: true,
    hasAssignment: true,
    quizCompleted: false,
    assignmentCompleted: false,
    lessons: [
      { id: "l8", title: "Names and Attributes of Allah", type: "video", duration: "30 min", completed: true },
      { id: "l9", title: "Methodology of Ahl as-Sunnah", type: "text", duration: "12 min", completed: false },
    ],
  },
  {
    id: "m5",
    courseId: "aqeedah-101",
    week: 5,
    title: "Pillars of Iman",
    locked: true,
    completed: false,
    hasQuiz: true,
    hasAssignment: true,
    quizCompleted: false,
    assignmentCompleted: false,
    lessons: [
      { id: "l10", title: "Belief in Allah", type: "video", duration: "20 min", completed: false },
      { id: "l11", title: "Belief in Angels", type: "video", duration: "18 min", completed: false },
    ],
  },
];

export const studentStats = {
  enrolledCourses: 2,
  completedLessons: 9,
  totalLessons: 15,
  currentStreak: 7,
  longestStreak: 14,
  points: 450,
  title: "Talibul Ilm",
  quizAverage: 85,
};
