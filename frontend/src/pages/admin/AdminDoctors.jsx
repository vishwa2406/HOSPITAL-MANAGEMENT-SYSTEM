import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, User } from "lucide-react";

export default function AdminDoctors() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", specialization: "", experience: "", bio: "", profile_image: "" });

  const { data: doctors, isLoading } = useQuery({
    queryKey: ["admin-doctors"],
    queryFn: async () => {
      const response = await api.get("/appointments/doctors");
      return response.data || [];
    },
  });

  const resetForm = () => {
    setForm({ name: "", email: "", password: "", specialization: "", experience: "", bio: "", profile_image: "" });
    setEditing(null);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        await api.put(`/appointments/doctors/${editing._id}`, {
          fullName: form.name, specialization: form.specialization,
          experience: parseInt(form.experience) || 0, bio: form.bio, profileImage: form.profile_image,
        });
      } else {
        await api.post("/appointments/doctors", {
          fullName: form.name, email: form.email, password: form.password, 
          specialization: form.specialization,
          experience: parseInt(form.experience) || 0, bio: form.bio, profileImage: form.profile_image,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
      toast({ title: editing ? "Doctor updated" : "Doctor added" });
      setOpen(false);
      resetForm();
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message || "An error occurred", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/appointments/doctors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
      toast({ title: "Doctor deleted" });
    },
  });

  const openEdit = (d) => {
    setEditing(d);
    setForm({ name: d.userId?.fullName || "", email: d.userId?.email || "", password: "", specialization: d.specialization, experience: String(d.experience), bio: d.bio || "", profile_image: d.profileImage || "" });
    setOpen(true);
  };

  return (
    <DashboardLayout role="admin">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Manage Doctors</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Doctor</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Doctor" : "Add Doctor"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-3">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              {!editing && (
                <>
                  <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
                  <div><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} /></div>
                </>
              )}
              <div><Label>Specialization</Label><Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} required /></div>
              <div><Label>Experience (years)</Label><Input type="number" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} required /></div>
              <div><Label>Profile Image URL</Label><Input value={form.profile_image} onChange={(e) => setForm({ ...form, profile_image: e.target.value })} /></div>
              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : editing ? "Update" : "Add Doctor"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground">Doctor</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Specialization</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Experience</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Email</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
               {doctors?.map((d) => (
                <tr key={d._id}>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        {d.profileImage ? <img src={d.profileImage} alt="" className="w-8 h-8 rounded-full object-cover" /> : <User className="h-4 w-4 text-muted-foreground" />}
                      </div>
                      <span className="font-medium text-foreground">{d.userId?.fullName || "Doctor"}</span>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{d.specialization}</td>
                  <td className="p-3 text-muted-foreground">{d.experience} years</td>
                  <td className="p-3 text-muted-foreground">{d.userId?.email || "N/A"}</td>
                  <td className="p-3 text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(d)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(d._id)}><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
