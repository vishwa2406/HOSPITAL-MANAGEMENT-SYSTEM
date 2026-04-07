import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function AdminAppointments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments } = useQuery({
    queryKey: ["admin-all-appointments"],
    queryFn: async () => {
      const response = await api.get("/appointments/admin/appointments");
      return response.data || [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      await api.put(`/appointments/appointments/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-appointments"] });
      toast({ title: "Appointment updated" });
    },
  });

  return (
    <DashboardLayout role="admin">
      <h1 className="text-2xl font-bold text-foreground mb-6">All Appointments</h1>
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground">Doctor</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Time</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {appointments?.map((a) => (
                <tr key={a._id}>
                  <td className="p-3 font-medium text-foreground">{a.doctorId?.userId?.fullName || "Doctor"}</td>
                  <td className="p-3 text-foreground">{new Date(a.date).toLocaleDateString()}</td>
                  <td className="p-3 text-foreground">{a.time}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      a.status === "approved" ? "bg-success/10 text-success" :
                      a.status === "rejected" ? "bg-destructive/10 text-destructive" :
                      a.status === "completed" ? "bg-primary/10 text-primary" :
                      "bg-warning/10 text-warning"
                    }`}>{a.status}</span>
                  </td>
                  <td className="p-3">
                    <Select value={a.status} onValueChange={(v) => updateStatus.mutate({ id: a._id, status: v })}>
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
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
