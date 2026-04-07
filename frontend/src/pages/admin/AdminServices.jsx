import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function AdminServices() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", icon: "Stethoscope" });

  const { data: services } = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => {
      const response = await api.get("/content/services");
      return response.data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        await api.put(`/content/services/${editing._id}`, form);
      } else {
        await api.post("/content/services", form);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      toast({ title: editing ? "Service updated" : "Service added" });
      setOpen(false);
      setForm({ title: "", description: "", icon: "Stethoscope" });
      setEditing(null);
    },
    onError: (err) => toast({ title: "Error", description: err.message || "An error occurred", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/content/services/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      toast({ title: "Service deleted" });
    },
  });

  return (
    <DashboardLayout role="admin">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Manage Services</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm({ title: "", description: "", icon: "Stethoscope" }); } }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Add Service</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Service" : "Add Service"}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-3">
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></div>
              <div><Label>Icon (Heart, Brain, Bone, Baby, Eye, Stethoscope)</Label><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></div>
              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Saving..." : "Save"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {services?.map((s) => (
          <div key={s._id} className="bg-card p-5 rounded-xl border border-border shadow-card">
            <h3 className="font-semibold text-foreground mb-1">{s.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{s.description}</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => { setEditing(s); setForm({ title: s.title, description: s.description, icon: s.icon || "Stethoscope" }); setOpen(true); }}><Pencil className="h-3 w-3 mr-1" /> Edit</Button>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteMutation.mutate(s._id)}><Trash2 className="h-3 w-3 mr-1" /> Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
