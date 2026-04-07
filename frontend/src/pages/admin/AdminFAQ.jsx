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

export default function AdminFAQ() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ question: "", answer: "", sort_order: "0" });

  const { data: faq } = useQuery({
    queryKey: ["admin-faq"],
    queryFn: async () => {
      const response = await api.get("/content/faqs");
      return response.data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { question: form.question, answer: form.answer, sortOrder: parseInt(form.sort_order) || 0 };
      if (editing) {
        await api.put(`/content/faqs/${editing._id}`, payload);
      } else {
        await api.post("/content/faqs", payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faq"] });
      toast({ title: editing ? "FAQ updated" : "FAQ added" });
      setOpen(false);
      setForm({ question: "", answer: "", sort_order: "0" });
      setEditing(null);
    },
    onError: (err) => toast({ title: "Error", description: err.message || "An error occurred", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/content/faqs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faq"] });
      toast({ title: "FAQ deleted" });
    },
  });

  return (
    <DashboardLayout role="admin">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Manage FAQ</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm({ question: "", answer: "", sort_order: "0" }); } }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Add FAQ</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit FAQ" : "Add FAQ"}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-3">
              <div><Label>Question</Label><Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} required /></div>
              <div><Label>Answer</Label><Textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} required /></div>
              <div><Label>Sort Order</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} /></div>
              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>Save</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-3">
        {faq?.map((f) => (
          <div key={f._id} className="bg-card p-4 rounded-xl border border-border shadow-card flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground text-sm">{f.question}</h3>
              <p className="text-xs text-muted-foreground mt-1">{f.answer}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <Button variant="ghost" size="icon" onClick={() => { setEditing(f); setForm({ question: f.question, answer: f.answer, sort_order: String(f.sortOrder) }); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(f._id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
