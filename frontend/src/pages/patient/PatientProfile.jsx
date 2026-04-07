import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function PatientProfile() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await api.put("/auth/profile", { fullName: name, phone });
      toast({ title: "Profile updated!" });
    } catch (err) {
      toast({ title: "Error", description: err.message || "Failed to update profile", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="patient">
      <h1 className="text-2xl font-bold text-foreground mb-6">My Profile</h1>
      <form onSubmit={handleSave} className="max-w-lg bg-card p-6 rounded-xl border border-border shadow-card space-y-4">
        <div>
          <Label>Email</Label>
          <Input value={user?.email || ""} disabled className="bg-muted" />
        </div>
        <div>
          <Label>Full Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label>Phone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 1234567890" />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </DashboardLayout>
  );
}
