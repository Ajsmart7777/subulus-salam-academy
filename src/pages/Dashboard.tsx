import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flame, BookOpen, Trophy, Target, Clock, Star } from "lucide-react";
import { courses, studentStats } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";

const StatCard = ({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string | number; sub?: string }) => (
  <div className="bg-card rounded-lg p-5 shadow-card">
    <div className="flex items-center gap-3 mb-2">
      <div className="h-10 w-10 rounded-lg gradient-hero flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-body">{label}</p>
        <p className="text-xl font-heading font-bold text-foreground">{value}</p>
      </div>
    </div>
    {sub && <p className="text-xs text-muted-foreground font-body">{sub}</p>}
  </div>
);

const Dashboard = () => {
  const enrolled = courses.filter((c) => c.enrolled);
  const { profile } = useAuth();
  const displayName = profile?.full_name || "Student";
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-1">Assalamu Alaikum, {displayName}</h1>
          <p className="text-muted-foreground font-body">Continue your journey of knowledge.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard icon={Flame} label="Current Streak" value={`${studentStats.currentStreak} days`} sub={`Best: ${studentStats.longestStreak} days`} />
          <StatCard icon={BookOpen} label="Lessons Done" value={`${studentStats.completedLessons}/${studentStats.totalLessons}`} />
          <StatCard icon={Star} label="Points" value={studentStats.points} sub={studentStats.title} />
          <StatCard icon={Target} label="Quiz Average" value={`${studentStats.quizAverage}%`} />
        </div>

        {/* Enrolled Courses */}
        <div className="mb-6">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-4">Your Courses</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {enrolled.map((course) => {
              const progress = Math.round((course.completedModules / course.totalModules) * 100);
              return (
                <Link
                  to={`/course/${course.id}`}
                  key={course.id}
                  className="bg-card rounded-lg p-6 shadow-card hover:shadow-elevated transition-shadow group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Badge className="mb-2 bg-sage-light text-sage-dark font-body text-xs">{course.category}</Badge>
                      <h3 className="text-lg font-heading font-bold text-foreground group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-xs text-muted-foreground font-body mt-1">{course.titleAr}</p>
                    </div>
                    <Badge variant="outline" className="text-xs font-body">{course.level}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground font-body mb-4">{course.teacher}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-body text-muted-foreground">
                      <span>Module {course.completedModules} of {course.totalModules}</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Upcoming deadlines placeholder */}
        <div className="bg-card rounded-lg p-6 shadow-card">
          <h3 className="text-lg font-heading font-bold text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Upcoming Deadlines
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div>
                <p className="text-sm font-body font-medium text-foreground">Week 4 Quiz — Aqeedah</p>
                <p className="text-xs text-muted-foreground font-body">Tawheed Al-Asma wa As-Sifaat</p>
              </div>
              <Badge className="bg-accent text-accent-foreground font-body text-xs">Due in 2 days</Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-body font-medium text-foreground">Week 4 Assignment — Aqeedah</p>
                <p className="text-xs text-muted-foreground font-body">Written reflection on Names & Attributes</p>
              </div>
              <Badge className="bg-accent text-accent-foreground font-body text-xs">Due in 4 days</Badge>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
