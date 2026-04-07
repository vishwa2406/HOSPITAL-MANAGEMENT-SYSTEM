import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { Users, Stethoscope, Calendar, FileText } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const response = await api.get("/appointments/admin/stats");
      return response.data || { patients: 0, doctors: 0, appointments: 0, blogs: 0 };
    },
  });

  const { data: recentAppointments } = useQuery({
    queryKey: ["admin-recent-appointments"],
    queryFn: async () => {
      const response = await api.get("/appointments/admin/recent-appointments");
      return response.data || [];
    },
  });

  const cards = [
    { label: "Patients", value: stats?.patients || 0, icon: <Users className="h-6 w-6" />, color: "text-primary" },
    { label: "Doctors", value: stats?.doctors || 0, icon: <Stethoscope className="h-6 w-6" />, color: "text-accent" },
    { label: "Appointments", value: stats?.appointments || 0, icon: <Calendar className="h-6 w-6" />, color: "text-warning" },
    { label: "Blog Posts", value: stats?.blogs || 0, icon: <FileText className="h-6 w-6" />, color: "text-success" },
  ];

  return (
    <DashboardLayout role="admin">
      <h1 className="text-2xl font-bold text-foreground mb-6">Admin Dashboard</h1>
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-card p-5 rounded-xl border border-border shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{c.value}</p>
              </div>
              <div className={c.color}>{c.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Recent Appointments</h2>
        </div>
        <div className="divide-y divide-border">
          {recentAppointments?.map((a) => (
            <div key={a._id} className="p-4 flex items-center justify-between text-sm">
              <div>
                <p className="font-medium text-foreground">{a.doctorId?.userId?.fullName || "N/A"}</p>
                <p className="text-xs text-muted-foreground">{new Date(a.date).toLocaleDateString()} at {a.time}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                a.status === "approved" ? "bg-success/10 text-success" :
                a.status === "rejected" ? "bg-destructive/10 text-destructive" :
                "bg-warning/10 text-warning"
              }`}>{a.status}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
