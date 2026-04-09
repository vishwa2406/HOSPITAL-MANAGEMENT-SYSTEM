import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, Calendar,
  Edit3, Save, X, Activity, CheckCircle2, Camera, Loader2
} from "lucide-react";
import api from "@/services/api";

export default function PatientProfile() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || "");
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    age: user?.age || "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        age: user.age || "",
      });
      setAvatarPreview(user.avatarUrl || "");
    }
  }, [user]);

  const validate = () => {
    if (formData.fullName.length < 3) {
      toast({ title: "Validation Error", description: "Full name must be at least 3 characters.", variant: "destructive" });
      return false;
    }
    if (formData.phone && !/^\+?[0-9\s-]{7,}$/.test(formData.phone)) {
      toast({ title: "Validation Error", description: "Please enter a valid phone number.", variant: "destructive" });
      return false;
    }
    if (formData.age && (Number(formData.age) < 0 || Number(formData.age) > 120)) {
      toast({ title: "Validation Error", description: "Please enter a valid age (0-120).", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.put("/auth/profile", {
        fullName: formData.fullName,
        phone: formData.phone,
        age: Number(formData.age) || undefined
      });
      setUser({ ...user, ...res.data });
      setIsEditing(false);
      toast({ title: "Profile Updated! ✅", description: "Your details have been saved successfully." });
    } catch (err) {
      toast({ title: "Update Failed", description: err.response?.data?.message || err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file.", variant: "destructive" });
      return;
    }

    // Local preview
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);

    // Upload
    setAvatarLoading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await api.post("/auth/profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser({ ...user, ...res.data });
      setAvatarPreview(res.data.avatarUrl);
      toast({ title: "Photo Updated! 📸", description: "Your profile picture has been updated." });
    } catch (err) {
      toast({ title: "Upload Failed", description: err.response?.data?.message || err.message, variant: "destructive" });
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <DashboardLayout role="patient">
      <div className="max-w-4xl mx-auto py-4 px-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden"
        >
          {/* Cover */}
          <div className="h-40 bg-gradient-to-r from-primary via-primary/80 to-secondary relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.15),transparent)]" />
          </div>

          {/* Avatar & Name */}
          <div className="px-8 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-16 mb-8">
              <div className="relative group w-32 h-32 flex-shrink-0">
                <div className="w-32 h-32 rounded-3xl border-4 border-card shadow-xl overflow-hidden bg-muted">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary text-4xl font-black bg-primary/10">
                      {user?.fullName?.charAt(0)}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarLoading}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {avatarLoading ? (
                    <Loader2 className="w-7 h-7 text-white animate-spin" />
                  ) : (
                    <Camera className="w-7 h-7 text-white" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div className="flex-1 pb-2">
                <h1 className="text-2xl font-black text-foreground">{user?.fullName}</h1>
                <p className="text-muted-foreground text-sm font-medium mt-1 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> Patient Account
                </p>
              </div>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="rounded-2xl px-6 h-10 gap-2 text-sm font-bold border-border hover:bg-muted self-start sm:self-end"
                >
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </Button>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    disabled={!isEditing}
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="h-12 rounded-2xl pl-11 font-bold text-sm"
                    placeholder="Full name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email (Read-only)</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    disabled
                    value={formData.email}
                    className="h-12 rounded-2xl pl-11 font-bold text-sm opacity-60 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    disabled={!isEditing}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-12 rounded-2xl pl-11 font-bold text-sm"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Age</Label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="number"
                    disabled={!isEditing}
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="h-12 rounded-2xl pl-11 font-bold text-sm"
                    placeholder="25"
                    min="0" max="120"
                  />
                </div>
              </div>

              <AnimatePresence>
                {isEditing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="md:col-span-2 flex justify-end gap-3 pt-2"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      disabled={loading}
                      onClick={() => setIsEditing(false)}
                      className="rounded-2xl px-8 h-12 gap-2 font-bold"
                    >
                      <X className="w-4 h-4" /> Discard
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="rounded-2xl px-8 h-12 gap-2 bg-primary text-white font-bold shadow-lg shadow-primary/20"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {!isEditing && (
              <div className="mt-8 p-5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center gap-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                <div>
                  <h4 className="font-black text-emerald-700 dark:text-emerald-400 text-sm">Profile Secure</h4>
                  <p className="text-emerald-600 dark:text-emerald-500 text-xs font-medium">Your information is protected and up-to-date.</p>
                </div>
                <Activity className="w-8 h-8 text-emerald-200 ml-auto hidden md:block" />
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
