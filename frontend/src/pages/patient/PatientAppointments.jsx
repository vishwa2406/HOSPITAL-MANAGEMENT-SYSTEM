import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";

export default function PatientAppointments() {
  const { user } = useAuth();
  const { data: appointments, isLoading } = useQuery({
    queryKey: ["patient-all-appointments", user?._id],
    queryFn: async () => {
      const response = await api.get("/appointments/appointments");
      return response.data || [];
    },
    enabled: !!user,
  });

  const statusColor = (s) => {
    switch (s) {
      case "approved": return "bg-success/10 text-success border-success/20";
      case "rejected": return "bg-destructive/10 text-destructive border-destructive/20";
      case "completed": return "bg-primary/10 text-primary border-primary/20";
      default: return "bg-warning/10 text-warning border-warning/20";
    }
  };

  return (
    <DashboardLayout role="patient">
      <h1 className="text-2xl font-bold text-foreground mb-6">My Appointments</h1>
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground">Doctor</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Specialization</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Time</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : appointments?.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No appointments found</td></tr>
              ) : (
                appointments?.map((a) => (
                  <tr key={a._id}>
                    <td className="p-3 font-medium text-foreground">{a.doctorId?.userId?.fullName || "Doctor"}</td>
                    <td className="p-3 text-muted-foreground">{a.doctorId?.specialization || "General"}</td>
                    <td className="p-3 text-foreground">{new Date(a.appointmentDate).toLocaleDateString()}</td>
                    <td className="p-3 text-foreground">{a.appointmentTime}</td>
                    <td className="p-3">
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${statusColor(a.status)}`}>
                        {a.status}
                      </span>
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
