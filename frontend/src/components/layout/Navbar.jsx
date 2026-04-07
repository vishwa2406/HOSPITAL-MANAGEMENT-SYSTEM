import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, Heart } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const dashboardPath = role === "admin" ? "/admin" : role === "doctor" ? "/doctor" : "/patient";

  return (
    <nav className="sticky top-0 z-50 transition-all duration-300 bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-sm">
      <div className="container mx-auto px-4 flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-primary p-1.5 rounded-xl group-hover:scale-110 transition-transform">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-blue-600">LIOHNS</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors relative group">
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
          </Link>
          <a href="/#about" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors relative group">
            About
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
          </a>
          <a href="/#services" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors relative group">
            Services
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
          </a>
          <a href="/#doctors" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors relative group">
            Doctors
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
          </a>
          <a href="/#blog" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors relative group">
            Blog
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
          </a>
          <a href="/#contact" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors relative group">
            Contact
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
          </a>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <div className="h-8 w-[1px] bg-slate-200 mx-2" />
          {user ? (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="rounded-full border-primary/20 text-primary hover:bg-primary/5" onClick={() => navigate(dashboardPath)}>
                Dashboard
              </Button>
              <Button size="sm" variant="ghost" className="rounded-full text-slate-600" onClick={signOut}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="rounded-full font-semibold text-slate-600" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button size="sm" className="rounded-full px-6 font-semibold shadow-md shadow-primary/20" onClick={() => navigate("/register")}>
                Get Started
              </Button>
            </div>
          )}
        </div>

        <button className="md:hidden p-2 rounded-lg bg-slate-100" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6 text-slate-600" /> : <Menu className="h-6 w-6 text-slate-600" />}
        </button>
      </div>

      {open && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-b border-slate-100 shadow-xl px-4 py-6 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <Link to="/" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg bg-slate-50 text-sm font-medium text-slate-700 hover:bg-primary/10 transition-colors">Home</Link>
            <a href="/#about" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg bg-slate-50 text-sm font-medium text-slate-700 hover:bg-primary/10 transition-colors">About</a>
            <a href="/#services" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg bg-slate-50 text-sm font-medium text-slate-700 hover:bg-primary/10 transition-colors">Services</a>
            <a href="/#doctors" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg bg-slate-50 text-sm font-medium text-slate-700 hover:bg-primary/10 transition-colors">Doctors</a>
          </div>
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
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
        </motion.div>
      )}
    </nav>
  );
}
