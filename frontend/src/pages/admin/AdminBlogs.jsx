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

export default function AdminBlogs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", content: "", image: "" });

  const { data: blogs } = useQuery({
    queryKey: ["admin-blogs"],
    queryFn: async () => {
      const response = await api.get("/content/blogs");
      return response.data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        await api.put(`/content/blogs/${editing._id}`, form);
      } else {
        await api.post("/content/blogs", form);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
      toast({ title: editing ? "Blog updated" : "Blog created" });
      setOpen(false);
      setForm({ title: "", content: "", image: "" });
      setEditing(null);
    },
    onError: (err) => toast({ title: "Error", description: err.message || "An error occurred", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/content/blogs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
      toast({ title: "Blog deleted" });
    },
  });

  return (
    <DashboardLayout role="admin">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Manage Blogs</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm({ title: "", content: "", image: "" }); } }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> New Blog</Button></DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{editing ? "Edit Blog" : "New Blog Post"}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-3">
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div><Label>Content</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required rows={8} /></div>
              <div><Label>Image URL</Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Saving..." : "Save"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-3">
        {blogs?.map((b) => (
          <div key={b._id} className="bg-card p-4 rounded-xl border border-border shadow-card flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">{b.title}</h3>
              <p className="text-xs text-muted-foreground">{new Date(b.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => { setEditing(b); setForm({ title: b.title, content: b.content, image: b.image || "" }); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(b._id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
