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
      <div className="container py-8 px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-2">{t("courses.title")}</h1>
          <p className="text-muted-foreground font-body text-sm sm:text-base">{t("courses.subtitle")}</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !courses?.length ? (
          <p className="text-center text-muted-foreground py-20 font-body">{t("courses.none")}</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {courses.map((course) => (
              <div key={course.id} className="relative bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 border border-border flex flex-col group">
                {/* Top accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent z-10" />

                {/* Banner */}
                <div className="h-36 sm:h-40 overflow-hidden">
                  {course.image_url ? (
                    <img src={course.image_url} alt={course.title} className="w-full h-full object-cover rounded-none group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full gradient-hero flex items-center justify-center">
                      <p className="text-xl sm:text-2xl font-heading text-primary-foreground/80">{course.title_ar || ""}</p>
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge className="bg-sage-light text-sage-dark font-body text-xs">{course.category || "General"}</Badge>
                    <Badge variant="outline" className="text-xs font-body">{course.level || "Beginner"}</Badge>
                  </div>
                  <h3 className="text-base sm:text-lg font-heading font-bold text-foreground mb-1">{course.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground font-body mb-4 flex-1 line-clamp-2">{course.description}</p>
                  <Button variant="hero" size="sm" className="w-full sm:w-auto" asChild>
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
