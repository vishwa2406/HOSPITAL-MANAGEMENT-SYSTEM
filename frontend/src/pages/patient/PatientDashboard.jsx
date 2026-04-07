import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react";

export default function PatientDashboard() {
  const { user, profile } = useAuth();

  const { data: appointments } = useQuery({
    queryKey: ["patient-appointments", user?._id],
    queryFn: async () => {
      const response = await api.get("/appointments/appointments");
      return response.data || [];
    },
    enabled: !!user,
  });

  const pending = appointments?.filter((a) => a.status === "pending").length || 0;
  const approved = appointments?.filter((a) => a.status === "approved").length || 0;
  const total = appointments?.length || 0;

  const stats = [
    { label: "Total Appointments", value: total, icon: <Calendar className="h-6 w-6" />, color: "text-primary" },
    { label: "Pending", value: pending, icon: <Clock className="h-6 w-6" />, color: "text-warning" },
    { label: "Approved", value: approved, icon: <CheckCircle className="h-6 w-6" />, color: "text-success" },
  ];

  return (
    <DashboardLayout role="patient">
      <h1 className="text-2xl font-bold text-foreground mb-1">Welcome, {profile?.full_name || "Patient"}</h1>
      <p className="text-muted-foreground mb-6">Here's your health overview</p>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-card p-5 rounded-xl border border-border shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
              </div>
              <div className={s.color}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Recent Appointments</h2>
        </div>
        <div className="divide-y divide-border">
          {appointments?.length > 0 ? (
            appointments.slice(0, 5).map((a) => (
              <div key={a._id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground text-sm">{a.doctorId?.userId?.fullName || "Doctor"}</p>
                  <p className="text-xs text-muted-foreground">{a.doctorId?.specialization || "General"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-foreground">{new Date(a.date).toLocaleDateString()}</p>
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${
                    a.status === "approved" ? "bg-success/10 text-success" :
                    a.status === "rejected" ? "bg-destructive/10 text-destructive" :
                    "bg-warning/10 text-warning"
                  }`}>{a.status}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No appointments yet</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
