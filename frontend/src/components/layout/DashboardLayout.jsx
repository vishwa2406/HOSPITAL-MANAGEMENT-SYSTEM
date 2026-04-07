
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Calendar, Users, Stethoscope, FileText,
  MessageSquare, Star, HelpCircle, User, LogOut, Heart, Bot, Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const patientNav = [
  { label: "Dashboard", path: "/patient", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Book Appointment", path: "/patient/book", icon: <Calendar className="h-4 w-4" /> },
  { label: "My Appointments", path: "/patient/appointments", icon: <FileText className="h-4 w-4" /> },
  { label: "AI Assistant", path: "/patient/chat", icon: <Bot className="h-4 w-4" /> },
  { label: "Profile", path: "/patient/profile", icon: <User className="h-4 w-4" /> },
];

const doctorNav = [
  { label: "Dashboard", path: "/doctor", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Appointments", path: "/doctor/appointments", icon: <Calendar className="h-4 w-4" /> },
  { label: "Profile", path: "/doctor/profile", icon: <User className="h-4 w-4" /> },
];

const adminNav = [
  { label: "Dashboard", path: "/admin", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Doctors", path: "/admin/doctors", icon: <Stethoscope className="h-4 w-4" /> },
  { label: "Appointments", path: "/admin/appointments", icon: <Calendar className="h-4 w-4" /> },
  { label: "Patients", path: "/admin/patients", icon: <Users className="h-4 w-4" /> },
  { label: "Services", path: "/admin/services", icon: <Settings className="h-4 w-4" /> },
  { label: "Blogs", path: "/admin/blogs", icon: <FileText className="h-4 w-4" /> },
  { label: "Testimonials", path: "/admin/testimonials", icon: <Star className="h-4 w-4" /> },
  { label: "FAQ", path: "/admin/faq", icon: <HelpCircle className="h-4 w-4" /> },
];

export default function DashboardLayout({ children, role }) {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = role === "admin" ? adminNav : role === "doctor" ? doctorNav : patientNav;

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <span className="font-bold text-foreground">LIOHNS</span>
          </Link>
          <p className="text-xs text-muted-foreground mt-1 capitalize">{role} Panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-border space-y-2">
          <div className="px-3 py-2 text-sm text-foreground truncate">
            {user?.fullName || "User"}
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={() => { signOut(); navigate("/"); }}>
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}
