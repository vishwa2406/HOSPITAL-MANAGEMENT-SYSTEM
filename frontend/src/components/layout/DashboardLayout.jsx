import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Calendar, Users, Stethoscope, FileText,
  MessageSquare, Heart, Bot, Settings,
  BarChart3, Pill, LogOut, User, HelpCircle, Clock,
  Bell, Menu, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const patientNav = [
  { label: "Dashboard", path: "/patient", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Book Appointment", path: "/patient/book", icon: <Calendar className="h-4 w-4" /> },
  { label: "My Appointments", path: "/patient/appointments", icon: <Calendar className="h-4 w-4" /> },
  { label: "Prescriptions", path: "/patient/prescriptions", icon: <Pill className="h-4 w-4" /> },
  { label: "Messages", path: "/chats", icon: <MessageSquare className="h-4 w-4" /> },
  { label: "Notifications", path: "/patient/notifications", icon: <Bell className="h-4 w-4" />, notify: true },
  { label: "AI Assistant", path: "/patient/chat", icon: <Bot className="h-4 w-4" /> },
  { label: "Profile", path: "/patient/profile", icon: <User className="h-4 w-4" /> },
];

const doctorNav = [
  { label: "Dashboard", path: "/doctor", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Appointments", path: "/doctor/appointments", icon: <Calendar className="h-4 w-4" /> },
  { label: "Prescriptions", path: "/doctor/prescriptions", icon: <Pill className="h-4 w-4" /> },
  { label: "Schedule", path: "/doctor/unavailability", icon: <Clock className="h-4 w-4" /> },
  { label: "Messages", path: "/chats", icon: <MessageSquare className="h-4 w-4" /> },
  { label: "Notifications", path: "/doctor/notifications", icon: <Bell className="h-4 w-4" />, notify: true },
  { label: "Patient History", path: "/doctor/history", icon: <FileText className="h-4 w-4" /> },
  { label: "Profile", path: "/doctor/profile", icon: <User className="h-4 w-4" /> },
];

const adminNav = [
  { label: "Dashboard", path: "/admin", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Analytics", path: "/admin/analytics", icon: <BarChart3 className="h-4 w-4" /> },
  { label: "Doctors", path: "/admin/doctors", icon: <Stethoscope className="h-4 w-4" /> },
  { label: "Appointments", path: "/admin/appointments", icon: <Calendar className="h-4 w-4" /> },
  { label: "Patients", path: "/admin/patients", icon: <Users className="h-4 w-4" /> },
  { label: "Services", path: "/admin/services", icon: <Settings className="h-4 w-4" /> },
  { label: "Chats", path: "/admin/chats", icon: <MessageSquare className="h-4 w-4" /> },
  { label: "Blogs", path: "/admin/blogs", icon: <FileText className="h-4 w-4" /> },
  { label: "FAQ", path: "/admin/faq", icon: <HelpCircle className="h-4 w-4" /> },
];

function SidebarContent({ navItems, user, role, unreadCount, onClose }) {
  const location = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-border flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group" onClick={onClose}>
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tighter text-foreground">LIONHS</span>
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest capitalize">{role} Portal</p>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 rounded-lg text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300",
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20 translate-x-1"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className={cn("p-2 rounded-lg transition-colors", isActive ? "bg-white/20" : "bg-transparent")}>
                {item.icon}
              </div>
              <span className="flex-1">{item.label}</span>
              {item.notify && unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border mt-auto space-y-3">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/50 border border-muted/20">
          <div className="flex items-center gap-3 min-w-0">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                {user?.fullName?.charAt(0)}
              </div>
            )}
            <span className="text-xs font-bold text-foreground truncate max-w-[100px]">
              {user?.fullName}
            </span>
          </div>
          <ThemeToggle />
        </div>

        <Button
          variant="ghost"
          className="w-full justify-start gap-4 px-4 h-12 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all font-bold"
          onClick={() => { signOut(); navigate("/"); }}
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children, role }) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Try to use notifications context safely
  let unreadCount = 0;
  try {
    const notifCtx = useNotifications();
    unreadCount = notifCtx.unreadCount;
  } catch (e) {
    // Not wrapped in NotificationProvider (admin role), ignore
  }

  const navItems = role === "admin" ? adminNav : role === "doctor" ? doctorNav : patientNav;

  return (
    <div className="flex h-screen bg-background text-foreground transition-colors duration-300 overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — desktop always visible, mobile overlay */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 shadow-xl lg:shadow-none",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <SidebarContent
          navItems={navItems}
          user={user}
          role={role}
          unreadCount={unreadCount}
          onClose={() => setSidebarOpen(false)}
        />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Top Bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-card border-b border-border flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl bg-muted text-foreground hover:bg-primary hover:text-white transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="h-4 w-4 text-white" />
            </div>
            <span className="font-extrabold text-lg text-foreground">LIONHS</span>
          </div>
          <ThemeToggle />
        </div>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 space-y-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
