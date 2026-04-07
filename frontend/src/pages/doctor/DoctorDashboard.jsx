import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Calendar, CheckCircle, Clock, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function DoctorDashboard() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: doctor } = useQuery({
    queryKey: ["doctor-self", user?._id],
    queryFn: async () => {
      const response = await api.get("/appointments/doctor/me");
      return response.data;
    },
    enabled: !!user,
  });

  const { data: appointments } = useQuery({
    queryKey: ["doctor-appointments", doctor?._id],
    queryFn: async () => {
      const response = await api.get("/appointments/appointments");
      return response.data || [];
    },
    enabled: !!doctor,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      await api.put(`/appointments/appointments/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] });
      toast({ title: "Status updated" });
    },
  });

  const pending = appointments?.filter((a) => a.status === "pending").length || 0;
  const approved = appointments?.filter((a) => a.status === "approved").length || 0;
  const total = appointments?.length || 0;

  return (
    <DashboardLayout role="doctor">
      <h1 className="text-2xl font-bold text-foreground mb-1">Welcome, Dr. {user?.fullName || doctor?.userId?.fullName}</h1>
      <p className="text-muted-foreground mb-6">{doctor?.specialization}</p>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-card p-5 rounded-xl border border-border shadow-card flex items-center justify-between">
          <div><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold text-foreground">{total}</p></div>
          <Calendar className="h-6 w-6 text-primary" />
        </div>
        <div className="bg-card p-5 rounded-xl border border-border shadow-card flex items-center justify-between">
          <div><p className="text-sm text-muted-foreground">Pending</p><p className="text-2xl font-bold text-foreground">{pending}</p></div>
          <Clock className="h-6 w-6 text-warning" />
        </div>
        <div className="bg-card p-5 rounded-xl border border-border shadow-card flex items-center justify-between">
          <div><p className="text-sm text-muted-foreground">Approved</p><p className="text-2xl font-bold text-foreground">{approved}</p></div>
          <CheckCircle className="h-6 w-6 text-success" />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="p-4 border-b border-border"><h2 className="font-semibold text-foreground">Your Appointments</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Time</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Notes</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
               {appointments?.map((a) => (
                <tr key={a._id}>
                  <td className="p-3 text-foreground">{new Date(a.appointmentDate).toLocaleDateString()}</td>
                  <td className="p-3 text-foreground">{a.appointmentTime}</td>
                  <td className="p-3 text-muted-foreground text-xs max-w-[200px] truncate">{a.notes || "—"}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      a.status === "approved" ? "bg-success/10 text-success" :
                      a.status === "rejected" ? "bg-destructive/10 text-destructive" :
                      "bg-warning/10 text-warning"
                    }`}>{a.status}</span>
                  </td>
                  <td className="p-3">
                    <Select value={a.status} onValueChange={(v) => updateStatus.mutate({ id: a._id, status: v })}>
                      <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
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
