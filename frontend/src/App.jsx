import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, 
      gcTime: 10 * 60 * 1000, 
      refetchOnWindowFocus: false, 
      retry: 1, 
    },
  },
});

import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { SocketProvider } from "@/contexts/SocketContext";

const Index = lazy(() => import("./pages/Index"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const VerifyOTP = lazy(() => import("./pages/VerifyOTP"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AllDoctors = lazy(() => import("./pages/AllDoctors"));
const AllBlogs = lazy(() => import("./pages/AllBlogs"));
const PatientDashboard = lazy(() => import("./pages/patient/PatientDashboard"));
const BookAppointment = lazy(() => import("./pages/patient/BookAppointment"));
const PatientAppointments = lazy(() => import("./pages/patient/PatientAppointments"));
const PatientChat = lazy(() => import("./pages/patient/PatientChat"));
const PatientProfile = lazy(() => import("./pages/patient/PatientProfile"));
const PatientPrescriptions = lazy(() => import("./pages/patient/PatientPrescriptions"));
const PatientNotifications = lazy(() => import("./pages/patient/PatientNotifications"));
const PaymentSimulation = lazy(() => import("./pages/patient/PaymentSimulation"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminDoctors = lazy(() => import("./pages/admin/AdminDoctors"));
const AdminAppointments = lazy(() => import("./pages/admin/AdminAppointments"));
const AdminPatients = lazy(() => import("./pages/admin/AdminPatients"));
const AdminServices = lazy(() => import("./pages/admin/AdminServices"));
const AdminBlogs = lazy(() => import("./pages/admin/AdminBlogs"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminFAQ = lazy(() => import("./pages/admin/AdminFAQ"));
const AdminChats = lazy(() => import("./pages/admin/AdminChats"));
const ConsultationChats = lazy(() => import("./pages/ConsultationChats"));
const DoctorDashboard = lazy(() => import("./pages/doctor/DoctorDashboard"));
const DoctorAppointments = lazy(() => import("./pages/doctor/DoctorAppointments"));
const DoctorProfile = lazy(() => import("./pages/doctor/DoctorProfile"));
const DoctorPrescriptions = lazy(() => import("./pages/doctor/DoctorPrescriptions"));
const DoctorUnavailability = lazy(() => import("./pages/doctor/DoctorUnavailability"));
const PatientHistory = lazy(() => import("./pages/doctor/PatientHistory"));
const DoctorNotifications = lazy(() => import("./pages/doctor/DoctorNotifications"));
const PatientBilling = lazy(() => import("./pages/patient/PatientBilling"));
const DoctorBilling = lazy(() => import("./pages/doctor/DoctorBilling"));
const AdminBilling = lazy(() => import("./pages/admin/AdminBilling"));

import HeartbeatLoader from "@/components/ui/HeartbeatLoader";

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <HeartbeatLoader />
    </div>
  );
}

function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && !allowedRoles.includes(role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/services/:id" element={<ServiceDetail />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/doctors" element={<AllDoctors />} />
        <Route path="/blogs" element={<AllBlogs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp/:email" element={<VerifyOTP />} />
        <Route path="/reset-password/:email/:otp" element={<ResetPassword />} />

        <Route path="/patient" element={<ProtectedRoute allowedRoles={["patient"]}><PatientDashboard /></ProtectedRoute>} />
        <Route path="/patient/prescriptions" element={<ProtectedRoute allowedRoles={["patient"]}><PatientPrescriptions /></ProtectedRoute>} />
        <Route path="/patient/book" element={<ProtectedRoute allowedRoles={["patient"]}><BookAppointment /></ProtectedRoute>} />
        <Route path="/patient/appointments" element={<ProtectedRoute allowedRoles={["patient"]}><PatientAppointments /></ProtectedRoute>} />
        <Route path="/patient/chat" element={<ProtectedRoute allowedRoles={["patient"]}><PatientChat /></ProtectedRoute>} />
        <Route path="/patient/profile" element={<ProtectedRoute allowedRoles={["patient"]}><PatientProfile /></ProtectedRoute>} />
        <Route path="/patient/notifications" element={<ProtectedRoute allowedRoles={["patient"]}><PatientNotifications /></ProtectedRoute>} />
        <Route path="/patient/payment/:appointmentId" element={<ProtectedRoute allowedRoles={["patient"]}><PaymentSimulation /></ProtectedRoute>} />
        <Route path="/patient/billing" element={<ProtectedRoute allowedRoles={["patient"]}><PatientBilling /></ProtectedRoute>} />

        <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/doctors" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDoctors /></ProtectedRoute>} />
        <Route path="/admin/appointments" element={<ProtectedRoute allowedRoles={["admin"]}><AdminAppointments /></ProtectedRoute>} />
        <Route path="/admin/patients" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPatients /></ProtectedRoute>} />
        <Route path="/admin/services" element={<ProtectedRoute allowedRoles={["admin"]}><AdminServices /></ProtectedRoute>} />
        <Route path="/admin/blogs" element={<ProtectedRoute allowedRoles={["admin"]}><AdminBlogs /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={["admin"]}><AdminAnalytics /></ProtectedRoute>} />
        <Route path="/admin/faq" element={<ProtectedRoute allowedRoles={["admin"]}><AdminFAQ /></ProtectedRoute>} />
        <Route path="/admin/chats" element={<ProtectedRoute allowedRoles={["admin"]}><AdminChats /></ProtectedRoute>} />
        <Route path="/admin/billing" element={<ProtectedRoute allowedRoles={["admin"]}><AdminBilling /></ProtectedRoute>} />
        <Route path="/chats" element={<ProtectedRoute allowedRoles={["patient", "doctor", "admin"]}><ConsultationChats /></ProtectedRoute>} />
        <Route path="/chats/:appointmentId" element={<ProtectedRoute allowedRoles={["patient", "doctor", "admin"]}><ConsultationChats /></ProtectedRoute>} />

        <Route path="/doctor" element={<ProtectedRoute allowedRoles={["doctor"]}><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/appointments" element={<ProtectedRoute allowedRoles={["doctor"]}><DoctorAppointments /></ProtectedRoute>} />
        <Route path="/doctor/profile" element={<ProtectedRoute allowedRoles={["doctor"]}><DoctorProfile /></ProtectedRoute>} />
        <Route path="/doctor/prescriptions" element={<ProtectedRoute allowedRoles={["doctor"]}><DoctorPrescriptions /></ProtectedRoute>} />
        <Route path="/doctor/unavailability" element={<ProtectedRoute allowedRoles={["doctor"]}><DoctorUnavailability /></ProtectedRoute>} />
        <Route path="/doctor/history" element={<ProtectedRoute allowedRoles={["doctor"]}><PatientHistory /></ProtectedRoute>} />
        <Route path="/doctor/notifications" element={<ProtectedRoute allowedRoles={["doctor"]}><DoctorNotifications /></ProtectedRoute>} />
        <Route path="/doctor/billing" element={<ProtectedRoute allowedRoles={["doctor"]}><DoctorBilling /></ProtectedRoute>} />

        {/* Old ChatPage route redirected to unified chats */}
        <Route path="/chat/:appointmentId" element={<Navigate to="/chats" replace />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

function AuthWrappedApp() {
  const { user } = useAuth();
  return user ? (
    <NotificationProvider>
      <AppRoutes />
    </NotificationProvider>
  ) : (
    <AppRoutes />
  );
}

import ScrollToTop from "./components/layout/ScrollToTop";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <ThemeProvider>
          <AuthProvider>
            <SocketProvider>
              <AuthWrappedApp />
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
