import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";

const Courses = () => {
  const { t } = useLanguage();
  const { data: courses, isLoading } = useQuery({
    queryKey: ["published-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">{t("courses.title")}</h1>
          <p className="text-muted-foreground font-body">{t("courses.subtitle")}</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !courses?.length ? (
          <p className="text-center text-muted-foreground py-20 font-body">{t("courses.none")}</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-card rounded-lg overflow-hidden shadow-card hover:shadow-elevated transition-shadow flex flex-col">
                <div className="h-32 gradient-hero flex items-center justify-center">
                  <p className="text-2xl font-heading text-primary-foreground">{course.title_ar || ""}</p>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-sage-light text-sage-dark font-body text-xs">{course.category || "General"}</Badge>
                    <Badge variant="outline" className="text-xs font-body">{course.level || "Beginner"}</Badge>
                  </div>
                  <h3 className="text-lg font-heading font-bold text-foreground mb-1">{course.title}</h3>
                  <p className="text-sm text-muted-foreground font-body mb-4 flex-1 line-clamp-2">{course.description}</p>
                  <Button variant="hero" size="sm" asChild>
                    <Link to={`/course/${course.id}`}>{t("courses.view")}</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Courses;
