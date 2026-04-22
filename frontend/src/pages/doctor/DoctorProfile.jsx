import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Mail, Briefcase, GraduationCap, FileText, 
  Edit3, Save, X, Activity, DollarSign, Calendar, 
  Trash2, Plus, Clock, Camera
} from "lucide-react";

export default function DoctorProfile() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [newUnavail, setNewUnavail] = useState({ date: "", time: "09:00 AM" });

  const { data: doctor, refetch } = useQuery({
    queryKey: ["doctor-me-profile", user?._id],
    queryFn: async () => {
      const response = await api.get("/appointments/doctor/me");
      return response.data;
    },
    enabled: !!user,
  });

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    specialization: "",
    experience: 0,
    bio: "",
    consultationFee: 150,
  });

  const [imageLoading, setImageLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (doctor) {
      setFormData({
        fullName: user?.fullName || "",
        specialization: doctor?.specialization || "",
        experience: doctor?.experience || 0,
        bio: doctor?.bio || "",
        consultationFee: doctor?.consultationFee || 150,
      });
      setImagePreview(doctor.profileImage || user?.avatarUrl || "");
    }
  }, [doctor, user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/appointments/doctors/${doctor._id}`, formData);
      await refetch();
      setIsEditing(false);
      toast({ title: "Profile Updated Successfully!" });
    } catch (err) {
      toast({ title: "Update Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);

    setImageLoading(true);
    try {
      const fd = new FormData();
      fd.append("profileImage", file);
      const res = await api.post("/appointments/doctor/profile-image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImagePreview(res.data.profileImage);
      
      // Update AuthContext to reflect new avatar globally
      setUser(prev => ({ ...prev, avatarUrl: res.data.profileImage }));
      
      toast({ title: "Profile Image Updated!" });
      await refetch();
    } catch (err) {
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
    } finally {
      setImageLoading(false);
    }
  };

  const addUnavailability = async () => {
    if (!newUnavail.date || !newUnavail.time) return;
    try {
      const updatedSlots = [...(doctor.unavailableSlots || []), newUnavail];
      await api.put(`/appointments/doctors/${doctor._id}`, { unavailableSlots: updatedSlots });
      await refetch();
      setNewUnavail({ date: "", time: "09:00 AM" });
      toast({ title: "Slot Marked Unavailable" });
    } catch (err) {
      toast({ title: "Action Failed", variant: "destructive" });
    }
  };

  const removeUnavailability = async (index) => {
    try {
      const updatedSlots = doctor.unavailableSlots.filter((_, i) => i !== index);
      await api.put(`/appointments/doctors/${doctor._id}`, { unavailableSlots: updatedSlots });
      await refetch();
      toast({ title: "Slot Made Available" });
    } catch (err) {
      toast({ title: "Action Failed", variant: "destructive" });
    }
  };

  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", 
    "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM"
  ];

  return (
    <DashboardLayout role="doctor">
      <div className="space-y-10">
        <header>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black text-foreground tracking-tight"
          >
            Physician <span className="text-primary italic">Profile</span>
          </motion.h1>
          <p className="text-muted-foreground font-medium mt-2">Maintain your professional clinical identity and credentials.</p>
        </header>

        <Card className="border-none shadow-sm rounded-[3rem] overflow-hidden bg-card border border-border">
          <CardHeader className="p-12 pb-0">
             <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="relative group">
                  <div className="w-44 h-44 rounded-[3.5rem] bg-muted flex items-center justify-center border-4 border-background shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-20 h-20 text-muted-foreground" />
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-2 right-2 w-12 h-12 bg-primary rounded-2xl flex items-center justify-center cursor-pointer shadow-xl hover:scale-110 transition-transform border-4 border-background">
                      <Camera className="w-5 h-5 text-white" />
                      <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                    </label>
                  )}
                </div>
                
                <div className="text-center md:text-left">
                  <h2 className="text-4xl font-black text-foreground tracking-tight">{user?.fullName}</h2>
                  <p className="text-primary font-bold uppercase tracking-widest text-sm mt-2">{formData.specialization || "Clinical Specialist"}</p>
                </div>
             </div>
          </CardHeader>

          <CardContent className="p-12">
            <form onSubmit={handleUpdate} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Medical Specialization</Label>
                  <Input 
                    disabled={!isEditing} 
                    value={formData.specialization}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    className="h-14 rounded-2xl bg-muted/40 border-border font-bold focus:bg-background transition-all shadow-inner px-6 text-foreground"
                  />
                </div>
                <div className="space-y-4">
                  <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Years of Experience</Label>
                  <Input 
                    disabled={!isEditing} 
                    type="number"
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    className="h-14 rounded-2xl bg-muted/40 border-border font-bold focus:bg-background transition-all shadow-inner px-6 text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Consultation Fee (Rs.)</Label>
                <Input 
                  disabled={!isEditing} 
                  type="number"
                  value={formData.consultationFee}
                  onChange={(e) => setFormData({...formData, consultationFee: e.target.value})}
                  className="h-14 rounded-2xl bg-muted/40 border-border font-bold focus:bg-background transition-all shadow-inner px-6 text-foreground"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Clinical Bio / Philosophy</Label>
                <Textarea 
                  disabled={!isEditing} 
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="rounded-3xl bg-muted/40 border-border font-bold focus:bg-background transition-all shadow-inner p-6 min-h-[120px] text-foreground"
                />
              </div>

              <div className="flex justify-end gap-4 pt-10 border-t border-border">
                {!isEditing ? (
                  <Button 
                    type="button" 
                    onClick={() => setIsEditing(true)}
                    className="rounded-2xl h-14 px-10 bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] tracking-widest shadow-xl flex gap-3"
                  >
                    <Edit3 className="w-5 h-5" /> Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => setIsEditing(false)}
                      className="rounded-2xl h-14 px-8 font-black uppercase text-[10px] tracking-widest border border-border text-muted-foreground hover:bg-muted"
                    >
                      Discard
                    </Button>
                    <Button 
                      type="submit"
                      className="rounded-2xl h-14 px-10 bg-foreground text-background dark:bg-slate-800 dark:text-foreground hover:bg-foreground/90 font-black uppercase text-[10px] tracking-widest shadow-xl gap-3"
                    >
                      <Save className="w-5 h-5" /> Save Changes
                    </Button>
                  </>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
