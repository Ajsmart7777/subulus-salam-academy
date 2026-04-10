import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/i18n/LanguageContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import CoursePage from "./pages/CoursePage";
import LessonPage from "./pages/LessonPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherCoursePage from "./pages/teacher/TeacherCoursePage";
import TeacherStudentsPage from "./pages/teacher/TeacherStudentsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminCoursesPage from "./pages/admin/AdminCoursesPage";
import AdminReferralsPage from "./pages/admin/AdminReferralsPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminDonationsPage from "./pages/admin/AdminDonationsPage";
import AdminCampaignsPage from "./pages/admin/AdminCampaignsPage";
import AdminSponsorshipPage from "./pages/admin/AdminSponsorshipPage";
import CertificatePage from "./pages/CertificatePage";
import DonatePage from "./pages/DonatePage";
import SponsorStudentPage from "./pages/SponsorStudentPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/courses" element={<Courses />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/course/:courseId"
              element={
                <ProtectedRoute>
                  <CoursePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/course/:courseId/lesson/:lessonId"
              element={
                <ProtectedRoute>
                  <LessonPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher"
              element={
                <ProtectedRoute requiredRole="teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/course/:courseId"
              element={
                <ProtectedRoute requiredRole="teacher">
                  <TeacherCoursePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/course/:courseId/students"
              element={
                <ProtectedRoute requiredRole="teacher">
                  <TeacherStudentsPage />
                </ProtectedRoute>
              }
            />
            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsersPage /></ProtectedRoute>} />
            <Route path="/admin/courses" element={<ProtectedRoute requiredRole="admin"><AdminCoursesPage /></ProtectedRoute>} />
            <Route path="/admin/referrals" element={<ProtectedRoute requiredRole="admin"><AdminReferralsPage /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute requiredRole="admin"><AdminReportsPage /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminSettingsPage /></ProtectedRoute>} />
            <Route path="/admin/donations" element={<ProtectedRoute requiredRole="admin"><AdminDonationsPage /></ProtectedRoute>} />
            <Route path="/admin/campaigns" element={<ProtectedRoute requiredRole="admin"><AdminCampaignsPage /></ProtectedRoute>} />
            <Route path="/admin/sponsorship" element={<ProtectedRoute requiredRole="admin"><AdminSponsorshipPage /></ProtectedRoute>} />
            <Route path="/certificate/:certificateId" element={<ProtectedRoute><CertificatePage /></ProtectedRoute>} />
            <Route path="/donate" element={<DonatePage />} />
            <Route path="/sponsor-a-student" element={<SponsorStudentPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
