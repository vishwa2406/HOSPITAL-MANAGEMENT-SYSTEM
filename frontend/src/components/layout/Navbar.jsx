import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, Heart } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const dashboardPath = role === "admin" ? "/admin" : role === "doctor" ? "/doctor" : "/patient";
  const { pathname } = useLocation();

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    setOpen(false);

    const scrollToSection = () => {
      if (targetId === "hero") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const element = document.getElementById(targetId);
        if (element) {
          const yOffset = -80; // Compensating for navbar height
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }
    };

    if (pathname !== "/") {
      navigate("/");
      setTimeout(scrollToSection, 100);
    } else {
      scrollToSection();
    }
  };

  return (
    <nav className="sticky top-0 z-50 transition-all duration-300 bg-background/80 backdrop-blur-lg border-b border-border shadow-sm">
      <div className="container mx-auto px-4 flex items-center justify-between h-20">
        <a href="/" onClick={(e) => handleNavClick(e, "hero")} title="Home" className="flex items-center gap-2 group cursor-pointer">
          <div className="bg-primary p-1.5 rounded-xl group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-foreground">
            LIO<span className="text-primary">HNS</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a href="/" onClick={(e) => handleNavClick(e, "hero")} className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors relative group cursor-pointer">
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
          </a>
          <a href="/#about" onClick={(e) => handleNavClick(e, "about")} className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors relative group cursor-pointer">
            About
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
          </a>
          <a href="/#services" onClick={(e) => handleNavClick(e, "services")} className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors relative group cursor-pointer">
            Services
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
          </a>
          <a href="/#doctors" onClick={(e) => handleNavClick(e, "doctors")} className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors relative group cursor-pointer">
            Doctors
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
          </a>
          <a href="/#blog" onClick={(e) => handleNavClick(e, "blog")} className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors relative group cursor-pointer">
            Blog
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
          </a>
          <a href="/#contact" onClick={(e) => handleNavClick(e, "contact")} className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors relative group cursor-pointer">
            Contact
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
          </a>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          <div className="h-8 w-[1px] bg-border mx-2" />
          {user ? (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="rounded-full border-primary/20 text-primary hover:bg-primary/5" onClick={() => navigate(dashboardPath)}>
                Dashboard
              </Button>
              <Button size="sm" variant="ghost" className="rounded-full text-muted-foreground hover:text-foreground" onClick={signOut}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="rounded-full font-semibold text-muted-foreground hover:text-foreground" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button size="sm" className="rounded-full px-6 font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all" onClick={() => navigate("/register")}>
                Get Started
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button className="p-2 rounded-lg bg-secondary text-foreground" onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-background border-b border-border shadow-xl px-4 py-6 space-y-4 animate-in fade-in slide-in-from-top-4">
          <div className="grid grid-cols-2 gap-4">
            <a href="/" onClick={(e) => handleNavClick(e, "hero")} className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium text-foreground hover:bg-primary/10 transition-colors">Home</a>
            <a href="/#about" onClick={(e) => handleNavClick(e, "about")} className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium text-foreground hover:bg-primary/10 transition-colors">About</a>
            <a href="/#services" onClick={(e) => handleNavClick(e, "services")} className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium text-foreground hover:bg-primary/10 transition-colors">Services</a>
            <a href="/#doctors" onClick={(e) => handleNavClick(e, "doctors")} className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium text-foreground hover:bg-primary/10 transition-colors">Doctors</a>
          </div>
          <div className="pt-4 border-t border-border flex flex-col gap-3">
            {user ? (
              <>
                <Button className="w-full rounded-xl" onClick={() => { navigate(dashboardPath); setOpen(false); }}>Dashboard</Button>
                <Button variant="outline" className="w-full rounded-xl" onClick={signOut}>Logout</Button>
              </>
            ) : (
              <>
                <Button className="w-full rounded-xl" onClick={() => { navigate("/register"); setOpen(false); }}>Register</Button>
                <Button variant="outline" className="w-full rounded-xl" onClick={() => { navigate("/login"); setOpen(false); }}>Login</Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
