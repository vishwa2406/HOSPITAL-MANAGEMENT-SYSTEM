import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, Mail, Phone, Calendar as CalendarIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import InitialsAvatar from "@/components/ui/InitialsAvatar";
import ClearableSearch from "@/components/ui/ClearableSearch";

export default function AdminPatients() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "" });

  const { data: patients, isLoading } = useQuery({
    queryKey: ["admin-patients"],
    queryFn: async () => {
      const response = await api.get("/auth/admin/patients");
      return response.data || [];
    },
  });

  const filteredPatients = patients?.filter(p => 
    p.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        await api.put(`/auth/admin/users/${editing._id}`, form);
      } else {
        await api.post("/auth/register", { ...form, password: "Password123!", role: "patient" });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-patients"] });
      toast({ title: editing ? "Patient updated" : "Patient registered", description: !editing ? "Temporary password set to Password123!" : "" });
      setOpen(false);
      setEditing(null);
      setForm({ fullName: "", email: "", phone: "" });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      if (!window.confirm("Are you sure you want to delete this patient record? This action cannot be undone.")) return;
      await api.delete(`/auth/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-patients"] });
      toast({ title: "Patient record deleted" });
    },
  });

  const openEdit = (p) => {
    setEditing(p);
    setForm({ fullName: p.fullName || "", email: p.email || "", phone: p.phone || "" });
    setOpen(true);
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
             <h1 className="text-3xl font-black text-foreground tracking-tight">Patient <span className="text-primary italic">Directory</span></h1>
             <p className="text-muted-foreground font-medium">Manage hospital patient records and registrations.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <ClearableSearch
              value={search}
              onChange={setSearch}
              placeholder="Search name or ID..."
              leftIcon={Search}
              className="w-full md:w-64"
              inputClassName="h-12 rounded-xl border-border bg-card"
            />

            <Dialog open={open} onOpenChange={(v) => { setOpen(v); if(!v) { setEditing(null); setForm({ fullName: "", email: "", phone: "" }); } }}>
              <DialogTrigger asChild>
                <Button className="rounded-xl h-12 px-6 bg-primary hover:bg-primary/90 text-white font-bold gap-2">
                   <Plus className="w-4 h-4" /> Register New
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[2.5rem] border-none p-10 bg-card text-foreground">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl font-black">{editing ? "Update Dossier" : "New Patient Registration"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-6">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Full Identity</Label>
                      <Input value={form.fullName} onChange={(e) => setForm({...form, fullName: e.target.value})} required className="h-14 rounded-2xl bg-muted border-none font-bold" />
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Communication Email</Label>
                      <Input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required className="h-14 rounded-2xl bg-muted border-none font-bold" />
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Mobile Contact</Label>
                      <Input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="h-14 rounded-2xl bg-muted border-none font-bold" />
                   </div>
                   <Button type="submit" className="w-full h-16 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/20" disabled={saveMutation.isPending}>
                      {saveMutation.isPending ? "Processing..." : editing ? "Authorize Changes" : "Confirm Registration"}
                   </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="bg-card rounded-[2.5rem] border border-border shadow-2xl shadow-primary/5 overflow-hidden">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-muted/50 text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] border-b border-border">
                    <th className="p-8 pl-10">Patient Identity</th>
                    <th className="p-8">Contact & Access</th>
                    <th className="p-8">Registration Date</th>
                    <th className="p-8 pr-10 text-center">Administrative Control</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-border">
                 {isLoading ? (
                   <tr><td colSpan={4} className="p-20 text-center text-muted-foreground uppercase font-black tracking-widest">Compiling Records...</td></tr>
                 ) : filteredPatients?.length === 0 ? (
                   <tr><td colSpan={4} className="p-20 text-center text-muted-foreground font-bold">No matching records indexed.</td></tr>
                 ) : (
                   filteredPatients.map((p) => (
                     <tr key={p._id} className="group hover:bg-muted/30 transition-colors">
                        <td className="p-8 pl-10 text-foreground">
                           <div className="flex items-center gap-5">
                              {p.avatarUrl ? (
                                <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} className="w-12 h-12 rounded-2xl group-hover:scale-110 transition-transform duration-500 overflow-hidden border border-border">
                                  <img src={p.avatarUrl} alt="" className="w-full h-full object-cover" />
                                </motion.div>
                              ) : (
                                <InitialsAvatar name={p.fullName} className="w-12 h-12 rounded-2xl group-hover:scale-110 transition-transform duration-500" />
                              )}
                              <div>
                                 <p className="font-black text-foreground text-lg tracking-tight">{p.fullName}</p>
                                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">PFID: {p._id.slice(-6)}</p>
                              </div>
                           </div>
                        </td>
                        <td className="p-8">
                           <div className="space-y-2">
                              <p className="text-xs font-bold text-muted-foreground flex items-center gap-2 group-hover:text-foreground transition-colors"><Mail className="w-3.5 h-3.5 text-primary/40" /> {p.email?.toLowerCase()}</p>
                              <p className="text-xs font-bold text-muted-foreground flex items-center gap-2 group-hover:text-foreground transition-colors"><Phone className="w-3.5 h-3.5 text-primary/40" /> {p.phone || "No contact"}</p>
                           </div>
                        </td>
                        <td className="p-8">
                           <p className="text-xs font-bold text-muted-foreground flex items-center gap-2 tracking-tight"><CalendarIcon className="w-4 h-4 text-primary/30" /> {new Date(p.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="p-8 pr-10 text-center">
                           <div className="flex items-center justify-center gap-3">
                              <Button variant="ghost" size="icon" onClick={() => openEdit(p)} className="h-11 w-11 rounded-2xl hover:bg-white dark:hover:bg-muted hover:shadow-md text-muted-foreground hover:text-primary transition-all">
                                 <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => { if(window.confirm("Warning: This will permanently purge the patient record. Proceed?")) deleteMutation.mutate(p._id); }} className="h-11 w-11 rounded-2xl hover:bg-destructive/5 text-muted-foreground hover:text-destructive transition-all">
                                 <Trash2 className="h-4 w-4" />
                              </Button>
                           </div>
                        </td>
                     </tr>
                   ))
                 )}
              </tbody>
           </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
