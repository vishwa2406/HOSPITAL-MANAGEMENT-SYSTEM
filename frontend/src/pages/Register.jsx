import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Heart } from "lucide-react";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(email, password, fullName);
      toast({ title: "Registration successful!", description: "Please check your email to verify your account." });
      navigate("/login");
    } catch (err) {
      toast({ title: "Registration failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">LIOHNS</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
          <p className="text-sm text-muted-foreground mt-1">Register as a patient</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-card p-8 rounded-2xl shadow-xl border border-border space-y-6 backdrop-blur-sm bg-card/95">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
              <Input 
                id="name" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                required 
                placeholder="John Doe"
                className="rounded-xl border-border bg-background/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="your@email.com"
                className="rounded-xl border-border bg-background/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" name="password-label" className="text-sm font-medium">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="••••••••" 
                minLength={6}
                className="rounded-xl border-border bg-background/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
          <Button type="submit" className="w-full h-12 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all" disabled={loading}>
            {loading ? "Creating account..." : "Register Now"}
          </Button>
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-semibold hover:underline underline-offset-4">Sign In</Link>
            </p>
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">← Back to Home</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
