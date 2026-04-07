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
import { Plus, Trash2, Star } from "lucide-react";

export default function AdminTestimonials() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", message: "", rating: "5" });

  const { data: testimonials } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: async () => {
      const response = await api.get("/content/testimonials");
      return response.data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      await api.post("/content/testimonials", { name: form.name, message: form.message, rating: parseInt(form.rating) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      toast({ title: "Testimonial added" });
      setOpen(false);
      setForm({ name: "", message: "", rating: "5" });
    },
    onError: (err) => toast({ title: "Error", description: err.message || "An error occurred", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/content/testimonials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      toast({ title: "Testimonial deleted" });
    },
  });

  return (
    <DashboardLayout role="admin">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Manage Testimonials</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Add Testimonial</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Testimonial</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-3">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div><Label>Message</Label><Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required /></div>
              <div><Label>Rating (1-5)</Label><Input type="number" min="1" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} required /></div>
              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>Add</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {testimonials?.map((t) => (
          <div key={t._id} className="bg-card p-5 rounded-xl border border-border shadow-card">
            <div className="flex gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-3 w-3 ${i < t.rating ? "fill-warning text-warning" : "text-muted"}`} />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mb-2 italic">"{t.message}"</p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">{t.name}</p>
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(t._id)}><Trash2 className="h-3 w-3" /></Button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
